/**
 * Core game state type definitions
 *
 * All game entities and state structures for Thrifty.
 */

/**
 * Basic 2D position/velocity vector
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Axis-aligned bounding box for collision detection
 */
export interface AABB {
  x: number; // top-left x
  y: number; // top-left y
  width: number;
  height: number;
}

/**
 * Shop aisles. Combos count them: Balanced needs 3+ different aisles, Specialist 4+ from one.
 */
export type ItemCategory = 'snack' | 'style' | 'home' | 'tech';

/**
 * Power-up types
 */
export type PowerUpType =
  | 'slow_motion'
  | 'budget_boost'
  | 'optimal_hint'
  | 'time_freeze'
  | 'score_multiplier'
  | 'budget_drain'
  | 'speed_up'
  | 'slot_lock'
  | 'point_drain';

/**
 * Active power-up effect
 */
export interface PowerUpEffect {
  type: PowerUpType;
  duration: number; // milliseconds remaining
  value?: number; // optional value for instant effects
  active: boolean;
}

/**
 * Falling item entity
 */
export interface FallingItem extends AABB {
  id: string;
  category: ItemCategory;
  cost: number;
  value: number;
  velocityY: number;
  isPowerUp?: boolean; // true if this is a power-up instead of regular item
  powerUpType?: PowerUpType; // type of power-up if isPowerUp is true
  itemId?: string; // catalog id (e.g. 'laptop')
  itemName?: string; // display name (e.g. 'Laptop')
}

/**
 * Player-controlled catcher entity
 */
export interface Catcher extends AABB {
  velocityX: number;
}

/**
 * Game state machine states
 */
export type GameStatus = 'menu' | 'playing' | 'round_complete' | 'game_over';

/**
 * Complete game state
 */
export interface GameState {
  catcher: Catcher;
  items: FallingItem[];
  slots: (FallingItem | null)[]; // length 5
  budget: number;
  timer: number; // milliseconds remaining
  round: number;
  score: number;
  status: GameStatus;
  activePowerUps: PowerUpEffect[];
  lastScore?: import('./scoreCalculator').ScoreResult;
  totalScore: number;
  failReason?: 'bust' | 'timeout';
  /** Milliseconds of actual play this game (only while a round is running). */
  playTimeMs: number;
}

/**
 * Input state interface for game engine to query keyboard/touch state
 *
 * This interface allows the game engine to poll input state without
 * coupling to specific input implementations (keyboard, touch).
 */
export interface InputState {
  isKeyDown: (key: string) => boolean;
  /** Where a finger or pointer wants the catcher's centre, in play-area pixels; null when idle. */
  targetX?: () => number | null;
}

/**
 * Game events for UI integration
 */
export type GameEvent =
  | { type: 'item_caught'; item: FallingItem; slotIndex: number }
  | { type: 'power_up_activated'; powerUp: PowerUpType }
  | { type: 'budget_warning' }
  | { type: 'round_complete'; score: import('./scoreCalculator').ScoreResult }
  | { type: 'round_failed'; reason: 'bust' | 'timeout' }
  | { type: 'combo_achieved'; combo: import('./scoreCalculator').ComboBonus }
  | { type: 'timer_warning' };
