interface Game3DSceneProps {
  progress?: number;
  onInteract?: () => void;
}

const THEMENWELTEN = [
  'Gemeinde',
  'Schule',
  'Arbeit',
  'Medien',
  'Umwelt',
  'Digital',
];

export default function Game3DScene({ progress = 0, onInteract }: Game3DSceneProps) {
  return (
    <button
      type="button"
      onClick={onInteract}
      className="group relative w-full overflow-hidden rounded-[28px] border border-white/15 bg-accent-950 text-left shadow-2xl transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      style={{ aspectRatio: '16 / 10' }}
      aria-label="Babylon.js-Spiel auf games.menschlichkeit-oesterreich.at öffnen"
    >
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute left-[12%] right-[12%] top-[38%] h-3 rounded-full bg-gradient-to-r from-rose-500 via-orange-400 to-sky-400 shadow-[0_0_48px_rgba(56,189,248,0.35)]" />
        <div className="absolute left-[22%] right-[22%] top-[14%] h-40 rounded-t-[999px] border-2 border-white/15 border-b-0" />
        <div className="absolute left-[18%] top-[28%] h-28 w-28 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute right-[16%] top-[16%] h-32 w-32 rounded-full bg-sky-400/10 blur-3xl" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-black/35" />

      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-2xl bg-black/70 p-4">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Babylon.js Preview
            </span>
            <h3 className="mt-4 text-2xl font-black text-white">Brücken Bauen in 3D</h3>
            <p className="mt-2 inline-block max-w-sm rounded-xl bg-black/80 px-3 py-2 text-sm leading-6 text-white">
              Zehn Themenwelten, sechs Rollen und ein klarer demokratischer Lernpfad auf der Games-Subdomain.
            </p>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-2xl text-white shadow-lg">
            🌉
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {THEMENWELTEN.map((welt) => (
              <span
                key={welt}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white"
              >
                {welt}
              </span>
            ))}
          </div>

          <div className="rounded-xl bg-black/45 px-3 py-2 backdrop-blur-sm">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-white">
              <span>Projektfortschritt</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 via-orange-400 to-sky-400 transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-accent-950 px-3 py-2 text-sm text-secondary-50 shadow-lg">
            <span className="font-medium">Startet auf games.menschlichkeit-oesterreich.at</span>
            <span className="font-semibold text-white transition-transform group-hover:translate-x-1">Spiel öffnen →</span>
          </div>
        </div>
      </div>
    </button>
  );
}
