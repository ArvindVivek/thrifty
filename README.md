# Thrifty

A quick arcade shopping game: things fall from the shelves, each with a price. Catch five before
the clock runs out without going over budget. Three rounds, a public leaderboard, phone and
desktop, light and dark.

Live: https://thrifty-kappa.vercel.app. © 2026 Kitchen Labs; first built at the Cloud9 x
JetBrains 2026 hackathon.

## Run it

```bash
cp .env.example .env.local   # fill in the anon key (and the service-role key for e2e cleanup)
npm install
npm run dev                  # http://localhost:3187
```

Without the Supabase values the game still works; the leaderboard shows a friendly "can't be
reached" message.

## Checks

```bash
npm run gate      # kit check, typecheck, eslint (0 warnings), vitest, build, leak-check
npm run e2e       # Playwright on the production build: phone + desktop (run build first)
npm run e2e:live  # against production: routes, secrets, a real round trip, the database rules
node scripts/capture-marketing.mjs   # populated marketing shots (needs npm run start)
```

## How it fits together

| Where | What |
|---|---|
| `lib/game/` | The game: engine (fixed 60 Hz step), spawner, shop catalog, scoring and the score ceiling, power-ups, Penny's lines. Pure TypeScript, tested |
| `components/game/` | Screens: title, the game (HUD, play area, cart), round and game-over cards, leaderboard |
| `hooks/` | Keyboard, the engine hook (with touch steering), Penny's timing |
| `lib/leaderboard.ts` | Reads the board and saves a score as an anonymous player; fails soft |
| `supabase/migrations/` | The `thrifty` schema's tables, RLS and every rule a score must pass |
| `components/kl`, `lib/kl`, `styles/kl-tokens.css` | KL Web, vendored from kitchenlabs-kit (don't edit here) |

See `CLAUDE.md` for the operating manual, `DESIGN.md` for colours and motion, `docs/PRIVACY.md`
and `docs/SUPPORT.md` for the public pages, and `docs/CREDITS.md` for licences.
