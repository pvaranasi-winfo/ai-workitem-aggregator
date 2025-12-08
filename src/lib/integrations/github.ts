import axios, { AxiosInstance } from 'axios'
import { ExternalTicket } from '@/types'

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body?: string
  state: string
  labels: Array<{ name: string }>
  assignee?: { login: string; email?: string }
  user: { login: string; email?: string }
  created_at: string
  updated_at: string
  html_url: string
  repository_url: string
  pull_request?: any
}

export class GitHubClient {
  private client: AxiosInstance

  constructor(token: string) {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/user')
      return true
    } catch (error) {
      console.error('GitHub connection test failed:', error)
      return false
    }
  }

  async getAssignedIssues(): Promise<ExternalTicket[]> {
    try {
      const [issuesResponse, prResponse] = await Promise.all([
        this.client.get('/issues', {
          params: {
            filter: 'assigned',
            state: 'all',
            per_page: 100,
            sort: 'updated',
          },
        }),
        this.client.get('/issues', {
          params: {
            filter: 'assigned',
            state: 'all',
            per_page: 100,
            sort: 'updated',
          },
        }),
      ])

      const issues: GitHubIssue[] = issuesResponse.data || []
      const filteredIssues = issues.filter(issue => !issue.pull_request)
      const pullRequests = issues.filter(issue => issue.pull_request)

      return [
        ...filteredIssues.map(issue => this.transformIssue(issue, 'issue')),
        ...pullRequests.map(pr => this.transformIssue(pr, 'pull_request')),
      ]
    } catch (error) {
      console.error('Failed to fetch GitHub issues:', error)
      throw new Error('Failed to fetch GitHub issues')
    }
  }

  private transformIssue(issue: GitHubIssue, type: 'issue' | 'pull_request'): ExternalTicket {
    const repoName = issue.repository_url.split('/').slice(-2).join('/')
    
    return {
      id: `${repoName}#${issue.number}`,
      title: issue.title,
      description: issue.body,
      status: issue.state,
      priority: this.extractPriority(issue.labels),
      type: type === 'pull_request' ? 'Pull Request' : 'Issue',
      assignee: issue.assignee?.email || issue.assignee?.login,
      reporter: issue.user?.email || issue.user?.login,
      projectKey: repoName.split('/')[1],
      projectName: repoName,
      labels: issue.labels.map(l => l.name),
      url: issue.html_url,
      createdAt: new Date(issue.created_at),
      updatedAt: new Date(issue.updated_at),
    }
  }

  private extractPriority(labels: Array<{ name: string }>): string | undefined {
    const priorityLabel = labels.find(l => 
      l.name.toLowerCase().includes('priority') || 
      l.name.toLowerCase().includes('p0') ||
      l.name.toLowerCase().includes('p1') ||
      l.name.toLowerCase().includes('critical')
    )
    return priorityLabel?.name
  }
}
