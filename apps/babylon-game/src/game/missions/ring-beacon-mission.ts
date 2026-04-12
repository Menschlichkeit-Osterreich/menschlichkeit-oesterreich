import { Vector3 } from '@babylonjs/core';

import {
  createMissionDefinitionForScenario,
  createMissionState,
} from '@/game/missions/mission-model';
import type { CollectibleSet } from '@/game/objects/create-collectibles';
import type { GoalBeacon } from '@/game/objects/create-goal-beacon';
import type { KineticCore } from '@/game/objects/create-kinetic-core';
import type { GameStore } from '@/game/state/game-store';
import type { EnvironmentMode } from '@/game/state/game-types';
import type { InputController } from '@/game/systems/input-controller';

const TIME_LIMIT_SECONDS = 45;

export function prepareMissionState(
  store: GameStore,
  collectibles: CollectibleSet,
  goalBeacon: GoalBeacon,
  kineticCore: KineticCore,
  environment: EnvironmentMode
) {
  goalBeacon.reset();
  kineticCore.reset();
  const currentState = store.getState();
  const missionDefinition = createMissionDefinitionForScenario(currentState.activeScenario);
  const roleTimeBonus = currentState.activeRole.timeBonusSeconds ?? 0;
  const scenarioTimeLimit =
    (currentState.activeScenario.timeLimitSeconds ?? TIME_LIMIT_SECONDS) + roleTimeBonus;
  collectibles.configureLayout({
    positions: currentState.activeScenario.collectiblePositions,
    labelPrefix: currentState.activeScenario.collectibleLabel,
    palette: currentState.activeScenario.collectiblePalette,
  });
  store.reset({
    phase: 'start',
    environment,
    dataSource: currentState.dataSource,
    mission: createMissionState(missionDefinition, 'ready'),
    availableScenarios: currentState.availableScenarios,
    activeScenario: currentState.activeScenario,
    availableRoles: currentState.availableRoles,
    activeRole: currentState.activeRole,
    completedMissionIds: currentState.completedMissionIds,
    completedScenarioIds: currentState.completedScenarioIds,
    lastScenarioResult: currentState.lastScenarioResult,
    status: `Treffpunkt bereit. ${currentState.activeRole.title} ist im Einsatz.`,
    hint:
      currentState.activeRole.specialty ??
      currentState.activeScenario.briefing ??
      'Starte die Runde, sammle alle Ziele und bringe danach den Gemeinschaftskern zum Treffpunkt.',
    interactionPrompt: '',
    goalUnlocked: false,
    collected: 0,
    totalCollectibles: collectibles.activeCount(),
    elapsedSeconds: 0,
    timeLimitSeconds: scenarioTimeLimit,
    remainingSeconds: scenarioTimeLimit,
  });
}

export function startMissionState(store: GameStore) {
  const currentState = store.getState();
  const roleTimeBonus = currentState.activeRole.timeBonusSeconds ?? 0;
  const activeTimeLimit =
    (currentState.activeScenario.timeLimitSeconds ?? currentState.timeLimitSeconds) + roleTimeBonus;
  store.setState({
    phase: 'playing',
    mission: createMissionState(
      createMissionDefinitionForScenario(currentState.activeScenario),
      'active'
    ),
    status: `Runde läuft – ${currentState.activeRole.title} bringt Menschen zusammen.`,
    hint:
      currentState.activeScenario.briefing ??
      currentState.activeRole.specialty ??
      'Sammle zuerst alle Impulse in der Arena ein.',
    interactionPrompt: '',
    goalUnlocked: false,
    collected: 0,
    totalCollectibles: currentState.totalCollectibles,
    elapsedSeconds: 0,
    timeLimitSeconds: activeTimeLimit,
    remainingSeconds: activeTimeLimit,
  });
}

export function failMission(
  store: GameStore,
  {
    status,
    hint,
    remainingSeconds,
  }: {
    status: string;
    hint: string;
    remainingSeconds: number;
  }
) {
  const currentState = store.getState();
  store.setState({
    phase: 'fail',
    mission: createMissionState(
      createMissionDefinitionForScenario(currentState.activeScenario),
      'failed'
    ),
    status,
    hint,
    interactionPrompt: '',
    remainingSeconds,
  });
}

export function updateMissionProgress({
  deltaSeconds,
  timeSeconds,
  playerPosition,
  collectibles,
  kineticCore,
  goalBeacon,
  input,
  store,
}: {
  deltaSeconds: number;
  timeSeconds: number;
  playerPosition: Vector3;
  collectibles: CollectibleSet;
  kineticCore: KineticCore;
  goalBeacon: GoalBeacon;
  input: InputController;
  store: GameStore;
}) {
  collectibles.animate(timeSeconds);
  goalBeacon.animate(timeSeconds);

  const state = store.getState();
  const interactionRadiusMultiplier = state.activeRole.interactionRadiusMultiplier ?? 1;
  const focusedCollectible = collectibles.highlightNearby(
    playerPosition,
    interactionRadiusMultiplier
  );
  const justCharged = kineticCore.update();
  if (justCharged && !goalBeacon.isActive()) {
    goalBeacon.activate();
    store.setState({
      goalUnlocked: true,
      status: 'Treffpunkt ist bereit.',
      hint: 'Der Gemeinschaftskern ist angekommen. Gehe jetzt zum Treffpunkt und drücke E.',
      interactionPrompt: '',
    });
  }

  const coreInRange = kineticCore.highlightNearby(playerPosition, interactionRadiusMultiplier);
  const beaconReady = goalBeacon.isActive();
  const beaconInRange = goalBeacon.highlightNearby(playerPosition, interactionRadiusMultiplier);
  const interactionPrompt = beaconInRange
    ? 'Drücke E, um den Treffpunkt zu öffnen.'
    : coreInRange
      ? 'Drücke E, um den Gemeinschaftskern weiterzuschieben.'
      : focusedCollectible
        ? `Drücke E, um ${focusedCollectible.label} zu sichern.`
        : '';
  const defaultHint = beaconReady
    ? interactionPrompt || 'Der Treffpunkt ist bereit. Erreiche ihn und drücke E.'
    : kineticCore.isUnlocked()
      ? interactionPrompt || 'Schiebe den Gemeinschaftskern mit E zur Plattform beim Treffpunkt.'
      : interactionPrompt || 'Bewege dich zu einem leuchtenden Ziel und drücke E.';

  if (
    interactionPrompt !== state.interactionPrompt ||
    (defaultHint !== state.hint && state.phase === 'playing')
  ) {
    store.setState({
      interactionPrompt,
      hint: defaultHint,
    });
  }

  if (input.consumeInteract()) {
    if (goalBeacon.tryComplete(playerPosition, interactionRadiusMultiplier)) {
      const completionState = store.getState();
      store.setState({
        phase: 'success',
        mission: createMissionState(
          createMissionDefinitionForScenario(completionState.activeScenario),
          'completed'
        ),
        status: 'Mission erfüllt.',
        hint: 'Du hast den Treffpunkt geöffnet und die Runde gemeinsam abgeschlossen.',
        interactionPrompt: '',
        goalUnlocked: true,
      });
      return;
    }

    if (kineticCore.tryPush(playerPosition, interactionRadiusMultiplier)) {
      store.setState({
        status: 'Gemeinschaftskern bewegt.',
        hint: 'Nutze bei Bedarf mehrere Schübe, bis der Kern die Plattform erreicht.',
        interactionPrompt: '',
      });
      return;
    }

    const collectedItem = collectibles.collectFocused(playerPosition, interactionRadiusMultiplier);
    if (!collectedItem) {
      store.setState({
        status: 'Kein Ziel in Reichweite.',
        hint: beaconReady
          ? 'Gehe zum Treffpunkt und drücke E, um die Mission abzuschließen.'
          : kineticCore.isUnlocked()
            ? 'Gehe näher an den Gemeinschaftskern und schiebe ihn mit E an.'
            : 'Gehe näher an ein leuchtendes Ziel und drücke dann E.',
        interactionPrompt: '',
      });
    } else {
      const totalCollected = collectibles.collectedCount();
      const nextState = store.getState();
      const allCollected = totalCollected >= nextState.totalCollectibles;

      if (allCollected) {
        kineticCore.unlock();
      }

      store.setState({
        collected: totalCollected,
        goalUnlocked: goalBeacon.isActive(),
        status: allCollected
          ? 'Gemeinschaftskern freigeschaltet.'
          : `${collectedItem.label} eingesammelt.`,
        hint: allCollected
          ? 'Schiebe jetzt den Gemeinschaftskern mit E zur Plattform beim Treffpunkt.'
          : 'Suche das nächste leuchtende Ziel in der Arena.',
        interactionPrompt: '',
      });
    }
  }

  const timeState = store.getState();
  const nextElapsed = Number((timeState.elapsedSeconds + deltaSeconds).toFixed(1));
  const nextRemaining = Math.max(0, Number((timeState.timeLimitSeconds - nextElapsed).toFixed(1)));
  if (nextRemaining <= 0) {
    failMission(store, {
      status: 'Zeit abgelaufen.',
      hint: 'Starte neu und erreiche den geöffneten Treffpunkt rechtzeitig.',
      remainingSeconds: 0,
    });
    store.setState({
      elapsedSeconds: timeState.timeLimitSeconds,
    });
    return;
  }

  if (nextElapsed !== timeState.elapsedSeconds || nextRemaining !== timeState.remainingSeconds) {
    store.setState({
      elapsedSeconds: nextElapsed,
      remainingSeconds: nextRemaining,
    });
  }
}
