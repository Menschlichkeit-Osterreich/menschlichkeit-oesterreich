import { GAME_CONTROLS } from '@/game/state/game-types';

/**
 * Zone unten links — Steuerung.
 * Zwei Zeilen in IBM Plex Mono 13 px statt einer Liste mit vier Kästen.
 */
export function ControlsPanel({ visible }: { visible: boolean }) {
  if (!visible) {
    return null;
  }

  const [first, second] = [GAME_CONTROLS.slice(0, 2), GAME_CONTROLS.slice(2)];

  return (
    <aside
      className="hidden border border-moe-hud-rule bg-moe-hud-soft px-4 py-3 lg:block"
      aria-label="Steuerung"
    >
      <p className="font-mono text-[12px] uppercase leading-none tracking-[0.16em] text-moe-ink-on-dark-muted">
        Steuerung
      </p>
      <p className="mt-2 font-mono text-[13px] leading-relaxed text-moe-ink-on-dark">
        {first.join(' · ')}
      </p>
      <p className="font-mono text-[13px] leading-relaxed text-moe-ink-on-dark">
        {second.join(' · ')}
      </p>
    </aside>
  );
}
