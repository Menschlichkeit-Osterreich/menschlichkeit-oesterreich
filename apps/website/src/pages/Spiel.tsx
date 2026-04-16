import { Link } from 'react-router-dom';
import Game3DScene from '../components/game/Game3DScene';
import SeoHead from '../components/seo/SeoHead';
import { GAMES_SITE_URL } from '../config/siteConfig';

const SPIEL_KENNZAHLEN = [
  { value: '2', label: 'Aktuell live spielbare 3D-Level' },
  { value: '100', label: 'Zielpfad im Ausbau (10 Welten × 10 Levels)' },
  { value: '2', label: 'Live-Rollen mit eigenem Spielstil' },
  { value: '3D', label: 'Babylon.js-Erlebnis auf eigener Subdomain' },
];

const SPIEL_BAUSTEINE = [
  {
    title: 'Rolle wählen',
    description:
      'Du startest derzeit als Aktivist*in oder Moderator*in mit unterschiedlichen Spielvorteilen.',
  },
  {
    title: 'Mission lösen',
    description:
      'Jede Runde folgt der Logik zuhören, verbinden, handeln und trainiert demokratische Teilhabe.',
  },
  {
    title: 'Roadmap wachsen lassen',
    description:
      'Die Plattform wird schrittweise auf 100 Levels ausgebaut, mit klaren Themenwelten von Gemeinde bis Zukunft.',
  },
];

const THEMENWELTEN = [
  'Gemeinde und Beteiligung',
  'Schule und Chancengerechtigkeit',
  'Arbeit und soziale Sicherheit',
  'Medien und Informationskompetenz',
  'Umwelt und Generationengerechtigkeit',
  'Digitalisierung und Grundrechte',
  'Gesundheit und Versorgung',
  'Europa und Solidarität',
  'Gerechtigkeit und Schutzrechte',
  'Zukunft und demokratische Innovation',
];

const CTA_LINKS = [
  { href: GAMES_SITE_URL, label: 'Spiel auf games.menschlichkeit-oesterreich.at öffnen' },
  { href: '/bildung', label: 'Bildungsarbeit ansehen', internal: true },
  { href: '/mitglied-werden', label: 'Mitglied werden', internal: true },
];

export default function SpielPage() {
  return (
    <div data-component="Spiel">
      <SeoHead
        title="Brücken Bauen in 3D – Demokratiespiel"
        description="Brücken Bauen in 3D ist das Babylon.js-Demokratiespiel von Menschlichkeit Österreich. Die Landingpage erklärt Spielidee, Themenwelten und den Einstieg auf games.menschlichkeit-oesterreich.at."
      />

      <section
        className="relative overflow-hidden bg-accent-900"
      >
        <div className="absolute inset-0 opacity-5" aria-hidden="true">
          <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.95fr] md:gap-16">
            <div className="text-center md:text-left">
              <span className="inline-flex rounded-full border border-white/20 bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                Babylon.js 3D-Spiel
              </span>
              <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
                Demokratie spielbar machen, statt sie nur zu erklären.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white md:text-xl">
                <strong>Brücken Bauen in 3D</strong> läuft als eigenständiges Spiel auf{' '}
                <span className="font-semibold">games.menschlichkeit-oesterreich.at</span>. Aktuell
                ist ein fokussierter 3D-Kern live. Parallel bauen wir den langfristigen
                100-Level-Pfad aus und verknüpfen ihn mit Bildung, Mitmachen und
                zivilgesellschaftlicher Teilhabe.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
                {CTA_LINKS.map(link =>
                  link.internal ? (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="rounded-2xl bg-white px-6 py-3 text-center text-base font-bold text-primary-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary-50"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl bg-white px-6 py-3 text-center text-base font-bold text-primary-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary-50"
                    >
                      {link.label}
                    </a>
                  )
                )}
              </div>
            </div>

            <Game3DScene
              progress={72}
              onInteract={() => window.open(GAMES_SITE_URL, '_blank', 'noopener,noreferrer')}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-secondary-200 bg-white py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4">
          {SPIEL_KENNZAHLEN.map(item => (
            <article key={item.label} className="text-center">
              <div className="text-3xl font-black text-primary-600 md:text-4xl">{item.value}</div>
              <div className="mt-1 text-sm font-medium text-secondary-600">{item.label}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black text-secondary-900 md:text-4xl">
              So funktioniert der aktuelle Spielfluss.
            </h2>
            <p className="mt-4 text-lg leading-8 text-secondary-600">
              Das Spiel ist bewusst von der Hauptwebsite entkoppelt. Dadurch bleibt die Website
              schnell, indexierbar und klar strukturiert, während das Spiel auf der Games-Subdomain
              als 3D-Erlebnis eigenständig wachsen kann. Die Live-Version bildet den Kern, die
              100-Level-Roadmap wird in Etappen erweitert.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {SPIEL_BAUSTEINE.map((item, index) => (
              <article
                key={item.title}
                className="rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-900 text-lg font-black text-white">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-secondary-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-secondary-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <h2 className="text-3xl font-black text-secondary-900 md:text-4xl">
                Roadmap: 10 Welten, 100 Levels.
              </h2>
              <p className="mt-4 text-lg leading-8 text-secondary-600">
                Die Plattform wächst schrittweise: von einer stabilen Live-Basis hin zu einem
                vollständigen Lernpfad über 10 Themenwelten mit jeweils 10 Levels. So bleiben
                Qualität, Verständlichkeit und Produktwahrheit erhalten.
              </p>
              <div className="mt-8 rounded-3xl border border-primary-200 bg-primary-50 p-6">
                <h3 className="text-lg font-bold text-secondary-900">Live jetzt, Ausbau geplant</h3>
                <p className="mt-3 text-sm leading-7 text-secondary-700">
                  Die Hauptdomain bleibt Suchmaschinen-, Inhalts- und Vertrauenshub. Das Spiel läuft
                  separat auf der Games-Subdomain. Dadurch können wir neue Levelwellen ausrollen,
                  ohne die redaktionellen Kernseiten zu destabilisieren.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {THEMENWELTEN.map(welt => (
                <article
                  key={welt}
                  className="rounded-3xl border border-secondary-200 bg-secondary-50 p-5 shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <h3 className="text-base font-bold text-secondary-900">{welt}</h3>
                  <p className="mt-2 text-sm leading-7 text-secondary-600">
                    Jede Themenwelt ist Teil der 100-Level-Roadmap und fokussiert reale
                    Spannungsfelder zwischen Rechten, Beteiligung, Fairness und demokratischer
                    Verantwortung.
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-accent-900 py-16 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h2 className="text-3xl font-black md:text-4xl">
                Bildung, Mitmachen und Spiel greifen ineinander.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white">
                Das Spiel ist kein isoliertes Gimmick. Es unterstützt politische Bildung,
                niedrigschwellige Auseinandersetzung mit Konflikten und einen handlungsorientierten
                Einstieg in die Themen von Menschlichkeit Österreich.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <ul className="space-y-4 text-sm leading-7 text-white">
                <li>
                  Die Landingpage erklärt den Kontext und verlinkt direkt in Bildung, Spenden und
                  Mitgliedschaft.
                </li>
                <li>
                  Die Games-Subdomain kann unabhängig aktualisiert und auf Plesk separat ausgerollt
                  werden.
                </li>
                <li>
                  Der alte `/game/`-Pfad wird nur noch als Kompatibilitätspfad behandelt und leitet
                  auf die Subdomain weiter.
                </li>
              </ul>
            </div>
          </div>

          <div
            className="mt-12 rounded-[32px] bg-accent-900 p-8 text-center shadow-2xl md:p-12"
          >
            <h2 className="text-3xl font-black">Bereit für das Babylon-Spiel?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white">
              Starte jetzt die Live-Version auf der Games-Subdomain. Der Ausbau auf 100 Levels läuft
              in klaren Etappen, eng verknüpft mit unseren Bildungs- und Mitmachangeboten.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href={GAMES_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-white px-8 py-3 text-base font-bold text-primary-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary-50"
              >
                Spiel starten
              </a>
              <Link
                to="/bildung"
                className="rounded-2xl border border-white/30 bg-white/10 px-8 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/15"
              >
                Bildungsarbeit ansehen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
