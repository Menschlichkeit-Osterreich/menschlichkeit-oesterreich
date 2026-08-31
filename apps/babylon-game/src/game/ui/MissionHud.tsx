import { getScenarioLevelLabel } from '@/game/scenarios/scenario-model';
import type { GameHudState } from '@/game/state/game-types';

const MISSION_STATUS_LABELS: Record<GameHudState['mission']['status'], string> = {
  ready: 'Bereit',
  active: 'Läuft',
  completed: 'Abgeschlossen',
  failed: 'Fehlgeschlagen',
};

export interface MissionStage {
  index: number;
  label: string;
  detail: string;
  done: boolean;
  active: boolean;
}

export function getMissionStages(hud: GameHudState): MissionStage[] {
  const collectedDone = hud.totalCollectibles > 0 && hud.collected >= hud.totalCollectibles;
  const coreDone = hud.goalUnlocked || hud.phase === 'success';
  const beaconDone = hud.phase === 'success';

  return [
    {
      index: 1,
      label: 'Zuhören',
      detail: `Impulse sichern (${hud.collected}/${hud.totalCollectibles})`,
      done: collectedDone,
      active: !collectedDone,
    },
    {
      index: 2,
      label: 'Verbinden',
      detail: 'Gemeinschaftskern zum Treffpunkt bringen',
      done: coreDone,
      active: collectedDone && !coreDone,
    },
    {
      index: 3,
      label: 'Handeln',
      detail: 'Treffpunkt öffnen und Runde abschließen',
      done: beaconDone,
      active: coreDone && !beaconDone,
    },
  ];
}

/**
 * Zone oben links — Auftrag.
 * Level, laufende Aufgabe und drei Segmente à 34 × 6 px mit Zählstand.
 */
export function MissionBriefing({ hud }: { hud: GameHudState }) {
  const stages = getMissionStages(hud);
  const currentStage = stages.find(stage => stage.active) ?? stages[stages.length - 1];
  const doneCount = stages.filter(stage => stage.done).length;
  const currentIndex = currentStage?.index ?? stages.length;

  return (
    <section
      className="w-[320px] border border-moe-hud-rule bg-moe-hud px-4 py-3.5"
      role="status"
      aria-live="polite"
      aria-label="Auftrag"
    >
      <p className="font-mono text-[12px] font-medium uppercase leading-none tracking-[0.16em] text-moe-signal-hell">
        Level {getScenarioLevelLabel(hud.activeScenario.id)}
      </p>
      <p className="mt-2 font-heading text-[19px] font-semibold leading-snug text-moe-paper">
        {currentStage ? `${currentStage.index}. ${currentStage.label}` : hud.activeScenario.title}
      </p>
      <p className="mt-1 font-body text-[14px] leading-snug text-moe-ink-on-dark">
        {currentStage?.detail ?? hud.hint}
      </p>

      <div className="mt-3.5 flex items-center gap-2.5">
        <ol className="flex gap-1.5" aria-hidden="true">
          {stages.map(stage => (
            <li
              key={stage.index}
              className={`h-1.5 w-[34px] ${
                stage.done
                  ? 'bg-moe-signal-hell'
                  : stage.active
                    ? 'bg-moe-signal'
                    : 'bg-moe-hud-rule-strong'
              }`}
            />
          ))}
        </ol>
        <span className="font-mono text-[13px] tabular-nums text-moe-ink-on-dark-muted">
          {currentIndex} / {stages.length}
        </span>
      </div>

      <p className="mt-2.5 font-mono text-[12px] uppercase tracking-[0.14em] text-moe-ink-on-dark-muted">
        {doneCount} von {stages.length} erledigt · {MISSION_STATUS_LABELS[hud.mission.status]}
      </p>
    </section>
  );
}

/**
 * Zone oben rechts — Restzeit.
 * Zahl in IBM Plex Mono 34 px neben einem 56-px-Ring aus conic-gradient.
 */
export function TimeRemaining({ hud }: { hud: GameHudState }) {
  const limit = hud.timeLimitSeconds > 0 ? hud.timeLimitSeconds : 1;
  const fraction = Math.min(Math.max(hud.remainingSeconds / limit, 0), 1);
  const degrees = Math.round(fraction * 360);
  const isCritical = hud.remainingSeconds <= 10;
  const ringColor = isCritical ? '#C62828' : '#EEA06F';

  return (
    <section
      className="flex items-center gap-3.5 border border-moe-hud-rule bg-moe-hud px-4 py-3.5"
      aria-label="Restzeit"
    >
      <div className="text-right">
        <p className="font-mono text-[12px] uppercase leading-none tracking-[0.16em] text-moe-ink-on-dark-muted">
          Restzeit
        </p>
        <p
          className={`mt-1.5 font-mono text-[34px] font-medium leading-none tabular-nums ${
            isCritical ? 'text-moe-error' : 'text-moe-paper'
          }`}
          role="timer"
          aria-live="off"
        >
          {Math.max(0, Math.ceil(hud.remainingSeconds))}
          <span className="ml-0.5 text-[16px] text-moe-ink-on-dark-muted">s</span>
        </p>
      </div>

      <div
        className="relative h-14 w-14 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${ringColor} ${degrees}deg, rgba(247, 244, 241, 0.16) ${degrees}deg)`,
        }}
        aria-hidden="true"
      >
        <div className="absolute inset-[7px] rounded-full bg-moe-ink-tief" />
      </div>

      <span className="sr-only">
        Noch {Math.max(0, Math.ceil(hud.remainingSeconds))} von {hud.timeLimitSeconds} Sekunden.
      </span>
    </section>
  );
}

/**
 * Zone unten Mitte — Phasenleiste über 720 px mit drei gleich breiten Zellen.
 */
export function PhaseBar({ hud }: { hud: GameHudState }) {
  const stages = getMissionStages(hud);

  return (
    <nav
      className="grid w-[720px] max-w-[calc(100vw-3rem)] grid-cols-3 border border-moe-hud-rule bg-moe-hud-soft"
      aria-label="Missionsphasen"
    >
      {stages.map((stage, position) => (
        <div
          key={stage.index}
          aria-current={stage.active ? 'step' : undefined}
          className={`border-b-[3px] px-4 py-3 ${
            position > 0 ? 'border-l border-l-moe-hud-rule' : ''
          } ${
            stage.active
              ? 'border-b-moe-signal-hell'
              : stage.done
                ? 'border-b-moe-success'
                : 'border-b-transparent'
          }`}
        >
          <p className="font-mono text-[12px] uppercase leading-none tracking-[0.16em] text-moe-ink-on-dark-muted">
            Schritt {stage.index}
            {stage.done ? ' · erledigt' : ''}
          </p>
          <p
            className={`mt-1.5 font-heading text-[16px] font-semibold leading-none ${
              stage.active || stage.done ? 'text-moe-paper' : 'text-moe-ink-on-dark-muted'
            }`}
          >
            {stage.label}
          </p>
        </div>
      ))}
    </nav>
  );
}

/**
 * Zone unten rechts — Interaktionshinweis mit gerahmter Taste.
 */
export function InteractionCue({ hud }: { hud: GameHudState }) {
  if (!hud.interactionPrompt) {
    return null;
  }

  return (
    <section
      className="flex max-w-[320px] items-center gap-3 border border-moe-hud-rule bg-moe-hud px-4 py-3"
      role="status"
      aria-live="polite"
      aria-label="Interaktion"
    >
      <kbd className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-moe-signal-hell font-mono text-[16px] font-medium text-moe-ink-tief">
        E
      </kbd>
      <p className="font-body text-[14px] leading-snug text-moe-paper">{hud.interactionPrompt}</p>
    </section>
  );
}
