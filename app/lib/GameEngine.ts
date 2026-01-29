/**
 * Core game engine with requestAnimationFrame loop and fixed timestep physics
 *
 * Implements the game loop pattern:
 * - RAF for smooth rendering at display refresh rate
 * - Fixed timestep accumulator for deterministic physics
 * - Delta time capping to prevent spiral of death
 */

import type { GameState, FallingItem, GameEvent } from './types';
import {
  PHYSICS_DT,
  MAX_FRAME_TIME,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CATCHER_WIDTH,
  ROUND_CONFIG,
} from './constants';
import { findCollidingItems, isOffScreen } from './collision';
import { ItemSpawner } from './itemSpawner';
import { calculateRoundScore } from './scoreCalculator';
import {
  updatePowerUpEffects,
  getSpeedMultiplier,
  isTimeFrozen,
  applyPowerUpEffect,
  hasScoreMultiplier,
  getLockedSlot,
  POWER_UPS,
} from './powerUps';
import type { PowerUpType } from './types';

interface GameEngineOptions {
  initialState: GameState;
  onStateChange?: (state: GameState) => void;
  onGameEvent?: (event: GameEvent) => void;
}

export class GameEngine {
  // Private state
  private accumulator: number = 0;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private gameState: GameState;
  private onStateChange?: (state: GameState) => void;
  private onGameEvent?: (event: GameEvent) => void;
  private running: boolean = false;
  private itemSpawner: ItemSpawner | null = null;
  private gameTime: number = 0;
  private budgetWarningEmitted: boolean = false;
  private timerWarningEmitted: boolean = false;

  /**
   * Create a new GameEngine instance
   *
   * @param options - Configuration options
   * @param options.initialState - Initial game state
   * @param options.onStateChange - Callback invoked after each frame with updated state
   * @param options.onGameEvent - Callback invoked when game events occur
   */
  constructor(options: GameEngineOptions) {
    this.gameState = options.initialState;
    this.onStateChange = options.onStateChange;
    this.onGameEvent = options.onGameEvent;
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
   * Start a new round
   *
   * Resets all state for the specified round number
   *
   * @param roundNumber - Round number (1-5)
   */
  startRound(roundNumber: number): void {
    const roundConfig = ROUND_CONFIG[roundNumber - 1];

    // Reset catcher to center
    this.gameState.catcher.x = (CANVAS_WIDTH - CATCHER_WIDTH) / 2;
    this.gameState.catcher.velocityX = 0;

    // Clear items
    this.gameState.items = [];

    // Reset slots
    this.gameState.slots = [null, null, null, null, null];

    // Set budget and timer from round config
    this.gameState.budget = roundConfig.budget;
    this.gameState.timer = roundConfig.duration;

    // Set round number
    this.gameState.round = roundNumber;

    // Create new ItemSpawner
    this.itemSpawner = new ItemSpawner(roundNumber);

    // Reset power-ups
    this.gameState.activePowerUps = [];

    // Reset game time
    this.gameTime = 0;

    // Clear fail reason
    this.gameState.failReason = undefined;

    // Reset warning flags
    this.budgetWarningEmitted = false;
    this.timerWarningEmitted = false;

    // Set status to playing
    this.gameState.status = 'playing';
  }

  /**
   * Advance to next round
   *
   * Increments round number and starts the new round
   */
  nextRound(): void {
    this.gameState.round += 1;
    this.startRound(this.gameState.round);
  }

  /**
   * Get budget as percentage of initial budget
   *
   * @returns Budget percentage (0-100)
   */
  getBudgetPercent(): number {
    const initialBudget = ROUND_CONFIG[this.gameState.round - 1].budget;
    return (this.gameState.budget / initialBudget) * 100;
  }

  /**
   * Get timer in seconds
   *
   * @returns Timer value in seconds
   */
  getTimerSeconds(): number {
    return this.gameState.timer / 1000;
  }

  /**
   * Get count of filled slots
   *
   * @returns Number of filled slots
   */
  getFilledSlotCount(): number {
    return this.gameState.slots.filter((slot) => slot !== null).length;
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
   * Implements full game loop with collision, spawning, scoring, and power-ups
   *
   * @param dt - Fixed timestep in milliseconds
   */
  private updatePhysics(dt: number): void {
    const dtSeconds = dt / 1000; // Convert to seconds for velocity calculations

    // Only update physics when game is in playing state
    if (this.gameState.status !== 'playing') {
      return;
    }

    // Increment game time
    this.gameTime += dt;

    // ===== a) Update power-up durations =====
    this.gameState.activePowerUps = updatePowerUpEffects(this.gameState.activePowerUps, dt);
    const speedMultiplier = getSpeedMultiplier(this.gameState.activePowerUps);
    const timeFrozen = isTimeFrozen(this.gameState.activePowerUps);

    // ===== b) Spawn items =====
    if (this.itemSpawner) {
      const newItem = this.itemSpawner.update(this.gameTime, this.gameState.round);

      if (newItem) {
        // 26% chance to spawn power-up instead of regular item
        if (Math.random() < 0.26) {
          // Select random power-up weighted by drop rates
          const powerUpTypes = Object.keys(POWER_UPS) as PowerUpType[];
          const weights = powerUpTypes.map((type) => POWER_UPS[type].dropRate);
          const totalWeight = weights.reduce((sum, w) => sum + w, 0);

          let random = Math.random() * totalWeight;
          let selectedPowerUp: PowerUpType = 'slow_motion';

          for (let i = 0; i < powerUpTypes.length; i++) {
            random -= weights[i];
            if (random <= 0) {
              selectedPowerUp = powerUpTypes[i];
              break;
            }
          }

          // Convert regular item to power-up
          newItem.isPowerUp = true;
          newItem.powerUpType = selectedPowerUp;
        }

        this.gameState.items.push(newItem);
      }
    }

    // ===== c) Update item positions =====
    for (const item of this.gameState.items) {
      item.y += item.velocityY * speedMultiplier * dtSeconds;
    }

    // Update catcher position based on velocity
    const catcher = this.gameState.catcher;
    catcher.x += catcher.velocityX * dtSeconds;

    // Clamp catcher to screen bounds
    catcher.x = Math.max(0, Math.min(CANVAS_WIDTH - CATCHER_WIDTH, catcher.x));

    // ===== d) Check collisions =====
    const collidingItems = findCollidingItems(catcher, this.gameState.items);

    for (const item of collidingItems) {
      if (item.isPowerUp && item.powerUpType) {
        // Apply power-up effect
        applyPowerUpEffect(this.gameState, item.powerUpType);

        // Emit power-up activated event
        this.onGameEvent?.({
          type: 'power_up_activated',
          powerUp: item.powerUpType,
        });
      } else {
        // Regular item - check budget and fill slot
        if (this.gameState.budget - item.cost < 0) {
          // Budget bust!
          this.gameState.status = 'round_failed';
          this.gameState.failReason = 'bust';

          // Emit round failed event
          this.onGameEvent?.({
            type: 'round_failed',
            reason: 'bust',
          });

          return; // Stop processing this frame
        }

        // Deduct cost
        this.gameState.budget -= item.cost;

        // Find first empty slot
        const lockedSlot = getLockedSlot(this.gameState.activePowerUps);
        let slotIndex = -1;

        for (let i = 0; i < this.gameState.slots.length; i++) {
          if (this.gameState.slots[i] === null && i !== lockedSlot) {
            slotIndex = i;
            break;
          }
        }

        if (slotIndex !== -1) {
          // Apply score multiplier if active
          if (hasScoreMultiplier(this.gameState.activePowerUps)) {
            item.value *= 2;
            // Remove score multiplier effect (one-time use)
            this.gameState.activePowerUps = this.gameState.activePowerUps.filter(
              (effect) => effect.type !== 'score_multiplier'
            );
          }

          this.gameState.slots[slotIndex] = item;

          // Emit item caught event
          this.onGameEvent?.({
            type: 'item_caught',
            item,
            slotIndex,
          });
        }
      }
    }

    // Remove caught items from items array
    const caughtIds = new Set(collidingItems.map((item) => item.id));
    this.gameState.items = this.gameState.items.filter((item) => !caughtIds.has(item.id));

    // ===== e) Remove off-screen items =====
    this.gameState.items = this.gameState.items.filter(
      (item) => !isOffScreen(item, CANVAS_HEIGHT)
    );

    // ===== f) Check win/fail conditions =====
    const filledSlots = this.gameState.slots.filter((slot) => slot !== null).length;

    if (filledSlots === 5) {
      // All slots filled - round complete!
      const initialBudget = ROUND_CONFIG[this.gameState.round - 1].budget;
      const scoreResult = calculateRoundScore(
        this.gameState.slots,
        this.gameState.budget,
        initialBudget,
        this.gameState.timer,
        this.gameState.round
      );

      this.gameState.lastScore = scoreResult;
      this.gameState.totalScore += scoreResult.totalScore;

      if (this.gameState.round < 5) {
        this.gameState.status = 'round_complete';
      } else {
        this.gameState.status = 'game_over';
      }

      // Emit round complete event
      this.onGameEvent?.({
        type: 'round_complete',
        score: scoreResult,
      });

      // Emit combo events
      for (const combo of scoreResult.combos) {
        this.onGameEvent?.({
          type: 'combo_achieved',
          combo,
        });
      }

      return; // Stop processing this frame
    }

    // Check budget warning (20% remaining)
    const initialBudget = ROUND_CONFIG[this.gameState.round - 1].budget;
    const budgetPercent = (this.gameState.budget / initialBudget) * 100;
    if (budgetPercent <= 20 && !this.budgetWarningEmitted) {
      this.budgetWarningEmitted = true;
      this.onGameEvent?.({
        type: 'budget_warning',
      });
    }

    // Decrement timer (unless frozen)
    if (!timeFrozen) {
      this.gameState.timer = Math.max(0, this.gameState.timer - dt);
    }

    // Check timer warning (5 seconds remaining)
    if (this.gameState.timer <= 5000 && !this.timerWarningEmitted) {
      this.timerWarningEmitted = true;
      this.onGameEvent?.({
        type: 'timer_warning',
      });
    }

    // Check timeout
    if (this.gameState.timer <= 0 && filledSlots < 5) {
      // Timeout - calculate partial score
      const scoreResult = calculateRoundScore(
        this.gameState.slots,
        this.gameState.budget,
        initialBudget,
        this.gameState.timer,
        this.gameState.round,
        'timeout'
      );

      this.gameState.lastScore = scoreResult;
      this.gameState.totalScore += scoreResult.totalScore;
      this.gameState.status = 'round_failed';
      this.gameState.failReason = 'timeout';

      // Emit round failed event
      this.onGameEvent?.({
        type: 'round_failed',
        reason: 'timeout',
      });
    }
  }
}
