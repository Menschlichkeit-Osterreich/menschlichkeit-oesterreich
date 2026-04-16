import type { GameHudState } from '@/game/state/game-types';
import { RoadmapPanel } from '@/game/ui/RoadmapPanel';

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

function getRoleSummary(hud: GameHudState) {
  const speed = Math.round((hud.activeRole.moveSpeedMultiplier ?? 1) * 100);
  const timeBonus = hud.activeRole.timeBonusSeconds ?? 0;
  const reach = Math.round((hud.activeRole.interactionRadiusMultiplier ?? 1) * 100);
  return `Tempo ${speed}% · Zeitbonus ${timeBonus}s · Reichweite ${reach}%`;
}

function getRoleLegend(roleId: string) {
  if (roleId === 'runner') {
    return '🏃 schnell';
  }
  if (roleId === 'operator') {
    return '🎙️ mehr Zeit';
  }
  if (roleId === 'vermittler') {
    return '🤝 breiter Radius';
  }
  return '🎯 ausgewogen';
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

export function GameDialog({
  hud,
  completedLiveLevels,
  onPrimaryAction,
  onRoleSelect,
  onScenarioSelect,
}: {
  hud: GameHudState;
  completedLiveLevels: number;
  onPrimaryAction: () => void;
  onRoleSelect: (roleId: string) => void;
  onScenarioSelect: (scenarioId: string) => void;
}) {
  return (
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
                const hintId = `scenario-hint-${scenario.id}`;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => onScenarioSelect(scenario.id)}
                    disabled={isLocked}
                    aria-disabled={isLocked}
                    aria-describedby={isLocked ? hintId : undefined}
                    className={`rounded-full px-3 py-2 text-xs transition ${
                      isActive
                        ? 'bg-orange-500 text-slate-950'
                        : isLocked
                          ? 'cursor-not-allowed bg-slate-800/60 text-slate-500'
                          : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                    }`}
                  >
                    {scenario.title}
                    {isLocked ? (
                      <span id={hintId} className="sr-only">
                        Gesperrt bis Vorgängerszenario abgeschlossen ist.
                      </span>
                    ) : null}
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
            <p className="mt-1 text-[11px] text-amber-100">{getRoleLegend(hud.activeRole.id)}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 text-sm text-slate-200">
          <p className="font-medium text-amber-100">Wofür das steht</p>
          <p className="mt-1 text-xs text-slate-300">
            Die Runde übersetzt den Website-Gedanken von Menschlichkeit Österreich in Spiel: zuerst
            zuhören, dann Menschen verbinden und am Ende gemeinsam handeln.
          </p>
          <RoadmapPanel completedLiveLevels={completedLiveLevels} />
        </div>

        <button
          type="button"
          onClick={onPrimaryAction}
          className="mt-6 w-full rounded-2xl bg-orange-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
        >
          {getPrimaryLabel(hud.phase)}
        </button>
      </section>
    </div>
  );
}
