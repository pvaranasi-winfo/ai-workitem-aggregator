'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, MapPin, Users, Calendar, TrendingUp, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { format } from 'date-fns';

interface Project {
  id: string;
  title: string;
  description?: string;
  capacity?: number;
  location?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    userProjects: number;
  };
}

export default function ProjectsPage() {
  const [email, setEmail] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    capacity: '',
    location: '',
    status: 'Active',
    startDate: '',
    endDate: '',
  });
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

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create project');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Project created successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update project');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Project updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete project');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Project deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description || '',
        capacity: project.capacity?.toString() || '',
        location: project.location || '',
        status: project.status,
        startDate: project.startDate ? format(new Date(project.startDate), 'yyyy-MM-dd') : '',
        endDate: project.endDate ? format(new Date(project.endDate), 'yyyy-MM-dd') : '',
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      capacity: '',
      location: '',
      status: 'Active',
      startDate: '',
      endDate: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar email={email} onLogout={handleLogout} />
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{projects?.projects?.length || 0}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">
                    {projects?.projects?.filter((p: Project) => p.status === 'Active').length || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Capacity</p>
                  <p className="text-2xl font-bold">
                    {projects?.projects?.reduce((sum: number, p: Project) => sum + (p.capacity || 0), 0).toFixed(0) || 0}h
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Project Button */}
        <div className="flex justify-end mb-6">
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </div>

        {/* Projects List */}
        {isLoading ? (
          <div className="text-center py-12">Loading projects...</div>
        ) : projects?.projects?.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">Get started by creating your first project</p>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.projects?.map((project: Project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {project.title}
                        <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </CardTitle>
                      {project.description && (
                        <CardDescription className="mt-2">{project.description}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.capacity && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">{project.capacity}h/week</span>
                      </div>
                    )}
                    {project.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{project.location}</span>
                      </div>
                    )}
                    {project.startDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span className="text-muted-foreground">Start:</span>
                        <span className="font-medium">
                          {format(new Date(project.startDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    )}
                    {project._count && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-indigo-600" />
                        <span className="text-muted-foreground">Team Members:</span>
                        <span className="font-medium">{project._count.userProjects}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(project)}
                      className="flex-1 gap-2"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                <DialogDescription>
                  {editingProject ? 'Update project details' : 'Add a new project to your portfolio'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter project description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="capacity">Capacity (hours/week)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="40"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="New York, Remote, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingProject ? 'Update' : 'Create'} Project
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>
      <Footer />
    </div>
  );
}
