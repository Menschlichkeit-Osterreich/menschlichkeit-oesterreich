import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface KPI {
  label: string;
  value: string | number;
  change: string;
  positive: boolean;
  icon: string;
  color: string;
}

interface Activity {
  id: number;
  type: 'member' | 'payment' | 'event' | 'donation';
  text: string;
  time: string;
  icon: string;
}

const MOCK_KPIS: KPI[] = [
  { label: 'Aktive Mitglieder', value: 247, change: '+12 diesen Monat', positive: true, icon: '👥', color: 'blue' },
  { label: 'Monatliche Einnahmen', value: '€ 4.820', change: '+8% vs. Vormonat', positive: true, icon: '💰', color: 'green' },
  { label: 'Offene Rechnungen', value: 14, change: '3 überfällig', positive: false, icon: '📄', color: 'yellow' },
  { label: 'Spenden (YTD)', value: '€ 18.340', change: '+23% vs. Vorjahr', positive: true, icon: '🎁', color: 'purple' },
  { label: 'Neue Mitglieder', value: 12, change: 'letzter Monat', positive: true, icon: '✨', color: 'teal' },
  { label: 'Veranstaltungen', value: 3, change: 'nächste 30 Tage', positive: true, icon: '📅', color: 'orange' },
];

const MOCK_ACTIVITIES: Activity[] = [
  { id: 1, type: 'member', text: 'Neues Mitglied: Maria Müller', time: 'vor 5 Min.', icon: '👤' },
  { id: 2, type: 'payment', text: 'Zahlung erhalten: € 36 (Jahresbeitrag)', time: 'vor 12 Min.', icon: '💳' },
  { id: 3, type: 'donation', text: 'Spende: € 100 von anonymem Spender', time: 'vor 1 Std.', icon: '🎁' },
  { id: 4, type: 'member', text: 'Mitglied gekündigt: Hans Huber', time: 'vor 2 Std.', icon: '👤' },
  { id: 5, type: 'event', text: 'Anmeldung: Demokratie-Workshop (15 Teiln.)', time: 'vor 3 Std.', icon: '📅' },
  { id: 6, type: 'payment', text: 'Mahnung versendet: 3 Mitglieder', time: 'vor 4 Std.', icon: '📧' },
];

const QUICK_LINKS = [
  { label: 'Mitglieder verwalten', icon: '👥', path: '/admin/members', color: 'bg-blue-600' },
  { label: 'Finanzen', icon: '💰', path: '/admin/finanzen', color: 'bg-green-600' },
  { label: 'Rechnungen', icon: '📄', path: '/admin/rechnungen', color: 'bg-yellow-600' },
  { label: 'Veranstaltungen', icon: '📅', path: '/admin/events', color: 'bg-purple-600' },
  { label: 'Newsletter', icon: '📧', path: '/admin/newsletter', color: 'bg-teal-600' },
  { label: 'DSGVO', icon: '🔒', path: '/admin/dsgvo', color: 'bg-red-600' },
  { label: 'Berichte', icon: '📊', path: '/admin/reports', color: 'bg-indigo-600' },
  { label: 'Einstellungen', icon: '⚙️', path: '/admin/settings', color: 'bg-gray-600' },
];

export default function AdminDashboard() {
  const [greeting, setGreeting] = useState('Guten Tag');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Guten Morgen');
    else if (h < 18) setGreeting('Guten Tag');
    else setGreeting('Guten Abend');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {greeting}, Admin 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Menschlichkeit Österreich · Vereinsverwaltung · {new Date().toLocaleDateString('de-AT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI-Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {MOCK_KPIS.map((kpi, i) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Schnellzugriff */}
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

        {/* Aktivitäten */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Letzte Aktivitäten</h2>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">Live</span>
          </div>
          <div className="space-y-3">
            {MOCK_ACTIVITIES.map(act => (
              <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <span className="text-xl flex-shrink-0">{act.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{act.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mitglieder-Status-Chart (vereinfacht) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mitglieder-Status</h2>
          <div className="space-y-3">
            {[
              { label: 'Aktiv', count: 198, total: 247, color: 'bg-green-500' },
              { label: 'Ausstehend', count: 28, total: 247, color: 'bg-yellow-500' },
              { label: 'Abgelaufen', count: 15, total: 247, color: 'bg-red-500' },
              { label: 'Ehrenmitglieder', count: 6, total: 247, color: 'bg-purple-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full transition-all`}
                       style={{ width: `${(item.count / item.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aufgaben */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Offene Aufgaben</h2>
          <div className="space-y-2">
            {[
              { text: '3 Mitgliedsanträge prüfen', priority: 'hoch', icon: '👥' },
              { text: '5 Rechnungen überfällig', priority: 'hoch', icon: '📄' },
              { text: 'Jahresbericht erstellen', priority: 'mittel', icon: '📊' },
              { text: 'Newsletter für März versenden', priority: 'mittel', icon: '📧' },
              { text: 'DSGVO-Audit durchführen', priority: 'niedrig', icon: '🔒' },
            ].map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <span>{task.icon}</span>
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{task.text}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  task.priority === 'hoch' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                  task.priority === 'mittel' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>{task.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
