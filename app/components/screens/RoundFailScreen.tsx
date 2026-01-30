/**
 * Round Fail Screen
 *
 * Displays failure messaging when player fails a round due to budget bust or timeout.
 * Shows appropriate context and allows retry.
 */

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, Clock, RotateCcw } from 'lucide-react';

interface RoundFailScreenProps {
  round: number;
  failReason: 'bust' | 'timeout';
  slotsFilledCount: number;
  onRetry: () => void;
}

export function RoundFailScreen({
  round,
  failReason,
  slotsFilledCount,
  onRetry,
}: RoundFailScreenProps) {
  const isBust = failReason === 'bust';
  const isTimeout = failReason === 'timeout';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl text-red-500">
            Round Failed!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Failure reason and messaging */}
          {isBust && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-red-500">
                <AlertTriangle className="h-8 w-8" />
                <h3 className="text-2xl font-bold">Over Budget!</h3>
              </div>
              <p className="text-center text-muted-foreground">
                You tried to catch an item that exceeded your remaining budget.
              </p>
            </div>
          )}

          {isTimeout && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-red-500">
                <Clock className="h-8 w-8" />
                <h3 className="text-2xl font-bold">Time&apos;s Up!</h3>
              </div>
              <p className="text-center text-muted-foreground">
                You ran out of time before filling all 5 slots.
              </p>
              <div className="mt-4 rounded-lg bg-muted p-4 text-center">
                <div className="text-sm text-muted-foreground">
                  Slots Filled
                </div>
                <div className="text-3xl font-bold">
                  {slotsFilledCount}/5
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Partial Score:</span>
                  <span className="font-medium">
                    {(slotsFilledCount * 100).toLocaleString()} points
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Round number info */}
          <div className="mt-4 rounded-lg border bg-card p-3 text-center">
            <div className="text-xs text-muted-foreground">
              Failed on Round {round}
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={onRetry} size="lg" className="w-full" variant="outline">
            <RotateCcw className="mr-2" />
            Retry Round
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
