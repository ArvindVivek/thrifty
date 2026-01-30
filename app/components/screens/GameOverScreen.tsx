"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy } from "lucide-react";
import { getRankTitle } from "@/app/lib/scoreCalculator";

interface GameOverScreenProps {
  totalScore: number;
  onPlayAgain: () => void;
  onLeaderboard: () => void;
}

export function GameOverScreen({
  totalScore,
  onPlayAgain,
  onLeaderboard,
}: GameOverScreenProps) {
  const { rank, title } = getRankTitle(totalScore);

  // Determine rank color
  const getRankColor = (rank: string): string => {
    switch (rank) {
      case "S":
        return "text-yellow-500";
      case "A":
        return "text-green-500";
      case "B":
        return "text-blue-500";
      case "C":
        return "text-teal-500";
      case "D":
        return "text-orange-500";
      case "F":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const rankColor = getRankColor(rank);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-6 animate-in fade-in duration-500">
      <Card className="max-w-lg w-full bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl text-yellow-500 mb-2">
            Game Over
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Final Score Display */}
          <div className="text-center space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Final Score</p>
              <p className="text-5xl font-bold text-white">
                {totalScore.toLocaleString()}
              </p>
            </div>

            {/* Rank Display */}
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Rank</p>
              <div className="flex items-center justify-center gap-3">
                <span className={`text-6xl font-bold ${rankColor}`}>
                  {rank}
                </span>
                <div className="text-left">
                  <p className={`text-xl font-semibold ${rankColor}`}>
                    {title}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Name Entry Placeholder */}
          <div className="border-t border-gray-700 pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">
                Save your score to the leaderboard
              </p>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-500 text-sm">
                Name entry coming soon...
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Phase 8: Leaderboard integration
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3 justify-center">
          <Button onClick={onPlayAgain} size="lg" className="gap-2">
            <RotateCcw className="size-4" />
            Play Again
          </Button>
          <Button
            onClick={onLeaderboard}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Trophy className="size-4" />
            Leaderboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
