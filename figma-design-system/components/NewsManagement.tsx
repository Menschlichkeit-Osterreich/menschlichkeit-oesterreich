import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Share2,
  Calendar,
  User,
  Tag,
  MoreVertical,
  Clock,
  Globe,
  Users,
  TrendingUp,
  Image as ImageIcon
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

export function NewsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddNewsOpen, setIsAddNewsOpen] = useState(false);

  // Mock news data - replace with real data from CiviCRM
  const newsArticles = [
    {
      id: 'NEWS-2024-001',
      title: 'Erfolgreiche Spendenaktion für Bildungsprojekte',
      excerpt: 'Dank der großzügigen Unterstützung unserer Mitglieder konnten wir €15.000 für Bildungsprojekte sammeln.',
      content: 'Ausführlicher Artikel über die Spendenaktion...',
      author: 'Maria Huber',
      category: 'Erfolgsgeschichten',
      status: 'published',
      publishDate: '2024-09-20',
      createdDate: '2024-09-18',
      views: 245,
      shares: 18,
      featured: true,
      tags: ['Spenden', 'Bildung', 'Erfolg']
    },
    {
      id: 'NEWS-2024-002',
      title: 'Neue Kooperation mit sozialen Einrichtungen',
      excerpt: 'Menschlichkeit Österreich schließt Partnerschaften mit führenden sozialen Einrichtungen.',
      content: 'Details über die neuen Kooperationen...',
      author: 'Johann Weber',
      category: 'Kooperationen',
      status: 'draft',
      publishDate: null,
      createdDate: '2024-09-22',
      views: 0,
      shares: 0,
      featured: false,
      tags: ['Kooperation', 'Partner', 'Soziales']
    },
    {
      id: 'NEWS-2024-003',
      title: 'Jahresbericht 2023 veröffentlicht',
      excerpt: 'Unser ausführlicher Jahresbericht zeigt die Erfolge und Herausforderungen des vergangenen Jahres.',
      content: 'Zusammenfassung des Jahresberichts...',
      author: 'Anna Schmidt',
      category: 'Berichte',
      status: 'published',
      publishDate: '2024-09-15',
      createdDate: '2024-09-10',
      views: 412,
      shares: 32,
      featured: true,
      tags: ['Jahresbericht', 'Transparenz', 'Statistiken']
    },
    {
      id: 'NEWS-2024-004',
      title: 'Workshop-Reihe zu digitaler Teilhabe startet',
      excerpt: 'Ab Oktober starten unsere Workshops zur Förderung der digitalen Teilhabe benachteiligter Gruppen.',
      content: 'Informationen zur Workshop-Reihe...',
      author: 'Peter Müller',
      category: 'Events',
      status: 'scheduled',
      publishDate: '2024-09-30',
      createdDate: '2024-09-20',
      views: 78,
      shares: 5,
      featured: false,
      tags: ['Workshop', 'Digital', 'Teilhabe']
    }
  ];

  const newsStats = {
    totalArticles: 48,
    publishedArticles: 42,
    draftArticles: 4,
    scheduledArticles: 2,
    totalViews: 12650,
    thisMonthViews: 1890
  };

  const categories = [
    { value: 'all', label: 'Alle Kategorien' },
    { value: 'Erfolgsgeschichten', label: 'Erfolgsgeschichten' },
    { value: 'Kooperationen', label: 'Kooperationen' },
    { value: 'Berichte', label: 'Berichte' },
    { value: 'Events', label: 'Events' },
    { value: 'Pressemitteilungen', label: 'Pressemitteilungen' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Alle Status' },
    { value: 'draft', label: 'Entwurf' },
    { value: 'published', label: 'Veröffentlicht' },
    { value: 'scheduled', label: 'Geplant' },
    { value: 'archived', label: 'Archiviert' }
  ];

  const filteredArticles = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || article.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'scheduled': return 'outline';
      case 'archived': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Veröffentlicht';
      case 'draft': return 'Entwurf';
      case 'scheduled': return 'Geplant';
      case 'archived': return 'Archiviert';
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
          <h2 className="text-2xl font-bold text-gray-900">News-Verwaltung</h2>
          <p className="text-gray-600 mt-1">Verwalten Sie alle Artikel und Nachrichten</p>
        </div>
        
        <Dialog open={isAddNewsOpen} onOpenChange={setIsAddNewsOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Neuer Artikel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neuen Artikel erstellen</DialogTitle>
            </DialogHeader>
            <AddNewsForm onClose={() => setIsAddNewsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Artikel gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{newsStats.totalArticles}</p>
              <p className="text-sm text-green-600 mt-1">{newsStats.publishedArticles} veröffentlicht</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Aufrufe gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{newsStats.totalViews.toLocaleString()}</p>
              <p className="text-sm text-blue-600 mt-1">+{newsStats.thisMonthViews.toLocaleString()} diesen Monat</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Entwürfe</p>
              <p className="text-2xl font-bold text-gray-900">{newsStats.draftArticles}</p>
              <p className="text-sm text-orange-600 mt-1">Zur Bearbeitung</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Edit3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Geplante Artikel</p>
              <p className="text-2xl font-bold text-gray-900">{newsStats.scheduledArticles}</p>
              <p className="text-sm text-purple-600 mt-1">Zur Veröffentlichung</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
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
                placeholder="Nach Titel, Inhalt oder Autor suchen..."
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
            <Globe className="h-4 w-4" />
            Export
          </Button>
        </div>
      </Card>

      {/* Featured Articles */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Hervorgehobene Artikel</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newsArticles.filter(article => article.featured).map((article) => (
            <Card key={article.id} className="p-4 border border-orange-200 bg-orange-50">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Featured
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="h-3 w-3" />
                  {article.views}
                </div>
              </div>
              <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{article.title}</h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{article.author}</span>
                <span>{new Date(article.publishDate || article.createdDate).toLocaleDateString('de-AT')}</span>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Articles Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Artikel ({filteredArticles.length})
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              {filteredArticles.length} von {newsArticles.length} Artikeln
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artikel</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Veröffentlichung</TableHead>
                  <TableHead>Aufrufe</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        {article.featured && (
                          <div className="flex-shrink-0 mt-1">
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                              Featured
                            </Badge>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 line-clamp-1">{article.title}</div>
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">{article.excerpt}</div>
                          <div className="text-xs text-gray-400 mt-1">{article.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{article.author}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{article.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(article.status)}>
                        {getStatusLabel(article.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {article.publishDate ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {new Date(article.publishDate).toLocaleDateString('de-AT')}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Nicht geplant</span>
                        )}
                        <div className="text-xs text-gray-500">
                          Erstellt: {new Date(article.createdDate).toLocaleDateString('de-AT')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{article.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-500">{article.shares}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {article.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{article.tags.length - 2}
                          </Badge>
                        )}
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
                            Vorschau
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Teilen
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            Statistiken
                          </DropdownMenuItem>
                          {!article.featured && (
                            <DropdownMenuItem>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Als Featured markieren
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

function AddNewsForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="space-y-6">
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Inhalt</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          <TabsTrigger value="seo">SEO & Sharing</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div>
            <Label htmlFor="title">Titel *</Label>
            <Input id="title" placeholder="Titel des Artikels" required />
          </div>
          
          <div>
            <Label htmlFor="excerpt">Kurzbeschreibung *</Label>
            <Textarea id="excerpt" placeholder="Kurze Zusammenfassung des Artikels (wird in Übersichten angezeigt)" required />
          </div>
          
          <div>
            <Label htmlFor="content">Inhalt *</Label>
            <Textarea 
              id="content" 
              placeholder="Vollständiger Artikel-Inhalt..." 
              className="min-h-[200px]"
              required 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Kategorie *</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Erfolgsgeschichten">Erfolgsgeschichten</SelectItem>
                  <SelectItem value="Kooperationen">Kooperationen</SelectItem>
                  <SelectItem value="Berichte">Berichte</SelectItem>
                  <SelectItem value="Events">Events</SelectItem>
                  <SelectItem value="Pressemitteilungen">Pressemitteilungen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="author">Autor</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Autor wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Maria Huber</SelectItem>
                  <SelectItem value="2">Johann Weber</SelectItem>
                  <SelectItem value="3">Anna Schmidt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" placeholder="Tags durch Kommas getrennt (z.B. Spenden, Bildung, Erfolg)" />
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
                <SelectItem value="published">Sofort veröffentlichen</SelectItem>
                <SelectItem value="scheduled">Geplante Veröffentlichung</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="publishDate">Veröffentlichungsdatum</Label>
            <Input id="publishDate" type="datetime-local" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="featured" />
              <Label htmlFor="featured">Als hervorgehobenen Artikel markieren</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="allowComments" defaultChecked />
              <Label htmlFor="allowComments">Kommentare erlauben</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="sendNewsletter" />
              <Label htmlFor="sendNewsletter">In Newsletter aufnehmen</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="notifyMembers" />
              <Label htmlFor="notifyMembers">Mitglieder benachrichtigen</Label>
            </div>
          </div>
          
          <div>
            <Label htmlFor="visibility">Sichtbarkeit</Label>
            <Select defaultValue="public">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Öffentlich</SelectItem>
                <SelectItem value="members">Nur Mitglieder</SelectItem>
                <SelectItem value="private">Privat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Meta-Titel</Label>
            <Input id="metaTitle" placeholder="SEO-optimierter Titel (falls abweichend)" />
          </div>
          
          <div>
            <Label htmlFor="metaDescription">Meta-Beschreibung</Label>
            <Textarea id="metaDescription" placeholder="SEO-Beschreibung für Suchmaschinen (max. 160 Zeichen)" />
          </div>
          
          <div>
            <Label htmlFor="slug">URL-Slug</Label>
            <Input id="slug" placeholder="url-freundlicher-artikelname (automatisch generiert)" />
          </div>
          
          <div>
            <Label htmlFor="socialTitle">Social Media Titel</Label>
            <Input id="socialTitle" placeholder="Titel für Social Media Sharing" />
          </div>
          
          <div>
            <Label htmlFor="socialDescription">Social Media Beschreibung</Label>
            <Textarea id="socialDescription" placeholder="Beschreibung für Social Media Sharing" />
          </div>
          
          <div>
            <Label htmlFor="featuredImage">Titelbild</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Button type="button" variant="outline">
                  Bild hochladen
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Empfohlen: 1200x630px für optimale Social Media Darstellung
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Abbrechen
        </Button>
        <Button type="button" variant="outline" className="flex-1">
          Als Entwurf speichern
        </Button>
        <Button type="submit" className="flex-1">
          Artikel veröffentlichen
        </Button>
      </div>
    </form>
  );
}