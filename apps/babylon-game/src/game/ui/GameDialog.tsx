import {
  getScenarioLevelNumber,
  ROADMAP_LIVE_LEVELS,
  type GameScenario,
} from '@/game/scenarios/scenario-model';
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

function formatSeconds(seconds: number) {
  return `${Math.max(0, Math.round(seconds))} s`;
}

/** Spielstil-Kennwerte als Zahlen statt als Emoji-Kürzel. */
function getRoleFigures(role: GameHudState['activeRole']) {
  const speed = Math.round((role.moveSpeedMultiplier ?? 1) * 100);
  const timeBonus = role.timeBonusSeconds ?? 0;
  const reach = Math.round((role.interactionRadiusMultiplier ?? 1) * 100);

  return [
    { label: 'Tempo', value: `${speed} %` },
    { label: 'Zeitbonus', value: timeBonus > 0 ? `+${timeBonus} s` : '±0 s' },
    { label: 'Reichweite', value: `${reach} %` },
  ];
}

function getMissionStages(hud: GameHudState) {
  const collectedDone = hud.totalCollectibles > 0 && hud.collected >= hud.totalCollectibles;
  const coreDone = hud.goalUnlocked || hud.phase === 'success';

  return [
    { index: 1, label: 'Zuhören', detail: 'Impulse sichern', done: collectedDone },
    { index: 2, label: 'Verbinden', detail: 'Kern zum Treffpunkt', done: coreDone },
    {
      index: 3,
      label: 'Handeln',
      detail: 'Treffpunkt öffnen',
      done: hud.phase === 'success',
    },
  ];
}

function findNextScenario(hud: GameHudState): GameScenario | null {
  const currentLevel = getScenarioLevelNumber(hud.activeScenario.id);
  if (currentLevel === null) {
    return null;
  }

  return (
    hud.availableScenarios.find(
      scenario => getScenarioLevelNumber(scenario.id) === currentLevel + 1
    ) ?? null
  );
}

/** Zehn anwählbare Levelfelder statt einer Pillenreihe über 100 Einträge. */
function LevelSelector({
  hud,
  onScenarioSelect,
}: {
  hud: GameHudState;
  onScenarioSelect: (scenarioId: string) => void;
}) {
  return (
    <div>
      <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-moe-ink-on-dark-muted">
        Level
      </p>
      <ol className="mt-2 grid grid-cols-10 gap-1">
        {Array.from({ length: ROADMAP_LIVE_LEVELS }, (_, index) => {
          const levelNumber = index + 1;
          const scenario = hud.availableScenarios.find(
            item => getScenarioLevelNumber(item.id) === levelNumber
          );
          const isActive = scenario?.id === hud.activeScenario.id;
          const isLocked = !scenario || scenario.status !== 'playable';

          return (
            <li key={levelNumber}>
              <button
                type="button"
                disabled={isLocked}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => scenario && onScenarioSelect(scenario.id)}
                title={
                  isLocked
                    ? `Level ${levelNumber} ist noch nicht verfügbar`
                    : `Level ${levelNumber}: ${scenario.title}`
                }
                className={`h-10 w-full rounded-sm border font-mono text-[13px] tabular-nums transition-colors duration-moe ease-moe ${
                  isActive
                    ? 'border-moe-signal bg-moe-signal text-moe-ink-tief'
                    : isLocked
                      ? 'cursor-not-allowed border-moe-hud-rule text-moe-ink-on-dark-muted'
                      : 'border-moe-hud-rule-strong text-moe-ink-on-dark hover:border-moe-signal-hell hover:text-moe-paper'
                }`}
              >
                {levelNumber}
                {isLocked ? (
                  <span className="sr-only">— noch nicht verfügbar</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function GameDialog({
  hud,
  completedLiveLevels,
  onPrimaryAction,
  onRoleSelect,
  onScenarioSelect,
  onTextMode,
}: {
  hud: GameHudState;
  completedLiveLevels: number;
  onPrimaryAction: () => void;
  onRoleSelect: (roleId: string) => void;
  onScenarioSelect: (scenarioId: string) => void;
  onTextMode: () => void;
}) {
  const isResult = hud.phase === 'success' || hud.phase === 'fail';
  const levelNumber = getScenarioLevelNumber(hud.activeScenario.id);
  const nextScenario = findNextScenario(hud);
  const usedSeconds = hud.elapsedSeconds;

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 overflow-y-auto bg-moe-hud">
      <div className="mx-auto flex min-h-full max-w-[1080px] items-center px-6 py-10">
        <section
          className="grid w-full gap-0 border border-moe-hud-rule bg-moe-ink lg:grid-cols-[520px_minmax(0,1fr)]"
          role="region"
          aria-labelledby="game-overlay-title"
          aria-describedby="game-overlay-description"
        >
          {/* Bildplatz 520 × 400 — Screenshot des Levels liefert der Verein nach. */}
          <div
            className="relative hidden aspect-[520/400] border-r border-moe-hud-rule bg-welt1-grund lg:block"
            aria-hidden="true"
          >
            <div className="absolute inset-0 grid place-items-center px-8 text-center">
              <div>
                <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-moe-ink-on-dark-muted">
                  Bildplatz 520 × 400
                </p>
                <p className="mt-2 font-heading text-[19px] font-semibold text-moe-ink-on-dark">
                  Szenenbild {levelNumber === null ? '' : `Level ${levelNumber}`}
                </p>
                <p className="mt-1.5 font-body text-[14px] leading-snug text-moe-ink-on-dark-muted">
                  Screenshot aus Welt 1 folgt.
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-[480px] px-7 py-8">
            <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-moe-signal-hell">
              Welt 1 · Gemeindeplatz
              {levelNumber === null ? '' : ` · Level ${levelNumber} von ${ROADMAP_LIVE_LEVELS}`}
            </p>

            <h2
              id="game-overlay-title"
              className="mt-3 font-heading text-[38px] font-bold leading-[1.08] tracking-[-0.02em] text-moe-paper"
            >
              {isResult
                ? hud.phase === 'success'
                  ? 'Gemeinsam geschafft'
                  : 'Noch nicht geschafft'
                : hud.activeScenario.title}
            </h2>

            <p
              id="game-overlay-description"
              className="mt-3 max-w-[46ch] font-body text-[16px] leading-relaxed text-moe-ink-on-dark"
            >
              {isResult ? hud.hint : hud.activeScenario.briefing}
            </p>

            {isResult ? (
              <>
                <dl className="mt-6 grid grid-cols-3 border-y border-moe-hud-rule">
                  <div className="border-r border-moe-hud-rule py-3.5 pr-4">
                    <dt className="font-mono text-[12px] uppercase tracking-[0.16em] text-moe-ink-on-dark-muted">
                      Impulse
                    </dt>
                    <dd className="mt-1.5 font-mono text-[26px] leading-none tabular-nums text-moe-paper">
                      {hud.collected}
                      <span className="text-[15px] text-moe-ink-on-dark-muted">
                        /{hud.totalCollectibles}
                      </span>
                    </dd>
                  </div>
                  <div className="border-r border-moe-hud-rule px-4 py-3.5">
                    <dt className="font-mono text-[12px] uppercase tracking-[0.16em] text-moe-ink-on-dark-muted">
                      Gebraucht
                    </dt>
                    <dd className="mt-1.5 font-mono text-[26px] leading-none tabular-nums text-moe-paper">
                      {formatSeconds(usedSeconds)}
                    </dd>
                  </div>
                  <div className="py-3.5 pl-4">
                    <dt className="font-mono text-[12px] uppercase tracking-[0.16em] text-moe-ink-on-dark-muted">
                      Übrig
                    </dt>
                    <dd className="mt-1.5 font-mono text-[26px] leading-none tabular-nums text-moe-paper">
                      {formatSeconds(hud.remainingSeconds)}
                    </dd>
                  </div>
                </dl>

                {nextScenario ? (
                  <div className="mt-5 border-l-[3px] border-moe-signal bg-moe-hud-soft px-4 py-3">
                    <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-moe-ink-on-dark-muted">
                      Als Nächstes
                    </p>
                    <p className="mt-1 font-heading text-[19px] font-semibold text-moe-paper">
                      Level {getScenarioLevelNumber(nextScenario.id)}: {nextScenario.title}
                    </p>
                    <p className="mt-1 font-body text-[14px] leading-snug text-moe-ink-on-dark">
                      {nextScenario.description}
                    </p>
                  </div>
                ) : null}

                <div className="mt-5">
                  <RoadmapPanel completedLiveLevels={completedLiveLevels} />
                </div>
              </>
            ) : (
              <>
                <ol className="mt-6 grid grid-cols-3 border-y border-moe-hud-rule">
                  {getMissionStages(hud).map((stage, position) => (
                    <li
                      key={stage.index}
                      className={`py-3.5 ${
                        position > 0 ? 'border-l border-moe-hud-rule pl-4' : 'pr-4'
                      } ${position === 1 ? 'px-4' : ''}`}
                    >
                      <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-moe-ink-on-dark-muted">
                        Schritt {stage.index}
                      </p>
                      <p className="mt-1.5 font-heading text-[16px] font-semibold text-moe-paper">
                        {stage.label}
                      </p>
                      <p className="mt-0.5 font-body text-[14px] leading-snug text-moe-ink-on-dark">
                        {stage.detail}
                      </p>
                    </li>
                  ))}
                </ol>

                <fieldset className="mt-6">
                  <legend className="font-mono text-[12px] uppercase tracking-[0.16em] text-moe-ink-on-dark-muted">
                    Spielstil
                  </legend>
                  <div className="mt-2.5 grid gap-1.5 sm:grid-cols-3">
                    {hud.availableRoles.map((role, position) => {
                      const isActive = role.id === hud.activeRole.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => onRoleSelect(role.id)}
                          aria-pressed={isActive}
                          className={`border px-3 py-3 text-left transition-colors duration-moe ease-moe ${
                            isActive
                              ? 'border-2 border-moe-signal-tief bg-moe-hud-soft'
                              : 'border-moe-hud-rule-strong hover:border-moe-signal-hell'
                          }`}
                        >
                          <p className="font-heading text-[16px] font-semibold leading-tight text-moe-paper">
                            {role.title}
                          </p>
                          <dl className="mt-2 space-y-0.5">
                            {getRoleFigures(role).map(figure => (
                              <div key={figure.label} className="flex justify-between gap-2">
                                <dt className="font-body text-[13px] text-moe-ink-on-dark-muted">
                                  {figure.label}
                                </dt>
                                <dd className="font-mono text-[13px] tabular-nums text-moe-ink-on-dark">
                                  {figure.value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                          {position === 1 ? (
                            <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.14em] text-moe-signal-hell">
                              Empfohlen für den Einstieg
                            </p>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-6">
                  <LevelSelector hud={hud} onScenarioSelect={onScenarioSelect} />
                </div>
              </>
            )}

            <div className="mt-7 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={onPrimaryAction}
                className="min-h-[48px] rounded-sm bg-moe-signal px-4 py-3 font-heading text-[16px] font-semibold text-moe-ink-tief transition-colors duration-moe ease-moe hover:bg-moe-signal-tief hover:text-moe-paper"
              >
                {getPrimaryLabel(hud.phase)}
              </button>
              <button
                type="button"
                onClick={onTextMode}
                className="min-h-[48px] rounded-sm border border-moe-hud-rule-strong px-4 py-3 font-heading text-[16px] font-semibold text-moe-paper transition-colors duration-moe ease-moe hover:border-moe-signal-hell"
              >
                Ohne 3D spielen — Textmodus
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
