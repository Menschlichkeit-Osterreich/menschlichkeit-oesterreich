export interface InputSnapshot {
  moveX: number;
  moveZ: number;
  sprint: boolean;
}

export function createInputController(target: Window) {
  const pressedKeys = new Set<string>();
  let jumpQueued = false;
  let interactQueued = false;

  const onKeyDown = (event: KeyboardEvent) => {
    pressedKeys.add(event.code);
    if (event.code === 'Space' && !event.repeat) {
      jumpQueued = true;
    }
    if ((event.code === 'KeyE' || event.code === 'Enter') && !event.repeat) {
      interactQueued = true;
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    pressedKeys.delete(event.code);
  };

  target.addEventListener('keydown', onKeyDown);
  target.addEventListener('keyup', onKeyUp);

  return {
    getSnapshot(): InputSnapshot {
      const left = pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft');
      const right = pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight');
      const forward = pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp');
      const backward = pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown');

      return {
        moveX: Number(right) - Number(left),
        moveZ: Number(forward) - Number(backward),
        sprint: pressedKeys.has('ShiftLeft') || pressedKeys.has('ShiftRight'),
      };
    },
    consumeJump(): boolean {
      const shouldJump = jumpQueued;
      jumpQueued = false;
      return shouldJump;
    },
    consumeInteract(): boolean {
      const shouldInteract = interactQueued;
      interactQueued = false;
      return shouldInteract;
    },
    dispose() {
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
    },
  };
}

export type InputController = ReturnType<typeof createInputController>;
