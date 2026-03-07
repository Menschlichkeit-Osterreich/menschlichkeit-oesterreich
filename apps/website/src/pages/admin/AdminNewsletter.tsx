import React, { useState } from 'react';

interface Campaign {
  id: number;
  subject: string;
  segment: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipients: number;
  openRate?: number;
  clickRate?: number;
  sentAt?: string;
  scheduledAt?: string;
}

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 1, subject: 'März-Newsletter: Demokratie im Frühling', segment: 'Alle Mitglieder', status: 'draft', recipients: 247 },
  { id: 2, subject: 'Einladung: Generalversammlung 2026', segment: 'Aktive Mitglieder', status: 'scheduled', recipients: 198, scheduledAt: '2026-03-10T09:00' },
  { id: 3, subject: 'Februar-Newsletter: Rückblick & Ausblick', segment: 'Alle Mitglieder', status: 'sent', recipients: 241, openRate: 42, clickRate: 18, sentAt: '2026-02-01' },
  { id: 4, subject: 'Willkommen, neue Mitglieder!', segment: 'Neue Mitglieder', status: 'sent', recipients: 12, openRate: 78, clickRate: 45, sentAt: '2026-02-15' },
];

const SEGMENTS = ['Alle Mitglieder', 'Aktive Mitglieder', 'Neue Mitglieder', 'Spender', 'Ehrenamtliche', 'Vorstand'];

export default function AdminNewsletter() {
  const [showCompose, setShowCompose] = useState(false);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'segments' | 'stats'>('campaigns');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📧 Newsletter</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Kampagnen erstellen, planen und auswerten</p>
        </div>
        <button onClick={() => setShowCompose(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Neue Kampagne
        </button>
      </div>

      {/* Stats-Karten */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Abonnenten', value: '247', icon: '👥', color: 'text-blue-600' },
          { label: 'Ø Öffnungsrate', value: '42%', icon: '📬', color: 'text-green-600' },
          { label: 'Ø Klickrate', value: '18%', icon: '🖱️', color: 'text-purple-600' },
          { label: 'Kampagnen (YTD)', value: '8', icon: '📊', color: 'text-orange-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.icon} {s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {(['campaigns', 'segments', 'stats'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            {tab === 'campaigns' ? 'Kampagnen' : tab === 'segments' ? 'Segmente' : 'Statistiken'}
          </button>
        ))}
      </div>

      {/* Kampagnen-Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-3">
          {MOCK_CAMPAIGNS.map(c => (
            <div key={c.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.status === 'sent' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      c.status === 'scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {c.status === 'sent' ? '✓ Versendet' : c.status === 'scheduled' ? '⏰ Geplant' : '✏️ Entwurf'}
                    </span>
                    <span className="text-xs text-gray-400">{c.segment}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">{c.subject}</h3>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>👥 {c.recipients} Empfänger</span>
                    {c.openRate && <span>📬 {c.openRate}% Öffnungen</span>}
                    {c.clickRate && <span>🖱️ {c.clickRate}% Klicks</span>}
                    {c.sentAt && <span>📅 {new Date(c.sentAt).toLocaleDateString('de-AT')}</span>}
                    {c.scheduledAt && <span>⏰ {new Date(c.scheduledAt).toLocaleString('de-AT')}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {c.status === 'draft' && (
                    <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      Bearbeiten
                    </button>
                  )}
                  {c.status === 'sent' && (
                    <button className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                      Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Segmente-Tab */}
      {activeTab === 'segments' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {SEGMENTS.map((seg, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{seg}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {[247, 198, 12, 45, 23, 8][i]} Kontakte
              </p>
              <button className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Kampagne erstellen →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Statistiken-Tab */}
      {activeTab === 'stats' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Jahresübersicht 2026</h3>
          <div className="space-y-4">
            {['Januar', 'Februar', 'März'].map((month, i) => (
              <div key={month}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{month}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{[38, 42, 0][i]}% Öffnungsrate</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${[38, 42, 0][i]}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">Branchendurchschnitt NGO: 28% · Ihr Durchschnitt: 42% 🎉</p>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Neue Kampagne</h2>
              <button onClick={() => setShowCompose(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Betreff</label>
                <input type="text" placeholder="Newsletter-Betreff" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Segment</label>
                <select className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">
                  {SEGMENTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inhalt</label>
                <textarea rows={8} placeholder="Newsletter-Inhalt (HTML oder Markdown)..." className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Geplanter Versand (optional)</label>
                <input type="datetime-local" className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCompose(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                Als Entwurf speichern
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                Planen / Senden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
