/**
 * Penny the piggy bank: one short line for what just happened in the game.
 *
 * Replaces the hackathon build's mascot (JetBrains' Kodee, not ours to ship). Pure data and
 * pure functions; hooks/usePenny.ts times the lines on screen.
 */

import type { GameEvent, PowerUpType } from './types';
import { POWER_UPS } from './powerUps';

export type PennyTone = 'neutral' | 'good' | 'bad';

export interface PennyLine {
  text: string;
  tone: PennyTone;
  /** Set when the line is about a power-up, so the bubble can show its icon. */
  powerUp?: PowerUpType;
}

/** Items at or above this price get "Big spender..." instead of "That's thrifty!". */
export const EXPENSIVE_THRESHOLD = 1000;

/** A total at or above this is a "good" game for Penny (B rank and up). */
export const GOOD_GAME_SCORE = 25000;

/** What each power-up does, in one line (also used by the rules panels). */
export const POWER_UP_EFFECTS: Record<PowerUpType, string> = {
  slow_motion: 'Items fall at half speed for 5\u00a0s',
  budget_boost: '+$500 to spend',
  optimal_hint: 'Stars on good buys for 4\u00a0s',
  time_freeze: 'The clock stops for 3\u00a0s',
  score_multiplier: 'Your next catch scores double',
  budget_drain: '-$300 from your budget',
  speed_up: 'Items fall 50% faster for 4\u00a0s',
  slot_lock: 'One cart slot locks for 5\u00a0s',
  point_drain: '-200 points from your total',
};

/** Friendly names (the engine's names are a little terse). */
export const POWER_UP_NAMES: Record<PowerUpType, string> = {
  slow_motion: 'Slow Motion',
  budget_boost: 'Budget Boost',
  optimal_hint: 'Best Buy Hint',
  time_freeze: 'Time Freeze',
  score_multiplier: '2x Score',
  budget_drain: 'Budget Drain',
  speed_up: 'Speed Up',
  slot_lock: 'Slot Lock',
  point_drain: 'Point Drain',
};

export const PENNY = {
  roundStart: { text: "Let's shop!", tone: 'neutral' },
  fourSlots: { text: 'One more!', tone: 'neutral' },
  gameOverGood: { text: 'Amazing work!', tone: 'good' },
  gameWon: { text: 'You cleared the whole shop!', tone: 'good' },
  gameOverBad: { text: 'Try again!', tone: 'neutral' },
} as const satisfies Record<string, PennyLine>;

/** Penny's line for a game event, or null when she stays quiet. */
export function pennyLineFor(event: GameEvent): PennyLine | null {
  switch (event.type) {
    case 'item_caught':
      return event.item.cost >= EXPENSIVE_THRESHOLD
        ? { text: 'Big spender...', tone: 'neutral' }
        : { text: "That's thrifty!", tone: 'good' };
    case 'power_up_activated': {
      const good = POWER_UPS[event.powerUp].isPositive;
      return {
        text: `${POWER_UP_NAMES[event.powerUp]}: ${POWER_UP_EFFECTS[event.powerUp]}`,
        tone: good ? 'good' : 'bad',
        powerUp: event.powerUp,
      };
    }
    case 'budget_warning':
      return { text: 'Watch the budget!', tone: 'bad' };
    case 'timer_warning':
      return { text: 'Hurry up!', tone: 'bad' };
    case 'round_complete':
      return event.score.combos.some((c) => c.name === 'Perfect Budget')
        ? { text: 'Perfect budget!', tone: 'good' }
        : { text: 'Cart full!', tone: 'good' };
    case 'round_failed':
      return event.reason === 'bust'
        ? { text: 'Over budget!', tone: 'bad' }
        : { text: 'Out of time...', tone: 'bad' };
    case 'combo_achieved':
      return null; // The round-complete screen lists combos
  }
}

/** Penny's verdict on a finished game: a big score, a win, or another go. */
export function pennyVerdict(totalScore: number, won: boolean): PennyLine {
  if (totalScore >= GOOD_GAME_SCORE) return PENNY.gameOverGood;
  return won ? PENNY.gameWon : PENNY.gameOverBad;
}
