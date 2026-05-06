import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Shield, 
  Smartphone,
  Key,
  CheckCircle,
  AlertCircle,
  LogIn,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AuthSystemProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register' | 'reset' | '2fa';
}

export function AuthSystem({ isOpen, onClose, mode: initialMode }: AuthSystemProps) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Mock user roles from CiviCRM
  const userRoles = [
    { value: 'member', label: 'Mitglied', badge: 'default' },
    { value: 'moderator', label: 'Moderator', badge: 'secondary' },
    { value: 'admin', label: 'Administrator', badge: 'destructive' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (mode === 'register') {
        setSuccessMessage('Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail zur Verifizierung.');
      } else if (mode === 'reset') {
        setSuccessMessage('Passwort-Reset-Link wurde an Ihre E-Mail gesendet.');
      } else if (mode === 'login') {
        setMode('2fa');
      }
    }, 2000);
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Anmeldung erfolgreich! Willkommen zurück.');
      setTimeout(() => onClose(), 1500);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Card className="p-6">
          {mode !== '2fa' ? (
            <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="login">Anmelden</TabsTrigger>
                  <TabsTrigger value="register">Registrieren</TabsTrigger>
                  <TabsTrigger value="reset">Passwort</TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
              </div>

              {successMessage && (
                <Alert className="mb-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail-Adresse</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        placeholder="ihre.email@beispiel.at"
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        placeholder="••••••••"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm">Angemeldet bleiben</Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Anmelden...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Anmelden
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setMode('reset')}
                    >
                      Passwort vergessen?
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Vorname</Label>
                      <Input id="firstName" placeholder="Max" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nachname</Label>
                      <Input id="lastName" placeholder="Mustermann" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">E-Mail-Adresse</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="registerEmail"
                        type="email"
                        className="pl-10"
                        placeholder="ihre.email@beispiel.at"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="registerPassword"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10"
                        placeholder="Mindestens 8 Zeichen"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Passwort muss enthalten:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Mindestens 8 Zeichen</li>
                        <li>Groß- und Kleinbuchstaben</li>
                        <li>Mindestens eine Zahl</li>
                        <li>Mindestens ein Sonderzeichen</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="pl-10"
                        placeholder="Passwort wiederholen"
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm">
                        Ich akzeptiere die{' '}
                        <a href="#terms" className="text-primary underline">
                          Nutzungsbedingungen
                        </a>{' '}
                        und die{' '}
                        <a href="#privacy" className="text-primary underline">
                          Datenschutzerklärung
                        </a>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="newsletter" />
                      <Label htmlFor="newsletter" className="text-sm">
                        Newsletter abonnieren (optional)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="marketing" />
                      <Label htmlFor="marketing" className="text-sm">
                        Informationen über Events und Aktionen erhalten (optional)
                      </Label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Registrieren...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Konto erstellen
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Nach der Registrierung erhalten Sie eine E-Mail zur Bestätigung Ihrer Adresse.
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="reset">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium">Passwort zurücksetzen</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Geben Sie Ihre E-Mail-Adresse ein, um ein neues Passwort zu erhalten.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">E-Mail-Adresse</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="resetEmail"
                        type="email"
                        className="pl-10"
                        placeholder="ihre.email@beispiel.at"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Senden...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Reset-Link senden
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setMode('login')}
                    >
                      Zurück zur Anmeldung
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Zwei-Faktor-Authentifizierung</h3>
                <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
              </div>

              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.
                </p>
              </div>

              <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode">Authentifizierungscode</Label>
                  <Input
                    id="twoFactorCode"
                    type="text"
                    className="text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || twoFactorCode.length !== 6}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Überprüfen...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Bestätigen
                    </>
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                  >
                    Neuen Code anfordern
                  </Button>
                  <br />
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setMode('login')}
                  >
                    Zurück zur Anmeldung
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Sicherheitshinweis</p>
                <p className="text-blue-700 mt-1">
                  Ihre Daten werden verschlüsselt übertragen und gemäß DSGVO verarbeitet.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}