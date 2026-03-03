import React, { useState } from 'react';

interface DeletionRequest {
  id: number;
  name: string;
  email: string;
  requestDate: string;
  deadline: string;
  status: 'pending' | 'processing' | 'completed';
  type: 'deletion' | 'export' | 'correction';
}

const MOCK_REQUESTS: DeletionRequest[] = [
  { id: 1, name: 'Max Mustermann', email: 'max@example.com', requestDate: '2026-02-20', deadline: '2026-03-22', status: 'pending', type: 'deletion' },
  { id: 2, name: 'Anna Schmidt', email: 'anna@example.com', requestDate: '2026-02-25', deadline: '2026-03-27', status: 'processing', type: 'export' },
  { id: 3, name: 'Peter Huber', email: 'peter@example.com', requestDate: '2026-01-15', deadline: '2026-02-14', status: 'completed', type: 'correction' },
];

const AUDIT_ITEMS = [
  { category: 'Datenspeicherung', status: 'ok', desc: 'Alle Daten werden verschlüsselt gespeichert (AES-256)' },
  { category: 'Datenweitergabe', status: 'ok', desc: 'Keine Weitergabe an Dritte ohne Einwilligung' },
  { category: 'Einwilligungen', status: 'warning', desc: '3 Mitglieder ohne aktuelle Einwilligung' },
  { category: 'Aufbewahrungsfristen', status: 'ok', desc: 'Automatische Löschung nach 7 Jahren konfiguriert' },
  { category: 'Datenschutzbeauftragter', status: 'ok', desc: 'DSB benannt und dokumentiert' },
  { category: 'Verarbeitungsverzeichnis', status: 'ok', desc: 'Letzte Aktualisierung: 2026-01-15' },
  { category: 'Datenpannen-Protokoll', status: 'ok', desc: 'Keine Datenpannen in den letzten 12 Monaten' },
  { category: 'Cookie-Consent', status: 'warning', desc: 'Banner-Update empfohlen (neue ePrivacy-Richtlinie)' },
];

export default function AdminDSGVO() {
  const [activeTab, setActiveTab] = useState<'requests' | 'audit' | 'consents'>('requests');

  const pendingCount = MOCK_REQUESTS.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔒 DSGVO & Datenschutz</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Datenschutz-Compliance nach DSGVO und österreichischem DSG</p>
      </div>

      {/* Status-Karten */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Offene Anfragen', value: pendingCount, icon: '📋', color: pendingCount > 0 ? 'text-red-600' : 'text-green-600' },
          { label: 'Compliance-Score', value: '92%', icon: '✅', color: 'text-green-600' },
          { label: 'Warnungen', value: 2, icon: '⚠️', color: 'text-yellow-600' },
          { label: 'Nächster Audit', value: '2026-06-01', icon: '📅', color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.icon} {s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {(['requests', 'audit', 'consents'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            {tab === 'requests' ? `Betroffenenanfragen ${pendingCount > 0 ? `(${pendingCount})` : ''}` :
             tab === 'audit' ? 'Compliance-Audit' : 'Einwilligungen'}
          </button>
        ))}
      </div>

      {/* Anfragen-Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {MOCK_REQUESTS.map(req => {
            const daysLeft = Math.ceil((new Date(req.deadline).getTime() - Date.now()) / 86400000);
            return (
              <div key={req.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        req.type === 'deletion' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        req.type === 'export' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {req.type === 'deletion' ? '🗑️ Löschantrag' : req.type === 'export' ? '📦 Datenexport' : '✏️ Korrektur'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        req.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        req.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {req.status === 'completed' ? '✓ Erledigt' : req.status === 'processing' ? '⏳ In Bearbeitung' : '📋 Offen'}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{req.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{req.email}</p>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Eingegangen: {new Date(req.requestDate).toLocaleDateString('de-AT')}</span>
                      <span className={daysLeft < 7 && req.status !== 'completed' ? 'text-red-600 font-medium' : ''}>
                        Frist: {new Date(req.deadline).toLocaleDateString('de-AT')}
                        {req.status !== 'completed' && ` (${daysLeft > 0 ? `${daysLeft} Tage` : 'Überfällig!'})`}
                      </span>
                    </div>
                  </div>
                  {req.status !== 'completed' && (
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Bearbeiten
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>ℹ️ Hinweis:</strong> Gemäß DSGVO Art. 12 müssen Betroffenenanfragen innerhalb von <strong>30 Tagen</strong> beantwortet werden. Bei Überschreitung drohen Bußgelder bis zu € 20 Mio.
            </p>
          </div>
        </div>
      )}

      {/* Audit-Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          {AUDIT_ITEMS.map((item, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4">
              <span className={`text-xl flex-shrink-0 ${item.status === 'ok' ? '✅' : '⚠️'}`}>
                {item.status === 'ok' ? '✅' : '⚠️'}
              </span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">{item.category}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
          <div className="mt-4">
            <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
              📊 Vollständigen DSGVO-Bericht exportieren (PDF)
            </button>
          </div>
        </div>
      )}

      {/* Einwilligungen-Tab */}
      {activeTab === 'consents' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Einwilligungs-Übersicht</h3>
          <div className="space-y-4">
            {[
              { type: 'Newsletter', consented: 198, total: 247, percent: 80 },
              { type: 'Foto-/Videoaufnahmen', consented: 156, total: 247, percent: 63 },
              { type: 'Datenweitergabe an Partner', consented: 89, total: 247, percent: 36 },
              { type: 'Marketing-Cookies', consented: 134, total: 247, percent: 54 },
            ].map(item => (
              <div key={item.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{item.type}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.consented}/{item.total} ({item.percent}%)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
            📧 Einwilligungs-Erinnerung versenden (3 Mitglieder ohne aktuelle Einwilligung)
          </button>
        </div>
      )}
    </div>
  );
}
