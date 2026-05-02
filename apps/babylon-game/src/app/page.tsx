'use client';

import { useEffect, useRef, useState } from 'react';

import { createGameRuntime } from '@/game/bootstrap/create-game-runtime';
import { createGameDataAdapter } from '@/game/data/create-game-data-adapter';
import { DEFAULT_HUD_STATE, type GameHudState, type GameRuntime } from '@/game/state/game-types';
import { AccessiblePanel } from '@/game/ui/AccessiblePanel';
import { GameOverlay } from '@/game/ui/GameOverlay';
import { TouchControls } from '@/game/ui/TouchControls';

type AccessibleMissionStage = 'idle' | 'collect' | 'core' | 'beacon' | 'result';

interface AccessibleMissionState {
  enabled: boolean;
  stage: AccessibleMissionStage;
  collected: number;
  startedAt: number | null;
  outcome: 'completed' | 'failed' | null;
  message: string;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<GameRuntime | null>(null);
  const dataAdapterRef = useRef(
    createGameDataAdapter({
      source:
        process.env.NEXT_PUBLIC_GAME_DATA_SOURCE === 'api' ||
        process.env.NEXT_PUBLIC_GAME_DATA_SOURCE === 'api-stub'
          ? 'api'
          : 'local',
      ...(process.env.NEXT_PUBLIC_GAME_API_BASE_URL
        ? { baseUrl: process.env.NEXT_PUBLIC_GAME_API_BASE_URL }
        : {}),
    })
  );
  const [hud, setHud] = useState<GameHudState>(DEFAULT_HUD_STATE);
  const [accessibleMission, setAccessibleMission] = useState<AccessibleMissionState>({
    enabled: false,
    stage: 'idle',
    collected: 0,
    startedAt: null,
    outcome: null,
    message:
      'Starte den Textmodus, wenn du die Mission ohne räumliche 3D-Navigation erleben möchtest.',
  });

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    let disposed = false;

    void createGameRuntime({
      canvas: canvasRef.current,
      dataAdapter: dataAdapterRef.current,
      onStateChange: nextState => {
        if (!disposed) {
          setHud(nextState);
        }
      },
    })
      .then(runtime => {
        if (disposed) {
          runtime.dispose();
          return;
        }

        runtimeRef.current = runtime;
      })
      .catch((error: unknown) => {
        console.error('Babylon-MVP konnte nicht initialisiert werden.', error);
        if (!disposed) {
          setHud(current => ({
            ...current,
            phase: 'fail',
            status: 'Initialisierung fehlgeschlagen.',
            hint: 'Bitte prüfe Havok, die Scene-Dateien und die Browser-Konsole.',
          }));
        }
      });

    return () => {
      disposed = true;
      runtimeRef.current?.dispose();
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    setAccessibleMission({
      enabled: false,
      stage: 'idle',
      collected: 0,
      startedAt: null,
      outcome: null,
      message: 'Rolle oder Szenario wurden geändert. Der lineare Textmodus ist wieder bereit.',
    });
  }, [hud.activeRole.id, hud.activeScenario.id]);

  const handlePrimaryAction = () => {
    if (!runtimeRef.current) {
      return;
    }

    if (hud.phase === 'start') {
      runtimeRef.current.start();
      return;
    }

    if (hud.phase === 'success' || hud.phase === 'fail') {
      runtimeRef.current.reset();
    }
  };

  const handleRoleSelect = (roleId: string) => {
    runtimeRef.current?.setActiveRole(roleId);
  };

  const handleScenarioSelect = (scenarioId: string) => {
    runtimeRef.current?.setActiveScenario(scenarioId);
  };

  const accessibleCollectibleCount = Math.max(
    hud.totalCollectibles,
    hud.activeScenario.collectiblePositions.length
  );
  const handleAccessibleStart = () => {
    if (hud.activeScenario.status !== 'playable') {
      setAccessibleMission({
        enabled: false,
        stage: 'idle',
        collected: 0,
        startedAt: null,
        outcome: null,
        message: `Das Szenario ${hud.activeScenario.title} ist noch gesperrt.`,
      });
      return;
    }

    runtimeRef.current?.reset();
    setAccessibleMission({
      enabled: true,
      stage: 'collect',
      collected: 0,
      startedAt: Date.now(),
      outcome: null,
      message: `Textmodus aktiv. Markiere nun ${accessibleCollectibleCount} ${hud.activeScenario.collectibleLabel.toLowerCase()}(e).`,
    });
  };

  const handleAccessibleCollect = () => {
    setAccessibleMission(current => {
      const nextCollected = Math.min(current.collected + 1, accessibleCollectibleCount);
      const allCollected = nextCollected >= accessibleCollectibleCount;

      return {
        ...current,
        collected: nextCollected,
        stage: allCollected ? 'core' : 'collect',
        message: allCollected
          ? 'Alle Ziele wurden markiert. Bewege jetzt den Gemeinschaftskern zum Treffpunkt.'
          : `${nextCollected} von ${accessibleCollectibleCount} Zielen markiert.`,
      };
    });
  };

  const completeAccessibleMission = async (outcome: 'completed' | 'failed') => {
    const startedAt = accessibleMission.startedAt ?? Date.now();
    const elapsedSeconds = Math.min(
      Math.round((Date.now() - startedAt) / 1000),
      hud.activeScenario.timeLimitSeconds
    );
    const collected =
      outcome === 'completed' ? accessibleCollectibleCount : accessibleMission.collected;
    const remainingSeconds = Math.max(hud.activeScenario.timeLimitSeconds - elapsedSeconds, 0);
    const result = {
      missionId: hud.mission.id,
      missionTitle: hud.mission.title,
      scenarioId: hud.activeScenario.id,
      scenarioTitle: hud.activeScenario.title,
      outcome,
      roleId: hud.activeRole.id,
      roleTitle: hud.activeRole.title,
      collected,
      totalCollectibles: accessibleCollectibleCount,
      elapsedSeconds,
      recordedAt: new Date().toISOString(),
    };

    try {
      await Promise.all([
        dataAdapterRef.current.saveMissionProgress({
          missionId: hud.mission.id,
          scenarioId: hud.activeScenario.id,
          roleId: hud.activeRole.id,
          status: outcome === 'completed' ? 'completed' : 'failed',
          collected,
          totalCollectibles: accessibleCollectibleCount,
          remainingSeconds,
        }),
        dataAdapterRef.current.saveScenarioResult(result),
      ]);
    } catch (error) {
      console.error('Textmodus konnte den Spielfortschritt nicht speichern.', error);
    }

    setHud(current => {
      const nextCompletedMissionIds =
        outcome === 'completed' && !current.completedMissionIds.includes(current.mission.id)
          ? [...current.completedMissionIds, current.mission.id]
          : current.completedMissionIds;
      const nextCompletedScenarioIds =
        outcome === 'completed' && !current.completedScenarioIds.includes(current.activeScenario.id)
          ? [...current.completedScenarioIds, current.activeScenario.id]
          : current.completedScenarioIds;
      const nextScenarios = current.availableScenarios.map(scenario =>
        outcome === 'completed' && scenario.unlockAfterScenarioId === current.activeScenario.id
          ? { ...scenario, status: 'playable' as const }
          : scenario
      );

      return {
        ...current,
        phase: outcome === 'completed' ? 'success' : 'fail',
        status:
          outcome === 'completed'
            ? 'Mission im Textmodus erfolgreich abgeschlossen.'
            : 'Mission im Textmodus beendet.',
        hint:
          outcome === 'completed'
            ? 'Du kannst nun ein neues Szenario wählen oder die Runde erneut starten.'
            : 'Starte den Textmodus oder die 3D-Runde erneut, um es noch einmal zu versuchen.',
        mission: {
          ...current.mission,
          status: outcome === 'completed' ? 'completed' : 'failed',
        },
        availableScenarios: nextScenarios,
        completedMissionIds: nextCompletedMissionIds,
        completedScenarioIds: nextCompletedScenarioIds,
        lastScenarioResult: result,
        collected,
        totalCollectibles: accessibleCollectibleCount,
        elapsedSeconds,
        timeLimitSeconds: current.activeScenario.timeLimitSeconds,
        remainingSeconds,
        goalUnlocked: outcome === 'completed',
        interactionPrompt: '',
      };
    });

    setAccessibleMission({
      enabled: true,
      stage: 'result',
      collected,
      startedAt,
      outcome,
      message:
        outcome === 'completed'
          ? 'Der Textmodus hat die Mission erfolgreich abgeschlossen und den Fortschritt gespeichert.'
          : 'Der Textmodus wurde nicht erfolgreich beendet. Du kannst jederzeit neu starten.',
    });
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <h1 className="sr-only">Brücken bauen – Demokratiespiel von Menschlichkeit Österreich</h1>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(203,77,26,0.22),_transparent_0,_transparent_46%),linear-gradient(180deg,_#0b1f2f_0%,_#10293d_48%,_#190d07_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-orange-500/10 via-sky-500/5 to-transparent"
      />
      <div id="game-canvas" className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full select-none outline-none"
          aria-hidden="true"
        />
      </div>
      <TouchControls visible={hud.phase === 'playing'} />
      {hud.phase === 'loading' ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-5 z-20 flex justify-center"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-orange-400/25 bg-slate-950/80 px-4 py-2 text-sm text-amber-100 shadow-xl backdrop-blur">
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-200/30 border-t-amber-300"
              aria-hidden="true"
            />
            <span className="animate-pulse">Spielwelt wird geladen …</span>
          </div>
        </div>
      ) : null}
      {hud.phase !== 'playing' ? (
        <div className="pointer-events-none absolute bottom-4 right-4 max-w-xs rounded-2xl border border-orange-400/20 bg-slate-950/70 px-4 py-3 text-xs text-amber-50 shadow-xl backdrop-blur">
          Kurzlogik: <span className="font-semibold">zuhören → verbinden → Treffpunkt öffnen</span>
        </div>
      ) : null}
      <AccessiblePanel
        hud={hud}
        accessibleMission={accessibleMission}
        accessibleCollectibleCount={accessibleCollectibleCount}
        onRoleSelect={handleRoleSelect}
        onScenarioSelect={handleScenarioSelect}
        onAccessibleStart={handleAccessibleStart}
        onAccessibleCollect={handleAccessibleCollect}
        onCoreShift={() =>
          setAccessibleMission(current => ({
            ...current,
            stage: 'beacon',
            message: 'Gemeinschaftskern ist am Treffpunkt. Öffne jetzt den Dialogpunkt.',
          }))
        }
        onBeaconOpen={() => void completeAccessibleMission('completed')}
      />
      <GameOverlay
        hud={hud}
        onPrimaryAction={handlePrimaryAction}
        onRoleSelect={handleRoleSelect}
        onScenarioSelect={handleScenarioSelect}
        onToggleAudio={() => runtimeRef.current?.setAudioMuted(!hud.audioMuted)}
      />
    </main>
  );
}
