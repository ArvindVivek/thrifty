"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Trophy, Send, Loader2, Check } from "lucide-react";
import { getRankTitle } from "@/app/lib/scoreCalculator";
import { useLeaderboard } from "@/app/hooks/useLeaderboard";

interface GameOverScreenProps {
  totalScore: number;
  onPlayAgain: () => void;
  onLeaderboard: () => void;
  onScoreSubmitted?: (entryId: string) => void;
  failReason?: 'bust' | 'timeout';
  round?: number;
}

export function GameOverScreen({
  totalScore,
  onPlayAgain,
  onLeaderboard,
  onScoreSubmitted,
  failReason,
  round,
}: GameOverScreenProps) {
  const { rank, title } = getRankTitle(totalScore);
  const { submitScore } = useLeaderboard();

  // Form state
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  // Handle score submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || submitted) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const entry = await submitScore(name, totalScore);
      if (entry) {
        setSubmitted(true);
        onScoreSubmitted?.(entry.id);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit score");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-6 animate-in fade-in duration-500">
      <Card className="max-w-lg w-full bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className={`text-4xl mb-2 ${failReason ? 'text-red-500' : 'text-yellow-500'}`}>
            {failReason ? 'Game Over!' : 'Victory!'}
          </CardTitle>
          {failReason && (
            <p className="text-sm text-gray-400">
              {failReason === 'bust' && `Budget bust on Round ${round}`}
              {failReason === 'timeout' && `Time ran out on Round ${round}`}
            </p>
          )}
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

          {/* Name Entry Form */}
          <div className="border-t border-gray-700 pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-3">
                {submitted ? "Score submitted!" : "Save your score to the leaderboard"}
              </p>

              {submitted ? (
                <div className="flex items-center justify-center gap-2 text-green-400 py-3">
                  <Check className="size-5" />
                  <span>Score saved as &quot;{name}&quot;</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 15))}
                    placeholder="Enter your name"
                    maxLength={15}
                    disabled={submitting}
                    className="bg-gray-900 border-gray-700 text-white text-center"
                  />
                  <p className="text-xs text-gray-500">{name.length}/15 characters</p>

                  {submitError && (
                    <p className="text-sm text-red-400">{submitError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={!name.trim() || submitting}
                    className="w-full gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        Submit Score
                      </>
                    )}
                  </Button>
                </form>
              )}
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
