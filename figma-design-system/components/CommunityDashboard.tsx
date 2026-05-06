import { useState } from 'react';
import { Users, MessageSquare, TrendingUp, Shield, Settings, BarChart3, Calendar, Bell, UserCheck, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';

interface CommunityStats {
  totalMembers: number;
  activeMembers: number;
  totalThreads: number;
  totalReplies: number;
  weeklyGrowth: number;
  engagementRate: number;
  moderationQueue: number;
}

interface ActiveUser {
  id: string;
  name: string;
  role: 'member' | 'moderator' | 'admin';
  posts: number;
  reputation: number;
  lastActive: string;
  isOnline: boolean;
}

interface TrendingTopic {
  id: string;
  title: string;
  category: string;
  replies: number;
  views: number;
  growth: number;
  tags: string[];
}

const mockStats: CommunityStats = {
  totalMembers: 1247,
  activeMembers: 89,
  totalThreads: 342,
  totalReplies: 1823,
  weeklyGrowth: 12.5,
  engagementRate: 73.2,
  moderationQueue: 3
};

const mockActiveUsers: ActiveUser[] = [
  {
    id: '1',
    name: 'Maria Müller',
    role: 'admin',
    posts: 245,
    reputation: 892,
    lastActive: 'vor 5 Min',
    isOnline: true
  },
  {
    id: '2',
    name: 'Stefan Weber',
    role: 'moderator',
    posts: 189,
    reputation: 734,
    lastActive: 'vor 12 Min',
    isOnline: true
  },
  {
    id: '3',
    name: 'Lisa Schmidt',
    role: 'member',
    posts: 156,
    reputation: 523,
    lastActive: 'vor 1 Std',
    isOnline: false
  },
  {
    id: '4',
    name: 'Thomas Klein',
    role: 'member',
    posts: 134,
    reputation: 456,
    lastActive: 'vor 2 Std',
    isOnline: true
  }
];

const mockTrendingTopics: TrendingTopic[] = [
  {
    id: '1',
    title: 'Neue Obdachlosenhilfe-Initiative Wien',
    category: 'Hilfsprojekte',
    replies: 28,
    views: 342,
    growth: 45.2,
    tags: ['wien', 'obdachlos', 'initiative']
  },
  {
    id: '2',
    title: 'Feedback Spendenevent Oktober',
    category: 'Events',
    replies: 15,
    views: 198,
    growth: 23.1,
    tags: ['spenden', 'event', 'feedback']
  },
  {
    id: '3',
    title: 'Jugendarbeit: Neue Ansätze diskutieren',
    category: 'Allgemein',
    replies: 32,
    views: 278,
    growth: 18.7,
    tags: ['jugend', 'strategie', 'diskussion']
  }
];

export function CommunityDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const getRoleColor = (role: ActiveUser['role']) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'moderator': return 'bg-blue-500';
      case 'member': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleBadgeVariant = (role: ActiveUser['role']) => {
    switch (role) {
      case 'admin': return 'destructive' as const;
      case 'moderator': return 'default' as const;
      case 'member': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, suffix = '' }: {
    title: string;
    value: number;
    icon: any;
    change?: number;
    suffix?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value.toLocaleString()}{suffix}</p>
            {change !== undefined && (
              <p className={`text-xs flex items-center gap-1 mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-3 h-3" />
                {change >= 0 ? '+' : ''}{change}% diese Woche
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const UserCard = ({ user }: { user: ActiveUser }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium truncate">{user.name}</p>
              <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                {user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Mod' : 'Mitglied'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{user.posts} Beiträge</span>
              <span>{user.reputation} Reputation</span>
              <span>Aktiv {user.lastActive}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TopicCard = ({ topic }: { topic: TrendingTopic }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <Badge variant="outline" className="text-xs">{topic.category}</Badge>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                +{topic.growth}%
              </div>
            </div>
            <h4 className="font-medium leading-tight mb-2">{topic.title}</h4>
            <div className="flex flex-wrap gap-1 mb-3">
              {topic.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{topic.replies} Antworten</span>
            <span>{topic.views} Aufrufe</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section id="community-dashboard" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">Community Dashboard</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Überblick über die Community-Aktivitäten, Trends und wichtige Kennzahlen 
            für eine gesunde und engagierte Gemeinschaft.
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <div className="flex items-center justify-center">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="users">Benutzer</TabsTrigger>
              <TabsTrigger value="content">Inhalte</TabsTrigger>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Mitglieder gesamt"
                value={mockStats.totalMembers}
                icon={Users}
                change={mockStats.weeklyGrowth}
              />
              <StatCard
                title="Aktive Mitglieder"
                value={mockStats.activeMembers}
                icon={UserCheck}
                change={8.3}
              />
              <StatCard
                title="Diskussionen"
                value={mockStats.totalThreads}
                icon={MessageSquare}
                change={15.7}
              />
              <StatCard
                title="Engagement Rate"
                value={mockStats.engagementRate}
                icon={TrendingUp}
                suffix="%"
                change={2.1}
              />
            </div>

            {/* Alerts */}
            {mockStats.moderationQueue > 0 && (
              <Alert>
                <Flag className="w-4 h-4" />
                <AlertDescription>
                  Es gibt {mockStats.moderationQueue} offene Meldungen, die Ihre Aufmerksamkeit benötigen.
                  <Button variant="link" className="h-auto p-0 ml-2">
                    Zur Moderation →
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Community Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Community Gesundheit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Aktivität</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Diskussionsqualität</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Moderationsaufwand</span>
                      <span className="text-sm font-medium">8%</span>
                    </div>
                    <Progress value={8} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Aktivste Mitglieder</h3>
              <Badge variant="outline">{mockActiveUsers.filter(u => u.isOnline).length} online</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockActiveUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Trending Themen</h3>
              <Badge variant="outline">Letzte 7 Tage</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTrendingTopics.map(topic => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Moderation</h3>
              <div className="flex items-center gap-2">
                <Badge variant="destructive">{mockStats.moderationQueue} offen</Badge>
                <Button size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Moderation Dashboard
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Heute</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Neue Meldungen</span>
                      <span className="font-medium">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bearbeitete Fälle</span>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verwarnungen</span>
                      <span className="font-medium">1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Diese Woche</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Gesperrte Inhalte</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gelöschte Beiträge</span>
                      <span className="font-medium">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Abgewiesene Meldungen</span>
                      <span className="font-medium">4</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Moderatoren</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockActiveUsers.filter(u => u.role === 'moderator' || u.role === 'admin').map(mod => (
                      <div key={mod.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${mod.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm">{mod.name}</span>
                        </div>
                        <Badge variant={getRoleBadgeVariant(mod.role)} className="text-xs">
                          {mod.role === 'admin' ? 'Admin' : 'Mod'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}