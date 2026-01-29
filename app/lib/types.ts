/**
 * Core game state type definitions
 *
 * All game entities and state structures for THRIFTY.
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
 * Item category types
 */
export type ItemCategory = 'weapon' | 'shield' | 'utility' | 'premium' | 'bonus';

/**
 * Falling item entity
 */
export interface FallingItem extends AABB {
  id: string;
  category: ItemCategory;
  cost: number;
  value: number;
  velocityY: number;
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
export type GameStatus = 'menu' | 'playing' | 'round_complete' | 'round_failed' | 'game_over';

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
}
