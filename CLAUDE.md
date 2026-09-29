# Thrifty

An arcade budget game: catch falling items to fill five slots without going over budget.
Built at the Cloud9 x JetBrains 2026 hackathon; being moved onto Kitchen Labs' web standard
(`kitchenlabs-kit/docs/standards/web-release-standard.md`) on branch `web-release`.

## Regression baseline (captured 2026-09-29, before the web-release work)

Live: https://thrifty-kappa.vercel.app (Vercel project `thrifty`, repo ArvindVivek/thrifty).
Checked with one headless session against production; screenshots in the session scratchpad.

### Routes
| Route | Live | Notes |
|---|---|---|
| `/` | 200 | The whole game is one client page with a screen state machine |

No other routes, no API routes, no `robots`, `sitemap`, `manifest` or OG image.
`<title>` "Thrifty", default create-next-app `favicon.ico`.

### Screens (all on `/`, driven by `gameState.status` in `app/components/GameContainer.tsx`)
| Screen | Works live | What it does |
|---|---|---|
| Title | yes | THRIFTY logo, Start Game, Leaderboard, "arrow keys" hint |
| Ready | yes | The gameplay layout with a "Round 1 / Easy / BEGIN" overlay, budget and time shown |
| Gameplay | yes (desktop) | HUD (round dots, budget meter with +/- popups, timer bar, slots count); left panel (objective, controls, score bonuses, active power-ups); 800x500 play area; loadout of 5 slots; right panel (good and bad power-up legend); Kodee mascot reactions bottom-left |
| Round complete | yes | Score breakdown (base 500, item value, budget bonus, time bonus), combo list, total multiplier, round total, running total, confetti, Next Round |
| Game over | yes | Victory or "Budget bust / Time ran out on Round N", final score, rank letter and title (S 35k+ ... F), name form (1-15 chars, bad-words filter), Play Again, Leaderboard |
| Leaderboard | **broken** | Fetches top 100 from the deleted hackathon Supabase (`fbloukfgdjvwzdgrcnzt`): shows "Failed to fetch leaderboard"; realtime websocket errors in the console |
| Round failed, How to play | unreachable | Components exist but nothing routes to them (a failed round ends the game since commit eb8bb14) |

### Game rules (the regression contract)
- 3 rounds: Easy $5,000 / 35 s, Medium $4,000 / 30 s, Hard $3,000 / 25 s; items fall faster
  (x1, x1.25, x1.5) and spawn more often (1.4 s, 1.0 s, 0.7 s) each round.
- Catch 5 items to clear a round. Catching an item you can't afford is a bust: game over.
  Time running out is game over with 100 points per filled slot.
- Round score = (500 + item value + 2 x budget left + 30 x seconds left) x combo multiplier.
  Combos multiply: Perfect Budget (exactly $0 left) x2.0, Balanced (3+ categories) x1.2,
  Specialist (4+ of one category) x1.5, Speed Demon (15+ s left) x1.3, Thrifty (50%+ budget
  left) x1.4.
- 26% of spawns are power-ups. Good: Slow Motion (5 s), Budget Boost (+$500), Optimal Hint
  (4 s, highlights good buys), Time Freeze (3 s), 2x Score (next catch). Bad: Budget Drain
  (-$300), Speed Up (4 s), Slot Lock (5 s), Point Drain (-200 points).
- Ranks: S 35,000, A 30,000, B 25,000, C 20,000, D 15,000, else F.
- Controls: arrow keys only.

### Known problems at baseline
- Phone: unusable. The layout is a fixed 800 px play area between two fixed side panels, so a
  390 px screen shows the side panel and a sliver of the play area, and there are no touch
  controls.
- Leaderboard dead (above). Anyone could insert any score: the old client posted straight to a
  table with no server-side checks.
- Play Again kept the previous game's total score (`startRound(1)` never reset `totalScore`).
- 2x Score never applied: the effect had a 0 ms duration, so it expired on the next physics
  tick before any catch.
- Third-party art: Valorant weapon and shield images (Riot), the Cloud9 logo, and JetBrains'
  Kodee mascot. None of it is licensed for a Kitchen Labs release.

### Tests at baseline
Jest, 8 files, 140 test cases. **129 ran: 111 pass, 18 fail; 3 of 8 suites fail**:
- `itemSpawner.test.ts`: 17 failures, written for the old category spawner and 5 rounds.
- `GameContext.test.tsx`: 1 failure, expects the old 1000 px canvas.
- `GameContainer.test.tsx`: the suite can't load (`bad-words` ships ESM Jest can't parse), so
  its 11 tests never ran.
