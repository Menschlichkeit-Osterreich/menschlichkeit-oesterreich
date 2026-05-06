import { useState } from 'react';
import { User, Edit3, Bell, Shield, Award, MessageSquare, Calendar, Heart, Settings, Eye, EyeOff, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio: string;
  memberSince: string;
  role: 'member' | 'moderator' | 'admin';
  membershipType: 'supporting' | 'regular' | 'honorary';
  posts: number;
  replies: number;
  reputation: number;
  badges: Badge[];
  recentActivity: Activity[];
  preferences: UserPreferences;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

interface Activity {
  id: string;
  type: 'post' | 'reply' | 'like' | 'event' | 'donation';
  title: string;
  timestamp: string;
  details?: string;
}

interface UserPreferences {
  emailNotifications: boolean;
  forumDigest: boolean;
  eventReminders: boolean;
  moderationAlerts: boolean;
  profileVisibility: 'public' | 'members' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
}

const mockUser: UserProfileData = {
  id: '1',
  name: 'Maria Müller',
  email: 'maria.mueller@example.com',
  phone: '+43 1 234 5678',
  location: 'Wien, Österreich',
  bio: 'Leidenschaftliche Aktivistin für soziale Gerechtigkeit mit über 10 Jahren Erfahrung in der Jugendarbeit. Glaube fest daran, dass jeder Mensch das Recht auf ein würdevolles Leben hat.',
  memberSince: 'März 2022',
  role: 'moderator',
  membershipType: 'regular',
  posts: 145,
  replies: 289,
  reputation: 847,
  badges: [
    {
      id: '1',
      name: 'Community Helper',
      description: 'Hat über 50 hilfreiche Antworten gegeben',
      icon: '🏅',
      earnedAt: 'vor 2 Monaten'
    },
    {
      id: '2',
      name: 'Spenden-Champion',
      description: 'Hat bei 5 Spendenaktionen teilgenommen',
      icon: '💝',
      earnedAt: 'vor 1 Monat'
    },
    {
      id: '3',
      name: 'Event-Organisator',
      description: 'Hat erfolgreich ein Event organisiert',
      icon: '🎯',
      earnedAt: 'vor 3 Wochen'
    }
  ],
  recentActivity: [
    {
      id: '1',
      type: 'post',
      title: 'Neue Initiative für Obdachlosenhilfe gestartet',
      timestamp: 'vor 2 Stunden',
      details: 'Hilfsprojekte'
    },
    {
      id: '2',
      type: 'reply',
      title: 'Antwort auf "Feedback zum Spendenevent"',
      timestamp: 'vor 1 Tag',
      details: 'Events'
    },
    {
      id: '3',
      type: 'event',
      title: 'Teilnahme am Workshop "Jugendarbeit 2024"',
      timestamp: 'vor 3 Tagen'
    },
    {
      id: '4',
      type: 'donation',
      title: 'Spende für Obdachlosenhilfe Wien',
      timestamp: 'vor 1 Woche'
    }
  ],
  preferences: {
    emailNotifications: true,
    forumDigest: true,
    eventReminders: true,
    moderationAlerts: true,
    profileVisibility: 'members',
    showEmail: false,
    showPhone: false,
    showLocation: true
  }
};

export function UserProfile() {
  const [user, setUser] = useState<UserProfileData>(mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const getMembershipBadgeVariant = (type: UserProfileData['membershipType']) => {
    switch (type) {
      case 'supporting': return 'outline' as const;
      case 'regular': return 'default' as const;
      case 'honorary': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  const getRoleBadgeVariant = (role: UserProfileData['role']) => {
    switch (role) {
      case 'admin': return 'destructive' as const;
      case 'moderator': return 'default' as const;
      case 'member': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'post': return <MessageSquare className="w-4 h-4" />;
      case 'reply': return <MessageSquare className="w-4 h-4" />;
      case 'like': return <Heart className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'donation': return <Heart className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: boolean | string) => {
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  return (
    <section id="user-profile" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-6 flex-wrap">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-2xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role === 'admin' ? 'Administrator' : 
                         user.role === 'moderator' ? 'Moderator' : 'Mitglied'}
                      </Badge>
                      <Badge variant={getMembershipBadgeVariant(user.membershipType)}>
                        {user.membershipType === 'supporting' ? 'Fördermitglied' :
                         user.membershipType === 'regular' ? 'Ordentliches Mitglied' : 'Ehrenmitglied'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Mitglied seit {user.memberSince}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? 'Speichern' : 'Bearbeiten'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.posts}</div>
                    <div className="text-sm text-muted-foreground">Beiträge</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.replies}</div>
                    <div className="text-sm text-muted-foreground">Antworten</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.reputation}</div>
                    <div className="text-sm text-muted-foreground">Reputation</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {isEditing ? (
                    <Textarea
                      value={user.bio}
                      onChange={(e) => setUser(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Erzählen Sie uns etwas über sich..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">{user.bio}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    {(user.preferences.showLocation && user.location) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {isEditing ? (
                          <Input
                            value={user.location}
                            onChange={(e) => setUser(prev => ({ ...prev, location: e.target.value }))}
                            className="h-auto py-1 px-2 text-sm"
                          />
                        ) : (
                          <span>{user.location}</span>
                        )}
                      </div>
                    )}
                    {(user.preferences.showEmail && user.email) && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {(user.preferences.showPhone && user.phone) && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="activity">Aktivität</TabsTrigger>
            <TabsTrigger value="badges">Auszeichnungen</TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Persönliche Informationen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Name</label>
                            <Input 
                              value={user.name}
                              onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">E-Mail</label>
                            <Input 
                              value={user.email}
                              onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Telefon</label>
                            <Input 
                              value={user.phone || ''}
                              onChange={(e) => setUser(prev => ({ ...prev, phone: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Standort</label>
                            <Input 
                              value={user.location || ''}
                              onChange={(e) => setUser(prev => ({ ...prev, location: e.target.value }))}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">E-Mail:</span>
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Telefon:</span>
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {user.location && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Standort:</span>
                            <span>{user.location}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Community Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">Level 7</div>
                        <div className="text-sm text-muted-foreground">Community Aktivist</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Fortschritt zu Level 8</span>
                          <span>680 / 1000 XP</span>
                        </div>
                        <Progress value={68} className="h-2" />
                      </div>
                      <div className="text-xs text-muted-foreground text-center">
                        Noch 320 XP bis zum nächsten Level
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mitgliedschaftsdetails</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Typ:</span>
                      <Badge variant={getMembershipBadgeVariant(user.membershipType)}>
                        {user.membershipType === 'supporting' ? 'Fördermitglied' :
                         user.membershipType === 'regular' ? 'Ordentlich' : 'Ehrenmitglied'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seit:</span>
                      <span>{user.memberSince}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="secondary">Aktiv</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Letzte Aktivitäten</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.recentActivity.map((activity, index) => (
                    <div key={activity.id}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.title}</p>
                          {activity.details && (
                            <p className="text-xs text-muted-foreground">{activity.details}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                      {index < user.recentActivity.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.badges.map(badge => (
                <Card key={badge.id}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{badge.icon}</div>
                    <h3 className="font-semibold mb-2">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                    <Badge variant="outline" className="text-xs">
                      Erhalten {badge.earnedAt}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Benachrichtigungen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">E-Mail Benachrichtigungen</label>
                      <p className="text-xs text-muted-foreground">Erhalten Sie wichtige Updates per E-Mail</p>
                    </div>
                    <Switch 
                      checked={user.preferences.emailNotifications}
                      onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Forum Digest</label>
                      <p className="text-xs text-muted-foreground">Wöchentliche Zusammenfassung der Forum-Aktivitäten</p>
                    </div>
                    <Switch 
                      checked={user.preferences.forumDigest}
                      onCheckedChange={(checked) => handlePreferenceChange('forumDigest', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Event Erinnerungen</label>
                      <p className="text-xs text-muted-foreground">Benachrichtigungen über bevorstehende Events</p>
                    </div>
                    <Switch 
                      checked={user.preferences.eventReminders}
                      onCheckedChange={(checked) => handlePreferenceChange('eventReminders', checked)}
                    />
                  </div>
                  
                  {user.role === 'moderator' || user.role === 'admin' ? (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">Moderations-Alerts</label>
                          <p className="text-xs text-muted-foreground">Benachrichtigungen über neue Meldungen</p>
                        </div>
                        <Switch 
                          checked={user.preferences.moderationAlerts}
                          onCheckedChange={(checked) => handlePreferenceChange('moderationAlerts', checked)}
                        />
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privatsphäre</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Profil Sichtbarkeit</label>
                    <select 
                      className="w-full p-2 border border-border rounded-md"
                      value={user.preferences.profileVisibility}
                      onChange={(e) => handlePreferenceChange('profileVisibility', e.target.value)}
                    >
                      <option value="public">Öffentlich</option>
                      <option value="members">Nur Mitglieder</option>
                      <option value="private">Privat</option>
                    </select>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">E-Mail anzeigen</label>
                      <p className="text-xs text-muted-foreground">E-Mail-Adresse im Profil sichtbar</p>
                    </div>
                    <Switch 
                      checked={user.preferences.showEmail}
                      onCheckedChange={(checked) => handlePreferenceChange('showEmail', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Telefon anzeigen</label>
                      <p className="text-xs text-muted-foreground">Telefonnummer im Profil sichtbar</p>
                    </div>
                    <Switch 
                      checked={user.preferences.showPhone}
                      onCheckedChange={(checked) => handlePreferenceChange('showPhone', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Standort anzeigen</label>
                      <p className="text-xs text-muted-foreground">Standort im Profil sichtbar</p>
                    </div>
                    <Switch 
                      checked={user.preferences.showLocation}
                      onCheckedChange={(checked) => handlePreferenceChange('showLocation', checked)}
                    />
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