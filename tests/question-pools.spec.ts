import { test, expect, Page } from "@playwright/test";
import { gameIdFromUrl, getGameDoc } from "./firestore-rest";

/**
 * The corporate (SFW) question pool: picking it on the start screen must
 * produce a game whose questions are all tagged sfw, and the choice must
 * show up in the lobby.
 */

async function join(page: Page, name: string) {
  await page.locator("app-join-game-form input").fill(name);
  await page.getByRole("button", { name: "Join" }).click();
  await expect(page.getByText(name)).toBeVisible();
}

test("a corporate game only deals corporate-friendly questions", async ({
  browser,
}) => {
  const contexts = await Promise.all(
    Array.from({ length: 3 }, () => browser.newContext()),
  );
  const [host, p2, p3] = await Promise.all(contexts.map((c) => c.newPage()));

  await host.goto("/start");
  await host.getByText("Corporate-friendly").click();
  await host.getByRole("button", { name: "Create New Game" }).click();
  await host.waitForURL(/\/game\/\w+/);
  const gameUrl = host.url();

  await expect(
    host.getByText("Corporate-friendly questions only"),
  ).toBeVisible();

  await join(host, "Hosty");
  for (const [i, page] of [p2, p3].entries()) {
    await page.goto(gameUrl);
    await join(page, ["Suit", "Tie"][i]);
  }
  await host.getByRole("button", { name: "Start Game" }).click();
  await expect(host.getByText("Brain Question Round!")).toBeVisible();

  // The UI shows the local (latency-compensated) write; give the server
  // commit a moment before reading the doc over REST.
  let doc: any;
  await expect(async () => {
    doc = await getGameDoc(gameIdFromUrl(gameUrl));
    expect(doc.fields.questions).toBeTruthy();
  }).toPass({ timeout: 15_000 });
  expect(doc.fields.questionPool.stringValue).toBe("corporate");
  const questions = doc.fields.questions.arrayValue.values ?? [];
  expect(questions.length).toBe(6);
  for (const q of questions) {
    expect(q.mapValue.fields.sfw.booleanValue).toBe(true);
  }

  await Promise.all(contexts.map((c) => c.close()));
});
