"use client";

/**
 * GameplayScreen - Main game interface with tactical HUD
 *
 * Esports-inspired layout with:
 * - Top HUD bar with round, budget, and timer
 * - Central game area with tactical border styling
 * - Side panel for equipment slots and active effects
 * - Animated budget and timer feedback
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FallingItem, PowerUpEffect } from "@/app/lib/types";
import { GameArea, SlotIndicator } from '../game';
import { ScreenShake } from '../effects';
import { getLockedSlot, isTimeFrozen } from '@/app/lib/powerUps';
import { ROUND_CONFIG, TOTAL_ROUNDS } from '@/app/lib/constants';

interface GameplayScreenProps {
  round: number;
  budget: number;
  maxBudget: number;
  timer: number;
  maxTime: number;
  slots: (FallingItem | null)[];
  activePowerUps: PowerUpEffect[];
  catcherX: number;
  items: FallingItem[];
}

// Power-up display configuration
const POWER_UP_DISPLAY: Record<string, { name: string; variant: 'positive' | 'negative' }> = {
  slow_motion: { name: 'Slow Mo', variant: 'positive' },
  budget_boost: { name: 'Budget+', variant: 'positive' },
  optimal_hint: { name: 'Hint', variant: 'positive' },
  time_freeze: { name: 'Freeze', variant: 'positive' },
  score_multiplier: { name: '2x Score', variant: 'positive' },
  budget_drain: { name: 'Drain!', variant: 'negative' },
  speed_up: { name: 'Speed!', variant: 'negative' },
  slot_lock: { name: 'Locked!', variant: 'negative' },
  point_drain: { name: 'Pts-', variant: 'negative' },
};

export function GameplayScreen({
  round,
  budget,
  maxBudget,
  timer,
  maxTime,
  slots,
  activePowerUps,
  catcherX,
  items,
}: GameplayScreenProps) {
  const timerSeconds = Math.ceil(timer / 1000);
  const budgetPercent = (budget / maxBudget) * 100;
  const timerPercent = (timer / maxTime) * 100;
  const lockedSlot = getLockedSlot(activePowerUps);
  const timeFrozen = isTimeFrozen(activePowerUps);
  const filledSlots = slots.filter(s => s !== null).length;

  // Track budget changes for animation
  const [budgetDelta, setBudgetDelta] = useState(0);
  const prevBudgetRef = useRef(budget);

  useEffect(() => {
    if (budget !== prevBudgetRef.current) {
      const delta = budget - prevBudgetRef.current;
      setBudgetDelta(delta);
      prevBudgetRef.current = budget;

      const timeout = setTimeout(() => setBudgetDelta(0), 600);
      return () => clearTimeout(timeout);
    }
  }, [budget]);

  // Screen shake on bust
  const [shaking, setShaking] = useState(false);
  useEffect(() => {
    if (budget <= 0 && prevBudgetRef.current > 0) {
      setShaking(true);
      const timeout = setTimeout(() => setShaking(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [budget]);

  // Budget status colors
  const getBudgetStatus = () => {
    if (budgetPercent > 50) return { color: 'text-success', bgClass: 'bg-success' };
    if (budgetPercent > 20) return { color: 'text-warning', bgClass: 'bg-warning' };
    return { color: 'text-val-red', bgClass: 'bg-val-red' };
  };

  // Timer status
  const getTimerStatus = () => {
    if (timeFrozen) return { color: 'text-c9-blue', bgClass: 'bg-c9-blue' };
    if (timerSeconds <= 5) return { color: 'text-val-red', bgClass: 'bg-val-red' };
    return { color: 'text-foreground', bgClass: 'bg-c9-blue' };
  };

  const budgetStatus = getBudgetStatus();
  const timerStatus = getTimerStatus();

  return (
    <ScreenShake active={shaking} intensity={4} duration={200}>
      <div className="min-h-screen bg-background p-4 relative">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid-tactical opacity-30" />

        <div className="max-w-5xl mx-auto space-y-4 relative z-10">
          {/* Top HUD Bar */}
          <div className="hud-panel p-4">
            <div className="flex items-center gap-6">
              {/* Round indicator */}
              <div className="flex items-center gap-3">
                <span className="hud-label">Round</span>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).map((r) => (
                    <div
                      key={r}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        r < round
                          ? 'bg-success'
                          : r === round
                          ? 'bg-c9-blue animate-pulse'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="hud-value text-c9-blue">
                  {ROUND_CONFIG[round - 1]?.name || round}
                </span>
              </div>

              {/* Budget meter */}
              <div className="flex-1 max-w-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="hud-label">Budget</span>
                  <div className="relative flex items-center gap-2">
                    <motion.span
                      className={`hud-value ${budgetStatus.color}`}
                      animate={budgetDelta !== 0 ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      ${budget.toLocaleString()}
                    </motion.span>

                    {/* Budget delta popup */}
                    <AnimatePresence>
                      {budgetDelta !== 0 && (
                        <motion.span
                          className={`absolute -right-10 text-sm font-bold ${
                            budgetDelta < 0 ? 'text-val-red' : 'text-success'
                          }`}
                          initial={{ opacity: 0, y: 0 }}
                          animate={{ opacity: 1, y: -8 }}
                          exit={{ opacity: 0, y: -16 }}
                          transition={{ duration: 0.4 }}
                        >
                          {budgetDelta > 0 ? '+' : ''}{budgetDelta}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Budget progress bar */}
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${budgetStatus.bgClass} rounded-full`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${budgetPercent}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Timer */}
              <div className="flex-1 max-w-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="hud-label">Time</span>
                  <motion.span
                    className={`hud-value ${timerStatus.color}`}
                    animate={
                      timeFrozen
                        ? { opacity: [1, 0.5, 1] }
                        : timerSeconds <= 5
                        ? { scale: [1, 1.05, 1] }
                        : {}
                    }
                    transition={{
                      duration: timeFrozen ? 0.8 : 0.5,
                      repeat: timeFrozen || timerSeconds <= 5 ? Infinity : 0,
                    }}
                  >
                    {timeFrozen && '⏸ '}
                    {timerSeconds}s
                  </motion.span>
                </div>

                {/* Timer progress bar */}
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${timerStatus.bgClass} rounded-full`}
                    animate={{ width: `${timerPercent}%` }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                  />
                </div>
              </div>

              {/* Slots quick view */}
              <div className="flex items-center gap-2">
                <span className="hud-label">Slots</span>
                <span className="hud-value text-c9-blue">{filledSlots}/5</span>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex gap-4">
            {/* Game area with tactical styling */}
            <div className="flex-shrink-0 relative">
              {/* Tactical corner accents */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-c9-blue z-10" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-c9-blue z-10" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-c9-blue z-10" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-c9-blue z-10" />

              <GameArea
                items={items}
                catcherX={catcherX}
                activePowerUps={activePowerUps}
                budget={budget}
                slots={slots}
              />
            </div>

            {/* Side panel */}
            <div className="flex-1 space-y-4">
              {/* Equipment slots */}
              <div className="hud-panel p-4">
                <h3 className="hud-label mb-3">Equipment</h3>
                <div className="flex gap-2 flex-wrap">
                  {slots.map((slot, index) => (
                    <SlotIndicator
                      key={index}
                      slot={slot}
                      index={index}
                      locked={lockedSlot === index}
                    />
                  ))}
                </div>
              </div>

              {/* Active power-ups */}
              <AnimatePresence>
                {activePowerUps.length > 0 && (
                  <motion.div
                    className="hud-panel p-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="hud-label mb-3">Active Effects</h3>
                    <div className="flex gap-2 flex-wrap">
                      {activePowerUps.map((powerUp, index) => {
                        const display = POWER_UP_DISPLAY[powerUp.type] || {
                          name: powerUp.type,
                          variant: 'positive' as const
                        };
                        const isNegative = display.variant === 'negative';

                        return (
                          <motion.div
                            key={`${powerUp.type}-${index}`}
                            className={`
                              px-3 py-1.5 rounded-md text-sm font-semibold
                              ${isNegative
                                ? 'bg-val-red/20 text-val-red border border-val-red/30'
                                : 'bg-c9-blue/20 text-c9-blue border border-c9-blue/30'
                              }
                            `}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          >
                            {display.name}
                            {powerUp.duration > 0 && (
                              <span className="ml-1.5 opacity-70 text-xs">
                                {Math.ceil(powerUp.duration / 1000)}s
                              </span>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>

        {/* Controls hint - fixed at bottom */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/50">
          ← → Arrow keys to move
        </div>
      </div>
    </ScreenShake>
  );
}
