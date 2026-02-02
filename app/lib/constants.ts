/**
 * Game configuration constants
 *
 * All configurable values for THRIFTY game mechanics.
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
// Canvas Dimensions
// ============================================================================

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;

// ============================================================================
// Catcher Configuration
// ============================================================================

export const CATCHER_WIDTH = 80;
export const CATCHER_HEIGHT = 100;

/**
 * Catcher movement speed in pixels per second
 */
export const CATCHER_SPEED = 400;

/**
 * Fixed Y position for catcher (bottom of screen)
 */
export const CATCHER_Y = CANVAS_HEIGHT - CATCHER_HEIGHT - 20;

// ============================================================================
// Item Configuration
// ============================================================================

export const ITEM_WIDTH = 80;
export const ITEM_HEIGHT = 50;

/**
 * Base falling speed in pixels per second
 */
export const ITEM_BASE_SPEED = 150;

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

// ============================================================================
// Item Category Costs
// ============================================================================

/**
 * Cost ranges for each item category
 */
export const ITEM_COSTS = {
  weapon: { min: 500, max: 1500 },
  shield: { min: 300, max: 800 },
  utility: { min: 200, max: 600 },
  premium: { min: 1000, max: 1800 },
  bonus: { min: 0, max: 100 },
} as const;

/**
 * Category multipliers for item value calculation
 */
export const CATEGORY_MULTIPLIERS = {
  weapon: 1.0,
  shield: 1.1,
  utility: 1.2,
  premium: 0.9,
  bonus: 2.0,
} as const;

// ============================================================================
// Performance Targets
// ============================================================================

export const TARGET_FPS = 60;
export const MEMORY_LIMIT_MB = 100;
export const LOAD_TIME_TARGET_MS = 3000;

// ============================================================================
// Grouped Game Configuration
// ============================================================================

/**
 * Complete game configuration object
 */
export const GAME_CONFIG = {
  physics: {
    fps: PHYSICS_FPS,
    dt: PHYSICS_DT,
    maxFrameTime: MAX_FRAME_TIME,
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
  catcher: {
    width: CATCHER_WIDTH,
    height: CATCHER_HEIGHT,
    speed: CATCHER_SPEED,
    y: CATCHER_Y,
  },
  item: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    baseSpeed: ITEM_BASE_SPEED,
  },
  rounds: ROUND_CONFIG,
  itemCosts: ITEM_COSTS,
  performance: {
    targetFps: TARGET_FPS,
    memoryLimitMb: MEMORY_LIMIT_MB,
    loadTimeTargetMs: LOAD_TIME_TARGET_MS,
  },
} as const;
