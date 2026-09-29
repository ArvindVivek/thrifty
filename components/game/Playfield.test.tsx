// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Playfield } from './Playfield';

// jsdom has no PointerEvent, so fireEvent.pointerDown would drop clientX and pointerId
class TestPointerEvent extends MouseEvent {
  pointerId: number;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 0;
  }
}
window.PointerEvent ??= TestPointerEvent as unknown as typeof PointerEvent;

const base = { items: [], catcherX: 196, activePowerUps: [], budget: 5000, slots: [null, null, null, null, null] };

describe('Playfield steering', () => {
  it('turns a press on the field into a play-area x (screen px / scale)', () => {
    const onPointerTarget = vi.fn();
    render(<Playfield {...base} scale={0.5} onPointerTarget={onPointerTarget} />);
    const field = screen.getByTestId('playfield');
    field.getBoundingClientRect = () => ({ left: 100, top: 0, width: 240, height: 300, right: 340, bottom: 300, x: 100, y: 0, toJSON() {} });
    field.setPointerCapture = vi.fn();

    fireEvent.pointerDown(field, { clientX: 220, pointerId: 1 });
    expect(onPointerTarget).toHaveBeenLastCalledWith(240);
    expect(field.setPointerCapture).toHaveBeenCalledWith(1);

    fireEvent.pointerUp(field, { pointerId: 1 });
    expect(onPointerTarget).toHaveBeenLastCalledWith(null);
  });

  it('never captures a press meant for a button on top of the field (the Start round card)', () => {
    // Regression: capturing the pointer sent the button's click to the field, so
    // "Start round" did nothing on a real mouse or finger.
    const onPointerTarget = vi.fn();
    const onBegin = vi.fn();
    render(
      <Playfield
        {...base}
        scale={1}
        onPointerTarget={onPointerTarget}
        overlay={
          <button type="button" onClick={onBegin}>
            Start round
          </button>
        }
      />
    );
    const field = screen.getByTestId('playfield');
    field.setPointerCapture = vi.fn();

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Start round' }), { clientX: 10, pointerId: 1 });

    expect(field.setPointerCapture).not.toHaveBeenCalled();
    expect(onPointerTarget).not.toHaveBeenCalled();
  });

  it('does not steer at all when no steering handler is given (the ready screen)', () => {
    render(<Playfield {...base} scale={1} />);
    const field = screen.getByTestId('playfield');
    field.setPointerCapture = vi.fn();
    fireEvent.pointerDown(field, { clientX: 10, pointerId: 1 });
    expect(field.setPointerCapture).not.toHaveBeenCalled();
  });
});
