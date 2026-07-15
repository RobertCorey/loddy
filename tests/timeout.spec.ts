import { test, expect, Page } from "@playwright/test";
import { gameIdFromUrl, getGameDoc, patchGameNumbers } from "./firestore-rest";

/**
 * The 2026 answer timer: nobody can hang the game anymore.
 *  - A "brain" who never answers gets their questions dropped at the buzzer.
 *  - A guesser who never answers gets a blank (zero-point) answer filled in.
 * Tests shorten the timers via the Firestore REST API (answerSeconds /
 * brainSeconds are per-game overrides the runner honors).
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

test("a player who answers nothing can't hang the game", async ({
  browser,
}) => {
  test.setTimeout(6 * 60_000);
  const contexts = await Promise.all(
    Array.from({ length: 3 }, () => browser.newContext()),
  );
  const [host, steady, ghost] = await Promise.all(
    contexts.map((c) => c.newPage()),
  );

  const gameUrl = await createGame(host);
  const gameId = gameIdFromUrl(gameUrl);
  // party pace is 30s/90s; test pace is 5s/20s
  await patchGameNumbers(gameId, { answerSeconds: 5, brainSeconds: 20 });

  await join(host, "Hosty");
  for (const [i, page] of [steady, ghost].entries()) {
    await page.goto(gameUrl);
    await join(page, ["Steady", "Ghosty"][i]);
  }
  await host.getByRole("button", { name: "Start Game" }).click();
  await expect(host.getByText("Brain Question Round!")).toBeVisible();

  // Ghosty answers NOTHING from here on: their two brain questions must get
  // dropped, and every guessing round must advance without them.
  const gameOver = (page: Page) => page.getByText("Game Over!");
  const deadline = Date.now() + 5 * 60_000;
  while (Date.now() < deadline) {
    if (await gameOver(host).isVisible().catch(() => false)) break;
    for (const page of [host, steady]) {
      await tryAnswer(page, String(1 + Math.floor(Math.random() * 99)));
    }
    await host.waitForTimeout(400);
  }

  for (const page of [host, steady, ghost]) {
    await expect(gameOver(page)).toBeVisible();
  }
  // medals shipped with the same batch: the winner gets a gold
  await expect(host.getByText("🥇").first()).toBeVisible();

  // The doc should show both timeout mechanisms fired: Ghosty's two brain
  // questions were dropped (6 -> 4) and Ghosty got a blank guess for every
  // remaining question. (Count only Ghosty's blanks: a slow CI runner could
  // legitimately cost Hosty or Steady a buzzer too.)
  const doc = await getGameDoc(gameId);
  const questions = doc.fields.questions.arrayValue.values ?? [];
  expect(questions.length).toBe(4);
  const players = doc.fields.players.arrayValue.values ?? [];
  const ghostId = players.find(
    (p: any) => p.mapValue.fields.name.stringValue === "Ghosty",
  ).mapValue.fields.id.stringValue;
  const answers = doc.fields.answers.arrayValue.values ?? [];
  const ghostBlanks = answers.filter(
    (a: any) =>
      a.mapValue.fields.text.stringValue === "" &&
      a.mapValue.fields.playerId.stringValue === ghostId,
  );
  expect(ghostBlanks.length).toBe(4); // one per remaining question

  await Promise.all(contexts.map((c) => c.close()));
});
