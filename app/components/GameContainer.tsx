'use client';

/**
 * GameContainer - Root game component with screen state machine
 *
 * Renders different screens based on gameState.status:
 * - menu: Title screen with Start button
 * - ready: GameplayScreen with Begin overlay (instructions visible)
 * - playing: Game screen with active gameplay
 * - round_complete: Round complete screen with Next Round button
 * - round_failed: Round failed screen with Retry button
 * - game_over: Game over screen with Restart button
 *
 * The screen is derived directly from gameState.status - no separate
 * screen state needed. This keeps React state minimal.
 */

import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/app/contexts/GameContext';
import { useJunieContext } from '@/app/contexts/JunieContext';
import {
  TitleScreen,
  GameplayScreen,
  RoundCompleteScreen,
  RoundFailScreen,
  GameOverScreen,
  LeaderboardScreen,
} from './screens';
import { Junie } from './mascot';
import { ROUND_CONFIG } from '@/app/lib/constants';

/**
 * GameContainer component
 *
 * Root game component that displays different screens based on game status.
 * Uses useGame hook to access engine and gameState.
 */
export function GameContainer() {
  const { engine, gameState } = useGame();
  const {
    status,
    round,
    budget,
    timer,
    totalScore,
    items,
    slots,
    activePowerUps,
    lastScore,
    failReason,
    catcher,
  } = gameState;

  const [isReady, setIsReady] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [submittedEntryId, setSubmittedEntryId] = useState<string | null>(null);
  const { reaction, triggerRoundStart, triggerFourSlots, triggerGameOver } = useJunieContext();

  // Leaderboard navigation handlers
  const handleShowLeaderboard = () => {
    setShowLeaderboard(true);
  };

  const handleBackFromLeaderboard = () => {
    setShowLeaderboard(false);
  };

  const handleScoreSubmitted = (entryId: string) => {
    setSubmittedEntryId(entryId);
  };

  // Track slots for 4-slots-filled reaction
  const prevSlotsFilledRef = useRef(0);
  useEffect(() => {
    const currentFilled = slots.filter(s => s !== null).length;
    if (currentFilled === 4 && prevSlotsFilledRef.current < 4) {
      triggerFourSlots();
    }
    prevSlotsFilledRef.current = currentFilled;
  }, [slots, triggerFourSlots]);

  // Trigger round start when game starts
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (status === 'playing' && prevStatusRef.current !== 'playing') {
      triggerRoundStart();
    }
    if (status === 'game_over' && prevStatusRef.current !== 'game_over') {
      triggerGameOver(totalScore);
    }
    prevStatusRef.current = status;
  }, [status, triggerRoundStart, triggerGameOver, totalScore]);

  // Leaderboard overlay - can be shown from any game state
  if (showLeaderboard) {
    return (
      <LeaderboardScreen
        onBack={handleBackFromLeaderboard}
        highlightEntryId={submittedEntryId}
      />
    );
  }

  // Ready screen - show gameplay UI with Begin overlay (before playing starts)
  if (status === 'menu' && isReady) {
    const config = ROUND_CONFIG[0]; // Round 1 config for ready state
    return (
      <GameplayScreen
        round={1}
        budget={config.budget}
        maxBudget={config.budget}
        timer={config.duration}
        maxTime={config.duration}
        slots={[null, null, null, null, null]}
        activePowerUps={[]}
        catcherX={(800 - 80) / 2} // Centered catcher
        items={[]}
        isReady={true}
        onBegin={() => {
          setIsReady(false);
          engine.startRound(1);
        }}
      />
    );
  }

  // Menu screen
  if (status === 'menu') {
    return (
      <TitleScreen
        onStart={() => setIsReady(true)}
        onLeaderboard={handleShowLeaderboard}
      />
    );
  }

  // Playing screen - includes Junie
  if (status === 'playing') {
    const catcherX = catcher.x;
    const config = ROUND_CONFIG[round - 1];
    return (
      <>
        <GameplayScreen
          round={round}
          budget={budget}
          maxBudget={config.budget}
          timer={timer}
          maxTime={config.duration}
          slots={slots}
          activePowerUps={activePowerUps}
          catcherX={catcherX}
          items={items}
        />
        <Junie reaction={reaction} />
      </>
    );
  }

  // Round complete screen - includes Junie
  if (status === 'round_complete') {
    return (
      <>
        <RoundCompleteScreen
          round={round}
          score={lastScore!}
          totalScore={totalScore}
          onNextRound={() => engine.nextRound()}
        />
        <Junie reaction={reaction} />
      </>
    );
  }

  // Round failed screen - includes Junie
  if (status === 'round_failed') {
    const slotsFilledCount = slots.filter(s => s !== null).length;
    return (
      <>
        <RoundFailScreen
          round={round}
          failReason={failReason || 'timeout'}
          slotsFilledCount={slotsFilledCount}
          onRetry={() => engine.startRound(round)}
        />
        <Junie reaction={reaction} />
      </>
    );
  }

  // Game over screen - includes Junie
  if (status === 'game_over') {
    return (
      <>
        <GameOverScreen
          totalScore={totalScore}
          onPlayAgain={() => {
            setSubmittedEntryId(null); // Clear highlighting for new game
            engine.startRound(1);
          }}
          onLeaderboard={handleShowLeaderboard}
          onScoreSubmitted={handleScoreSubmitted}
          failReason={failReason}
          round={round}
        />
        <Junie reaction={reaction} />
      </>
    );
  }

  // Fallback (should never reach)
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <p>Unknown game status: {status}</p>
    </div>
  );
}
