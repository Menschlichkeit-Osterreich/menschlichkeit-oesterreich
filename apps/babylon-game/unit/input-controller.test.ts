import { describe, expect, it } from 'vitest';

import { createInputController } from '../src/game/systems/input-controller';

describe('input-controller', () => {
  it('bildet Bewegungsrichtungen und Sprint korrekt aus Tastaturzustand ab', () => {
    const controller = createInputController(window);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' }));

    expect(controller.getSnapshot()).toEqual({
      moveX: 1,
      moveZ: 1,
      sprint: true,
    });

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft' }));

    expect(controller.getSnapshot()).toEqual({
      moveX: 0,
      moveZ: 0,
      sprint: false,
    });

    controller.dispose();
  });

  it('queued Jump und Interact genau einmal und entfernt Listener bei dispose', () => {
    const controller = createInputController(window);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', repeat: false }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', repeat: false }));

    expect(controller.consumeJump()).toBe(true);
    expect(controller.consumeJump()).toBe(false);
    expect(controller.consumeInteract()).toBe(true);
    expect(controller.consumeInteract()).toBe(false);

    controller.dispose();
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', repeat: false }));

    expect(controller.consumeJump()).toBe(false);
  });
});