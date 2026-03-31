import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '@/constants/api';

interface KPI {
  label: string;
  value: string | number;
  change: string;
  positive: boolean;
  icon: string;
}

const QUICK_LINKS = [
  { label: 'CRM-Cockpit', icon: '👥', path: '/admin/members', color: 'bg-blue-600' },
  { label: 'Finanzen', icon: '💰', path: '/admin/finanzen', color: 'bg-green-600' },
  { label: 'Rechnungen', icon: '📄', path: '/admin/rechnungen', color: 'bg-yellow-600' },
  { label: 'Veranstaltungen', icon: '📅', path: '/admin/events', color: 'bg-purple-600' },
  { label: 'Newsletter', icon: '📧', path: '/admin/newsletter', color: 'bg-teal-600' },
  { label: 'Blog & Forum', icon: '📰', path: '/admin/community', color: 'bg-orange-600' },
  { label: 'DSGVO', icon: '🔒', path: '/admin/dsgvo', color: 'bg-red-600' },
  { label: 'Berichte', icon: '📊', path: '/admin/reports', color: 'bg-indigo-600' },
  { label: 'OpenClaw', icon: '🤖', path: '/admin/openclaw', color: 'bg-slate-700' },
  { label: 'Einstellungen', icon: '⚙️', path: '/admin/settings', color: 'bg-gray-600' },
];

const API_BASE = API_BASE_URL;

function centsToEur(cents: number): string {
  return `€ ${(cents / 100).toLocaleString('de-AT', { minimumFractionDigits: 0 })}`;
}

export default function AdminDashboard() {
  const [greeting, setGreeting] = useState('Guten Tag');
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Guten Morgen');
    else if (h < 18) setGreeting('Guten Tag');
    else setGreeting('Guten Abend');

    loadKpis();
  }, []);

  async function loadKpis() {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('moe_auth_token');
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/kpis/overview`, { headers });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      setKpis([
        { label: 'Aktive Mitglieder', value: data.members_total || 0, change: `${data.net_new_members_month >= 0 ? '+' : ''}${data.net_new_members_month} diesen Monat`, positive: data.net_new_members_month >= 0, icon: '👥' },
        { label: 'Einnahmen vs. Ausgaben', value: centsToEur(data.income_vs_expense_current_month_cents || 0), change: 'Aktueller Monat', positive: (data.income_vs_expense_current_month_cents || 0) >= 0, icon: '💰' },
        { label: 'Spenden (YTD)', value: centsToEur(data.donations_ytd_cents || 0), change: `seit ${data.since || 'Jahresanfang'}`, positive: true, icon: '🎁' },
        { label: 'Neue Mitglieder', value: data.net_new_members_month || 0, change: 'diesen Monat', positive: (data.net_new_members_month || 0) >= 0, icon: '✨' },
      ]);
      setApiError(false);
    } catch {
      setApiError(true);
      setKpis([
        { label: 'Aktive Mitglieder', value: '—', change: 'API nicht verbunden', positive: false, icon: '👥' },
        { label: 'Einnahmen', value: '—', change: 'API nicht verbunden', positive: false, icon: '💰' },
        { label: 'Spenden (YTD)', value: '—', change: 'API nicht verbunden', positive: false, icon: '🎁' },
        { label: 'Neue Mitglieder', value: '—', change: 'API nicht verbunden', positive: false, icon: '✨' },
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {greeting}, Admin
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Menschlichkeit Österreich · Vereinsverwaltung · {new Date().toLocaleDateString('de-AT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {apiError && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">Hinweis:</span>
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              Backend-API nicht erreichbar. KPIs werden angezeigt, sobald die API-Verbindung steht.
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
              <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{kpi.icon}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${kpi.positive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                  {kpi.positive ? '↑' : '↓'}
                </span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{kpi.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{kpi.label}</div>
              <div className={`text-xs mt-1 font-medium ${kpi.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {kpi.change}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schnellzugriff</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_LINKS.map((link, i) => (
              <Link key={i} to={link.path}
                className={`${link.color} text-white rounded-lg p-3 flex flex-col items-center gap-1 hover:opacity-90 transition-opacity text-center`}>
                <span className="text-xl">{link.icon}</span>
                <span className="text-xs font-medium leading-tight">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Offene Aufgaben</h2>
          <div className="space-y-2">
            {[
              { text: 'Mitgliedsanträge prüfen', priority: 'hoch', icon: '👥', path: '/admin/queue' },
              { text: 'Überfällige Rechnungen', priority: 'hoch', icon: '📄', path: '/admin/rechnungen' },
              { text: 'Berichte erstellen', priority: 'mittel', icon: '📊', path: '/admin/reports' },
              { text: 'Newsletter versenden', priority: 'mittel', icon: '📧', path: '/admin/newsletter' },
              { text: 'DSGVO-Audit', priority: 'niedrig', icon: '🔒', path: '/admin/dsgvo' },
            ].map((task, i) => (
              <Link key={i} to={task.path}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <span>{task.icon}</span>
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{task.text}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  task.priority === 'hoch' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                  task.priority === 'mittel' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>{task.priority}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
