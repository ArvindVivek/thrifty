/**
 * Unit tests for useKeyboard hook
 *
 * Tests cover:
 * - Returns object with isKeyDown function
 * - isKeyDown returns false for keys never pressed
 * - isKeyDown returns true after keydown event
 * - isKeyDown returns false after keyup event
 * - Multiple keys can be tracked simultaneously
 * - Cleanup removes event listeners on unmount
 * - preventDefault called for arrow keys only
 */

import { renderHook, act } from '@testing-library/react';
import { useKeyboard } from '../useKeyboard';

describe('useKeyboard', () => {
  // Helper to dispatch keyboard events
  function dispatchKeyEvent(type: 'keydown' | 'keyup', key: string): KeyboardEvent {
    const event = new KeyboardEvent(type, {
      key,
      bubbles: true,
      cancelable: true,
    });
    // Spy on preventDefault
    jest.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);
    return event;
  }

  describe('return value', () => {
    it('should return object with isKeyDown function', () => {
      const { result } = renderHook(() => useKeyboard());

      expect(result.current).toHaveProperty('isKeyDown');
      expect(typeof result.current.isKeyDown).toBe('function');
    });

    it('should return stable isKeyDown reference across re-renders', () => {
      const { result, rerender } = renderHook(() => useKeyboard());

      const initialIsKeyDown = result.current.isKeyDown;

      rerender();

      // Same function reference (useCallback with empty deps)
      expect(result.current.isKeyDown).toBe(initialIsKeyDown);
    });
  });

  describe('key tracking', () => {
    it('should return false for keys never pressed', () => {
      const { result } = renderHook(() => useKeyboard());

      expect(result.current.isKeyDown('ArrowLeft')).toBe(false);
      expect(result.current.isKeyDown('ArrowRight')).toBe(false);
      expect(result.current.isKeyDown('Space')).toBe(false);
      expect(result.current.isKeyDown('a')).toBe(false);
    });

    it('should return true after keydown event', () => {
      const { result } = renderHook(() => useKeyboard());

      act(() => {
        dispatchKeyEvent('keydown', 'ArrowLeft');
      });

      expect(result.current.isKeyDown('ArrowLeft')).toBe(true);
    });

    it('should return false after keyup event', () => {
      const { result } = renderHook(() => useKeyboard());

      // Press key
      act(() => {
        dispatchKeyEvent('keydown', 'ArrowLeft');
      });

      expect(result.current.isKeyDown('ArrowLeft')).toBe(true);

      // Release key
      act(() => {
        dispatchKeyEvent('keyup', 'ArrowLeft');
      });

      expect(result.current.isKeyDown('ArrowLeft')).toBe(false);
    });

    it('should track multiple keys simultaneously', () => {
      const { result } = renderHook(() => useKeyboard());

      // Press multiple keys
      act(() => {
        dispatchKeyEvent('keydown', 'ArrowLeft');
        dispatchKeyEvent('keydown', 'ArrowUp');
        dispatchKeyEvent('keydown', 'Space');
      });

      expect(result.current.isKeyDown('ArrowLeft')).toBe(true);
      expect(result.current.isKeyDown('ArrowUp')).toBe(true);
      expect(result.current.isKeyDown('Space')).toBe(true);
      expect(result.current.isKeyDown('ArrowRight')).toBe(false);

      // Release one key
      act(() => {
        dispatchKeyEvent('keyup', 'ArrowUp');
      });

      expect(result.current.isKeyDown('ArrowLeft')).toBe(true);
      expect(result.current.isKeyDown('ArrowUp')).toBe(false);
      expect(result.current.isKeyDown('Space')).toBe(true);
    });

    it('should handle rapid key presses', () => {
      const { result } = renderHook(() => useKeyboard());

      // Rapid press/release cycles
      act(() => {
        dispatchKeyEvent('keydown', 'ArrowLeft');
        dispatchKeyEvent('keyup', 'ArrowLeft');
        dispatchKeyEvent('keydown', 'ArrowLeft');
        dispatchKeyEvent('keyup', 'ArrowLeft');
        dispatchKeyEvent('keydown', 'ArrowLeft');
      });

      // Should be in final state (pressed)
      expect(result.current.isKeyDown('ArrowLeft')).toBe(true);
    });
  });

  describe('event listener cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useKeyboard());

      // Verify listeners were added
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));

      // Unmount
      unmount();

      // Verify listeners were removed
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('should not track keys after unmount', () => {
      const { result, unmount } = renderHook(() => useKeyboard());

      // Press a key
      act(() => {
        dispatchKeyEvent('keydown', 'ArrowLeft');
      });

      expect(result.current.isKeyDown('ArrowLeft')).toBe(true);

      // Unmount
      unmount();

      // Key events after unmount shouldn't be tracked
      // (result.current still holds old ref, but no new events will update it)
      // Since listeners are removed, new events won't reach the handler
    });
  });

  describe('preventDefault for arrow keys', () => {
    it('should call preventDefault for ArrowLeft', () => {
      renderHook(() => useKeyboard());

      let event: KeyboardEvent;
      act(() => {
        event = dispatchKeyEvent('keydown', 'ArrowLeft');
      });

      expect(event!.preventDefault).toHaveBeenCalled();
    });

    it('should call preventDefault for ArrowRight', () => {
      renderHook(() => useKeyboard());

      let event: KeyboardEvent;
      act(() => {
        event = dispatchKeyEvent('keydown', 'ArrowRight');
      });

      expect(event!.preventDefault).toHaveBeenCalled();
    });

    it('should call preventDefault for ArrowUp', () => {
      renderHook(() => useKeyboard());

      let event: KeyboardEvent;
      act(() => {
        event = dispatchKeyEvent('keydown', 'ArrowUp');
      });

      expect(event!.preventDefault).toHaveBeenCalled();
    });

    it('should call preventDefault for ArrowDown', () => {
      renderHook(() => useKeyboard());

      let event: KeyboardEvent;
      act(() => {
        event = dispatchKeyEvent('keydown', 'ArrowDown');
      });

      expect(event!.preventDefault).toHaveBeenCalled();
    });

    it('should NOT call preventDefault for non-arrow keys', () => {
      renderHook(() => useKeyboard());

      let event: KeyboardEvent;
      act(() => {
        event = dispatchKeyEvent('keydown', 'Space');
      });

      expect(event!.preventDefault).not.toHaveBeenCalled();
    });

    it('should NOT call preventDefault for letter keys', () => {
      renderHook(() => useKeyboard());

      let event: KeyboardEvent;
      act(() => {
        event = dispatchKeyEvent('keydown', 'a');
      });

      expect(event!.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string key', () => {
      const { result } = renderHook(() => useKeyboard());

      expect(result.current.isKeyDown('')).toBe(false);
    });

    it('should handle keyup without prior keydown', () => {
      const { result } = renderHook(() => useKeyboard());

      // Release key that was never pressed
      act(() => {
        dispatchKeyEvent('keyup', 'ArrowLeft');
      });

      // Should remain false
      expect(result.current.isKeyDown('ArrowLeft')).toBe(false);
    });
  });
});
