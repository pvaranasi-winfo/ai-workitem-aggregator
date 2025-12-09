'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { KantataIntegration } from '@/lib/integrations/kantata'

interface KantataAuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (tokens: any, config: any) => void
  userEmail: string
}

interface FormData {
  name: string
  clientId: string
  clientSecret: string
  subdomain: string
  redirectUri: string
}

export function KantataAuthModal({
  open,
  onOpenChange,
  onSuccess,
  userEmail,
}: KantataAuthModalProps) {
  const [step, setStep] = useState<'form' | 'authorizing' | 'success'>('form')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    clientId: '',
    clientSecret: '',
    subdomain: '',
    redirectUri: `${window?.location?.origin || 'http://localhost:3000'}/api/oauth/callback`,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewData, setPreviewData] = useState<any>(null)

  // Auto-fill redirect URI when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFormData(prev => ({
        ...prev,
        redirectUri: `${window.location.origin}/api/oauth/callback`
      }))
    }
  }, [])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate form
      if (!formData.name || !formData.clientId || !formData.clientSecret || !formData.subdomain) {
        throw new Error('All required fields must be filled')
      }

      const kantata = new KantataIntegration({
        subdomain: formData.subdomain,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
      })

      // Generate auth URL and open popup
      const authUrl = kantata.generateAuthUrl(formData.redirectUri)
      const popup = window.open(
        authUrl,
        'kantata-auth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      )

      setStep('authorizing')

      // Listen for message from popup
      const messageHandler = async (event: MessageEvent) => {
        if (event.data.type === 'kantata-oauth') {
          popup?.close()
          window.removeEventListener('message', messageHandler)

          if (event.data.error) {
            setError(`Authorization failed: ${event.data.error}`)
            setStep('form')
            setLoading(false)
            return
          }

          if (event.data.code) {
            try {
              // Exchange code for tokens
              const tokens = await kantata.exchangeCodeForTokens(
                event.data.code,
                formData.redirectUri
              )

              // Test connection and fetch preview data
              const kantataWithToken = new KantataIntegration({
                ...formData,
                accessToken: tokens.access_token,
              })

              const [connectionTest, workspaces, timeEntries] = await Promise.all([
                kantataWithToken.testConnection(),
                kantataWithToken.fetchWorkspaces().catch(() => []),
                kantataWithToken.fetchTimeEntries({ 
                  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
                }).catch(() => []),
              ])

              if (!connectionTest.success) {
                throw new Error(connectionTest.error || 'Connection test failed')
              }

              setPreviewData({
                user: connectionTest.user,
                workspaces: workspaces.slice(0, 5), // Show first 5 workspaces
                timeEntries: timeEntries.slice(0, 5), // Show recent 5 time entries
                totalWorkspaces: workspaces.length,
                totalTimeEntries: timeEntries.length,
              })

              setStep('success')
              
              // Call success handler
              onSuccess(tokens, {
                name: formData.name,
                platform: 'kantata',
                clientId: formData.clientId,
                clientSecret: formData.clientSecret,
                subdomain: formData.subdomain,
                redirectUri: formData.redirectUri,
              })

            } catch (err: any) {
              setError(`Token exchange failed: ${err.message}`)
              setStep('form')
            }
          }
          setLoading(false)
        }
      }

      window.addEventListener('message', messageHandler)

      // Check if popup was blocked
      setTimeout(() => {
        if (!popup || popup.closed) {
          window.removeEventListener('message', messageHandler)
          setError('Popup was blocked. Please allow popups and try again.')
          setStep('form')
          setLoading(false)
        }
      }, 1000)

    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('form')
    setError('')
    setPreviewData(null)
    setFormData({
      name: '',
      clientId: '',
      clientSecret: '',
      subdomain: '',
      redirectUri: formData.redirectUri, // Keep the redirect URI
    })
    onOpenChange(false)
  }

  const renderForm = () => (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Connection Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="My Kantata Account"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientId">
          Client ID <span className="text-red-500">*</span>
        </Label>
        <Input
          id="clientId"
          placeholder="Your Kantata Client ID"
          required
          value={formData.clientId}
          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientSecret">
          Client Secret <span className="text-red-500">*</span>
        </Label>
        <Input
          id="clientSecret"
          type="password"
          placeholder="Your Kantata Client Secret"
          required
          value={formData.clientSecret}
          onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subdomain">
          Account Subdomain <span className="text-red-500">*</span>
        </Label>
        <Input
          id="subdomain"
          placeholder="yourcompany"
          required
          value={formData.subdomain}
          onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Your Kantata subdomain (e.g., "yourcompany" from yourcompany.mavenlink.com)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="redirectUri">Redirect URI</Label>
        <Input
          id="redirectUri"
          type="url"
          value={formData.redirectUri}
          onChange={(e) => setFormData({ ...formData, redirectUri: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          OAuth2 redirect URI (auto-filled with current origin)
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Authorizing...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Authorize Kantata
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancel
        </Button>
      </div>
    </form>
  )

  const renderAuthorizing = () => (
    <div className="text-center py-8">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Authorizing with Kantata</h3>
      <p className="text-muted-foreground">
        Please complete the authorization in the popup window
      </p>
    </div>
  )

  const renderSuccess = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
        <h3 className="text-lg font-semibold mb-1">Kantata Connected!</h3>
        <p className="text-muted-foreground">
          Your Kantata account has been successfully connected
        </p>
      </div>

      {previewData && (
        <div className="space-y-4">
          <h4 className="font-semibold">Preview Data:</h4>
          
          {/* User Info */}
          {previewData.user && (
            <div className="bg-muted p-3 rounded">
              <p className="font-medium">Connected as: {previewData.user.full_name || previewData.user.email || 'Unknown User'}</p>
            </div>
          )}

          {/* Workspaces */}
          <div>
            <p className="font-medium mb-2">
              Workspaces ({previewData.totalWorkspaces} total)
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {previewData.workspaces.map((workspace: any) => (
                <div key={workspace.id} className="bg-muted p-2 rounded text-sm">
                  {workspace.title}
                </div>
              ))}
            </div>
          </div>

          {/* Time Entries */}
          {previewData.totalTimeEntries > 0 && (
            <div>
              <p className="font-medium mb-2">
                Recent Time Entries ({previewData.totalTimeEntries} total)
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {previewData.timeEntries.map((entry: any) => (
                  <div key={entry.id} className="bg-muted p-2 rounded text-sm">
                    {entry.notes || 'No description'} - {Math.round(entry.time_in_minutes / 60 * 100) / 100}h
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Button onClick={handleClose} className="w-full">
        Close
      </Button>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' && 'Connect to Kantata'}
            {step === 'authorizing' && 'Authorizing...'}
            {step === 'success' && 'Connection Successful'}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' && 'Enter your Kantata OAuth credentials to connect'}
            {step === 'authorizing' && 'Please complete authorization in the popup window'}
            {step === 'success' && 'Your Kantata integration is ready to use'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {step === 'form' && renderForm()}
          {step === 'authorizing' && renderAuthorizing()}
          {step === 'success' && renderSuccess()}
        </div>
      </DialogContent>
    </Dialog>
  )
}