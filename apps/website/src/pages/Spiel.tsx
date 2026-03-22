import { Link } from 'react-router-dom';
import Game3DScene from '../components/game/Game3DScene';
import SeoHead from '../components/seo/SeoHead';
import { GAMES_SITE_URL } from '../config/siteConfig';

const SPIEL_KENNZAHLEN = [
  { value: '100', label: 'Levels mit Fortschrittssystem' },
  { value: '10', label: 'Themenwelten von Gemeinde bis Zukunft' },
  { value: '6', label: 'Rollen mit eigener Perspektive' },
  { value: '3D', label: 'Babylon.js-Erlebnis auf eigener Subdomain' },
];

const SPIEL_BAUSTEINE = [
  {
    title: 'Rolle wählen',
    description:
      'Du startest als engagierte Bürgerin, Lokalpolitiker, Journalistin, Aktivist, Verwaltungsbeamter oder Richterin.',
  },
  {
    title: 'Welt öffnen',
    description:
      'Jede Welt bündelt zehn Levels zu Demokratie, Menschenrechten, Medien, Digitalität, Umwelt oder sozialer Gerechtigkeit.',
  },
  {
    title: 'Entscheidung treffen',
    description:
      'Jede Antwort verändert dein Demokratie-Profil in den Bereichen Empathie, Rechte, Teilhabe und Zivilcourage.',
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
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 48%, #ea580c 100%)' }}
      >
        <div className="absolute inset-0 opacity-15" aria-hidden="true">
          <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/4 translate-y-1/3 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.95fr] md:gap-16">
            <div className="text-center md:text-left">
              <span className="inline-flex rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                Babylon.js 3D-Spiel
              </span>
              <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-6xl">
                Demokratie spielbar machen, statt sie nur zu erklären.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90 md:text-xl">
                <strong>Brücken Bauen in 3D</strong> läuft als eigenständiges Spiel auf{' '}
                <span className="font-semibold">games.menschlichkeit-oesterreich.at</span>.
                Auf dieser Seite findest du den Einstieg, die Themenwelten und die Verbindung zu
                Bildung, Mitmachen und zivilgesellschaftlicher Teilhabe.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
                {CTA_LINKS.map((link) =>
                  link.internal ? (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="rounded-2xl bg-white px-6 py-3 text-center text-base font-bold text-red-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-rose-50"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl bg-white px-6 py-3 text-center text-base font-bold text-red-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-rose-50"
                    >
                      {link.label}
                    </a>
                  ),
                )}
              </div>
            </div>

            <Game3DScene progress={72} onInteract={() => window.open(GAMES_SITE_URL, '_blank', 'noopener,noreferrer')} />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4">
          {SPIEL_KENNZAHLEN.map((item) => (
            <article key={item.label} className="text-center">
              <div className="text-3xl font-black text-red-600 md:text-4xl">{item.value}</div>
              <div className="mt-1 text-sm font-medium text-slate-600">{item.label}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">So funktioniert der neue Spielfluss.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Das Spiel ist bewusst von der Hauptwebsite entkoppelt. Dadurch bleibt die Website
              schnell, indexierbar und klar strukturiert, während das Spiel auf der Games-Subdomain
              als 3D-Erlebnis eigenständig wachsen kann.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {SPIEL_BAUSTEINE.map((item, index) => (
              <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-lg font-black text-white">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <h2 className="text-3xl font-black text-slate-900 md:text-4xl">Themenwelten statt einzelner Demo-Szenen.</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Das bisherige Spiel mit wenigen Einzel-Szenarien wurde zu einer größeren Lernstruktur
                weiterentwickelt. Die neue Plattform verbindet lokale, soziale und politische
                Konflikte zu einem konsistenten Pfad, der auch in Bildungsarbeit eingesetzt werden
                kann.
              </p>
              <div className="mt-8 rounded-3xl border border-red-100 bg-red-50 p-6">
                <h3 className="text-lg font-bold text-red-900">Warum die Trennung wichtig ist</h3>
                <p className="mt-3 text-sm leading-7 text-red-800">
                  Die Hauptdomain bleibt Suchmaschinen-, Inhalts- und Vertrauenshub. Das Spiel
                  selbst läuft separat auf der Games-Subdomain, damit 3D-Runtime, Service Worker,
                  Assets und Updates nicht die redaktionellen Kernseiten der Website destabilisieren.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {THEMENWELTEN.map((welt) => (
                <article
                  key={welt}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <h3 className="text-base font-bold text-slate-900">{welt}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Jede Themenwelt bündelt zehn Levels und legt den Fokus auf reale Spannungsfelder
                    zwischen Rechten, Beteiligung, Fairness und demokratischer Verantwortung.
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h2 className="text-3xl font-black md:text-4xl">Bildung, Mitmachen und Spiel greifen ineinander.</h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">
                Das Spiel ist kein isoliertes Gimmick. Es unterstützt politische Bildung,
                niedrigschwellige Auseinandersetzung mit Konflikten und einen handlungsorientierten
                Einstieg in die Themen von Menschlichkeit Österreich.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <ul className="space-y-4 text-sm leading-7 text-white/80">
                <li>Die Landingpage erklärt den Kontext und verlinkt direkt in Bildung, Spenden und Mitgliedschaft.</li>
                <li>Die Games-Subdomain kann unabhängig aktualisiert und auf Plesk separat ausgerollt werden.</li>
                <li>Der alte `/game/`-Pfad wird nur noch als Kompatibilitätspfad behandelt und leitet auf die Subdomain weiter.</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 rounded-[32px] bg-gradient-to-r from-red-600 to-orange-500 p-8 text-center shadow-2xl md:p-12">
            <h2 className="text-3xl font-black">Bereit für das Babylon-Spiel?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/90">
              Starte jetzt auf der Games-Subdomain oder nutze zuerst unsere Bildungs- und Mitmachangebote,
              wenn du die Themen vertiefen möchtest.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href={GAMES_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl bg-white px-8 py-3 text-base font-bold text-red-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-rose-50"
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
