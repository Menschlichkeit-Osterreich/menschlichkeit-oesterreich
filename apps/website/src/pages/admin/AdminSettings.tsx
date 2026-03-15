import React, { useState } from 'react';

type Tab = 'verein' | 'integrationen' | 'email' | 'sicherheit' | 'system';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('verein');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'verein', label: 'Vereinsdaten', icon: '🏛️' },
    { id: 'integrationen', label: 'Integrationen', icon: '🔗' },
    { id: 'email', label: 'E-Mail', icon: '📧' },
    { id: 'sicherheit', label: 'Sicherheit', icon: '🔒' },
    { id: 'system', label: 'System', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚙️ Einstellungen</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Vereins- und Systemkonfiguration</p>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl text-green-800 dark:text-green-300 text-sm font-medium">
          ✅ Einstellungen erfolgreich gespeichert
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-48 flex-shrink-0">
          <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Inhalt */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">

          {/* Vereinsdaten */}
          {activeTab === 'verein' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vereinsdaten</h2>
              {[
                { label: 'Vereinsname', value: 'Menschlichkeit Österreich', type: 'text' },
                { label: 'ZVR-Zahl', value: '1182213083', type: 'text' },
                { label: 'Gründungsjahr', value: '2025', type: 'number' },
                { label: 'Vereinssitz', value: 'St. Pölten', type: 'text' },
                { label: 'Straße & Hausnummer', value: 'Pottenbrunner Hauptstraße 108/Top 1', type: 'text' },
                { label: 'PLZ', value: '3140', type: 'text' },
                { label: 'Kontakt-E-Mail', value: 'kontakt@menschlichkeit-oesterreich.at', type: 'email' },
                { label: 'Telefon', value: '+43 1 234 5678', type: 'tel' },
                { label: 'Website', value: 'https://menschlichkeit-oesterreich.at', type: 'url' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                  <input type={f.type} defaultValue={f.value}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vereinszweck (Kurzfassung)</label>
                <textarea rows={3} defaultValue="Förderung von Demokratie, Menschlichkeit und gesellschaftlichem Zusammenhalt in Österreich."
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>
            </div>
          )}

          {/* Integrationen */}
          {activeTab === 'integrationen' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Integrationen</h2>
              {[
                { name: 'CiviCRM', desc: 'Mitgliederverwaltung und CRM', status: 'connected', icon: '🗃️' },
                { name: 'n8n Automation', desc: 'Workflow-Automatisierung', status: 'connected', icon: '⚡' },
                { name: 'Stripe', desc: 'Online-Zahlungen und Spenden', status: 'connected', icon: '💳' },
                { name: 'Mailchimp / Brevo', desc: 'Newsletter-Versand', status: 'disconnected', icon: '📧' },
                { name: 'OpenClaw', desc: 'KI-Assistent und Automatisierung', status: 'disconnected', icon: '🤖' },
                { name: 'Google Analytics', desc: 'Website-Statistiken', status: 'connected', icon: '📊' },
                { name: 'Plesk', desc: 'Hosting und Deployment', status: 'connected', icon: '🖥️' },
              ].map(int => (
                <div key={int.name} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{int.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{int.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{int.desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      int.status === 'connected'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {int.status === 'connected' ? '✓ Verbunden' : '○ Nicht verbunden'}
                    </span>
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      {int.status === 'connected' ? 'Konfigurieren' : 'Verbinden'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* E-Mail */}
          {activeTab === 'email' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">E-Mail-Konfiguration</h2>
              {[
                { label: 'SMTP-Host', value: 'smtp.menschlichkeit-oesterreich.at', type: 'text' },
                { label: 'SMTP-Port', value: '587', type: 'number' },
                { label: 'SMTP-Benutzer', value: 'kontakt@menschlichkeit-oesterreich.at', type: 'email' },
                { label: 'Absender-Name', value: 'Menschlichkeit Österreich', type: 'text' },
                { label: 'Antwort-Adresse', value: 'kontakt@menschlichkeit-oesterreich.at', type: 'email' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                  <input type={f.type} defaultValue={f.value}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMTP-Passwort</label>
                <input type="password" placeholder="••••••••••••"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                📧 Test-E-Mail senden
              </button>
            </div>
          )}

          {/* Sicherheit */}
          {activeTab === 'sicherheit' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sicherheitseinstellungen</h2>
              {[
                { label: 'Zwei-Faktor-Authentifizierung', desc: 'Für alle Admin-Konten', enabled: true },
                { label: 'Session-Timeout', desc: 'Nach 30 Minuten Inaktivität', enabled: true },
                { label: 'IP-Whitelist für Admin', desc: 'Nur bestimmte IPs erlauben', enabled: false },
                { label: 'Audit-Log', desc: 'Alle Admin-Aktionen protokollieren', enabled: true },
                { label: 'Brute-Force-Schutz', desc: 'Nach 5 Fehlversuchen sperren', enabled: true },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{s.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{s.desc}</div>
                  </div>
                  <div className={`w-10 h-6 rounded-full cursor-pointer transition-colors ${s.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${s.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* System */}
          {activeTab === 'system' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System-Informationen</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Version', value: 'v3.0.0' },
                  { label: 'Umgebung', value: 'Production' },
                  { label: 'Datenbank', value: 'PostgreSQL 15' },
                  { label: 'API-Version', value: 'v2' },
                  { label: 'Letztes Backup', value: '2026-03-02 03:00' },
                  { label: 'Speicherplatz', value: '2.4 GB / 50 GB' },
                ].map(s => (
                  <div key={s.label} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  🔄 Cache leeren
                </button>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                  💾 Backup erstellen
                </button>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                  📋 System-Log anzeigen
                </button>
              </div>
            </div>
          )}

          {/* Speichern-Button */}
          <div className="mt-8 pt-5 border-t border-gray-100 dark:border-gray-700">
            <button onClick={handleSave}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm">
              💾 Einstellungen speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
