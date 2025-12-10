'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import { Footer } from '@/components/footer';
import { 
  Bell, CheckCircle2, AlertCircle, Clock, Calendar, 
  Users, Zap, TrendingUp, Settings as SettingsIcon,
  Check, X, ArrowRight, Filter, Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Notification {
  id: string;
  type: 'sprint' | 'leave' | 'ticket' | 'capacity' | 'retrospective' | 'standup';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

export default function NotificationsPage() {
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (!storedEmail) {
      router.push('/');
    } else {
      setEmail(storedEmail);
      loadNotifications();
    }
  }, [router]);

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Mock data for demo
      setNotifications([
        {
          id: '1',
          type: 'sprint',
          title: 'Sprint Ending Soon',
          message: 'Sprint "Q4 Features" ends in 2 days. 8 story points remaining.',
          timestamp: '2h ago',
          read: false,
          priority: 'high',
          actionUrl: '/sprints/1',
        },
        {
          id: '2',
          type: 'capacity',
          title: 'Resource Overallocation Alert',
          message: 'John Doe is allocated at 120%. Consider rebalancing workload.',
          timestamp: '4h ago',
          read: false,
          priority: 'high',
          actionUrl: '/capacity',
        },
        {
          id: '3',
          type: 'leave',
          title: 'Leave Request Approved',
          message: 'Your leave request for Dec 25-27 has been approved.',
          timestamp: '6h ago',
          read: true,
          priority: 'medium',
          actionUrl: '/leave-management',
        },
        {
          id: '4',
          type: 'standup',
          title: 'Daily Standup Reminder',
          message: "Don't forget to log your daily standup update.",
          timestamp: '8h ago',
          read: false,
          priority: 'medium',
          actionUrl: '/sprints/1',
        },
        {
          id: '5',
          type: 'retrospective',
          title: 'Retrospective Action Item Due',
          message: 'Action item "Improve CI/CD pipeline" is due tomorrow.',
          timestamp: '1d ago',
          read: true,
          priority: 'medium',
          actionUrl: '/sprints/1',
        },
        {
          id: '6',
          type: 'ticket',
          title: 'New Ticket Assigned',
          message: 'PROJ-123: Implement user authentication has been assigned to you.',
          timestamp: '1d ago',
          read: true,
          priority: 'low',
          actionUrl: '/dashboard',
        },
        {
          id: '7',
          type: 'sprint',
          title: 'Sprint Planning Meeting',
          message: 'Sprint planning for "Q1 2026 Sprint 1" starts tomorrow at 10 AM.',
          timestamp: '2d ago',
          read: true,
          priority: 'medium',
        },
        {
          id: '8',
          type: 'capacity',
          title: 'Team Capacity Update',
          message: 'Team utilization has dropped to 65%. Review capacity allocation.',
          timestamp: '2d ago',
          read: true,
          priority: 'low',
          actionUrl: '/capacity',
        },
      ]);
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sprint': return <Zap className="h-5 w-5 text-purple-600" />;
      case 'leave': return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'ticket': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'capacity': return <Users className="h-5 w-5 text-orange-600" />;
      case 'retrospective': return <TrendingUp className="h-5 w-5 text-indigo-600" />;
      case 'standup': return <Clock className="h-5 w-5 text-teal-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge className="bg-red-100 text-red-700">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>;
      case 'low': return <Badge className="bg-gray-100 text-gray-700">Low</Badge>;
      default: return null;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'high') return n.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read).length;

  if (!email) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader email={email} onLogout={handleLogout} />

      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                <Bell className="h-7 w-7 text-blue-600" />
                Notifications
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                {highPriorityCount > 0 && (
                  <span className="text-red-600 font-medium ml-2">
                    • {highPriorityCount} high priority
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleMarkAllAsRead}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4" />
                Mark All Read
              </Button>
              <Button 
                onClick={() => router.push('/notifications/settings')}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="high">
                High Priority ({highPriorityCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`transition-all hover:shadow-md ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      !notification.read ? 'bg-white' : 'bg-gray-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm">
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </h3>
                        {getPriorityBadge(notification.priority)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {notification.actionUrl && (
                            <Button
                              onClick={() => router.push(notification.actionUrl!)}
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1"
                            >
                              View
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {!notification.read && (
                            <Button
                              onClick={() => handleMarkAsRead(notification.id)}
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1"
                            >
                              <Check className="h-3 w-3" />
                              Mark Read
                            </Button>
                          )}
                          
                          <Button
                            onClick={() => handleDelete(notification.id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredNotifications.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    {filter === 'all' 
                      ? "You're all caught up!"
                      : filter === 'unread'
                      ? 'No unread notifications'
                      : 'No high priority notifications'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Notification Settings Preview */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription className="text-xs">
                Configure what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Sprint Notifications</p>
                    <p className="text-xs text-muted-foreground">Deadlines, progress alerts</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Capacity Alerts</p>
                    <p className="text-xs text-muted-foreground">Overallocation warnings</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Leave Updates</p>
                    <p className="text-xs text-muted-foreground">Approvals, reminders</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-teal-600" />
                  <div>
                    <p className="text-sm font-medium">Daily Standup Reminders</p>
                    <p className="text-xs text-muted-foreground">Morning updates</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">Enabled</Badge>
              </div>

              <Button className="w-full gap-2 mt-4" variant="outline">
                <SettingsIcon className="h-4 w-4" />
                Manage All Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
