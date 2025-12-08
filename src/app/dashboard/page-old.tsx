'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TicketCard } from '@/components/ticket-card'
import { AddIntegrationDialog } from '@/components/add-integration-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Plus, Settings, LogOut, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function DashboardPage() {
  const [email, setEmail] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail')
    if (!storedEmail) {
      router.push('/')
    } else {
      setEmail(storedEmail)
    }
  }, [router])

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard', email],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard?email=${email}`)
      if (!response.ok) throw new Error('Failed to fetch dashboard')
      return response.json()
    },
    enabled: !!email,
  })

  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['tickets', email, selectedPlatform, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({ email })
      if (selectedPlatform !== 'all') params.append('platform', selectedPlatform)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`/api/tickets?${params}`)
      if (!response.ok) throw new Error('Failed to fetch tickets')
      return response.json()
    },
    enabled: !!email,
  })

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tickets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to sync tickets')
      }
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Tickets synced successfully')
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    router.push('/')
  }

  const stats = dashboardData?.stats
  const tickets = ticketsData?.tickets || []

  const platforms = ['all', 'jira', 'github', 'gitlab', 'azure-devops', 'bitbucket']

  if (!email) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ticket Aggregator
              </h1>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                Sync
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
              <Link href="/integrations">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Integrations
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Tickets</CardDescription>
                <CardTitle className="text-3xl">{stats.totalTickets}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Active Integrations</CardDescription>
                <CardTitle className="text-3xl">{stats.activeIntegrations}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>In Progress</CardDescription>
                <CardTitle className="text-3xl">{stats.ticketsByStatus?.inProgress || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Completed</CardDescription>
                <CardTitle className="text-3xl">{stats.ticketsByStatus?.completed || 0}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {platforms.map((platform) => (
                  <Button
                    key={platform}
                    variant={selectedPlatform === platform ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPlatform(platform)}
                    className="capitalize"
                  >
                    {platform === 'all' ? 'All' : platform.replace('-', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets */}
        {ticketsLoading || dashboardLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No tickets found</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Integration
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map((ticket: any) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>

      <AddIntegrationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] })
          toast.success('Integration added successfully')
        }}
        userEmail={email}
      />
    </div>
  )
}
