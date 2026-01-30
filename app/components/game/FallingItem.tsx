import { memo } from 'react';
import { FallingItem as FallingItemType } from '@/app/lib/types';
import { Badge } from '@/components/ui/badge';

/**
 * Category color mapping for item backgrounds
 */
const CATEGORY_COLORS = {
  weapon: 'bg-red-400',
  shield: 'bg-teal-400',
  utility: 'bg-yellow-400',
  premium: 'bg-purple-500',
  bonus: 'bg-green-500',
} as const;

/**
 * Power-up type emoji/icon mapping
 */
const POWER_UP_ICONS = {
  slow_motion: '🐌',
  budget_boost: '💰',
  optimal_hint: '💡',
  time_freeze: '⏸️',
  score_multiplier: '✨',
  budget_drain: '💸',
  speed_up: '⚡',
  slot_lock: '🔒',
  point_drain: '📉',
} as const;

interface FallingItemProps {
  item: FallingItemType;
  highlighted?: boolean;
}

/**
 * FallingItem component renders a falling game item with category colors and cost display.
 * Uses CSS transform (translate3d) for GPU-accelerated positioning.
 * Memoized to prevent unnecessary re-renders during game loop.
 */
export const FallingItem = memo(function FallingItem({ item, highlighted = false }: FallingItemProps) {
  const bgColor = CATEGORY_COLORS[item.category];
  const isPowerUp = item.isPowerUp ?? false;
  const powerUpIcon = isPowerUp && item.powerUpType ? POWER_UP_ICONS[item.powerUpType] : null;

  return (
    <div
      className={`absolute flex items-center justify-center rounded-lg ${bgColor} ${
        isPowerUp ? 'animate-pulse ring-2 ring-white' : ''
      } ${highlighted ? 'ring-4 ring-yellow-400 ring-opacity-100 shadow-lg shadow-yellow-400/50' : ''}`}
      style={{
        transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
        width: item.width,
        height: item.height,
        contain: 'layout style paint',
      }}
    >
      {highlighted && (
        <span className="absolute -top-2 -right-2 text-xl animate-bounce">⭐</span>
      )}
      {isPowerUp && powerUpIcon ? (
        <span className="text-2xl">{powerUpIcon}</span>
      ) : (
        <Badge variant="default" className="text-xs font-bold">
          ${item.cost}
        </Badge>
      )}
    </div>
  );
});
