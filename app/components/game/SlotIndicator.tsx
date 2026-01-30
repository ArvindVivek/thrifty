'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FallingItem } from '@/app/lib/types';

interface SlotIndicatorProps {
  slot: FallingItem | null;
  index: number;
  locked?: boolean;
}

// Category colors matching FallingItem
const CATEGORY_COLORS = {
  weapon: 'bg-red-500',
  shield: 'bg-teal-500',
  utility: 'bg-yellow-500',
  premium: 'bg-purple-500',
  bonus: 'bg-green-500',
};

/**
 * Animated slot indicator that shows P1-P5 slots.
 * Animates with scale and glow when a slot gets filled.
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
  const colorClass = slot ? CATEGORY_COLORS[slot.category] : (locked ? 'bg-red-900' : 'bg-gray-700');

  return (
    <motion.div
      className={`
        w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm
        border-2 transition-colors relative
        ${filled ? `${colorClass} border-white/50` : (locked ? 'border-red-500' : 'border-gray-600')}
        ${justFilled ? 'ring-2 ring-white ring-opacity-75' : ''}
      `}
      animate={justFilled ? {
        scale: [1, 1.2, 1],
        boxShadow: [
          '0 0 0 0 rgba(255,255,255,0)',
          '0 0 20px 5px rgba(255,255,255,0.5)',
          '0 0 0 0 rgba(255,255,255,0)'
        ]
      } : { scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {locked && !filled && (
        <span className="absolute text-lg">🔒</span>
      )}
      {filled ? (
        <span className="text-white drop-shadow">P{index + 1}</span>
      ) : locked ? (
        <span className="text-red-400 text-xs mt-5">Locked</span>
      ) : (
        <span className="text-gray-500">P{index + 1}</span>
      )}
    </motion.div>
  );
}
