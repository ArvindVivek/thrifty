# THRIFTY

## What This Is

A fast-paced resource management mini-game for the Cloud9 x JetBrains hackathon event booth. Players control a catcher to grab falling items and equip a 5-person squad while staying under budget. Quick play sessions (2-3 minutes) with high replayability through randomized items and leaderboard competition.

## Core Value

Players can complete a satisfying game loop — catch items, manage budget, beat the timer — in under 3 minutes with zero learning curve.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Core Gameplay:**
- [ ] Catcher moves horizontally with arrow keys to catch/dodge falling items
- [ ] Items fall from top with visible cost, auto-caught on overlap
- [ ] 5 equipment slots fill as items are caught
- [ ] Budget depletes with each catch; exceeding = instant bust
- [ ] Timer counts down; running out with unfilled slots = fail
- [ ] Win condition: all 5 slots filled within budget and time

**Item System:**
- [ ] 5 item categories (Weapon, Shield, Utility, Premium, Bonus) with distinct costs/colors
- [ ] Items spawn at random positions with category-based drop rates
- [ ] Item costs randomly generated within category ranges

**Game Structure:**
- [ ] 5 rounds with progressive difficulty (tighter budget, faster items, less time)
- [ ] Title screen with Start Game and Leaderboard buttons
- [ ] How-to-play screen (skippable)
- [ ] Round complete/fail screens with score breakdown
- [ ] Game over screen with final score and rank title

**Scoring:**
- [ ] Base score + item value + budget bonus + time bonus
- [ ] Combo multipliers (Perfect Budget, Balanced Loadout, etc.)

**Junie Mascot:**
- [ ] Fixed position on screen with emoji reactions
- [ ] Reacts to catches, budget warnings, round outcomes

**Leaderboard:**
- [ ] Name entry after game over
- [ ] Top 100 scores stored in localStorage
- [ ] Leaderboard display screen

**Branding:**
- [ ] C9 color palette (Blue #0A74DA, White, Navy #1A365D)
- [ ] C9 logo on title and catcher
- [ ] JetBrains/Junie integration

### Out of Scope

- Sound effects — nice-to-have if time permits, not MVP
- Touch/swipe mobile controls — keyboard-first for booth demo
- Pause functionality — game is short enough to not need it
- Settings screen — unnecessary complexity for hackathon
- Advanced Junie animations — basic emoji reactions sufficient

## Context

- **Event**: Cloud9 x JetBrains Hackathon, Category 4: Event Mini-Game
- **Play environment**: Booth with keyboard, quick sessions while waiting in line
- **VALORANT connection**: "Thrifty" is an in-game accolade for winning with less credits — creates subtle connection without requiring game knowledge
- **Existing codebase**: Next.js 16 + React 19 + Tailwind 4 bootstrapped, no game logic yet
- **Comprehensive BRD**: Full game design documented in `docs/thrifty_brd.md`

## Constraints

- **Timeline**: Hackathon deadline — must ship MVP
- **Tech stack**: React with hooks, TailwindCSS, no external game libraries
- **Performance**: 60 FPS target, <3s load time
- **Browser support**: Chrome, Firefox, Safari, Edge (modern versions)
- **Responsive**: 360px-800px width range

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No external game engine | Keep it simple, React + RAF sufficient for this scope | — Pending |
| localStorage for leaderboard | No backend needed, persists at booth | — Pending |
| Keyboard-first controls | Primary demo is booth with keyboard | — Pending |
| 5 rounds fixed | Consistent 2-3 minute experience | — Pending |

---
*Last updated: 2026-01-28 after initialization*
