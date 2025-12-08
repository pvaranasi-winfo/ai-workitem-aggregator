import { ExternalTicket } from '@/types'
import { JiraClient } from './jira'
import { GitHubClient } from './github'
import { GitLabClient } from './gitlab'
import { AzureDevOpsClient } from './azure-devops'
import { BitbucketClient } from './bitbucket'

export async function fetchTicketsFromPlatform(
  platform: string,
  token: string,
  baseUrl?: string,
  username?: string,
  userEmail?: string
): Promise<ExternalTicket[]> {
  switch (platform) {
    case 'jira':
      if (!baseUrl || !username) {
        throw new Error('Jira requires baseUrl and username')
      }
      const jiraClient = new JiraClient(baseUrl, username, token)
      return await jiraClient.getAssignedIssues(username)

    case 'github':
      const githubClient = new GitHubClient(token)
      return await githubClient.getAssignedIssues()

    case 'gitlab':
      const gitlabClient = new GitLabClient(token, baseUrl)
      return await gitlabClient.getAssignedIssues()

    case 'azure-devops':
      if (!baseUrl || !userEmail) {
        throw new Error('Azure DevOps requires baseUrl and userEmail')
      }
      const azureClient = new AzureDevOpsClient(baseUrl, token)
      return await azureClient.getAssignedWorkItems(userEmail)

    case 'bitbucket':
      if (!username) {
        throw new Error('Bitbucket requires username')
      }
      const bitbucketClient = new BitbucketClient(username, token)
      return await bitbucketClient.getAssignedIssues()

    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}

export async function testPlatformConnection(
  platform: string,
  token: string,
  baseUrl?: string,
  username?: string
): Promise<boolean> {
  try {
    switch (platform) {
      case 'jira':
        if (!baseUrl || !username) return false
        const jiraClient = new JiraClient(baseUrl, username, token)
        return await jiraClient.testConnection()

      case 'github':
        const githubClient = new GitHubClient(token)
        return await githubClient.testConnection()

      case 'gitlab':
        const gitlabClient = new GitLabClient(token, baseUrl)
        return await gitlabClient.testConnection()

      case 'azure-devops':
        if (!baseUrl) return false
        const azureClient = new AzureDevOpsClient(baseUrl, token)
        return await azureClient.testConnection()

      case 'bitbucket':
        if (!username) return false
        const bitbucketClient = new BitbucketClient(username, token)
        return await bitbucketClient.testConnection()

      default:
        return false
    }
  } catch (error) {
    console.error('Connection test failed:', error)
    return false
  }
}
