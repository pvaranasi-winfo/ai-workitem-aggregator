import { PlatformConfig } from '@/types'

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  jira: {
    name: 'Jira',
    description: 'Connect to Jira Cloud or Server to fetch your assigned issues',
    fields: [
      {
        name: 'name',
        label: 'Connection Name',
        type: 'text',
        placeholder: 'My Jira Workspace',
        required: true,
        helpText: 'A friendly name to identify this integration',
      },
      {
        name: 'baseUrl',
        label: 'Jira URL',
        type: 'url',
        placeholder: 'https://your-domain.atlassian.net',
        required: true,
        helpText: 'Your Jira instance URL',
      },
      {
        name: 'username',
        label: 'Email',
        type: 'text',
        placeholder: 'your-email@example.com',
        required: true,
        helpText: 'Your Jira account email',
      },
      {
        name: 'token',
        label: 'API Token',
        type: 'password',
        placeholder: 'Your Jira API token',
        required: true,
        helpText: 'Generate from: https://id.atlassian.com/manage/api-tokens',
      },
    ],
  },
  github: {
    name: 'GitHub',
    description: 'Connect to GitHub to fetch issues and pull requests assigned to you',
    fields: [
      {
        name: 'name',
        label: 'Connection Name',
        type: 'text',
        placeholder: 'My GitHub Account',
        required: true,
        helpText: 'A friendly name to identify this integration',
      },
      {
        name: 'token',
        label: 'Personal Access Token',
        type: 'password',
        placeholder: 'ghp_xxxxxxxxxxxx',
        required: true,
        helpText: 'Generate from: Settings > Developer settings > Personal access tokens',
      },
    ],
  },
  gitlab: {
    name: 'GitLab',
    description: 'Connect to GitLab.com or self-hosted GitLab to fetch your assigned issues and merge requests',
    fields: [
      {
        name: 'name',
        label: 'Connection Name',
        type: 'text',
        placeholder: 'My GitLab Account',
        required: true,
        helpText: 'A friendly name to identify this integration',
      },
      {
        name: 'baseUrl',
        label: 'GitLab URL',
        type: 'url',
        placeholder: 'https://gitlab.com',
        required: false,
        helpText: 'Leave as default for GitLab.com, or enter your self-hosted URL',
      },
      {
        name: 'token',
        label: 'Personal Access Token',
        type: 'password',
        placeholder: 'glpat-xxxxxxxxxxxx',
        required: true,
        helpText: 'Generate from: User Settings > Access Tokens',
      },
    ],
  },
  'azure-devops': {
    name: 'Azure DevOps',
    description: 'Connect to Azure DevOps to fetch work items assigned to you',
    fields: [
      {
        name: 'name',
        label: 'Connection Name',
        type: 'text',
        placeholder: 'My Azure DevOps',
        required: true,
        helpText: 'A friendly name to identify this integration',
      },
      {
        name: 'baseUrl',
        label: 'Organization URL',
        type: 'url',
        placeholder: 'https://dev.azure.com/your-org',
        required: true,
        helpText: 'Your Azure DevOps organization URL',
      },
      {
        name: 'token',
        label: 'Personal Access Token',
        type: 'password',
        placeholder: 'Your PAT',
        required: true,
        helpText: 'Generate from: User Settings > Personal Access Tokens',
      },
    ],
  },
  bitbucket: {
    name: 'Bitbucket',
    description: 'Connect to Bitbucket Cloud to fetch issues and pull requests',
    fields: [
      {
        name: 'name',
        label: 'Connection Name',
        type: 'text',
        placeholder: 'My Bitbucket Account',
        required: true,
        helpText: 'A friendly name to identify this integration',
      },
      {
        name: 'username',
        label: 'Bitbucket Username',
        type: 'text',
        placeholder: 'your-username',
        required: true,
        helpText: 'Your Bitbucket username',
      },
      {
        name: 'token',
        label: 'App Password',
        type: 'password',
        placeholder: 'Your app password',
        required: true,
        helpText: 'Generate from: Personal Settings > App passwords',
      },
    ],
  },
}

export const PLATFORMS = Object.keys(PLATFORM_CONFIGS) as Array<keyof typeof PLATFORM_CONFIGS>
