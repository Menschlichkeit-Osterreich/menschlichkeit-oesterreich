import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  Database, 
  Sync, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  Download,
  Upload,
  Calendar,
  Users,
  DollarSign,
  Settings,
  ExternalLink,
  Shield,
  Clock
} from 'lucide-react';

export function CivicrmIntegration() {
  const [isConnected, setIsConnected] = useState(true);
  const [lastSync, setLastSync] = useState('2024-09-24 14:30:00');
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Mock sync statistics
  const syncStats = {
    members: { total: 1247, synced: 1247, errors: 0 },
    donations: { total: 3456, synced: 3450, errors: 6 },
    events: { total: 24, synced: 24, errors: 0 },
    activities: { total: 8923, synced: 8920, errors: 3 }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          setLastSync(new Date().toLocaleString('de-AT'));
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold">CiviCRM Integration</h3>
        {isConnected ? (
          <Badge variant="default" className="ml-auto">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verbunden
          </Badge>
        ) : (
          <Badge variant="destructive" className="ml-auto">
            <XCircle className="h-3 w-3 mr-1" />
            Getrennt
          </Badge>
        )}
      </div>

      {!isConnected && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Die Verbindung zu CiviCRM ist unterbrochen. Bitte überprüfen Sie die Verbindungseinstellungen.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="sync">Synchronisation</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          <TabsTrigger value="mapping">Feldmapping</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Verbindungsstatus</h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">CiviCRM Server</p>
                    <p className="text-sm text-gray-500">https://crm.menschlichkeit-oesterreich.at</p>
                  </div>
                </div>
                <Badge variant="default">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">API Verbindung</p>
                    <p className="text-sm text-gray-500">REST API v4</p>
                  </div>
                </div>
                <Badge variant="default">Aktiv</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Webhook Events</p>
                    <p className="text-sm text-gray-500">Real-time Synchronisation</p>
                  </div>
                </div>
                <Badge variant="secondary">Teilweise</Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Letzte Synchronisation</h4>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{lastSync}</p>
                <p className="text-xs text-gray-500">Automatische Synchronisation alle 15 Minuten</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Datenstatistiken</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Mitglieder</span>
                </div>
                <p className="text-2xl font-bold">{syncStats.members.synced.toLocaleString()}</p>
                <p className="text-sm text-gray-500">von {syncStats.members.total.toLocaleString()} synchronisiert</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Spenden</span>
                </div>
                <p className="text-2xl font-bold">{syncStats.donations.synced.toLocaleString()}</p>
                <p className="text-sm text-gray-500">von {syncStats.donations.total.toLocaleString()} synchronisiert</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Events</span>
                </div>
                <p className="text-2xl font-bold">{syncStats.events.synced}</p>
                <p className="text-sm text-gray-500">von {syncStats.events.total} synchronisiert</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Aktivitäten</span>
                </div>
                <p className="text-2xl font-bold">{syncStats.activities.synced.toLocaleString()}</p>
                <p className="text-sm text-gray-500">von {syncStats.activities.total.toLocaleString()} synchronisiert</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">Manuelle Synchronisation</h4>
              <Button 
                onClick={handleSync} 
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Synchronisiere...' : 'Jetzt synchronisieren'}
              </Button>
            </div>
            
            {isSyncing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fortschritt</span>
                  <span>{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} className="w-full" />
              </div>
            )}
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Die Synchronisation überträgt alle Daten zwischen dem Admin-Dashboard und CiviCRM. 
                Dies kann je nach Datenmenge einige Minuten dauern.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Automatische Synchronisation</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoSync">Automatische Synchronisation</Label>
                  <p className="text-sm text-gray-500">Daten automatisch im Hintergrund synchronisieren</p>
                </div>
                <Switch id="autoSync" defaultChecked />
              </div>
              
              <div>
                <Label htmlFor="syncInterval">Synchronisationsintervall</Label>
                <Select defaultValue="15">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Alle 5 Minuten</SelectItem>
                    <SelectItem value="15">Alle 15 Minuten</SelectItem>
                    <SelectItem value="30">Alle 30 Minuten</SelectItem>
                    <SelectItem value="60">Stündlich</SelectItem>
                    <SelectItem value="360">Alle 6 Stunden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Datenrichtung</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="syncToRms">CiviCRM → Dashboard</Label>
                  <p className="text-sm text-gray-500">Daten von CiviCRM ins Dashboard importieren</p>
                </div>
                <Switch id="syncToRms" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="syncFromRms">Dashboard → CiviCRM</Label>
                  <p className="text-sm text-gray-500">Änderungen im Dashboard zu CiviCRM übertragen</p>
                </div>
                <Switch id="syncFromRms" defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Datenexport/Import</h4>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Daten exportieren
              </Button>
              <Button variant="outline" className="flex-1 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Daten importieren
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Verbindungseinstellungen
            </h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="crmUrl">CiviCRM URL</Label>
                <Input id="crmUrl" defaultValue="https://crm.menschlichkeit-oesterreich.at" />
              </div>
              
              <div>
                <Label htmlFor="apiKey">API-Schlüssel</Label>
                <div className="flex gap-2">
                  <Input id="apiKey" type="password" defaultValue="••••••••••••••••" />
                  <Button variant="outline" size="sm">Test</Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="siteKey">Site-Schlüssel</Label>
                <div className="flex gap-2">
                  <Input id="siteKey" type="password" defaultValue="••••••••••••••••" />
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sicherheitseinstellungen
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sslVerify">SSL-Zertifikat überprüfen</Label>
                  <p className="text-sm text-gray-500">Empfohlen für Produktionsumgebungen</p>
                </div>
                <Switch id="sslVerify" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="encryptData">Daten verschlüsseln</Label>
                  <p className="text-sm text-gray-500">Sensible Daten während der Übertragung verschlüsseln</p>
                </div>
                <Switch id="encryptData" defaultChecked />
              </div>
              
              <div>
                <Label htmlFor="timeout">Verbindungstimeout (Sekunden)</Label>
                <Select defaultValue="30">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                    <SelectItem value="120">120</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Erweiterte Einstellungen</h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="batchSize">Batch-Größe</Label>
                <p className="text-sm text-gray-500 mb-2">Anzahl der Datensätze pro Synchronisationsvorgang</p>
                <Select defaultValue="100">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="250">250</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="debugMode">Debug-Modus</Label>
                  <p className="text-sm text-gray-500">Detaillierte Logs für Fehlerbehebung</p>
                </div>
                <Switch id="debugMode" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Feldmapping</h4>
            <p className="text-sm text-gray-500">
              Definieren Sie, wie Felder zwischen dem Dashboard und CiviCRM zugeordnet werden.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-700">Mitgliederfelder</h5>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Dashboard Feld</Label>
                    <Input value="firstName" readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-xs">CiviCRM Feld</Label>
                    <Select defaultValue="first_name">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first_name">first_name</SelectItem>
                        <SelectItem value="given_name">given_name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Dashboard Feld</Label>
                    <Input value="lastName" readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-xs">CiviCRM Feld</Label>
                    <Select defaultValue="last_name">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last_name">last_name</SelectItem>
                        <SelectItem value="family_name">family_name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Dashboard Feld</Label>
                    <Input value="email" readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-xs">CiviCRM Feld</Label>
                    <Select defaultValue="email">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">email</SelectItem>
                        <SelectItem value="primary_email">primary_email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-700">Spendenfelder</h5>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Dashboard Feld</Label>
                    <Input value="amount" readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-xs">CiviCRM Feld</Label>
                    <Select defaultValue="total_amount">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total_amount">total_amount</SelectItem>
                        <SelectItem value="amount">amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Dashboard Feld</Label>
                    <Input value="donationDate" readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-xs">CiviCRM Feld</Label>
                    <Select defaultValue="receive_date">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receive_date">receive_date</SelectItem>
                        <SelectItem value="contribution_date">contribution_date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1">
              Standard wiederherstellen
            </Button>
            <Button className="flex-1">
              Mapping speichern
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-6 border-t">
        <Button variant="outline" className="flex-1">
          Verbindung testen
        </Button>
        <Button className="flex-1">
          Einstellungen speichern
        </Button>
      </div>
    </Card>
  );
}