'use client';

/**
 * CatchAnimation - Animates caught items flying to equipment slots
 *
 * Creates a ghost of the caught item that arcs from the catch
 * position to the target equipment slot.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FallingItem } from '@/app/lib/types';

interface CatchAnimationProps {
  item: FallingItem | null;
  fromPosition: { x: number; y: number } | null;
  toSlotIndex: number | null;
  onComplete: () => void;
}

// Slot positions relative to equipment panel
const SLOT_POSITIONS = [
  { x: 50, y: 50 },
  { x: 110, y: 50 },
  { x: 170, y: 50 },
  { x: 230, y: 50 },
  { x: 290, y: 50 },
];

// Category colors using the design system
const CATEGORY_COLORS = {
  weapon: 'bg-cat-weapon',
  shield: 'bg-cat-shield',
  utility: 'bg-cat-utility',
  premium: 'bg-cat-premium',
  bonus: 'bg-cat-bonus',
} as const;

export function CatchAnimation({
  item,
  fromPosition,
  toSlotIndex,
  onComplete,
}: CatchAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (item && fromPosition && toSlotIndex !== null) {
      setIsAnimating(true);
    }
  }, [item, fromPosition, toSlotIndex]);

  if (!item || !fromPosition || toSlotIndex === null || !isAnimating) {
    return null;
  }

  const targetSlot = SLOT_POSITIONS[toSlotIndex] || SLOT_POSITIONS[0];
  const colorClass = CATEGORY_COLORS[item.category] || 'bg-muted';

  return (
    <AnimatePresence>
      <motion.div
        key={`catch-${item.id}`}
        className={`
          fixed w-8 h-8 rounded-lg ${colorClass}
          opacity-80 z-50 flex items-center justify-center
          text-white text-xs font-bold shadow-lg
        `}
        initial={{
          x: fromPosition.x,
          y: fromPosition.y,
          scale: 1,
          opacity: 1,
        }}
        animate={{
          x: [fromPosition.x, fromPosition.x + 100, window.innerWidth - 200 + targetSlot.x],
          y: [fromPosition.y, fromPosition.y - 100, 100 + targetSlot.y],
          scale: [1, 1.2, 0.5],
          opacity: [1, 1, 0],
        }}
        transition={{
          duration: 0.4,
          ease: 'easeOut',
        }}
        onAnimationComplete={() => {
          setIsAnimating(false);
          onComplete();
        }}
      >
        P{toSlotIndex + 1}
      </motion.div>
    </AnimatePresence>
  );
}
