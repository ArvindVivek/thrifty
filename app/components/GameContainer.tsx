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

import { useGame } from '@/app/contexts/GameContext';
import { getRankTitle } from '@/app/lib/scoreCalculator';

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
  } = gameState;

  // Menu screen
  if (status === 'menu') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-8">THRIFTY</h1>
        <p className="text-lg text-gray-400 mb-8">
          Catch items to fill your slots without busting the budget!
        </p>
        <button
          onClick={() => engine.startRound(1)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition-colors"
        >
          Start Game
        </button>
      </div>
    );
  }

  // Playing screen with debug display
  if (status === 'playing') {
    const filledSlots = slots.filter((s) => s !== null).length;
    const { catcher } = gameState;

    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Round {round}/5</h2>

        {/* Debug display */}
        <div className="bg-gray-800 p-4 rounded-lg font-mono text-sm space-y-2">
          <div>Status: {status}</div>
          <div>Round: {round}/5</div>
          <div>Budget: ${budget.toLocaleString()}</div>
          <div>Timer: {(timer / 1000).toFixed(1)}s</div>
          <div>Total Score: {totalScore.toLocaleString()}</div>
          <div>Items on screen: {items.length}</div>
          <div>Filled slots: {filledSlots}/5</div>
          <div>Active power-ups: {activePowerUps.length}</div>
          <div>Engine running: {engine.isRunning() ? 'Yes' : 'No'}</div>
          <div className="border-t border-gray-700 pt-2 mt-2">
            <div className="text-yellow-400">Catcher X: {Math.round(catcher.x)}px</div>
            <div className="text-yellow-400">Velocity: {catcher.velocityX}</div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Press ← → arrow keys to move catcher
          </div>
        </div>
      </div>
    );
  }

  // Round complete screen
  if (status === 'round_complete') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4 text-green-500">
          Round {round} Complete!
        </h2>
        <p className="text-xl mb-8">Total Score: {totalScore.toLocaleString()}</p>
        <button
          onClick={() => engine.nextRound()}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition-colors"
        >
          Next Round
        </button>
      </div>
    );
  }

  // Round failed screen
  if (status === 'round_failed') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4 text-red-500">Round Failed!</h2>
        <p className="text-lg text-gray-400 mb-8">
          {gameState.failReason === 'bust'
            ? 'You went over budget!'
            : 'Time ran out!'}
        </p>
        <button
          onClick={() => engine.startRound(round)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition-colors"
        >
          Retry Round
        </button>
      </div>
    );
  }

  // Game over screen
  if (status === 'game_over') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4 text-yellow-500">Game Over!</h2>
        <p className="text-xl mb-2">Final Score: {totalScore.toLocaleString()}</p>
        <p className="text-lg text-gray-400 mb-8">
          Rank: {getRankTitle(totalScore).rank}
        </p>
        <button
          onClick={() => engine.startRound(1)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold transition-colors"
        >
          Play Again
        </button>
      </div>
    );
  }

  // Fallback (should never reach)
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <p>Unknown game status: {status}</p>
    </div>
  );
}
