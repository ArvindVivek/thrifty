'use client';

/**
 * PowerUpTint - Visual overlay for active power-up effects
 *
 * Shows subtle screen tint when certain power-ups are active:
 * - Blue tint for slow motion (positive)
 * - Orange/red tint for speed up (negative)
 */

import { motion, AnimatePresence } from 'motion/react';
import { PowerUpEffect } from '@/app/lib/types';

interface PowerUpTintProps {
  activePowerUps: PowerUpEffect[];
}

export function PowerUpTint({ activePowerUps }: PowerUpTintProps) {
  const hasSlowMotion = activePowerUps.some(p => p.type === 'slow_motion' && p.active);
  const hasSpeedUp = activePowerUps.some(p => p.type === 'speed_up' && p.active);
  const hasTimeFreeze = activePowerUps.some(p => p.type === 'time_freeze' && p.active);
  const hasBudgetDrain = activePowerUps.some(p => p.type === 'budget_drain' && p.active);

  return (
    <AnimatePresence>
      {/* Slow motion - blue tint */}
      {hasSlowMotion && (
        <motion.div
          key="slow-tint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-c9-blue pointer-events-none z-10"
        />
      )}

      {/* Time freeze - stronger blue tint with subtle pulse */}
      {hasTimeFreeze && (
        <motion.div
          key="freeze-tint"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.2, 0.15] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 bg-c9-blue pointer-events-none z-10"
        />
      )}

      {/* Speed up - warning orange tint */}
      {hasSpeedUp && (
        <motion.div
          key="speed-tint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-warning pointer-events-none z-10"
        />
      )}

      {/* Budget drain - danger red tint */}
      {hasBudgetDrain && (
        <motion.div
          key="drain-tint"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.08, 0.12, 0.08] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute inset-0 bg-val-red pointer-events-none z-10"
        />
      )}
    </AnimatePresence>
  );
}
