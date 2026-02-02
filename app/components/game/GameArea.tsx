import { FallingItem as FallingItemType, PowerUpEffect } from '@/app/lib/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/app/lib/constants';
import { FallingItem } from './FallingItem';
import { Catcher } from './Catcher';
import { PowerUpTint } from '../effects';
import { hasOptimalHint, isOptimalItem } from '@/app/lib/powerUps';

interface GameAreaProps {
  items: FallingItemType[];
  catcherX: number;
  activePowerUps: PowerUpEffect[];
  budget: number;
  slots: (FallingItemType | null)[];
}

/**
 * GameArea - Main game canvas containing falling items and player catcher
 *
 * Features:
 * - Fixed dimensions with CSS containment for performance
 * - Tactical dark background with subtle gradient
 * - Power-up visual overlays
 * - Optimal item highlighting when hint is active
 */
export function GameArea({ items, catcherX, activePowerUps, budget, slots }: GameAreaProps) {
  const hintActive = hasOptimalHint(activePowerUps);
  const slotsRemaining = slots.filter(slot => slot === null).length;

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background rounded-lg border border-border"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        contain: 'content',
      }}
    >
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid-tactical opacity-20 pointer-events-none" />

      {/* Power-up tint overlay */}
      <PowerUpTint activePowerUps={activePowerUps} />

      {/* Falling items */}
      {items.map((item) => (
        <FallingItem
          key={item.id}
          item={item}
          highlighted={hintActive && isOptimalItem(item, budget, slotsRemaining)}
        />
      ))}

      {/* Player catcher */}
      <Catcher x={catcherX} />

      {/* Bottom boundary line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-c9-blue/30 to-transparent" />
    </div>
  );
}
