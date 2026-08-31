import { useEffect } from 'react';

import { getScenarioLevelNumber, ROADMAP_LIVE_LEVELS } from '@/game/scenarios/scenario-model';
import type { GameHudState } from '@/game/state/game-types';

type AccessibleMissionStage = 'idle' | 'collect' | 'core' | 'beacon' | 'result';

interface AccessibleMissionState {
  enabled: boolean;
  stage: AccessibleMissionStage;
  collected: number;
  message: string;
}

interface AccessibleStep {
  index: number;
  title: string;
  detail: string;
  actionLabel: string;
  stage: Exclude<AccessibleMissionStage, 'result'>;
  onAction: () => void;
}

/** Erledigt — gefüllte Scheibe mit Haken. */
function StepMarkDone() {
  return (
    <span
      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-moe-success"
      aria-hidden="true"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="#F7F4F1" strokeWidth="2.5">
        <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="square" />
      </svg>
    </span>
  );
}

/** Kommend — leere Scheibe mit Schrittzahl. */
function StepMarkPending({ index, current }: { index: number; current: boolean }) {
  return (
    <span
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 font-mono text-[13px] tabular-nums ${
        current
          ? 'border-moe-signal-tief text-moe-signal-tief'
          : 'border-moe-rule text-moe-ink-muted'
      }`}
      aria-hidden="true"
    >
      {index}
    </span>
  );
}

export function AccessiblePanel({
  open,
  hud,
  accessibleMission,
  accessibleCollectibleCount,
  onExit,
  onRoleSelect,
  onScenarioSelect,
  onAccessibleStart,
  onAccessibleCollect,
  onCoreShift,
  onBeaconOpen,
}: {
  open: boolean;
  hud: GameHudState;
  accessibleMission: AccessibleMissionState;
  accessibleCollectibleCount: number;
  onExit: () => void;
  onRoleSelect: (roleId: string) => void;
  onScenarioSelect: (scenarioId: string) => void;
  onAccessibleStart: () => void;
  onAccessibleCollect: () => void;
  onCoreShift: () => void;
  onBeaconOpen: () => void;
}) {
  const completedLiveLevels = hud.completedScenarioIds.reduce((count, scenarioId) => {
    const mappedLevel = getScenarioLevelNumber(scenarioId);
    return typeof mappedLevel === 'number' ? count + 1 : count;
  }, 0);

  const currentStage: AccessibleMissionStage = accessibleMission.enabled
    ? accessibleMission.stage
    : 'idle';

  const steps: AccessibleStep[] = [
    {
      index: 1,
      stage: 'idle',
      title: 'Runde eröffnen',
      detail: `${hud.activeScenario.title} im Textmodus starten. Es läuft keine Zeit mit.`,
      actionLabel: 'Runde eröffnen',
      onAction: onAccessibleStart,
    },
    {
      index: 2,
      stage: 'collect',
      title: 'Zuhören',
      detail: `${accessibleCollectibleCount} ${hud.activeScenario.collectibleLabel.toLowerCase()}e nacheinander markieren.`,
      actionLabel: `${hud.activeScenario.collectibleLabel} markieren (${accessibleMission.collected} von ${accessibleCollectibleCount})`,
      onAction: onAccessibleCollect,
    },
    {
      index: 3,
      stage: 'core',
      title: 'Verbinden',
      detail: 'Den Gemeinschaftskern zum Treffpunkt bringen.',
      actionLabel: 'Kern zum Treffpunkt bringen',
      onAction: onCoreShift,
    },
    {
      index: 4,
      stage: 'beacon',
      title: 'Handeln',
      detail: 'Den Treffpunkt öffnen und die Runde abschließen.',
      actionLabel: 'Treffpunkt öffnen',
      onAction: onBeaconOpen,
    },
  ];

  const stageOrder: AccessibleMissionStage[] = ['idle', 'collect', 'core', 'beacon', 'result'];
  const currentPosition = stageOrder.indexOf(currentStage);

  // Tastenkürzel entspricht der Schrittzahl. Nur der laufende Schritt reagiert.
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }

      const step = steps.find(item => item.index === Number(event.key));
      if (step && step.stage === currentStage) {
        event.preventDefault();
        step.onAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!open) {
    return null;
  }

  const collectPercent =
    accessibleCollectibleCount > 0
      ? Math.round((accessibleMission.collected / accessibleCollectibleCount) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-moe-paper">
      <header className="flex h-[76px] items-center justify-between gap-4 bg-moe-ink px-6">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-moe-signal-hell">
            Textmodus
          </p>
          <p className="font-heading text-[17px] font-semibold leading-tight text-moe-paper">
            Brücken bauen · Menschlichkeit Österreich
          </p>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="min-h-[48px] shrink-0 rounded-sm border border-moe-hud-rule-strong px-4 py-2.5 font-heading text-[15px] font-semibold text-moe-paper transition-colors duration-moe ease-moe hover:border-moe-signal-hell"
        >
          Zur 3D-Ansicht wechseln
        </button>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-0 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
        <main>
          <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-moe-ink-muted">
            Welt 1 · Gemeindeplatz
            {getScenarioLevelNumber(hud.activeScenario.id) === null
              ? ''
              : ` · Level ${getScenarioLevelNumber(hud.activeScenario.id)} von ${ROADMAP_LIVE_LEVELS}`}
          </p>

          <h1 className="mt-3 max-w-[20ch] font-heading text-[40px] font-bold leading-[1.08] tracking-[-0.02em] text-moe-ink-tief">
            {hud.activeScenario.title}
          </h1>

          <p className="mt-4 max-w-[66ch] font-body text-[17px] leading-relaxed text-moe-ink-body">
            {hud.activeScenario.briefing}
          </p>

          <p
            className="mt-6 max-w-[66ch] border-l-[3px] border-moe-petrol bg-moe-petrol-hell px-4 py-3.5 font-body text-[16px] leading-relaxed text-moe-ink-body"
            role="status"
            aria-live="polite"
          >
            {accessibleMission.message}
          </p>

          <h2 className="mt-9 font-heading text-[21px] font-semibold text-moe-ink-tief">
            Die vier Schritte
          </h2>
          <p className="mt-1.5 font-body text-[15px] text-moe-ink-muted">
            Das Tastenkürzel entspricht der Schrittzahl. Es läuft keine Zeit mit.
          </p>

          <ol className="mt-4 max-w-[720px] border-t border-moe-rule">
            {steps.map(step => {
              const stepPosition = stageOrder.indexOf(step.stage);
              const isCurrent = step.stage === currentStage;
              const isDone = stepPosition < currentPosition;

              return (
                <li
                  key={step.index}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`border-b border-moe-rule px-4 py-4 ${
                    isCurrent ? 'bg-white shadow-[inset_3px_0_0_#B54A0F]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {isDone ? (
                      <StepMarkDone />
                    ) : (
                      <StepMarkPending index={step.index} current={isCurrent} />
                    )}

                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-heading text-[17px] font-semibold leading-tight ${
                          isDone || isCurrent ? 'text-moe-ink-tief' : 'text-moe-ink-muted'
                        }`}
                      >
                        Schritt {step.index}: {step.title}
                        {isDone ? (
                          <span className="sr-only"> — erledigt</span>
                        ) : isCurrent ? (
                          <span className="sr-only"> — aktueller Schritt</span>
                        ) : (
                          <span className="sr-only"> — noch nicht verfügbar</span>
                        )}
                      </p>
                      <p className="mt-1 max-w-[62ch] font-body text-[15px] leading-relaxed text-moe-ink-body">
                        {step.detail}
                      </p>

                      {isCurrent ? (
                        <button
                          type="button"
                          onClick={step.onAction}
                          className="mt-3 min-h-[48px] rounded-sm bg-moe-signal-tief px-5 py-3 font-heading text-[16px] font-semibold text-moe-paper transition-colors duration-moe ease-moe hover:bg-moe-ink-tief"
                        >
                          {step.actionLabel}
                          <span className="ml-2.5 font-mono text-[13px] text-moe-n200">
                            Taste {step.index}
                          </span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {currentStage === 'collect' ? (
            <div className="mt-6 max-w-[720px]">
              <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-moe-ink-muted">
                Markierte {hud.activeScenario.collectibleLabel}e
              </p>
              <div
                className="mt-2 h-2 bg-moe-rule"
                role="progressbar"
                aria-label={`Markierte ${hud.activeScenario.collectibleLabel}e`}
                aria-valuemin={0}
                aria-valuemax={accessibleCollectibleCount}
                aria-valuenow={accessibleMission.collected}
                aria-valuetext={`${accessibleMission.collected} von ${accessibleCollectibleCount} markiert`}
              >
                <div className="h-full bg-moe-signal" style={{ width: `${collectPercent}%` }} />
              </div>
            </div>
          ) : null}
        </main>

        <aside className="mt-10 lg:mt-0">
          <section>
            <h2 className="font-heading text-[17px] font-semibold text-moe-ink-tief">
              Dein Fortschritt
            </h2>
            <ol
              className="mt-2.5 flex gap-1"
              role="progressbar"
              aria-label="Geschaffte Level"
              aria-valuemin={0}
              aria-valuemax={ROADMAP_LIVE_LEVELS}
              aria-valuenow={completedLiveLevels}
              aria-valuetext={`${completedLiveLevels} von ${ROADMAP_LIVE_LEVELS} Level geschafft`}
            >
              {Array.from({ length: ROADMAP_LIVE_LEVELS }, (_, index) => (
                <li
                  key={index}
                  className={`h-2 flex-1 ${
                    index < completedLiveLevels ? 'bg-moe-signal' : 'bg-moe-rule'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </ol>
            <p className="mt-2 font-mono text-[13px] tabular-nums text-moe-ink-muted">
              {completedLiveLevels} von {ROADMAP_LIVE_LEVELS} Level geschafft
            </p>
          </section>

          <section className="mt-8 border-t border-moe-rule pt-6">
            <label className="block">
              <span className="font-heading text-[17px] font-semibold text-moe-ink-tief">
                Spielstil
              </span>
              <select
                value={hud.activeRole.id}
                onChange={event => onRoleSelect(event.target.value)}
                className="mt-2 h-12 w-full rounded-sm border border-moe-rule bg-white px-3 font-body text-[16px] text-moe-ink-tief"
              >
                {hud.availableRoles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-2 font-body text-[15px] leading-snug text-moe-ink-muted">
              {hud.activeRole.specialty ?? hud.activeRole.description}
            </p>
          </section>

          <section className="mt-6">
            <label className="block">
              <span className="font-heading text-[17px] font-semibold text-moe-ink-tief">Level</span>
              <select
                value={hud.activeScenario.id}
                onChange={event => onScenarioSelect(event.target.value)}
                className="mt-2 h-12 w-full rounded-sm border border-moe-rule bg-white px-3 font-body text-[16px] text-moe-ink-tief"
              >
                {hud.availableScenarios.map(scenario => {
                  const level = getScenarioLevelNumber(scenario.id);
                  return (
                    <option
                      key={scenario.id}
                      value={scenario.id}
                      disabled={scenario.status !== 'playable'}
                    >
                      {level === null ? '' : `Level ${level}: `}
                      {scenario.title}
                      {scenario.status !== 'playable' ? ' — noch nicht verfügbar' : ''}
                    </option>
                  );
                })}
              </select>
            </label>
          </section>

          <section className="mt-8 border-t border-moe-rule pt-6">
            <h2 className="font-heading text-[17px] font-semibold text-moe-ink-tief">
              Wofür das steht
            </h2>
            <p className="mt-2 max-w-[52ch] font-body text-[15px] leading-relaxed text-moe-ink-body">
              Die Runde übersetzt den Vereinsgedanken in Spiel: zuerst zuhören, dann Menschen
              verbinden und am Ende gemeinsam handeln. Der Textmodus ist kein Ersatzangebot — er
              bildet dieselbe Mechanik ohne räumliche Navigation ab.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
