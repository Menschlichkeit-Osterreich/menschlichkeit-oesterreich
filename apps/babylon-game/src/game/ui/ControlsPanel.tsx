import { GAME_CONTROLS } from '@/game/state/game-types';

export function ControlsPanel({ visible }: { visible: boolean }) {
  if (!visible) {
    return null;
  }

  return (
    <aside className="absolute right-4 top-4 hidden w-72 rounded-2xl border border-white/10 bg-slate-950/75 p-4 text-sm text-slate-200 shadow-2xl backdrop-blur lg:block">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Steuerung</p>
      <ul className="mt-3 space-y-2">
        {GAME_CONTROLS.map(control => (
          <li key={control} className="rounded-lg bg-slate-900/80 px-3 py-2">
            {control}
          </li>
        ))}
      </ul>
    </aside>
  );
}
