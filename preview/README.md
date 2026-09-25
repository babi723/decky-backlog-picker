# Local UI Preview

Renders `src/index.tsx`'s `Content` component in a plain browser, outside
Decky Loader / Steam Deck, for local frontend development.

Not part of the shipped plugin. Development tool only — does not affect
`pnpm build` / `dist/index.js`.

## How it works

- `decky-ui-stub.tsx` / `decky-api-stub.ts` — minimal stand-ins for
  `@decky/ui` and `@decky/api`, aliased in `vite.config.ts`. Approximate
  styling only, not pixel-accurate to real Decky UI.
- `backend_server.py` — runs the real `backend/main.py` `Plugin` class
  (with a mocked `decky` module and, on macOS, `get_steam_path()` pointed at
  the local Steam install) behind a tiny local HTTP JSON-RPC bridge, so the
  preview reflects real local Steam data and real ProtonDB/HLTB calls.

## Usage

```bash
# terminal 1
pnpm run preview:backend

# terminal 2
pnpm run preview
```

Then open the printed local URL (default `http://localhost:5173`).

ProtonDB/HLTB calls only fire once you visit the Library or Order tab
(they warm the cache in the background); the Pick tab's default "Gold+"
filter will show 0 games until that cache is warm, same as on a real device.
HLTB may fail with a 403 from some networks — this is expected, and the
backend falls back to "Unknown" without breaking anything (see
`tests/manual/local_backend_test.py`).
