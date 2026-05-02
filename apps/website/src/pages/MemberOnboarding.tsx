import React, { useState } from 'react';

interface Step {
  id: number;
  title: string;
  icon: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 1, title: 'Willkommen!', icon: '🎉', description: 'Schön, dass du dabei bist!' },
  { id: 2, title: 'Dein Profil', icon: '👤', description: 'Erzähl uns von dir' },
  { id: 3, title: 'Interessen', icon: '💡', description: 'Was interessiert dich?' },
  { id: 4, title: 'Benachrichtigungen', icon: '🔔', description: 'Bleib informiert' },
  { id: 5, title: "Los geht's!", icon: '🚀', description: 'Alles bereit' },
];

const INTERESTS = [
  '🗳️ Demokratie & Wahlen',
  '🌍 Umwelt & Klima',
  '📚 Bildung & Jugend',
  '🤝 Soziales Engagement',
  '🏛️ Kommunalpolitik',
  '🌐 Digitalisierung',
  '🎭 Kultur & Kunst',
  '⚖️ Menschenrechte',
  '🏘️ Stadtentwicklung',
  '🌱 Nachhaltigkeit',
  '💼 Wirtschaft & Arbeit',
  '🏥 Gesundheit',
];

export default function MemberOnboarding() {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [notifications, setNotifications] = useState({
    newsletter: true,
    events: true,
    forum: false,
    game: true,
  });

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress-Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map(s => (
              <div
                key={s.id}
                className={`flex flex-col items-center ${step >= s.id ? 'opacity-100' : 'opacity-40'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step > s.id
                      ? 'bg-green-500 text-white'
                      : step === s.id
                        ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                  {s.title}
                </span>
              </div>
            ))}
          </div>
          <div
            className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2"
            role="progressbar"
            aria-label="Fortschritt im Onboarding"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Karte */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Schritt 1: Willkommen */}
          {step === 1 && (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Herzlich Willkommen!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Du bist jetzt offiziell Mitglied bei <strong>Menschlichkeit Österreich</strong>.
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Dieser kurze Einrichtungsassistent hilft dir, das Beste aus deiner Mitgliedschaft
                herauszuholen. Es dauert nur 2 Minuten.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: '🎮', label: 'Demokratiespiel', desc: '100 Level' },
                  { icon: '📅', label: 'Events', desc: 'Österreichweit' },
                  { icon: '🏆', label: 'Badges', desc: '30+ Auszeichnungen' },
                ].map(f => (
                  <div
                    key={f.label}
                    className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center"
                  >
                    <div className="text-2xl mb-1">{f.icon}</div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {f.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schritt 2: Profil */}
          {step === 2 && (
            <div className="p-8">
              <div className="text-4xl mb-3">👤</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Dein Profil</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Diese Informationen helfen uns, dich besser zu unterstützen.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="member-onboarding-first-name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Vorname
                    </label>
                    <input
                      id="member-onboarding-first-name"
                      type="text"
                      placeholder="Maria"
                      className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="member-onboarding-last-name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Nachname
                    </label>
                    <input
                      id="member-onboarding-last-name"
                      type="text"
                      placeholder="Österreich"
                      className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="member-onboarding-region"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Bundesland
                  </label>
                  <select
                    id="member-onboarding-region"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {[
                      'Wien',
                      'Niederösterreich',
                      'Oberösterreich',
                      'Steiermark',
                      'Tirol',
                      'Salzburg',
                      'Kärnten',
                      'Vorarlberg',
                      'Burgenland',
                    ].map(b => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="member-onboarding-bio"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Kurzbiografie (optional)
                  </label>
                  <textarea
                    id="member-onboarding-bio"
                    rows={3}
                    placeholder="Erzähl uns kurz, warum du Mitglied geworden bist..."
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Schritt 3: Interessen */}
          {step === 3 && (
            <div className="p-8">
              <div className="text-4xl mb-3">💡</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Deine Interessen
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Wähle mindestens 3 Themen, die dich interessieren.
              </p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    aria-pressed={selectedInterests.includes(interest)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      selectedInterests.includes(interest)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              {selectedInterests.length > 0 && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-4" aria-live="polite">
                  {selectedInterests.length} Interesse(n) ausgewählt
                </p>
              )}
            </div>
          )}

          {/* Schritt 4: Benachrichtigungen */}
          {step === 4 && (
            <div className="p-8">
              <div className="text-4xl mb-3">🔔</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Benachrichtigungen
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Wähle, worüber du informiert werden möchtest.
              </p>
              <div className="space-y-4">
                {[
                  {
                    key: 'newsletter' as const,
                    label: 'Monatlicher Newsletter',
                    desc: 'Neuigkeiten und Berichte aus dem Verein',
                    icon: '📧',
                  },
                  {
                    key: 'events' as const,
                    label: 'Event-Einladungen',
                    desc: 'Einladungen zu Veranstaltungen und Workshops',
                    icon: '📅',
                  },
                  {
                    key: 'forum' as const,
                    label: 'Forum-Antworten',
                    desc: 'Wenn jemand auf deine Beiträge antwortet',
                    icon: '💬',
                  },
                  {
                    key: 'game' as const,
                    label: 'Spielfortschritt',
                    desc: 'Neue Level, Badges und Achievements',
                    icon: '🎮',
                  },
                ].map(n => (
                  <div
                    key={n.key}
                    className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{n.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {n.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{n.desc}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                      role="switch"
                      aria-checked={notifications[n.key]}
                      aria-label={`${n.label} ${notifications[n.key] ? 'aktiviert' : 'deaktiviert'}`}
                      className={`relative w-11 h-6 rounded-full transition-colors ${notifications[n.key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[n.key] ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schritt 5: Fertig */}
          {step === 5 && (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Alles bereit!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Dein Profil ist eingerichtet. Du hast <strong>100 Bonus-XP</strong> für das
                Abschließen des Onboardings erhalten!
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-6">
                <div className="text-2xl mb-1">🏆</div>
                <div className="font-semibold text-yellow-800 dark:text-yellow-300">
                  Badge "Erster Schritt" freigeschaltet!
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">+100 XP</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/spiel"
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-sm"
                >
                  🎮 Spiel starten
                </a>
                <a
                  href="/member"
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors text-sm"
                >
                  👤 Zum Dashboard
                </a>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="px-8 pb-8 flex gap-3">
            {step > 1 && step < 5 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
              >
                ← Zurück
              </button>
            )}
            {step < 5 && (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={step === 3 && selectedInterests.length < 3}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors text-sm"
              >
                {step === 1 ? 'Einrichtung starten →' : step === 4 ? 'Abschließen ✓' : 'Weiter →'}
              </button>
            )}
          </div>
        </div>

        {/* Skip-Link */}
        {step < 5 && (
          <div className="text-center mt-4">
            <a
              href="/member"
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
            >
              Überspringen und direkt zum Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
