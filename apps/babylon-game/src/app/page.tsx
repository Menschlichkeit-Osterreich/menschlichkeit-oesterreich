'use client';

import { useEffect, useRef, useState } from 'react';

import { createGameRuntime } from '@/game/bootstrap/create-game-runtime';
import { createGameDataAdapter } from '@/game/data/create-game-data-adapter';
import { DEFAULT_HUD_STATE, type GameHudState, type GameRuntime } from '@/game/state/game-types';
import { GameOverlay } from '@/game/ui/GameOverlay';

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
      source: process.env.NEXT_PUBLIC_GAME_DATA_SOURCE === 'api-stub' ? 'api-stub' : 'local',
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
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full select-none outline-none"
        aria-hidden="true"
      />
      {hud.phase !== 'playing' ? (
        <div className="pointer-events-none absolute bottom-4 right-4 max-w-xs rounded-2xl border border-orange-400/20 bg-slate-950/70 px-4 py-3 text-xs text-amber-50 shadow-xl backdrop-blur">
          Kurzlogik: <span className="font-semibold">zuhören → verbinden → Treffpunkt öffnen</span>
        </div>
      ) : null}
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
                onChange={event => handleRoleSelect(event.target.value)}
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
              <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Szenario
              </span>
              <select
                value={hud.activeScenario.id}
                onChange={event => handleScenarioSelect(event.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-50"
              >
                {hud.availableScenarios.map(scenario => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.title}
                    {scenario.status !== 'playable' ? ' – gesperrt' : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-xl bg-slate-900/80 p-3">
            <p className="text-xs text-amber-100" role="status" aria-live="polite">
              {accessibleMission.message}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {!accessibleMission.enabled || accessibleMission.stage === 'idle' ? (
              <button
                type="button"
                onClick={handleAccessibleStart}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
              >
                Textmodus starten
              </button>
            ) : null}

            {accessibleMission.enabled && accessibleMission.stage === 'collect' ? (
              <button
                type="button"
                onClick={handleAccessibleCollect}
                className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                {hud.activeScenario.collectibleLabel} markieren ({accessibleMission.collected}/
                {accessibleCollectibleCount})
              </button>
            ) : null}

            {accessibleMission.enabled && accessibleMission.stage === 'core' ? (
              <button
                type="button"
                onClick={() =>
                  setAccessibleMission(current => ({
                    ...current,
                    stage: 'beacon',
                    message: 'Gemeinschaftskern ist am Treffpunkt. Öffne jetzt den Dialogpunkt.',
                  }))
                }
                className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Kern verschoben
              </button>
            ) : null}

            {accessibleMission.enabled && accessibleMission.stage === 'beacon' ? (
              <button
                type="button"
                onClick={() => void completeAccessibleMission('completed')}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
              >
                Treffpunkt öffnen
              </button>
            ) : null}
          </div>
        </div>
      </details>
      <GameOverlay
        hud={hud}
        onPrimaryAction={handlePrimaryAction}
        onRoleSelect={handleRoleSelect}
        onScenarioSelect={handleScenarioSelect}
      />
    </main>
  );
}
