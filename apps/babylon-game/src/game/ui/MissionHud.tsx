import type { GameHudState } from '@/game/state/game-types';

const MISSION_STATUS_LABELS: Record<GameHudState['mission']['status'], string> = {
  ready: 'Bereit',
  active: 'Läuft',
  completed: 'Abgeschlossen',
  failed: 'Fehlgeschlagen',
};

function getMissionStages(hud: GameHudState) {
  const collectedDone = hud.totalCollectibles > 0 && hud.collected >= hud.totalCollectibles;
  const coreDone = hud.goalUnlocked || hud.phase === 'success';
  const beaconDone = hud.phase === 'success';

  return [
    {
      label: '1. Zuhören',
      detail: `Impulse sichern (${hud.collected}/${hud.totalCollectibles})`,
      done: collectedDone,
      active: !collectedDone,
    },
    {
      label: '2. Verbinden',
      detail: 'Gemeinschaftskern zum Treffpunkt bringen',
      done: coreDone,
      active: collectedDone && !coreDone,
    },
    {
      label: '3. Handeln',
      detail: 'Treffpunkt öffnen und Runde abschließen',
      done: beaconDone,
      active: coreDone && !beaconDone,
    },
  ];
}

export function MissionHud({ hud }: { hud: GameHudState }) {
  return (
    <>
      <div className="absolute left-4 top-4 flex max-w-xl flex-wrap gap-3">
        <div
          className="rounded-2xl border border-orange-400/20 bg-slate-950/82 px-4 py-3 shadow-2xl backdrop-blur"
          role="status"
          aria-live="polite"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-amber-300">Brücken bauen</p>
          <p className="mt-1 text-base font-semibold text-amber-50">{hud.activeScenario.title}</p>
          <p className="text-sm text-slate-300">{hud.status}</p>
          <p className="mt-2 text-xs text-slate-400">
            {hud.activeRole.title} · {hud.activeScenario.difficultyLabel}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-slate-950/82 p-3 text-sm shadow-2xl backdrop-blur sm:grid-cols-4">
          <div className="rounded-lg bg-slate-900/80 px-3 py-2">
            <div className="text-slate-400">Impulse</div>
            <div className="font-medium">
              {hud.collected}/{hud.totalCollectibles}
            </div>
          </div>
          <div className="rounded-lg bg-slate-900/80 px-3 py-2">
            <div className="text-slate-400">Restzeit</div>
            <div className="font-medium">{hud.remainingSeconds.toFixed(1)}s</div>
          </div>
          <div className="rounded-lg bg-slate-900/80 px-3 py-2">
            <div className="text-slate-400">Treffpunkt</div>
            <div className="font-medium">{hud.goalUnlocked ? 'bereit' : 'noch geschlossen'}</div>
          </div>
          <div className="rounded-lg bg-slate-900/80 px-3 py-2">
            <div className="text-slate-400">Ort</div>
            <div className="font-medium">
              {hud.environment === 'scene-loader' ? 'Freie Szene' : 'Lernplatz'}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 max-w-md space-y-3">
        <div className="rounded-2xl border border-white/10 bg-slate-950/75 p-4 shadow-2xl backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mission</p>
          <p className="mt-2 text-sm text-slate-200">{hud.hint}</p>
          <p className="mt-2 text-xs text-amber-100">
            Zielstatus · {MISSION_STATUS_LABELS[hud.mission.status]}
          </p>
          <div className="mt-3 space-y-2">
            {getMissionStages(hud).map(stage => (
              <div
                key={stage.label}
                className={`rounded-lg px-3 py-2 text-xs ${
                  stage.done
                    ? 'bg-emerald-500/15 text-emerald-100'
                    : stage.active
                      ? 'bg-orange-500/15 text-amber-100'
                      : 'bg-slate-900/80 text-slate-300'
                }`}
              >
                <p className="font-semibold">{stage.label}</p>
                <p>{stage.detail}</p>
              </div>
            ))}
          </div>
        </div>
        {hud.interactionPrompt ? (
          <div className="rounded-2xl border border-orange-400/40 bg-orange-500/10 p-4 shadow-2xl backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Interaktion</p>
            <p className="mt-2 text-sm font-medium text-amber-50">{hud.interactionPrompt}</p>
          </div>
        ) : null}
      </div>
    </>
  );
}
