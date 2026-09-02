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
    }>
  >((acc, entry) => {
    const existing = acc.find(item => item.worldId === entry.worldId);
    if (existing) {
      existing.total += 1;
      if (entry.status === 'live') {
        existing.live += 1;
      }
      return acc;
    }

    acc.push({
      worldId: entry.worldId,
      worldTitle: entry.worldTitle,
      total: 1,
      live: entry.status === 'live' ? 1 : 0,
    });
    return acc;
  }, []);
}

/**
 * Levelleiste mit zehn Feldern — eines je spielbarem Level.
 * Der Fortschritt zaehlt gegen {@link ROADMAP_LIVE_LEVELS}, nicht gegen den
 * Fahrplan bis {@link ROADMAP_TOTAL_LEVELS}. Sonst liest sich das erste
 * geschaffte Level als „1 / 100 (1 %)".
 */
export function LevelProgress({
  completedLiveLevels,
  tone = 'dark',
}: {
  completedLiveLevels: number;
  tone?: 'dark' | 'light';
}) {
  const done = Math.min(completedLiveLevels, ROADMAP_LIVE_LEVELS);
  const percent = Math.round((done / ROADMAP_LIVE_LEVELS) * 100);
  const emptyClass = tone === 'dark' ? 'bg-moe-hud-rule-strong' : 'bg-moe-rule';
  const labelClass = tone === 'dark' ? 'text-moe-ink-on-dark-muted' : 'text-moe-ink-muted';

  return (
    <div>
      <ol
        className="flex gap-1"
        role="progressbar"
        aria-label="Geschaffte Level"
        aria-valuemin={0}
        aria-valuemax={ROADMAP_LIVE_LEVELS}
        aria-valuenow={done}
        aria-valuetext={`${done} von ${ROADMAP_LIVE_LEVELS} Level geschafft`}
      >
        {Array.from({ length: ROADMAP_LIVE_LEVELS }, (_, index) => (
          <li
            key={index}
            className={`h-2 flex-1 ${index < done ? 'bg-moe-signal' : emptyClass}`}
            aria-hidden="true"
          />
        ))}
      </ol>
      <p className={`mt-2 font-mono text-[13px] tabular-nums ${labelClass}`}>
        {done} von {ROADMAP_LIVE_LEVELS} Level geschafft · {percent} %
      </p>
    </div>
  );
}

/**
 * Der Fahrplan bis Level {@link ROADMAP_TOTAL_LEVELS} ist ein eigener,
 * zugeklappter Einstieg — er gehoert nicht in den Startbildschirm.
 */
export function RoadmapPanel({ completedLiveLevels }: { completedLiveLevels: number }) {
  const roadmapWorldStats = getRoadmapWorldStats();

  return (
    <div>
      <LevelProgress completedLiveLevels={completedLiveLevels} />

      <details className="mt-3 border-t border-moe-hud-rule pt-3">
        <summary className="cursor-pointer list-none font-mono text-[13px] uppercase tracking-[0.14em] text-moe-signal-hell">
          Fahrplan bis Level {ROADMAP_TOTAL_LEVELS} ansehen
        </summary>
        <p className="mt-2 font-body text-[14px] leading-snug text-moe-ink-on-dark">
          {ROADMAP_LIVE_LEVELS} Level sind spielbar. Die übrigen{' '}
          {ROADMAP_TOTAL_LEVELS - ROADMAP_LIVE_LEVELS} entstehen etappenweise.
        </p>
        <ul className="mt-2.5 divide-y divide-moe-hud-rule border-t border-moe-hud-rule">
          {roadmapWorldStats.map(world => (
            <li
              key={world.worldId}
              className="flex items-baseline justify-between gap-3 py-1.5 font-body text-[14px] text-moe-ink-on-dark"
            >
              <span className="truncate">{world.worldTitle}</span>
              <span className="shrink-0 font-mono text-[13px] tabular-nums text-moe-ink-on-dark-muted">
                {world.live} / {world.total}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
