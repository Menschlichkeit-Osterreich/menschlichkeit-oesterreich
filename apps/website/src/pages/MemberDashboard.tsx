import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../services/dashboard-api';

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

const FALLBACK_PROFILE: MemberProfile = {
  name: 'Mitglied',
  email: '',
  memberSince: '',
  memberType: 'Ordentliches Mitglied',
  xp: 0,
  level: 1,
  nextLevelXp: 500,
  avatar: '\uD83D\uDC64',
  location: '',
  bio: '',
};

const BADGES: Badge[] = [
  { id: 'first-step', title: 'Erster Schritt', icon: '\uD83C\uDF31', description: 'Mitglied geworden', earned: true, earnedAt: '2024-03-15', xp: 100 },
  { id: 'game-starter', title: 'Spieler', icon: '\uD83C\uDFAE', description: 'Erstes Level im Demokratiespiel abgeschlossen', earned: true, earnedAt: '2024-03-20', xp: 150 },
  { id: 'event-goer', title: 'Teilnehmer', icon: '\uD83D\uDCC5', description: 'An einem Event teilgenommen', earned: true, earnedAt: '2024-04-10', xp: 200 },
  { id: 'donor', title: 'Unterstützer', icon: '\uD83D\uDC99', description: 'Erste Spende getätigt', earned: false, xp: 300 },
  { id: 'game-master', title: 'Spielmeister', icon: '\uD83C\uDFC6', description: '10 Level abgeschlossen', earned: false, xp: 500 },
  { id: 'ambassador', title: 'Botschafter', icon: '\uD83C\uDF1F', description: '3 neue Mitglieder geworben', earned: false, xp: 750 },
  { id: 'veteran', title: 'Veteran', icon: '\uD83C\uDF96\uFE0F', description: '1 Jahr Mitglied', earned: false, xp: 1000 },
  { id: 'champion', title: 'Champion', icon: '\uD83D\uDC51', description: 'Level 10 im Spiel erreicht', earned: false, xp: 1500 },
];

const FALLBACK_ACTIVITIES: Activity[] = [
  { id: 1, type: 'event', title: 'Willkommen bei Menschlichkeit \u00D6sterreich', date: new Date().toISOString().split('T')[0], xp: 100, icon: '\uD83C\uDF1F' },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface KpiOverview {
  mitglieder_gesamt: number;
  neue_mitglieder_monat: number;
  einnahmen_jahr_cents: number;
  offene_rechnungen: number;
  [key: string]: unknown;
}

export default function MemberDashboard() {
  const [profile, setProfile] = useState<MemberProfile>(FALLBACK_PROFILE);
  const [activities, setActivities] = useState<Activity[]>(FALLBACK_ACTIVITIES);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'badges' | 'activities' | 'events'>('overview');
  const [editProfile, setEditProfile] = useState(false);
  const [kpis, setKpis] = useState<KpiOverview | null>(null);
  const [kpiError, setKpiError] = useState(false);

  // Lädt echte KPI-Daten aus der API (Issue #119 – API-Integration)
  useEffect(() => {
    const token = sessionStorage.getItem('moe_auth_token');
    fetch(`${API_BASE}/kpis/overview`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setKpis)
      .catch(() => setKpiError(true));
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [profileRes, eventsRes] = await Promise.allSettled([
        dashboardApi.getProfile(),
        dashboardApi.getEvents({ status: 'upcoming' }),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        const p = profileRes.value;
        setProfile({
          name: `${p.vorname || ''} ${p.nachname || ''}`.trim() || p.name || 'Mitglied',
          email: p.email || '',
          memberSince: p.joined_at || p.member_since || p.created_at || '',
          memberType: p.mitgliedschaft_typ || p.memberType || 'Ordentliches Mitglied',
          xp: p.xp || 0,
          level: p.level || 1,
          nextLevelXp: p.nextLevelXp || 500,
          avatar: p.avatar || '\uD83D\uDC64',
          location: p.location || p.ort || '',
          bio: p.bio || '',
        });
        if (p.activities) setActivities(p.activities);
      }

      if (eventsRes.status === 'fulfilled' && eventsRes.value?.data) {
        setUpcomingEvents(eventsRes.value.data.slice(0, 3).map((e: any) => ({
          title: e.title || e.titel || '',
          date: e.date || e.datum || '',
          location: e.location || e.ort || '',
          type: e.type || e.typ || 'Event',
        })));
      }
    } catch {
      // keep fallback data
    } finally {
      setLoading(false);
    }
  }

  const xpPercent = profile.nextLevelXp > 0 ? Math.round((profile.xp / profile.nextLevelXp) * 100) : 0;
  const earnedBadges = BADGES.filter(b => b.earned).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 md:p-8">

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
            {profile.avatar}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Willkommen, {profile.name.split(' ')[0]}!</h1>
            <p className="text-blue-100 text-sm">
              {profile.memberType}
              {profile.memberSince && ` \u00B7 Mitglied seit ${new Date(profile.memberSince).toLocaleDateString('de-AT')}`}
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">Level {profile.level} \u00B7 {profile.xp.toLocaleString()} XP</span>
                <span className="text-blue-200">{profile.nextLevelXp.toLocaleString()} XP f\u00FCr Level {profile.level + 1}</span>
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

      <div className="flex gap-1 mb-6 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
        {([
          { id: 'overview', label: '\u00DCbersicht', icon: '\uD83C\uDFE0' },
          { id: 'profile', label: 'Profil', icon: '\uD83D\uDC64' },
          { id: 'badges', label: 'Badges', icon: '\uD83C\uDFC6' },
          { id: 'activities', label: 'Aktivit\u00E4ten', icon: '\uD83D\uDCCA' },
          { id: 'events', label: 'Events', icon: '\uD83D\uDCC5' },
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

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Level', value: profile.level, icon: '\u2B50', color: 'text-yellow-600' },
              { label: 'Gesamt-XP', value: profile.xp.toLocaleString(), icon: '\u2728', color: 'text-purple-600' },
              { label: 'Badges', value: `${earnedBadges}/${BADGES.length}`, icon: '\uD83C\uDFC6', color: 'text-blue-600' },
              { label: 'Events besucht', value: activities.filter(a => a.type === 'event').length, icon: '\uD83D\uDCC5', color: 'text-green-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="/spiel" className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-5 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">{'\uD83C\uDFAE'}</div>
              <div className="font-semibold">Demokratiespiel</div>
              <div className="text-blue-200 text-xs mt-1">Jetzt spielen</div>
            </a>
            <a href="/veranstaltungen" className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl p-5 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">{'\uD83D\uDCC5'}</div>
              <div className="font-semibold">Veranstaltungen</div>
              <div className="text-green-200 text-xs mt-1">Termine ansehen</div>
            </a>
            <a href="/bildung" className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl p-5 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">{'\uD83D\uDCDA'}</div>
              <div className="font-semibold">Bildungsmaterialien</div>
              <div className="text-purple-200 text-xs mt-1">Neue Ressourcen verf\u00FCgbar</div>
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Letzte Aktivit\u00E4ten</h3>
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500">Noch keine Aktivit\u00E4ten vorhanden.</p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 4).map(a => (
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
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mein Profil</h2>
            <button onClick={() => setEditProfile(!editProfile)}
              className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              {editProfile ? '\u2713 Speichern' : 'Bearbeiten'}
            </button>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Vollst\u00E4ndiger Name', value: profile.name, type: 'text' },
              { label: 'E-Mail-Adresse', value: profile.email, type: 'email' },
              { label: 'Wohnort', value: profile.location, type: 'text' },
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
              <textarea rows={3} defaultValue={profile.bio} disabled={!editProfile}
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
                { label: 'Mitgliedstyp', value: profile.memberType },
                { label: 'Mitglied seit', value: profile.memberSince ? new Date(profile.memberSince).toLocaleDateString('de-AT') : '\u2014' },
                { label: 'Beitrag', value: profile.memberType.includes('Erm\u00E4') ? '\u20AC 18,\u2013 / Jahr' : '\u20AC 36,\u2013 / Jahr' },
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
                  {badge.earned ? `\u2713 +${badge.xp} XP` : `${badge.xp} XP`}
                </div>
                {badge.earned && badge.earnedAt && (
                  <div className="text-xs text-gray-400 mt-0.5">{new Date(badge.earnedAt).toLocaleDateString('de-AT')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Alle Aktivit\u00E4ten</h2>
          </div>
          {activities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Noch keine Aktivit\u00E4ten vorhanden.</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {activities.map(a => (
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
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Kommende Events</h2>
          {upcomingEvents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-3">{'\uD83D\uDCC5'}</div>
              <p className="text-gray-500">Keine anstehenden Events.</p>
              <a href="/veranstaltungen" className="text-sm text-blue-600 hover:underline mt-2 inline-block">Alle Veranstaltungen ansehen</a>
            </div>
          ) : (
            upcomingEvents.map((ev: any, i: number) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    {ev.date ? new Date(ev.date).toLocaleDateString('de-AT', { month: 'short' }).toUpperCase() : ''}
                  </div>
                  <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                    {ev.date ? new Date(ev.date).getDate() : ''}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">{ev.type}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{ev.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{ev.location}</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Anmelden
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
