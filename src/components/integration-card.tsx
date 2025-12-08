'use client'

import { Integration } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { getPlatformIcon, getPlatformColor, formatRelativeTime } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

interface IntegrationCardProps {
  integration: Integration
  onToggle: (id: string, isActive: boolean) => void
  onDelete: (id: string) => void
}

export function IntegrationCard({
  integration,
  onToggle,
  onDelete,
}: IntegrationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getPlatformColor(integration.platform)} flex items-center justify-center text-2xl`}>
              {getPlatformIcon(integration.platform)}
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <CardDescription className="capitalize">
                {integration.platform.replace('-', ' ')}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={integration.isActive}
              onCheckedChange={(checked) => onToggle(integration.id, checked)}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(integration.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {integration.baseUrl && (
            <div>
              <span className="text-muted-foreground">URL: </span>
              <span className="font-mono text-xs">{integration.baseUrl}</span>
            </div>
          )}
          {integration.username && (
            <div>
              <span className="text-muted-foreground">Username: </span>
              <span>{integration.username}</span>
            </div>
          )}
          {integration.lastSyncedAt && (
            <div>
              <span className="text-muted-foreground">Last synced: </span>
              <span>{formatRelativeTime(integration.lastSyncedAt)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
