import { useState } from 'react';
import { MessageSquare, Users, Pin, Lock, Flame, ArrowUp, ArrowDown, Reply, Flag, Search, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';

interface Thread {
  id: string;
  title: string;
  content: string;
  author: string;
  board: string;
  replies: number;
  views: number;
  lastActivity: string;
  isPinned?: boolean;
  isLocked?: boolean;
  isHot?: boolean;
  tags: string[];
}

interface Board {
  id: string;
  name: string;
  description: string;
  threadCount: number;
  isPrivate?: boolean;
}

const mockBoards: Board[] = [
  {
    id: 'general',
    name: 'Allgemeine Diskussion',
    description: 'Raum für allgemeine Gespräche über soziale Gerechtigkeit',
    threadCount: 42
  },
  {
    id: 'projects',
    name: 'Hilfsprojekte',
    description: 'Diskussion über aktuelle und geplante Hilfsprojekte',
    threadCount: 18
  },
  {
    id: 'events',
    name: 'Events & Veranstaltungen',
    description: 'Ankündigungen und Diskussion zu Veranstaltungen',
    threadCount: 12
  },
  {
    id: 'members',
    name: 'Mitgliederbereich',
    description: 'Geschlossener Bereich für Vereinsmitglieder',
    threadCount: 8,
    isPrivate: true
  }
];

const mockThreads: Thread[] = [
  {
    id: '1',
    title: 'Neue Initiative für Obdachlosenhilfe in Wien',
    content: 'Ich möchte eine Diskussion über eine neue Initiative starten...',
    author: 'Maria Müller',
    board: 'projects',
    replies: 15,
    views: 142,
    lastActivity: 'vor 2 Stunden',
    isPinned: true,
    isHot: true,
    tags: ['wien', 'obdachlosenhilfe', 'initiative']
  },
  {
    id: '2',
    title: 'Feedback zum letzten Spendenevent',
    content: 'Das Event war ein großer Erfolg! Hier sind meine Gedanken...',
    author: 'Stefan Weber',
    board: 'events',
    replies: 8,
    views: 89,
    lastActivity: 'vor 5 Stunden',
    tags: ['spendenevent', 'feedback']
  },
  {
    id: '3',
    title: 'Wie können wir mehr junge Menschen erreichen?',
    content: 'Strategien zur Ansprache der jüngeren Generation...',
    author: 'Lisa Schmidt',
    board: 'general',
    replies: 23,
    views: 201,
    lastActivity: 'vor 1 Tag',
    isHot: true,
    tags: ['jugend', 'outreach', 'strategie']
  }
];

export function Forum() {
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'boards' | 'threads' | 'thread'>('boards');
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  const filteredThreads = mockThreads.filter(thread => {
    const matchesBoard = selectedBoard === 'all' || thread.board === selectedBoard;
    const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thread.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBoard && matchesSearch;
  });

  const BoardCard = ({ board }: { board: Board }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 group"
      onClick={() => {
        setSelectedBoard(board.id);
        setCurrentView('threads');
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {board.name}
              </h3>
              {board.isPrivate && (
                <Badge variant="secondary" className="text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Privat
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{board.description}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <MessageSquare className="w-3 h-3 mr-1" />
              {board.threadCount} Diskussionen
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ThreadCard = ({ thread }: { thread: Thread }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 group"
      onClick={() => {
        setSelectedThread(thread);
        setCurrentView('thread');
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
              {thread.author.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {thread.isPinned && (
                  <Pin className="w-4 h-4 text-primary flex-shrink-0" />
                )}
                {thread.isLocked && (
                  <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                {thread.isHot && (
                  <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
                )}
                <h3 className="font-semibold group-hover:text-primary transition-colors leading-tight">
                  {thread.title}
                </h3>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{thread.content}</p>
            
            <div className="flex items-center flex-wrap gap-2 mb-3">
              {thread.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>von {thread.author}</span>
                <span>in {mockBoards.find(b => b.id === thread.board)?.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Reply className="w-3 h-3" />
                  {thread.replies}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {thread.views}
                </span>
                <span>{thread.lastActivity}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ThreadDetail = ({ thread }: { thread: Thread }) => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentView('threads')}
        >
          ← Zurück zu {mockBoards.find(b => b.id === thread.board)?.name}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {thread.isPinned && (
                  <Pin className="w-4 h-4 text-primary" />
                )}
                {thread.isLocked && (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
                {thread.isHot && (
                  <Flame className="w-4 h-4 text-orange-500" />
                )}
                <CardTitle className="text-xl">{thread.title}</CardTitle>
              </div>
              <div className="flex items-center flex-wrap gap-2">
                {thread.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                {thread.author.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{thread.author}</span>
                <Badge variant="outline" className="text-xs">Mitglied</Badge>
                <span className="text-xs text-muted-foreground">vor 2 Stunden</span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p>{thread.content}</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold">Antworten ({thread.replies})</h3>
        
        {/* Mock replies */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-secondary/10">
                    {`U${i + 1}`}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">Benutzer {i + 1}</span>
                    <span className="text-xs text-muted-foreground">vor {i + 1} Stunden</span>
                  </div>
                  <p className="text-sm mb-2">
                    Das ist eine sehr interessante Perspektive. Ich denke, wir sollten auch berücksichtigen...
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <ArrowUp className="w-3 h-3 mr-1" />
                      3
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Reply className="w-3 h-3 mr-1" />
                      Antworten
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Antwort schreiben</h4>
          <div className="space-y-3">
            <textarea 
              className="w-full min-h-[100px] p-3 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="Ihre Antwort hier eingeben..."
            />
            <div className="flex justify-end">
              <Button>Antwort senden</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (currentView === 'thread' && selectedThread) {
    return (
      <section id="forum" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <ThreadDetail thread={selectedThread} />
        </div>
      </section>
    );
  }

  return (
    <section id="forum" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Community Forum</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tauschen Sie sich mit anderen Mitgliedern aus, diskutieren Sie über Projekte 
            und gestalten Sie gemeinsam unsere Mission für mehr soziale Gerechtigkeit.
          </p>
        </div>

        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)} className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="boards" onClick={() => setCurrentView('boards')}>
                Bereiche
              </TabsTrigger>
              <TabsTrigger value="threads" onClick={() => setCurrentView('threads')}>
                Diskussionen
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Suchen Sie in Diskussionen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Neue Diskussion
              </Button>
            </div>
          </div>

          <TabsContent value="boards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockBoards.map(board => (
                <BoardCard key={board.id} board={board} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="threads" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedBoard !== 'all' && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedBoard('all');
                        setCurrentView('boards');
                      }}
                    >
                      ← Alle Bereiche
                    </Button>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-sm text-muted-foreground">
                      {mockBoards.find(b => b.id === selectedBoard)?.name}
                    </span>
                  </>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredThreads.length} Diskussionen
              </div>
            </div>

            <div className="space-y-4">
              {filteredThreads.map(thread => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
              
              {filteredThreads.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Keine Diskussionen gefunden</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? 'Versuchen Sie andere Suchbegriffe oder starten Sie eine neue Diskussion.'
                        : 'Seien Sie der Erste und starten Sie eine neue Diskussion!'
                      }
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Neue Diskussion starten
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export default Forum;