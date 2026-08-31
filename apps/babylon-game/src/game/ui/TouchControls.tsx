import { useCallback } from 'react';

function dispatchKey(code: string, type: 'keydown' | 'keyup') {
  window.dispatchEvent(new KeyboardEvent(type, { code, bubbles: true }));
}

const DIRECTIONS = [
  { code: 'ArrowUp', glyph: '▲', label: 'Vorwärts', cell: 'col-start-2 row-start-1' },
  { code: 'ArrowLeft', glyph: '◀', label: 'Nach links', cell: 'col-start-1 row-start-2' },
  { code: 'ArrowDown', glyph: '▼', label: 'Rückwärts', cell: 'col-start-2 row-start-2' },
  { code: 'ArrowRight', glyph: '▶', label: 'Nach rechts', cell: 'col-start-3 row-start-2' },
] as const;

/**
 * Trefferflächen nach Handoff: Steuerkreuz 64 px, Aktionstaste 88 px.
 */
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
    <div className="pointer-events-none absolute inset-0 z-20 md:hidden" aria-label="Touchsteuerung">
      <div className="pointer-events-auto absolute bottom-6 left-6 grid grid-cols-3 grid-rows-2 gap-1.5">
        {DIRECTIONS.map(direction => (
          <button
            key={direction.code}
            type="button"
            {...bindDirectional(direction.code)}
            aria-label={direction.label}
            className={`${direction.cell} h-16 w-16 rounded-sm border border-moe-hud-rule bg-moe-hud text-[18px] leading-none text-moe-paper active:bg-moe-signal-tief`}
          >
            <span aria-hidden="true">{direction.glyph}</span>
          </button>
        ))}
      </div>

      <div className="pointer-events-auto absolute bottom-6 right-6">
        <button
          type="button"
          onPointerDown={() => dispatchKey('KeyE', 'keydown')}
          onPointerUp={() => dispatchKey('KeyE', 'keyup')}
          onPointerCancel={() => dispatchKey('KeyE', 'keyup')}
          className="h-[88px] w-[88px] rounded-sm bg-moe-signal font-mono text-[22px] font-medium text-moe-ink-tief active:bg-moe-signal-tief"
          aria-label="Interagieren"
        >
          E
        </button>
      </div>
    </div>
  );
}
