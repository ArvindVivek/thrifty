# Architecture

**Analysis Date:** 2026-01-28

## Pattern Overview

**Overall:** Single-Page Application (SPA) with React hooks-based state management

**Key Characteristics:**
- Next.js App Router with server/client component boundaries
- Client-side game state management using React hooks
- Functional component architecture (no class components)
- TailwindCSS for all styling with utility-first approach
- No external state management library (Redux, Zustand, etc.)
- Game logic isolated from UI rendering concerns

## Layers

**Presentation Layer:**
- Purpose: Render game UI screens and visual feedback
- Location: `app/` directory components (page.tsx, layout.tsx)
- Contains: React functional components, UI state, DOM manipulation
- Depends on: Game logic layer for game state and event handlers
- Used by: Browser/user for visual interaction

**Game Logic Layer:**
- Purpose: Core game mechanics, state calculations, win/loss conditions
- Location: Custom hooks and utility functions (to be created in `app/hooks/` and `app/lib/`)
- Contains: Round management, item spawning, collision detection, score calculation, budget tracking
- Depends on: Data models, type definitions
- Used by: Presentation layer components

**Data Layer:**
- Purpose: Type definitions and data structures
- Location: `app/types/` or inline type definitions
- Contains: TypeScript interfaces for Game, Round, Item, Player, Score
- Depends on: Nothing (foundational)
- Used by: All other layers

## Data Flow

**Game Initialization Flow:**

1. User loads app → `page.tsx` renders
2. Title screen displayed (static content)
3. User clicks "Start Game" → Game state initialized
4. Round 1 begins → Items start spawning
5. Game loop: render → check collisions → update state → repeat at 60 FPS

**Item Catch Flow:**

1. Item spawned at random top position with cost/value
2. Item falls at constant speed each frame
3. Collision detection checks if item overlaps catcher
4. If collision: item removed, budget deducted, slot filled, score updated
5. If missed: item disappears at screen bottom

**Round Completion Flow:**

1. All 5 slots filled OR budget exceeded OR time runs out
2. Determine win/loss condition
3. Calculate round score (base + bonuses + multipliers)
4. Add to total game score
5. Display round summary screen
6. User clicks "Next Round" or auto-advance after delay
7. Repeat for rounds 2-5

**State Management:**
- Single game state object tracking: current round, budget, time remaining, caught items, slots filled, total score
- State updates trigger re-renders via React
- Frame-based updates (60 FPS) using `requestAnimationFrame` or game loop library
- No persistence until game over (no save/load mid-game)

## Key Abstractions

**Game State Object:**
- Purpose: Central source of truth for game state
- Examples: Used in all game logic and presentation components
- Pattern: Single immutable state + update function pattern (useState)

**Item System:**
- Purpose: Represents falling items with cost, category, value
- Examples: Individual item object created per spawn, stored in items array
- Pattern: Category-based item generation with cost ranges and random variance

**Round Configuration:**
- Purpose: Encapsulates difficulty parameters for each round
- Examples: Budget amount, time limit, fall speed, spawn rate (round 1-5 differ)
- Pattern: Lookup table or array indexed by round number

**Collision Detection:**
- Purpose: Determine if falling item overlaps with catcher
- Examples: Simple rectangle overlap (catcher x/y vs item x/y)
- Pattern: Axis-aligned bounding box (AABB) collision detection

**Score Calculator:**
- Purpose: Compute round score from multiple components
- Examples: Base (500) + item values + budget bonus + time bonus, then apply multipliers
- Pattern: Compositional scoring with independent bonus calculations

## Entry Points

**Home Page (Title Screen & Game):**
- Location: `app/page.tsx`
- Triggers: Initial page load from browser
- Responsibilities: Render appropriate screen (title, gameplay, round complete, game over), handle user input (button clicks, arrow keys), delegate to game logic hooks

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every page load
- Responsibilities: Set up HTML structure, load fonts (Geist), apply global CSS, wrap children with necessary providers

**Global Styles:**
- Location: `app/globals.css`
- Triggers: Applied to all pages via layout
- Responsibilities: Define CSS variables for colors, theme (light/dark), Tailwind imports, base body styling

## Error Handling

**Strategy:** Try-catch for critical operations, defensive checks for edge cases

**Patterns:**
- Validate user input (e.g., name length limits in leaderboard entry)
- Check array bounds before accessing items (slots, rounds)
- Default values for missing optional data (e.g., leaderboard scores default to 0)
- Silent fail for non-critical features (e.g., localStorage errors don't break game)

## Cross-Cutting Concerns

**Logging:** No logging library detected; would use `console.log()` for debugging in development.

**Validation:** Input validation needed for:
- Leaderboard name entry (max 15 chars, no special chars)
- Budget calculations (cannot go negative)
- Time values (cannot go below 0)
- Score calculations (prevent NaN/Infinity)

**Authentication:** Not applicable. This is a single-player/shared booth game with no user accounts.

**Performance Considerations:**
- Game loop must run at 60 FPS for smooth movement and collision detection
- Avoid unnecessary re-renders; use useMemo/useCallback for expensive calculations
- Leaderboard localStorage reads/writes should be minimal (e.g., only on game over)
- Item spawning should not create excessive DOM nodes; reuse/pool items if performance degrades

---

*Architecture analysis: 2026-01-28*
