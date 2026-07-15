import { test, expect, Page } from "@playwright/test";
import { gameIdFromUrl, getGameDoc, patchGameNumbers } from "./firestore-rest";

/**
 * Runner migration: the host's tab drives the state machine, but its
 * heartbeat is on the game doc. When the host closes their tab for good,
 * a surviving player's watchdog claims the runner role (~25s stale window)
 * and the game keeps advancing — the host just times out of each round.
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

test("the game survives the host closing their tab mid-game", async ({
  browser,
}) => {
  test.setTimeout(7 * 60_000);
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
  const gameId = gameIdFromUrl(gameUrl);
  await patchGameNumbers(gameId, { answerSeconds: 5, brainSeconds: 60 });

  await join(host, "Hosty");
  for (const [i, page] of [alice, bob].entries()) {
    await page.goto(gameUrl);
    await join(page, ["Alice", "Bob"][i]);
  }
  await host.getByRole("button", { name: "Start Game" }).click();
  await expect(host.getByText("Brain Question Round!")).toBeVisible();

  // Everyone (host included) answers their brain questions, so the guess
  // rounds are what the host abandons.
  const answered = new Map<Page, number>();
  const brainDeadline = Date.now() + 60_000;
  while (Date.now() < brainDeadline) {
    for (const page of [host, alice, bob]) {
      if (await tryAnswer(page, String(1 + Math.floor(Math.random() * 99)))) {
        answered.set(page, (answered.get(page) ?? 0) + 1);
      }
    }
    if (
      (answered.get(host) ?? 0) >= 2 &&
      (answered.get(alice) ?? 0) >= 2 &&
      (answered.get(bob) ?? 0) >= 2
    ) {
      break;
    }
    await host.waitForTimeout(300);
  }
  expect(answered.get(host)).toBeGreaterThanOrEqual(2);

  // Host bails: their tab was the only thing driving the game.
  const hostPlayerId = await host.evaluate((id) => {
    const raw = sessionStorage.getItem(`loddy-player-${id}`);
    return raw ? JSON.parse(raw).id : null;
  }, gameId);
  expect(hostPlayerId).toBeTruthy();
  await contexts[0].close();

  const gameOver = (page: Page) => page.getByText("Game Over!");
  const deadline = Date.now() + 5 * 60_000;
  while (Date.now() < deadline) {
    if (await gameOver(alice).isVisible().catch(() => false)) break;
    for (const page of [alice, bob]) {
      await tryAnswer(page, String(1 + Math.floor(Math.random() * 99)));
    }
    await alice.waitForTimeout(400);
  }

  for (const page of [alice, bob]) {
    await expect(gameOver(page)).toBeVisible();
  }

  // A surviving player must have claimed the runner role from the dead host.
  const doc = await getGameDoc(gameId);
  const runnerId = doc.fields.runnerId.stringValue;
  expect(runnerId).toBeTruthy();
  expect(runnerId).not.toBe(hostPlayerId);

  await Promise.all(contexts.slice(1).map((c) => c.close()));
});
