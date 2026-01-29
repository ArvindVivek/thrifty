/**
 * Unit tests for GameEngine input processing
 *
 * Tests cover:
 * - InputState integration (optional, backward compatible)
 * - Arrow key input sets catcher velocity
 * - Catcher position updates based on velocity
 */

import { GameEngine } from '../GameEngine';
import type { GameState, InputState } from '../types';
import { CATCHER_SPEED, CANVAS_WIDTH, CATCHER_WIDTH, PHYSICS_DT } from '../constants';

// Mock requestAnimationFrame and cancelAnimationFrame for node environment
let rafCallback: ((time: number) => void) | null = null;
let rafId = 0;

beforeAll(() => {
  global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
    rafCallback = callback;
    rafId++;
    return rafId;
  });

  global.cancelAnimationFrame = jest.fn((id: number) => {
    rafCallback = null;
  });

  // Mock performance.now
  if (!global.performance) {
    global.performance = {} as Performance;
  }
  global.performance.now = jest.fn(() => Date.now());
});

afterEach(() => {
  rafCallback = null;
});

// Helper to simulate a single RAF frame
function simulateFrame(time: number) {
  if (rafCallback) {
    const callback = rafCallback;
    rafCallback = null; // RAF is one-shot, reset before calling
    callback(time);
  }
}

// Helper to create mock InputState
function createMockInputState(keys: Record<string, boolean>): InputState {
  return {
    isKeyDown: (key: string) => keys[key] === true,
  };
}

// Helper to create initial game state
function createInitialState(): GameState {
  return {
    catcher: {
      x: (CANVAS_WIDTH - CATCHER_WIDTH) / 2,
      y: 480,
      width: CATCHER_WIDTH,
      height: 100,
      velocityX: 0,
    },
    items: [],
    slots: [null, null, null, null, null],
    budget: 4500,
    timer: 30000,
    round: 1,
    score: 0,
    totalScore: 0,
    status: 'menu',
    activePowerUps: [],
  };
}

describe('GameEngine', () => {
  describe('constructor', () => {
    it('should accept inputState as optional parameter', () => {
      const inputState = createMockInputState({});
      const state = createInitialState();

      // Should not throw
      const engine = new GameEngine({
        initialState: state,
        inputState,
      });

      expect(engine.getState()).toBeDefined();
    });

    it('should work without inputState (backward compatibility)', () => {
      const state = createInitialState();

      // Should not throw
      const engine = new GameEngine({
        initialState: state,
      });

      expect(engine.getState()).toBeDefined();
    });
  });

  describe('input processing', () => {
    describe('catcher velocity from input', () => {
      it('should set catcher velocity to -CATCHER_SPEED when ArrowLeft pressed', () => {
        const inputState = createMockInputState({ ArrowLeft: true });

        let capturedState: GameState | null = null;
        const engine = new GameEngine({
          initialState: createInitialState(),
          inputState,
          onStateChange: (s) => {
            capturedState = s;
          },
        });

        engine.startRound(1);
        engine.start();

        // Simulate frame with enough time for physics tick
        const startTime = performance.now();
        simulateFrame(startTime);
        simulateFrame(startTime + PHYSICS_DT * 2);

        engine.stop();

        // Verify velocity was set
        expect(capturedState).not.toBeNull();
        expect(capturedState!.catcher.velocityX).toBe(-CATCHER_SPEED);
      });

      it('should set catcher velocity to CATCHER_SPEED when ArrowRight pressed', () => {
        const inputState = createMockInputState({ ArrowRight: true });

        let capturedState: GameState | null = null;
        const engine = new GameEngine({
          initialState: createInitialState(),
          inputState,
          onStateChange: (s) => {
            capturedState = s;
          },
        });

        engine.startRound(1);
        engine.start();

        const startTime = performance.now();
        simulateFrame(startTime);
        simulateFrame(startTime + PHYSICS_DT * 2);

        engine.stop();

        expect(capturedState).not.toBeNull();
        expect(capturedState!.catcher.velocityX).toBe(CATCHER_SPEED);
      });

      it('should set catcher velocity to 0 when no keys pressed', () => {
        const inputState = createMockInputState({});

        let capturedState: GameState | null = null;
        const engine = new GameEngine({
          initialState: createInitialState(),
          inputState,
          onStateChange: (s) => {
            capturedState = s;
          },
        });

        engine.startRound(1);
        engine.start();

        const startTime = performance.now();
        simulateFrame(startTime);
        simulateFrame(startTime + PHYSICS_DT * 2);

        engine.stop();

        expect(capturedState).not.toBeNull();
        expect(capturedState!.catcher.velocityX).toBe(0);
      });

      it('should set catcher velocity to 0 when both ArrowLeft and ArrowRight pressed', () => {
        const inputState = createMockInputState({ ArrowLeft: true, ArrowRight: true });

        let capturedState: GameState | null = null;
        const engine = new GameEngine({
          initialState: createInitialState(),
          inputState,
          onStateChange: (s) => {
            capturedState = s;
          },
        });

        engine.startRound(1);
        engine.start();

        const startTime = performance.now();
        simulateFrame(startTime);
        simulateFrame(startTime + PHYSICS_DT * 2);

        engine.stop();

        expect(capturedState).not.toBeNull();
        expect(capturedState!.catcher.velocityX).toBe(0);
      });
    });

    describe('catcher position updates', () => {
      it('should update catcher position based on velocity over time', () => {
        const inputState = createMockInputState({ ArrowRight: true });

        let capturedState: GameState | null = null;
        const engine = new GameEngine({
          initialState: createInitialState(),
          inputState,
          onStateChange: (s) => {
            capturedState = s;
          },
        });

        engine.startRound(1);

        // Record initial position
        const initialX = engine.getState().catcher.x;

        engine.start();

        // Simulate multiple frames
        const startTime = performance.now();
        for (let i = 0; i < 5; i++) {
          simulateFrame(startTime + PHYSICS_DT * i);
        }

        engine.stop();

        // Catcher should have moved right
        expect(capturedState!.catcher.x).toBeGreaterThan(initialX);
      });

      it('should not move catcher when status is not playing', () => {
        const inputState = createMockInputState({ ArrowRight: true });

        let capturedState: GameState | null = null;
        const initialState = createInitialState();
        initialState.status = 'menu'; // Not playing

        const engine = new GameEngine({
          initialState,
          inputState,
          onStateChange: (s) => {
            capturedState = s;
          },
        });

        const initialX = engine.getState().catcher.x;

        engine.start();

        const startTime = performance.now();
        for (let i = 0; i < 5; i++) {
          simulateFrame(startTime + PHYSICS_DT * i);
        }

        engine.stop();

        // When not playing, physics should not update, so position unchanged
        expect(capturedState!.catcher.x).toBe(initialX);
      });

      it('should clamp catcher to left screen bound', () => {
        const inputState = createMockInputState({ ArrowLeft: true });

        let capturedState: GameState | null = null;
        const engine = new GameEngine({
          initialState: createInitialState(),
          inputState,
          onStateChange: (s) => {
            capturedState = s;
          },
        });

        engine.startRound(1);
        // Set position near left edge
        engine.getState().catcher.x = 10;

        engine.start();

        // Simulate enough frames to push past left edge
        const startTime = performance.now();
        for (let i = 0; i < 20; i++) {
          simulateFrame(startTime + PHYSICS_DT * i);
        }

        engine.stop();

        // Should be clamped to 0
        expect(capturedState!.catcher.x).toBeGreaterThanOrEqual(0);
      });

      it('should clamp catcher to right screen bound', () => {
        const inputState = createMockInputState({ ArrowRight: true });

        let capturedState: GameState | null = null;
        const engine = new GameEngine({
          initialState: createInitialState(),
          inputState,
          onStateChange: (s) => {
            capturedState = s;
          },
        });

        engine.startRound(1);
        // Set position near right edge
        engine.getState().catcher.x = CANVAS_WIDTH - CATCHER_WIDTH - 10;

        engine.start();

        // Simulate enough frames to push past right edge
        const startTime = performance.now();
        for (let i = 0; i < 20; i++) {
          simulateFrame(startTime + PHYSICS_DT * i);
        }

        engine.stop();

        // Should be clamped to max right position
        expect(capturedState!.catcher.x).toBeLessThanOrEqual(CANVAS_WIDTH - CATCHER_WIDTH);
      });
    });

    describe('backward compatibility', () => {
      it('should work without inputState (catcher does not move from keyboard)', () => {
        let capturedState: GameState | null = null;
        const engine = new GameEngine({
          initialState: createInitialState(),
          // No inputState provided
          onStateChange: (s) => {
            capturedState = s;
          },
        });

        engine.startRound(1);

        engine.start();

        const startTime = performance.now();
        for (let i = 0; i < 5; i++) {
          simulateFrame(startTime + PHYSICS_DT * i);
        }

        engine.stop();

        // Without inputState, velocity should remain at 0 (from startRound reset)
        expect(capturedState!.catcher.velocityX).toBe(0);
      });
    });
  });

  describe('lifecycle', () => {
    it('should start and stop without errors', () => {
      const engine = new GameEngine({
        initialState: createInitialState(),
      });

      expect(() => {
        engine.start();
        engine.stop();
      }).not.toThrow();
    });

    it('should report running state correctly', () => {
      const engine = new GameEngine({
        initialState: createInitialState(),
      });

      expect(engine.isRunning()).toBe(false);

      engine.start();
      expect(engine.isRunning()).toBe(true);

      engine.stop();
      expect(engine.isRunning()).toBe(false);
    });

    it('should not start twice', () => {
      // Clear RAF mock to get accurate count for this test
      (global.requestAnimationFrame as jest.Mock).mockClear();

      const engine = new GameEngine({
        initialState: createInitialState(),
      });

      engine.start();
      const callsAfterFirstStart = (global.requestAnimationFrame as jest.Mock).mock.calls.length;

      engine.start(); // Should be a no-op

      expect(engine.isRunning()).toBe(true);
      // Should not have called RAF again
      expect((global.requestAnimationFrame as jest.Mock).mock.calls.length).toBe(callsAfterFirstStart);

      engine.stop();
    });
  });
});
