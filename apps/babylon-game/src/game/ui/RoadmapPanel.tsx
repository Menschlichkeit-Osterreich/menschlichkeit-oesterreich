import {
  GAME_LEVEL_ROADMAP,
  ROADMAP_LIVE_LEVELS,
  ROADMAP_TOTAL_LEVELS,
} from '@/game/scenarios/scenario-model';

function getRoadmapWorldStats() {
  return GAME_LEVEL_ROADMAP.reduce<
    Array<{
      worldId: string;
      worldTitle: string;
      total: number;
      live: number;
      levels: typeof GAME_LEVEL_ROADMAP;
    }>
  >((acc, entry) => {
    const existing = acc.find(item => item.worldId === entry.worldId);
    if (existing) {
      existing.total += 1;
      if (entry.status === 'live') {
        existing.live += 1;
      }
      existing.levels.push(entry);
      return acc;
    }

    acc.push({
      worldId: entry.worldId,
      worldTitle: entry.worldTitle,
      total: 1,
      live: entry.status === 'live' ? 1 : 0,
      levels: [entry],
    });
    return acc;
  }, []);
}

const roadmapMilestones = [2, 25, 50, 100] as const;

export function RoadmapPanel({ completedLiveLevels }: { completedLiveLevels: number }) {
  const overallProgressPercent = Math.round((completedLiveLevels / ROADMAP_TOTAL_LEVELS) * 100);
  const liveProgressPercent = Math.round((completedLiveLevels / ROADMAP_LIVE_LEVELS) * 100);
  const roadmapWorldStats = getRoadmapWorldStats();

  return (
    <>
      <p className="mt-2 text-xs text-sky-100">
        Ausbaupfad: {ROADMAP_LIVE_LEVELS}/{ROADMAP_TOTAL_LEVELS} Levels sind live, die restlichen
        werden etappenweise freigeschaltet.
      </p>
      <div className="mt-3 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-300">
          <span>Roadmap gesamt</span>
          <span className="font-semibold text-slate-100">
            {completedLiveLevels}/{ROADMAP_TOTAL_LEVELS} ({overallProgressPercent}%)
          </span>
        </div>
        <div
          className="relative h-2 overflow-hidden rounded-full bg-slate-800"
          role="progressbar"
          aria-label="Roadmap gesamt Fortschritt"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={overallProgressPercent}
        >
          <div
            className="h-full rounded-full bg-orange-400 transition-all"
            style={{ width: `${Math.max(overallProgressPercent, 2)}%` }}
          />
          {roadmapMilestones.map(milestone => (
            <span
              key={milestone}
              className={`absolute top-1/2 h-2 w-[1px] -translate-y-1/2 ${overallProgressPercent >= milestone ? 'bg-emerald-300' : 'bg-slate-600'}`}
              style={{ left: `${milestone}%` }}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {roadmapMilestones.map(milestone => {
            const reached = overallProgressPercent >= milestone;
            return (
              <span
                key={milestone}
                className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                  reached ? 'bg-emerald-500/25 text-emerald-100' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {milestone}%
              </span>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-slate-300">
          <span>Live-Kapitel</span>
          <span className="font-semibold text-slate-100">
            {completedLiveLevels}/{ROADMAP_LIVE_LEVELS} ({liveProgressPercent}%)
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-slate-800"
          role="progressbar"
          aria-label="Live-Kapitel Fortschritt"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={liveProgressPercent}
        >
          <div
            className="h-full rounded-full bg-sky-400 transition-all"
            style={{ width: `${Math.max(liveProgressPercent, 2)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-3 text-sm text-slate-200">
        <p className="font-medium text-amber-100">Welten-Fahrplan (100 Levels)</p>
        <div className="mt-2 space-y-2 text-xs text-slate-300">
          {roadmapWorldStats.map(world => (
            <details key={world.worldId} className="rounded-lg bg-slate-950/60 px-2 py-2">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{world.worldTitle}</span>
                  <span className="text-[11px] text-slate-400">
                    {world.live}/{world.total} live
                  </span>
                </div>
              </summary>
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800"
                role="progressbar"
                aria-label={`Fortschritt ${world.worldTitle}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round((world.live / world.total) * 100)}
              >
                <div
                  className="h-full rounded-full bg-sky-400"
                  style={{ width: `${Math.round((world.live / world.total) * 100)}%` }}
                />
              </div>
              <ul className="mt-2 space-y-1">
                {world.levels.map(level => (
                  <li
                    key={`${world.worldId}-${level.levelNumber}`}
                    className="flex items-center justify-between rounded-md bg-slate-900/70 px-2 py-1 text-[11px]"
                  >
                    <span>Level {level.levelNumber}</span>
                    <span
                      className={level.status === 'live' ? 'text-emerald-200' : 'text-slate-400'}
                    >
                      {level.status === 'live' ? 'live' : `geplant · ${level.learningFocus}`}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
