'use client';

/**
 * GameContainer - Root game component with screen state machine
 *
 * Renders different screens based on gameState.status:
 * - menu: Title screen with Start button
 * - playing: Game screen with debug display
 * - round_complete: Round complete screen with Next Round button
 * - round_failed: Round failed screen with Retry button
 * - game_over: Game over screen with Restart button
 *
 * The screen is derived directly from gameState.status - no separate
 * screen state needed. This keeps React state minimal.
 */

import { useState } from 'react';
import { useGame } from '@/app/contexts/GameContext';
import { getRankTitle } from '@/app/lib/scoreCalculator';
import {
  TitleScreen,
  HowToPlayScreen,
  GameplayScreen,
  RoundCompleteScreen,
  RoundFailScreen,
  GameOverScreen,
} from './screens';
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
  } = gameState;

  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // HowToPlay intercept (before menu)
  if (status === 'menu' && showHowToPlay) {
    return (
      <HowToPlayScreen
        onAdvance={() => {
          setShowHowToPlay(false);
          engine.startRound(1);
        }}
      />
    );
  }

  // Menu screen
  if (status === 'menu') {
    return (
      <TitleScreen
        onStart={() => setShowHowToPlay(true)}
        onLeaderboard={() => {}} // Placeholder for Phase 8
      />
    );
  }

  // Playing screen
  if (status === 'playing') {
    // Extract catcherX from gameState (rounds are 1-indexed, array is 0-indexed)
    const catcherX = gameState.catcher.x;
    const config = ROUND_CONFIG[round - 1];
    return (
      <GameplayScreen
        round={round}
        budget={budget}
        maxBudget={config.budget}
        timer={timer}
        maxTime={config.duration}
        slots={slots}
        activePowerUps={activePowerUps}
        catcherX={catcherX}
      />
    );
  }

  // Round complete screen
  if (status === 'round_complete') {
    return (
      <RoundCompleteScreen
        round={round}
        score={lastScore!}
        totalScore={totalScore}
        onNextRound={() => engine.nextRound()}
      />
    );
  }

  // Round failed screen
  if (status === 'round_failed') {
    const slotsFilledCount = slots.filter(s => s !== null).length;
    return (
      <RoundFailScreen
        round={round}
        failReason={failReason || 'timeout'}
        slotsFilledCount={slotsFilledCount}
        onRetry={() => engine.startRound(round)}
      />
    );
  }

  // Game over screen
  if (status === 'game_over') {
    return (
      <GameOverScreen
        totalScore={totalScore}
        onPlayAgain={() => engine.startRound(1)}
        onLeaderboard={() => {}} // Placeholder for Phase 8
      />
    );
  }

  // Fallback (should never reach)
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <p>Unknown game status: {status}</p>
    </div>
  );
}
