import { memo } from 'react';
import { FallingItem as FallingItemType } from '@/app/lib/types';

/**
 * Category color mapping - tactical color palette
 */
const CATEGORY_STYLES = {
  weapon: {
    bg: 'bg-cat-weapon',
    border: 'border-cat-weapon/50',
    shadow: 'shadow-cat-weapon/30',
  },
  shield: {
    bg: 'bg-cat-shield',
    border: 'border-cat-shield/50',
    shadow: 'shadow-cat-shield/30',
  },
  utility: {
    bg: 'bg-cat-utility',
    border: 'border-cat-utility/50',
    shadow: 'shadow-cat-utility/30',
  },
  premium: {
    bg: 'bg-cat-premium',
    border: 'border-cat-premium/50',
    shadow: 'shadow-cat-premium/30',
  },
  bonus: {
    bg: 'bg-cat-bonus',
    border: 'border-cat-bonus/50',
    shadow: 'shadow-cat-bonus/30',
  },
} as const;

/**
 * Power-up type icons
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
 * FallingItem - Renders falling game items with category-based styling
 *
 * Features:
 * - Category-specific colors and shadows
 * - Power-up visual distinction with glow
 * - Optimal item highlight for hint power-up
 * - GPU-accelerated positioning
 */
export const FallingItem = memo(function FallingItem({ item, highlighted = false }: FallingItemProps) {
  const styles = CATEGORY_STYLES[item.category];
  const isPowerUp = item.isPowerUp ?? false;
  const powerUpIcon = isPowerUp && item.powerUpType ? POWER_UP_ICONS[item.powerUpType] : null;

  return (
    <div
      className={`
        absolute flex items-center justify-center
        rounded-lg border-2 transition-shadow
        ${styles.bg} ${styles.border}
        ${isPowerUp ? 'animate-pulse ring-2 ring-white/60 shadow-lg' : 'shadow-md'}
        ${highlighted ? 'ring-2 ring-warning ring-offset-2 ring-offset-background shadow-lg shadow-warning/40' : ''}
      `}
      style={{
        transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
        width: item.width,
        height: item.height,
        contain: 'layout style paint',
      }}
    >
      {/* Optimal item indicator */}
      {highlighted && (
        <span className="absolute -top-2 -right-2 text-lg animate-bounce drop-shadow-lg">⭐</span>
      )}

      {/* Content: Power-up icon or cost badge */}
      {isPowerUp && powerUpIcon ? (
        <span className="text-xl drop-shadow-md">{powerUpIcon}</span>
      ) : (
        <span className="text-xs font-bold text-white drop-shadow-md px-1.5 py-0.5 bg-black/30 rounded">
          ${item.cost}
        </span>
      )}
    </div>
  );
});
