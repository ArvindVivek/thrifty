# Thrifty design

KL Web 1.0.1 (the Kitchen Labs web kit) with Thrifty's accent, "bargain lime". Playful and
game-like: chunky pressed buttons, Fredoka numbers, soft coloured tiles, one spring vocabulary.
Light and dark both designed (system default, toggle in the header).

## Colour roles

| Colour | Token | Means | Never |
|---|---|---|---|
| Lime `#A3C614` | `--accent`, `--accent-strong` | **You**: your cart, the primary button, your row on the board, bonus multipliers | Text or thin icons on a light ground (1.79:1); use `--accent-text` `#60750C` there |
| Dark olive `#1E2605` | `--on-accent` | Labels and the cart glyph on lime (7.98:1; white would be 1.97:1) | |
| Green | `--success*` | Money you still have (budget above 50%), good power-ups (round bubbles), "cleared" | |
| Amber | `--warning*` | Budget between 20% and 50%, the best-buy star, 1st place | |
| Red | `--danger*` | Budget under 20%, the last 5 seconds, bad power-ups (tilted squares), "over budget" | |
| Orange / pink / teal / violet | `--aisle-snack/style/home/tech` (+ `-soft`) | The four shop aisles, as icon-on-tile colours | The only cue: the aisle name is written in the cart, the rules and the combos |
| Cool blue `#38BDF8` | inline | Slow Motion and Time Freeze tint over the field | |

Power-ups carry their meaning in shape as well as colour: good ones are round, bad ones are tilted
squares. Every pair above is measured by `lib/tokens.test.ts` (text 4.5:1, icons and rings 3:1).

## Layout

- **Game screen**: one viewport tall, nothing scrolls (`h-dvh overflow-hidden`). HUD on top, then
  Penny's line and active power-ups (a fixed 32 px row), the play area, the cart of five slots.
  The play area is a 480 x 600 logical field scaled to fit (`useFitScale`, max 1.3x), so phones
  and desktops play the same field. The rules panels sit beside it from `lg` (right) and `xl` (left).
- **Title, leaderboard**: `PageShell` with the studio footer (privacy and support links).
- **Result cards**: a centred card, max 28 rem.

## Motion

| Moment | Motion | Value |
|---|---|---|
| Falling items, cart | Game loop (60 Hz fixed step), CSS transforms | not animated by Motion |
| Budget change popup | fade + 4 px drop, gone after 700 ms | Motion default tween |
| Cart slot fills | scale 1 → 1.08 → 1 | 250 ms |
| Penny's line | fade up 6 px | `snappy` |
| Active power-up pill | scale 0.8 → 1 | Motion default |
| Ready card, rank tile, "cleared" line | `popIn()` | `bouncy` |
| Score lines, board rows | `fadeUp(i)` | `enter`, 40 ms stagger |
| Confetti (round cleared, win) | 36 bits fall 2.4 s | once |
| Slow Motion / Time Freeze / Speed Up | field tint fades in/out | Motion default |

Reduce Motion: `MotionConfig reducedMotion="user"` and the kit's CSS rule; the game itself still
moves (it is the game), but the decorative motion stops.

## Icons

Lucide only, through `<Icon>`. One icon per shop item (`components/game/visuals.ts`), one per
power-up. Penny the piggy bank is Lucide's `PiggyBank`. No emoji, no images.
