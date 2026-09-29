/**
 * Game configuration constants
 *
 * All configurable values for Thrifty's game mechanics.
 */

// ============================================================================
// Physics Timing
// ============================================================================

/**
 * Target physics update rate (60 FPS)
 */
export const PHYSICS_FPS = 60;

/**
 * Fixed physics timestep in milliseconds (16.67ms)
 */
export const PHYSICS_DT = 1000 / PHYSICS_FPS;

/**
 * Maximum frame time cap to prevent spiral of death after tab focus loss
 */
export const MAX_FRAME_TIME = 1000;

// ============================================================================
// Play area (logical pixels; the screen scales it to fit)
// ============================================================================

/**
 * A portrait play area, so the same field fills a phone held upright and sits between the
 * side panels on a desktop. The hackathon build was 800x500 landscape, which left a 390 px
 * phone showing a sliver of it. Every device plays the same logical field, so scores on the
 * shared leaderboard stay comparable.
 */
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 600;

// ============================================================================
// Catcher Configuration
// ============================================================================

export const CATCHER_WIDTH = 88;
export const CATCHER_HEIGHT = 64;

/**
 * Catcher movement speed in pixels per second. Keyboard and touch share it, so dragging a
 * finger is no faster than holding an arrow key: about 1 s edge to edge.
 */
export const CATCHER_SPEED = 400;

/**
 * Fixed Y position for catcher (bottom of screen)
 */
export const CATCHER_Y = CANVAS_HEIGHT - CATCHER_HEIGHT - 16;

// ============================================================================
// Item Configuration
// ============================================================================

export const ITEM_WIDTH = 64;
export const ITEM_HEIGHT = 64;

/**
 * Base falling speed in pixels per second. 180 keeps the hackathon build's fall time
 * (about 3.3 s from the top to the catcher) on the taller portrait field.
 */
export const ITEM_BASE_SPEED = 180;

// ============================================================================
// Round Configuration
// ============================================================================

/**
 * Configuration for each of the 3 rounds (Easy, Medium, Hard)
 * - budget: Starting budget for the round
 * - duration: Round duration in milliseconds
 * - speedMultiplier: Multiplier applied to ITEM_BASE_SPEED
 * - spawnInterval: Milliseconds between item spawns
 * - name: Display name for the round
 */
export const ROUND_CONFIG = [
  { budget: 5000, duration: 35000, speedMultiplier: 1.0, spawnInterval: 1400, name: 'Easy' },
  { budget: 4000, duration: 30000, speedMultiplier: 1.25, spawnInterval: 1000, name: 'Medium' },
  { budget: 3000, duration: 25000, speedMultiplier: 1.5, spawnInterval: 700, name: 'Hard' },
] as const;

export const TOTAL_ROUNDS = 3;

/** Slots to fill each round. */
export const SLOT_COUNT = 5;

/**
 * Budget Boost can't lift the budget above twice the round's starting budget. Without a cap a
 * lucky run of boosts made the highest possible score unbounded, and the leaderboard needs a
 * real maximum to reject impossible scores (see maxRoundScore in scoreCalculator.ts).
 */
export const BUDGET_CAP_MULTIPLIER = 2;

/** Share of spawns that are power-ups instead of items (hackathon tuning). */
export const POWER_UP_SPAWN_CHANCE = 0.26;
