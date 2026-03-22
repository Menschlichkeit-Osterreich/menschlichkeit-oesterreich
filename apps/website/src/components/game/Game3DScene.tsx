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
      className="group relative w-full overflow-hidden rounded-[28px] border border-white/15 bg-slate-950/90 text-left shadow-2xl transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      style={{
        aspectRatio: '16 / 10',
        backgroundImage:
          'radial-gradient(circle at top right, rgba(56,189,248,0.25), transparent 28%), radial-gradient(circle at left center, rgba(239,68,68,0.24), transparent 24%), linear-gradient(135deg, rgba(15,23,42,0.98), rgba(2,6,23,0.92))',
      }}
      aria-label="Babylon.js-Spiel auf games.menschlichkeit-oesterreich.at öffnen"
    >
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute left-[12%] right-[12%] top-[38%] h-3 rounded-full bg-gradient-to-r from-rose-500 via-orange-400 to-sky-400 shadow-[0_0_48px_rgba(56,189,248,0.35)]" />
        <div className="absolute left-[22%] right-[22%] top-[14%] h-40 rounded-t-[999px] border-2 border-white/15 border-b-0" />
        <div className="absolute left-[18%] top-[28%] h-28 w-28 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="absolute right-[16%] top-[16%] h-32 w-32 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
              Babylon.js Preview
            </span>
            <h3 className="mt-4 text-2xl font-black text-white">Brücken Bauen in 3D</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/75">
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
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
              >
                {welt}
              </span>
            ))}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
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

          <div className="flex items-center justify-between text-sm text-white/75">
            <span>Startet auf games.menschlichkeit-oesterreich.at</span>
            <span className="font-semibold text-white group-hover:translate-x-1 transition-transform">Spiel öffnen →</span>
          </div>
        </div>
      </div>
    </button>
  );
}
