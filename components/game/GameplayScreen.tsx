'use client';

/**
 * The game screen: one viewport tall, nothing scrolls. HUD on top, the play area in the
 * middle (scaled to the space left), the cart at the bottom; the rules sit beside the field
 * on wide screens. The ready card sits over the field before each game.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Hand, Play } from 'lucide-react';
import { Button, Icon } from '@/components/kl';
import { popIn } from '@/lib/kl/motion';
import type { FallingItem, PowerUpEffect } from '@/lib/game/types';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/lib/game/constants';
import type { PennyLine } from '@/lib/game/penny';
import { Playfield } from './Playfield';
import { Cart, Hud, LeftPanel, PennyAndEffects, RightPanel, roundFacts } from './Hud';
import { money } from './visuals';

/** Largest the field grows on big screens: past this it just gets blurry-feeling and far apart. */
const MAX_SCALE = 1.3;

/** Screen pixels per play-area pixel that fit the measured box. */
function useFitScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.max(0.3, Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT, MAX_SCALE)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, scale };
}

function ReadyCard({ round, onBegin }: { round: number; onBegin: () => void }) {
  const facts = roundFacts(round);
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[var(--scrim)] p-4">
      <motion.div {...popIn()} className="w-full max-w-xs rounded-xl bg-surface p-5 text-center shadow-[var(--shadow-lift)]">
        <p className="text-[13px] font-bold uppercase tracking-wide text-ink-2">Round {round}</p>
        <h2 className="mt-1 text-title text-ink">{facts.name}</h2>
        <p className="mt-2 text-[15px] text-ink-2">
          <span className="tabular font-bold text-ink">{money(facts.budget)}</span> to spend,{' '}
          <span className="tabular font-bold text-ink">{facts.seconds} seconds</span> to fill your cart.
        </p>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[15px] text-ink-2">
          <Icon icon={ArrowLeft} size={16} />
          <Icon icon={ArrowRight} size={16} />
          <span>keys or</span>
          <Icon icon={Hand} size={16} />
          <span>drag to move</span>
        </p>
        <Button className="mt-4" size="lg" fullWidth icon={Play} onClick={onBegin} autoFocus>
          Start round
        </Button>
      </motion.div>
    </div>
  );
}

export function GameplayScreen({
  round,
  budget,
  maxBudget,
  timer,
  maxTime,
  totalScore,
  slots,
  activePowerUps,
  catcherX,
  items,
  penny,
  isReady = false,
  onBegin,
  onPointerTarget,
}: {
  round: number;
  budget: number;
  maxBudget: number;
  timer: number;
  maxTime: number;
  totalScore: number;
  slots: (FallingItem | null)[];
  activePowerUps: PowerUpEffect[];
  catcherX: number;
  items: FallingItem[];
  penny?: (PennyLine & { id: number }) | null;
  isReady?: boolean;
  onBegin?: () => void;
  onPointerTarget?: (x: number | null) => void;
}) {
  const { ref, scale } = useFitScale();
  const width = Math.round(CANVAS_WIDTH * (scale || 1));

  return (
    <main className="flex h-dvh flex-col overflow-hidden px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] lg:px-6">
      <h1 className="sr-only">Thrifty, round {round}</h1>
      <div className="mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 justify-center gap-5">
        <aside className="hidden w-72 shrink-0 overflow-y-auto xl:block">
          <LeftPanel />
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col items-center gap-2">
          <Hud
            round={round}
            budget={budget}
            maxBudget={maxBudget}
            timer={timer}
            maxTime={maxTime}
            totalScore={totalScore}
            activePowerUps={activePowerUps}
            width={width}
          />
          <PennyAndEffects penny={penny ?? null} activePowerUps={activePowerUps} width={width} />
          <div ref={ref} className="flex min-h-0 w-full flex-1 items-start justify-center">
            {scale > 0 && (
              <Playfield
                items={items}
                catcherX={catcherX}
                activePowerUps={activePowerUps}
                budget={budget}
                slots={slots}
                scale={scale}
                onPointerTarget={onPointerTarget}
                overlay={isReady && onBegin ? <ReadyCard round={round} onBegin={onBegin} /> : undefined}
              />
            )}
          </div>
          <Cart slots={slots} activePowerUps={activePowerUps} width={width} />
        </section>

        <aside className="hidden w-72 shrink-0 overflow-y-auto lg:block">
          <RightPanel />
        </aside>
      </div>
    </main>
  );
}
