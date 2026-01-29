/**
 * Power-up definitions and effect system
 *
 * Implements the 9 power-ups from REQUIREMENTS.md:
 * - 5 positive effects (Slow Motion, Budget Boost, Optimal Hint, Time Freeze, Score Multiplier)
 * - 4 negative effects (Budget Drain, Speed Up, Slot Lock, Point Drain)
 */

import type { GameState, PowerUpType, PowerUpEffect } from './types';

/**
 * Power-up configuration
 */
export interface PowerUpDefinition {
  type: PowerUpType;
  name: string;
  duration: number; // milliseconds (0 for instant effects)
  dropRate: number; // percentage (0-100)
  isPositive: boolean;
}

/**
 * All power-up definitions from REQUIREMENTS.md
 */
export const POWER_UPS: Record<PowerUpType, PowerUpDefinition> = {
  slow_motion: {
    type: 'slow_motion',
    name: 'Slow Motion',
    duration: 5000,
    dropRate: 4,
    isPositive: true,
  },
  budget_boost: {
    type: 'budget_boost',
    name: 'Budget Boost',
    duration: 0, // instant
    dropRate: 3,
    isPositive: true,
  },
  optimal_hint: {
    type: 'optimal_hint',
    name: 'Optimal Hint',
    duration: 4000,
    dropRate: 3,
    isPositive: true,
  },
  time_freeze: {
    type: 'time_freeze',
    name: 'Time Freeze',
    duration: 3000,
    dropRate: 2,
    isPositive: true,
  },
  score_multiplier: {
    type: 'score_multiplier',
    name: 'Score Multiplier',
    duration: 0, // instant, applied to next catch
    dropRate: 3,
    isPositive: true,
  },
  budget_drain: {
    type: 'budget_drain',
    name: 'Budget Drain',
    duration: 0, // instant
    dropRate: 4,
    isPositive: false,
  },
  speed_up: {
    type: 'speed_up',
    name: 'Speed Up',
    duration: 4000,
    dropRate: 3,
    isPositive: false,
  },
  slot_lock: {
    type: 'slot_lock',
    name: 'Slot Lock',
    duration: 5000,
    dropRate: 2,
    isPositive: false,
  },
  point_drain: {
    type: 'point_drain',
    name: 'Point Drain',
    duration: 0, // instant
    dropRate: 2,
    isPositive: false,
  },
};

/**
 * Apply a power-up effect to the game state
 *
 * Handles both instant effects (Budget Boost, Budget Drain, Point Drain)
 * and duration-based effects (Slow Motion, Speed Up, Time Freeze, etc.)
 *
 * @param state - Current game state (will be mutated)
 * @param powerUpType - Type of power-up to apply
 * @returns Updated game state
 */
export function applyPowerUpEffect(state: GameState, powerUpType: PowerUpType): GameState {
  const powerUp = POWER_UPS[powerUpType];

  // Handle instant effects
  switch (powerUpType) {
    case 'budget_boost':
      state.budget += 500;
      break;

    case 'budget_drain':
      state.budget = Math.max(0, state.budget - 300);
      break;

    case 'point_drain':
      state.totalScore = Math.max(0, state.totalScore - 200);
      break;

    case 'slow_motion':
    case 'speed_up':
    case 'optimal_hint':
    case 'time_freeze':
    case 'score_multiplier':
    case 'slot_lock':
      // Duration-based effects: add to active effects
      state.activePowerUps.push({
        type: powerUpType,
        duration: powerUp.duration,
        active: true,
      });
      break;
  }

  return state;
}

/**
 * Update all active power-up effects, decrementing duration
 *
 * @param effects - Array of active power-up effects
 * @param deltaTime - Time elapsed in milliseconds
 * @returns Array of still-active effects (expired ones removed)
 */
export function updatePowerUpEffects(
  effects: PowerUpEffect[],
  deltaTime: number
): PowerUpEffect[] {
  return effects
    .map((effect) => ({
      ...effect,
      duration: effect.duration - deltaTime,
    }))
    .filter((effect) => effect.duration > 0);
}

/**
 * Calculate speed multiplier from active power-ups
 *
 * - Slow Motion: 0.5x speed
 * - Speed Up: 1.5x speed
 * - Multiple effects stack multiplicatively
 *
 * @param effects - Array of active power-up effects
 * @returns Combined speed multiplier
 */
export function getSpeedMultiplier(effects: PowerUpEffect[]): number {
  let multiplier = 1.0;

  for (const effect of effects) {
    if (effect.type === 'slow_motion') {
      multiplier *= 0.5;
    } else if (effect.type === 'speed_up') {
      multiplier *= 1.5;
    }
  }

  return multiplier;
}

/**
 * Check if time freeze is active
 *
 * @param effects - Array of active power-up effects
 * @returns True if timer should be frozen
 */
export function isTimeFrozen(effects: PowerUpEffect[]): boolean {
  return effects.some((effect) => effect.type === 'time_freeze');
}

/**
 * Check if score multiplier is active
 *
 * @param effects - Array of active power-up effects
 * @returns True if next catch should have 2x score
 */
export function hasScoreMultiplier(effects: PowerUpEffect[]): boolean {
  return effects.some((effect) => effect.type === 'score_multiplier');
}

/**
 * Get locked slot index (if any)
 *
 * @param effects - Array of active power-up effects
 * @returns Slot index that is locked, or -1 if none
 */
export function getLockedSlot(effects: PowerUpEffect[]): number {
  const slotLock = effects.find((effect) => effect.type === 'slot_lock');
  return slotLock ? (slotLock.value ?? -1) : -1;
}
