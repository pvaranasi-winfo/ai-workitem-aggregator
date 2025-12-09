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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Calendar, RefreshCw, Users, Building2, Download } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Leave {
  id: string;
  userId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason?: string;
  source?: string;
  externalId?: string;
  user: {
    id: string;
    email: string;
    name?: string;
    displayName?: string;
  };
}

interface LeaveSource {
  platform: string;
  name: string;
  enabled: boolean;
}

export default function LeaveManagementPage() {
  const [email, setEmail] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const [filterUser, setFilterUser] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    userId: '',
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    days: '',
    status: 'Approved',
    reason: '',
  });
  const [sources, setSources] = useState<LeaveSource[]>([
    { platform: 'jira', name: 'Jira Time Off', enabled: false },
    { platform: 'azure-devops', name: 'Azure DevOps', enabled: false },
    { platform: 'slack', name: 'Slack Time Off', enabled: false },
  ]);
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

  const { data: leaves, isLoading } = useQuery({
    queryKey: ['leaves', filterUser, filterStatus],
    queryFn: async () => {
      let url = '/api/leaves';
      const params = new URLSearchParams();
      if (filterUser) params.append('userId', filterUser);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch leaves');
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

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create leave');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Leave created successfully!');
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['users-dashboard'] });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/leaves/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete leave');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Leave deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['users-dashboard'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (platform: string) => {
      const res = await fetch('/api/leaves/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to sync leaves');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Synced ${data.synced} leaves from ${data.platform}`);
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['users-dashboard'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleOpenDialog = () => {
    setFormData({
      userId: '',
      leaveType: 'Annual',
      startDate: '',
      endDate: '',
      days: '',
      status: 'Approved',
      reason: '',
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this leave record?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSync = (platform: string) => {
    syncMutation.mutate(platform);
  };

  const stats = {
    total: leaves?.leaves?.length || 0,
    approved: leaves?.leaves?.filter((l: Leave) => l.status === 'Approved').length || 0,
    pending: leaves?.leaves?.filter((l: Leave) => l.status === 'Pending').length || 0,
    totalDays: leaves?.leaves?.reduce((sum: number, l: Leave) => sum + l.days, 0) || 0,
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar email={email} onLogout={handleLogout} />
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Leaves</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Days</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalDays.toFixed(1)}</p>
                </div>
                <Calendar className="h-8 w-8 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters & Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="user-filter">Filter by User</Label>
                <select
                  id="user-filter"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Users</option>
                  {users?.users?.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName || user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="status-filter">Filter by Status</Label>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleOpenDialog} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Add Leave
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaves Table */}
        {isLoading ? (
          <div className="text-center py-12">Loading leaves...</div>
        ) : leaves?.leaves?.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No leave records found</h3>
                <p className="text-muted-foreground mb-4">Start by adding leave records or syncing from external sources</p>
                <Button onClick={handleOpenDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Leave
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Leave Records</CardTitle>
              <CardDescription>Manage employee leave and time off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">User</th>
                      <th className="text-left py-3 px-4 font-medium">Leave Type</th>
                      <th className="text-left py-3 px-4 font-medium">Start Date</th>
                      <th className="text-left py-3 px-4 font-medium">End Date</th>
                      <th className="text-left py-3 px-4 font-medium">Days</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Source</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves?.leaves?.map((leave: Leave) => (
                      <tr key={leave.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">
                              {leave.user.displayName || leave.user.name || leave.user.email}
                            </div>
                            <div className="text-sm text-muted-foreground">{leave.user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{leave.leaveType}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{leave.days}d</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              leave.status === 'Approved'
                                ? 'default'
                                : leave.status === 'Pending'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {leave.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {leave.source ? (
                            <Badge variant="outline" className="text-xs">
                              {leave.source}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Manual</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(leave.id)}
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

        {/* Add Leave Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Leave Record</DialogTitle>
                <DialogDescription>Create a new leave entry for an employee</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="user">User *</Label>
                  <select
                    id="user"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select a user</option>
                    {users?.users?.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.displayName || user.name || user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="leaveType">Leave Type *</Label>
                  <select
                    id="leaveType"
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Personal">Personal Leave</option>
                    <option value="Maternity">Maternity Leave</option>
                    <option value="Paternity">Paternity Leave</option>
                    <option value="Unpaid">Unpaid Leave</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="days">Days *</Label>
                    <Input
                      id="days"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={formData.days}
                      onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                      placeholder="1.0"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Reason for leave..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  Add Leave
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Sync Sources Dialog */}
        <Dialog open={showSourceDialog} onOpenChange={setShowSourceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sync Leave from External Sources</DialogTitle>
              <DialogDescription>
                Import leave data from project management and collaboration tools
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {sources.map((source) => (
                <div key={source.platform} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{source.name}</h4>
                    <p className="text-sm text-muted-foreground">Platform: {source.platform}</p>
                  </div>
                  <Button
                    onClick={() => handleSync(source.platform)}
                    disabled={syncMutation.isPending}
                    size="sm"
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                    Sync
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSourceDialog(false)}>
                Close
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
