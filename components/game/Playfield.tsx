'use client';

/**
 * The play area: falling items, power-ups and the player's cart, drawn in logical pixels
 * (CANVAS_WIDTH x CANVAS_HEIGHT) and scaled to fit the screen, so a phone and a desktop play
 * the same field. Pointer and touch drags steer the cart; the engine caps its speed.
 */

import { memo, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShoppingCart, Star } from 'lucide-react';
import { Icon } from '@/components/kl';
import { cn } from '@/lib/kl/cn';
import type { FallingItem as FallingItemType, PowerUpEffect } from '@/lib/game/types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CATCHER_WIDTH,
  CATCHER_HEIGHT,
  CATCHER_Y,
} from '@/lib/game/constants';
import { POWER_UPS, hasOptimalHint, isOptimalItem, isTimeFrozen } from '@/lib/game/powerUps';
import { AISLE_COLORS, ITEM_ICONS, POWER_UP_ICONS, money } from './visuals';

// ---------------------------------------------------------------------------------------------
// Pieces (logical pixels)
// ---------------------------------------------------------------------------------------------

export const FallingItem = memo(function FallingItem({
  item,
  highlighted = false,
}: {
  item: FallingItemType;
  highlighted?: boolean;
}) {
  const style = { transform: `translate3d(${item.x}px, ${item.y}px, 0)`, width: item.width, height: item.height };

  if (item.isPowerUp && item.powerUpType) {
    const good = POWER_UPS[item.powerUpType].isPositive;
    return (
      <div className="absolute left-0 top-0 flex items-center justify-center" style={style} data-kind="power-up" data-power-up={item.powerUpType} data-good={good ? '1' : '0'}>
        {/* Good power-ups are round; bad ones are a tilted square, so shape says it too */}
        <div
          className={cn(
            'absolute inset-1.5 ring-[3px]',
            good ? 'rounded-full bg-success-soft ring-success' : 'rotate-45 rounded-[12px] bg-danger-soft ring-danger'
          )}
        />
        <Icon
          icon={POWER_UP_ICONS[item.powerUpType]}
          size={28}
          strokeWidth={2.5}
          className={cn('relative', good ? 'text-success-text' : 'text-danger-text')}
        />
      </div>
    );
  }

  const aisle = AISLE_COLORS[item.category];
  const ItemIcon = (item.itemId && ITEM_ICONS[item.itemId]) || ShoppingCart;
  return (
    <div className="absolute left-0 top-0" style={style} data-kind="item" data-cost={item.cost}>
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-between rounded-[16px] pt-2 pb-1 shadow-[0_2px_0_rgb(18_24_41/0.12)] ring-1 ring-black/5 dark:ring-white/15',
          highlighted && 'ring-4 ring-warning'
        )}
        style={{ background: aisle.tile }}
      >
        <span className="flex" style={{ color: aisle.icon }}>
          <Icon icon={ItemIcon} size={28} strokeWidth={2.25} />
        </span>
        <span className="tabular rounded-full bg-surface px-1.5 font-display text-[16px] leading-[20px] text-ink">
          {money(item.cost)}
        </span>
      </div>
      {highlighted && (
        <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-warning text-[#2a1c06]">
          <Icon icon={Star} size={16} strokeWidth={2.5} className="fill-current" />
        </span>
      )}
    </div>
  );
});

export const Catcher = memo(function Catcher({ x }: { x: number }) {
  return (
    <div
      className="absolute left-0 top-0"
      style={{ transform: `translate3d(${x}px, ${CATCHER_Y}px, 0)`, width: CATCHER_WIDTH, height: CATCHER_HEIGHT }}
      data-testid="catcher"
    >
      <div className="flex h-full w-full items-center justify-center rounded-[18px] bg-accent-strong shadow-[0_5px_0_var(--accent-deep)]">
        <Icon icon={ShoppingCart} size={36} strokeWidth={2.5} className="text-on-accent" />
      </div>
    </div>
  );
});

/** Soft screen tints while a timed power-up runs (colour plus the effect chips under the HUD). */
function PowerUpTint({ activePowerUps }: { activePowerUps: PowerUpEffect[] }) {
  const slow = activePowerUps.some((p) => p.type === 'slow_motion');
  const fast = activePowerUps.some((p) => p.type === 'speed_up');
  const frozen = isTimeFrozen(activePowerUps);
  return (
    <AnimatePresence>
      {(slow || frozen) && (
        <motion.div
          key="cool"
          className="pointer-events-none absolute inset-0 bg-[#38bdf8]"
          initial={{ opacity: 0 }}
          animate={{ opacity: frozen ? 0.16 : 0.1 }}
          exit={{ opacity: 0 }}
        />
      )}
      {fast && (
        <motion.div
          key="hot"
          className="pointer-events-none absolute inset-0 bg-warning"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.14 }}
          exit={{ opacity: 0 }}
        />
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------------------------
// The field
// ---------------------------------------------------------------------------------------------

export function Playfield({
  items,
  catcherX,
  activePowerUps,
  budget,
  slots,
  scale,
  onPointerTarget,
  overlay,
}: {
  items: FallingItemType[];
  catcherX: number;
  activePowerUps: PowerUpEffect[];
  budget: number;
  slots: (FallingItemType | null)[];
  /** Screen pixels per logical pixel. */
  scale: number;
  /** Where the finger is, in logical pixels, or null when it lifts. */
  onPointerTarget?: (x: number | null) => void;
  /** Screen-pixel layer on top (the ready card). */
  overlay?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const hintActive = hasOptimalHint(activePowerUps);
  const slotsRemaining = slots.filter((slot) => slot === null).length;

  function steer(clientX: number) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || !onPointerTarget) return;
    onPointerTarget((clientX - rect.left) / scale);
  }

  return (
    <div
      ref={ref}
      role="application"
      aria-label="Play area. Move your cart with the left and right arrow keys, or drag on the play area."
      className="relative shrink-0 touch-none select-none overflow-hidden rounded-xl ring-1 ring-line"
      style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}
      onPointerDown={(e) => {
        // Only steer while playing, and never steal a press meant for a button on top (the
        // round card): pointer capture would send its click to the field instead.
        if (!onPointerTarget || (e.target as HTMLElement).closest('button')) return;
        dragging.current = true;
        try {
          // Keep getting moves when the finger slides off the field
          e.currentTarget.setPointerCapture?.(e.pointerId);
        } catch {
          // A pointer the browser no longer tracks can't be captured; steering still works
        }
        steer(e.clientX);
      }}
      onPointerMove={(e) => {
        if (dragging.current) steer(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
        onPointerTarget?.(null);
      }}
      onPointerCancel={() => {
        dragging.current = false;
        onPointerTarget?.(null);
      }}
      data-testid="playfield"
    >
      <div
        className="field-dots absolute left-0 top-0 origin-top-left"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${scale})`, contain: 'strict' }}
      >
        <PowerUpTint activePowerUps={activePowerUps} />
        {items.map((item) => (
          <FallingItem
            key={item.id}
            item={item}
            highlighted={hintActive && isOptimalItem(item, budget, slotsRemaining)}
          />
        ))}
        <Catcher x={catcherX} />
      </div>
      {overlay}
    </div>
  );
}
