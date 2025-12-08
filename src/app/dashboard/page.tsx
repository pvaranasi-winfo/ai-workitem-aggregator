'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketCard } from '@/components/ticket-card';
import { AddIntegrationDialog } from '@/components/add-integration-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, Plus, Settings, LogOut, Search, 
  CheckCircle2, Clock, Target, Timer, BarChart3, 
  ExternalLink, TrendingUp, Calendar, Zap, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [email, setEmail] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (!storedEmail) {
      router.push('/');
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard', email],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard?email=${email}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      return response.json();
    },
    enabled: !!email,
  });

  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['tickets', email, selectedPlatform, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({ email });
      if (selectedPlatform !== 'all') params.append('platform', selectedPlatform);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/tickets?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tickets');
      return response.json();
    },
    enabled: !!email,
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tickets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sync tickets');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Tickets synced successfully');
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  const stats = dashboardData?.stats;
  const tickets = ticketsData?.tickets || [];

  // Calculate comprehensive metrics
  const platformStats = tickets.reduce((acc: any, ticket: any) => {
    const platform = ticket.platform;
    if (!acc[platform]) {
      acc[platform] = { count: 0, tickets: [], estimatedHours: 0, loggedHours: 0 };
    }
    acc[platform].count++;
    acc[platform].tickets.push(ticket);
    acc[platform].estimatedHours += ticket.estimatedHours || 0;
    acc[platform].loggedHours += ticket.loggedHours || 0;
    return acc;
  }, {});

  const totalEstimatedHours = tickets.reduce((sum: number, t: any) => sum + (t.estimatedHours || 0), 0);
  const totalLoggedHours = tickets.reduce((sum: number, t: any) => sum + (t.loggedHours || 0), 0);
  const totalRemainingHours = totalEstimatedHours - totalLoggedHours;

  // Sprint-wise analysis (dummy data - can be enhanced with real sprint data)
  const sprintData = [
    { 
      name: 'Sprint 23', 
      total: 120, 
      completed: 95, 
      remaining: 25, 
      tickets: 15, 
      completedTickets: 12,
      startDate: 'Nov 27, 2025',
      endDate: 'Dec 10, 2025'
    },
    { 
      name: 'Sprint 24', 
      total: 160, 
      completed: 80, 
      remaining: 80, 
      tickets: 20, 
      completedTickets: 10,
      startDate: 'Dec 11, 2025',
      endDate: 'Dec 24, 2025'
    },
  ];

  // Daily timesheet data (last 7 days) - dummy data
  const timesheetData = [
    { date: 'Dec 2', hours: 7.5, tickets: 3, platforms: { jira: 2, github: 1 } },
    { date: 'Dec 3', hours: 8.0, tickets: 4, platforms: { jira: 2, azure: 1, github: 1 } },
    { date: 'Dec 4', hours: 6.5, tickets: 2, platforms: { gitlab: 1, bitbucket: 1 } },
    { date: 'Dec 5', hours: 8.5, tickets: 5, platforms: { jira: 3, github: 2 } },
    { date: 'Dec 6', hours: 7.0, tickets: 3, platforms: { azure: 2, jira: 1 } },
    { date: 'Dec 7', hours: 5.5, tickets: 2, platforms: { github: 1, gitlab: 1 } },
    { date: 'Dec 8', hours: 4.0, tickets: 2, platforms: { jira: 1, bitbucket: 1 } },
  ];

  const weekTotalHours = timesheetData.reduce((sum, d) => sum + d.hours, 0);
  const weekTotalTickets = timesheetData.reduce((sum, d) => sum + d.tickets, 0);

  const platforms = ['all', 'jira', 'github', 'gitlab', 'azure-devops', 'bitbucket'];

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ticket Aggregator Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                Sync
              </Button>
              <Link href="/timesheet">
                <Button variant="outline" size="sm" className="gap-2">
                  <Timer className="h-4 w-4" />
                  Timesheet
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add
              </Button>
              <Link href="/integrations">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Comprehensive Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                Total Assigned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {dashboardLoading ? '-' : stats?.totalTickets || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Across all platforms</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {dashboardLoading ? '-' : stats?.ticketsByStatus?.inProgress || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {totalLoggedHours.toFixed(1)}h logged
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {dashboardLoading ? '-' : stats?.ticketsByStatus?.completed || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.totalTickets > 0 
                  ? Math.round((stats?.ticketsByStatus?.completed / stats?.totalTickets) * 100)
                  : 0}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Timer className="h-4 w-4 text-purple-600" />
                Remaining Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {totalRemainingHours.toFixed(1)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                of {totalEstimatedHours.toFixed(1)}h estimated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto bg-white">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sources">By Source</TabsTrigger>
            <TabsTrigger value="sprints">Sprints</TabsTrigger>
            <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Time Tracking Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Time Allocation
                  </CardTitle>
                  <CardDescription>Overall project time breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Estimated</span>
                      <span className="font-semibold">{totalEstimatedHours.toFixed(1)}h</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hours Worked</span>
                      <span className="font-semibold text-green-600">{totalLoggedHours.toFixed(1)}h</span>
                    </div>
                    <Progress 
                      value={totalEstimatedHours > 0 ? (totalLoggedHours / totalEstimatedHours) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining</span>
                      <span className="font-semibold text-amber-600">{totalRemainingHours.toFixed(1)}h</span>
                    </div>
                    <Progress 
                      value={totalEstimatedHours > 0 ? (totalRemainingHours / totalEstimatedHours) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <Badge variant="outline" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {totalEstimatedHours > 0 ? ((totalLoggedHours / totalEstimatedHours) * 100).toFixed(0) : 0}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    Weekly Activity
                  </CardTitle>
                  <CardDescription>Last 7 days timesheet summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {timesheetData.map((day, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-16 text-sm font-medium text-gray-600">{day.date}</div>
                        <div className="flex-1">
                          <Progress value={(day.hours / 8) * 100} className="h-2" />
                        </div>
                        <div className="text-sm font-semibold text-gray-900 w-12">{day.hours}h</div>
                        <div className="text-xs text-gray-500 w-16">{day.tickets} tickets</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Week Total</div>
                      <div className="text-xl font-bold">{weekTotalHours.toFixed(1)}h</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Avg/Day</div>
                      <div className="text-xl font-bold">{(weekTotalHours / 7).toFixed(1)}h</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {platforms.map((platform) => (
                      <Button
                        key={platform}
                        variant={selectedPlatform === platform ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedPlatform(platform)}
                        className="capitalize"
                      >
                        {platform === 'all' ? 'All' : platform.replace('-', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets List */}
            {ticketsLoading || dashboardLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
                  <p className="text-gray-600 mb-6">Get started by adding an integration</p>
                  <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Integration
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tickets.map((ticket: any) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* By Source Tab */}
          <TabsContent value="sources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(platformStats).length > 0 ? (
                Object.entries(platformStats).map(([platform, data]: [string, any]) => (
                  <Card key={platform} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="capitalize flex items-center gap-2">
                          {platform === 'jira' && '🔷'}
                          {platform === 'github' && '🐙'}
                          {platform === 'gitlab' && '🦊'}
                          {platform === 'azure-devops' && '☁️'}
                          {platform === 'bitbucket' && '🪣'}
                          {platform.replace('-', ' ')}
                        </CardTitle>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {data.count}
                        </Badge>
                      </div>
                      <CardDescription>
                        {data.count} ticket{data.count !== 1 ? 's' : ''} • {data.estimatedHours.toFixed(1)}h estimated
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <Progress 
                          value={data.estimatedHours > 0 ? (data.loggedHours / data.estimatedHours) * 100 : 0} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold">
                            {data.loggedHours.toFixed(1)}h / {data.estimatedHours.toFixed(1)}h
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {data.tickets.map((ticket: any) => (
                          <div 
                            key={ticket.id} 
                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {ticket.title}
                                </span>
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  {ticket.ticketId}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                  {ticket.status}
                                </Badge>
                                <span className="text-xs text-blue-600 font-medium">
                                  {ticket.estimatedHours || 0}h est.
                                </span>
                                <span className="text-xs text-green-600 font-medium">
                                  {ticket.loggedHours || 0}h logged
                                </span>
                              </div>
                            </div>
                            {ticket.url && (
                              <a 
                                href={ticket.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0"
                                title="Open ticket"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-gray-200">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tickets from any platform yet</h3>
                  <p className="text-gray-600 mb-6">Connect your first integration to see tickets here</p>
                  <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Integration
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Sprints Tab */}
          <TabsContent value="sprints" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {sprintData.map((sprint, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-indigo-600" />
                          {sprint.name}
                        </CardTitle>
                        <CardDescription>
                          {sprint.startDate} - {sprint.endDate} • {sprint.completedTickets} of {sprint.tickets} tickets completed
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={sprint.remaining > sprint.total / 2 ? "destructive" : "default"}
                        className="text-lg px-4 py-1"
                      >
                        {sprint.remaining}h remaining
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 p-4 rounded-lg bg-gray-50">
                        <div className="text-sm text-gray-600">Total Estimated</div>
                        <div className="text-2xl font-bold text-gray-900">{sprint.total}h</div>
                        <Progress value={100} className="h-2" />
                      </div>
                      <div className="space-y-2 p-4 rounded-lg bg-green-50">
                        <div className="text-sm text-gray-600">Hours Worked</div>
                        <div className="text-2xl font-bold text-green-600">{sprint.completed}h</div>
                        <Progress 
                          value={(sprint.completed / sprint.total) * 100} 
                          className="h-2"
                        />
                      </div>
                      <div className="space-y-2 p-4 rounded-lg bg-amber-50">
                        <div className="text-sm text-gray-600">Remaining</div>
                        <div className="text-2xl font-bold text-amber-600">{sprint.remaining}h</div>
                        <Progress 
                          value={(sprint.remaining / sprint.total) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Velocity</div>
                        <Badge variant="outline" className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {((sprint.completed / sprint.total) * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Avg per Ticket</div>
                        <div className="text-sm font-semibold">
                          {(sprint.total / sprint.tickets).toFixed(1)}h
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Days Remaining</div>
                        <div className="text-sm font-semibold">
                          {idx === 0 ? '2 days' : '16 days'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Burn Rate</div>
                        <div className="text-sm font-semibold">
                          {(sprint.completed / 14).toFixed(1)}h/day
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Timesheet Tab */}
          <TabsContent value="timesheet" className="space-y-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-purple-600" />
                  Daily Timesheet Tracker
                </CardTitle>
                <CardDescription>
                  Track your daily hours and productivity metrics for better time management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Weekly Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Total Hours (7 days)</div>
                      <div className="text-3xl font-bold text-purple-900">
                        {weekTotalHours.toFixed(1)}h
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Daily Average</div>
                      <div className="text-3xl font-bold text-purple-900">
                        {(weekTotalHours / 7).toFixed(1)}h
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Tickets Worked</div>
                      <div className="text-3xl font-bold text-purple-900">
                        {weekTotalTickets}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Avg per Ticket</div>
                      <div className="text-3xl font-bold text-purple-900">
                        {(weekTotalHours / weekTotalTickets).toFixed(1)}h
                      </div>
                    </div>
                  </div>

                  {/* Daily Breakdown */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Daily Breakdown
                    </h3>
                    {timesheetData.map((day, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all"
                      >
                        <div className="w-20">
                          <div className="text-sm font-semibold text-gray-900">{day.date}</div>
                          <div className="text-xs text-gray-500">2025</div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Time logged</span>
                            <span className="font-semibold">{day.hours} hours</span>
                          </div>
                          <Progress value={(day.hours / 8) * 100} className="h-2" />
                        </div>
                        <div className="text-right min-w-[60px]">
                          <div className="text-sm font-semibold text-gray-900">{day.tickets}</div>
                          <div className="text-xs text-gray-500">tickets</div>
                        </div>
                        <div className="text-right min-w-[60px]">
                          <div className="text-sm font-semibold text-purple-600">
                            {(day.hours / day.tickets).toFixed(1)}h
                          </div>
                          <div className="text-xs text-gray-500">avg/ticket</div>
                        </div>
                        <div className="flex gap-1">
                          {Object.entries(day.platforms).map(([platform, count]) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}: {count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Productivity Metrics */}
                  <div className="pt-6 border-t">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Productivity Metrics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">Avg Hours per Ticket</span>
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {(weekTotalHours / weekTotalTickets).toFixed(1)}h
                        </div>
                        <p className="text-xs text-blue-700 mt-1">Week average</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-900">Most Productive Day</span>
                          <Zap className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                          {timesheetData.reduce((max, d) => d.hours > max.hours ? d : max).date}
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                          {timesheetData.reduce((max, d) => d.hours > max.hours ? d : max).hours}h logged
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-purple-900">Efficiency Score</span>
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                          {((weekTotalHours / 56) * 100).toFixed(0)}%
                        </div>
                        <p className="text-xs text-purple-700 mt-1">Of 56h standard week</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddIntegrationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          toast.success('Integration added successfully');
        }}
        userEmail={email}
      />
    </div>
  );
}
