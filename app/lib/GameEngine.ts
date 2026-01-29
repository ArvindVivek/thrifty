/**
 * Core game engine with requestAnimationFrame loop and fixed timestep physics
 *
 * Implements the game loop pattern:
 * - RAF for smooth rendering at display refresh rate
 * - Fixed timestep accumulator for deterministic physics
 * - Delta time capping to prevent spiral of death
 */

import type { GameState, FallingItem } from './types';
import { PHYSICS_DT, MAX_FRAME_TIME } from './constants';

interface GameEngineOptions {
  initialState: GameState;
  onStateChange?: (state: GameState) => void;
}

export class GameEngine {
  // Private state
  private accumulator: number = 0;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private gameState: GameState;
  private onStateChange?: (state: GameState) => void;
  private running: boolean = false;

  /**
   * Create a new GameEngine instance
   *
   * @param options - Configuration options
   * @param options.initialState - Initial game state
   * @param options.onStateChange - Callback invoked after each frame with updated state
   */
  constructor(options: GameEngineOptions) {
    this.gameState = options.initialState;
    this.onStateChange = options.onStateChange;
  }

  /**
   * Start the game loop
   *
   * Initializes timing and begins the requestAnimationFrame loop
   */
  start(): void {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  /**
   * Stop the game loop
   *
   * Cancels the requestAnimationFrame and halts all updates
   */
  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Get current game state (read-only access)
   *
   * @returns Current game state
   */
  getState(): GameState {
    return this.gameState;
  }

  /**
   * Check if engine is currently running
   *
   * @returns True if game loop is active
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Main game loop
   *
   * Called by requestAnimationFrame. Implements fixed timestep with accumulator
   * to ensure deterministic physics updates regardless of frame rate.
   *
   * @param currentTime - High-resolution timestamp from RAF
   */
  private loop = (currentTime: number): void => {
    if (!this.running) return;

    let deltaTime = currentTime - this.lastTime;

    // Cap delta time to prevent spiral of death after tab focus loss
    if (deltaTime > MAX_FRAME_TIME) {
      deltaTime = MAX_FRAME_TIME;
    }

    this.lastTime = currentTime;
    this.accumulator += deltaTime;

    // Fixed timestep physics updates
    // Run physics at consistent PHYSICS_DT intervals regardless of frame rate
    while (this.accumulator >= PHYSICS_DT) {
      this.updatePhysics(PHYSICS_DT);
      this.accumulator -= PHYSICS_DT;
    }

    // Notify React of state changes (for rendering)
    this.onStateChange?.(this.gameState);

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Update physics simulation
   *
   * Called at fixed PHYSICS_DT intervals (16.67ms for 60 FPS)
   * Placeholder implementation - will be expanded in Phase 2
   *
   * @param dt - Fixed timestep in milliseconds
   */
  private updatePhysics(dt: number): void {
    const dtSeconds = dt / 1000; // Convert to seconds for velocity calculations

    // Only update physics when game is in playing state
    if (this.gameState.status !== 'playing') {
      return;
    }

    // Update catcher position based on velocity
    // (Input handling will be added in Phase 4)
    const catcher = this.gameState.catcher;
    catcher.x += catcher.velocityX * dtSeconds;

    // TODO (Phase 2): Add catcher bounds clamping
    // TODO (Phase 2): Add screen edge collision

    // Update falling item positions
    this.gameState.items = this.gameState.items.map((item) => {
      return {
        ...item,
        y: item.y + item.velocityY * dtSeconds,
      };
    });

    // TODO (Phase 2): Add item collision detection with catcher
    // TODO (Phase 2): Add item removal when off-screen
    // TODO (Phase 2): Add slot filling logic

    // Decrement timer
    this.gameState.timer = Math.max(0, this.gameState.timer - dt);

    // TODO (Phase 2): Add timer expiration handling
    // TODO (Phase 2): Add round completion logic
    // TODO (Phase 2): Add game over conditions
  }
}
