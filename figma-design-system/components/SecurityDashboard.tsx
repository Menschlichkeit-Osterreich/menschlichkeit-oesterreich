import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Key, 
  Smartphone,
  Globe,
  Activity,
  Eye,
  Clock,
  MapPin,
  Monitor,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Settings,
  Bell
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'password_change' | '2fa_setup' | 'suspicious_activity';
  timestamp: string;
  ipAddress: string;
  location: string;
  userAgent: string;
  status: 'success' | 'failed' | 'blocked';
  details?: string;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActivity: string;
  current: boolean;
}

export function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isSetup2FAOpen, setIsSetup2FAOpen] = useState(false);

  // Mock security events
  const securityEvents: SecurityEvent[] = [
    {
      id: '1',
      type: 'login',
      timestamp: '2024-09-24T14:30:00Z',
      ipAddress: '192.168.1.100',
      location: 'Wien, Austria',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: '2',
      type: 'failed_login',
      timestamp: '2024-09-23T09:15:00Z',
      ipAddress: '45.123.67.89',
      location: 'Unknown',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'failed',
      details: 'Falsches Passwort - 3 Versuche'
    },
    {
      id: '3',
      type: 'password_change',
      timestamp: '2024-09-20T16:45:00Z',
      ipAddress: '192.168.1.100',
      location: 'Wien, Austria',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: '4',
      type: 'suspicious_activity',
      timestamp: '2024-09-22T02:30:00Z',
      ipAddress: '123.45.67.89',
      location: 'Moscow, Russia',
      userAgent: 'Unknown',
      status: 'blocked',
      details: 'Ungewöhnlicher Standort - automatisch blockiert'
    }
  ];

  // Mock active sessions
  const activeSessions: ActiveSession[] = [
    {
      id: '1',
      device: 'Windows PC',
      browser: 'Chrome 118.0',
      ipAddress: '192.168.1.100',
      location: 'Wien, Austria',
      lastActivity: '2024-09-24T14:30:00Z',
      current: true
    },
    {
      id: '2',
      device: 'iPhone 15',
      browser: 'Safari 17.0',
      ipAddress: '192.168.1.101',
      location: 'Wien, Austria',
      lastActivity: '2024-09-24T08:15:00Z',
      current: false
    }
  ];

  const securityScore = 85; // Mock security score

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'login': return 'Erfolgreiche Anmeldung';
      case 'failed_login': return 'Fehlgeschlagene Anmeldung';
      case 'password_change': return 'Passwort geändert';
      case '2fa_setup': return '2FA eingerichtet';
      case 'suspicious_activity': return 'Verdächtige Aktivität';
      default: return type;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed_login': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'password_change': return <Key className="h-4 w-4 text-blue-600" />;
      case '2fa_setup': return <Smartphone className="h-4 w-4 text-purple-600" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'failed': return 'destructive';
      case 'blocked': return 'secondary';
      default: return 'outline';
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    console.log('Revoking session:', sessionId);
  };

  const handleDownloadActivity = () => {
    console.log('Downloading security activity report...');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Sicherheits-Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Überwachen und verwalten Sie die Sicherheit Ihres Kontos
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="activity">Aktivitäten</TabsTrigger>
          <TabsTrigger value="sessions">Sitzungen</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Security Score */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Sicherheitsstatus</h3>
                <Badge variant={securityScore >= 80 ? "default" : securityScore >= 60 ? "secondary" : "destructive"}>
                  {securityScore >= 80 ? "Sehr sicher" : securityScore >= 60 ? "Sicher" : "Verbesserung nötig"}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Sicherheitsscore</span>
                    <span className="text-sm font-medium">{securityScore}/100</span>
                  </div>
                  <Progress value={securityScore} className="h-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-sm font-medium">Starkes Passwort</div>
                      <div className="text-xs text-gray-600">Zuletzt geändert: vor 4 Tagen</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="text-sm font-medium">2FA nicht aktiv</div>
                      <div className="text-xs text-gray-600">Zusätzliche Sicherheit empfohlen</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium">Regelmäßige Aktivität</div>
                      <div className="text-xs text-gray-600">Letzter Login: heute</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Sicherheitsaktionen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Dialog open={isSetup2FAOpen} onOpenChange={setIsSetup2FAOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Smartphone className="h-6 w-6 text-blue-600" />
                      <div className="text-center">
                        <div className="font-medium">2FA einrichten</div>
                        <div className="text-sm text-gray-500">Zusätzliche Sicherheit</div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Zwei-Faktor-Authentifizierung einrichten</DialogTitle>
                    </DialogHeader>
                    <TwoFactorSetup onClose={() => setIsSetup2FAOpen(false)} />
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Key className="h-6 w-6 text-purple-600" />
                  <div className="text-center">
                    <div className="font-medium">Passwort ändern</div>
                    <div className="text-sm text-gray-500">Sicherheit erhöhen</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Eye className="h-6 w-6 text-green-600" />
                  <div className="text-center">
                    <div className="font-medium">Aktivitäten prüfen</div>
                    <div className="text-sm text-gray-500">Verdächtige Anmeldungen</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={handleDownloadActivity}
                >
                  <Download className="h-6 w-6 text-orange-600" />
                  <div className="text-center">
                    <div className="font-medium">Bericht herunterladen</div>
                    <div className="text-sm text-gray-500">Sicherheitsaktivitäten</div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Recent Security Events */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Aktuelle Sicherheitsereignisse</h3>
              <div className="space-y-3">
                {securityEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {getEventIcon(event.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{getEventTypeLabel(event.type)}</span>
                        <Badge variant={getStatusBadgeVariant(event.status)}>
                          {event.status === 'success' ? 'Erfolgreich' : 
                           event.status === 'failed' ? 'Fehlgeschlagen' : 'Blockiert'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.timestamp).toLocaleString('de-AT')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {event.ipAddress}
                          </span>
                        </div>
                        {event.details && (
                          <div className="text-orange-600 mt-1">{event.details}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Alle Aktivitäten anzeigen
              </Button>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Sicherheitsaktivitäten</h3>
                <Button variant="outline" size="sm" onClick={handleDownloadActivity}>
                  <Download className="h-4 w-4 mr-2" />
                  Herunterladen
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ereignis</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Zeitpunkt</TableHead>
                      <TableHead>Standort</TableHead>
                      <TableHead>IP-Adresse</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventIcon(event.type)}
                            {getEventTypeLabel(event.type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(event.status)}>
                            {event.status === 'success' ? 'Erfolgreich' : 
                             event.status === 'failed' ? 'Fehlgeschlagen' : 'Blockiert'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(event.timestamp).toLocaleString('de-AT')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {event.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{event.ipAddress}</code>
                        </TableCell>
                        <TableCell>
                          {event.details && (
                            <span className="text-sm text-gray-600">{event.details}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Aktive Sitzungen</h3>
              <p className="text-sm text-gray-600 mb-6">
                Hier sehen Sie alle Geräte, auf denen Sie aktuell angemeldet sind.
              </p>
              
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{session.device}</span>
                            {session.current && <Badge variant="default">Aktuell</Badge>}
                          </div>
                          <div className="text-sm text-gray-600">
                            {session.browser} • {session.location}
                          </div>
                          <div className="text-xs text-gray-500">
                            IP: {session.ipAddress} • 
                            Letzte Aktivität: {new Date(session.lastActivity).toLocaleString('de-AT')}
                          </div>
                        </div>
                      </div>
                      {!session.current && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                        >
                          Beenden
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Alert className="mt-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Wenn Sie verdächtige Aktivitäten feststellen, beenden Sie alle Sitzungen 
                  und ändern Sie Ihr Passwort umgehend.
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Sicherheitseinstellungen</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Authentifizierung
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactor">Zwei-Faktor-Authentifizierung</Label>
                      <p className="text-sm text-gray-500">
                        Zusätzliche Sicherheit durch Bestätigungscode
                      </p>
                    </div>
                    <Switch 
                      id="twoFactor" 
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sessionTimeout">Automatische Abmeldung</Label>
                      <p className="text-sm text-gray-500">
                        Sitzung nach Inaktivität beenden
                      </p>
                    </div>
                    <Switch id="sessionTimeout" defaultChecked />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Benachrichtigungen
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="loginNotifications">Anmelde-Benachrichtigungen</Label>
                      <p className="text-sm text-gray-500">
                        E-Mail bei Anmeldung von neuen Geräten
                      </p>
                    </div>
                    <Switch id="loginNotifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="suspiciousActivity">Verdächtige Aktivitäten</Label>
                      <p className="text-sm text-gray-500">
                        Sofortige Benachrichtigung bei Sicherheitsproblemen
                      </p>
                    </div>
                    <Switch id="suspiciousActivity" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="passwordReminder">Passwort-Erinnerungen</Label>
                      <p className="text-sm text-gray-500">
                        Erinnerung zur regelmäßigen Passwort-Änderung
                      </p>
                    </div>
                    <Switch id="passwordReminder" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  Zurücksetzen
                </Button>
                <Button className="flex-1">
                  Einstellungen speichern
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TwoFactorSetup({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');

  const handleVerify = () => {
    // Simulate verification
    console.log('Verifying 2FA setup...');
    onClose();
  };

  return (
    <div className="space-y-4">
      {step === 1 && (
        <>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-medium mb-2">Authenticator-App installieren</h4>
            <p className="text-sm text-gray-600">
              Installieren Sie eine Authenticator-App wie Google Authenticator oder Authy auf Ihrem Smartphone.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-xs text-gray-500">QR-Code</span>
              </div>
              <p className="text-sm text-gray-600">
                Scannen Sie diesen QR-Code mit Ihrer Authenticator-App
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Oder geben Sie diesen Code manuell ein:</p>
              <code className="text-sm bg-gray-100 px-3 py-1 rounded">
                JBSWY3DPEHPK3PXP
              </code>
            </div>
          </div>
          
          <Button onClick={() => setStep(2)} className="w-full">
            Weiter
          </Button>
        </>
      )}
      
      {step === 2 && (
        <>
          <div className="text-center mb-6">
            <h4 className="font-medium mb-2">Bestätigungscode eingeben</h4>
            <p className="text-sm text-gray-600">
              Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="verificationCode">Bestätigungscode</Label>
              <Input
                id="verificationCode"
                type="text"
                className="text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              Zurück
            </Button>
            <Button 
              onClick={handleVerify} 
              className="flex-1"
              disabled={verificationCode.length !== 6}
            >
              Bestätigen
            </Button>
          </div>
        </>
      )}
    </div>
  );
}