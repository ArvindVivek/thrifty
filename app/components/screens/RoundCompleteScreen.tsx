/**
 * Round Complete Screen
 *
 * Displays detailed score breakdown when player successfully completes a round.
 * Shows base score, bonuses, combo multipliers, and round total.
 */

'use client';

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'motion/react';
import { ScoreResult } from '@/app/lib/scoreCalculator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface RoundCompleteScreenProps {
  round: number;
  score: ScoreResult;
  totalScore: number;
  onNextRound: () => void;
}

export function RoundCompleteScreen({
  round,
  score,
  totalScore,
  onNextRound,
}: RoundCompleteScreenProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Get window dimensions for confetti
  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });

    // Stop confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Confetti celebration */}
      {showConfetti && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      <Card className="w-full max-w-md relative z-10">
        <CardHeader>
          <CardTitle className="text-center text-3xl text-green-500">
            Round {round} Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score breakdown with animations */}
          <div className="space-y-2">
            <motion.div
              className="flex justify-between text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-muted-foreground">Base Score:</span>
              <span className="font-medium">
                {score.baseScore.toLocaleString()}
              </span>
            </motion.div>
            <motion.div
              className="flex justify-between text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-muted-foreground">Item Value:</span>
              <span className="font-medium text-green-600">
                +{score.itemValue.toLocaleString()}
              </span>
            </motion.div>
            <motion.div
              className="flex justify-between text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-muted-foreground">Budget Bonus:</span>
              <span className="font-medium text-green-600">
                +{score.budgetBonus.toLocaleString()}
              </span>
            </motion.div>
            <motion.div
              className="flex justify-between text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-muted-foreground">Time Bonus:</span>
              <span className="font-medium text-green-600">
                +{Math.round(score.timeBonus).toLocaleString()}
              </span>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="border-t pt-4">
            {/* Combos section */}
            {score.combos.length > 0 && (
              <motion.div
                className="mb-4 space-y-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Combo Bonuses:
                </h3>
                {score.combos.map((combo, index) => (
                  <motion.div
                    key={combo.name}
                    className="flex justify-between text-sm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <span className="text-amber-500">{combo.name}:</span>
                    <span className="font-medium text-amber-500">
                      x{combo.multiplier.toFixed(1)}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Total multiplier */}
            {score.multiplier > 1 && (
              <motion.div
                className="mb-3 flex justify-between border-t pt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <span className="font-semibold">Total Multiplier:</span>
                <span className="font-semibold text-amber-500">
                  x{score.multiplier.toFixed(1)}
                </span>
              </motion.div>
            )}

            {/* Round total - big animation */}
            <motion.div
              className="flex justify-between border-t pt-3 text-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
            >
              <span className="font-bold">Round Total:</span>
              <span className="font-bold text-green-500">
                {score.totalScore.toLocaleString()}
              </span>
            </motion.div>

            {/* Running total */}
            <motion.div
              className="mt-2 flex justify-between text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <span className="text-muted-foreground">Running Total:</span>
              <span className="font-medium">{totalScore.toLocaleString()}</span>
            </motion.div>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Button onClick={onNextRound} size="lg" className="w-full">
              Next Round
              <ArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </div>
  );
}
