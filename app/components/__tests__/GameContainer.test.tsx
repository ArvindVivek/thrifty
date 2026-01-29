/**
 * Unit tests for GameContainer component
 *
 * Tests cover:
 * - Menu screen renders when status is 'menu'
 * - Clicking Start button calls engine.startRound(1)
 * - Playing screen shows debug values
 * - Round complete screen has Next Round button
 * - Round failed screen has Retry button
 * - Game over screen has Play Again button
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameContainer } from '../GameContainer';
import { useGame } from '@/app/contexts/GameContext';
import type { GameState, PowerUpEffect } from '@/app/lib/types';

// Mock useGame hook
jest.mock('@/app/contexts/GameContext', () => ({
  useGame: jest.fn(),
}));

// Mock getRankTitle function
jest.mock('@/app/lib/scoreCalculator', () => ({
  getRankTitle: jest.fn((score: number) => {
    if (score >= 35000) return { rank: 'Legend', title: 'Thrifty Legend' };
    if (score >= 30000) return { rank: 'Pro', title: 'Thrifty Pro' };
    if (score >= 25000) return { rank: 'Expert', title: 'Thrifty Expert' };
    if (score >= 20000) return { rank: 'Skilled', title: 'Thrifty Skilled' };
    if (score >= 15000) return { rank: 'Adept', title: 'Thrifty Adept' };
    return { rank: 'Rookie', title: 'Thrifty Rookie' };
  }),
}));

const mockUseGame = useGame as jest.MockedFunction<typeof useGame>;

// Helper to create mock game state
function createMockGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    catcher: { x: 360, y: 490, width: 80, height: 100, velocityX: 0 },
    items: [],
    slots: [null, null, null, null, null],
    budget: 4500,
    timer: 30000,
    round: 1,
    score: 0,
    totalScore: 0,
    status: 'menu',
    activePowerUps: [],
    ...overrides,
  };
}

// Helper to create mock engine
function createMockEngine() {
  return {
    startRound: jest.fn(),
    nextRound: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    isRunning: jest.fn(() => true),
    getState: jest.fn(),
    getBudgetPercent: jest.fn(() => 100),
    getTimerSeconds: jest.fn(() => 30),
    getFilledSlotCount: jest.fn(() => 0),
  };
}

describe('GameContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Menu screen', () => {
    it('should render menu screen when status is menu', () => {
      const mockEngine = createMockEngine();
      mockUseGame.mockReturnValue({
        engine: mockEngine as any,
        gameState: createMockGameState({ status: 'menu' }),
      });

      render(<GameContainer />);

      expect(screen.getByText('THRIFTY')).toBeInTheDocument();
      expect(screen.getByText('Start Game')).toBeInTheDocument();
    });

    it('should call engine.startRound(1) when clicking Start button', () => {
      const mockEngine = createMockEngine();
      mockUseGame.mockReturnValue({
        engine: mockEngine as any,
        gameState: createMockGameState({ status: 'menu' }),
      });

      render(<GameContainer />);

      fireEvent.click(screen.getByText('Start Game'));

      expect(mockEngine.startRound).toHaveBeenCalledWith(1);
      expect(mockEngine.startRound).toHaveBeenCalledTimes(1);
    });
  });

  describe('Playing screen', () => {
    it('should render playing screen with debug display when status is playing', () => {
      const mockEngine = createMockEngine();
      mockUseGame.mockReturnValue({
        engine: mockEngine as any,
        gameState: createMockGameState({
          status: 'playing',
          round: 2,
          budget: 3500,
          timer: 25000,
          totalScore: 1500,
          items: [{} as any, {} as any, {} as any],
          slots: [{} as any, {} as any, null, null, null],
          activePowerUps: [{ type: 'slow_motion', duration: 5000, active: true } as PowerUpEffect],
        }),
      });

      render(<GameContainer />);

      // Check debug display values
      expect(screen.getByText('Status: playing')).toBeInTheDocument();
      expect(screen.getByText('Round: 2/5')).toBeInTheDocument();
      expect(screen.getByText('Budget: $3,500')).toBeInTheDocument();
      expect(screen.getByText('Timer: 25.0s')).toBeInTheDocument();
      expect(screen.getByText('Total Score: 1,500')).toBeInTheDocument();
      expect(screen.getByText('Items on screen: 3')).toBeInTheDocument();
      expect(screen.getByText('Filled slots: 2/5')).toBeInTheDocument();
      expect(screen.getByText('Active power-ups: 1')).toBeInTheDocument();
      expect(screen.getByText('Engine running: Yes')).toBeInTheDocument();
    });

    it('should show Engine running: No when engine is not running', () => {
      const mockEngine = createMockEngine();
      mockEngine.isRunning.mockReturnValue(false);
      mockUseGame.mockReturnValue({
        engine: mockEngine as any,
        gameState: createMockGameState({ status: 'playing' }),
      });

      render(<GameContainer />);

      expect(screen.getByText('Engine running: No')).toBeInTheDocument();
    });
  });

  describe('Round complete screen', () => {
    it('should render round complete screen with Next Round button', () => {
      const mockEngine = createMockEngine();
      mockUseGame.mockReturnValue({
        engine: mockEngine as any,
        gameState: createMockGameState({
          status: 'round_complete',
          round: 2,
          totalScore: 5000,
        }),
      });

      render(<GameContainer />);

      expect(screen.getByText('Round 2 Complete!')).toBeInTheDocument();
      expect(screen.getByText('Total Score: 5,000')).toBeInTheDocument();
      expect(screen.getByText('Next Round')).toBeInTheDocument();
    });

    it('should call engine.nextRound() when clicking Next Round button', () => {
      const mockEngine = createMockEngine();
      mockUseGame.mockReturnValue({
        engine: mockEngine as any,
        gameState: createMockGameState({ status: 'round_complete', round: 2 }),
      });

      render(<GameContainer />);

      fireEvent.click(screen.getByText('Next Round'));

      expect(mockEngine.nextRound).toHaveBeenCalledTimes(1);
    });
  });

  describe('Round failed screen', () => {
    it('should render round failed screen with Retry button for bust', () => {
      const mockEngine = createMockEngine();
      mockUseGame.mockReturnValue({
        engine: mockEngine as any,
        gameState: createMockGameState({
          status: 'round_failed',
          round: 3,
          failReason: 'bust',
        }),
      });

      render(<GameContainer />);

      expect(screen.getByText('Round Failed!')).toBeInTheDocument();
      expect(screen.getByText('You went over budget!')).toBeInTheDocument();
      expect(screen.getByText('Retry Round')).toBeInTheDocument();
    });

    it('should show timeout message for timeout fail reason', () => {
      const mockEngine = createMockEngine();
      mockUseGame.mockReturnValue({
        engine: mockEngine as any,
        gameState: createMockGameState({
          status: 'round_failed',
          round: 3,
          failReason: 'timeout',
        }),
      });

      render(<GameContainer />);

      expect(screen.getByText('Time ran out!')).toBeInTheDocument();
    });

    it('should call engine.startRound(round) when clicking Retry button', () => {
      const mockEngine = createMockEngine();
      mockUseGame.mockReturnValue({
        engine: mockEngine as any,
        gameState: createMockGameState({ status: 'round_failed', round: 3 }),
      });

      render(<GameContainer />);

      fireEvent.click(screen.getByText('Retry Round'));

      expect(mockEngine.startRound).toHaveBeenCalledWith(3);
    });
  });

  describe('Game over screen', () => {
    it('should render game over screen with final score and Play Again button', () => {
      const mockEngine = createMockEngine();
      mockUseGame.mockReturnValue({
        engine: mockEngine as any,
        gameState: createMockGameState({
          status: 'game_over',
          totalScore: 25000,
          lastScore: {
            baseScore: 20000,
            itemValue: 15000,
            budgetBonus: 2500,
            timeBonus: 2500,
            combos: [],
            multiplier: 1.25,
            totalScore: 25000,
          },
        }),
      });

      render(<GameContainer />);

      expect(screen.getByText('Game Over!')).toBeInTheDocument();
      expect(screen.getByText('Final Score: 25,000')).toBeInTheDocument();
      expect(screen.getByText('Rank: Expert')).toBeInTheDocument();
      expect(screen.getByText('Play Again')).toBeInTheDocument();
    });

    it('should call engine.startRound(1) when clicking Play Again button', () => {
      const mockEngine = createMockEngine();
      mockUseGame.mockReturnValue({
        engine: mockEngine as any,
        gameState: createMockGameState({ status: 'game_over' }),
      });

      render(<GameContainer />);

      fireEvent.click(screen.getByText('Play Again'));

      expect(mockEngine.startRound).toHaveBeenCalledWith(1);
    });
  });
});
