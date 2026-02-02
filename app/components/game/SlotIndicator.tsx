'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { FallingItem } from '@/app/lib/types';
import { CATEGORY_COLORS, ValorantCategory } from '@/app/lib/valorantItems';

interface SlotIndicatorProps {
  slot: FallingItem | null;
  index: number;
  locked?: boolean;
}

/**
 * Player position names for roster feel
 */
const POSITION_NAMES = ['Duelist', 'Sentinel', 'Controller', 'Initiator', 'Flex'];

/**
 * SlotIndicator - Shows equipment slot as loadout inventory
 *
 * Features:
 * - Shows actual weapon/item image when filled
 * - Empty slots show position name
 * - Locked state with visual indicator
 * - Animation on fill
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
  const categoryColors = slot?.valorantCategory
    ? CATEGORY_COLORS[slot.valorantCategory as ValorantCategory]
    : null;

  return (
    <motion.div
      className={`
        w-20 h-16 rounded-lg flex flex-col items-center justify-center
        font-bold text-xs border-2 relative overflow-hidden
        ${filled
          ? categoryColors
            ? `${categoryColors.bg} ${categoryColors.border}`
            : 'bg-secondary border-border'
          : locked
          ? 'bg-val-red/10 border-val-red/50'
          : 'bg-secondary/50 border-border/50'
        }
      `}
      animate={justFilled ? {
        scale: [1, 1.1, 1],
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
              '0 0 20px 4px rgba(255,255,255,0.5)',
              '0 0 0 0 rgba(255,255,255,0)'
            ]
          }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Lock icon for locked slots */}
      {locked && !filled && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Image
            src="/assets/powerups/slot_lock.svg"
            alt="Locked"
            width={32}
            height={32}
            className="object-contain opacity-80"
            unoptimized
          />
        </div>
      )}

      {/* Slot content */}
      {filled && slot ? (
        <div className="flex flex-col items-center gap-0.5">
          {/* Item image */}
          {slot.image ? (
            <div className="w-16 h-9 flex items-center justify-center">
              <Image
                src={slot.image}
                alt={slot.itemName || 'Item'}
                width={60}
                height={32}
                className="object-contain drop-shadow-md"
                unoptimized
              />
            </div>
          ) : (
            <span className="text-white text-xs">{slot.itemName}</span>
          )}
          {/* Item name */}
          <span className={`text-[9px] font-medium truncate max-w-full px-1 ${categoryColors?.text || 'text-white'}`}>
            {slot.itemName}
          </span>
        </div>
      ) : locked ? (
        <span className="text-val-red/70 text-[10px] mt-5">Locked</span>
      ) : (
        <div className="flex flex-col items-center gap-1 opacity-50">
          <div className="w-10 h-6 border border-dashed border-muted-foreground/30 rounded flex items-center justify-center">
            <span className="text-muted-foreground/50 text-[10px]">?</span>
          </div>
          <span className="text-muted-foreground text-[9px]">{POSITION_NAMES[index]}</span>
        </div>
      )}
    </motion.div>
  );
}
