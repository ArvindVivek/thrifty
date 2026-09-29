'use client';

/**
 * Everything around the play area: the HUD (round, budget, time, score), the active power-up
 * strip, the cart of five slots, and the rules panels shown beside the field on wide screens.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Hand, Lock, PiggyBank, ShoppingCart, Target, Wallet } from 'lucide-react';
import { Card, Icon } from '@/components/kl';
import { cn } from '@/lib/kl/cn';
import { snappy } from '@/lib/kl/motion';
import type { FallingItem, PowerUpEffect, PowerUpType } from '@/lib/game/types';
import type { PennyLine } from '@/lib/game/penny';
import { ROUND_CONFIG, TOTAL_ROUNDS, SLOT_COUNT } from '@/lib/game/constants';
import { POWER_UPS, getLockedSlot, isTimeFrozen } from '@/lib/game/powerUps';
import { COMBO_MULTIPLIERS } from '@/lib/game/scoreCalculator';
import { CATEGORY_NAMES } from '@/lib/game/catalog';
import { POWER_UP_EFFECTS, POWER_UP_NAMES } from '@/lib/game/penny';
import { AISLE_COLORS, ITEM_ICONS, POWER_UP_ICONS, money, points } from './visuals';

// ---------------------------------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------------------------------

function Meter({ percent, tone }: { percent: number; tone: 'success' | 'warning' | 'danger' | 'accent' | 'cool' }) {
  const fill = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    accent: 'bg-accent',
    cool: 'bg-[#38bdf8]',
  }[tone];
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden>
      <div className={cn('h-full rounded-full transition-[width] duration-200', fill)} style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
    </div>
  );
}

function Readout({
  label,
  value,
  valueClass,
  testId,
  children,
}: {
  label: string;
  value: ReactNode;
  valueClass?: string;
  testId: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-bold uppercase tracking-wide text-ink-2">{label}</span>
        <span className={cn('tabular font-display text-title2 leading-tight', valueClass ?? 'text-ink')} data-testid={testId}>
          {value}
        </span>
      </div>
      {children}
    </div>
  );
}

export function Hud({
  round,
  budget,
  maxBudget,
  timer,
  maxTime,
  totalScore,
  activePowerUps,
  width,
}: {
  round: number;
  budget: number;
  maxBudget: number;
  timer: number;
  maxTime: number;
  totalScore: number;
  activePowerUps: PowerUpEffect[];
  width: number;
}) {
  const seconds = Math.ceil(timer / 1000);
  const budgetPercent = (budget / maxBudget) * 100;
  const frozen = isTimeFrozen(activePowerUps);
  const budgetTone = budgetPercent > 50 ? 'success' : budgetPercent > 20 ? 'warning' : 'danger';
  const budgetText = { success: 'text-ink', warning: 'text-warning-text', danger: 'text-danger-text' }[budgetTone];
  const hurry = seconds <= 5 && !frozen;

  // A +/- popup whenever the budget moves (a buy, a boost, a drain)
  const [delta, setDelta] = useState<{ amount: number; id: number } | null>(null);
  const previous = useRef(budget);
  useEffect(() => {
    if (budget === previous.current) return;
    const change = { amount: budget - previous.current, id: Date.now() };
    previous.current = budget;
    setDelta(change);
    const clear = setTimeout(() => setDelta(null), 700);
    return () => clearTimeout(clear);
  }, [budget]);

  return (
    <div
      className="grid w-full grid-cols-[auto_1.4fr_1fr] items-start gap-x-4 rounded-lg bg-surface px-4 py-2.5 shadow-[var(--shadow-card)]"
      style={{ maxWidth: width }}
    >
      <div className="flex flex-col gap-1">
        <span className="text-[13px] font-bold uppercase tracking-wide text-ink-2">Round</span>
        <span className="tabular font-display text-title2 leading-tight text-ink" data-testid="hud-round">
          {round}
          <span className="text-ink-2">/{TOTAL_ROUNDS}</span>
        </span>
        <span className="tabular text-[13px] font-bold text-ink-2">
          <span data-testid="hud-score">{points(totalScore)}</span> pts
        </span>
      </div>

      <div className="relative">
        <Readout label="Budget" value={money(budget)} valueClass={budgetText} testId="hud-budget">
          <Meter percent={budgetPercent} tone={budgetTone} />
        </Readout>
        <AnimatePresence mode="popLayout">
          {delta && (
            <motion.span
              key={delta.id}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 4 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className={cn(
                'tabular pointer-events-none absolute right-0 top-full z-10 rounded-full px-2 font-display text-[15px] shadow-[var(--shadow-lift)]',
                delta.amount < 0 ? 'bg-danger-soft text-danger-text' : 'bg-success-soft text-success-text'
              )}
            >
              {delta.amount > 0 ? '+' : ''}
              {money(delta.amount)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <Readout label={frozen ? 'Frozen' : 'Time'} value={`${seconds}s`} valueClass={hurry ? 'text-danger-text' : 'text-ink'} testId="hud-time">
        <Meter percent={(timer / maxTime) * 100} tone={frozen ? 'cool' : hurry ? 'danger' : 'accent'} />
      </Readout>
    </div>
  );
}

/**
 * Under the HUD, one fixed-height row (so nothing jumps): Penny's latest line on the left, the
 * timed power-ups running now on the right. Penny lives here rather than over the field, where
 * she hid the items spawning at the top.
 */
export function PennyAndEffects({
  penny,
  activePowerUps,
  width,
}: {
  penny: (PennyLine & { id: number }) | null;
  activePowerUps: PowerUpEffect[];
  width: number;
}) {
  return (
    <div className="flex h-8 w-full items-center gap-2" style={{ maxWidth: width }}>
      <div aria-live="polite" className="min-w-0 flex-1">
        <AnimatePresence mode="popLayout">
          {penny && (
            <motion.p
              key={penny.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={snappy}
              className={cn(
                'inline-flex h-8 max-w-full items-center gap-1.5 rounded-full px-3 text-[14px] font-bold',
                penny.tone === 'good' && 'bg-success-soft text-success-text',
                penny.tone === 'bad' && 'bg-danger-soft text-danger-text',
                penny.tone === 'neutral' && 'bg-surface text-ink ring-1 ring-line'
              )}
              data-testid="penny"
            >
              <Icon icon={penny.powerUp ? POWER_UP_ICONS[penny.powerUp] : PiggyBank} size={16} />
              <span className="truncate">{penny.text}</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div className="flex shrink-0 items-center gap-1.5" aria-label="Active power-ups">
        <AnimatePresence initial={false}>
          {activePowerUps.map((effect, index) => {
            const good = POWER_UPS[effect.type].isPositive;
            return (
              <motion.span
                key={`${effect.type}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  'inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-2 text-[13px] font-bold',
                  good ? 'bg-success-soft text-success-text' : 'bg-danger-soft text-danger-text'
                )}
                title={POWER_UP_NAMES[effect.type]}
              >
                <Icon icon={POWER_UP_ICONS[effect.type]} size={14} label={POWER_UP_NAMES[effect.type]} />
                {effect.type === 'score_multiplier' ? (
                  <span>2x</span>
                ) : (
                  <span className="tabular">{Math.ceil(effect.duration / 1000)}s</span>
                )}
              </motion.span>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------------------------

function Slot({ slot, index, locked }: { slot: FallingItem | null; index: number; locked: boolean }) {
  const aisle = slot ? AISLE_COLORS[slot.category] : null;
  const ItemIcon = slot?.itemId ? ITEM_ICONS[slot.itemId] : null;
  return (
    <motion.li
      className={cn(
        'flex h-[68px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-center',
        slot ? '' : locked ? 'bg-danger-soft' : 'border-2 border-dashed border-line bg-surface-2'
      )}
      style={aisle ? { background: aisle.tile } : undefined}
      animate={slot ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={{ duration: 0.25 }}
      data-testid={`slot-${index}`}
    >
      {slot && ItemIcon && aisle ? (
        <>
          <span className="flex" style={{ color: aisle.icon }}>
            <Icon icon={ItemIcon} size={22} />
          </span>
          <span className="w-full truncate text-[12px] font-bold leading-tight text-ink">{slot.itemName}</span>
          <span className="tabular text-[12px] font-bold leading-tight text-ink-2">{money(slot.cost)}</span>
        </>
      ) : locked ? (
        <>
          <Icon icon={Lock} size={20} className="text-danger-text" />
          <span className="text-[12px] font-bold text-danger-text">Locked</span>
        </>
      ) : (
        <span className="text-[12px] font-bold text-ink-2">Empty</span>
      )}
    </motion.li>
  );
}

export function Cart({ slots, activePowerUps, width }: { slots: (FallingItem | null)[]; activePowerUps: PowerUpEffect[]; width: number }) {
  const locked = getLockedSlot(activePowerUps);
  const filled = slots.filter((s) => s !== null).length;
  return (
    <section className="w-full" style={{ maxWidth: width }} aria-label={`Your cart: ${filled} of ${SLOT_COUNT} filled`}>
      <ol className="flex gap-1.5">
        {slots.map((slot, i) => (
          <Slot key={i} slot={slot} index={i} locked={locked === i && !slot} />
        ))}
      </ol>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------
// Rules (beside the field on wide screens; on the title screen for everyone)
// ---------------------------------------------------------------------------------------------

export const HOW_TO_PLAY = [
  { icon: Hand, title: 'Move your cart', text: 'Hold the left and right arrow keys, or drag on the play area.' },
  { icon: ShoppingCart, title: 'Fill five slots', text: 'Catch five things to clear the round. Clear all three rounds to win.' },
  { icon: Wallet, title: 'Mind the budget', text: "Catch something you can't afford and the game ends. Run out of time and it ends too." },
] as const;

export const SCORE_BONUSES = [
  { name: 'Perfect Budget', multiplier: COMBO_MULTIPLIERS.perfectBudget, rule: 'Spend exactly all your money' },
  { name: 'Thrifty', multiplier: COMBO_MULTIPLIERS.thrifty, rule: 'Keep half your budget or more' },
  { name: 'Specialist', multiplier: COMBO_MULTIPLIERS.specialist, rule: '4 or more from one aisle' },
  { name: 'Speed Demon', multiplier: COMBO_MULTIPLIERS.speedDemon, rule: 'Finish with 15 s or more left' },
  { name: 'Balanced Cart', multiplier: COMBO_MULTIPLIERS.balanced, rule: 'Things from 3 or more aisles' },
] as const;

const POWER_UP_ORDER: PowerUpType[] = [
  'slow_motion',
  'budget_boost',
  'optimal_hint',
  'time_freeze',
  'score_multiplier',
  'budget_drain',
  'speed_up',
  'slot_lock',
  'point_drain',
];

export function ScoringRules() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[15px] text-ink-2">
        Each round scores 500, plus the points of what you caught, plus 2 for every dollar left and 30 for every second
        left. Bonuses then multiply it:
      </p>
      <ul className="flex flex-col gap-2">
        {SCORE_BONUSES.map((bonus) => (
          <li key={bonus.name} className="flex items-start justify-between gap-3">
            <span className="min-w-0">
              <span className="block font-bold text-ink">{bonus.name}</span>
              <span className="block text-[15px] text-ink-2">{bonus.rule}</span>
            </span>
            <span className="tabular shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 font-display text-accent-text">
              x{bonus.multiplier.toFixed(1)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PowerUpList({ which }: { which: 'good' | 'bad' }) {
  const list = POWER_UP_ORDER.filter((type) => POWER_UPS[type].isPositive === (which === 'good'));
  return (
    <ul className="flex flex-col gap-2.5">
      {list.map((type) => (
        <li key={type} className="flex items-center gap-3">
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center',
              which === 'good'
                ? 'rounded-full bg-success-soft text-success-text ring-2 ring-success'
                : 'rounded-[10px] bg-danger-soft text-danger-text ring-2 ring-danger'
            )}
          >
            <Icon icon={POWER_UP_ICONS[type]} size={20} />
          </span>
          <span className="min-w-0">
            <span className="block font-bold text-ink">{POWER_UP_NAMES[type]}</span>
            <span className="block text-[15px] leading-snug text-ink-2">{POWER_UP_EFFECTS[type]}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AisleList() {
  return (
    <ul className="flex flex-wrap gap-2">
      {(Object.keys(CATEGORY_NAMES) as (keyof typeof CATEGORY_NAMES)[]).map((aisle) => (
        <li
          key={aisle}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[15px] font-bold text-ink"
          style={{ background: AISLE_COLORS[aisle].tile }}
        >
          <span className="size-2.5 rounded-full" style={{ background: AISLE_COLORS[aisle].icon }} />
          {CATEGORY_NAMES[aisle]}
        </li>
      ))}
    </ul>
  );
}

export function LeftPanel() {
  return (
    <div className="flex flex-col gap-3">
      <Card padding="md">
        <h2 className="mb-2 flex items-center gap-2 text-title3 text-ink">
          <Icon icon={Target} size={20} className="text-accent-text" />
          Goal
        </h2>
        <p className="text-[15px] text-ink-2">Catch five things without going over budget.</p>
        <div className="mt-3 flex items-center gap-2 text-[15px] text-ink-2">
          <kbd className="inline-flex size-9 items-center justify-center rounded-sm bg-surface-2 text-ink ring-1 ring-line">
            <Icon icon={ArrowLeft} size={18} label="Left arrow" />
          </kbd>
          <kbd className="inline-flex size-9 items-center justify-center rounded-sm bg-surface-2 text-ink ring-1 ring-line">
            <Icon icon={ArrowRight} size={18} label="Right arrow" />
          </kbd>
          <span>to move, or drag</span>
        </div>
      </Card>
      <Card padding="md">
        <h2 className="mb-2 flex items-center gap-2 text-title3 text-ink">
          <Icon icon={PiggyBank} size={20} className="text-accent-text" />
          Score bonuses
        </h2>
        <ScoringRules />
      </Card>
    </div>
  );
}

export function RightPanel() {
  return (
    <div className="flex flex-col gap-3">
      <Card padding="md">
        <h2 className="mb-3 text-title3 text-success-text">Good power-ups</h2>
        <PowerUpList which="good" />
      </Card>
      <Card padding="md">
        <h2 className="mb-3 text-title3 text-danger-text">Bad power-ups</h2>
        <PowerUpList which="bad" />
      </Card>
    </div>
  );
}

/** Round facts for the ready card. */
export function roundFacts(round: number) {
  const config = ROUND_CONFIG[round - 1] ?? ROUND_CONFIG[0];
  return { name: config.name, budget: config.budget, seconds: config.duration / 1000 };
}
