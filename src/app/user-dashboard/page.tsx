'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppHeader } from '@/components/app-header';
import { Footer } from '@/components/footer';
import { 
  User as UserIcon, Clock, Briefcase, Calendar, 
  TrendingUp, Building2, Search, Users, Award,
  MapPin, Mail, Phone, Hash
} from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  resourceType?: string;
  userProjects: Array<{
    id: string;
    role?: string;
    allocationPercentage?: number;
    project: {
      id: string;
      title: string;
      location?: string;
    };
  }>;
  _count?: {
    tickets: number;
    userProjects: number;
  };
  totalHours?: number;
  leaves?: Array<{
    id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    status: string;
  }>;
}

export default function UserDashboardPage() {
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (!storedEmail) {
      router.push('/');
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/users/dashboard');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  const getResourceTypeColor = (type?: string) => {
    switch (type) {
      case 'Dedicated':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Shared':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResourceTypeIcon = (type?: string) => {
    switch (type) {
      case 'Dedicated':
        return '🎯';
      case 'Shared':
        return '🔄';
      default:
        return '⚪';
    }
  };

  const filteredUsers = usersData?.users?.filter((user: User) => {
    const matchesSearch = searchQuery
      ? (user.displayName || user.name || user.email).toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesFilter = filterType === 'all' || user.resourceType === filterType;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: usersData?.users?.length || 0,
    dedicated: usersData?.users?.filter((u: User) => u.resourceType === 'Dedicated').length || 0,
    shared: usersData?.users?.filter((u: User) => u.resourceType === 'Shared').length || 0,
    unassigned: usersData?.users?.filter((u: User) => u.resourceType === 'Unassigned').length || 0,
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader email={email} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-indigo-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dedicated Resources</p>
                  <p className="text-2xl font-bold text-green-600">{stats.dedicated}</p>
                </div>
                <Award className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Shared Resources</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.shared}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.unassigned}</p>
                </div>
                <UserIcon className="h-8 w-8 text-gray-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compact Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, department, job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Dedicated">Dedicated Resources</SelectItem>
              <SelectItem value="Shared">Shared Resources</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User Tiles */}
        {isLoading ? (
          <div className="text-center py-12">Loading users...</div>
        ) : filteredUsers?.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || filterType !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No users in the system'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers?.map((user: User) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                        {(user.displayName || user.name || user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {user.displayName || user.name || user.email.split('@')[0]}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {user.jobTitle || 'No job title'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Resource Type Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Resource Type:</span>
                    <Badge className={getResourceTypeColor(user.resourceType)}>
                      {getResourceTypeIcon(user.resourceType)} {user.resourceType || 'Unassigned'}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.department && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{user.department}</span>
                      </div>
                    )}
                    {user.officeLocation && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{user.officeLocation}</span>
                      </div>
                    )}
                  </div>

                  {/* Projects */}
                  {user.userProjects && user.userProjects.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Projects ({user.userProjects.length})
                      </div>
                      <div className="space-y-1">
                        {user.userProjects.slice(0, 2).map((up) => (
                          <div key={up.id} className="flex items-center justify-between text-xs bg-gray-50 rounded p-2">
                            <span className="font-medium truncate flex-1">{up.project.title}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {up.allocationPercentage || 100}%
                            </Badge>
                          </div>
                        ))}
                        {user.userProjects.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{user.userProjects.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Hours Worked</span>
                      </div>
                      <p className="text-lg font-bold text-indigo-600">
                        {user.totalHours?.toFixed(1) || '0.0'}h
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Hash className="h-3 w-3" />
                        <span className="text-xs">Tickets</span>
                      </div>
                      <p className="text-lg font-bold text-purple-600">
                        {user._count?.tickets || 0}
                      </p>
                    </div>
                  </div>

                  {/* Leaves */}
                  {user.leaves && user.leaves.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Calendar className="h-3 w-3" />
                        <span>Upcoming/Recent Leaves:</span>
                      </div>
                      {user.leaves.slice(0, 1).map((leave) => (
                        <div key={leave.id} className="text-xs bg-orange-50 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{leave.leaveType}</span>
                            <Badge variant="outline" className="text-xs">{leave.days}d</Badge>
                          </div>
                          <div className="text-muted-foreground mt-1">
                            {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>

      <Footer />
    </div>
  );
}
