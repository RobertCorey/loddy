# Loddy (Post Truth Trivia)

Loddy is a real time trivia game built with Angular and Firebase.

**▶️ Play it now: https://loddy-e37f1.web.app**

Grab 2+ friends (3–8 players), share the game link, and answer questions where
the "truth" is whatever the player in the hot seat said it was.

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

## Deploy

Firebase CLI requires modern Node, so build and deploy use different Node
versions:

```sh
nvm use && npm run build -- --prod   # build with Node 16
nvm use default                      # back to modern Node
firebase deploy --only hosting,firestore
```

(or `npm run deploy` if your firebase CLI still runs under Node 16)
