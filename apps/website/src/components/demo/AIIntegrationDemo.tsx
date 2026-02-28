// AI Integration Demo - Menschlichkeit Österreich
import React, { useState, useEffect } from 'react';

/**
 * Demo Component für ChatGPT/Codex Integration
 * Zeigt alle KI-Features in Aktion für Menschlichkeit Österreich
 */
export const AIIntegrationDemo: React.FC = () => {
  const [demoData, setDemoData] = useState({
    chatgptStatus: 'initializing',
    codexStatus: 'initializing',
    copilotStatus: 'active',
    lastGenerated: null as string | null,
    features: {
      dsgvoCheck: false,
      sepaValidation: false,
      securityReview: false,
      austrianCompliance: false,
    },
  });

  // Simuliere KI-Integration Status
  useEffect(() => {
    const timer = setTimeout(() => {
      setDemoData(prev => ({
        ...prev,
        chatgptStatus: 'connected',
        codexStatus: 'ready',
        features: {
          dsgvoCheck: true,
          sepaValidation: true,
          securityReview: true,
          austrianCompliance: true,
        },
      }));
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Demo: DSGVO-konforme Code-Generierung
  const handleDsgvoCodeGen = () => {
    const generatedCode = `
// DSGVO-konformer Cookie Consent
const cookieConsent = {
  essential: true,           // Technisch notwendig
  analytics: false,          // Opt-in erforderlich
  marketing: false,          // Explizite Einwilligung
  retention: '13 months',    // EU-Standard
  lawfulBasis: 'Art. 6 Abs. 1 lit. a DSGVO'
};

// Österreichische Datenschutzbehörde konform
const dataProcessing = {
  controller: 'Verein Menschlichkeit Österreich',
  dpo: 'datenschutz@menschlichkeit-oesterreich.at',
  retentionPeriod: '7 Jahre (Steuerrecht)',
  rights: ['access', 'rectification', 'deletion', 'portability']
};`;

    setDemoData(prev => ({
      ...prev,
      lastGenerated: generatedCode,
    }));
  };

  // Demo: SEPA-Code mit österreichischen Banken
  const handleSepaCodeGen = () => {
    const generatedCode = `
// SEPA-Validierung für österreichische Banken
const validateAustrianIBAN = (iban: string): ValidationResult => {
  const austrianBanks = {
    '12000': { name: 'Bank Austria', bic: 'BKAUATWW' },
    '20111': { name: 'Erste Bank', bic: 'GIBAATWW' },
    '32000': { name: 'Raiffeisen', bic: 'RLNWATWW' }
  };
  
  const cleanIban = iban.replace(/\\s/g, '').toUpperCase();
  
  if (!cleanIban.startsWith('AT') || cleanIban.length !== 20) {
    return { isValid: false, error: 'Ungültiges österreichisches IBAN-Format' };
  }
  
  const bankCode = cleanIban.substring(4, 9);
  const bank = austrianBanks[bankCode];
  
  return {
    isValid: true,
    bank: bank?.name || 'Unbekannte Bank',
    bic: bank?.bic,
    country: 'Austria'
  };
};`;

    setDemoData(prev => ({
      ...prev,
      lastGenerated: generatedCode,
    }));
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'ready':
        return 'text-green-600 bg-green-100';
      case 'initializing':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'ready':
        return 'bi-check-circle';
      case 'initializing':
        return 'bi-arrow-clockwise';
      default:
        return 'bi-question-circle';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🤖 AI Integration Demo</h1>
        <p className="text-muted">ChatGPT, Codex & GitHub Copilot für Menschlichkeit Österreich</p>
      </div>

      {/* Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="bi bi-chat-dots text-white text-xl" aria-hidden="true"></i>
            </div>
            <div>
              <h3 className="font-semibold">ChatGPT Extension</h3>
              <div
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusColor(demoData.chatgptStatus)}`}
              >
                <i className={statusIcon(demoData.chatgptStatus)} aria-hidden="true"></i>
                <span>{demoData.chatgptStatus}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted">
            Model: GPT-4o
            <br />
            Terminal Integration: ✅<br />
            Multi-File Edits: ✅
          </p>
        </div>

        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="bi bi-code-slash text-white text-xl" aria-hidden="true"></i>
            </div>
            <div>
              <h3 className="font-semibold">OpenAI Codex</h3>
              <div
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusColor(demoData.codexStatus)}`}
              >
                <i className={statusIcon(demoData.codexStatus)} aria-hidden="true"></i>
                <span>{demoData.codexStatus}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted">
            Inline Completions: ✅<br />
            Workspace Indexing: ✅<br />
            Code Generation: ✅
          </p>
        </div>

        <div className="card-modern p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <i className="bi bi-github text-white text-xl" aria-hidden="true"></i>
            </div>
            <div>
              <h3 className="font-semibold">GitHub Copilot</h3>
              <div
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusColor(demoData.copilotStatus)}`}
              >
                <i className={statusIcon(demoData.copilotStatus)} aria-hidden="true"></i>
                <span>{demoData.copilotStatus}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted">
            Chat Integration: ✅<br />
            Custom Instructions: ✅<br />
            Prompt Files: ✅
          </p>
        </div>
      </div>

      {/* Vereins-spezifische Features */}
      <div className="card-modern p-6">
        <h2 className="text-xl font-semibold mb-4">🇦🇹 Österreich-spezifische KI-Features</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(demoData.features).map(([key, enabled]) => (
            <div
              key={key}
              className={`p-3 rounded-lg border-2 ${enabled ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}
            >
              <div className="flex items-center gap-2">
                <i
                  className={`${enabled ? 'bi-check-circle text-green-600' : 'bi-clock text-gray-400'}`}
                  aria-hidden="true"
                ></i>
                <span className="text-sm font-medium">
                  {key === 'dsgvoCheck' && 'DSGVO Check'}
                  {key === 'sepaValidation' && 'SEPA Validierung'}
                  {key === 'securityReview' && 'Security Review'}
                  {key === 'austrianCompliance' && 'Austrian Compliance'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleDsgvoCodeGen}
            className="btn btn-primary"
            disabled={!demoData.features.dsgvoCheck}
          >
            <i className="bi bi-shield-lock mr-2" aria-hidden="true"></i>
            DSGVO Code generieren
          </button>

          <button
            onClick={handleSepaCodeGen}
            className="btn btn-secondary"
            disabled={!demoData.features.sepaValidation}
          >
            <i className="bi bi-bank mr-2" aria-hidden="true"></i>
            SEPA Code generieren
          </button>
        </div>
      </div>

      {/* Generated Code Display */}
      {demoData.lastGenerated && (
        <div className="card-modern p-6">
          <h3 className="text-lg font-semibold mb-4">🚀 KI-generierter Code</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
            {demoData.lastGenerated}
          </pre>
        </div>
      )}

      {/* Integration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <i className="bi bi-info-circle text-blue-600 text-xl mt-0.5" aria-hidden="true"></i>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">KI-Integration Status</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ ChatGPT Extension konfiguriert mit österreichischen Prompts</li>
              <li>✅ OpenAI Codex aktiviert für Inline-Completions</li>
              <li>✅ GitHub Copilot mit Custom Instructions</li>
              <li>✅ Terminal-Integration für alle KI-Services</li>
              <li>✅ DSGVO-konforme Konfiguration</li>
              <li>✅ Österreichische Compliance-Checks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIIntegrationDemo;
