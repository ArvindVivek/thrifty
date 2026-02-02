'use client';

import { memo } from 'react';
import Image from 'next/image';
import { FallingItem as FallingItemType } from '@/app/lib/types';
import { CATEGORY_COLORS, ValorantCategory } from '@/app/lib/valorantItems';

/**
 * Power-up visual config with SVG images
 */
const POWER_UP_CONFIG: Record<string, { color: string; image: string; glow: string }> = {
  slow_motion: { color: 'bg-blue-600/90', image: '/assets/powerups/slow_motion.svg', glow: 'shadow-blue-400/60' },
  budget_boost: { color: 'bg-green-600/90', image: '/assets/powerups/budget_boost.svg', glow: 'shadow-green-400/60' },
  optimal_hint: { color: 'bg-yellow-600/90', image: '/assets/powerups/optimal_hint.svg', glow: 'shadow-yellow-400/60' },
  time_freeze: { color: 'bg-cyan-600/90', image: '/assets/powerups/time_freeze.svg', glow: 'shadow-cyan-400/60' },
  score_multiplier: { color: 'bg-purple-600/90', image: '/assets/powerups/score_multiplier.svg', glow: 'shadow-purple-400/60' },
  budget_drain: { color: 'bg-red-600/90', image: '/assets/powerups/budget_drain.svg', glow: 'shadow-red-400/60' },
  speed_up: { color: 'bg-orange-600/90', image: '/assets/powerups/speed_up.svg', glow: 'shadow-orange-400/60' },
  slot_lock: { color: 'bg-gray-600/90', image: '/assets/powerups/slot_lock.svg', glow: 'shadow-gray-400/60' },
  point_drain: { color: 'bg-pink-600/90', image: '/assets/powerups/point_drain.svg', glow: 'shadow-pink-400/60' },
};

interface FallingItemProps {
  item: FallingItemType;
  highlighted?: boolean;
}

/**
 * FallingItem - Renders falling Valorant items with weapon images
 *
 * Features:
 * - Actual weapon/shield images from Valorant
 * - Price label below item
 * - Power-up visual distinction with glow
 * - Optimal item highlight for hint power-up
 * - GPU-accelerated positioning
 */
export const FallingItem = memo(function FallingItem({ item, highlighted = false }: FallingItemProps) {
  const isPowerUp = item.isPowerUp ?? false;
  const powerUpConfig = isPowerUp && item.powerUpType ? POWER_UP_CONFIG[item.powerUpType] : null;
  const categoryColors = item.valorantCategory ? CATEGORY_COLORS[item.valorantCategory as ValorantCategory] : null;

  return (
    <div
      className={`absolute flex flex-col items-center ${highlighted ? 'z-20' : 'z-10'}`}
      style={{
        transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
        width: item.width,
        contain: 'layout style paint',
      }}
    >
      {/* Optimal item indicator */}
      {highlighted && (
        <div className="absolute -top-3 -right-1 w-6 h-6 animate-bounce drop-shadow-lg z-30">
          <Image
            src="/assets/powerups/optimal_star.svg"
            alt="Optimal"
            width={24}
            height={24}
            className="object-contain"
            unoptimized
          />
        </div>
      )}

      {/* Item container */}
      <div
        className={`
          relative flex items-center justify-center rounded-lg overflow-hidden
          ${isPowerUp
            ? `${powerUpConfig?.color} animate-pulse ring-2 ring-white/60 shadow-xl ${powerUpConfig?.glow}`
            : 'bg-black/40 backdrop-blur-sm border border-white/20'
          }
          ${highlighted ? 'ring-2 ring-warning ring-offset-1 ring-offset-background shadow-lg shadow-warning/40' : ''}
        `}
        style={{
          width: item.width,
          height: item.height,
        }}
      >
        {isPowerUp && powerUpConfig ? (
          // Power-up display with SVG image
          <Image
            src={powerUpConfig.image}
            alt={item.powerUpType || 'Power-up'}
            width={item.width - 8}
            height={item.height - 8}
            className="object-contain drop-shadow-lg"
            unoptimized
          />
        ) : item.image ? (
          // Valorant item with image
          <Image
            src={item.image}
            alt={item.itemName || 'Item'}
            width={item.width - 4}
            height={item.height - 4}
            className="object-contain drop-shadow-md"
            unoptimized
          />
        ) : (
          // Fallback for items without images
          <span className="text-xs font-bold text-white">{item.itemName || '?'}</span>
        )}
      </div>

      {/* Price label */}
      {!isPowerUp && (
        <div
          className={`
            mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md
            ${categoryColors ? `${categoryColors.bg} ${categoryColors.text} border ${categoryColors.border}` : 'bg-black/70 text-white'}
          `}
        >
          ${item.cost}
        </div>
      )}
    </div>
  );
});
