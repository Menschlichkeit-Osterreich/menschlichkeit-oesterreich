import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Calendar,
  CreditCard,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Euro,
  BarChart3
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

export function DonationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddDonationOpen, setIsAddDonationOpen] = useState(false);

  // Mock donation data - replace with real data from CiviCRM
  const donations = [
    {
      id: 'DON-2024-001',
      donor: 'Maria Huber',
      donorId: 1,
      amount: 150,
      type: 'SEPA',
      status: 'completed',
      date: '2024-09-20',
      purpose: 'Allgemeine Spende',
      reference: 'SEPA-DD-20240920-001',
      recurring: false,
      taxDeductible: true
    },
    {
      id: 'DON-2024-002',
      donor: 'Johann Weber',
      donorId: 2,
      amount: 75,
      type: 'Bank Transfer',
      status: 'pending',
      date: '2024-09-19',
      purpose: 'Bildungsprojekt',
      reference: 'TRANSFER-20240919-002',
      recurring: true,
      taxDeductible: true
    },
    {
      id: 'DON-2024-003',
      donor: 'Anonymous',
      donorId: null,
      amount: 200,
      type: 'Cash',
      status: 'completed',
      date: '2024-09-18',
      purpose: 'Soziale Gerechtigkeit',
      reference: 'CASH-20240918-003',
      recurring: false,
      taxDeductible: false
    },
    {
      id: 'DON-2024-004',
      donor: 'Peter Müller',
      donorId: 4,
      amount: 50,
      type: 'SEPA',
      status: 'failed',
      date: '2024-09-17',
      purpose: 'Mitgliedsbeitrag',
      reference: 'SEPA-DD-20240917-004',
      recurring: true,
      taxDeductible: true
    }
  ];

  const donationStats = {
    totalAmount: 125680,
    thisMonth: 8945,
    lastMonth: 7234,
    sepaTotal: 98450,
    recurringDonors: 45,
    oneTimeDonors: 123
  };

  const donationTypes = [
    { value: 'all', label: 'Alle Spendenarten' },
    { value: 'SEPA', label: 'SEPA-Lastschrift' },
    { value: 'Bank Transfer', label: 'Banküberweisung' },
    { value: 'Cash', label: 'Bargeld' },
    { value: 'PayPal', label: 'PayPal' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Alle Status' },
    { value: 'completed', label: 'Abgeschlossen' },
    { value: 'pending', label: 'Wartend' },
    { value: 'failed', label: 'Fehlgeschlagen' }
  ];

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || donation.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || donation.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'failed': return <AlertCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Abgeschlossen';
      case 'pending': return 'Wartend';
      case 'failed': return 'Fehlgeschlagen';
      default: return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Spendenverwaltung</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie alle Spenden und SEPA-Transaktionen</p>
        </div>
        
        <Dialog open={isAddDonationOpen} onOpenChange={setIsAddDonationOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Spende erfassen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neue Spende erfassen</DialogTitle>
            </DialogHeader>
            <AddDonationForm onClose={() => setIsAddDonationOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Spenden gesamt</p>
              <p className="text-2xl font-bold text-gray-900">€{donationStats.totalAmount.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+{((donationStats.thisMonth - donationStats.lastMonth) / donationStats.lastMonth * 100).toFixed(1)}% vs. letzter Monat</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Diesen Monat</p>
              <p className="text-2xl font-bold text-gray-900">€{donationStats.thisMonth.toLocaleString()}</p>
              <p className="text-sm text-blue-600 mt-1">SEPA: €{(donationStats.sepaTotal * 0.7).toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Dauerspender</p>
              <p className="text-2xl font-bold text-gray-900">{donationStats.recurringDonors}</p>
              <p className="text-sm text-purple-600 mt-1">Regelmäßige Spender</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Einmalspender</p>
              <p className="text-2xl font-bold text-gray-900">{donationStats.oneTimeDonors}</p>
              <p className="text-sm text-orange-600 mt-1">Einmalige Spenden</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Euro className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nach Spender, ID oder Zweck suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {donationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Berichte
          </Button>
        </div>
      </Card>

      {/* Donations Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Spenden ({filteredDonations.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              {filteredDonations.length} von {donations.length} Spenden
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Spenden-ID</TableHead>
                  <TableHead>Spender</TableHead>
                  <TableHead>Betrag</TableHead>
                  <TableHead>Art</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Zweck</TableHead>
                  <TableHead>Steuerlich absetzbar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <div className="font-mono text-sm">{donation.id}</div>
                      {donation.reference && (
                        <div className="text-xs text-gray-500 mt-1">{donation.reference}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{donation.donor}</div>
                        {donation.donorId && (
                          <div className="text-sm text-gray-500">ID: {donation.donorId}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Euro className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">€{donation.amount}</span>
                        {donation.recurring && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Regelmäßig
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {donation.type === 'SEPA' && <Building2 className="h-3 w-3 text-blue-500" />}
                        {donation.type === 'Bank Transfer' && <CreditCard className="h-3 w-3 text-green-500" />}
                        {donation.type === 'Cash' && <DollarSign className="h-3 w-3 text-yellow-500" />}
                        <span className="text-sm">{donation.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(donation.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(donation.status)}
                        {getStatusLabel(donation.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {new Date(donation.date).toLocaleDateString('de-AT')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{donation.purpose}</span>
                    </TableCell>
                    <TableCell>
                      {donation.taxDeductible ? (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ja
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Nein
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function AddDonationForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-6">
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Grunddaten</TabsTrigger>
          <TabsTrigger value="details">Details & SEPA</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div>
            <Label htmlFor="donor">Spender</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Spender auswählen oder 'Anonymous' für anonyme Spende" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anonymous">Anonymous</SelectItem>
                <SelectItem value="1">Maria Huber</SelectItem>
                <SelectItem value="2">Johann Weber</SelectItem>
                <SelectItem value="3">Anna Schmidt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Betrag (€) *</Label>
              <Input id="amount" type="number" placeholder="0.00" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="type">Spendenart *</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Art wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEPA">SEPA-Lastschrift</SelectItem>
                  <SelectItem value="Bank Transfer">Banküberweisung</SelectItem>
                  <SelectItem value="Cash">Bargeld</SelectItem>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="purpose">Spendenzweck *</Label>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Zweck wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Allgemeine Spende">Allgemeine Spende</SelectItem>
                <SelectItem value="Bildungsprojekt">Bildungsprojekt</SelectItem>
                <SelectItem value="Soziale Gerechtigkeit">Soziale Gerechtigkeit</SelectItem>
                <SelectItem value="Mitgliedsbeitrag">Mitgliedsbeitrag</SelectItem>
                <SelectItem value="Sonstiges">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="date">Spendendatum</Label>
            <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div>
            <Label htmlFor="reference">Referenz/Transaktions-ID</Label>
            <Input id="reference" placeholder="Automatisch generiert falls leer" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="recurring" className="rounded" />
              <Label htmlFor="recurring">Regelmäßige Spende (monatlich)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="taxDeductible" className="rounded" defaultChecked />
              <Label htmlFor="taxDeductible">Steuerlich absetzbar</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="sendReceipt" className="rounded" defaultChecked />
              <Label htmlFor="sendReceipt">Spendenquittung per E-Mail senden</Label>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notizen</Label>
            <Textarea id="notes" placeholder="Zusätzliche Informationen zur Spende..." />
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">SEPA-Informationen</h4>
            <p className="text-sm text-blue-700">
              Bei SEPA-Lastschriften wird automatisch ein Mandat erstellt. 
              Der Einzug erfolgt nach der gesetzlichen Vorankündigungsfrist.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" className="flex-1">
          Spende erfassen
        </Button>
      </div>
    </form>
  );
}