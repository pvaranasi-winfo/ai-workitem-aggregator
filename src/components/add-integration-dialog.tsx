'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PLATFORM_CONFIGS } from '@/lib/platforms'
import { IntegrationCreate } from '@/types'

interface AddIntegrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  userEmail: string
}

export function AddIntegrationDialog({
  open,
  onOpenChange,
  onSuccess,
  userEmail,
}: AddIntegrationDialogProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          platform: selectedPlatform,
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add integration')
      }

      onSuccess()
      onOpenChange(false)
      setSelectedPlatform(null)
      setFormData({})
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderPlatformSelection = () => (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(PLATFORM_CONFIGS).map(([key, config]) => (
        <button
          key={key}
          onClick={() => setSelectedPlatform(key)}
          className="flex flex-col items-center p-6 border rounded-lg hover:border-primary hover:bg-accent transition-colors"
        >
          <span className="text-3xl mb-2">{config.name}</span>
          <span className="text-sm text-muted-foreground text-center">
            {config.description}
          </span>
        </button>
      ))}
    </div>
  )

  const renderConfigForm = () => {
    if (!selectedPlatform) return null
    const config = PLATFORM_CONFIGS[selectedPlatform]

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setSelectedPlatform(null)}
          className="mb-2"
        >
          ← Back to platform selection
        </Button>
        
        {config.fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
              value={formData[field.name] || ''}
              onChange={(e) =>
                setFormData({ ...formData, [field.name]: e.target.value })
              }
            />
            {field.helpText && (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        ))}

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Adding...' : 'Add Integration'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedPlatform
              ? `Add ${PLATFORM_CONFIGS[selectedPlatform].name} Integration`
              : 'Add Integration'}
          </DialogTitle>
          <DialogDescription>
            {selectedPlatform
              ? `Connect your ${PLATFORM_CONFIGS[selectedPlatform].name} account`
              : 'Select a platform to connect'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {selectedPlatform ? renderConfigForm() : renderPlatformSelection()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
