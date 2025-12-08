import axios, { AxiosInstance } from 'axios'
import { ExternalTicket } from '@/types'

export interface JiraIssue {
  id: string
  key: string
  fields: {
    summary: string
    description?: string
    status: { name: string }
    priority?: { name: string }
    issuetype: { name: string }
    assignee?: { emailAddress: string; displayName: string }
    reporter?: { emailAddress: string; displayName: string }
    project: { key: string; name: string }
    labels?: string[]
    created: string
    updated: string
    duedate?: string
  }
}

export class JiraClient {
  private client: AxiosInstance
  private baseUrl: string

  constructor(baseUrl: string, email: string, apiToken: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.client = axios.create({
      baseURL: `${this.baseUrl}/rest/api/3`,
      auth: {
        username: email,
        password: apiToken,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/myself')
      return true
    } catch (error) {
      console.error('Jira connection test failed:', error)
      return false
    }
  }

  async getAssignedIssues(email: string): Promise<ExternalTicket[]> {
    try {
      const jql = `assignee = "${email}" ORDER BY updated DESC`
      const response = await this.client.get('/search', {
        params: {
          jql,
          maxResults: 100,
          fields: 'summary,description,status,priority,issuetype,assignee,reporter,project,labels,created,updated,duedate',
        },
      })

      const issues: JiraIssue[] = response.data.issues || []
      return issues.map(issue => this.transformIssue(issue))
    } catch (error) {
      console.error('Failed to fetch Jira issues:', error)
      throw new Error('Failed to fetch Jira issues')
    }
  }

  private transformIssue(issue: JiraIssue): ExternalTicket {
    return {
      id: issue.key,
      title: issue.fields.summary,
      description: issue.fields.description,
      status: issue.fields.status.name,
      priority: issue.fields.priority?.name,
      type: issue.fields.issuetype.name,
      assignee: issue.fields.assignee?.emailAddress,
      reporter: issue.fields.reporter?.emailAddress,
      projectKey: issue.fields.project.key,
      projectName: issue.fields.project.name,
      labels: issue.fields.labels || [],
      url: `${this.baseUrl}/browse/${issue.key}`,
      createdAt: new Date(issue.fields.created),
      updatedAt: new Date(issue.fields.updated),
      dueDate: issue.fields.duedate ? new Date(issue.fields.duedate) : undefined,
    }
  }
}
