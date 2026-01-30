"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FallingItem, PowerUpEffect } from "@/app/lib/types";
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GameArea, SlotIndicator } from '../game';
import { ScreenShake } from '../effects';
import { getLockedSlot, isTimeFrozen } from '@/app/lib/powerUps';

interface GameplayScreenProps {
  round: number;
  budget: number;
  maxBudget: number;
  timer: number; // milliseconds
  maxTime: number; // milliseconds
  slots: (FallingItem | null)[];
  activePowerUps: PowerUpEffect[];
  catcherX: number;
  items: FallingItem[];
}

// Power-up display names and colors
const POWER_UP_DISPLAY: Record<string, { name: string; color: string }> = {
  slow_motion: { name: 'Slow Mo', color: 'bg-blue-500' },
  budget_boost: { name: 'Budget+', color: 'bg-green-500' },
  optimal_hint: { name: 'Hint', color: 'bg-cyan-500' },
  time_freeze: { name: 'Freeze', color: 'bg-indigo-500' },
  score_multiplier: { name: '2x Score', color: 'bg-yellow-500' },
  budget_drain: { name: 'Drain!', color: 'bg-red-500' },
  speed_up: { name: 'Speed!', color: 'bg-orange-500' },
  slot_lock: { name: 'Locked!', color: 'bg-gray-500' },
  point_drain: { name: 'Pts-', color: 'bg-pink-500' },
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

  // Track budget changes for animation
  const [displayBudget, setDisplayBudget] = useState(budget);
  const [budgetDelta, setBudgetDelta] = useState(0);
  const prevBudgetRef = useRef(budget);

  useEffect(() => {
    if (budget !== prevBudgetRef.current) {
      const delta = budget - prevBudgetRef.current;
      setBudgetDelta(delta);
      prevBudgetRef.current = budget;

      // Animate budget to new value
      setDisplayBudget(budget);

      // Clear delta after animation
      const timer = setTimeout(() => setBudgetDelta(0), 500);
      return () => clearTimeout(timer);
    }
  }, [budget]);

  // Screen shake on bust (budget goes to 0 or below)
  const [shaking, setShaking] = useState(false);
  useEffect(() => {
    if (budget <= 0 && prevBudgetRef.current > 0) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 300);
      return () => clearTimeout(timer);
    }
  }, [budget]);

  // Budget color based on remaining
  const budgetColor = budgetPercent > 50
    ? 'text-green-500'
    : budgetPercent > 20
    ? 'text-yellow-500'
    : 'text-red-500';

  // Timer color: frozen (cyan), low (red), normal (white)
  const timerColor = timeFrozen
    ? 'text-cyan-400'
    : timerSeconds <= 5
    ? 'text-red-500'
    : 'text-white';

  return (
    <ScreenShake active={shaking} intensity={4} duration={200}>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* HUD - Top bar */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Round indicator */}
                <div className="text-lg font-bold">
                  Round <span className="text-blue-400">{round}</span>/5
                </div>

                {/* Budget with animation */}
                <div className="flex-1 max-w-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Budget</span>
                    <div className="relative">
                      <motion.span
                        className={`font-mono font-bold ${budgetColor}`}
                        animate={budgetDelta !== 0 ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.2 }}
                      >
                        ${displayBudget.toLocaleString()}
                      </motion.span>
                      {/* Delta popup */}
                      <AnimatePresence>
                        {budgetDelta !== 0 && (
                          <motion.span
                            className={`absolute -right-12 -top-1 text-sm font-bold ${
                              budgetDelta < 0 ? 'text-red-400' : 'text-green-400'
                            }`}
                            initial={{ opacity: 0, y: 0 }}
                            animate={{ opacity: 1, y: -10 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            {budgetDelta > 0 ? '+' : ''}{budgetDelta}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <Progress
                    value={budgetPercent}
                    className="h-2"
                  />
                </div>

                {/* Timer */}
                <div className="flex-1 max-w-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">Time</span>
                    <motion.span
                      className={`font-mono font-bold ${timerColor}`}
                      animate={
                        timeFrozen
                          ? { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }
                          : timerSeconds <= 5
                          ? { scale: [1, 1.1, 1] }
                          : {}
                      }
                      transition={{
                        duration: timeFrozen ? 0.6 : 0.5,
                        repeat: timeFrozen || timerSeconds <= 5 ? Infinity : 0,
                      }}
                    >
                      {timeFrozen && '⏸️ '}
                      {timerSeconds}s
                    </motion.span>
                  </div>
                  <Progress
                    value={timerPercent}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main game area and side panel */}
          <div className="flex gap-4">
            {/* Game area */}
            <div className="flex-shrink-0">
              <GameArea
                items={items}
                catcherX={catcherX}
                activePowerUps={activePowerUps}
                budget={budget}
                slots={slots}
              />
            </div>

            {/* Side panel - Slots and Power-ups */}
            <div className="flex-1 space-y-4">
              {/* Player slots */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Equipment</h3>
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
                </CardContent>
              </Card>

              {/* Active power-ups */}
              {activePowerUps.length > 0 && (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Active Effects</h3>
                    <div className="flex gap-2 flex-wrap">
                      {activePowerUps.map((powerUp, index) => {
                        const display = POWER_UP_DISPLAY[powerUp.type] || {
                          name: powerUp.type,
                          color: 'bg-gray-500'
                        };
                        return (
                          <motion.div
                            key={`${powerUp.type}-${index}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Badge
                              className={`${display.color} text-white animate-pulse`}
                            >
                              {display.name}
                              {powerUp.duration > 0 && (
                                <span className="ml-1 text-xs opacity-75">
                                  {Math.ceil(powerUp.duration / 1000)}s
                                </span>
                              )}
                            </Badge>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ScreenShake>
  );
}
