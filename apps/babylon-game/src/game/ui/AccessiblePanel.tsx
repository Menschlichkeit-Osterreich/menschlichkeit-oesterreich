import {
  GAME_LEVEL_ROADMAP,
  LIVE_SCENARIO_LEVEL_MAP,
  PLANNED_SCENARIO_PREVIEWS,
  ROADMAP_LIVE_LEVELS,
  ROADMAP_TOTAL_LEVELS,
} from '@/game/scenarios/scenario-model';
import type { GameHudState } from '@/game/state/game-types';

type AccessibleMissionStage = 'idle' | 'collect' | 'core' | 'beacon' | 'result';

interface AccessibleMissionState {
  enabled: boolean;
  stage: AccessibleMissionStage;
  collected: number;
  message: string;
}

export function AccessiblePanel({
  hud,
  accessibleMission,
  accessibleCollectibleCount,
  onRoleSelect,
  onScenarioSelect,
  onAccessibleStart,
  onAccessibleCollect,
  onCoreShift,
  onBeaconOpen,
}: {
  hud: GameHudState;
  accessibleMission: AccessibleMissionState;
  accessibleCollectibleCount: number;
  onRoleSelect: (roleId: string) => void;
  onScenarioSelect: (scenarioId: string) => void;
  onAccessibleStart: () => void;
  onAccessibleCollect: () => void;
  onCoreShift: () => void;
  onBeaconOpen: () => void;
}) {
  const roadmapNextLevels = GAME_LEVEL_ROADMAP.filter(level => level.status === 'planned').slice(
    0,
    3
  );
  const roadmapScenarioPreviews = PLANNED_SCENARIO_PREVIEWS.slice(0, 4);
  const completedLiveLevels = hud.completedScenarioIds.reduce((count, scenarioId) => {
    const mappedLevel = LIVE_SCENARIO_LEVEL_MAP[scenarioId];
    return typeof mappedLevel === 'number' ? count + 1 : count;
  }, 0);
  const roadmapProgressPercent = Math.round((completedLiveLevels / ROADMAP_TOTAL_LEVELS) * 100);

  return (
    <details className="pointer-events-auto absolute bottom-4 left-4 z-20 w-full max-w-sm rounded-2xl border border-orange-400/20 bg-slate-950/78 p-3 text-sm text-amber-50 shadow-2xl backdrop-blur">
      <summary className="cursor-pointer list-none text-sm font-medium text-amber-100">
        Textmodus & Barrierefreiheit {accessibleMission.enabled ? '· aktiv' : '· optional'}
      </summary>
      <div className="mt-3 space-y-3">
        <p className="text-xs text-slate-300">
          Optionaler linearer Modus ohne 3D-Navigation. Öffne ihn nur, wenn du die Mission lieber
          Schritt für Schritt als Text erleben willst.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Rolle</span>
            <select
              value={hud.activeRole.id}
              onChange={event => onRoleSelect(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-50"
            >
              {hud.availableRoles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.title}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Szenario</span>
            <select
              value={hud.activeScenario.id}
              onChange={event => onScenarioSelect(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-50"
            >
              {hud.availableScenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.title}
                  {scenario.status !== 'playable' ? ' - gesperrt' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-xl bg-slate-900/80 p-3">
          <p className="text-xs text-amber-100" role="status" aria-live="polite">
            {accessibleMission.message}
          </p>
          <div className="mt-3 rounded-lg border border-white/10 bg-slate-950/70 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Roadmap-Status</p>
            <p className="mt-1 text-xs text-slate-200">
              Live jetzt: {ROADMAP_LIVE_LEVELS} von {ROADMAP_TOTAL_LEVELS} Levels.
            </p>
            <p className="mt-1 text-xs text-slate-300">
              Dein Fortschritt: {completedLiveLevels}/{ROADMAP_TOTAL_LEVELS} (
              {roadmapProgressPercent}%)
            </p>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"
              role="progressbar"
              aria-label="Roadmap-Fortschritt im Textmodus"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={roadmapProgressPercent}
            >
              <div
                className="h-full rounded-full bg-orange-400 transition-all"
                style={{ width: `${Math.max(roadmapProgressPercent, 2)}%` }}
              />
            </div>
            <ul className="mt-2 space-y-1 text-xs text-slate-300">
              {roadmapNextLevels.map(level => (
                <li key={level.levelNumber}>
                  Level {level.levelNumber}: {level.worldTitle}
                </li>
              ))}
            </ul>
            <div className="mt-2 rounded-md bg-slate-900/80 p-2">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Geplante Szenarien
              </p>
              <ul className="mt-1 space-y-1 text-xs text-slate-300">
                {roadmapScenarioPreviews.map(preview => (
                  <li key={preview.id}>
                    L{preview.levelNumber}: {preview.worldTitle}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!accessibleMission.enabled || accessibleMission.stage === 'idle' ? (
            <button
              type="button"
              onClick={onAccessibleStart}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
            >
              Textmodus starten
            </button>
          ) : null}

          {accessibleMission.enabled && accessibleMission.stage === 'collect' ? (
            <button
              type="button"
              onClick={onAccessibleCollect}
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              {hud.activeScenario.collectibleLabel} markieren ({accessibleMission.collected}/
              {accessibleCollectibleCount})
            </button>
          ) : null}

          {accessibleMission.enabled && accessibleMission.stage === 'core' ? (
            <button
              type="button"
              onClick={onCoreShift}
              className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Kern verschoben
            </button>
          ) : null}

          {accessibleMission.enabled && accessibleMission.stage === 'beacon' ? (
            <button
              type="button"
              onClick={onBeaconOpen}
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
            >
              Treffpunkt öffnen
            </button>
          ) : null}
        </div>
      </div>
    </details>
  );
}
