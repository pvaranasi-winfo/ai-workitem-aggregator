'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IntegrationCard } from '@/components/integration-card'
import { AddIntegrationDialog } from '@/components/add-integration-dialog'
import { ArrowLeft, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { AppHeader } from '@/components/app-header'
import { Footer } from '@/components/footer'

export default function IntegrationsPage() {
  const [email, setEmail] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
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

  const { data, isLoading } = useQuery({
    queryKey: ['integrations', email],
    queryFn: async () => {
      const response = await fetch(`/api/integrations?email=${email}`)
      if (!response.ok) throw new Error('Failed to fetch integrations')
      return response.json()
    },
    enabled: !!email,
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch('/api/integrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive }),
      })
      if (!response.ok) throw new Error('Failed to update integration')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast.success('Integration updated')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/integrations?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete integration')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast.success('Integration deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const integrations = data?.integrations || []

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    router.push('/')
  }

  if (!email) return null

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader email={email} onLogout={handleLogout} />
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Integrations</h1>
            <p className="text-sm text-muted-foreground">Manage your connected platforms</p>
          </div>
          <div className="mb-4">
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading integrations...</p>
            </div>
          ) : integrations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-semibold mb-2">No Integrations Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Connect your first platform to start aggregating your tickets
                  </p>
                  <Button onClick={() => setShowAddDialog(true)} size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Integration
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration: any) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onToggle={(id, isActive) => toggleMutation.mutate({ id, isActive })}
                  onDelete={(id) => {
                    if (confirm('Are you sure you want to delete this integration?')) {
                      deleteMutation.mutate(id)
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddIntegrationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['integrations'] })
          toast.success('Integration added successfully')
        }}
        userEmail={email}
      />
      <Footer />
    </div>
  )
}
