'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime, getStatusColor, getPriorityColor, getPlatformIcon } from '@/lib/utils'
import { Ticket } from '@/types'
import { ExternalLink } from 'lucide-react'

interface TicketCardProps {
  ticket: Ticket
}

export function TicketCard({ ticket }: TicketCardProps) {
  let labels: string[] = []
  
  if (typeof ticket.labels === 'string') {
    try {
      labels = JSON.parse(ticket.labels)
    } catch {
      labels = []
    }
  } else if (Array.isArray(ticket.labels)) {
    labels = ticket.labels
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{getPlatformIcon(ticket.platform)}</span>
              <span className="text-xs text-muted-foreground font-mono">
                {ticket.externalId}
              </span>
            </div>
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {ticket.title}
            </CardTitle>
          </div>
          {ticket.url && (
            <a
              href={ticket.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        {ticket.description && (
          <CardDescription className="line-clamp-2 mt-2">
            {ticket.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge
            className={`${getStatusColor(ticket.status)} text-white`}
            variant="secondary"
          >
            {ticket.status}
          </Badge>
          {ticket.priority && (
            <Badge
              className={`${getPriorityColor(ticket.priority)} text-white`}
              variant="secondary"
            >
              {ticket.priority}
            </Badge>
          )}
          {ticket.type && (
            <Badge variant="outline">{ticket.type}</Badge>
          )}
        </div>
          
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {labels.slice(0, 3).map((label, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {label}
              </Badge>
            ))}
            {labels.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{labels.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{ticket.projectName || ticket.projectKey}</span>
          <span>{formatRelativeTime(ticket.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
