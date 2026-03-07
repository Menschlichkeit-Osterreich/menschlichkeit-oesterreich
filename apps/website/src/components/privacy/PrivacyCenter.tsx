// DSGVO Privacy Center - Sprint 1 Critical Component
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// TypeScript Interfaces for DSGVO Compliance
interface UserConsent {
  id: string;
  category: 'essential' | 'analytics' | 'marketing' | 'personalization' | 'social-media';
  name: string;
  description: string;
  isRequired: boolean;
  isConsented: boolean;
  lastUpdated: Date;
  purpose: string;
  dataTypes: string[];
  retention: string;
  thirdParties?: string[];
}

interface PrivacyRequest {
  id: string;
  type: 'access' | 'rectification' | 'deletion' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  userId: string;
  requestDate: Date;
  completedDate?: Date;
  description?: string;
  attachments?: string[];
}

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  socialMedia: boolean;
}

interface PersonalDataCategory {
  id: string;
  name: string;
  description: string;
  dataTypes: string[];
  purpose: string[];
  legalBasis: string;
  retention: string;
  recipients?: string[];
  isProcessed: boolean;
  canBeDeleted: boolean;
}

// Default consent categories based on Austrian DSGVO requirements
const DEFAULT_CONSENTS: UserConsent[] = [
  {
    id: 'essential',
    category: 'essential',
    name: 'Technisch erforderliche Cookies',
    description:
      'Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.',
    isRequired: true,
    isConsented: true,
    lastUpdated: new Date(),
    purpose: 'Sicherstellung der Websitefunktionalität und Sitzungsverwaltung',
    dataTypes: ['Session-IDs', 'Authentifizierungstokens', 'Spracheinstellungen'],
    retention: '30 Tage oder bis zur Sitzungsbeendigung',
  },
  {
    id: 'analytics',
    category: 'analytics',
    name: 'Analyse und Statistik',
    description: 'Helfen uns, die Nutzung der Website zu verstehen und zu verbessern.',
    isRequired: false,
    isConsented: false,
    lastUpdated: new Date(),
    purpose: 'Webseitenoptimierung und Nutzungsanalyse',
    dataTypes: ['Seitenaufrufe', 'Verweildauer', 'Gerätetyp', 'Browser-Information'],
    retention: '2 Jahre',
    thirdParties: ['Google Analytics (Google Ireland Limited)'],
  },
  {
    id: 'marketing',
    category: 'marketing',
    name: 'Marketing und Werbung',
    description: 'Ermöglichen personalisierte Werbung und Marketingkommunikation.',
    isRequired: false,
    isConsented: false,
    lastUpdated: new Date(),
    purpose: 'Personalisierte Werbung und Marketingkampagnen',
    dataTypes: ['Interessen', 'Demographische Daten', 'Kaufhistorie'],
    retention: '1 Jahr',
    thirdParties: ['Facebook Pixel', 'Google Ads'],
  },
  {
    id: 'personalization',
    category: 'personalization',
    name: 'Personalisierung',
    description: 'Speichern Ihre Präferenzen für eine bessere Benutzererfahrung.',
    isRequired: false,
    isConsented: false,
    lastUpdated: new Date(),
    purpose: 'Individuelle Anpassung der Inhalte und Funktionen',
    dataTypes: ['Benutzereinstellungen', 'Sprachpräferenzen', 'Design-Themes'],
    retention: '1 Jahr',
  },
  {
    id: 'social-media',
    category: 'social-media',
    name: 'Social Media Integration',
    description: 'Ermöglichen die Integration mit sozialen Netzwerken.',
    isRequired: false,
    isConsented: false,
    lastUpdated: new Date(),
    purpose: 'Social Media Funktionen und Teilen von Inhalten',
    dataTypes: ['Social Media Profil-IDs', 'Geteilte Inhalte'],
    retention: '6 Monate',
    thirdParties: ['Facebook', 'Twitter', 'LinkedIn'],
  },
];

// Personal data categories processed by the organization
const PERSONAL_DATA_CATEGORIES: PersonalDataCategory[] = [
  {
    id: 'membership',
    name: 'Mitgliedsdaten',
    description: 'Grundlegende Informationen über Vereinsmitglieder',
    dataTypes: ['Name', 'Adresse', 'E-Mail', 'Telefonnummer', 'Geburtsdatum'],
    purpose: ['Mitgliederverwaltung', 'Kommunikation', 'Beitragsverwaltung'],
    legalBasis: 'Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)',
    retention: 'Während der Mitgliedschaft + 7 Jahre (steuerliche Aufbewahrungspflicht)',
    recipients: ['Interne Vereinsorgane', 'Steuerberater'],
    isProcessed: true,
    canBeDeleted: false,
  },
  {
    id: 'financial',
    name: 'Finanz- und Zahlungsdaten',
    description: 'Bankverbindung und Transaktionsdaten für SEPA-Lastschriften',
    dataTypes: ['IBAN', 'BIC', 'Kontoinhaber', 'Transaktionshistorie'],
    purpose: ['Beitragseinhebung', 'Spendenverwaltung', 'Buchhaltung'],
    legalBasis: 'Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)',
    retention: '10 Jahre (steuerliche und handelsrechtliche Aufbewahrungspflicht)',
    recipients: ['Bank', 'Steuerberater', 'Wirtschaftsprüfer'],
    isProcessed: true,
    canBeDeleted: false,
  },
  {
    id: 'communication',
    name: 'Kommunikationsdaten',
    description: 'Newsletter, E-Mails und andere Kommunikation',
    dataTypes: ['E-Mail-Adresse', 'Kommunikationspräferenzen', 'Newsletter-Verlauf'],
    purpose: ['Newsletter-Versand', 'Informationen über Vereinsaktivitäten'],
    legalBasis: 'Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)',
    retention: 'Bis zum Widerruf der Einwilligung',
    recipients: ['E-Mail-Service-Provider'],
    isProcessed: false,
    canBeDeleted: true,
  },
  {
    id: 'website',
    name: 'Website-Nutzungsdaten',
    description: 'Daten über die Nutzung der Website und Online-Services',
    dataTypes: ['IP-Adresse', 'Browser-Information', 'Seitenaufrufe', 'Cookies'],
    purpose: ['Website-Bereitstellung', 'Sicherheit', 'Analyse'],
    legalBasis: 'Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO)',
    retention: '2 Jahre',
    recipients: ['Hosting-Provider', 'Analytics-Provider'],
    isProcessed: true,
    canBeDeleted: true,
  },
];

// Cookie Consent Banner Component
const CookieConsentBanner: React.FC<{
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onCustomize: () => void;
  isVisible: boolean;
}> = ({ onAcceptAll, onRejectAll, onCustomize, isVisible }) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-surface border-t border-border shadow-lg"
      >
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex-1">
            <h3 className="font-semibold text-text mb-2">🍪 Cookie-Einstellungen</h3>
            <p className="text-sm text-muted">
              Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu
              bieten. Einige Cookies sind technisch notwendig, andere helfen uns, die Website zu
              verbessern und Ihnen relevante Inhalte zu zeigen. Sie können Ihre Einstellungen
              jederzeit anpassen.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={onRejectAll} className="btn btn-ghost btn-sm">
              Nur Erforderliche
            </button>
            <button onClick={onCustomize} className="btn btn-ghost btn-sm">
              Anpassen
            </button>
            <button onClick={onAcceptAll} className="btn btn-primary btn-sm">
              Alle akzeptieren
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Cookie Settings Component
const CookieSettings: React.FC<{
  consents: UserConsent[];
  onUpdateConsent: (consentId: string, isConsented: boolean) => void;
  onSave: () => void;
  onClose: () => void;
}> = ({ consents, onUpdateConsent, onSave, onClose }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Cookie-Einstellungen verwalten</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-surface-elevated flex items-center justify-center"
        >
          <i className="bi bi-x-lg text-muted" aria-hidden="true"></i>
        </button>
      </div>

      <p className="text-muted">
        Sie haben die Kontrolle über Ihre Daten. Wählen Sie aus, welche Cookie-Kategorien Sie
        zulassen möchten.
      </p>

      <div className="space-y-4">
        {consents.map(consent => (
          <div key={consent.id} className="card-modern p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{consent.name}</h3>
                  {consent.isRequired && (
                    <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                      Erforderlich
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted mb-2">{consent.description}</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={consent.isConsented}
                  onChange={e => onUpdateConsent(consent.id, e.target.checked)}
                  disabled={consent.isRequired}
                  className="sr-only"
                />
                <div
                  className={`
                  w-11 h-6 bg-neutral-200 rounded-full transition-colors relative
                  ${consent.isConsented ? 'bg-primary-500' : ''}
                  ${consent.isRequired ? 'opacity-50' : ''}
                `}
                >
                  <div
                    className={`
                    absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform
                    ${consent.isConsented ? 'translate-x-5' : ''}
                  `}
                  />
                </div>
              </label>
            </div>

            {/* Detailed Information */}
            <div className="text-xs text-muted space-y-1 pt-2 border-t border-border-muted">
              <div>
                <strong>Zweck:</strong> {consent.purpose}
              </div>
              <div>
                <strong>Datentypen:</strong> {consent.dataTypes.join(', ')}
              </div>
              <div>
                <strong>Speicherdauer:</strong> {consent.retention}
              </div>
              {consent.thirdParties && (
                <div>
                  <strong>Drittanbieter:</strong> {consent.thirdParties.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button onClick={onClose} className="btn btn-ghost flex-1">
          Abbrechen
        </button>
        <button onClick={onSave} className="btn btn-primary flex-1">
          Einstellungen speichern
        </button>
      </div>
    </div>
  );
};

// Data Request Form Component
const DataRequestForm: React.FC<{
  onSubmit: (request: Omit<PrivacyRequest, 'id' | 'status' | 'requestDate'>) => void;
  onClose: () => void;
}> = ({ onSubmit, onClose }) => {
  const [requestType, setRequestType] = useState<PrivacyRequest['type']>('access');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestTypes: Array<{
    value: PrivacyRequest['type'];
    label: string;
    description: string;
    icon: string;
  }> = [
    {
      value: 'access',
      label: 'Auskunftsrecht (Art. 15 DSGVO)',
      description: 'Erfahren Sie, welche personenbezogenen Daten wir über Sie gespeichert haben.',
      icon: 'bi-info-circle',
    },
    {
      value: 'rectification',
      label: 'Berichtigung (Art. 16 DSGVO)',
      description: 'Lassen Sie unrichtige oder unvollständige Daten korrigieren.',
      icon: 'bi-pencil-square',
    },
    {
      value: 'deletion',
      label: 'Löschung (Art. 17 DSGVO)',
      description: 'Beantragen Sie die Löschung Ihrer personenbezogenen Daten.',
      icon: 'bi-trash',
    },
    {
      value: 'portability',
      label: 'Datenübertragbarkeit (Art. 20 DSGVO)',
      description: 'Erhalten Sie Ihre Daten in einem strukturierten Format.',
      icon: 'bi-download',
    },
    {
      value: 'restriction',
      label: 'Einschränkung der Verarbeitung (Art. 18 DSGVO)',
      description: 'Schränken Sie die Verarbeitung Ihrer Daten ein.',
      icon: 'bi-pause-circle',
    },
    {
      value: 'objection',
      label: 'Widerspruch (Art. 21 DSGVO)',
      description: 'Widersprechen Sie der Verarbeitung Ihrer Daten.',
      icon: 'bi-x-circle',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    onSubmit({
      type: requestType,
      userId: 'current-user-id', // Will be from auth context
      description: description.trim() || undefined,
    });

    setIsSubmitting(false);
    onClose();
  };

  const selectedType = requestTypes.find(type => type.value === requestType)!;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Datenschutz-Anfrage stellen</h2>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-surface-elevated flex items-center justify-center"
        >
          <i className="bi bi-x-lg text-muted" aria-hidden="true"></i>
        </button>
      </div>

      <p className="text-muted">
        Als betroffene Person haben Sie nach der DSGVO verschiedene Rechte bezüglich Ihrer
        personenbezogenen Daten.
      </p>

      <div>
        <label className="block text-sm font-semibold mb-3">Art der Anfrage *</label>
        <div className="grid gap-3">
          {requestTypes.map(type => (
            <label
              key={type.value}
              className={`
                flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors
                ${
                  requestType === type.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-border hover:border-primary-300'
                }
              `}
            >
              <input
                type="radio"
                name="requestType"
                value={type.value}
                checked={requestType === type.value}
                onChange={e => setRequestType(e.target.value as PrivacyRequest['type'])}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <i className={`${type.icon} text-primary-500`} aria-hidden="true"></i>
                  <span className="font-medium">{type.label}</span>
                </div>
                <p className="text-sm text-muted">{type.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Zusätzliche Informationen (optional)
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="input w-full min-h-[100px] resize-y"
          placeholder="Beschreiben Sie Ihre Anfrage genauer oder geben Sie zusätzliche Informationen an..."
        />
      </div>

      <div className="bg-info/10 border border-info/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <i className="bi bi-info-circle text-info mt-0.5" aria-hidden="true"></i>
          <div>
            <h3 className="font-semibold text-info mb-1">Bearbeitungszeit</h3>
            <p className="text-sm text-info/80">
              Wir werden Ihre Anfrage innerhalb von 30 Tagen bearbeiten, wie es die DSGVO vorsieht.
              Sie erhalten eine Bestätigung per E-Mail und werden über den Fortschritt informiert.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost flex-1"
          disabled={isSubmitting}
        >
          Abbrechen
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Wird gesendet...
            </>
          ) : (
            <>
              <i className={`${selectedType.icon} mr-2`} aria-hidden="true"></i>
              Anfrage einreichen
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Data Overview Component
const DataOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Ihre personenbezogenen Daten</h2>
        <p className="text-muted">
          Hier finden Sie eine Übersicht über die Kategorien personenbezogener Daten, die wir von
          Ihnen verarbeiten.
        </p>
      </div>

      <div className="grid gap-4">
        {PERSONAL_DATA_CATEGORIES.map(category => (
          <div key={category.id} className="card-modern p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <p className="text-sm text-muted">{category.description}</p>
              </div>
              <div className="flex gap-2">
                {category.isProcessed && (
                  <span className="text-xs px-2 py-1 bg-success-100 text-success-700 rounded-full">
                    Aktiv verarbeitet
                  </span>
                )}
                {category.canBeDeleted && (
                  <span className="text-xs px-2 py-1 bg-warning-100 text-warning-700 rounded-full">
                    Löschbar
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted">
              <div>
                <strong>Datentypen:</strong>
                <ul className="list-disc list-inside mt-1">
                  {category.dataTypes.map((type, index) => (
                    <li key={index}>{type}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong>Zwecke:</strong>
                <ul className="list-disc list-inside mt-1">
                  {category.purpose.map((purpose, index) => (
                    <li key={index}>{purpose}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong>Rechtsgrundlage:</strong>
                <p className="mt-1">{category.legalBasis}</p>
              </div>

              <div>
                <strong>Speicherdauer:</strong>
                <p className="mt-1">{category.retention}</p>
              </div>

              {category.recipients && (
                <div className="md:col-span-2">
                  <strong>Empfänger:</strong>
                  <p className="mt-1">{category.recipients.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Privacy Center Component
export const PrivacyCenter: React.FC<{
  isOpen?: boolean;
  onClose?: () => void;
  initialTab?: 'overview' | 'cookies' | 'requests' | 'settings';
}> = ({ isOpen = true, onClose, initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [consents, setConsents] = useState<UserConsent[]>(DEFAULT_CONSENTS);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [requests, setRequests] = useState<PrivacyRequest[]>([]);

  // Check if user has made cookie choices
  useEffect(() => {
    const hasChosenCookies = localStorage.getItem('cookie-preferences');
    if (!hasChosenCookies && !isOpen) {
      setShowCookieBanner(true);
    }
  }, [isOpen]);

  const handleUpdateConsent = (consentId: string, isConsented: boolean) => {
    setConsents(prev =>
      prev.map(consent =>
        consent.id === consentId ? { ...consent, isConsented, lastUpdated: new Date() } : consent
      )
    );
  };

  const handleSaveCookieSettings = () => {
    const preferences: CookiePreferences = {
      essential: consents.find(c => c.id === 'essential')?.isConsented || true,
      analytics: consents.find(c => c.id === 'analytics')?.isConsented || false,
      marketing: consents.find(c => c.id === 'marketing')?.isConsented || false,
      personalization: consents.find(c => c.id === 'personalization')?.isConsented || false,
      socialMedia: consents.find(c => c.id === 'social-media')?.isConsented || false,
    };

    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    setShowCookieBanner(false);

    // Show success message
    alert('Cookie-Einstellungen wurden gespeichert!');
  };

  const handleAcceptAllCookies = () => {
    setConsents(prev => prev.map(consent => ({ ...consent, isConsented: true })));
    handleSaveCookieSettings();
  };

  const handleRejectAllCookies = () => {
    setConsents(prev =>
      prev.map(consent => (consent.isRequired ? consent : { ...consent, isConsented: false }))
    );
    handleSaveCookieSettings();
  };

  const handleSubmitRequest = (request: Omit<PrivacyRequest, 'id' | 'status' | 'requestDate'>) => {
    const newRequest: PrivacyRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      requestDate: new Date(),
    };

    setRequests(prev => [newRequest, ...prev]);
    alert('Ihre Datenschutz-Anfrage wurde erfolgreich eingereicht!');
  };

  const tabs = [
    { id: 'overview' as const, label: 'Datenübersicht', icon: 'bi-pie-chart' },
    { id: 'cookies' as const, label: 'Cookie-Einstellungen', icon: 'bi-gear' },
    { id: 'requests' as const, label: 'Datenschutz-Anfragen', icon: 'bi-file-earmark-text' },
    { id: 'settings' as const, label: 'Datenschutz-Einstellungen', icon: 'bi-shield-lock' },
  ];

  if (!isOpen) {
    return (
      <CookieConsentBanner
        isVisible={showCookieBanner}
        onAcceptAll={handleAcceptAllCookies}
        onRejectAll={handleRejectAllCookies}
        onCustomize={() => {
          setShowCookieBanner(false);
          // This would open the full privacy center
          if (onClose) {
            // In a real implementation, this would open the privacy center
            console.log('Open privacy center for customization');
          }
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl bg-surface rounded-lg shadow-xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold">Datenschutz-Center</h1>
            <p className="text-sm text-muted">
              Verwalten Sie Ihre Datenschutz-Einstellungen und -Rechte
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-surface-elevated flex items-center justify-center"
            >
              <i className="bi bi-x-lg text-muted" aria-hidden="true"></i>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'text-primary-500 border-b-2 border-primary-500 bg-primary-50'
                    : 'text-muted hover:text-text hover:bg-surface-elevated'
                }
              `}
            >
              <i className={tab.icon} aria-hidden="true"></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {activeTab === 'overview' && <DataOverview />}
          {activeTab === 'cookies' && (
            <CookieSettings
              consents={consents}
              onUpdateConsent={handleUpdateConsent}
              onSave={handleSaveCookieSettings}
              onClose={onClose!}
            />
          )}
          {activeTab === 'requests' && (
            <DataRequestForm onSubmit={handleSubmitRequest} onClose={onClose!} />
          )}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Datenschutz-Einstellungen</h2>
              <p className="text-muted">Weitere Einstellungen werden in Sprint 2 implementiert.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Cookie Banner (if needed) */}
      <CookieConsentBanner
        isVisible={showCookieBanner}
        onAcceptAll={handleAcceptAllCookies}
        onRejectAll={handleRejectAllCookies}
        onCustomize={() => setActiveTab('cookies')}
      />
    </div>
  );
};

// Export additional components and types
export type { UserConsent, PrivacyRequest, CookiePreferences, PersonalDataCategory };
export { CookieConsentBanner, CookieSettings, DataRequestForm, DataOverview };
