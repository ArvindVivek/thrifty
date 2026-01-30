import { FallingItem as FallingItemType, PowerUpEffect } from '@/app/lib/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/app/lib/constants';
import { FallingItem } from './FallingItem';
import { Catcher } from './Catcher';
import { PowerUpTint } from '../effects';
import { hasOptimalHint } from '@/app/lib/powerUps';

interface GameAreaProps {
  items: FallingItemType[];
  catcherX: number;
  activePowerUps: PowerUpEffect[];
}

/**
 * GameArea component renders the game world container with falling items and catcher.
 * Uses fixed dimensions from constants and contains all game rendering elements.
 * CSS containment isolates game rendering from HUD recalculations.
 */
export function GameArea({ items, catcherX, activePowerUps }: GameAreaProps) {
  const hintActive = hasOptimalHint(activePowerUps);

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
          highlighted={hintActive && !item.isPowerUp && item.value >= 150}
        />
      ))}

      {/* Player catcher */}
      <Catcher x={catcherX} />
    </div>
  );
}
