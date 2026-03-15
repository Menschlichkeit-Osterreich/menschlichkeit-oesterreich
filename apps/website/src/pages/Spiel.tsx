import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Game3DScene from '../components/game/Game3DScene';
import SeoHead from '../components/seo/SeoHead';

const GAME_FEATURES = [
  {
    icon: '🌉',
    title: 'Brücken Bauen',
    description: 'Erlebe realistische Szenarien aus Nachbarschaft, Arbeitsplatz, Politik und Medien.',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: '🗳️',
    title: 'Demokratie erleben',
    description: 'Triff Entscheidungen, die Empathie, Rechte, Partizipation und Zivilcourage fordern.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: '📊',
    title: 'Dein Profil',
    description: 'Erhalte am Ende dein persönliches Demokratie-Profil mit Stärken und Empfehlungen.',
    color: 'from-green-500 to-teal-500',
  },
  {
    icon: '🎓',
    title: 'Bildungsmaterial',
    description: 'Jedes Szenario enthält Hintergrundinformationen und verschiedene Perspektiven.',
    color: 'from-purple-500 to-violet-500',
  },
];

const SCENARIOS_PREVIEW = [
  { id: 1, category: 'Nachbarschaft', title: 'Der laute Nachbar', difficulty: 'Einstieg', icon: '🏘️' },
  { id: 2, category: 'Arbeitsplatz', title: 'Diskriminierung im Büro', difficulty: 'Einstieg', icon: '💼' },
  { id: 3, category: 'Politik', title: 'Wahlentscheidung', difficulty: 'Einstieg', icon: '🏛️' },
  { id: 4, category: 'Medien', title: 'Fake News in der Familie', difficulty: 'Einstieg', icon: '📱' },
  { id: 9, category: 'Schule', title: 'Das Schulprojekt', difficulty: 'Mittel', icon: '📚' },
  { id: 10, category: 'Umwelt', title: 'Klimagerechtigkeit', difficulty: 'Mittel', icon: '🌍' },
];

const SCORE_CATEGORIES = [
  { name: 'Empathie', icon: '💙', description: 'Einfühlungsvermögen und Verständnis für andere', color: 'bg-blue-500' },
  { name: 'Rechte', icon: '⚖️', description: 'Wissen über Grund- und Menschenrechte', color: 'bg-red-500' },
  { name: 'Partizipation', icon: '🤝', description: 'Demokratische Teilhabe und Engagement', color: 'bg-green-500' },
  { name: 'Zivilcourage', icon: '🦁', description: 'Mut, für Werte einzustehen', color: 'bg-orange-500' },
];

const STATS = [
  { value: '8+', label: 'Szenarien' },
  { value: '4', label: 'Bewertungskategorien' },
  { value: '48+', label: 'Entscheidungspfade' },
  { value: 'PWA', label: 'Offline spielbar' },
];

export default function SpielPage() {
  const [showEmbed, setShowEmbed] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeEmbed = useCallback(() => {
    setShowEmbed(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!showEmbed) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeEmbed();
    };
    document.addEventListener('keydown', handleKey);
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>('button, a, [tabindex]');
    firstFocusable?.focus();
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [showEmbed, closeEmbed]);

  return (
    <div data-component="Spiel">
      <SeoHead
        title="Demokratiespiel – Spielerisch Demokratie lernen"
        description="Das interaktive Demokratiespiel von Menschlichkeit Österreich. Lernen Sie spielerisch, wie Demokratie funktioniert, und stärken Sie Ihr Verständnis für politische Teilhabe."
      />
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 45%, #ea580c 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold tracking-widest uppercase mb-4 backdrop-blur-sm border border-white/20">
                Interaktives Lernspiel
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                Brücken Bauen
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-xl mb-6 leading-relaxed">
                Ein interaktives Spiel über Empathie, Menschenrechte und demokratischen Zusammenhalt.
                Triff Entscheidungen in realistischen Szenarien und entdecke dein Demokratie-Profil.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <button
                  ref={triggerRef}
                  onClick={() => setShowEmbed(true)}
                  className="px-6 py-3 bg-white text-red-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all text-base"
                >
                  Jetzt spielen
                </button>
                <a
                  href="#features"
                  className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-all text-base text-center backdrop-blur-sm"
                >
                  Mehr erfahren
                </a>
              </div>
            </div>

            <div className="flex-shrink-0 w-full md:w-96 relative">
              <Game3DScene progress={65} onInteract={() => setShowEmbed(true)} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-red-600">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Was erwartet dich?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Brücken Bauen ist ein interaktives Lernspiel, das demokratische Werte erlebbar macht.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GAME_FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-3xl mb-4 shadow-sm`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Bewertungskategorien</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Jede Entscheidung wird in vier Kategorien bewertet. Am Ende erhältst du dein persönliches Demokratie-Profil.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SCORE_CATEGORIES.map((cat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-600">{cat.description}</p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div className={`${cat.color} h-2 rounded-full`} style={{ width: `${60 + i * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Szenarien-Übersicht</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Realistische Situationen aus verschiedenen Lebensbereichen.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCENARIOS_PREVIEW.map((s) => (
              <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">{s.category}</span>
                    <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">{s.difficulty}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Level {s.id}: {s.title}</h3>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">...und viele weitere Szenarien im Spiel!</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
            <h2 className="text-3xl font-bold mb-4">Bereit, Brücken zu bauen?</h2>
            <p className="text-white/90 max-w-lg mx-auto mb-6 text-lg">
              Starte jetzt das Demokratiespiel und entdecke, welcher Demokratie-Typ du bist.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowEmbed(true)}
                className="px-8 py-3 bg-white text-red-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all text-lg"
              >
                Jetzt spielen
              </button>
              <Link
                to="/mitglied-werden"
                className="px-8 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-all text-lg text-center backdrop-blur-sm"
              >
                Mitglied werden
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-2">🏫</div>
              <h3 className="font-bold text-gray-900 mb-1">Für Schulen</h3>
              <p className="text-sm text-gray-600">
                Ideales Lernwerkzeug für den Unterricht. Inklusive Lehrer-Dashboard mit Lernanalysen.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-bold text-gray-900 mb-1">Überall spielbar</h3>
              <p className="text-sm text-gray-600">
                Als Progressive Web App auch offline auf dem Handy oder Tablet spielbar.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">♿</div>
              <h3 className="font-bold text-gray-900 mb-1">Barrierefrei</h3>
              <p className="text-sm text-gray-600">
                WCAG-konform mit Tastaturnavigation, Screen-Reader-Unterstützung und hohen Kontrasten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {showEmbed && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Brücken Bauen — Demokratiespiel"
          ref={dialogRef}
          onClick={(e) => { if (e.target === e.currentTarget) closeEmbed(); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-xl">🌉</span>
                <span className="font-bold text-gray-900">Brücken Bauen — Demokratiespiel</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/game/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  In neuem Tab öffnen
                </a>
                <button
                  onClick={closeEmbed}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Spiel schließen"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <iframe
              src="/game/index.html"
              className="flex-1 w-full border-0"
              title="Brücken Bauen — Demokratiespiel"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              allow="fullscreen"
            />
          </div>
        </div>
      )}
    </div>
  );
}
