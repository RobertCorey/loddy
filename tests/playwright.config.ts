import { defineConfig } from "@playwright/test";

// Serves the production build from ../dist/loddy (build it first with
// `nvm use && npm run build -- --prod` at the repo root). The app talks to
// the real loddy-e37f1 Firestore, so each test plays in a throwaway game doc.
export default defineConfig({
  testDir: ".",
  timeout: 5 * 60_000, // a full game is ~2min of fixed rules/score timers
  expect: { timeout: 30_000 },
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4231",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npx serve -s ../dist/loddy -l 4231",
    url: "http://localhost:4231",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
