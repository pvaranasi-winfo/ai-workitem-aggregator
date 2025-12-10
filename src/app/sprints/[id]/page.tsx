'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Footer } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  Calendar,
  Target,
  Users,
  BarChart3,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  User
} from 'lucide-react';

interface Sprint {
  id: string;
  name: string;
  goal: string | null;
  startDate: string;
  endDate: string;
  status: string;
  velocity: number | null;
  capacity: number | null;
  commitment: number | null;
  project: {
    id: number;
    title: string;
  };
  sprintTickets: Array<{
    id: string;
    ticketId: string;
    storyPoints: number | null;
    status: string;
    ticket: {
      id: string;
      title: string;
      status: string;
      priority: string;
    };
  }>;
  retrospectives: Array<{
    id: string;
    type: string;
    content: string;
    votes: number;
    status: string | null;
    assignee: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  }>;
  dailyStandups: Array<{
    id: string;
    date: string;
    yesterday: string | null;
    today: string | null;
    blockers: string | null;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
}

export default function SprintDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sprintId = params.id as string;
  
  const [email, setEmail] = useState<string>('');
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/');
      return;
    }
    setEmail(userEmail);
    fetchSprint();
  }, [sprintId, router]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  const fetchSprint = async () => {
    try {
      const response = await fetch(`/api/sprints/${sprintId}`);
      const data = await response.json();
      setSprint(data);
    } catch (error) {
      console.error('Error fetching sprint:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'InProgress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Todo':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'InProgress':
        return <AlertCircle className="w-4 h-4" />;
      case 'Todo':
        return <Circle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const calculateProgress = () => {
    if (!sprint || !sprint.sprintTickets.length) return 0;
    const completed = sprint.sprintTickets.filter(st => st.status === 'Done').length;
    return Math.round((completed / sprint.sprintTickets.length) * 100);
  };

  const calculateBurndown = () => {
    if (!sprint || !sprint.sprintTickets.length) return { total: 0, remaining: 0, completed: 0 };
    const total = sprint.sprintTickets.reduce((sum, st) => sum + (st.storyPoints || 0), 0);
    const completed = sprint.sprintTickets
      .filter(st => st.status === 'Done')
      .reduce((sum, st) => sum + (st.storyPoints || 0), 0);
    const remaining = total - completed;
    return { total, remaining, completed };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AppHeader email={email} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AppHeader email={email} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sprint Not Found</h2>
            <p className="text-gray-600 mb-4">The sprint you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/sprints')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sprints
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const progress = calculateProgress();
  const burndown = calculateBurndown();
  const groupedTickets = {
    todo: sprint.sprintTickets.filter(st => st.status === 'Todo'),
    inProgress: sprint.sprintTickets.filter(st => st.status === 'InProgress'),
    done: sprint.sprintTickets.filter(st => st.status === 'Done')
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader email={email} onLogout={handleLogout} />
      
      <main className="flex-1 container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/sprints')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sprints
          </Button>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{sprint.name}</h1>
                <p className="text-gray-600">{sprint.project.title}</p>
                {sprint.goal && (
                  <div className="flex items-start gap-2 mt-3 bg-blue-50 p-3 rounded-md">
                    <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{sprint.goal}</p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  sprint.status === 'Active' ? 'bg-green-100 text-green-800' :
                  sprint.status === 'Planning' ? 'bg-blue-100 text-blue-800' :
                  sprint.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {sprint.status}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-4 mt-6 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium">
                    {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Progress</p>
                  <p className="text-sm font-medium">{progress}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Story Points</p>
                  <p className="text-sm font-medium">{burndown.completed} / {burndown.total}</p>
                </div>
              </div>
              {sprint.capacity && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Capacity</p>
                    <p className="text-sm font-medium">{sprint.capacity}h</p>
                  </div>
                </div>
              )}
              {sprint.velocity && (
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Velocity</p>
                    <p className="text-sm font-medium">{sprint.velocity} SP</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="board">Sprint Board</TabsTrigger>
            <TabsTrigger value="burndown">Burndown</TabsTrigger>
            <TabsTrigger value="retrospective">Retrospective</TabsTrigger>
            <TabsTrigger value="standup">Daily Standup</TabsTrigger>
          </TabsList>

          {/* Sprint Board */}
          <TabsContent value="board" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* To Do */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Circle className="w-4 h-4 text-gray-500" />
                  To Do ({groupedTickets.todo.length})
                </h3>
                <div className="space-y-3">
                  {groupedTickets.todo.map(st => (
                    <div key={st.id} className={`border rounded-lg p-3 ${getStatusColor(st.status)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium flex-1">{st.ticket.title}</h4>
                        {st.storyPoints && (
                          <span className="ml-2 px-2 py-0.5 bg-white rounded text-xs font-medium">
                            {st.storyPoints} SP
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="capitalize">{st.ticket.priority}</span>
                      </div>
                    </div>
                  ))}
                  {groupedTickets.todo.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">No tickets</p>
                  )}
                </div>
              </div>

              {/* In Progress */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  In Progress ({groupedTickets.inProgress.length})
                </h3>
                <div className="space-y-3">
                  {groupedTickets.inProgress.map(st => (
                    <div key={st.id} className={`border rounded-lg p-3 ${getStatusColor(st.status)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium flex-1">{st.ticket.title}</h4>
                        {st.storyPoints && (
                          <span className="ml-2 px-2 py-0.5 bg-white rounded text-xs font-medium">
                            {st.storyPoints} SP
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="capitalize">{st.ticket.priority}</span>
                      </div>
                    </div>
                  ))}
                  {groupedTickets.inProgress.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">No tickets</p>
                  )}
                </div>
              </div>

              {/* Done */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Done ({groupedTickets.done.length})
                </h3>
                <div className="space-y-3">
                  {groupedTickets.done.map(st => (
                    <div key={st.id} className={`border rounded-lg p-3 ${getStatusColor(st.status)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium flex-1">{st.ticket.title}</h4>
                        {st.storyPoints && (
                          <span className="ml-2 px-2 py-0.5 bg-white rounded text-xs font-medium">
                            {st.storyPoints} SP
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="capitalize">{st.ticket.priority}</span>
                      </div>
                    </div>
                  ))}
                  {groupedTickets.done.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">No tickets</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Burndown Chart */}
          <TabsContent value="burndown">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-6">Sprint Burndown</h3>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Total Story Points</p>
                  <p className="text-4xl font-bold text-blue-600">{burndown.total}</p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Completed</p>
                  <p className="text-4xl font-bold text-green-600">{burndown.completed}</p>
                </div>
                <div className="text-center p-6 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Remaining</p>
                  <p className="text-4xl font-bold text-orange-600">{burndown.remaining}</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {burndown.total > 0 && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Velocity Tracking:</strong> {burndown.completed} of {burndown.total} story points completed.
                    {sprint.commitment && ` Original commitment: ${sprint.commitment} SP.`}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Retrospective */}
          <TabsContent value="retrospective">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-6">Sprint Retrospective</h3>
              
              <div className="grid grid-cols-3 gap-6">
                {/* Went Well */}
                <div>
                  <h4 className="font-medium text-green-700 mb-4 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    Went Well
                  </h4>
                  <div className="space-y-3">
                    {sprint.retrospectives
                      .filter(r => r.type === 'WentWell')
                      .map(retro => (
                        <div key={retro.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-gray-700">{retro.content}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{retro.votes} votes</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Needs Improvement */}
                <div>
                  <h4 className="font-medium text-orange-700 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Needs Improvement
                  </h4>
                  <div className="space-y-3">
                    {sprint.retrospectives
                      .filter(r => r.type === 'NeedsImprovement')
                      .map(retro => (
                        <div key={retro.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm text-gray-700">{retro.content}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{retro.votes} votes</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Action Items */}
                <div>
                  <h4 className="font-medium text-blue-700 mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Action Items
                  </h4>
                  <div className="space-y-3">
                    {sprint.retrospectives
                      .filter(r => r.type === 'ActionItem')
                      .map(retro => (
                        <div key={retro.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-gray-700">{retro.content}</p>
                          <div className="flex items-center justify-between mt-2 text-xs">
                            <span className={`px-2 py-1 rounded ${
                              retro.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              retro.status === 'InProgress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {retro.status || 'Open'}
                            </span>
                            {retro.assignee && (
                              <span className="text-gray-500 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {retro.assignee.name || retro.assignee.email}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Daily Standup */}
          <TabsContent value="standup">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-6">Daily Standup Updates</h3>
              
              <div className="space-y-4">
                {sprint.dailyStandups
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(standup => (
                    <div key={standup.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{standup.user.name || standup.user.email}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(standup.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Yesterday</p>
                          <p className="text-gray-600">{standup.yesterday || 'No update'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Today</p>
                          <p className="text-gray-600">{standup.today || 'No update'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Blockers</p>
                          <p className={standup.blockers ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {standup.blockers || 'None'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {sprint.dailyStandups.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No standup updates yet</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
