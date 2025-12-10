'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import { Footer } from '@/components/footer';
import { 
  TrendingUp, TrendingDown, BarChart3, Activity, Target,
  AlertTriangle, CheckCircle2, Zap, Users, Clock, Award,
  ArrowUpRight, ArrowDownRight, Minus, Rocket, Shield,
  ThumbsUp, AlertCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsData {
  velocityTrend: Array<{
    sprintName: string;
    committed: number;
    completed: number;
    completionRate: string;
  }>;
  teamPerformance: {
    throughput: number;
    avgCycleTime: number;
    avgLeadTime: number;
    workInProgress: number;
  };
  capacityUtilization: {
    total: number;
    allocated: number;
    available: number;
    utilizationRate: string;
  };
  projectHealth: Array<{
    projectId: string;
    projectName: string;
    teamSize: number;
    avgAllocation: number;
    completionRate: string;
    healthScore: number;
    status: 'healthy' | 'at-risk' | 'critical';
  }>;
  predictive: {
    avgVelocity: string;
    predictedVelocity: number;
    variance: string;
    trend: 'up' | 'down' | 'stable';
  };
  releaseBurnup: {
    totalScope: number;
    completed: number;
    remaining: number;
    percentComplete: string;
    sprintsData: Array<{
      sprint: string;
      cumulative: number;
    }>;
  };
  riskIndicators: {
    overallocatedResources: number;
    criticalProjects: number;
    lowVelocityTrend: boolean;
    highWIP: boolean;
  };
  executiveSummary: {
    totalProjects: number;
    activeProjects: number;
    teamUtilization: string;
    avgProjectHealth: string;
    completedTickets: number;
    avgThroughput: string;
  };
}

export default function AnalyticsPage() {
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

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?range=${timeRange}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    enabled: !!email,
  });

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'at-risk': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-100 text-green-700">Healthy</Badge>;
      case 'at-risk': return <Badge className="bg-yellow-100 text-yellow-700">At Risk</Badge>;
      case 'critical': return <Badge className="bg-red-100 text-red-700">Critical</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader email={email} onLogout={handleLogout} />

      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Advanced Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Predictive insights and executive-level metrics
            </p>
          </div>

          <Tabs defaultValue="executive" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="executive" className="text-xs sm:text-sm">Executive</TabsTrigger>
              <TabsTrigger value="velocity" className="text-xs sm:text-sm">Velocity</TabsTrigger>
              <TabsTrigger value="health" className="text-xs sm:text-sm">Health</TabsTrigger>
              <TabsTrigger value="risks" className="text-xs sm:text-sm">Risks</TabsTrigger>
            </TabsList>

            {/* Executive Summary Tab */}
            <TabsContent value="executive" className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 opacity-70" />
                      <ThumbsUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Active Projects</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {analytics?.executiveSummary.activeProjects || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        of {analytics?.executiveSummary.totalProjects || 0} total
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 opacity-70" />
                      <Activity className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Team Utilization</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {analytics?.executiveSummary.teamUtilization || 0}%
                      </p>
                      <Progress value={Number(analytics?.executiveSummary.teamUtilization || 0)} className="h-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 opacity-70" />
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Avg Project Health</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {analytics?.executiveSummary.avgProjectHealth || 0}
                      </p>
                      <p className="text-xs text-green-600">Healthy portfolio</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 opacity-70" />
                      <Zap className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Completed Tickets</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {analytics?.executiveSummary.completedTickets || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">This period</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 opacity-70" />
                      <TrendingUp className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Avg Throughput</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {analytics?.executiveSummary.avgThroughput || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Tickets/person</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600 opacity-70" />
                      {getTrendIcon(analytics?.predictive.trend || 'stable')}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">Predicted Velocity</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {analytics?.predictive.predictedVelocity || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Story points</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Release Burnup Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    Release Progress
                  </CardTitle>
                  <CardDescription>Cumulative work completed toward release goal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Scope</p>
                        <p className="text-2xl font-bold">{analytics?.releaseBurnup.totalScope || 0} pts</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-green-600">
                          {analytics?.releaseBurnup.completed || 0} pts
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {analytics?.releaseBurnup.remaining || 0} pts
                        </p>
                      </div>
                    </div>

                    <Progress value={Number(analytics?.releaseBurnup.percentComplete || 0)} className="h-3" />
                    
                    <div className="text-center">
                      <p className="text-lg font-semibold text-blue-600">
                        {analytics?.releaseBurnup.percentComplete || 0}% Complete
                      </p>
                    </div>

                    {/* Burnup Chart */}
                    {analytics?.releaseBurnup.sprintsData && analytics.releaseBurnup.sprintsData.length > 0 && (
                      <div className="mt-6 h-48 border rounded-lg bg-white p-4">
                        <svg className="w-full h-full" viewBox="0 0 600 200">
                          {/* Grid lines */}
                          {[0, 25, 50, 75, 100].map(y => (
                            <line
                              key={y}
                              x1="50"
                              y1={180 - y * 1.6}
                              x2="580"
                              y2={180 - y * 1.6}
                              stroke="#e5e7eb"
                              strokeWidth="1"
                            />
                          ))}
                          
                          {/* Scope line */}
                          <line
                            x1="50"
                            y1={20}
                            x2="580"
                            y2={20}
                            stroke="#6366f1"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                          />

                          {/* Burnup line */}
                          <polyline
                            points={analytics.releaseBurnup.sprintsData
                              .map((d, i) => {
                                const x = 50 + (i / (analytics.releaseBurnup.sprintsData.length - 1 || 1)) * 530;
                                const y = 180 - (d.cumulative / (analytics.releaseBurnup.totalScope || 1)) * 160;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                          />

                          {/* Data points */}
                          {analytics.releaseBurnup.sprintsData.map((d, i) => {
                            const x = 50 + (i / (analytics.releaseBurnup.sprintsData.length - 1 || 1)) * 530;
                            const y = 180 - (d.cumulative / (analytics.releaseBurnup.totalScope || 1)) * 160;
                            return (
                              <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="4"
                                fill="#10b981"
                              />
                            );
                          })}

                          {/* Labels */}
                          <text x="10" y="24" fontSize="10" fill="#6366f1">Scope</text>
                          <text x="10" y="184" fontSize="10" fill="#6b7280">0</text>
                        </svg>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Velocity Trends Tab */}
            <TabsContent value="velocity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Sprint Velocity Trends
                  </CardTitle>
                  <CardDescription>Historical and predictive velocity analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                      <p className="text-sm text-muted-foreground mb-1">Average Velocity</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {analytics?.predictive.avgVelocity || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Story points/sprint</p>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                      <p className="text-sm text-muted-foreground mb-1">Predicted Next Sprint</p>
                      <p className="text-3xl font-bold text-green-600">
                        {analytics?.predictive.predictedVelocity || 0}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {getTrendIcon(analytics?.predictive.trend || 'stable')}
                        <p className="text-xs text-muted-foreground capitalize">
                          {analytics?.predictive.trend || 'stable'} trend
                        </p>
                      </div>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                      <p className="text-sm text-muted-foreground mb-1">Variance</p>
                      <p className="text-3xl font-bold text-purple-600">
                        ±{analytics?.predictive.variance || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Story points</p>
                    </div>
                  </div>

                  {/* Velocity History Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">Sprint</th>
                          <th className="px-4 py-3 text-right font-medium">Committed</th>
                          <th className="px-4 py-3 text-right font-medium">Completed</th>
                          <th className="px-4 py-3 text-right font-medium">Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics?.velocityTrend.map((sprint, index) => (
                          <tr key={index} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{sprint.sprintName}</td>
                            <td className="px-4 py-3 text-right">{sprint.committed}</td>
                            <td className="px-4 py-3 text-right font-semibold text-green-600">
                              {sprint.completed}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Badge className={
                                Number(sprint.completionRate) >= 90 
                                  ? 'bg-green-100 text-green-700'
                                  : Number(sprint.completionRate) >= 70
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }>
                                {sprint.completionRate}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                        
                        {(!analytics?.velocityTrend || analytics.velocityTrend.length === 0) && (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                              No sprint data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Team Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Team Performance Metrics
                  </CardTitle>
                  <CardDescription>Throughput, cycle time, and flow efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-gray-50">
                      <Award className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{analytics?.teamPerformance.throughput || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Throughput</p>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-gray-50">
                      <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{analytics?.teamPerformance.avgCycleTime || 0}h</p>
                      <p className="text-xs text-muted-foreground mt-1">Avg Cycle Time</p>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-gray-50">
                      <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{analytics?.teamPerformance.avgLeadTime || 0}h</p>
                      <p className="text-xs text-muted-foreground mt-1">Avg Lead Time</p>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-gray-50">
                      <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{analytics?.teamPerformance.workInProgress || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Work In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Project Health Tab */}
            <TabsContent value="health" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics?.projectHealth.map((project) => (
                  <Card key={project.projectId} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getHealthIcon(project.status)}
                          <CardTitle className="text-base">{project.projectName}</CardTitle>
                        </div>
                        {getHealthBadge(project.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Health Score</span>
                        <span className="text-xl font-bold">{project.healthScore}/100</span>
                      </div>
                      <Progress value={project.healthScore} className="h-2" />

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t text-xs">
                        <div>
                          <p className="text-muted-foreground">Team Size</p>
                          <p className="font-semibold">{project.teamSize} members</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Allocation</p>
                          <p className="font-semibold">{project.avgAllocation.toFixed(0)}%</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Completion Rate</p>
                          <p className="font-semibold text-green-600">{project.completionRate}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!analytics?.projectHealth || analytics.projectHealth.length === 0) && (
                  <Card className="col-span-full">
                    <CardContent className="p-12 text-center">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Project Data</h3>
                      <p className="text-sm text-muted-foreground">
                        Project health metrics will appear here once projects are configured
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Risk Indicators Tab */}
            <TabsContent value="risks" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={analytics?.riskIndicators.overallocatedResources ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {analytics?.riskIndicators.overallocatedResources ? (
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        ) : (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        )}
                        <h3 className="font-semibold">Resource Allocation</h3>
                      </div>
                      <Badge className={
                        analytics?.riskIndicators.overallocatedResources 
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }>
                        {analytics?.riskIndicators.overallocatedResources ? 'At Risk' : 'Healthy'}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold mb-1">
                      {analytics?.riskIndicators.overallocatedResources || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Team members overallocated ({'>'}100%)
                    </p>
                  </CardContent>
                </Card>

                <Card className={analytics?.riskIndicators.criticalProjects ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {analytics?.riskIndicators.criticalProjects ? (
                          <AlertCircle className="h-6 w-6 text-red-600" />
                        ) : (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        )}
                        <h3 className="font-semibold">Project Health</h3>
                      </div>
                      <Badge className={
                        analytics?.riskIndicators.criticalProjects 
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }>
                        {analytics?.riskIndicators.criticalProjects ? 'Critical' : 'Healthy'}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold mb-1">
                      {analytics?.riskIndicators.criticalProjects || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Projects in critical status
                    </p>
                  </CardContent>
                </Card>

                <Card className={analytics?.riskIndicators.lowVelocityTrend ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {analytics?.riskIndicators.lowVelocityTrend ? (
                          <TrendingDown className="h-6 w-6 text-yellow-600" />
                        ) : (
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        )}
                        <h3 className="font-semibold">Velocity Trend</h3>
                      </div>
                      <Badge className={
                        analytics?.riskIndicators.lowVelocityTrend 
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }>
                        {analytics?.riskIndicators.lowVelocityTrend ? 'Declining' : 'Improving'}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold mb-1">
                      {analytics?.riskIndicators.lowVelocityTrend ? 'Down' : 'Up'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sprint velocity compared to previous sprint
                    </p>
                  </CardContent>
                </Card>

                <Card className={analytics?.riskIndicators.highWIP ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {analytics?.riskIndicators.highWIP ? (
                          <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        ) : (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        )}
                        <h3 className="font-semibold">Work In Progress</h3>
                      </div>
                      <Badge className={
                        analytics?.riskIndicators.highWIP 
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }>
                        {analytics?.riskIndicators.highWIP ? 'High' : 'Normal'}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold mb-1">
                      {analytics?.teamPerformance.workInProgress || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Active tickets (recommend limit: 2 per person)
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Risk Summary
                  </CardTitle>
                  <CardDescription>Overall risk assessment and recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics?.riskIndicators.overallocatedResources ? (
                    <div className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-700">Resource Overallocation Detected</p>
                        <p className="text-sm text-red-600 mt-1">
                          {analytics.riskIndicators.overallocatedResources} team member(s) are allocated over 100%. 
                          Review capacity dashboard and rebalance workload.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {analytics?.riskIndicators.criticalProjects ? (
                    <div className="flex gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-700">Critical Projects Identified</p>
                        <p className="text-sm text-red-600 mt-1">
                          {analytics.riskIndicators.criticalProjects} project(s) have low health scores. 
                          Review project health tab for details and take corrective action.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {analytics?.riskIndicators.lowVelocityTrend ? (
                    <div className="flex gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <TrendingDown className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-700">Declining Velocity Trend</p>
                        <p className="text-sm text-yellow-600 mt-1">
                          Sprint velocity is trending downward. Investigate team capacity, 
                          technical debt, or external dependencies affecting delivery.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {analytics?.riskIndicators.highWIP ? (
                    <div className="flex gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-yellow-700">High Work In Progress</p>
                        <p className="text-sm text-yellow-600 mt-1">
                          Too many concurrent tasks may reduce flow efficiency. 
                          Consider limiting WIP to improve throughput.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {!analytics?.riskIndicators.overallocatedResources && 
                   !analytics?.riskIndicators.criticalProjects &&
                   !analytics?.riskIndicators.lowVelocityTrend &&
                   !analytics?.riskIndicators.highWIP && (
                    <div className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-700">All Clear!</p>
                        <p className="text-sm text-green-600 mt-1">
                          No significant risks detected. Continue monitoring key metrics.
                        </p>
                      </div>
                    </div>
                  )}
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
