import { KantataTokens, KantataWorkspace, KantataTimeEntry, KantataTask } from '@/types'

export class KantataIntegration {
  private subdomain: string
  private accessToken: string

  constructor(config: {
    subdomain: string
    accessToken: string
  }) {
    this.subdomain = config.subdomain
    this.accessToken = config.accessToken
  }

  private get apiUrl() {
    return 'https://api.mavenlink.com/api/v1'
  }

  /**
   * Make authenticated API request using personal access token
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Access token not available')
    }

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API request failed: ${response.status} ${error}`)
    }

    return response.json()
  }

  /**
   * Test connection by fetching user info
   */
  async testConnection(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const data = await this.makeRequest('/user')
      return { 
        success: true, 
        user: data.user || data 
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message 
      }
    }
  }

  /**
   * Fetch workspaces
   */
  async fetchWorkspaces(): Promise<KantataWorkspace[]> {
    const data = await this.makeRequest('/workspaces.json')
    return data.workspaces || []
  }

  /**
   * Fetch tasks/stories from workspaces
   */
  async fetchTasks(workspaceIds?: string[]): Promise<KantataTask[]> {
    let endpoint = '/stories.json'
    
    if (workspaceIds && workspaceIds.length > 0) {
      endpoint += `?workspace_id=${workspaceIds.join(',')}`
    }

    const data = await this.makeRequest(endpoint)
    return data.stories || []
  }

  /**
   * Fetch time entries
   */
  async fetchTimeEntries(params?: {
    workspaceId?: string
    startDate?: string
    endDate?: string
  }): Promise<KantataTimeEntry[]> {
    let endpoint = '/time_entries.json'
    const searchParams = new URLSearchParams()

    if (params?.workspaceId) {
      searchParams.append('workspace_id', params.workspaceId)
    }
    if (params?.startDate) {
      searchParams.append('start_date', params.startDate)
    }
    if (params?.endDate) {
      searchParams.append('end_date', params.endDate)
    }

    if (searchParams.toString()) {
      endpoint += `?${searchParams.toString()}`
    }

    const data = await this.makeRequest(endpoint)
    return data.time_entries || []
  }
}