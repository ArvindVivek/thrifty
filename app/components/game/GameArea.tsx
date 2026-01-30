import { FallingItem as FallingItemType } from '@/app/lib/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/app/lib/constants';
import { FallingItem } from './FallingItem';
import { Catcher } from './Catcher';

interface GameAreaProps {
  items: FallingItemType[];
  catcherX: number;
}

/**
 * GameArea component renders the game world container with falling items and catcher.
 * Uses fixed dimensions from constants and contains all game rendering elements.
 * CSS containment isolates game rendering from HUD recalculations.
 */
export function GameArea({ items, catcherX }: GameAreaProps) {
  return (
    <div
      className="relative overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        contain: 'content',
      }}
    >
      {/* Falling items */}
      {items.map((item) => (
        <FallingItem key={item.id} item={item} />
      ))}

      {/* Player catcher */}
      <Catcher x={catcherX} />
    </div>
  );
}
