'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FallingItem } from '@/app/lib/types';

interface SlotIndicatorProps {
  slot: FallingItem | null;
  index: number;
  locked?: boolean;
}

/**
 * Category colors for filled slots
 */
const CATEGORY_STYLES = {
  weapon: 'bg-cat-weapon border-cat-weapon/60',
  shield: 'bg-cat-shield border-cat-shield/60',
  utility: 'bg-cat-utility border-cat-utility/60',
  premium: 'bg-cat-premium border-cat-premium/60',
  bonus: 'bg-cat-bonus border-cat-bonus/60',
} as const;

/**
 * SlotIndicator - Shows equipment slot status (P1-P5)
 *
 * Features:
 * - Empty, filled, and locked states
 * - Category-colored when filled
 * - Spring animation on fill
 * - Locked state with visual indicator
 */
export function SlotIndicator({ slot, index, locked = false }: SlotIndicatorProps) {
  const [justFilled, setJustFilled] = useState(false);
  const prevSlotRef = useRef<FallingItem | null>(null);

  // Detect when slot becomes filled
  useEffect(() => {
    if (slot && !prevSlotRef.current) {
      setJustFilled(true);
      const timer = setTimeout(() => setJustFilled(false), 500);
      return () => clearTimeout(timer);
    }
    prevSlotRef.current = slot;
  }, [slot]);

  const filled = slot !== null;
  const categoryStyle = slot ? CATEGORY_STYLES[slot.category] : '';

  return (
    <motion.div
      className={`
        w-14 h-14 rounded-lg flex items-center justify-center
        font-bold text-sm border-2 relative transition-colors
        ${filled
          ? categoryStyle
          : locked
          ? 'bg-val-red/10 border-val-red/50'
          : 'bg-secondary border-border'
        }
      `}
      animate={justFilled ? {
        scale: [1, 1.15, 1],
      } : { scale: 1 }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
      }}
    >
      {/* Glow effect on fill */}
      {justFilled && (
        <motion.div
          className="absolute inset-0 rounded-lg"
          initial={{ boxShadow: '0 0 0 0 rgba(255,255,255,0)' }}
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(255,255,255,0)',
              '0 0 15px 3px rgba(255,255,255,0.4)',
              '0 0 0 0 rgba(255,255,255,0)'
            ]
          }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Lock icon for locked slots */}
      {locked && !filled && (
        <span className="absolute text-base">🔒</span>
      )}

      {/* Slot label */}
      {filled ? (
        <span className="text-white drop-shadow-md font-semibold">P{index + 1}</span>
      ) : locked ? (
        <span className="text-val-red/70 text-xs mt-6">Locked</span>
      ) : (
        <span className="text-muted-foreground">P{index + 1}</span>
      )}
    </motion.div>
  );
}
