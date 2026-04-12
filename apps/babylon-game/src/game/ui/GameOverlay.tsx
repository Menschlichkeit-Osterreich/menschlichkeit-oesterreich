import { GAME_CONTROLS, type GameHudState } from '@/game/state/game-types';

const MISSION_STATUS_LABELS: Record<GameHudState['mission']['status'], string> = {
  ready: 'Bereit',
  active: 'Läuft',
  completed: 'Abgeschlossen',
  failed: 'Fehlgeschlagen',
};

function getPrimaryLabel(phase: GameHudState['phase']) {
  switch (phase) {
    case 'start':
      return 'Mission beginnen';
    case 'success':
    case 'fail':
      return 'Erneut spielen';
    default:
      return 'Lädt …';
  }
}

function getResultTitle(phase: GameHudState['phase']) {
  return phase === 'success' ? 'Gemeinsam geschafft' : 'Noch nicht geschafft';
}

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

function getRoleSummary(hud: GameHudState) {
  const speed = Math.round((hud.activeRole.moveSpeedMultiplier ?? 1) * 100);
  const timeBonus = hud.activeRole.timeBonusSeconds ?? 0;
  const reach = Math.round((hud.activeRole.interactionRadiusMultiplier ?? 1) * 100);
  return `Tempo ${speed}% · Zeitbonus ${timeBonus}s · Reichweite ${reach}%`;
}

export function GameOverlay({
  hud,
  onPrimaryAction,
  onRoleSelect,
  onScenarioSelect,
}: {
  hud: GameHudState;
  onPrimaryAction: () => void;
  onRoleSelect: (roleId: string) => void;
  onScenarioSelect: (scenarioId: string) => void;
}) {
  const isInteractive = hud.phase === 'start' || hud.phase === 'success' || hud.phase === 'fail';
  const isDialogVisible = hud.phase === 'start' || hud.phase === 'success' || hud.phase === 'fail';
  const showInGameHud = hud.phase === 'playing';

  return (
    <div className="pointer-events-none absolute inset-0 text-slate-50">
      {showInGameHud ? (
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
      ) : (
        <div className="absolute left-4 top-4 rounded-full border border-orange-400/20 bg-slate-950/78 px-4 py-2 text-xs text-amber-100 shadow-xl backdrop-blur">
          Menschlichkeit Österreich · {hud.activeScenario.title}
        </div>
      )}

      {hud.phase === 'playing' ? (
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
      ) : null}

      <aside
        className={`absolute right-4 top-4 w-72 rounded-2xl border border-white/10 bg-slate-950/75 p-4 text-sm text-slate-200 shadow-2xl backdrop-blur ${showInGameHud ? 'hidden lg:block' : 'hidden'}`}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Steuerung</p>
        <ul className="mt-3 space-y-2">
          {GAME_CONTROLS.map(control => (
            <li key={control} className="rounded-lg bg-slate-900/80 px-3 py-2">
              {control}
            </li>
          ))}
        </ul>
      </aside>

      {isDialogVisible ? (
        <div className="absolute inset-x-0 bottom-0 flex justify-center p-4 sm:p-6">
          <section
            className="pointer-events-auto w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur"
            role="region"
            aria-labelledby="game-overlay-title"
            aria-describedby="game-overlay-description"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-amber-300">
              Menschlichkeit Österreich · Demokratiespiel
            </p>
            <h2 id="game-overlay-title" className="mt-2 text-2xl font-semibold">
              {hud.phase === 'start' ? hud.activeScenario.title : getResultTitle(hud.phase)}
            </h2>
            <p id="game-overlay-description" className="mt-2 text-sm text-slate-300">
              {hud.activeScenario.description}
            </p>
            <p className="mt-2 text-sm text-amber-100">{hud.hint}</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {getMissionStages(hud).map(stage => (
                <div
                  key={stage.label}
                  className="rounded-xl bg-slate-900/80 px-3 py-3 text-xs text-slate-200"
                >
                  <p className="font-semibold text-amber-100">{stage.label}</p>
                  <p className="mt-1">{stage.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Szenario</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hud.availableScenarios.map(scenario => {
                    const isActive = scenario.id === hud.activeScenario.id;
                    const isLocked = scenario.status !== 'playable';
                    return (
                      <button
                        key={scenario.id}
                        type="button"
                        onClick={() => onScenarioSelect(scenario.id)}
                        disabled={isLocked}
                        className={`rounded-full px-3 py-2 text-xs transition ${
                          isActive
                            ? 'bg-orange-500 text-slate-950'
                            : isLocked
                              ? 'cursor-not-allowed bg-slate-800/60 text-slate-500'
                              : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                        }`}
                      >
                        {scenario.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Spielstil</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hud.availableRoles.map(role => {
                    const isActive = role.id === hud.activeRole.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => onRoleSelect(role.id)}
                        className={`rounded-full px-3 py-2 text-xs transition ${
                          isActive
                            ? 'bg-sky-500 text-slate-950'
                            : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                        }`}
                      >
                        {role.title}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-300">
                  {hud.activeRole.specialty ?? hud.activeRole.description}
                </p>
                <p className="mt-1 text-[11px] text-sky-100">{getRoleSummary(hud)}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 text-sm text-slate-200">
              <p className="font-medium text-amber-100">Wofür das steht</p>
              <p className="mt-1 text-xs text-slate-300">
                Die Runde übersetzt den Website-Gedanken von Menschlichkeit Österreich in Spiel:
                zuerst zuhören, dann Menschen verbinden und am Ende gemeinsam handeln.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-300">
                Ziele:{' '}
                <span className="font-medium text-slate-50">
                  {hud.collected}/{hud.totalCollectibles}
                </span>
                {' · '}
                Zeitlimit:{' '}
                <span className="font-medium text-slate-50">{hud.timeLimitSeconds}s</span>
              </div>
              <button
                type="button"
                onClick={onPrimaryAction}
                disabled={!isInteractive}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
              >
                {getPrimaryLabel(hud.phase)}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
