'use client';

/**
 * GameContainer - Root game component with screen state machine
 *
 * Renders different screens based on gameState.status:
 * - menu: Title screen with Start button
 * - ready: GameplayScreen with the round card over the field (before playing starts)
 * - playing: Game screen with active gameplay
 * - round_complete: Round complete screen with Next Round button
 * - game_over: Game over screen with the leaderboard form and Play Again
 *
 * The screen is derived directly from gameState.status, plus two bits of UI state: "ready"
 * (the round card before a game) and the leaderboard overlay.
 */

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/kl';
import { useGame } from './GameContext';
import { usePennyContext } from './PennyContext';
import { TitleScreen } from './TitleScreen';
import { GameplayScreen } from './GameplayScreen';
import { GameOverScreen, RoundCompleteScreen } from './ResultScreens';
import { LeaderboardBoard } from './Leaderboard';
import { CANVAS_WIDTH, CATCHER_WIDTH, ROUND_CONFIG } from '@/lib/game/constants';
import { roundsCleared } from '@/lib/game/scoreCalculator';

export function GameContainer() {
  const { engine, gameState, setPointerTarget } = useGame();
  const { status, round, budget, timer, totalScore, items, slots, activePowerUps, lastScore, failReason, catcher, playTimeMs } =
    gameState;

  const [isReady, setIsReady] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [submittedEntryId, setSubmittedEntryId] = useState<string | null>(null);
  const { line, triggerRoundStart, triggerFourSlots } = usePennyContext();

  // Track slots for 4-slots-filled reaction
  const prevSlotsFilledRef = useRef(0);
  useEffect(() => {
    const currentFilled = slots.filter((s) => s !== null).length;
    if (currentFilled === 4 && prevSlotsFilledRef.current < 4) {
      triggerFourSlots();
    }
    prevSlotsFilledRef.current = currentFilled;
  }, [slots, triggerFourSlots]);

  // Penny cheers when a round starts (her verdict on the game is on the game-over card)
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (status === 'playing' && prevStatusRef.current !== 'playing') {
      triggerRoundStart();
    }
    prevStatusRef.current = status;
  }, [status, triggerRoundStart]);

  // Every new screen starts at the top (the result card can be taller than a phone)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [status, showLeaderboard]);

  // Leaderboard overlay - Back returns to wherever the player was
  if (showLeaderboard) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-5 py-6">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => setShowLeaderboard(false)} className="self-start">
          Back
        </Button>
        <LeaderboardBoard
          highlightId={submittedEntryId}
          onPlay={() => {
            setShowLeaderboard(false);
            setIsReady(true);
          }}
        />
      </main>
    );
  }

  // Ready: the field with the round card, before a game starts
  if (isReady && (status === 'menu' || status === 'game_over')) {
    const config = ROUND_CONFIG[0];
    return (
      <GameplayScreen
        round={1}
        budget={config.budget}
        maxBudget={config.budget}
        timer={config.duration}
        maxTime={config.duration}
        totalScore={0}
        slots={[null, null, null, null, null]}
        activePowerUps={[]}
        catcherX={(CANVAS_WIDTH - CATCHER_WIDTH) / 2}
        items={[]}
        isReady
        onBegin={() => {
          setIsReady(false);
          setSubmittedEntryId(null); // A new game: nothing to highlight yet
          engine.newGame();
        }}
      />
    );
  }

  if (status === 'menu') {
    return <TitleScreen onStart={() => setIsReady(true)} />;
  }

  if (status === 'playing') {
    const config = ROUND_CONFIG[round - 1];
    return (
      <GameplayScreen
        round={round}
        budget={budget}
        maxBudget={config.budget}
        timer={timer}
        maxTime={config.duration}
        totalScore={totalScore}
        slots={slots}
        activePowerUps={activePowerUps}
        catcherX={catcher.x}
        items={items}
        penny={line}
        onPointerTarget={setPointerTarget}
      />
    );
  }

  if (status === 'round_complete' && lastScore) {
    return <RoundCompleteScreen round={round} score={lastScore} totalScore={totalScore} onNextRound={() => engine.nextRound()} />;
  }

  // Game over (the only status left)
  return (
    <GameOverScreen
      totalScore={totalScore}
      failReason={failReason}
      round={round}
      roundsCleared={roundsCleared({ round, failReason })}
      playMs={playTimeMs}
      savedId={submittedEntryId}
      onPlayAgain={() => setIsReady(true)}
      onLeaderboard={() => setShowLeaderboard(true)}
      onScoreSubmitted={(id) => setSubmittedEntryId(id)}
    />
  );
}
