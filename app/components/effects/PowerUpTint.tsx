'use client';

import { motion, AnimatePresence } from 'motion/react';
import { PowerUpEffect } from '@/app/lib/types';

interface PowerUpTintProps {
  activePowerUps: PowerUpEffect[];
}

export function PowerUpTint({ activePowerUps }: PowerUpTintProps) {
  const hasSlowMotion = activePowerUps.some(p => p.type === 'slow_motion' && p.active);
  const hasSpeedUp = activePowerUps.some(p => p.type === 'speed_up' && p.active);

  return (
    <AnimatePresence>
      {hasSlowMotion && (
        <motion.div
          key="slow-tint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-blue-500 pointer-events-none z-10"
        />
      )}
      {hasSpeedUp && (
        <motion.div
          key="speed-tint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-orange-500 pointer-events-none z-10"
        />
      )}
    </AnimatePresence>
  );
}
