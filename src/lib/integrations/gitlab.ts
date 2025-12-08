import axios, { AxiosInstance } from 'axios'
import { ExternalTicket } from '@/types'

export interface GitLabIssue {
  id: number
  iid: number
  title: string
  description?: string
  state: string
  labels: string[]
  assignee?: { email: string; name: string }
  author: { email: string; name: string }
  project_id: number
  web_url: string
  created_at: string
  updated_at: string
  due_date?: string
}

export interface GitLabMergeRequest {
  id: number
  iid: number
  title: string
  description?: string
  state: string
  labels: string[]
  assignee?: { email: string; name: string }
  author: { email: string; name: string }
  project_id: number
  web_url: string
  created_at: string
  updated_at: string
}

export interface GitLabProject {
  id: number
  name: string
  path_with_namespace: string
}

export class GitLabClient {
  private client: AxiosInstance
  private projectsCache: Map<number, GitLabProject> = new Map()

  constructor(token: string, baseUrl: string = 'https://gitlab.com') {
    this.client = axios.create({
      baseURL: `${baseUrl.replace(/\/$/, '')}/api/v4`,
      headers: {
        'PRIVATE-TOKEN': token,
      },
    })
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/user')
      return true
    } catch (error) {
      console.error('GitLab connection test failed:', error)
      return false
    }
  }

  async getAssignedIssues(): Promise<ExternalTicket[]> {
    try {
      const [issuesResponse, mrsResponse] = await Promise.all([
        this.client.get('/issues', {
          params: {
            scope: 'assigned_to_me',
            state: 'opened',
            per_page: 100,
          },
        }),
        this.client.get('/merge_requests', {
          params: {
            scope: 'assigned_to_me',
            state: 'opened',
            per_page: 100,
          },
        }),
      ])

      const issues: GitLabIssue[] = issuesResponse.data || []
      const mrs: GitLabMergeRequest[] = mrsResponse.data || []

      // Fetch project details
      const projectIds = new Set([
        ...issues.map(i => i.project_id),
        ...mrs.map(mr => mr.project_id),
      ])
      
      await this.fetchProjects(Array.from(projectIds))

      return [
        ...issues.map(issue => this.transformIssue(issue)),
        ...mrs.map(mr => this.transformMergeRequest(mr)),
      ]
    } catch (error) {
      console.error('Failed to fetch GitLab issues:', error)
      throw new Error('Failed to fetch GitLab issues')
    }
  }

  private async fetchProjects(projectIds: number[]): Promise<void> {
    const promises = projectIds.map(async (id) => {
      if (!this.projectsCache.has(id)) {
        try {
          const response = await this.client.get(`/projects/${id}`)
          this.projectsCache.set(id, response.data)
        } catch (error) {
          console.error(`Failed to fetch project ${id}:`, error)
        }
      }
    })
    await Promise.all(promises)
  }

  private transformIssue(issue: GitLabIssue): ExternalTicket {
    const project = this.projectsCache.get(issue.project_id)
    
    return {
      id: `${project?.path_with_namespace || issue.project_id}#${issue.iid}`,
      title: issue.title,
      description: issue.description,
      status: issue.state,
      priority: this.extractPriority(issue.labels),
      type: 'Issue',
      assignee: issue.assignee?.email,
      reporter: issue.author?.email,
      projectKey: project?.name,
      projectName: project?.path_with_namespace,
      labels: issue.labels,
      url: issue.web_url,
      createdAt: new Date(issue.created_at),
      updatedAt: new Date(issue.updated_at),
      dueDate: issue.due_date ? new Date(issue.due_date) : undefined,
    }
  }

  private transformMergeRequest(mr: GitLabMergeRequest): ExternalTicket {
    const project = this.projectsCache.get(mr.project_id)
    
    return {
      id: `${project?.path_with_namespace || mr.project_id}!${mr.iid}`,
      title: mr.title,
      description: mr.description,
      status: mr.state,
      priority: this.extractPriority(mr.labels),
      type: 'Merge Request',
      assignee: mr.assignee?.email,
      reporter: mr.author?.email,
      projectKey: project?.name,
      projectName: project?.path_with_namespace,
      labels: mr.labels,
      url: mr.web_url,
      createdAt: new Date(mr.created_at),
      updatedAt: new Date(mr.updated_at),
    }
  }

  private extractPriority(labels: string[]): string | undefined {
    const priorityLabel = labels.find(l => 
      l.toLowerCase().includes('priority') || 
      l.toLowerCase().includes('p::')
    )
    return priorityLabel
  }
}
