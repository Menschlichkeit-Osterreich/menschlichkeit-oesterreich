import React, { useState } from 'react';

// ── Typen ──────────────────────────────────────────────────────────────────────
interface Badge {
  id: string;
  title: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
  xp: number;
}

interface Activity {
  id: number;
  type: 'event' | 'game' | 'donation' | 'forum' | 'badge';
  title: string;
  date: string;
  xp?: number;
  icon: string;
}

interface MemberProfile {
  name: string;
  email: string;
  memberSince: string;
  memberType: string;
  xp: number;
  level: number;
  nextLevelXp: number;
  avatar: string;
  location: string;
  bio: string;
}

// ── Mock-Daten ─────────────────────────────────────────────────────────────────
const PROFILE: MemberProfile = {
  name: 'Maria Österreich',
  email: 'maria@example.at',
  memberSince: '2024-03-15',
  memberType: 'Ordentliches Mitglied',
  xp: 2340,
  level: 7,
  nextLevelXp: 3000,
  avatar: '👩‍💼',
  location: 'Wien',
  bio: 'Engagiert für Demokratie und gesellschaftlichen Zusammenhalt.',
};

const BADGES: Badge[] = [
  { id: 'first-step', title: 'Erster Schritt', icon: '🌱', description: 'Mitglied geworden', earned: true, earnedAt: '2024-03-15', xp: 100 },
  { id: 'game-starter', title: 'Spieler', icon: '🎮', description: 'Erstes Level im Demokratiespiel abgeschlossen', earned: true, earnedAt: '2024-03-20', xp: 150 },
  { id: 'event-goer', title: 'Teilnehmer', icon: '📅', description: 'An einem Event teilgenommen', earned: true, earnedAt: '2024-04-10', xp: 200 },
  { id: 'donor', title: 'Unterstützer', icon: '💙', description: 'Erste Spende getätigt', earned: true, earnedAt: '2024-05-01', xp: 300 },
  { id: 'game-master', title: 'Spielmeister', icon: '🏆', description: '10 Level abgeschlossen', earned: true, earnedAt: '2024-06-15', xp: 500 },
  { id: 'ambassador', title: 'Botschafter', icon: '🌟', description: '3 neue Mitglieder geworben', earned: false, xp: 750 },
  { id: 'veteran', title: 'Veteran', icon: '🎖️', description: '1 Jahr Mitglied', earned: false, xp: 1000 },
  { id: 'champion', title: 'Champion', icon: '👑', description: 'Level 10 im Spiel erreicht', earned: false, xp: 1500 },
];

const ACTIVITIES: Activity[] = [
  { id: 1, type: 'game', title: 'Level 12 "Klimaschutz" abgeschlossen', date: '2026-03-01', xp: 120, icon: '🎮' },
  { id: 2, type: 'event', title: 'Demokratie-Workshop Wien besucht', date: '2026-02-28', xp: 200, icon: '📅' },
  { id: 3, type: 'badge', title: 'Badge "Spielmeister" erhalten', date: '2026-02-25', xp: 500, icon: '🏆' },
  { id: 4, type: 'donation', title: 'Spende € 25,- getätigt', date: '2026-02-20', xp: 100, icon: '💙' },
  { id: 5, type: 'game', title: 'Level 11 "Stadtplanung" abgeschlossen', date: '2026-02-18', xp: 110, icon: '🎮' },
  { id: 6, type: 'forum', title: 'Diskussion "Wahlrecht" kommentiert', date: '2026-02-15', xp: 30, icon: '💬' },
];

const UPCOMING_EVENTS = [
  { title: 'Mitgliederversammlung 2026', date: '2026-03-15', location: 'Wien, Rathaus', type: 'Pflichtveranstaltung' },
  { title: 'Demokratie-Workshop', date: '2026-03-22', location: 'Graz, Online', type: 'Workshop' },
  { title: 'Sommerfest Menschlichkeit', date: '2026-06-21', location: 'Wien, Stadtpark', type: 'Social' },
];

// ── Hauptkomponente ────────────────────────────────────────────────────────────
export default function MemberDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'badges' | 'activities' | 'events'>('overview');
  const [editProfile, setEditProfile] = useState(false);

  const xpPercent = Math.round((PROFILE.xp / PROFILE.nextLevelXp) * 100);
  const earnedBadges = BADGES.filter(b => b.earned).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 md:p-8">

      {/* Header-Karte */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
            {PROFILE.avatar}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Willkommen, {PROFILE.name.split(' ')[0]}! 👋</h1>
            <p className="text-blue-100 text-sm">{PROFILE.memberType} · Mitglied seit {new Date(PROFILE.memberSince).toLocaleDateString('de-AT')}</p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">Level {PROFILE.level} · {PROFILE.xp.toLocaleString()} XP</span>
                <span className="text-blue-200">{PROFILE.nextLevelXp.toLocaleString()} XP für Level {PROFILE.level + 1}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5">
                <div className="bg-white h-2.5 rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{earnedBadges}</div>
            <div className="text-blue-200 text-xs">Badges</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
        {([
          { id: 'overview', label: 'Übersicht', icon: '🏠' },
          { id: 'profile', label: 'Profil', icon: '👤' },
          { id: 'badges', label: 'Badges', icon: '🏆' },
          { id: 'activities', label: 'Aktivitäten', icon: '📊' },
          { id: 'events', label: 'Events', icon: '📅' },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}>
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Übersicht ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI-Karten */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Level', value: PROFILE.level, icon: '⭐', color: 'text-yellow-600' },
              { label: 'Gesamt-XP', value: PROFILE.xp.toLocaleString(), icon: '✨', color: 'text-purple-600' },
              { label: 'Badges', value: `${earnedBadges}/${BADGES.length}`, icon: '🏆', color: 'text-blue-600' },
              { label: 'Events besucht', value: 3, icon: '📅', color: 'text-green-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Schnellzugriff */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="/spiel" className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-5 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🎮</div>
              <div className="font-semibold">Demokratiespiel</div>
              <div className="text-blue-200 text-xs mt-1">Level 13 wartet auf dich</div>
            </a>
            <a href="/admin/events" className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl p-5 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">📅</div>
              <div className="font-semibold">Nächstes Event</div>
              <div className="text-green-200 text-xs mt-1">Mitgliederversammlung · 15. März</div>
            </a>
            <a href="/bildung" className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl p-5 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">📚</div>
              <div className="font-semibold">Bildungsmaterialien</div>
              <div className="text-purple-200 text-xs mt-1">Neue Ressourcen verfügbar</div>
            </a>
          </div>

          {/* Letzte Aktivitäten */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Letzte Aktivitäten</h3>
            <div className="space-y-3">
              {ACTIVITIES.slice(0, 4).map(a => (
                <div key={a.id} className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">{a.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(a.date).toLocaleDateString('de-AT')}</div>
                  </div>
                  {a.xp && <span className="text-xs font-medium text-green-600 dark:text-green-400">+{a.xp} XP</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Profil ── */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mein Profil</h2>
            <button onClick={() => setEditProfile(!editProfile)}
              className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              {editProfile ? '✓ Speichern' : '✏️ Bearbeiten'}
            </button>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Vollständiger Name', value: PROFILE.name, type: 'text' },
              { label: 'E-Mail-Adresse', value: PROFILE.email, type: 'email' },
              { label: 'Wohnort', value: PROFILE.location, type: 'text' },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                <input type={f.type} defaultValue={f.value} disabled={!editProfile}
                  className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors ${
                    editProfile
                      ? 'border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none'
                      : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                  }`} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kurzbiografie</label>
              <textarea rows={3} defaultValue={PROFILE.bio} disabled={!editProfile}
                className={`w-full border rounded-lg px-3 py-2 text-sm resize-none transition-colors ${
                  editProfile
                    ? 'border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none'
                    : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                }`} />
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Mitgliedschaft</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Mitgliedstyp', value: PROFILE.memberType },
                { label: 'Mitglied seit', value: new Date(PROFILE.memberSince).toLocaleDateString('de-AT') },
                { label: 'Mitgliedsnummer', value: 'MÖ-2024-0042' },
                { label: 'Beitrag', value: '€ 36,– / Jahr' },
              ].map(i => (
                <div key={i.label} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{i.label}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{i.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Badges ── */}
      {activeTab === 'badges' && (
        <div>
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Du hast <strong>{earnedBadges} von {BADGES.length} Badges</strong> verdient. Sammle XP durch Spielen, Events und Engagement!
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {BADGES.map(badge => (
              <div key={badge.id} className={`rounded-xl p-4 text-center border transition-all ${
                badge.earned
                  ? 'bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-700 shadow-sm hover:shadow-md'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-60'
              }`}>
                <div className={`text-3xl mb-2 ${!badge.earned && 'grayscale filter'}`}>{badge.icon}</div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">{badge.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{badge.description}</div>
                <div className={`text-xs font-medium mt-2 ${badge.earned ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}`}>
                  {badge.earned ? `✓ +${badge.xp} XP` : `🔒 ${badge.xp} XP`}
                </div>
                {badge.earned && badge.earnedAt && (
                  <div className="text-xs text-gray-400 mt-0.5">{new Date(badge.earnedAt).toLocaleDateString('de-AT')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Aktivitäten ── */}
      {activeTab === 'activities' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Alle Aktivitäten</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {ACTIVITIES.map(a => (
              <div key={a.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <span className="text-2xl w-10 text-center">{a.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(a.date).toLocaleDateString('de-AT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                {a.xp && (
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                    +{a.xp} XP
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Events ── */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Kommende Events</h2>
          {UPCOMING_EVENTS.map((ev, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {new Date(ev.date).toLocaleDateString('de-AT', { month: 'short' }).toUpperCase()}
                </div>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {new Date(ev.date).getDate()}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">{ev.type}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{ev.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">📍 {ev.location}</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Anmelden
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
