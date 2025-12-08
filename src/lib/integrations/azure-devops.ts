import axios, { AxiosInstance } from 'axios'
import { ExternalTicket } from '@/types'

export interface AzureWorkItem {
  id: number
  fields: {
    'System.Title': string
    'System.Description'?: string
    'System.State': string
    'System.WorkItemType': string
    'Microsoft.VSTS.Common.Priority'?: number
    'System.AssignedTo'?: { displayName: string; uniqueName: string }
    'System.CreatedBy'?: { displayName: string; uniqueName: string }
    'System.AreaPath'?: string
    'System.TeamProject': string
    'System.Tags'?: string
    'System.CreatedDate': string
    'System.ChangedDate': string
    'Microsoft.VSTS.Scheduling.DueDate'?: string
  }
  url: string
  _links: {
    html: { href: string }
  }
}

export class AzureDevOpsClient {
  private client: AxiosInstance
  private baseUrl: string

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.client = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: '',
        password: token,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/_apis/projects?api-version=7.0')
      return true
    } catch (error) {
      console.error('Azure DevOps connection test failed:', error)
      return false
    }
  }

  async getAssignedWorkItems(userEmail: string): Promise<ExternalTicket[]> {
    try {
      // First, get the user's assigned work items using WIQL
      const wiqlQuery = {
        query: `SELECT [System.Id] FROM WorkItems WHERE [System.AssignedTo] = '${userEmail}' ORDER BY [System.ChangedDate] DESC`,
      }

      const wiqlResponse = await this.client.post(
        '/_apis/wit/wiql?api-version=7.0',
        wiqlQuery
      )

      const workItemRefs = wiqlResponse.data.workItems || []
      
      if (workItemRefs.length === 0) {
        return []
      }

      // Fetch full work item details
      const ids = workItemRefs.map((ref: any) => ref.id).join(',')
      const workItemsResponse = await this.client.get(
        `/_apis/wit/workitems?ids=${ids}&api-version=7.0`
      )

      const workItems: AzureWorkItem[] = workItemsResponse.data.value || []
      return workItems.map(item => this.transformWorkItem(item))
    } catch (error) {
      console.error('Failed to fetch Azure DevOps work items:', error)
      throw new Error('Failed to fetch Azure DevOps work items')
    }
  }

  private transformWorkItem(item: AzureWorkItem): ExternalTicket {
    const fields = item.fields
    const tags = fields['System.Tags']?.split(';').map(t => t.trim()).filter(Boolean) || []
    
    return {
      id: item.id.toString(),
      title: fields['System.Title'],
      description: fields['System.Description'],
      status: fields['System.State'],
      priority: fields['Microsoft.VSTS.Common.Priority']?.toString(),
      type: fields['System.WorkItemType'],
      assignee: fields['System.AssignedTo']?.uniqueName,
      reporter: fields['System.CreatedBy']?.uniqueName,
      projectKey: fields['System.TeamProject'],
      projectName: fields['System.TeamProject'],
      labels: tags,
      url: item._links.html.href,
      createdAt: new Date(fields['System.CreatedDate']),
      updatedAt: new Date(fields['System.ChangedDate']),
      dueDate: fields['Microsoft.VSTS.Scheduling.DueDate'] 
        ? new Date(fields['Microsoft.VSTS.Scheduling.DueDate']) 
        : undefined,
    }
  }
}
