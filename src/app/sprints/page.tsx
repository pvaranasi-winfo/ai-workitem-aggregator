'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Footer } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Target, 
  Users, 
  BarChart3, 
  Plus, 
  Play, 
  CheckCircle2, 
  XCircle,
  Edit,
  Trash2,
  Filter,
  ChevronRight
} from 'lucide-react';

interface Project {
  id: number;
  title: string;
}

interface Sprint {
  id: number;
  name: string;
  goal: string | null;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Active' | 'Completed' | 'Cancelled';
  velocity: number | null;
  capacity: number | null;
  commitment: number | null;
  project: {
    id: number;
    title: string;
  };
  _count: {
    sprintTickets: number;
    retrospectives: number;
    dailyStandups: number;
  };
}

export default function SprintPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    capacity: '',
    commitment: ''
  });

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/');
      return;
    }
    setEmail(userEmail);
    fetchProjects();
    fetchSprints();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const fetchSprints = async () => {
    try {
      const response = await fetch('/api/sprints');
      const data = await response.json();
      setSprints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sprints:', error);
      setSprints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          commitment: formData.commitment ? parseInt(formData.commitment) : null
        })
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          projectId: '',
          name: '',
          goal: '',
          startDate: '',
          endDate: '',
          capacity: '',
          commitment: ''
        });
        fetchSprints();
      }
    } catch (error) {
      console.error('Error creating sprint:', error);
    }
  };

  const updateSprintStatus = async (sprintId: number, status: string) => {
    try {
      const response = await fetch(`/api/sprints/${sprintId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchSprints();
      }
    } catch (error) {
      console.error('Error updating sprint status:', error);
    }
  };

  const deleteSprint = async (sprintId: number) => {
    if (!confirm('Are you sure you want to delete this sprint?')) return;
    
    try {
      const response = await fetch(`/api/sprints/${sprintId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchSprints();
      }
    } catch (error) {
      console.error('Error deleting sprint:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Planning':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'Active':
        return <Play className="w-4 h-4 text-green-500" />;
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4 text-gray-500" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning':
        return 'bg-blue-100 text-blue-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSprints = sprints.filter(sprint => {
    if (selectedProjectId && sprint.project.id !== parseInt(selectedProjectId)) return false;
    if (selectedStatus && sprint.status !== selectedStatus) return false;
    return true;
  });

  const groupedSprints = {
    active: filteredSprints.filter(s => s.status === 'Active'),
    planning: filteredSprints.filter(s => s.status === 'Planning'),
    completed: filteredSprints.filter(s => s.status === 'Completed'),
    cancelled: filteredSprints.filter(s => s.status === 'Cancelled')
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader email={email} onLogout={handleLogout} />
      
      <main className="flex-1 container mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sprint Management</h1>
              <p className="text-gray-600 mt-1">Plan, track, and manage your agile sprints</p>
            </div>
            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Sprint
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center bg-white p-4 rounded-lg shadow-sm">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {(selectedProjectId || selectedStatus) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedProjectId('');
                  setSelectedStatus('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Create Sprint Form */}
          {showCreateForm && (
            <div className="mt-4 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Create New Sprint</h2>
              <form onSubmit={handleCreateSprint} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Project *</label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.title}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Sprint Name *</label>
                  <Input
                    required
                    placeholder="e.g., Sprint 1, Q1 Sprint 2"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Sprint Goal</label>
                  <Textarea
                    placeholder="What do you aim to achieve in this sprint?"
                    value={formData.goal}
                    onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <Input
                    required
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <Input
                    required
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Team Capacity (hours)</label>
                  <Input
                    type="number"
                    placeholder="Total available hours"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Commitment (story points)</label>
                  <Input
                    type="number"
                    placeholder="Story points committed"
                    value={formData.commitment}
                    onChange={(e) => setFormData({...formData, commitment: e.target.value})}
                  />
                </div>
                <div className="col-span-2 flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Sprint</Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading sprints...</p>
          </div>
        ) : (
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">
                Active ({groupedSprints.active.length})
              </TabsTrigger>
              <TabsTrigger value="planning">
                Planning ({groupedSprints.planning.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({groupedSprints.completed.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled ({groupedSprints.cancelled.length})
              </TabsTrigger>
            </TabsList>

            {(['active', 'planning', 'completed', 'cancelled'] as const).map(tab => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                {groupedSprints[tab].length === 0 ? (
                  <div className="bg-white rounded-lg p-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">No {tab} sprints found</p>
                  </div>
                ) : (
                  groupedSprints[tab].map(sprint => (
                    <div key={sprint.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{sprint.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(sprint.status)}`}>
                              {getStatusIcon(sprint.status)}
                              {sprint.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{sprint.project.title}</p>
                          {sprint.goal && (
                            <div className="flex items-start gap-2 mt-3 bg-blue-50 p-3 rounded-md">
                              <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700">{sprint.goal}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {sprint.status === 'Planning' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateSprintStatus(sprint.id, 'Active')}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Start Sprint
                            </Button>
                          )}
                          {sprint.status === 'Active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateSprintStatus(sprint.id, 'Completed')}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/sprints/${sprint.id}`)}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSprint(sprint.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="text-sm font-medium">
                              {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Tickets</p>
                            <p className="text-sm font-medium">{sprint._count.sprintTickets}</p>
                          </div>
                        </div>
                        {sprint.capacity && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Capacity</p>
                              <p className="text-sm font-medium">{sprint.capacity}h</p>
                            </div>
                          </div>
                        )}
                        {sprint.commitment && (
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Commitment</p>
                              <p className="text-sm font-medium">{sprint.commitment} SP</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>

      <Footer />
    </div>
  );
}
