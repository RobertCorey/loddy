import { test, expect, Page } from "@playwright/test";

/**
 * Regression test for the 2026 refresh fixes: player identity is persisted in
 * sessionStorage per game, and a refreshed host restarts the state-machine
 * runner. Before the fix, a host refresh stalled the game forever and any
 * refreshed player became a spectator the game waited on indefinitely.
 */

async function join(page: Page, name: string) {
  await page.locator("app-join-game-form input").fill(name);
  await page.getByRole("button", { name: "Join" }).click();
  await expect(page.getByText(name)).toBeVisible();
}

async function tryAnswer(page: Page, value: string): Promise<boolean> {
  const input = page.locator("input.answer-input");
  try {
    if (!(await input.isVisible())) return false;
    await input.fill(value);
    await page.getByRole("button", { name: "Answer" }).click();
    return true;
  } catch {
    return false;
  }
}

test("the game survives a host refresh and a player refresh", async ({
  browser,
}) => {
  const contexts = await Promise.all(
    Array.from({ length: 3 }, () => browser.newContext()),
  );
  const [host, alice, bob] = await Promise.all(
    contexts.map((c) => c.newPage()),
  );

  await host.goto("/start");
  await host.getByRole("button", { name: "Create New Game" }).click();
  await host.waitForURL(/\/game\/\w+/);
  const gameUrl = host.url();
  await join(host, "Hosty");
  // the join form's name pattern is letters and spaces only
  const names = ["Reloader", "Steady"];
  for (const [i, page] of [alice, bob].entries()) {
    await page.goto(gameUrl);
    await join(page, names[i]);
  }

  await host.getByRole("button", { name: "Start Game" }).click();
  await expect(host.getByText("Brain Question Round!")).toBeVisible();

  // Host refresh during the rules screen: identity and the game runner
  // must come back, or no status ever advances again.
  await host.reload();

  const answers = new Map<Page, number>();
  let aliceReloaded = false;
  const deadline = Date.now() + 4 * 60_000;
  while (Date.now() < deadline) {
    if (await host.getByText("Game Over!").isVisible().catch(() => false)) {
      break;
    }
    for (const page of [host, alice, bob]) {
      if (await tryAnswer(page, String(1 + Math.floor(Math.random() * 99)))) {
        answers.set(page, (answers.get(page) ?? 0) + 1);
      }
    }
    // Once Alice is past her brain questions and into the guessing loop,
    // refresh her too: she must stay a player, not become a spectator.
    if (!aliceReloaded && (answers.get(alice) ?? 0) >= 3) {
      await alice.reload();
      aliceReloaded = true;
    }
    await host.waitForTimeout(500);
  }

  expect(aliceReloaded).toBe(true);
  for (const page of [host, alice, bob]) {
    await expect(page.getByText("Game Over!")).toBeVisible();
  }

  await Promise.all(contexts.map((c) => c.close()));
});
