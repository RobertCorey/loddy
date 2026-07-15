# Loddy (Post Truth Trivia)

Loddy is a real time trivia game built with Angular and Firebase.

**▶️ Play it now: https://loddy-e37f1.web.app**

Grab 2+ friends (3–8 players), share the game link, and answer questions where
the "truth" is whatever the player in the hot seat said it was.

- Two question pools, picked when creating a game: 🌶️ everything, or
  👔 corporate-friendly (safe for a work icebreaker).
- Answer timer: 30s per guess, 90s for the brain round. Someone who closes
  their tab just times out of each round instead of hanging the game.
- The game's state machine runs in a player's browser tab; if that tab dies,
  another player's tab detects the stale heartbeat and takes over (~25s).

Game design: [Loddy-Flowchart.pdf](https://github.com/RobertCorey/loddy/blob/master/Loddy-Flowchart.pdf)

## Development

The app is Angular 11, which needs Node 16 to build (webpack 4 breaks on the
OpenSSL 3 in Node 17+):

```sh
nvm use        # picks up .nvmrc (Node 16)
npm install
npm start      # dev server on http://localhost:4200
```

## Tests

End-to-end tests live in `tests/` (Playwright, three headless browsers
actually playing full games against the real Firestore). They need modern
Node — the opposite of the build:

```sh
nvm use && npm run build -- --prod     # tests serve dist/loddy
nvm use default
cd tests
npm install && npx playwright install chromium   # first time only
npm test
```

The timeout/migration specs shorten the in-game timers by patching the game
doc over the Firestore REST API (`answerSeconds` / `brainSeconds` per-game
overrides).

## CI / Deploy

GitHub Actions (`.github/workflows/ci.yml`) builds under Node 16, runs the
Playwright suite under Node 24, and on green `master` pushes deploys hosting
to Firebase using the `FIREBASE_SERVICE_ACCOUNT` repo secret
(`github-actions-deploy@loddy-e37f1`).

Manual deploy (also how Firestore rules get deployed — CI only ships hosting):

```sh
nvm use && npm run build -- --prod   # build with Node 16
nvm use default                      # back to modern Node
firebase deploy --only hosting,firestore
```

Game docs carry an `expireAt` timestamp (30 days out). Enabling the actual
Firestore TTL garbage collection needs the project on the Blaze plan:
`gcloud firestore fields ttls update expireAt --collection-group=games --enable-ttl`.
Until then old docs just accumulate, which is fine.
