import { LIVE_SCENARIO_LEVEL_MAP } from '@/game/scenarios/scenario-model';
import type { GameHudState } from '@/game/state/game-types';
import { ControlsPanel } from '@/game/ui/ControlsPanel';
import { GameDialog } from '@/game/ui/GameDialog';
import { MissionHud } from '@/game/ui/MissionHud';

export function GameOverlay({
  hud,
  onPrimaryAction,
  onRoleSelect,
  onScenarioSelect,
  onToggleAudio,
}: {
  hud: GameHudState;
  onPrimaryAction: () => void;
  onRoleSelect: (roleId: string) => void;
  onScenarioSelect: (scenarioId: string) => void;
  onToggleAudio: () => void;
}) {
  const isInteractive = hud.phase === 'start' || hud.phase === 'success' || hud.phase === 'fail';
  const isDialogVisible = hud.phase === 'start' || hud.phase === 'success' || hud.phase === 'fail';
  const showInGameHud = hud.phase === 'playing';

  const completedLiveLevels = hud.completedScenarioIds.reduce((count, scenarioId) => {
    const mappedLevel = LIVE_SCENARIO_LEVEL_MAP[scenarioId];
    return typeof mappedLevel === 'number' ? count + 1 : count;
  }, 0);

  return (
    <div className="pointer-events-none absolute inset-0 text-slate-50">
      <button
        type="button"
        onClick={onToggleAudio}
        className="pointer-events-auto absolute right-4 bottom-4 z-20 rounded-full border border-white/20 bg-slate-950/75 px-3 py-2 text-xs text-slate-100 shadow-xl backdrop-blur"
      >
        {hud.audioMuted ? 'Audio aus' : 'Audio an'}
      </button>

      {showInGameHud ? (
        <MissionHud hud={hud} />
      ) : (
        <div className="absolute left-4 top-4 rounded-full border border-orange-400/20 bg-slate-950/78 px-4 py-2 text-xs text-amber-100 shadow-xl backdrop-blur">
          Menschlichkeit Österreich · {hud.activeScenario.title}
        </div>
      )}

      <ControlsPanel visible={showInGameHud} />

      {isDialogVisible ? (
        <GameDialog
          hud={hud}
          completedLiveLevels={completedLiveLevels}
          onPrimaryAction={onPrimaryAction}
          onRoleSelect={onRoleSelect}
          onScenarioSelect={onScenarioSelect}
        />
      ) : null}

      {!showInGameHud && !isDialogVisible ? (
        <div className="absolute bottom-6 right-6 rounded-full border border-white/20 bg-slate-950/70 px-4 py-2 text-xs text-slate-200 shadow-xl backdrop-blur">
          {isInteractive ? 'Bereit für die nächste Runde' : 'Laufende Mission'}
        </div>
      ) : null}
    </div>
  );
}
