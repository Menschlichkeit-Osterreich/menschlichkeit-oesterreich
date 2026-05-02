import { useCallback } from 'react';

function dispatchKey(code: string, type: 'keydown' | 'keyup') {
  window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
}

export function TouchControls({ visible }: { visible: boolean }) {
  const bindDirectional = useCallback((code: string) => {
    return {
      onPointerDown: () => dispatchKey(code, 'keydown'),
      onPointerUp: () => dispatchKey(code, 'keyup'),
      onPointerLeave: () => dispatchKey(code, 'keyup'),
      onPointerCancel: () => dispatchKey(code, 'keyup'),
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 md:hidden"
      aria-label="Touch Steuerung"
    >
      <div className="absolute bottom-4 left-4 grid grid-cols-3 gap-2 pointer-events-auto">
        <span />
        <button
          type="button"
          {...bindDirectional('ArrowUp')}
          className="rounded-xl bg-slate-900/80 px-4 py-2 text-xs text-white"
        >
          ▲
        </button>
        <span />
        <button
          type="button"
          {...bindDirectional('ArrowLeft')}
          className="rounded-xl bg-slate-900/80 px-4 py-2 text-xs text-white"
        >
          ◀
        </button>
        <button
          type="button"
          {...bindDirectional('ArrowDown')}
          className="rounded-xl bg-slate-900/80 px-4 py-2 text-xs text-white"
        >
          ▼
        </button>
        <button
          type="button"
          {...bindDirectional('ArrowRight')}
          className="rounded-xl bg-slate-900/80 px-4 py-2 text-xs text-white"
        >
          ▶
        </button>
      </div>
      <div className="absolute bottom-8 right-4 pointer-events-auto">
        <button
          type="button"
          onPointerDown={() => dispatchKey('KeyE', 'keydown')}
          onPointerUp={() => dispatchKey('KeyE', 'keyup')}
          className="rounded-full bg-orange-500/90 px-5 py-5 text-sm font-semibold text-slate-950 shadow-xl"
          aria-label="Interagieren"
        >
          E
        </button>
      </div>
    </div>
  );
}
