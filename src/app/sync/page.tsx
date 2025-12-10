'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';
import { Footer } from '@/components/footer';
import { 
  RefreshCw, CheckCircle2, AlertCircle, Clock, 
  Github, Settings as SettingsIcon, Zap, Database,
  TrendingUp, Users, Calendar, FileText, ArrowRight,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SyncStatus {
  integration: string;
  lastSync: string;
  status: 'success' | 'error' | 'pending' | 'syncing';
  itemsSynced: number;
  errors?: string[];
}

interface SyncStats {
  totalIntegrations: number;
  activeIntegrations: number;
  totalSyncs: number;
  lastSyncTime: string;
  ticketsSynced: number;
  projectsSynced: number;
  usersSynced: number;
}

export default function SyncPage() {
  const [email, setEmail] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (!storedEmail) {
      router.push('/');
    } else {
      setEmail(storedEmail);
      loadSyncStatus();
    }
  }, [router]);

  const loadSyncStatus = async () => {
    try {
      const res = await fetch('/api/sync/status');
      const data = await res.json();
      setSyncStatuses(data.statuses || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const handleSync = async (integrations?: string[]) => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          integrations: integrations || selectedIntegrations,
          fullSync: true 
        }),
      });
      
      if (res.ok) {
        await loadSyncStatus();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'syncing': return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-700">Success</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-700">Error</Badge>;
      case 'syncing': return <Badge className="bg-blue-100 text-blue-700">Syncing...</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-700">Pending</Badge>;
    }
  };

  const integrationIcons: Record<string, any> = {
    'Jira': SettingsIcon,
    'GitHub': Github,
    'Azure DevOps': Database,
    'GitLab': Zap,
    'Bitbucket': FileText,
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader email={email} onLogout={handleLogout} />

      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Data Synchronization
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sync tickets, projects, and users from all connected platforms
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSync()}
                disabled={syncing || selectedIntegrations.length === 0}
                className="gap-2"
              >
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Sync Selected
                  </>
                )}
              </Button>
              <Button 
                onClick={() => handleSync(['all'])}
                disabled={syncing}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Sync All
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Active Integrations</p>
                      <p className="text-xl font-bold">{stats.activeIntegrations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tickets Synced</p>
                      <p className="text-xl font-bold">{stats.ticketsSynced}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Projects Synced</p>
                      <p className="text-xl font-bold">{stats.projectsSynced}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Users Synced</p>
                      <p className="text-xl font-bold">{stats.usersSynced}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Integration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {syncStatuses.map((sync, index) => {
              const Icon = integrationIcons[sync.integration] || SettingsIcon;
              const isSelected = selectedIntegrations.includes(sync.integration);
              
              return (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                  onClick={() => {
                    setSelectedIntegrations(prev => 
                      prev.includes(sync.integration)
                        ? prev.filter(i => i !== sync.integration)
                        : [...prev, sync.integration]
                    );
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          sync.status === 'success' ? 'bg-green-100' :
                          sync.status === 'error' ? 'bg-red-100' :
                          sync.status === 'syncing' ? 'bg-blue-100' :
                          'bg-gray-100'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            sync.status === 'success' ? 'text-green-600' :
                            sync.status === 'error' ? 'text-red-600' :
                            sync.status === 'syncing' ? 'text-blue-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{sync.integration}</CardTitle>
                          <CardDescription className="text-xs">
                            {sync.itemsSynced} items synced
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusIcon(sync.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Status</span>
                      {getStatusBadge(sync.status)}
                    </div>

                    {sync.status === 'syncing' && (
                      <div>
                        <div className="flex items-center justify-between mb-2 text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">Syncing...</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span className="font-medium">{sync.lastSync}</span>
                    </div>

                    {sync.errors && sync.errors.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs font-medium text-red-600 mb-1">Errors:</p>
                        {sync.errors.map((error, i) => (
                          <p key={i} className="text-xs text-red-500">• {error}</p>
                        ))}
                      </div>
                    )}

                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSync([sync.integration]);
                      }}
                      disabled={syncing}
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 mt-2"
                    >
                      {syncing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Sync Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {syncStatuses.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Integrations Configured</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure integrations to start syncing data
                </p>
                <Button 
                  onClick={() => router.push('/integrations')}
                  className="gap-2"
                >
                  Configure Integrations
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Sync History */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Sync Activity
              </CardTitle>
              <CardDescription>Latest synchronization events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {syncStatuses.slice(0, 5).map((sync, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(sync.status)}
                      <div>
                        <p className="text-sm font-medium">{sync.integration}</p>
                        <p className="text-xs text-muted-foreground">
                          {sync.itemsSynced} items • {sync.lastSync}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(sync.status)}
                  </div>
                ))}
                
                {syncStatuses.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No sync history available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
