"use client";

/**
 * GameplayScreen - Main game interface with tactical HUD
 *
 * Clean, readable layout with:
 * - Top HUD bar with round, budget, and timer
 * - Left panel with instructions and scoring tips
 * - Central game area with equipment slots
 * - Right panel with power-up legend
 * - Ready state with Begin button overlay
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { FallingItem, PowerUpEffect } from "@/app/lib/types";
import { GameArea, SlotIndicator } from '../game';
import { ScreenShake } from '../effects';
import { getLockedSlot, isTimeFrozen } from '@/app/lib/powerUps';
import { ROUND_CONFIG, TOTAL_ROUNDS } from '@/app/lib/constants';

/**
 * Power-up legend data
 */
const POWER_UP_LEGEND = {
  positive: [
    { type: 'slow_motion', name: 'Slow Motion', effect: '50% slower', image: '/assets/powerups/slow_motion.svg' },
    { type: 'budget_boost', name: 'Budget Boost', effect: '+$500', image: '/assets/powerups/budget_boost.svg' },
    { type: 'optimal_hint', name: 'Optimal Hint', effect: 'Shows best', image: '/assets/powerups/optimal_hint.svg' },
    { type: 'time_freeze', name: 'Time Freeze', effect: 'Pause 3s', image: '/assets/powerups/time_freeze.svg' },
    { type: 'score_multiplier', name: '2x Score', effect: 'Double pts', image: '/assets/powerups/score_multiplier.svg' },
  ],
  negative: [
    { type: 'budget_drain', name: 'Budget Drain', effect: '-$300', image: '/assets/powerups/budget_drain.svg' },
    { type: 'speed_up', name: 'Speed Up', effect: 'Faster!', image: '/assets/powerups/speed_up.svg' },
    { type: 'slot_lock', name: 'Slot Lock', effect: 'Lock 1 slot', image: '/assets/powerups/slot_lock.svg' },
    { type: 'point_drain', name: 'Point Drain', effect: '-200 pts', image: '/assets/powerups/point_drain.svg' },
  ],
};

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
  isReady?: boolean;
  onBegin?: () => void;
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
  isReady = false,
  onBegin,
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
      <div className="h-screen bg-background p-4 relative overflow-hidden flex flex-col">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid-tactical opacity-30" />

        <div className="flex flex-col max-w-7xl mx-auto w-full relative z-10">
          {/* Top HUD Bar */}
          <div className="hud-panel p-4 mb-3">
            <div className="flex items-center gap-8">
              {/* App name */}
              <h1 className="text-xl font-black tracking-tight">
                <span className="text-c9-blue">THRIFTY</span>
              </h1>

              {/* Round indicator */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Round</span>
                <div className="flex items-center gap-2">
                  {Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).map((r) => (
                    <div
                      key={r}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        r < round
                          ? 'bg-success'
                          : r === round
                          ? 'bg-c9-blue animate-pulse'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xl font-bold text-c9-blue">
                  {ROUND_CONFIG[round - 1]?.name || round}
                </span>
              </div>

              {/* Budget meter */}
              <div className="flex-1 max-w-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Budget</span>
                  <div className="relative flex items-center gap-2">
                    <motion.span
                      className={`text-2xl font-bold ${budgetStatus.color}`}
                      animate={budgetDelta !== 0 ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      ${budget.toLocaleString()}
                    </motion.span>

                    {/* Budget delta popup */}
                    <AnimatePresence>
                      {budgetDelta !== 0 && (
                        <motion.span
                          className={`absolute -right-12 text-base font-bold ${
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
              <div className="flex-1 max-w-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Time</span>
                  <motion.span
                    className={`text-2xl font-bold ${timerStatus.color}`}
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
                    {timeFrozen && '|| '}
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
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Slots</span>
                <span className="text-2xl font-bold text-c9-blue">{filledSlots}/5</span>
              </div>
            </div>
          </div>

          {/* Main content area - 3 column layout */}
          <div className="flex gap-4">
            {/* Left panel - Instructions & Scoring */}
            <div className="w-56 flex-shrink-0 flex flex-col gap-3" style={{ height: 600 }}>
              {/* Objective */}
              <div className="hud-panel p-4">
                <h3 className="text-base font-bold text-c9-blue mb-2">Objective</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Catch <span className="text-foreground font-semibold">5 items</span> to complete your loadout without going over budget.
                </p>
              </div>

              {/* Controls */}
              <div className="hud-panel p-4">
                <h3 className="text-base font-bold text-foreground mb-2">Controls</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="px-3 py-1 bg-secondary rounded text-sm font-mono font-bold">←</span>
                  <span className="px-3 py-1 bg-secondary rounded text-sm font-mono font-bold">→</span>
                  <span className="font-medium">Move</span>
                </div>
              </div>

              {/* Scoring Tips */}
              <div className="hud-panel p-4 flex-1">
                <h3 className="text-base font-bold text-success mb-3">Score Bonuses</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex gap-2">
                    <span className="text-success font-bold">+</span>
                    <span><span className="text-success font-semibold">Perfect Budget</span> - spend near limit</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-success font-bold">+</span>
                    <span><span className="text-success font-semibold">Balanced</span> - 3+ categories</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-success font-bold">+</span>
                    <span><span className="text-success font-semibold">Speed</span> - finish fast</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-warning font-bold">!</span>
                    <span>Avoid <span className="text-val-red font-semibold">red</span> power-ups</span>
                  </li>
                </ul>
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
                    <h3 className="text-base font-bold text-foreground mb-2">Active</h3>
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
                              px-2 py-1 rounded text-xs font-bold
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
                              <span className="ml-1 opacity-70">
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

            {/* Center - Game area */}
            <div className="flex flex-col gap-3">
              {/* Game area with tactical styling - fixed dimensions */}
              <div className="relative" style={{ width: 800, height: 500 }}>
                {/* Tactical corner accents */}
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-c9-blue z-10" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-c9-blue z-10" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-c9-blue z-10" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-c9-blue z-10" />

                <GameArea
                  items={items}
                  catcherX={catcherX}
                  activePowerUps={activePowerUps}
                  budget={budget}
                  slots={slots}
                />

                {/* Ready overlay with Begin button */}
                {isReady && onBegin && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 backdrop-blur-sm">
                    <motion.div
                      className="text-center"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-4xl font-bold text-white mb-3">Round {round}</h2>
                      <p className="text-2xl font-semibold text-c9-blue mb-2">{ROUND_CONFIG[round - 1]?.name}</p>
                      <p className="text-lg text-white/70 mb-8">
                        Read the instructions, then press BEGIN
                      </p>
                      <motion.button
                        onClick={onBegin}
                        className="px-12 py-4 bg-c9-blue text-white font-bold text-2xl rounded-xl shadow-lg shadow-c9-blue/40 hover:bg-c9-blue/90 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        BEGIN
                      </motion.button>
                      <p className="text-white/60 mt-6 text-base">
                        Budget: <span className="font-bold text-white">${maxBudget.toLocaleString()}</span> | Time: <span className="font-bold text-white">{Math.ceil(maxTime / 1000)}s</span>
                      </p>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Equipment slots - below game area */}
              <div className="hud-panel p-3 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Loadout</h3>
                  <span className="text-sm text-muted-foreground">{filledSlots}/5 equipped</span>
                </div>
                <div className="flex gap-2 justify-center">
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
            </div>

            {/* Right panel - Power-up Legend */}
            <div className="w-60 flex-shrink-0 flex flex-col gap-3" style={{ height: 600 }}>
              {/* Good power-ups */}
              <div className="hud-panel p-4 flex-1">
                <h3 className="text-base font-bold text-success mb-3">Good Power-ups</h3>
                <div className="space-y-3">
                  {POWER_UP_LEGEND.positive.map((powerUp) => (
                    <div key={powerUp.type} className="flex items-center gap-3">
                      <div className="w-11 h-11 flex-shrink-0 rounded-lg bg-success/10 p-2 flex items-center justify-center">
                        <Image
                          src={powerUp.image}
                          alt={powerUp.name}
                          width={32}
                          height={32}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-foreground">{powerUp.name}</div>
                        <div className="text-xs text-muted-foreground">{powerUp.effect}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bad power-ups */}
              <div className="hud-panel p-4 flex-1">
                <h3 className="text-base font-bold text-val-red mb-3">Bad Power-ups</h3>
                <div className="space-y-3">
                  {POWER_UP_LEGEND.negative.map((powerUp) => (
                    <div key={powerUp.type} className="flex items-center gap-3">
                      <div className="w-11 h-11 flex-shrink-0 rounded-lg bg-val-red/10 p-2 flex items-center justify-center">
                        <Image
                          src={powerUp.image}
                          alt={powerUp.name}
                          width={32}
                          height={32}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-foreground">{powerUp.name}</div>
                        <div className="text-xs text-muted-foreground">{powerUp.effect}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScreenShake>
  );
}
