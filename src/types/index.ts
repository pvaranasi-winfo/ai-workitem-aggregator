export interface Ticket {
  id: string
  externalId: string
  platform: string
  title: string
  description?: string
  status: string
  priority?: string
  type?: string
  assignee?: string
  reporter?: string
  projectKey?: string
  projectName?: string
  labels?: string | string[]
  url?: string
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  syncedAt: Date
}

export interface Integration {
  id: string
  platform: string
  name: string
  baseUrl?: string
  username?: string
  isActive: boolean
  lastSyncedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IntegrationCreate {
  platform: string
  name: string
  token: string
  baseUrl?: string
  username?: string
}

export interface User {
  id: string
  email: string
  name?: string
}

export type Platform = 'jira' | 'github' | 'gitlab' | 'azure-devops' | 'bitbucket'

export interface PlatformConfig {
  name: string
  description: string
  fields: PlatformField[]
}

export interface PlatformField {
  name: string
  label: string
  type: 'text' | 'password' | 'url'
  placeholder?: string
  required: boolean
  helpText?: string
}

export interface ExternalTicket {
  id: string
  title: string
  description?: string
  status: string
  priority?: string
  type?: string
  assignee?: string
  reporter?: string
  projectKey?: string
  projectName?: string
  labels?: string[]
  url?: string
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
}

export interface SyncResult {
  success: boolean
  ticketCount: number
  error?: string
}
