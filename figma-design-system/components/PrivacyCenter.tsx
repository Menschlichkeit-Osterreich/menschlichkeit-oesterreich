import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  Settings, 
  FileText,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Database,
  Lock,
  Globe,
  History,
  Bell
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface ConsentRecord {
  id: string;
  type: 'privacy_policy' | 'newsletter' | 'marketing' | 'cookies' | 'data_processing';
  granted: boolean;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  version: string;
}

interface DataExportRequest {
  id: string;
  requestDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiryDate?: string;
}

interface DeletionRequest {
  id: string;
  requestDate: string;
  status: 'pending' | 'processing' | 'completed';
  scheduledDate?: string;
  reason?: string;
}

export function PrivacyCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false);

  // Mock consent records
  const consentRecords: ConsentRecord[] = [
    {
      id: '1',
      type: 'privacy_policy',
      granted: true,
      timestamp: '2024-01-15T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      version: '1.2'
    },
    {
      id: '2',
      type: 'newsletter',
      granted: true,
      timestamp: '2024-01-15T10:32:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      version: '1.0'
    },
    {
      id: '3',
      type: 'marketing',
      granted: false,
      timestamp: '2024-03-10T14:20:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      version: '1.1'
    },
    {
      id: '4',
      type: 'cookies',
      granted: true,
      timestamp: '2024-01-15T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      version: '2.0'
    }
  ];

  // Mock data export requests
  const exportRequests: DataExportRequest[] = [
    {
      id: '1',
      requestDate: '2024-09-20T10:30:00Z',
      status: 'completed',
      downloadUrl: '/downloads/data-export-20240920.zip',
      expiryDate: '2024-10-20T10:30:00Z'
    }
  ];

  // Mock deletion requests
  const deletionRequests: DeletionRequest[] = [];

  const getConsentTypeLabel = (type: string) => {
    switch (type) {
      case 'privacy_policy': return 'Datenschutzerklärung';
      case 'newsletter': return 'Newsletter';
      case 'marketing': return 'Marketing-Kommunikation';
      case 'cookies': return 'Cookies';
      case 'data_processing': return 'Datenverarbeitung';
      default: return type;
    }
  };

  const handleDataExport = () => {
    console.log('Requesting data export...');
    setIsExportDialogOpen(false);
    // Simulate API call to create export request
  };

  const handleAccountDeletion = () => {
    console.log('Requesting account deletion...');
    setIsDeletionDialogOpen(false);
    // Simulate API call to schedule account deletion
  };

  const personalData = {
    profile: {
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max.mustermann@beispiel.at',
      phone: '+43 676 123 4567',
      memberSince: '2024-01-15',
      membershipType: 'Standard'
    },
    activity: {
      lastLogin: '2024-09-24T14:30:00Z',
      loginCount: 42,
      forumPosts: 15,
      eventsAttended: 3,
      donationsCount: 5
    },
    preferences: {
      newsletter: true,
      marketing: false,
      eventNotifications: true,
      forumNotifications: true
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Datenschutz-Center</h1>
        <p className="text-gray-600 mt-2">
          Verwalten Sie Ihre Daten und Datenschutz-Einstellungen
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="data">Meine Daten</TabsTrigger>
          <TabsTrigger value="consent">Einverständnisse</TabsTrigger>
          <TabsTrigger value="requests">Anfragen</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Schnellaktionen</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Download className="h-6 w-6 text-blue-600" />
                      <div className="text-center">
                        <div className="font-medium">Daten exportieren</div>
                        <div className="text-sm text-gray-500">Alle Ihre Daten herunterladen</div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Datenexport anfordern</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Sie erhalten eine E-Mail mit einem Download-Link für Ihre Daten. 
                        Der Export umfasst alle Ihre persönlichen Daten, Aktivitäten und Einstellungen.
                      </p>
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          Die Bearbeitung kann bis zu 30 Tage dauern. Der Download-Link ist 30 Tage gültig.
                        </AlertDescription>
                      </Alert>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setIsExportDialogOpen(false)} className="flex-1">
                          Abbrechen
                        </Button>
                        <Button onClick={handleDataExport} className="flex-1">
                          Export anfordern
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Eye className="h-6 w-6 text-green-600" />
                  <div className="text-center">
                    <div className="font-medium">Daten einsehen</div>
                    <div className="text-sm text-gray-500">Was wir über Sie wissen</div>
                  </div>
                </Button>

                <Dialog open={isDeletionDialogOpen} onOpenChange={setIsDeletionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Trash2 className="h-6 w-6 text-red-600" />
                      <div className="text-center">
                        <div className="font-medium">Konto löschen</div>
                        <div className="text-sm text-gray-500">Alle Daten dauerhaft entfernen</div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Konto löschen</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>Achtung:</strong> Diese Aktion kann nicht rückgängig gemacht werden. 
                          Alle Ihre Daten werden dauerhaft gelöscht.
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Folgende Daten werden gelöscht:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                          <li>Ihr Benutzerprofil und Kontodaten</li>
                          <li>Alle Forum-Beiträge und Kommentare</li>
                          <li>Event-Anmeldungen und Teilnahmehistorie</li>
                          <li>Spenden- und Zahlungshistorie (gesetzl. Aufbewahrungsfristen beachtet)</li>
                        </ul>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setIsDeletionDialogOpen(false)} className="flex-1">
                          Abbrechen
                        </Button>
                        <Button variant="destructive" onClick={handleAccountDeletion} className="flex-1">
                          Endgültig löschen
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>

            {/* Privacy Status */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Datenschutz-Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Einverständnisse aktuell</div>
                      <div className="text-sm text-gray-600">Alle Einverständnisse sind gültig</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Daten verschlüsselt</div>
                      <div className="text-sm text-gray-600">Ihre Daten sind sicher gespeichert</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Letzter Login</div>
                      <div className="text-sm text-gray-600">
                        {new Date(personalData.activity.lastLogin).toLocaleString('de-AT')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Mitglied seit</div>
                      <div className="text-sm text-gray-600">
                        {new Date(personalData.profile.memberSince).toLocaleDateString('de-AT')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Ihre gespeicherten Daten</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profildaten
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-xs font-medium text-gray-500">Name</Label>
                    <div className="text-sm">{personalData.profile.firstName} {personalData.profile.lastName}</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">E-Mail</Label>
                    <div className="text-sm">{personalData.profile.email}</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">Telefon</Label>
                    <div className="text-sm">{personalData.profile.phone}</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">Mitgliedschaft</Label>
                    <div className="text-sm">{personalData.profile.membershipType}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Aktivitätsdaten
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-xs font-medium text-gray-500">Anmeldungen</Label>
                    <div className="text-sm">{personalData.activity.loginCount} mal</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">Forum-Beiträge</Label>
                    <div className="text-sm">{personalData.activity.forumPosts} Beiträge</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">Event-Teilnahmen</Label>
                    <div className="text-sm">{personalData.activity.eventsAttended} Events</div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-500">Spenden</Label>
                    <div className="text-sm">{personalData.activity.donationsCount} Spenden</div>
                  </div>
                </div>
              </div>

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Für einen vollständigen Export aller Ihrer Daten nutzen Sie die Funktion "Daten exportieren" 
                  in der Übersicht.
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Einverständnis-Historie</h3>
            <p className="text-sm text-gray-600 mb-4">
              Hier sehen Sie alle Einverständnisse, die Sie erteilt oder widerrufen haben.
            </p>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Typ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>IP-Adresse</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{getConsentTypeLabel(record.type)}</TableCell>
                      <TableCell>
                        <Badge variant={record.granted ? "default" : "secondary"}>
                          {record.granted ? "Erteilt" : "Widerrufen"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(record.timestamp).toLocaleString('de-AT')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">v{record.version}</Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{record.ipAddress}</code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <Alert className="mt-4">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Diese Aufzeichnungen werden zur Compliance mit der DSGVO geführt und können nicht gelöscht werden, 
                solange gesetzliche Aufbewahrungsfristen bestehen.
              </AlertDescription>
            </Alert>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Datenexport-Anfragen</h3>
              {exportRequests.length > 0 ? (
                <div className="space-y-3">
                  {exportRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                          {request.status === 'completed' ? 'Abgeschlossen' : 'In Bearbeitung'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(request.requestDate).toLocaleDateString('de-AT')}
                        </span>
                      </div>
                      {request.downloadUrl && (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-2" />
                            Herunterladen
                          </Button>
                          <span className="text-xs text-gray-500">
                            Gültig bis: {new Date(request.expiryDate!).toLocaleDateString('de-AT')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">Keine Exportanfragen vorhanden.</p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Löschanfragen</h3>
              {deletionRequests.length > 0 ? (
                <div className="space-y-3">
                  {deletionRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="destructive">
                          {request.status === 'completed' ? 'Abgeschlossen' : 'Geplant'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(request.requestDate).toLocaleDateString('de-AT')}
                        </span>
                      </div>
                      {request.scheduledDate && (
                        <p className="text-sm text-gray-600">
                          Geplant für: {new Date(request.scheduledDate).toLocaleDateString('de-AT')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">Keine Löschanfragen vorhanden.</p>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Datenschutz-Einstellungen</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Kommunikations-Einstellungen
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="newsletter">Newsletter</Label>
                      <p className="text-sm text-gray-500">
                        Regelmäßige Updates über unsere Arbeit und Projekte
                      </p>
                    </div>
                    <Switch id="newsletter" defaultChecked={personalData.preferences.newsletter} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing">Marketing-Kommunikation</Label>
                      <p className="text-sm text-gray-500">
                        Informationen über Sonderaktionen und Events
                      </p>
                    </div>
                    <Switch id="marketing" defaultChecked={personalData.preferences.marketing} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="eventNotifications">Event-Benachrichtigungen</Label>
                      <p className="text-sm text-gray-500">
                        Erinnerungen zu Events, für die Sie angemeldet sind
                      </p>
                    </div>
                    <Switch id="eventNotifications" defaultChecked={personalData.preferences.eventNotifications} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="forumNotifications">Forum-Benachrichtigungen</Label>
                      <p className="text-sm text-gray-500">
                        Benachrichtigungen zu neuen Antworten auf Ihre Beiträge
                      </p>
                    </div>
                    <Switch id="forumNotifications" defaultChecked={personalData.preferences.forumNotifications} />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Cookie-Einstellungen
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notwendige Cookies</Label>
                      <p className="text-sm text-gray-500">
                        Erforderlich für grundlegende Funktionen (können nicht deaktiviert werden)
                      </p>
                    </div>
                    <Switch checked disabled />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics">Analyse-Cookies</Label>
                      <p className="text-sm text-gray-500">
                        Helfen uns, die Nutzung der Website zu verstehen
                      </p>
                    </div>
                    <Switch id="analytics" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing-cookies">Marketing-Cookies</Label>
                      <p className="text-sm text-gray-500">
                        Für personalisierte Werbung und Social Media
                      </p>
                    </div>
                    <Switch id="marketing-cookies" />
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