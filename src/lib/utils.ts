import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 7) return formatDate(d)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

export function getPriorityColor(priority?: string): string {
  if (!priority) return 'bg-gray-500'
  
  const p = priority.toLowerCase()
  if (p.includes('critical') || p.includes('highest')) return 'bg-red-500'
  if (p.includes('high')) return 'bg-orange-500'
  if (p.includes('medium')) return 'bg-yellow-500'
  if (p.includes('low')) return 'bg-blue-500'
  return 'bg-gray-500'
}

export function getStatusColor(status?: string): string {
  if (!status) return 'bg-gray-500'
  
  const s = status.toLowerCase()
  if (s.includes('done') || s.includes('closed') || s.includes('merged') || s.includes('resolved')) return 'bg-green-500'
  if (s.includes('progress') || s.includes('review')) return 'bg-blue-500'
  if (s.includes('blocked')) return 'bg-red-500'
  if (s.includes('todo') || s.includes('open') || s.includes('new')) return 'bg-gray-500'
  return 'bg-purple-500'
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    jira: '🔷',
    github: '🐙',
    gitlab: '🦊',
    'azure-devops': '🔵',
    bitbucket: '🪣',
  }
  return icons[platform] || '📋'
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    jira: 'from-blue-500 to-blue-600',
    github: 'from-gray-700 to-gray-900',
    gitlab: 'from-orange-500 to-red-600',
    'azure-devops': 'from-blue-600 to-blue-700',
    bitbucket: 'from-blue-400 to-blue-500',
  }
  return colors[platform] || 'from-gray-500 to-gray-600'
}
