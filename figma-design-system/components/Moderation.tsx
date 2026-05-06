import { useState } from 'react';
import { Shield, Flag, Trash2, Lock, Unlock, Pin, PinOff, Eye, EyeOff, AlertTriangle, CheckCircle, XCircle, Clock, User, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';

interface Report {
  id: string;
  type: 'thread' | 'reply';
  contentId: string;
  contentTitle: string;
  contentExcerpt: string;
  reportedBy: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'offtopic' | 'other';
  details: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: string;
  assignedTo?: string;
}

interface ModerationAction {
  id: string;
  action: 'lock' | 'unlock' | 'pin' | 'unpin' | 'delete' | 'restore' | 'warn' | 'ban';
  contentId: string;
  contentTitle: string;
  moderator: string;
  reason: string;
  timestamp: string;
  targetUser?: string;
}

const mockReports: Report[] = [
  {
    id: '1',
    type: 'thread',
    contentId: 'thread-1',
    contentTitle: 'Inappropriate discussion about politics',
    contentExcerpt: 'This thread contains inflammatory political content...',
    reportedBy: 'Anna Weber',
    reason: 'inappropriate',
    details: 'Der Thread enthält beleidigende Sprache und politische Hetze.',
    status: 'pending',
    createdAt: 'vor 2 Stunden'
  },
  {
    id: '2',
    type: 'reply',
    contentId: 'reply-5',
    contentTitle: 'Spam comment with external links',
    contentExcerpt: 'Check out this amazing website for...',
    reportedBy: 'Marcus Klein',
    reason: 'spam',
    details: 'Enthält verdächtige externe Links und wirbt für kommerzielle Dienste.',
    status: 'reviewing',
    createdAt: 'vor 4 Stunden',
    assignedTo: 'Moderator Team'
  },
  {
    id: '3',
    type: 'reply',
    contentId: 'reply-12',
    contentTitle: 'Off-topic discussion about vacation',
    contentExcerpt: 'Speaking of vacation, I went to Italy last summer...',
    reportedBy: 'Sarah Fischer',
    reason: 'offtopic',
    details: 'Hat nichts mit dem ursprünglichen Thema zu tun.',
    status: 'resolved',
    createdAt: 'vor 1 Tag'
  }
];

const mockActions: ModerationAction[] = [
  {
    id: '1',
    action: 'lock',
    contentId: 'thread-3',
    contentTitle: 'Heated discussion about funding allocation',
    moderator: 'Admin',
    reason: 'Diskussion ist zu hitzig geworden, temporäre Sperrung zum Abkühlen.',
    timestamp: 'vor 1 Stunde'
  },
  {
    id: '2',
    action: 'delete',
    contentId: 'reply-8',
    contentTitle: 'Spam comment removed',
    moderator: 'Moderator A',
    reason: 'Spam-Inhalt entfernt.',
    timestamp: 'vor 3 Stunden'
  },
  {
    id: '3',
    action: 'warn',
    contentId: 'thread-5',
    contentTitle: 'Warning issued to user',
    moderator: 'Moderator B',
    reason: 'Benutzer verwarnt wegen unangemessener Sprache.',
    timestamp: 'vor 5 Stunden',
    targetUser: 'ProblemUser123'
  }
];

export function Moderation() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionReason, setActionReason] = useState('');

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'reviewing': return 'default';
      case 'resolved': return 'secondary';
      case 'dismissed': return 'outline';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      case 'reviewing': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'dismissed': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getActionIcon = (action: ModerationAction['action']) => {
    switch (action) {
      case 'lock': return <Lock className="w-4 h-4" />;
      case 'unlock': return <Unlock className="w-4 h-4" />;
      case 'pin': return <Pin className="w-4 h-4" />;
      case 'unpin': return <PinOff className="w-4 h-4" />;
      case 'delete': return <Trash2 className="w-4 h-4" />;
      case 'restore': return <Eye className="w-4 h-4" />;
      case 'warn': return <AlertTriangle className="w-4 h-4" />;
      case 'ban': return <Shield className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const ReportCard = ({ report }: { report: Report }) => (
    <Card className="cursor-pointer hover:shadow-md transition-all duration-200" onClick={() => setSelectedReport(report)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={report.type === 'thread' ? 'default' : 'secondary'} className="text-xs">
                {report.type === 'thread' ? 'Thread' : 'Antwort'}
              </Badge>
              <Badge variant={getStatusColor(report.status)} className="text-xs">
                {getStatusIcon(report.status)}
                <span className="ml-1 capitalize">{report.status}</span>
              </Badge>
            </div>
            <h3 className="font-semibold text-sm mb-1">{report.contentTitle}</h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{report.contentExcerpt}</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Grund: <span className="font-medium capitalize">{report.reason}</span></span>
            <span>{report.createdAt}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Gemeldet von: <span className="font-medium">{report.reportedBy}</span></span>
            {report.assignedTo && (
              <span>Zugewiesen an: <span className="font-medium">{report.assignedTo}</span></span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ActionCard = ({ action }: { action: ModerationAction }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            {getActionIcon(action.action)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm capitalize">{action.action}</span>
              <span className="text-xs text-muted-foreground">von {action.moderator}</span>
              <span className="text-xs text-muted-foreground">{action.timestamp}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{action.contentTitle}</p>
            {action.targetUser && (
              <div className="flex items-center gap-1 mb-2">
                <User className="w-3 h-3" />
                <span className="text-xs">Benutzer: {action.targetUser}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">{action.reason}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section id="moderation" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">Moderation Dashboard</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Überwachen und verwalten Sie Community-Inhalte, bearbeiten Sie Meldungen 
            und sorgen Sie für eine respektvolle Diskussionskultur.
          </p>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Meldungen
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Aktionen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Aktuelle Meldungen</h3>
              <Badge variant="destructive">
                {mockReports.filter(r => r.status === 'pending').length} offen
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockReports.map(report => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>

            {mockReports.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Keine offenen Meldungen</h3>
                  <p className="text-muted-foreground">
                    Großartig! Momentan gibt es keine Meldungen zu bearbeiten.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Moderationsaktivitäten</h3>
              <Badge variant="outline">
                {mockActions.length} Aktionen heute
              </Badge>
            </div>

            <div className="space-y-4">
              {mockActions.map(action => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Report Detail Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Meldung bearbeiten
              </DialogTitle>
            </DialogHeader>
            
            {selectedReport && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedReport.type === 'thread' ? 'default' : 'secondary'}>
                      {selectedReport.type === 'thread' ? 'Thread' : 'Antwort'}
                    </Badge>
                    <Badge variant={getStatusColor(selectedReport.status)}>
                      {getStatusIcon(selectedReport.status)}
                      <span className="ml-1 capitalize">{selectedReport.status}</span>
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">{selectedReport.contentTitle}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{selectedReport.contentExcerpt}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Gemeldet von:</span>
                      <p className="font-medium">{selectedReport.reportedBy}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Grund:</span>
                      <p className="font-medium capitalize">{selectedReport.reason}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gemeldet:</span>
                      <p className="font-medium">{selectedReport.createdAt}</p>
                    </div>
                    {selectedReport.assignedTo && (
                      <div>
                        <span className="text-muted-foreground">Zugewiesen an:</span>
                        <p className="font-medium">{selectedReport.assignedTo}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">Details:</span>
                    <p className="mt-1 p-3 bg-muted rounded-md text-sm">{selectedReport.details}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Moderationsaktion</h4>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Inhalt anzeigen
                    </Button>
                    <Button variant="outline" size="sm">
                      <Lock className="w-4 h-4 mr-1" />
                      Sperren
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Löschen
                    </Button>
                    <Button variant="outline" size="sm">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Warnung
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Begründung (erforderlich)</label>
                    <Textarea
                      placeholder="Begründen Sie Ihre Moderationsentscheidung..."
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      Alle Moderationsaktionen werden protokolliert und sind für andere Moderatoren einsehbar.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelectedReport(null)}>
                      Abbrechen
                    </Button>
                    <Button variant="outline">
                      <XCircle className="w-4 h-4 mr-1" />
                      Meldung abweisen
                    </Button>
                    <Button>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aktion ausführen
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}