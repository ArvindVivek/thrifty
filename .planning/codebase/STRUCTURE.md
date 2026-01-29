# Codebase Structure

**Analysis Date:** 2026-01-28

## Directory Layout

```
thrifty/
├── app/                       # Next.js App Router directory
│   ├── layout.tsx             # Root layout with metadata and global setup
│   ├── page.tsx               # Main game page (title, gameplay, screens)
│   ├── globals.css            # Global styles and Tailwind imports
│   ├── favicon.ico            # App icon
│   ├── components/            # Reusable React components (create)
│   │   ├── GameScreen.tsx     # Main gameplay render
│   │   ├── TitleScreen.tsx    # Title/menu screen
│   │   ├── RoundComplete.tsx  # Round summary screen
│   │   ├── GameOver.tsx       # Final score and leaderboard entry
│   │   ├── Catcher.tsx        # Player catcher UI
│   │   ├── FallingItem.tsx    # Individual falling item
│   │   ├── ItemSlots.tsx      # Equipment slots display
│   │   ├── Junie.tsx          # Junie mascot with reactions
│   │   └── Leaderboard.tsx    # Top 100 scores display
│   ├── hooks/                 # Custom React hooks (create)
│   │   ├── useGameState.ts    # Central game state management
│   │   ├── useRoundLogic.ts   # Round control and progression
│   │   ├── useItemSpawning.ts # Item generation and falling logic
│   │   ├── useCollision.ts    # Catcher/item collision detection
│   │   ├── useGameLoop.ts     # 60 FPS game loop with RAF
│   │   └── useScore.ts        # Score calculation with bonuses
│   ├── lib/                   # Utility functions (create)
│   │   ├── constants.ts       # Round configs, item data, scoring rules
│   │   ├── types.ts           # TypeScript interfaces (Game, Item, etc.)
│   │   ├── itemGenerator.ts   # Item creation logic with costs/values
│   │   ├── scoreCalculator.ts # Detailed score computation
│   │   ├── leaderboard.ts     # localStorage operations for scores
│   │   └── random.ts          # Seeded or helper random functions
│   └── styles/                # Additional CSS modules (if needed)
├── public/                    # Static assets
│   ├── next.svg               # Next.js logo
│   ├── vercel.svg             # Vercel logo
│   ├── file.svg               # File icon (unused)
│   ├── globe.svg              # Globe icon (unused)
│   └── window.svg             # Window icon (unused)
├── .planning/                 # GSD planning documents
│   └── codebase/              # This directory
├── docs/                      # Documentation
│   └── thrifty_brd.md         # Business Requirements Document
├── .git/                      # Git repository
├── .gitignore                 # Git ignore rules
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── postcss.config.mjs         # PostCSS/Tailwind config
├── eslint.config.mjs          # ESLint configuration
├── package.json               # Dependencies and scripts
├── package-lock.json          # Locked dependency versions
└── README.md                  # Project overview
```

## Directory Purposes

**app/:**
- Purpose: Next.js App Router pages and application code
- Contains: React components, hooks, utilities, styles
- Key files: `page.tsx` (entry point), `layout.tsx` (root wrapper), `globals.css` (styles)

**app/components/:**
- Purpose: Reusable UI components for different screens and game elements
- Contains: React functional components for screens, UI elements, mascot, leaderboard
- Key files: All components are visual/presentation-focused

**app/hooks/:**
- Purpose: Custom React hooks encapsulating game logic and state management
- Contains: Game state (useState), side effects (useEffect), game loop control
- Key files: `useGameState.ts` is the central authority for all game state

**app/lib/:**
- Purpose: Pure utility functions and constants not tied to React
- Contains: Type definitions, constants (difficulty tiers, item tables), calculations, localStorage operations
- Key files: `constants.ts` (source of truth for gameplay parameters), `types.ts` (TypeScript interfaces)

**public/:**
- Purpose: Static assets served directly (SVG logos, images)
- Contains: Unchanged design assets from create-next-app template
- Note: Currently only placeholder images; may add C9 logo, Junie PNG, item sprites here

**.planning/codebase/:**
- Purpose: GSD planning documentation (this folder)
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md
- Note: Auto-generated; not part of application code

**docs/:**
- Purpose: Project documentation
- Contains: Business Requirements Document with full game design
- Key files: `thrifty_brd.md` - comprehensive game spec for developers

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Main application component, renders all screens
- `app/layout.tsx`: Root layout, sets up HTML and global styles
- `next.config.ts`: Next.js build configuration (currently minimal)

**Configuration:**
- `tsconfig.json`: TypeScript compiler options, path aliases (`@/*`)
- `package.json`: Dependencies (React 19, Next 16, Tailwind 4, TypeScript 5)
- `postcss.config.mjs`: PostCSS plugins for Tailwind CSS
- `eslint.config.mjs`: Linting rules

**Core Logic:**
- `app/lib/constants.ts`: All gameplay parameters (round budgets, timers, fall speeds, item costs)
- `app/lib/types.ts`: TypeScript interfaces for Game, Round, Item, Player, Score
- `app/hooks/useGameState.ts`: Central useState managing entire game state
- `app/lib/scoreCalculator.ts`: Score calculation with bonuses and multipliers

**Testing:**
- No test files currently; create `app/**/*.test.ts(x)` or `app/__tests__/` directory

## Naming Conventions

**Files:**
- React components: PascalCase (e.g., `GameScreen.tsx`, `FallingItem.tsx`)
- Hooks: camelCase prefixed with "use" (e.g., `useGameState.ts`, `useCollision.ts`)
- Utilities: camelCase (e.g., `scoreCalculator.ts`, `itemGenerator.ts`)
- Constants: camelCase or UPPER_SNAKE_CASE for constants (e.g., `constants.ts`)
- Types: PascalCase (e.g., `Game.ts`, `Item.ts`)

**Directories:**
- Feature directories: lowercase (e.g., `components/`, `hooks/`, `lib/`)
- Component directories: PascalCase if grouping related components (e.g., `components/Game/`)

**Classes/Types:**
- Interfaces: PascalCase prefixed with "I" or unprefixed (e.g., `IGameState` or `GameState`)
- Types: PascalCase (e.g., `ItemCategory`, `RoundConfig`)
- Enums: PascalCase (e.g., `ScreenType`, `ItemCategory`)

**Functions:**
- React components: PascalCase (e.g., `GameScreen()`, `TitleScreen()`)
- Hooks: camelCase with "use" prefix (e.g., `useGameState()`, `useCollision()`)
- Utility functions: camelCase (e.g., `calculateScore()`, `generateItem()`, `detectCollision()`)

**Variables:**
- General: camelCase (e.g., `currentRound`, `catcherPosition`)
- Constants: UPPER_SNAKE_CASE (e.g., `ROUND_CONFIGS`, `ITEM_COSTS`)
- React state: camelCase with "set" prefix for setter (e.g., `gameState`, `setGameState`)

## Where to Add New Code

**New Feature (e.g., power-ups system):**
- Primary code: `app/lib/powerUpGenerator.ts` (generation logic), `app/hooks/usePowerUp.ts` (state/effects)
- UI: `app/components/PowerUpDisplay.tsx` or integrate into `FallingItem.tsx`
- Types: Add to `app/lib/types.ts` (PowerUp interface)
- Constants: Add power-up definitions to `app/lib/constants.ts`
- Tests: `app/lib/powerUpGenerator.test.ts`

**New Component/Module (e.g., settings screen):**
- Implementation: `app/components/SettingsScreen.tsx`
- Logic: Add to `useGameState.ts` if affects game state, or create `useSettings.ts`
- Styling: Use TailwindCSS classes inline (no separate CSS files unless complex)
- Integration: Import into `page.tsx` and add to screen switch logic

**Utilities:**
- Shared helpers (non-game): `app/lib/utils.ts` or specific file (e.g., `app/lib/formatting.ts`)
- Game calculations: `app/lib/scoreCalculator.ts`, `app/lib/itemGenerator.ts`
- DOM/UI helpers: Keep in component files or `app/lib/ui.ts`

**Tests:**
- Unit tests: `app/lib/__tests__/scoreCalculator.test.ts`
- Component tests: `app/components/__tests__/GameScreen.test.tsx`
- Hook tests: `app/hooks/__tests__/useGameState.test.ts`

## Special Directories

**node_modules/:**
- Purpose: Installed npm packages
- Generated: Yes (npm install)
- Committed: No (.gitignore excludes)

**.next/:**
- Purpose: Next.js build output and cache
- Generated: Yes (npm run build or dev server)
- Committed: No (.gitignore excludes)

**.git/:**
- Purpose: Git repository metadata
- Generated: Yes (git init)
- Committed: No (version control only)

**docs/:**
- Purpose: Non-code documentation
- Generated: No (manually maintained)
- Committed: Yes

**.planning/codebase/:**
- Purpose: GSD planning documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: Via GSD mapper tools
- Committed: Yes

---

*Structure analysis: 2026-01-28*
