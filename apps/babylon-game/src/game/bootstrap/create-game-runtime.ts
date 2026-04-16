import { createAudioManager } from '@/game/audio/audio-manager';
import { createEngineScene } from '@/game/bootstrap/create-engine-scene';
import { createFollowCamera } from '@/game/bootstrap/create-follow-camera';
import { setupPhysics } from '@/game/bootstrap/setup-physics';
import {
  DEFAULT_AVAILABLE_SCENARIOS,
  DEFAULT_PLAYER_ROLES,
  type GameDataAdapter,
} from '@/game/data/contracts';
import { createLocalGameDataAdapter } from '@/game/data/local-game-data-adapter';
import { prepareMissionState, startMissionState } from '@/game/missions/ring-beacon-mission';
import {
  applyScenarioEnvironmentTheme,
  loadPlayableEnvironment,
} from '@/game/objects/create-arena';
import { createCollectibles } from '@/game/objects/create-collectibles';
import { createGoalBeacon } from '@/game/objects/create-goal-beacon';
import { createKineticCore } from '@/game/objects/create-kinetic-core';
import { createPlayer } from '@/game/objects/create-player';
import { resolveAvailableScenarios, type GameScenario } from '@/game/scenarios/scenario-model';
import { createGameStore } from '@/game/state/game-store';
import type { GameHudState, GameRuntime } from '@/game/state/game-types';
import { updateGameplay } from '@/game/systems/gameplay-loop';
import { createInputController } from '@/game/systems/input-controller';
import { bindHudState } from '@/game/ui/bind-hud-state';

function pickActiveScenario(
  availableScenarios: GameScenario[],
  activeScenarioId: string
): GameScenario | undefined {
  const preferredScenario = availableScenarios.find(scenario => scenario.id === activeScenarioId);
  if (preferredScenario?.status === 'playable') {
    return preferredScenario;
  }

  return (
    availableScenarios.find(scenario => scenario.status === 'playable') ?? availableScenarios[0]
  );
}

function normalizeScenarioId(scenarioId: string): string {
  const legacyToCurrentMap: Record<string, string> = {
    'kinetic-training': 'dialog-start',
    'resonance-field': 'nachbarschaft-dialog',
  };
  return legacyToCurrentMap[scenarioId] ?? scenarioId;
}

export async function createGameRuntime({
  canvas,
  dataAdapter = createLocalGameDataAdapter(),
  onStateChange,
}: {
  canvas: HTMLCanvasElement;
  dataAdapter?: GameDataAdapter;
  onStateChange?: (state: GameHudState) => void;
}): Promise<GameRuntime> {
  const { engine, scene: baseScene } = createEngineScene(canvas);
  const physicsReady = await setupPhysics(baseScene);

  const store = createGameStore();
  const unsubscribe = bindHudState(store, onStateChange);

  const bootstrapData = await dataAdapter.loadBootstrapData();
  const fallbackRole = DEFAULT_PLAYER_ROLES[0];
  if (!fallbackRole) {
    throw new Error('Es muss mindestens eine lokale Spielrolle definiert sein.');
  }
  const availableRoles = bootstrapData.roles.length ? bootstrapData.roles : DEFAULT_PLAYER_ROLES;
  const activeRole =
    availableRoles.find(role => role.id === bootstrapData.progress.activeRoleId) ??
    availableRoles[0] ??
    fallbackRole;
  const completedScenarioIds = bootstrapData.progress.completedScenarioIds ?? [];
  const baseScenarioCatalog = bootstrapData.scenarios.length
    ? bootstrapData.scenarios
    : DEFAULT_AVAILABLE_SCENARIOS;
  const availableScenarios = resolveAvailableScenarios(baseScenarioCatalog, completedScenarioIds);
  const fallbackScenario = pickActiveScenario(
    availableScenarios,
    normalizeScenarioId(bootstrapData.progress.activeScenarioId)
  );
  if (!fallbackScenario) {
    throw new Error('Es muss mindestens ein lokales Szenario definiert sein.');
  }
  const activeScenario = fallbackScenario;
  store.setState({
    dataSource: dataAdapter.source,
    availableScenarios,
    activeScenario,
    availableRoles,
    activeRole,
    audioMuted: bootstrapData.progress.audioMuted ?? false,
    completedMissionIds: bootstrapData.progress.completedMissionIds,
    completedScenarioIds,
    lastScenarioResult: bootstrapData.progress.lastScenarioResult,
  });

  const { scene, mode: environment } = await loadPlayableEnvironment(baseScene);

  const player = createPlayer(scene);
  scene.activeCamera = createFollowCamera(scene, player.mesh);

  applyScenarioEnvironmentTheme(scene, activeScenario);
  const collectibles = createCollectibles(scene, {
    positions: activeScenario.collectiblePositions,
    labelPrefix: activeScenario.collectibleLabel,
    palette: activeScenario.collectiblePalette,
  });
  const kineticCore = createKineticCore(scene);
  const goalBeacon = createGoalBeacon(scene);
  const input = createInputController(window);
  const audio = createAudioManager(scene);
  audio.setMuted(bootstrapData.progress.audioMuted ?? false);
  prepareMissionState(store, collectibles, goalBeacon, kineticCore, environment);
  if (!physicsReady) {
    store.setState({
      status: 'Treffpunkt bereit (Fallback-Modus).',
      hint: 'Havok war nicht rechtzeitig verfügbar. Du kannst trotzdem starten und den Gemeinschaftskern mit E schrittweise weiterschieben.',
    });
  }

  let lastPersistedStatus = store.getState().mission.status;
  let lastPersistedCollected = store.getState().collected;
  let lastCollectedForAudio = store.getState().collected;
  let lastResultPhase: GameHudState['phase'] | null = null;
  let lastPhase: GameHudState['phase'] = store.getState().phase;
  const unsubscribeDataSync = store.subscribe(state => {
    if (
      state.mission.status !== lastPersistedStatus ||
      state.collected !== lastPersistedCollected
    ) {
      lastPersistedStatus = state.mission.status;
      lastPersistedCollected = state.collected;
      void dataAdapter.saveMissionProgress({
        missionId: state.mission.id,
        scenarioId: state.activeScenario.id,
        roleId: state.activeRole.id,
        status: state.mission.status,
        collected: state.collected,
        totalCollectibles: state.totalCollectibles,
        remainingSeconds: state.remainingSeconds,
      });
    }

    if ((state.phase === 'success' || state.phase === 'fail') && state.phase !== lastResultPhase) {
      lastResultPhase = state.phase;
      const scenarioResult = {
        missionId: state.mission.id,
        missionTitle: state.mission.title,
        scenarioId: state.activeScenario.id,
        scenarioTitle: state.activeScenario.title,
        outcome: state.phase === 'success' ? 'completed' : 'failed',
        roleId: state.activeRole.id,
        roleTitle: state.activeRole.title,
        collected: state.collected,
        totalCollectibles: state.totalCollectibles,
        elapsedSeconds: state.elapsedSeconds,
        recordedAt: new Date().toISOString(),
      } as const;
      const nextCompletedMissionIds =
        scenarioResult.outcome === 'completed' &&
        !state.completedMissionIds.includes(state.mission.id)
          ? [...state.completedMissionIds, state.mission.id]
          : state.completedMissionIds;
      const nextCompletedScenarioIds =
        scenarioResult.outcome === 'completed' &&
        !state.completedScenarioIds.includes(state.activeScenario.id)
          ? [...state.completedScenarioIds, state.activeScenario.id]
          : state.completedScenarioIds;
      const nextAvailableScenarios = resolveAvailableScenarios(
        baseScenarioCatalog,
        nextCompletedScenarioIds
      );
      const newlyUnlockedScenario = nextAvailableScenarios.find(scenario => {
        const previous = state.availableScenarios.find(entry => entry.id === scenario.id);
        return previous?.status === 'locked' && scenario.status === 'playable';
      });

      void dataAdapter.saveScenarioResult(scenarioResult);
      store.setState({
        lastScenarioResult: scenarioResult,
        completedMissionIds: nextCompletedMissionIds,
        completedScenarioIds: nextCompletedScenarioIds,
        availableScenarios: nextAvailableScenarios,
        status:
          scenarioResult.outcome === 'completed' && newlyUnlockedScenario
            ? `Mission erfüllt. ${newlyUnlockedScenario.title} wurde freigeschaltet.`
            : state.status,
        hint:
          scenarioResult.outcome === 'completed' && newlyUnlockedScenario
            ? `Wähle jetzt ${newlyUnlockedScenario.title}, wenn du die schwierigere Runde starten willst.`
            : state.hint,
      });
    }
    if (state.phase !== 'success' && state.phase !== 'fail') {
      lastResultPhase = null;
    }

    if (state.collected > lastCollectedForAudio) {
      audio.playCollect();
    }
    lastCollectedForAudio = state.collected;

    if (state.phase !== lastPhase) {
      if (state.phase === 'playing') {
        audio.playAmbient();
      }
      if (state.phase === 'success') {
        audio.playSuccess();
        audio.stopAmbient();
      }
      if (state.phase === 'fail') {
        audio.playFail();
        audio.stopAmbient();
      }
      if (state.phase === 'start') {
        audio.stopAmbient();
      }
      lastPhase = state.phase;
    }
  });

  let disposed = false;
  const onResize = () => engine.resize();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  engine.runRenderLoop(() => {
    if (disposed) {
      return;
    }

    updateGameplay({
      deltaSeconds: Math.min(engine.getDeltaTime() / 1000, 0.05),
      timeSeconds: performance.now() / 1000,
      player,
      collectibles,
      kineticCore,
      goalBeacon,
      input,
      store,
    });
    scene.render();
  });

  return {
    start() {
      if (disposed) {
        return;
      }

      const currentState = store.getState();
      if (currentState.activeScenario.status !== 'playable') {
        store.setState({
          status: `Szenario ${currentState.activeScenario.title} ist noch gesperrt.`,
          hint: currentState.activeScenario.briefing,
        });
        return;
      }

      player.reset();
      collectibles.reset();
      kineticCore.reset();
      goalBeacon.reset();
      startMissionState(store);
    },
    reset() {
      if (disposed) {
        return;
      }

      player.reset();
      collectibles.reset();
      kineticCore.reset();
      goalBeacon.reset();
      prepareMissionState(store, collectibles, goalBeacon, kineticCore, environment);
    },
    setActiveRole(roleId) {
      if (disposed) {
        return;
      }

      const role = availableRoles.find(entry => entry.id === roleId);
      if (!role) {
        return;
      }

      void dataAdapter.setActiveRole(role.id);
      const currentState = store.getState();
      store.setState({
        activeRole: role,
        status:
          currentState.phase === 'start' ||
          currentState.phase === 'success' ||
          currentState.phase === 'fail'
            ? `Rolle gewählt: ${role.title}.`
            : currentState.status,
        hint:
          currentState.phase === 'start' ||
          currentState.phase === 'success' ||
          currentState.phase === 'fail'
            ? role.description
            : currentState.hint,
      });
    },
    setActiveScenario(scenarioId) {
      if (disposed) {
        return;
      }

      const currentState = store.getState();
      const scenario = currentState.availableScenarios.find(entry => entry.id === scenarioId);
      if (!scenario) {
        return;
      }
      if (scenario.status !== 'playable') {
        store.setState({
          status: `Szenario ${scenario.title} ist noch gesperrt.`,
          hint:
            scenario.unlockAfterScenarioId === 'dialog-start'
              ? 'Schließe zuerst Brücken bauen erfolgreich ab, um dieses Szenario freizuschalten.'
              : scenario.briefing,
        });
        return;
      }
      if (currentState.activeScenario.id === scenario.id) {
        return;
      }

      void dataAdapter.setActiveScenario(scenario.id);
      if (currentState.phase === 'playing') {
        store.setState({
          activeScenario: scenario,
          status: `Szenario ${scenario.title} wird nach dem Neustart aktiv.`,
          hint: 'Drücke nach der laufenden Runde auf Neustart, um das neue Briefing zu laden.',
        });
        return;
      }

      player.reset();
      collectibles.reset();
      kineticCore.reset();
      goalBeacon.reset();
      applyScenarioEnvironmentTheme(scene, scenario);
      store.setState({ activeScenario: scenario });
      prepareMissionState(store, collectibles, goalBeacon, kineticCore, environment);
    },
    setAudioMuted(audioMuted) {
      if (disposed) {
        return;
      }

      audio.setMuted(audioMuted);
      void dataAdapter.setAudioMuted(audioMuted);
      store.setState({ audioMuted });
    },
    dispose() {
      if (disposed) {
        return;
      }

      disposed = true;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      input.dispose();
      audio.dispose();
      unsubscribeDataSync();
      unsubscribe();
      scene.dispose();
      engine.dispose();
    },
  };
}
