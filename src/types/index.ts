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

export type Platform = 'jira' | 'github' | 'gitlab' | 'azure-devops' | 'bitbucket' | 'kantata'

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

export interface KantataTokens {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_in?: number
}

export interface KantataWorkspace {
  id: string
  title: string
  description?: string
  archived_at?: string
  project_tracker_template_id?: string
}

export interface KantataTimeEntry {
  id: string
  date_performed: string
  time_in_minutes: number
  notes?: string
  workspace_id?: string
  story_id?: string
}

export interface KantataTask {
  id: string
  title: string
  description?: string
  story_type: string
  state: string
  workspace_id?: string
}
