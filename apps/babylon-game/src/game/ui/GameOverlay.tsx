import { LIVE_SCENARIO_LEVEL_MAP } from '@/game/scenarios/scenario-model';
import type { GameHudState } from '@/game/state/game-types';
import { ControlsPanel } from '@/game/ui/ControlsPanel';
import { GameDialog } from '@/game/ui/GameDialog';
import { InteractionCue, MissionBriefing, PhaseBar, TimeRemaining } from '@/game/ui/MissionHud';

/**
 * Vier feste HUD-Zonen in den Ecken plus eine Phasenleiste unten mittig.
 * Die Bildmitte bleibt frei — dort steht die Spielfigur.
 */
export function GameOverlay({
  hud,
  onPrimaryAction,
  onRoleSelect,
  onScenarioSelect,
  onToggleAudio,
  onTextMode,
}: {
  hud: GameHudState;
  onPrimaryAction: () => void;
  onRoleSelect: (roleId: string) => void;
  onScenarioSelect: (scenarioId: string) => void;
  onToggleAudio: () => void;
  onTextMode: () => void;
}) {
  const isDialogVisible = hud.phase === 'start' || hud.phase === 'success' || hud.phase === 'fail';
  const showInGameHud = hud.phase === 'playing';

  const completedLiveLevels = hud.completedScenarioIds.reduce((count, scenarioId) => {
    const mappedLevel = LIVE_SCENARIO_LEVEL_MAP[scenarioId];
    return typeof mappedLevel === 'number' ? count + 1 : count;
  }, 0);

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Oberes Band: auf Telefonen gestapelt, ab sm in den beiden Ecken */}
      <div className="absolute inset-x-4 top-4 z-10 flex flex-col gap-2.5 sm:inset-x-6 sm:top-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          {showInGameHud ? (
            <MissionBriefing hud={hud} />
          ) : (
            <p className="border border-moe-hud-rule bg-moe-hud px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-moe-ink-on-dark">
              Menschlichkeit Österreich · {hud.activeScenario.title}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2.5 sm:flex-col sm:items-end">
          {showInGameHud ? <TimeRemaining hud={hud} /> : null}
          <button
            type="button"
            onClick={onToggleAudio}
            aria-pressed={hud.audioMuted}
            className="pointer-events-auto border border-moe-hud-rule bg-moe-hud px-3.5 py-2 font-mono text-[12px] uppercase tracking-[0.16em] text-moe-ink-on-dark transition-colors duration-moe ease-moe hover:text-moe-paper"
          >
            {hud.audioMuted ? 'Ton aus' : 'Ton an'}
          </button>
        </div>
      </div>

      {/* Zone unten links */}
      <div className="absolute bottom-6 left-6 z-10">
        <ControlsPanel visible={showInGameHud} />
      </div>

      {/* Zone unten Mitte */}
      {showInGameHud ? (
        <div className="absolute inset-x-0 bottom-6 z-0 flex justify-center">
          <PhaseBar hud={hud} />
        </div>
      ) : null}

      {/* Zone unten rechts */}
      <div className="absolute bottom-6 right-6 z-10">
        {showInGameHud ? (
          <InteractionCue hud={hud} />
        ) : !isDialogVisible ? (
          <p className="border border-moe-hud-rule bg-moe-hud px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-moe-ink-on-dark">
            Laufende Mission
          </p>
        ) : null}
      </div>

      {isDialogVisible ? (
        <GameDialog
          hud={hud}
          completedLiveLevels={completedLiveLevels}
          onPrimaryAction={onPrimaryAction}
          onRoleSelect={onRoleSelect}
          onScenarioSelect={onScenarioSelect}
          onTextMode={onTextMode}
        />
      ) : null}
    </div>
  );
}
