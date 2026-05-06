import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  FileText, 
  Settings, 
  Database,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  CreditCard,
  MessageSquare,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { MemberManagement } from './MemberManagement';
import { DonationManagement } from './DonationManagement';
import { EventManagement } from './EventManagement';
import { NewsManagement } from './NewsManagement';
import { AdminSettings } from './AdminSettings';
import { CivicrmIntegration } from './CivicrmIntegration';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with real data from your CiviCRM integration
  const dashboardStats = {
    totalMembers: 1247,
    newMembersThisMonth: 89,
    totalDonations: 125680,
    donationsThisMonth: 8945,
    upcomingEvents: 12,
    activeThreads: 34,
    pendingModerations: 5,
    sepaTransactions: 156
  };

  const recentActivities = [
    { id: 1, type: 'member', message: 'Neue Mitgliedschaft: Maria Huber', time: '2 Std. her', priority: 'normal' },
    { id: 2, type: 'donation', message: 'SEPA-Spende €150 eingegangen', time: '3 Std. her', priority: 'high' },
    { id: 3, type: 'event', message: 'Event "Soziale Gerechtigkeit Forum" erstellt', time: '5 Std. her', priority: 'normal' },
    { id: 4, type: 'moderation', message: 'Forum-Beitrag zur Moderation markiert', time: '1 Tag her', priority: 'urgent' },
    { id: 5, type: 'member', message: 'Premium-Mitgliedschaft verlängert: Johann Weber', time: '1 Tag her', priority: 'normal' }
  ];

  const membershipBreakdown = [
    { type: 'Standard', count: 892, percentage: 71.5, color: 'bg-blue-500' },
    { type: 'Premium', count: 267, percentage: 21.4, color: 'bg-orange-500' },
    { type: 'Student', count: 88, percentage: 7.1, color: 'bg-green-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              CiviCRM Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Verwaltung für Menschlichkeit Österreich
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Mitglieder
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Spenden
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Einstellungen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Gesamte Mitglieder</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalMembers.toLocaleString()}</p>
                      <p className="text-sm text-green-600 mt-1">+{dashboardStats.newMembersThisMonth} diesen Monat</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Gesamte Spenden</p>
                      <p className="text-2xl font-bold text-gray-900">€{dashboardStats.totalDonations.toLocaleString()}</p>
                      <p className="text-sm text-green-600 mt-1">+€{dashboardStats.donationsThisMonth.toLocaleString()} diesen Monat</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Kommende Events</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardStats.upcomingEvents}</p>
                      <p className="text-sm text-blue-600 mt-1">Nächste 30 Tage</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">SEPA Transaktionen</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardStats.sepaTransactions}</p>
                      <p className="text-sm text-orange-600 mt-1">Diesen Monat</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                      <CreditCard className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Main Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Membership Breakdown */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Mitgliedschaftsverteilung</h3>
                    <PieChart className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {membershipBreakdown.map((membership, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${membership.color}`}></div>
                          <span className="text-sm font-medium">{membership.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{membership.count}</span>
                          <Badge variant="secondary">{membership.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recent Activities */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Aktuelle Aktivitäten</h3>
                    <Activity className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="flex-shrink-0 mt-1">
                          {activity.type === 'member' && <UserPlus className="h-4 w-4 text-blue-500" />}
                          {activity.type === 'donation' && <DollarSign className="h-4 w-4 text-green-500" />}
                          {activity.type === 'event' && <Calendar className="h-4 w-4 text-purple-500" />}
                          {activity.type === 'moderation' && <MessageSquare className="h-4 w-4 text-orange-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                        {activity.priority === 'urgent' && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Dringend
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Alle Aktivitäten anzeigen
                  </Button>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Schnellaktionen</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <Button className="flex flex-col items-center gap-2 h-auto py-4">
                    <UserPlus className="h-5 w-5" />
                    <span className="text-sm">Neues Mitglied</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm">Event erstellen</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">News veröffentlichen</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm">Spende erfassen</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                    <Database className="h-5 w-5" />
                    <span className="text-sm">CiviCRM Sync</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm">Berichte</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="members">
            <MemberManagement />
          </TabsContent>

          <TabsContent value="donations">
            <DonationManagement />
          </TabsContent>

          <TabsContent value="events">
            <EventManagement />
          </TabsContent>

          <TabsContent value="news">
            <NewsManagement />
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AdminSettings />
              <CivicrmIntegration />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminDashboard;