'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppHeader } from '@/components/app-header';
import { Footer } from '@/components/footer';
import { 
  TrendingUp, TrendingDown, Users, Clock, CheckCircle2, 
  AlertCircle, Target, BarChart3, Activity, Calendar,
  Award, Zap, Timer, Building2, PieChart, ArrowUpRight,
  ArrowDownRight, Minus
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface KPIData {
  team: {
    totalUsers: number;
    dedicatedResources: number;
    sharedResources: number;
    unassigned: number;
    utilizationRate: number;
    avgHoursPerUser: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    onTrack: number;
    atRisk: number;
    avgCapacity: number;
  };
  tickets: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    completionRate: number;
    avgResolutionTime: number;
  };
  time: {
    totalHours: number;
    billableHours: number;
    estimatedHours: number;
    loggedHours: number;
    efficiency: number;
    variance: number;
  };
  velocity: {
    currentSprint: number;
    avgVelocity: number;
    trend: 'up' | 'down' | 'stable';
    storyPointsCompleted: number;
  };
  quality: {
    bugCount: number;
    criticalBugs: number;
    avgTimeToFix: number;
    reopenRate: number;
  };
  leave: {
    totalDays: number;
    pendingRequests: number;
    approvedThisMonth: number;
    upcomingLeaves: number;
  };
}

export default function KPIDashboardPage() {
  const [email, setEmail] = useState('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (!storedEmail) {
      router.push('/');
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const { data: kpiData, isLoading } = useQuery<KPIData>({
    queryKey: ['kpi-dashboard', timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/kpi-dashboard?range=${timeRange}`);
      if (!res.ok) throw new Error('Failed to fetch KPI data');
      return res.json();
    },
    enabled: !!email,
  });

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  if (!email) return null;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (value: number, threshold: number = 0) => {
    if (value > threshold) return 'text-green-600';
    if (value < threshold) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader email={email} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4">Overview</TabsTrigger>
            <TabsTrigger value="team" className="text-xs sm:text-sm px-2 sm:px-4">Team</TabsTrigger>
            <TabsTrigger value="delivery" className="text-xs sm:text-sm px-2 sm:px-4">Delivery</TabsTrigger>
            <TabsTrigger value="quality" className="text-xs sm:text-sm px-2 sm:px-4">Quality</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 opacity-70" />
                    {getTrendIcon(kpiData?.velocity?.trend || 'stable')}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Team Size</p>
                    <p className="text-xl sm:text-2xl font-bold">{kpiData?.team?.totalUsers || 0}</p>
                    <p className="text-xs text-green-600">
                      {kpiData?.team?.utilizationRate || 0}% utilized
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 opacity-70" />
                    <Target className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Active Projects</p>
                    <p className="text-xl sm:text-2xl font-bold">{kpiData?.projects?.active || 0}</p>
                    <p className="text-xs text-muted-foreground">
                      of {kpiData?.projects?.total || 0} total
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 opacity-70" />
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {kpiData?.tickets?.completionRate || 0}%
                    </p>
                    <p className="text-xs text-green-600">
                      {kpiData?.tickets?.completed || 0} completed
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 opacity-70" />
                    <Activity className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Time Efficiency</p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {kpiData?.time?.efficiency || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {kpiData?.time?.loggedHours || 0}h logged
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Team Utilization */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Utilization
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Resource allocation breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
                        <span className="text-muted-foreground">Dedicated Resources</span>
                        <span className="font-semibold">{kpiData?.team?.dedicatedResources || 0}</span>
                      </div>
                      <Progress 
                        value={(kpiData?.team?.dedicatedResources || 0) / (kpiData?.team?.totalUsers || 1) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
                        <span className="text-muted-foreground">Shared Resources</span>
                        <span className="font-semibold">{kpiData?.team?.sharedResources || 0}</span>
                      </div>
                      <Progress 
                        value={(kpiData?.team?.sharedResources || 0) / (kpiData?.team?.totalUsers || 1) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
                        <span className="text-muted-foreground">Unassigned</span>
                        <span className="font-semibold">{kpiData?.team?.unassigned || 0}</span>
                      </div>
                      <Progress 
                        value={(kpiData?.team?.unassigned || 0) / (kpiData?.team?.totalUsers || 1) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Avg Hours/User</span>
                      <span className="font-bold text-blue-600">{kpiData?.team?.avgHoursPerUser || 0}h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Health */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Project Health
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Status distribution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-lg sm:text-2xl font-bold text-green-600">
                        {kpiData?.projects?.onTrack || 0}
                      </p>
                      <p className="text-xs text-green-700">On Track</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-lg sm:text-2xl font-bold text-red-600">
                        {kpiData?.projects?.atRisk || 0}
                      </p>
                      <p className="text-xs text-red-700">At Risk</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-lg sm:text-2xl font-bold text-blue-600">
                        {kpiData?.projects?.active || 0}
                      </p>
                      <p className="text-xs text-blue-700">Active</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <p className="text-lg sm:text-2xl font-bold text-purple-600">
                        {kpiData?.projects?.completed || 0}
                      </p>
                      <p className="text-xs text-purple-700">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Velocity & Time Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Sprint Velocity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Sprint</span>
                      <span className="text-xl font-bold text-blue-600">
                        {kpiData?.velocity?.currentSprint || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average</span>
                      <span className="text-lg font-semibold">
                        {kpiData?.velocity?.avgVelocity || 0}
                      </span>
                    </div>
                    <Progress 
                      value={(kpiData?.velocity?.currentSprint || 0) / (kpiData?.velocity?.avgVelocity || 1) * 100} 
                      className="h-2"
                    />
                    <div className="flex items-center gap-2 text-xs">
                      {getTrendIcon(kpiData?.velocity?.trend || 'stable')}
                      <span className="text-muted-foreground">Story Points</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Time Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estimated</span>
                      <span className="font-semibold">{kpiData?.time?.estimatedHours || 0}h</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Logged</span>
                      <span className="font-semibold text-blue-600">{kpiData?.time?.loggedHours || 0}h</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Variance</span>
                      <span className={`font-semibold ${getTrendColor((kpiData?.time?.variance ?? 0))}`}>
                        {(kpiData?.time?.variance ?? 0) > 0 ? '+' : ''}{kpiData?.time?.variance ?? 0}h
                      </span>
                    </div>
                    <Progress value={kpiData?.time?.efficiency || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Leave Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pending Requests</span>
                      <span className="font-semibold text-yellow-600">
                        {kpiData?.leave?.pendingRequests || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Upcoming Leaves</span>
                      <span className="font-semibold text-orange-600">
                        {kpiData?.leave?.upcomingLeaves || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Days</span>
                      <span className="font-semibold">{kpiData?.leave?.totalDays || 0}d</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{kpiData?.team?.totalUsers || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Active team members</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-600">Dedicated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{kpiData?.team?.dedicatedResources || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Single project focus</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-blue-600">Shared</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{kpiData?.team?.sharedResources || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Multi-project allocation</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Unassigned</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-600">{kpiData?.team?.unassigned || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Available resources</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Team Performance Metrics</CardTitle>
                <CardDescription>Productivity and utilization insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Utilization Rate</span>
                      <span className="text-xl font-bold text-blue-600">
                        {kpiData?.team?.utilizationRate || 0}%
                      </span>
                    </div>
                    <Progress value={kpiData?.team?.utilizationRate || 0} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">Team capacity being used</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Avg Hours per User</span>
                      <span className="text-xl font-bold text-purple-600">
                        {kpiData?.team?.avgHoursPerUser || 0}h
                      </span>
                    </div>
                    <Progress value={(kpiData?.team?.avgHoursPerUser || 0) / 40 * 100} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">Average weekly hours logged</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delivery Tab */}
          <TabsContent value="delivery" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{kpiData?.tickets?.total || 0}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {kpiData?.tickets?.completionRate || 0}% complete
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-600">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{kpiData?.tickets?.completed || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-blue-600">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{kpiData?.tickets?.inProgress || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Currently active</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">To Do</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-600">{kpiData?.tickets?.todo || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Backlog items</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Metrics</CardTitle>
                <CardDescription>Throughput and cycle time analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-700">
                      {kpiData?.tickets?.completionRate || 0}%
                    </p>
                    <p className="text-sm text-green-600 mt-1">Completion Rate</p>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <Timer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-700">
                      {kpiData?.tickets?.avgResolutionTime || 0}h
                    </p>
                    <p className="text-sm text-blue-600 mt-1">Avg Resolution Time</p>
                  </div>
                  
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-700">
                      {kpiData?.velocity?.currentSprint || 0}
                    </p>
                    <p className="text-sm text-purple-600 mt-1">Sprint Velocity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value="quality" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Bugs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{kpiData?.quality?.bugCount || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Open issues</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-red-600">Critical</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">{kpiData?.quality?.criticalBugs || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">High priority</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Avg Fix Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{kpiData?.quality?.avgTimeToFix || 0}h</p>
                  <p className="text-xs text-muted-foreground mt-1">Resolution speed</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Reopen Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{kpiData?.quality?.reopenRate || 0}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Quality indicator</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quality Indicators</CardTitle>
                <CardDescription>Code quality and defect metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Defect Density</span>
                      <span className="text-sm font-semibold">
                        {((kpiData?.quality?.bugCount || 0) / (kpiData?.tickets?.total || 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(kpiData?.quality?.bugCount || 0) / (kpiData?.tickets?.total || 1) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Critical Bug Ratio</span>
                      <span className="text-sm font-semibold text-red-600">
                        {((kpiData?.quality?.criticalBugs || 0) / (kpiData?.quality?.bugCount || 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(kpiData?.quality?.criticalBugs || 0) / (kpiData?.quality?.bugCount || 1) * 100} 
                      className="h-2 bg-red-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>

      <Footer />
    </div>
  );
}
