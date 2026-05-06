import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Cookie, Shield, Eye, BarChart3, X } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'menschlichkeit-cookie-consent';
const COOKIE_PREFERENCES_KEY = 'menschlichkeit-cookie-preferences';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Immer aktiviert
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    } else {
      // Load preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    savePreferences(necessaryOnly);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowDetails(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    
    // Trigger GTM/Analytics based on preferences
    if (prefs.analytics) {
      // Initialize analytics
      console.log('✅ Analytics aktiviert');
    }
    if (prefs.marketing) {
      // Initialize marketing cookies
      console.log('✅ Marketing aktiviert');
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Necessary cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 safe-container"
      >
        <Card className="card-modern max-w-6xl mx-auto shadow-2xl border-2">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Cookie className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Cookie-Einstellungen</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Wir respektieren Ihre Privatsphäre
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBanner(false)}
                aria-label="Schließen"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">
              Diese Website verwendet Cookies, um Ihnen die bestmögliche Erfahrung zu bieten. 
              Notwendige Cookies sind für die Grundfunktionen der Website erforderlich. 
              Weitere Cookies helfen uns, die Website zu verbessern und Ihnen relevante Inhalte anzuzeigen.
            </p>

            {/* Simple Banner */}
            {!showDetails && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAcceptAll}
                  className="btn-primary-gradient flex-1"
                >
                  Alle akzeptieren
                </Button>
                <Button
                  onClick={handleAcceptNecessary}
                  variant="outline"
                  className="flex-1"
                >
                  Nur notwendige
                </Button>
                <Button
                  onClick={() => setShowDetails(true)}
                  variant="ghost"
                  className="flex-1"
                >
                  Einstellungen
                </Button>
              </div>
            )}

            {/* Detailed Settings */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4"
              >
                <Separator />
                
                <div className="space-y-4">
                  {/* Necessary Cookies */}
                  <div className="flex items-start justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-3 flex-1">
                      <Shield className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <Label className="text-base mb-1 cursor-default">
                          Notwendige Cookies
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Erforderlich für die Grundfunktionen der Website (Login, Navigation, Sicherheit)
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.necessary}
                      disabled
                      aria-label="Notwendige Cookies (immer aktiviert)"
                    />
                  </div>

                  {/* Functional Cookies */}
                  <div className="flex items-start justify-between gap-4 p-4 hover:bg-muted/30 rounded-lg transition-colors">
                    <div className="flex items-start gap-3 flex-1">
                      <Eye className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <Label 
                          htmlFor="functional-cookies"
                          className="text-base mb-1 cursor-pointer"
                        >
                          Funktionale Cookies
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Ermöglichen erweiterte Funktionen (Spracheinstellungen, Präferenzen)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="functional-cookies"
                      checked={preferences.functional}
                      onCheckedChange={() => togglePreference('functional')}
                      aria-label="Funktionale Cookies umschalten"
                    />
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between gap-4 p-4 hover:bg-muted/30 rounded-lg transition-colors">
                    <div className="flex items-start gap-3 flex-1">
                      <BarChart3 className="w-5 h-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <Label 
                          htmlFor="analytics-cookies"
                          className="text-base mb-1 cursor-pointer"
                        >
                          Analyse-Cookies
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Helfen uns zu verstehen, wie Sie unsere Website nutzen (anonymisiert)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="analytics-cookies"
                      checked={preferences.analytics}
                      onCheckedChange={() => togglePreference('analytics')}
                      aria-label="Analyse-Cookies umschalten"
                    />
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start justify-between gap-4 p-4 hover:bg-muted/30 rounded-lg transition-colors">
                    <div className="flex items-start gap-3 flex-1">
                      <Cookie className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div className="flex-1">
                        <Label 
                          htmlFor="marketing-cookies"
                          className="text-base mb-1 cursor-pointer"
                        >
                          Marketing-Cookies
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Ermöglichen personalisierte Werbung und Inhalte
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="marketing-cookies"
                      checked={preferences.marketing}
                      onCheckedChange={() => togglePreference('marketing')}
                      aria-label="Marketing-Cookies umschalten"
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSavePreferences}
                    className="btn-primary-gradient flex-1"
                  >
                    Auswahl speichern
                  </Button>
                  <Button
                    onClick={handleAcceptAll}
                    variant="outline"
                    className="flex-1"
                  >
                    Alle akzeptieren
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Weitere Informationen finden Sie in unserer{' '}
                  <a href="#privacy" className="underline hover:text-primary">
                    Datenschutzerklärung
                  </a>
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export default CookieConsent;

// Hook für Cookie-Präferenzen
export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  return preferences;
}