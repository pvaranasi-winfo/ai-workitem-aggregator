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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Users, Building2, RefreshCw, Settings, UserPlus, Search } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  entraId?: string;
}

interface Project {
  id: string;
  title: string;
  location?: string;
}

interface UserProject {
  id: string;
  userId: string;
  projectId: string;
  role?: string;
  allocationPercentage?: number;
  startDate?: string;
  endDate?: string;
  user: User;
  project: Project;
}

export default function UserMappingPage() {
  const [email, setEmail] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showEntraConfig, setShowEntraConfig] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [entraConfig, setEntraConfig] = useState({
    tenantId: '',
    clientId: '',
    clientSecret: '',
    isEnabled: false,
  });
  const [mappingForm, setMappingForm] = useState({
    projectId: '',
    userId: '',
    role: '',
    allocationPercentage: '100',
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

  const { data: mappings, isLoading: mappingsLoading } = useQuery({
    queryKey: ['user-mappings', selectedProject],
    queryFn: async () => {
      const url = selectedProject
        ? `/api/user-mappings?projectId=${selectedProject}`
        : '/api/user-mappings';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch mappings');
      return res.json();
    },
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });

  const { data: entraConfigData } = useQuery({
    queryKey: ['entra-config'],
    queryFn: async () => {
      const res = await fetch('/api/entra/config');
      if (!res.ok) return null;
      return res.json();
    },
  });

  useEffect(() => {
    if (entraConfigData) {
      setEntraConfig({
        tenantId: entraConfigData.tenantId || '',
        clientId: entraConfigData.clientId || '',
        clientSecret: '',
        isEnabled: entraConfigData.isEnabled || false,
      });
    }
  }, [entraConfigData]);

  const createMappingMutation = useMutation({
    mutationFn: async (data: typeof mappingForm) => {
      const res = await fetch('/api/user-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create mapping');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('User mapping created successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-mappings'] });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMappingMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/user-mappings/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete mapping');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('User mapping deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['user-mappings'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const syncEntraMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/entra/sync', {
        method: 'POST',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to sync with Entra ID');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Synced ${data.synced} users from Microsoft Entra ID`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const saveEntraConfigMutation = useMutation({
    mutationFn: async (data: typeof entraConfig) => {
      const res = await fetch('/api/entra/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save configuration');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Entra ID configuration saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['entra-config'] });
      setShowEntraConfig(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleOpenDialog = () => {
    setMappingForm({
      projectId: selectedProject || '',
      userId: '',
      role: '',
      allocationPercentage: '100',
      startDate: '',
      endDate: '',
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setMappingForm({
      projectId: '',
      userId: '',
      role: '',
      allocationPercentage: '100',
      startDate: '',
      endDate: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMappingMutation.mutate(mappingForm);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this user mapping?')) {
      deleteMappingMutation.mutate(id);
    }
  };

  const filteredMappings = mappings?.mappings?.filter((mapping: UserProject) => {
    const search = searchQuery.toLowerCase();
    return (
      mapping.user.email?.toLowerCase().includes(search) ||
      mapping.user.name?.toLowerCase().includes(search) ||
      mapping.user.displayName?.toLowerCase().includes(search) ||
      mapping.project.title?.toLowerCase().includes(search) ||
      mapping.role?.toLowerCase().includes(search)
    );
  });

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar email={email} onLogout={handleLogout} />
      
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="mappings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="mappings">User Mappings</TabsTrigger>
            <TabsTrigger value="users">All Users</TabsTrigger>
          </TabsList>

          <TabsContent value="mappings" className="space-y-6">
            {/* Filters and Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Filters & Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search users, projects, roles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="project-filter">Filter by Project</Label>
                    <select
                      id="project-filter"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">All Projects</option>
                      {projects?.projects?.map((project: Project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleOpenDialog} className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Add Mapping
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Mappings</p>
                      <p className="text-2xl font-bold">{mappings?.mappings?.length || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Projects</p>
                      <p className="text-2xl font-bold">
                        {new Set(mappings?.mappings?.map((m: UserProject) => m.projectId)).size || 0}
                      </p>
                    </div>
                    <Building2 className="h-8 w-8 text-blue-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Mapped Users</p>
                      <p className="text-2xl font-bold">
                        {new Set(mappings?.mappings?.map((m: UserProject) => m.userId)).size || 0}
                      </p>
                    </div>
                    <UserPlus className="h-8 w-8 text-green-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mappings Table */}
            {mappingsLoading ? (
              <div className="text-center py-12">Loading mappings...</div>
            ) : filteredMappings?.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No user mappings found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || selectedProject
                        ? 'Try adjusting your filters'
                        : 'Start by adding user-project mappings'}
                    </p>
                    <Button onClick={handleOpenDialog} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Mapping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>User-Project Mappings</CardTitle>
                  <CardDescription>Manage user assignments to projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">User</th>
                          <th className="text-left py-3 px-4 font-medium">Project</th>
                          <th className="text-left py-3 px-4 font-medium">Role</th>
                          <th className="text-left py-3 px-4 font-medium">Allocation</th>
                          <th className="text-left py-3 px-4 font-medium">Period</th>
                          <th className="text-right py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMappings?.map((mapping: UserProject) => (
                          <tr key={mapping.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">
                                  {mapping.user.displayName || mapping.user.name || mapping.user.email}
                                </div>
                                <div className="text-sm text-muted-foreground">{mapping.user.email}</div>
                                {mapping.user.jobTitle && (
                                  <div className="text-xs text-muted-foreground">{mapping.user.jobTitle}</div>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{mapping.project.title}</div>
                              {mapping.project.location && (
                                <div className="text-sm text-muted-foreground">{mapping.project.location}</div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {mapping.role ? (
                                <Badge variant="outline">{mapping.role}</Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary">{mapping.allocationPercentage || 100}%</Badge>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {mapping.startDate ? (
                                <div>
                                  {format(new Date(mapping.startDate), 'MMM dd, yyyy')}
                                  {mapping.endDate && (
                                    <div className="text-muted-foreground">
                                      to {format(new Date(mapping.endDate), 'MMM dd, yyyy')}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(mapping.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                      {entraConfig.isEnabled
                        ? 'Users synced from Microsoft Entra ID'
                        : 'Local users'}
                    </CardDescription>
                  </div>
                  {entraConfig.isEnabled && (
                    <Button
                      onClick={() => syncEntraMutation.mutate()}
                      disabled={syncEntraMutation.isPending}
                      className="gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${syncEntraMutation.isPending ? 'animate-spin' : ''}`} />
                      Sync from Entra ID
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.users?.map((user: User) => (
                    <div key={user.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {user.displayName || user.name || user.email}
                          </h4>
                          {user.entraId && (
                            <Badge variant="outline" className="text-xs">Entra ID</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.jobTitle && (
                          <p className="text-sm text-muted-foreground mt-1">{user.jobTitle}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          {user.department && <span>📁 {user.department}</span>}
                          {user.officeLocation && <span>📍 {user.officeLocation}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Mapping Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add User Mapping</DialogTitle>
                <DialogDescription>Assign a user to a project</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="project">Project *</Label>
                  <select
                    id="project"
                    value={mappingForm.projectId}
                    onChange={(e) => setMappingForm({ ...mappingForm, projectId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select a project</option>
                    {projects?.projects?.map((project: Project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="user">User *</Label>
                  <select
                    id="user"
                    value={mappingForm.userId}
                    onChange={(e) => setMappingForm({ ...mappingForm, userId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select a user</option>
                    {users?.users?.map((user: User) => (
                      <option key={user.id} value={user.id}>
                        {user.displayName || user.name || user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={mappingForm.role}
                      onChange={(e) => setMappingForm({ ...mappingForm, role: e.target.value })}
                      placeholder="Developer, Lead, etc."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="allocation">Allocation %</Label>
                    <Input
                      id="allocation"
                      type="number"
                      min="0"
                      max="100"
                      value={mappingForm.allocationPercentage}
                      onChange={(e) => setMappingForm({ ...mappingForm, allocationPercentage: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={mappingForm.startDate}
                      onChange={(e) => setMappingForm({ ...mappingForm, startDate: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={mappingForm.endDate}
                      onChange={(e) => setMappingForm({ ...mappingForm, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMappingMutation.isPending}>
                  Add Mapping
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Entra Config Dialog */}
        <Dialog open={showEntraConfig} onOpenChange={setShowEntraConfig}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Microsoft Entra ID Configuration</DialogTitle>
              <DialogDescription>
                Configure integration with Microsoft Entra ID (Azure AD) to sync users
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="tenantId">Tenant ID</Label>
                <Input
                  id="tenantId"
                  value={entraConfig.tenantId}
                  onChange={(e) => setEntraConfig({ ...entraConfig, tenantId: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="clientId">Client ID (Application ID)</Label>
                <Input
                  id="clientId"
                  value={entraConfig.clientId}
                  onChange={(e) => setEntraConfig({ ...entraConfig, clientId: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input
                  id="clientSecret"
                  type="password"
                  value={entraConfig.clientSecret}
                  onChange={(e) => setEntraConfig({ ...entraConfig, clientSecret: e.target.value })}
                  placeholder="Enter client secret"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={entraConfig.isEnabled}
                  onChange={(e) => setEntraConfig({ ...entraConfig, isEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isEnabled" className="cursor-pointer">
                  Enable Entra ID Integration
                </Label>
              </div>

              <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                <p className="font-medium mb-2">Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Register an app in Azure Portal</li>
                  <li>Add API permissions: User.Read.All, Directory.Read.All</li>
                  <li>Grant admin consent for permissions</li>
                  <li>Create a client secret</li>
                  <li>Copy Tenant ID, Client ID, and Secret here</li>
                </ol>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEntraConfig(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => saveEntraConfigMutation.mutate(entraConfig)}
                disabled={saveEntraConfigMutation.isPending}
              >
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
