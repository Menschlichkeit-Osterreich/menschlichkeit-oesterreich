import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  MapPin,
  Clock,
  Euro,
  MoreVertical,
  Eye,
  Share2,
  Download,
  CheckCircle,
  AlertCircle,
  XCircle
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

export function EventManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // Mock event data - replace with real data from CiviCRM
  const events = [
    {
      id: 'EVT-2024-001',
      title: 'Soziale Gerechtigkeit Forum 2024',
      description: 'Diskussion über aktuelle Herausforderungen der sozialen Gerechtigkeit in Österreich',
      date: '2024-10-15',
      time: '18:00',
      duration: 180,
      location: 'Wien, Rathaus',
      category: 'Forum',
      status: 'published',
      registrations: 45,
      maxParticipants: 100,
      price: 0,
      organizer: 'Maria Huber',
      createdDate: '2024-09-01'
    },
    {
      id: 'EVT-2024-002',
      title: 'Fundraising Gala 2024',
      description: 'Jährliche Fundraising-Veranstaltung mit prominenten Gästen',
      date: '2024-11-20',
      time: '19:30',
      duration: 240,
      location: 'Wien, Hotel Imperial',
      category: 'Fundraising',
      status: 'draft',
      registrations: 12,
      maxParticipants: 150,
      price: 75,
      organizer: 'Johann Weber',
      createdDate: '2024-09-10'
    },
    {
      id: 'EVT-2024-003',
      title: 'Mitgliederversammlung',
      description: 'Ordentliche Mitgliederversammlung mit Jahresbericht und Vorstandswahlen',
      date: '2024-12-05',
      time: '17:00',
      duration: 120,
      location: 'Wien, Vereinslokal',
      category: 'Versammlung',
      status: 'published',
      registrations: 78,
      maxParticipants: 120,
      price: 0,
      organizer: 'Anna Schmidt',
      createdDate: '2024-08-15'
    },
    {
      id: 'EVT-2024-004',
      title: 'Workshop: Digitale Teilhabe',
      description: 'Workshop über digitale Teilhabe und Barrierefreiheit im Internet',
      date: '2024-09-28',
      time: '14:00',
      duration: 240,
      location: 'Wien, Volkshochschule',
      category: 'Workshop',
      status: 'cancelled',
      registrations: 8,
      maxParticipants: 25,
      price: 15,
      organizer: 'Peter Müller',
      createdDate: '2024-08-20'
    }
  ];

  const eventStats = {
    totalEvents: 24,
    publishedEvents: 18,
    draftEvents: 4,
    cancelledEvents: 2,
    totalRegistrations: 567,
    thisMonthRegistrations: 89
  };

  const categories = [
    { value: 'all', label: 'Alle Kategorien' },
    { value: 'Forum', label: 'Forum' },
    { value: 'Workshop', label: 'Workshop' },
    { value: 'Fundraising', label: 'Fundraising' },
    { value: 'Versammlung', label: 'Versammlung' },
    { value: 'Networking', label: 'Networking' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Alle Status' },
    { value: 'draft', label: 'Entwurf' },
    { value: 'published', label: 'Veröffentlicht' },
    { value: 'cancelled', label: 'Abgesagt' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-3 w-3" />;
      case 'draft': return <AlertCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Veröffentlicht';
      case 'draft': return 'Entwurf';
      case 'cancelled': return 'Abgesagt';
      default: return status;
    }
  };

  const getRegistrationProgress = (registrations: number, maxParticipants: number) => {
    return Math.round((registrations / maxParticipants) * 100);
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
          <h2 className="text-2xl font-bold text-gray-900">Event-Verwaltung</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie alle Veranstaltungen und Anmeldungen</p>
        </div>
        
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Neues Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neues Event erstellen</DialogTitle>
            </DialogHeader>
            <AddEventForm onClose={() => setIsAddEventOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Events gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{eventStats.totalEvents}</p>
              <p className="text-sm text-green-600 mt-1">{eventStats.publishedEvents} veröffentlicht</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Anmeldungen gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{eventStats.totalRegistrations}</p>
              <p className="text-sm text-blue-600 mt-1">+{eventStats.thisMonthRegistrations} diesen Monat</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Entwürfe</p>
              <p className="text-2xl font-bold text-gray-900">{eventStats.draftEvents}</p>
              <p className="text-sm text-orange-600 mt-1">Zur Veröffentlichung</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Edit3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Abgesagte Events</p>
              <p className="text-2xl font-bold text-gray-900">{eventStats.cancelledEvents}</p>
              <p className="text-sm text-red-600 mt-1">Dieses Jahr</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
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
                placeholder="Nach Titel, Beschreibung oder Ort suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
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

      {/* Events Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Events ({filteredEvents.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              {filteredEvents.length} von {events.length} Events
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Datum & Uhrzeit</TableHead>
                  <TableHead>Ort</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Anmeldungen</TableHead>
                  <TableHead>Preis</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                          {event.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{event.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(event.date).toLocaleDateString('de-AT')}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {event.time} ({event.duration} Min.)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(event.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(event.status)}
                        {getStatusLabel(event.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-medium">
                            {event.registrations}/{event.maxParticipants}
                          </span>
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full" 
                            style={{ width: `${getRegistrationProgress(event.registrations, event.maxParticipants)}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Euro className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">
                          {event.price === 0 ? 'Kostenlos' : `€${event.price}`}
                        </span>
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
                            <Eye className="h-4 w-4 mr-2" />
                            Anzeigen
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            Anmeldungen verwalten
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Teilen
                          </DropdownMenuItem>
                          {event.status === 'published' && (
                            <DropdownMenuItem>
                              <XCircle className="h-4 w-4 mr-2" />
                              Absagen
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

function AddEventForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-6">
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Grunddaten</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div>
            <Label htmlFor="title">Event-Titel *</Label>
            <Input id="title" placeholder="Titel des Events" required />
          </div>
          
          <div>
            <Label htmlFor="description">Beschreibung *</Label>
            <Textarea id="description" placeholder="Detaillierte Beschreibung des Events" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Datum *</Label>
              <Input id="date" type="date" required />
            </div>
            <div>
              <Label htmlFor="time">Uhrzeit *</Label>
              <Input id="time" type="time" required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Dauer (Minuten)</Label>
              <Input id="duration" type="number" placeholder="120" />
            </div>
            <div>
              <Label htmlFor="category">Kategorie *</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Forum">Forum</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Fundraising">Fundraising</SelectItem>
                  <SelectItem value="Versammlung">Versammlung</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="location">Veranstaltungsort *</Label>
            <Input id="location" placeholder="Adresse des Veranstaltungsortes" required />
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxParticipants">Max. Teilnehmer</Label>
              <Input id="maxParticipants" type="number" placeholder="100" />
            </div>
            <div>
              <Label htmlFor="price">Preis (€)</Label>
              <Input id="price" type="number" placeholder="0.00" step="0.01" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="organizer">Veranstalter</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Veranstalter wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Maria Huber</SelectItem>
                <SelectItem value="2">Johann Weber</SelectItem>
                <SelectItem value="3">Anna Schmidt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="requirements">Teilnahmevoraussetzungen</Label>
            <Textarea id="requirements" placeholder="Besondere Voraussetzungen für die Teilnahme..." />
          </div>
          
          <div>
            <Label htmlFor="agenda">Agenda/Programm</Label>
            <Textarea id="agenda" placeholder="Detailliertes Programm des Events..." />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select defaultValue="draft">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Entwurf</SelectItem>
                <SelectItem value="published">Veröffentlicht</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="requiresRegistration" defaultChecked />
              <Label htmlFor="requiresRegistration">Anmeldung erforderlich</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="memberOnly" />
              <Label htmlFor="memberOnly">Nur für Mitglieder</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="waitingList" />
              <Label htmlFor="waitingList">Warteliste aktivieren</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="reminderEmail" defaultChecked />
              <Label htmlFor="reminderEmail">Erinnerungs-E-Mail senden</Label>
            </div>
          </div>
          
          <div>
            <Label htmlFor="registrationDeadline">Anmeldeschluss</Label>
            <Input id="registrationDeadline" type="date" />
          </div>
          
          <div>
            <Label htmlFor="cancellationDeadline">Stornierungsfrist (Stunden)</Label>
            <Input id="cancellationDeadline" type="number" placeholder="24" />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Abbrechen
        </Button>
        <Button type="submit" className="flex-1">
          Event erstellen
        </Button>
      </div>
    </form>
  );
}