import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Settings, 
  Shield, 
  Mail, 
  Globe, 
  Users, 
  CreditCard,
  Bell,
  Database,
  Lock,
  Key
} from 'lucide-react';

export function AdminSettings() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Systemeinstellungen</h3>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="security">Sicherheit</TabsTrigger>
          <TabsTrigger value="integrations">Integrationen</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Vereinseinstellungen
            </h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="organizationName">Vereinsname</Label>
                <Input id="organizationName" defaultValue="Menschlichkeit Österreich" />
              </div>
              
              <div>
                <Label htmlFor="organizationEmail">Haupt-E-Mail</Label>
                <Input id="organizationEmail" type="email" defaultValue="info@menschlichkeit-oesterreich.at" />
              </div>
              
              <div>
                <Label htmlFor="organizationPhone">Telefon</Label>
                <Input id="organizationPhone" defaultValue="+43 1 234 5678" />
              </div>
              
              <div>
                <Label htmlFor="organizationAddress">Adresse</Label>
                <Textarea id="organizationAddress" defaultValue="Mariahilfer Straße 123&#10;1060 Wien&#10;Österreich" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Mitgliedschaftseinstellungen
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="standardPrice">Standard Mitgliedschaft (€/Jahr)</Label>
                <Input id="standardPrice" type="number" defaultValue="30" />
              </div>
              
              <div>
                <Label htmlFor="premiumPrice">Premium Mitgliedschaft (€/Jahr)</Label>
                <Input id="premiumPrice" type="number" defaultValue="60" />
              </div>
              
              <div>
                <Label htmlFor="studentPrice">Student Mitgliedschaft (€/Jahr)</Label>
                <Input id="studentPrice" type="number" defaultValue="15" />
              </div>
              
              <div>
                <Label htmlFor="gracePeriod">Kulanzzeit (Tage)</Label>
                <Input id="gracePeriod" type="number" defaultValue="30" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              SEPA-Einstellungen
            </h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="creditorId">Gläubiger-Identifikationsnummer</Label>
                <Input id="creditorId" defaultValue="AT12ZZZ12345678901" />
              </div>
              
              <div>
                <Label htmlFor="bankAccount">IBAN</Label>
                <Input id="bankAccount" defaultValue="AT123456789012345678" />
              </div>
              
              <div>
                <Label htmlFor="preNotificationDays">Vorlaufzeit SEPA-Lastschrift (Tage)</Label>
                <Select defaultValue="5">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Tag</SelectItem>
                    <SelectItem value="2">2 Tage</SelectItem>
                    <SelectItem value="5">5 Tage</SelectItem>
                    <SelectItem value="14">14 Tage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              E-Mail Benachrichtigungen
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="newMemberNotification">Neue Mitglieder</Label>
                  <p className="text-sm text-gray-500">Benachrichtigung bei neuen Anmeldungen</p>
                </div>
                <Switch id="newMemberNotification" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="donationNotification">Spenden</Label>
                  <p className="text-sm text-gray-500">Benachrichtigung bei neuen Spenden</p>
                </div>
                <Switch id="donationNotification" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="eventRegistrationNotification">Event-Anmeldungen</Label>
                  <p className="text-sm text-gray-500">Benachrichtigung bei Event-Anmeldungen</p>
                </div>
                <Switch id="eventRegistrationNotification" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="forumModerationNotification">Forum-Moderation</Label>
                  <p className="text-sm text-gray-500">Benachrichtigung bei Moderationsanfragen</p>
                </div>
                <Switch id="forumModerationNotification" defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-Mail-Einstellungen
            </h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="smtpServer">SMTP Server</Label>
                <Input id="smtpServer" defaultValue="smtp.gmail.com" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpPort">Port</Label>
                  <Input id="smtpPort" defaultValue="587" />
                </div>
                
                <div>
                  <Label htmlFor="smtpSecurity">Verschlüsselung</Label>
                  <Select defaultValue="tls">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keine</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="smtpUsername">Benutzername</Label>
                <Input id="smtpUsername" defaultValue="noreply@menschlichkeit-oesterreich.at" />
              </div>
              
              <div>
                <Label htmlFor="smtpPassword">Passwort</Label>
                <Input id="smtpPassword" type="password" placeholder="••••••••" />
              </div>
            </div>
            
            <Button variant="outline" size="sm">
              Verbindung testen
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sicherheitseinstellungen
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireTwoFactor">Zwei-Faktor-Authentifizierung</Label>
                  <p className="text-sm text-gray-500">Für alle Admin-Accounts erforderlich</p>
                </div>
                <Switch id="requireTwoFactor" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sessionTimeout">Session-Timeout</Label>
                  <p className="text-sm text-gray-500">Automatisches Abmelden nach Inaktivität</p>
                </div>
                <Select defaultValue="60">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Min</SelectItem>
                    <SelectItem value="60">60 Min</SelectItem>
                    <SelectItem value="120">2 Std</SelectItem>
                    <SelectItem value="480">8 Std</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="passwordComplexity">Passwort-Komplexität</Label>
                  <p className="text-sm text-gray-500">Starke Passwörter erforderlich</p>
                </div>
                <Switch id="passwordComplexity" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="loginAttempts">Login-Versuche begrenzen</Label>
                  <p className="text-sm text-gray-500">Account-Sperre nach fehlgeschlagenen Versuchen</p>
                </div>
                <Switch id="loginAttempts" defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Key className="h-4 w-4" />
              API-Schlüssel
            </h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="publicKey">Öffentlicher API-Schlüssel</Label>
                <div className="flex gap-2">
                  <Input id="publicKey" defaultValue="pk_test_..." readOnly />
                  <Button variant="outline" size="sm">Regenerieren</Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="privateKey">Privater API-Schlüssel</Label>
                <div className="flex gap-2">
                  <Input id="privateKey" type="password" defaultValue="sk_test_..." readOnly />
                  <Button variant="outline" size="sm">Anzeigen</Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Datenschutz
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dataRetention">Datenaufbewahrung</Label>
                  <p className="text-sm text-gray-500">Automatisches Löschen alter Daten</p>
                </div>
                <Select defaultValue="7">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Jahre</SelectItem>
                    <SelectItem value="5">5 Jahre</SelectItem>
                    <SelectItem value="7">7 Jahre</SelectItem>
                    <SelectItem value="10">10 Jahre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="anonymizeData">Daten anonymisieren</Label>
                  <p className="text-sm text-gray-500">Nach Austritten automatisch anonymisieren</p>
                </div>
                <Switch id="anonymizeData" defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Externe Integrationen
            </h4>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h5 className="font-medium">Google Analytics</h5>
                    <p className="text-sm text-gray-500">Website-Statistiken und Tracking</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gaTrackingId">Tracking ID</Label>
                  <Input id="gaTrackingId" placeholder="GA4-G-XXXXXXXXXX" />
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h5 className="font-medium">Mailchimp</h5>
                    <p className="text-sm text-gray-500">Newsletter und E-Mail Marketing</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mailchimpApiKey">API-Schlüssel</Label>
                  <Input id="mailchimpApiKey" type="password" placeholder="••••••••" />
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h5 className="font-medium">Facebook Pixel</h5>
                    <p className="text-sm text-gray-500">Social Media Tracking</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebookPixelId">Pixel ID</Label>
                  <Input id="facebookPixelId" placeholder="1234567890123456" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-6 border-t">
        <Button variant="outline" className="flex-1">
          Zurücksetzen
        </Button>
        <Button className="flex-1">
          Einstellungen speichern
        </Button>
      </div>
    </Card>
  );
}