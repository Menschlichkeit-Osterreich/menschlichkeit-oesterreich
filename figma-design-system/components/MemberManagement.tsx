import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  UserCheck,
  UserX,
  MoreVertical
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';

export function MemberManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembershipType, setSelectedMembershipType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Mock member data - replace with real data from CiviCRM
  const members = [
    {
      id: 1,
      firstName: 'Maria',
      lastName: 'Huber',
      email: 'maria.huber@example.com',
      phone: '+43 676 123 4567',
      membershipType: 'Premium',
      status: 'active',
      joinDate: '2024-01-15',
      lastDonation: '2024-08-20',
      totalDonations: 450,
      address: 'Mariahilfer Straße 123, 1060 Wien',
      notes: 'Sehr engagiertes Mitglied, regelmäßige Teilnahme an Events'
    },
    {
      id: 2,
      firstName: 'Johann',
      lastName: 'Weber',
      email: 'johann.weber@example.com',
      phone: '+43 664 987 6543',
      membershipType: 'Standard',
      status: 'active',
      joinDate: '2023-09-10',
      lastDonation: '2024-07-15',
      totalDonations: 180,
      address: 'Landstraßer Hauptstraße 45, 1030 Wien',
      notes: 'Interessiert an sozialer Gerechtigkeit'
    },
    {
      id: 3,
      firstName: 'Anna',
      lastName: 'Schmidt',
      email: 'anna.schmidt@student.ac.at',
      phone: '+43 650 111 2222',
      membershipType: 'Student',
      status: 'active',
      joinDate: '2024-03-01',
      lastDonation: null,
      totalDonations: 25,
      address: 'Universitätsstraße 7, 1010 Wien',
      notes: 'Studentin an der Universität Wien'
    },
    {
      id: 4,
      firstName: 'Peter',
      lastName: 'Müller',
      email: 'peter.mueller@example.com',
      phone: '+43 699 333 4444',
      membershipType: 'Premium',
      status: 'suspended',
      joinDate: '2023-05-20',
      lastDonation: '2024-02-10',
      totalDonations: 320,
      address: 'Prater Straße 89, 1020 Wien',
      notes: 'Zahlung ausständig seit 3 Monaten'
    }
  ];

  const membershipTypes = [
    { value: 'all', label: 'Alle Mitgliedschaften' },
    { value: 'Standard', label: 'Standard (€30/Jahr)' },
    { value: 'Premium', label: 'Premium (€60/Jahr)' },
    { value: 'Student', label: 'Student (€15/Jahr)' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Alle Status' },
    { value: 'active', label: 'Aktiv' },
    { value: 'suspended', label: 'Suspendiert' },
    { value: 'cancelled', label: 'Gekündigt' }
  ];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedMembershipType === 'all' || member.membershipType === selectedMembershipType;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'suspended': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv';
      case 'suspended': return 'Suspendiert';
      case 'cancelled': return 'Gekündigt';
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
          <h2 className="text-2xl font-bold text-gray-900">Mitgliederverwaltung</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie alle Vereinsmitglieder und deren Daten</p>
        </div>
        
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Neues Mitglied
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neues Mitglied hinzufügen</DialogTitle>
            </DialogHeader>
            <AddMemberForm onClose={() => setIsAddMemberOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nach Namen oder E-Mail suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedMembershipType} onValueChange={setSelectedMembershipType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {membershipTypes.map((type) => (
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
        </div>
      </Card>

      {/* Members Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Mitglieder ({filteredMembers.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              {filteredMembers.length} von {members.length} Mitgliedern
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>Mitgliedschaft</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Beitrittsdatum</TableHead>
                  <TableHead>Spenden gesamt</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{member.firstName} {member.lastName}</div>
                        <div className="text-sm text-gray-500">ID: {member.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {member.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.membershipType === 'Premium' ? 'default' : 'secondary'}>
                        {member.membershipType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(member.status)}>
                        {getStatusLabel(member.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {new Date(member.joinDate).toLocaleDateString('de-AT')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3 text-gray-400" />
                        €{member.totalDonations}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            E-Mail senden
                          </DropdownMenuItem>
                          {member.status === 'active' ? (
                            <DropdownMenuItem>
                              <UserX className="h-4 w-4 mr-2" />
                              Suspendieren
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Aktivieren
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

function AddMemberForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-6">
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Persönliche Daten</TabsTrigger>
          <TabsTrigger value="membership">Mitgliedschaft</TabsTrigger>
          <TabsTrigger value="additional">Zusätzliche Infos</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Vorname *</Label>
              <Input id="firstName" placeholder="Vorname" required />
            </div>
            <div>
              <Label htmlFor="lastName">Nachname *</Label>
              <Input id="lastName" placeholder="Nachname" required />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">E-Mail *</Label>
            <Input id="email" type="email" placeholder="E-Mail-Adresse" required />
          </div>
          
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" type="tel" placeholder="+43 xxx xxx xxxx" />
          </div>
          
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Textarea id="address" placeholder="Straße, PLZ, Ort" />
          </div>
        </TabsContent>

        <TabsContent value="membership" className="space-y-4">
          <div>
            <Label htmlFor="membershipType">Mitgliedschaftstyp *</Label>
            <Select required>
              <SelectTrigger>
                <SelectValue placeholder="Mitgliedschaftstyp wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard (€30/Jahr)</SelectItem>
                <SelectItem value="Premium">Premium (€60/Jahr)</SelectItem>
                <SelectItem value="Student">Student (€15/Jahr)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="joinDate">Beitrittsdatum</Label>
            <Input id="joinDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="autoPayment" />
            <Label htmlFor="autoPayment">SEPA-Lastschrift aktivieren</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="newsletter" defaultChecked />
            <Label htmlFor="newsletter">Newsletter abonnieren</Label>
          </div>
        </TabsContent>

        <TabsContent value="additional" className="space-y-4">
          <div>
            <Label htmlFor="interests">Interessensgebiete</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="social-justice" />
                <Label htmlFor="social-justice">Soziale Gerechtigkeit</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="environment" />
                <Label htmlFor="environment">Umweltschutz</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="human-rights" />
                <Label htmlFor="human-rights">Menschenrechte</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="education" />
                <Label htmlFor="education">Bildung</Label>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notizen</Label>
            <Textarea id="notes" placeholder="Zusätzliche Informationen..." />
          </div>
          
          <div>
            <Label htmlFor="source">Wie haben Sie von uns erfahren?</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Quelle wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Webseite</SelectItem>
                <SelectItem value="social-media">Social Media</SelectItem>
                <SelectItem value="friend">Freunde/Familie</SelectItem>
                <SelectItem value="event">Veranstaltung</SelectItem>
                <SelectItem value="other">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" className="flex-1">
          Mitglied hinzufügen
        </Button>
      </div>
    </form>
  );
}