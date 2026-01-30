'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FallingItem } from '@/app/lib/types';

interface CatchAnimationProps {
  item: FallingItem | null;
  fromPosition: { x: number; y: number } | null;
  toSlotIndex: number | null;
  onComplete: () => void;
}

// Slot positions relative to equipment panel (approximate)
const SLOT_POSITIONS = [
  { x: 50, y: 50 },   // Slot 0
  { x: 110, y: 50 },  // Slot 1
  { x: 170, y: 50 },  // Slot 2
  { x: 230, y: 50 },  // Slot 3
  { x: 290, y: 50 },  // Slot 4
];

// Category colors for the flying item
const CATEGORY_COLORS = {
  weapon: 'bg-red-500',
  shield: 'bg-teal-500',
  utility: 'bg-yellow-500',
  premium: 'bg-purple-500',
  bonus: 'bg-green-500',
};

/**
 * Animates a caught item flying from catch position to its equipment slot.
 * Shows a ghost of the item that arcs towards the slot panel.
 */
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
  const colorClass = CATEGORY_COLORS[item.category] || 'bg-gray-500';

  return (
    <AnimatePresence>
      <motion.div
        key={`catch-${item.id}`}
        className={`fixed w-8 h-8 rounded-lg ${colorClass} opacity-80 z-50 flex items-center justify-center text-white text-xs font-bold shadow-lg`}
        initial={{
          x: fromPosition.x,
          y: fromPosition.y,
          scale: 1,
          opacity: 1,
        }}
        animate={{
          // Arc towards top-right where slots are displayed
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
