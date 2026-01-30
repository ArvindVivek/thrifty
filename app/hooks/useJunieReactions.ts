'use client';

import { useState, useCallback } from 'react';
import { GameEvent } from '@/app/lib/types';
import { JunieReactionType } from '@/app/components/mascot';

// Cost threshold for "expensive" vs "cheap" items
const EXPENSIVE_THRESHOLD = 1000;

/**
 * Hook that manages Junie mascot reactions based on game events.
 *
 * Returns current reaction state and event handler to pass to GameProvider.
 */
export function useJunieReactions() {
  const [reaction, setReaction] = useState<JunieReactionType>('idle');

  /**
   * Map a GameEvent to a Junie reaction
   */
  const handleGameEvent = useCallback((event: GameEvent) => {
    switch (event.type) {
      case 'item_caught':
        // Determine if cheap or expensive catch
        if (event.item.isPowerUp) {
          setReaction('catch_powerup');
        } else if (event.item.cost >= EXPENSIVE_THRESHOLD) {
          setReaction('catch_expensive');
        } else {
          setReaction('catch_cheap');
        }
        break;

      case 'power_up_activated':
        // Check if negative power-up
        const negativeTypes = ['budget_drain', 'speed_up', 'slot_lock', 'point_drain'];
        if (negativeTypes.includes(event.powerUp)) {
          setReaction('hit_negative');
        } else {
          setReaction('catch_powerup');
        }
        break;

      case 'budget_warning':
        setReaction('budget_warning');
        break;

      case 'timer_warning':
        setReaction('time_warning');
        break;

      case 'round_complete':
        // Check for perfect budget combo
        const hasPerfect = event.score.combos.some(c => c.name === 'Perfect Budget');
        if (hasPerfect) {
          setReaction('perfect_budget');
        } else {
          setReaction('round_complete');
        }
        break;

      case 'round_failed':
        if (event.reason === 'bust') {
          setReaction('budget_bust');
        } else {
          setReaction('timeout');
        }
        break;

      case 'combo_achieved':
        // Already handled in round_complete
        break;
    }

    // Reset to idle after reaction displays (1.5s as per Junie component)
    // The Junie component handles its own timing, but we reset state
    // after a delay to allow new reactions
    setTimeout(() => setReaction('idle'), 2000);
  }, []);

  /**
   * Trigger round start reaction (not a GameEvent, manual trigger)
   */
  const triggerRoundStart = useCallback(() => {
    setReaction('round_start');
    setTimeout(() => setReaction('idle'), 2000);
  }, []);

  /**
   * Trigger 4 slots filled reaction
   */
  const triggerFourSlots = useCallback(() => {
    setReaction('four_slots_filled');
    setTimeout(() => setReaction('idle'), 2000);
  }, []);

  /**
   * Trigger game over reaction based on score
   */
  const triggerGameOver = useCallback((totalScore: number) => {
    // Threshold for "good" score (B rank or above = 25000+)
    if (totalScore >= 25000) {
      setReaction('game_over_good');
    } else {
      setReaction('game_over_bad');
    }
    setTimeout(() => setReaction('idle'), 2000);
  }, []);

  return {
    reaction,
    handleGameEvent,
    triggerRoundStart,
    triggerFourSlots,
    triggerGameOver,
  };
}
