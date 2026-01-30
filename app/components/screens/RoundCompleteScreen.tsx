/**
 * Round Complete Screen
 *
 * Displays detailed score breakdown when player successfully completes a round.
 * Shows base score, bonuses, combo multipliers, and round total.
 */

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
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl text-green-500">
            Round {round} Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Score:</span>
              <span className="font-medium">
                {score.baseScore.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Item Value:</span>
              <span className="font-medium text-green-600">
                +{score.itemValue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget Bonus:</span>
              <span className="font-medium text-green-600">
                +{score.budgetBonus.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time Bonus:</span>
              <span className="font-medium text-green-600">
                +{Math.round(score.timeBonus).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t pt-4">
            {/* Combos section */}
            {score.combos.length > 0 && (
              <div className="mb-4 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Combo Bonuses:
                </h3>
                {score.combos.map((combo) => (
                  <div
                    key={combo.name}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-amber-600">{combo.name}:</span>
                    <span className="font-medium text-amber-600">
                      x{combo.multiplier.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Total multiplier */}
            {score.multiplier > 1 && (
              <div className="mb-3 flex justify-between border-t pt-3">
                <span className="font-semibold">Total Multiplier:</span>
                <span className="font-semibold text-amber-500">
                  x{score.multiplier.toFixed(1)}
                </span>
              </div>
            )}

            {/* Round total */}
            <div className="flex justify-between border-t pt-3 text-lg">
              <span className="font-bold">Round Total:</span>
              <span className="font-bold text-green-500">
                {score.totalScore.toLocaleString()}
              </span>
            </div>

            {/* Running total */}
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Running Total:</span>
              <span className="font-medium">{totalScore.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={onNextRound} size="lg" className="w-full">
            Next Round
            <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
