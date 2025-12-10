'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Footer } from '@/components/footer';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  BarChart3,
  Clock
} from 'lucide-react';

interface UserAllocation {
  userId: string;
  userName: string;
  email: string;
  department: string | null;
  projects: Array<{
    projectId: string;
    projectTitle: string;
    allocationPercentage: number;
    role: string | null;
  }>;
  totalAllocation: number;
  activeTickets: number;
  weeklyHours: number;
}

export default function CapacityPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [allocations, setAllocations] = useState<UserAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      router.push('/');
      return;
    }
    setEmail(userEmail);
    fetchCapacity();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  const fetchCapacity = async () => {
    try {
      const response = await fetch('/api/capacity');
      const data = await response.json();
      setAllocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching capacity:', error);
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  };

  const getCapacityStatus = (allocation: number) => {
    if (allocation > 100) return { color: 'bg-red-100 text-red-800 border-red-300', icon: <AlertCircle className="w-4 h-4" />, label: 'Overallocated' };
    if (allocation === 100) return { color: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle className="w-4 h-4" />, label: 'Full Capacity' };
    if (allocation >= 80) return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <TrendingUp className="w-4 h-4" />, label: 'Near Capacity' };
    return { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: <Users className="w-4 h-4" />, label: 'Available' };
  };

  const teamStats = {
    totalMembers: allocations.length,
    overallocated: allocations.filter(a => a.totalAllocation > 100).length,
    fullCapacity: allocations.filter(a => a.totalAllocation === 100).length,
    available: allocations.filter(a => a.totalAllocation < 80).length,
    avgAllocation: allocations.length > 0 
      ? Math.round(allocations.reduce((sum, a) => sum + a.totalAllocation, 0) / allocations.length)
      : 0
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader email={email} onLogout={handleLogout} />
      
      <main className="flex-1 container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Capacity</h1>
          <p className="text-gray-600">Track team allocation and availability across projects</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overallocated</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.overallocated}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Full Capacity</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.fullCapacity}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.available}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Allocation</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.avgAllocation}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Capacity Table */}
        {loading ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading capacity data...</p>
          </div>
        ) : allocations.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">No team members found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allocations.map(allocation => {
                  const status = getCapacityStatus(allocation.totalAllocation);
                  return (
                    <tr key={allocation.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {allocation.userName || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">{allocation.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{allocation.department || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {allocation.projects.map((project, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="text-gray-900">{project.projectTitle}</span>
                              <span className="text-gray-500 ml-2">({project.allocationPercentage}%)</span>
                              {project.role && (
                                <span className="text-gray-400 ml-1 text-xs">• {project.role}</span>
                              )}
                            </div>
                          ))}
                          {allocation.projects.length === 0 && (
                            <span className="text-sm text-gray-500">No projects assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                allocation.totalAllocation > 100 ? 'bg-red-500' :
                                allocation.totalAllocation >= 80 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(allocation.totalAllocation, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {allocation.totalAllocation}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{allocation.activeTickets}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full border ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
