import axios, { AxiosInstance } from 'axios'
import { ExternalTicket } from '@/types'

export interface BitbucketIssue {
  id: number
  title: string
  content?: { raw: string }
  state: string
  priority: string
  kind: string
  assignee?: { nickname: string }
  reporter: { nickname: string }
  created_on: string
  updated_on: string
  links: {
    html: { href: string }
  }
  repository: {
    name: string
    full_name: string
  }
}

export interface BitbucketPullRequest {
  id: number
  title: string
  description?: string
  state: string
  author: { nickname: string }
  participants: Array<{ user: { nickname: string }; role: string }>
  created_on: string
  updated_on: string
  links: {
    html: { href: string }
  }
  source: {
    repository: {
      name: string
      full_name: string
    }
  }
}

export class BitbucketClient {
  private client: AxiosInstance
  private username: string

  constructor(username: string, appPassword: string) {
    this.username = username
    this.client = axios.create({
      baseURL: 'https://api.bitbucket.org/2.0',
      auth: {
        username,
        password: appPassword,
      },
    })
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/user')
      return true
    } catch (error) {
      console.error('Bitbucket connection test failed:', error)
      return false
    }
  }

  async getAssignedIssues(): Promise<ExternalTicket[]> {
    try {
      // Get repositories the user has access to
      const reposResponse = await this.client.get('/repositories', {
        params: {
          role: 'member',
          pagelen: 100,
        },
      })

      const repositories = reposResponse.data.values || []
      
      // Fetch issues and PRs from all repositories
      const issuesPromises = repositories.map((repo: any) =>
        this.getRepositoryIssues(repo.full_name)
      )
      
      const prsPromises = repositories.map((repo: any) =>
        this.getRepositoryPullRequests(repo.full_name)
      )

      const issuesArrays = await Promise.all(issuesPromises)
      const prsArrays = await Promise.all(prsPromises)

      const allIssues = issuesArrays.flat()
      const allPRs = prsArrays.flat()

      return [
        ...allIssues.map(issue => this.transformIssue(issue)),
        ...allPRs.map(pr => this.transformPullRequest(pr)),
      ]
    } catch (error) {
      console.error('Failed to fetch Bitbucket issues:', error)
      throw new Error('Failed to fetch Bitbucket issues')
    }
  }

  private async getRepositoryIssues(repoFullName: string): Promise<BitbucketIssue[]> {
    try {
      const response = await this.client.get(`/repositories/${repoFullName}/issues`, {
        params: {
          q: `assignee.nickname="${this.username}"`,
          pagelen: 50,
        },
      })
      return response.data.values || []
    } catch (error) {
      // Repository might not have issues enabled
      return []
    }
  }

  private async getRepositoryPullRequests(repoFullName: string): Promise<BitbucketPullRequest[]> {
    try {
      const response = await this.client.get(`/repositories/${repoFullName}/pullrequests`, {
        params: {
          state: 'OPEN',
          pagelen: 50,
        },
      })
      
      const prs: BitbucketPullRequest[] = response.data.values || []
      // Filter PRs where user is a reviewer or author
      return prs.filter(pr => 
        pr.author.nickname === this.username ||
        pr.participants.some(p => p.user.nickname === this.username && p.role === 'REVIEWER')
      )
    } catch (error) {
      return []
    }
  }

  private transformIssue(issue: BitbucketIssue): ExternalTicket {
    return {
      id: `${issue.repository.full_name}#${issue.id}`,
      title: issue.title,
      description: issue.content?.raw,
      status: issue.state,
      priority: issue.priority,
      type: issue.kind,
      assignee: issue.assignee?.nickname,
      reporter: issue.reporter?.nickname,
      projectKey: issue.repository.name,
      projectName: issue.repository.full_name,
      labels: [],
      url: issue.links.html.href,
      createdAt: new Date(issue.created_on),
      updatedAt: new Date(issue.updated_on),
    }
  }

  private transformPullRequest(pr: BitbucketPullRequest): ExternalTicket {
    const reviewer = pr.participants.find(p => p.role === 'REVIEWER')
    
    return {
      id: `${pr.source.repository.full_name}#${pr.id}`,
      title: pr.title,
      description: pr.description,
      status: pr.state,
      type: 'Pull Request',
      assignee: reviewer?.user.nickname,
      reporter: pr.author.nickname,
      projectKey: pr.source.repository.name,
      projectName: pr.source.repository.full_name,
      labels: [],
      url: pr.links.html.href,
      createdAt: new Date(pr.created_on),
      updatedAt: new Date(pr.updated_on),
    }
  }
}
