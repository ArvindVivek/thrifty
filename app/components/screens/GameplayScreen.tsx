"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { FallingItem, PowerUpEffect } from "@/app/lib/types";

interface GameplayScreenProps {
  round: number;
  budget: number;
  maxBudget: number;
  timer: number;
  maxTime: number;
  slots: (FallingItem | null)[];
  activePowerUps: PowerUpEffect[];
  catcherX: number;
}

export function GameplayScreen({
  round,
  budget,
  maxBudget,
  timer,
  maxTime,
  slots,
  activePowerUps,
  catcherX,
}: GameplayScreenProps) {
  // Calculate percentages for color coding
  const budgetPercentage = (budget / maxBudget) * 100;
  const timeInSeconds = Math.ceil(timer / 1000);
  const filledSlotsCount = slots.filter((slot) => slot !== null).length;

  // Determine budget color
  const budgetColor =
    budgetPercentage > 50
      ? "text-green-500"
      : budgetPercentage >= 20
      ? "text-yellow-500"
      : "text-red-500";

  // Determine timer color
  const timerColor = timeInSeconds < 5 ? "text-red-500" : "text-foreground";

  return (
    <div className="relative w-full h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur-sm border-b border-gray-700">
        {/* Round Indicator */}
        <div className="flex items-center gap-3">
          <Badge variant="default" className="text-sm">
            Round {round}/5
          </Badge>
        </div>

        {/* Budget Display */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Budget:</span>
          <span className={`text-lg font-bold ${budgetColor}`}>
            ${budget.toLocaleString()}
          </span>
        </div>

        {/* Timer Display */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Time:</span>
          <span className={`text-lg font-bold ${timerColor}`}>
            {timeInSeconds}s
          </span>
        </div>

        {/* Active Power-ups */}
        <div className="flex items-center gap-2">
          {activePowerUps.length > 0 && (
            <>
              <span className="text-sm text-gray-400">Power-ups:</span>
              <div className="flex gap-1">
                {activePowerUps.map((powerUp, index) => (
                  <Badge
                    key={`${powerUp.type}-${index}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {powerUp.type.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500 text-sm">Game Area</p>
          <p className="text-gray-600 text-xs">
            Catcher X: {Math.round(catcherX)}
          </p>
        </div>
      </div>

      {/* Bottom HUD - Slot Indicators */}
      <div className="px-6 py-4 bg-black/30 backdrop-blur-sm border-t border-gray-700">
        <div className="flex flex-col items-center gap-3">
          {/* Slot Count */}
          <div className="text-sm text-gray-400">
            Slots: {filledSlotsCount}/5
          </div>

          {/* Slot Indicators */}
          <div className="flex gap-3">
            {slots.map((slot, index) => (
              <div
                key={index}
                className={`w-16 h-16 flex items-center justify-center rounded-lg text-xs font-bold ${
                  slot !== null
                    ? "bg-blue-500/30 border-2 border-blue-500"
                    : "border-2 border-dashed border-gray-600"
                }`}
              >
                P{index + 1}
              </div>
            ))}
          </div>

          {/* Controls Hint */}
          <div className="text-xs text-gray-500 mt-2">
            Use arrow keys to move
          </div>
        </div>
      </div>
    </div>
  );
}
