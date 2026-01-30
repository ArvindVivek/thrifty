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
 * GameArea component renders the game world container with falling items and catcher.
 * Uses fixed dimensions from constants and contains all game rendering elements.
 * CSS containment isolates game rendering from HUD recalculations.
 */
export function GameArea({ items, catcherX, activePowerUps, budget, slots }: GameAreaProps) {
  const hintActive = hasOptimalHint(activePowerUps);
  const slotsRemaining = slots.filter(slot => slot === null).length;

  return (
    <div
      className="relative overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        contain: 'content',
      }}
    >
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
    </div>
  );
}
