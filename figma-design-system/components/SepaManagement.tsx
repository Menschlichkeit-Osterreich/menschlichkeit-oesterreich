import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  FileText, 
  Download, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Building2,
  Shield,
  RefreshCw,
  Euro,
  Clock,
  Hash,
  User
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface SepaMandate {
  id: string;
  memberId: string;
  memberName: string;
  iban: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'pending' | 'cancelled' | 'failed';
  createdDate: string;
  nextDebit: string;
  lastDebit?: string;
  failureCount: number;
  signatureDate: string;
  signatureIp: string;
}

export function SepaManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreatingMandate, setIsCreatingMandate] = useState(false);
  const [selectedMandate, setSelectedMandate] = useState<SepaMandate | null>(null);

  // Mock SEPA mandates data
  const sepaMandates: SepaMandate[] = [
    {
      id: 'AT12345678901234567890123456',
      memberId: '1001',
      memberName: 'Maria Huber',
      iban: 'AT123456789012345678',
      amount: 60,
      frequency: 'yearly',
      status: 'active',
      createdDate: '2024-01-15',
      nextDebit: '2025-01-15',
      lastDebit: '2024-01-15',
      failureCount: 0,
      signatureDate: '2024-01-15T10:30:00Z',
      signatureIp: '192.168.1.100'
    },
    {
      id: 'AT98765432109876543210987654',
      memberId: '1002',
      memberName: 'Johann Weber',
      iban: 'AT987654321098765432',
      amount: 5,
      frequency: 'monthly',
      status: 'active',
      createdDate: '2024-03-01',
      nextDebit: '2024-10-01',
      lastDebit: '2024-09-01',
      failureCount: 0,
      signatureDate: '2024-03-01T14:22:00Z',
      signatureIp: '192.168.1.101'
    },
    {
      id: 'AT11111111111111111111111111',
      memberId: '1003',
      memberName: 'Peter Müller',
      iban: 'AT111111111111111111',
      amount: 30,
      frequency: 'yearly',
      status: 'failed',
      createdDate: '2024-02-10',
      nextDebit: '2024-10-05',
      lastDebit: '2024-02-10',
      failureCount: 3,
      signatureDate: '2024-02-10T09:15:00Z',
      signatureIp: '192.168.1.102'
    }
  ];

  const sepaStats = {
    totalMandates: sepaMandates.length,
    activeMandates: sepaMandates.filter(m => m.status === 'active').length,
    failedMandates: sepaMandates.filter(m => m.status === 'failed').length,
    monthlyRevenue: sepaMandates
      .filter(m => m.status === 'active' && m.frequency === 'monthly')
      .reduce((sum, m) => sum + m.amount, 0),
    yearlyRevenue: sepaMandates
      .filter(m => m.status === 'active' && m.frequency === 'yearly')
      .reduce((sum, m) => sum + m.amount, 0)
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'pending': return 'Wartend';
      case 'failed': return 'Fehlgeschlagen';
      case 'cancelled': return 'Gekündigt';
      default: return status;
    }
  };

  const generateMandatePdf = (mandate: SepaMandate) => {
    // Mock PDF generation
    console.log('Generating SEPA mandate PDF for:', mandate.id);
  };

  const handleRetryFailedDebit = (mandateId: string) => {
    console.log('Retrying failed debit for mandate:', mandateId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEPA-Lastschrift Verwaltung</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie alle SEPA-Mandate und Lastschriften</p>
        </div>
        
        <Button onClick={() => setIsCreatingMandate(true)} className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Neues Mandat
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="mandates">Mandate</TabsTrigger>
          <TabsTrigger value="transactions">Transaktionen</TabsTrigger>
          <TabsTrigger value="failed">Fehlgeschlagen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Aktive Mandate</p>
                    <p className="text-2xl font-bold text-gray-900">{sepaStats.activeMandates}</p>
                    <p className="text-sm text-green-600 mt-1">von {sepaStats.totalMandates} gesamt</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Monatliche Einzüge</p>
                    <p className="text-2xl font-bold text-gray-900">€{sepaStats.monthlyRevenue}</p>
                    <p className="text-sm text-blue-600 mt-1">Wiederkehrend</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <RefreshCw className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Jährliche Einzüge</p>
                    <p className="text-2xl font-bold text-gray-900">€{sepaStats.yearlyRevenue}</p>
                    <p className="text-sm text-purple-600 mt-1">Pro Jahr</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fehlgeschlagen</p>
                    <p className="text-2xl font-bold text-gray-900">{sepaStats.failedMandates}</p>
                    <p className="text-sm text-red-600 mt-1">Benötig Aufmerksamkeit</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* SEPA Information */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">SEPA-Einstellungen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Gläubiger-Identifikationsnummer</Label>
                    <p className="text-sm text-gray-600 mt-1">AT12ZZZ12345678901</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Zahlungsempfänger IBAN</Label>
                    <p className="text-sm text-gray-600 mt-1">AT123456789012345678</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">BIC</Label>
                    <p className="text-sm text-gray-600 mt-1">BKAUATWW</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Vorlaufzeit</Label>
                    <p className="text-sm text-gray-600 mt-1">5 Geschäftstage</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Verwendungszweck Template</Label>
                    <p className="text-sm text-gray-600 mt-1">Mitgliedsbeitrag {{MEMBER_ID}} - {{PERIOD}}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant="default" className="mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Produktiv
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="mandates" className="space-y-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">SEPA-Mandate ({sepaMandates.length})</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mandats-ID</TableHead>
                      <TableHead>Mitglied</TableHead>
                      <TableHead>IBAN</TableHead>
                      <TableHead>Betrag</TableHead>
                      <TableHead>Häufigkeit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Nächster Einzug</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sepaMandates.map((mandate) => (
                      <TableRow key={mandate.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-mono text-sm">{mandate.id.slice(-8)}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(mandate.createdDate).toLocaleDateString('de-AT')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{mandate.memberName}</div>
                            <div className="text-sm text-gray-500">ID: {mandate.memberId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {mandate.iban.replace(/(.{4})/g, '$1 ').trim()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Euro className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">€{mandate.amount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {mandate.frequency === 'monthly' ? 'Monatlich' : 
                             mandate.frequency === 'quarterly' ? 'Vierteljährlich' : 'Jährlich'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(mandate.status)}>
                            {getStatusLabel(mandate.status)}
                          </Badge>
                          {mandate.failureCount > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              {mandate.failureCount} Fehlversuche
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {new Date(mandate.nextDebit).toLocaleDateString('de-AT')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => generateMandatePdf(mandate)}
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                            {mandate.status === 'failed' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRetryFailedDebit(mandate.id)}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Transaktionshistorie</h3>
            <p className="text-gray-600">
              Hier werden alle SEPA-Transaktionen mit Status und Details angezeigt.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <Clock className="h-4 w-4 inline mr-2" />
                Die Transaktionshistorie wird in Kürze verfügbar sein.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Fehlgeschlagene Lastschriften</h3>
              <div className="space-y-4">
                {sepaMandates.filter(m => m.status === 'failed').map((mandate) => (
                  <div key={mandate.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="font-medium">{mandate.memberName}</span>
                          <Badge variant="destructive">Fehlgeschlagen</Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Mandats-ID: {mandate.id.slice(-8)} | 
                          IBAN: {mandate.iban.replace(/(.{4})/g, '$1 ').trim()} | 
                          Betrag: €{mandate.amount}
                        </div>
                        <div className="text-sm text-red-600 mt-1">
                          {mandate.failureCount} Fehlversuche | 
                          Letzter Versuch: {new Date(mandate.lastDebit!).toLocaleDateString('de-AT')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRetryFailedDebit(mandate.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Wiederholen
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-2" />
                          Kontaktieren
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create New Mandate Modal */}
      {isCreatingMandate && (
        <CreateMandateModal onClose={() => setIsCreatingMandate(false)} />
      )}
    </div>
  );
}

function CreateMandateModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (step < 3) {
        setStep(step + 1);
      } else {
        onClose();
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Neues SEPA-Mandat erstellen</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s}
                  className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      step > s ? 'bg-primary' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Mitglied</span>
              <span>Bankdaten</span>
              <span>Bestätigung</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <h4 className="font-medium">Mitglied auswählen</h4>
                <div>
                  <Label htmlFor="member">Mitglied</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Mitglied auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1001">Maria Huber (ID: 1001)</SelectItem>
                      <SelectItem value="1002">Johann Weber (ID: 1002)</SelectItem>
                      <SelectItem value="1003">Anna Schmidt (ID: 1003)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Betrag (€)</Label>
                    <Input id="amount" type="number" step="0.01" placeholder="30.00" required />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Häufigkeit</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Häufigkeit wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monatlich</SelectItem>
                        <SelectItem value="quarterly">Vierteljährlich</SelectItem>
                        <SelectItem value="yearly">Jährlich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h4 className="font-medium">Bankverbindung</h4>
                <div>
                  <Label htmlFor="iban">IBAN</Label>
                  <Input 
                    id="iban" 
                    placeholder="AT12 3456 7890 1234 5678"
                    pattern="[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="accountHolder">Kontoinhaber</Label>
                  <Input id="accountHolder" placeholder="Max Mustermann" required />
                </div>
                <div>
                  <Label htmlFor="purpose">Verwendungszweck</Label>
                  <Input id="purpose" placeholder="Mitgliedsbeitrag" required />
                </div>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Die Bankdaten werden verschlüsselt gespeichert und nur für SEPA-Lastschriften verwendet.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h4 className="font-medium">Bestätigung und Unterschrift</h4>
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span>Mitglied:</span>
                    <span className="font-medium">Maria Huber</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Betrag:</span>
                    <span className="font-medium">€30.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Häufigkeit:</span>
                    <span className="font-medium">Jährlich</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IBAN:</span>
                    <span className="font-medium">AT12 3456 •••• •••• 5678</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="consent" required />
                    <Label htmlFor="consent" className="text-sm">
                      Ich erteile das SEPA-Lastschriftmandat gemäß den angegebenen Bedingungen.
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="dataProcessing" required />
                    <Label htmlFor="dataProcessing" className="text-sm">
                      Ich stimme der Verarbeitung meiner Bankdaten zu SEPA-Zwecken zu.
                    </Label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  Zurück
                </Button>
              )}
              <Button type="submit" disabled={isLoading} className="ml-auto">
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {step === 3 ? 'Erstelle Mandat...' : 'Weiter...'}
                  </>
                ) : (
                  step === 3 ? 'Mandat erstellen' : 'Weiter'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}