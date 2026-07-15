import { test, expect, Browser, Page } from "@playwright/test";

/**
 * Plays a complete 3-player game against the production build in dist/loddy.
 * Each "player" is an isolated browser context (the app keeps player identity
 * in memory per tab). The game's pace is set by the app's own timers
 * (10s rules screens, 12s score screens), so the driver below is reactive:
 * it polls every page and answers whenever an answer box is showing.
 */

async function createGame(page: Page): Promise<string> {
  await page.goto("/start");
  await page.getByRole("button", { name: "Create New Game" }).click();
  await page.waitForURL(/\/game\/\w+/);
  return page.url();
}

async function join(page: Page, name: string) {
  await page.locator("app-join-game-form input").fill(name);
  await page.getByRole("button", { name: "Join" }).click();
  await expect(page.getByText(name)).toBeVisible();
}

/** Answer with `value` if this page is currently showing an answer box. */
async function tryAnswer(page: Page, value: string): Promise<boolean> {
  const input = page.locator("input.answer-input");
  try {
    if (!(await input.isVisible())) return false;
    await input.fill(value);
    await page.getByRole("button", { name: "Answer" }).click();
    return true;
  } catch {
    return false; // screen changed under us mid-answer; the next lap retries
  }
}

test("three players can play a full game and start a rematch", async ({
  browser,
}) => {
  const players = ["Hosty", "Guessy", "Bluffy"];
  const contexts = await Promise.all(players.map(() => browser.newContext()));
  const pages = await Promise.all(contexts.map((c) => c.newPage()));
  const [host, alice, bob] = pages;

  // --- Lobby ---
  const gameUrl = await createGame(host);
  await join(host, players[0]);

  for (const [i, page] of [alice, bob].entries()) {
    await page.goto(gameUrl);
    await expect(page.getByText(`${i + 1} / 8 Players`)).toBeVisible();
    await join(page, players[i + 1]);
  }
  await expect(host.getByText("3 / 8 Players")).toBeVisible();

  // Only the host gets the button (fixed in 2026: an ad-script crash used to
  // kill this whole code path).
  await expect(alice.getByRole("button", { name: "Start Game" })).toHaveCount(
    0,
  );
  await host.getByRole("button", { name: "Start Game" }).click();
  await expect(host.getByText("Brain Question Round!")).toBeVisible();

  // --- Play: brain questions, then the guessing loop, until Game Over ---
  const gameOver = (page: Page) => page.getByText("Game Over!");
  const deadline = Date.now() + 4 * 60_000;
  let answered = 0;
  while (Date.now() < deadline) {
    if (await gameOver(host).isVisible().catch(() => false)) break;
    for (const page of pages) {
      if (await tryAnswer(page, String(1 + Math.floor(Math.random() * 99)))) {
        answered++;
      }
    }
    await host.waitForTimeout(500);
  }
  // 6 brain answers + 6 questions x 2 guessers = 18 total
  expect(answered).toBeGreaterThanOrEqual(18);

  // --- Game over: everyone sees the credits and the final scores ---
  for (const page of pages) {
    await expect(gameOver(page)).toBeVisible();
    await expect(page.getByText("Thanks for playing!")).toBeVisible();
    for (const name of players) {
      await expect(page.getByText(name)).toBeVisible();
    }
  }

  // --- Play Again: host starts a rematch, others get the button too ---
  const oldPath = new URL(gameUrl).pathname;
  const inNewLobby = (url: URL) =>
    url.pathname.startsWith("/game/") &&
    url.pathname !== oldPath &&
    !url.searchParams.has("playerName"); // auto-join strips the param

  await host.getByRole("button", { name: "Play Again" }).click();
  await host.waitForURL(inNewLobby);
  const rematchUrl = host.url();
  // ?playerName= auto-join should have re-joined the host in the new lobby
  await expect(host.getByText("1 / 8 Players")).toBeVisible();
  await expect(host.getByText(players[0])).toBeVisible();

  await alice.getByRole("button", { name: "Play Again" }).click();
  await alice.waitForURL(inNewLobby);
  expect(alice.url()).toBe(rematchUrl);
  await expect(alice.getByText("2 / 8 Players")).toBeVisible();

  await Promise.all(contexts.map((c) => c.close()));
});

test("share link matches the game url", async ({ page }) => {
  const gameUrl = await createGame(page);
  await expect(page.locator("input[disabled]")).toHaveValue(gameUrl);
});

test("late arrivals become observers once the game starts", async ({
  browser,
}) => {
  const contexts = await Promise.all(
    Array.from({ length: 4 }, () => browser.newContext()),
  );
  const pages = await Promise.all(contexts.map((c) => c.newPage()));
  const [host, p2, p3, late] = pages;

  const gameUrl = await createGame(host);
  await join(host, "Hosty");
  // NB: the join form's name pattern is letters and spaces only
  const names = ["Punctual", "Prompt"];
  for (const [i, page] of [p2, p3].entries()) {
    await page.goto(gameUrl);
    await join(page, names[i]);
  }
  await host.getByRole("button", { name: "Start Game" }).click();
  await expect(host.getByText("Brain Question Round!")).toBeVisible();

  await late.goto(gameUrl);
  // No join form once the game has left the lobby
  await expect(late.locator("app-join-game-form")).toHaveCount(0);

  await Promise.all(contexts.map((c) => c.close()));
});
