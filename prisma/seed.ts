import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'dummy@example.com' },
    update: {},
    create: {
      email: 'dummy@example.com',
      name: 'Demo User',
    },
  });

  console.log('✓ Created user:', user.email);

  // Create integrations for the user
  const jiraIntegration = await prisma.integration.upsert({
    where: {
      userId_platform_name: {
        userId: user.id,
        platform: 'jira',
        name: 'Jira Cloud',
      },
    },
    update: {},
    create: {
      userId: user.id,
      platform: 'jira',
      name: 'Jira Cloud',
      token: 'encrypted_jira_token',
      baseUrl: 'https://your-domain.atlassian.net',
      isActive: true,
    },
  });

  const githubIntegration = await prisma.integration.upsert({
    where: {
      userId_platform_name: {
        userId: user.id,
        platform: 'github',
        name: 'GitHub',
      },
    },
    update: {},
    create: {
      userId: user.id,
      platform: 'github',
      name: 'GitHub',
      token: 'encrypted_github_token',
      isActive: true,
    },
  });

  const gitlabIntegration = await prisma.integration.upsert({
    where: {
      userId_platform_name: {
        userId: user.id,
        platform: 'gitlab',
        name: 'GitLab',
      },
    },
    update: {},
    create: {
      userId: user.id,
      platform: 'gitlab',
      name: 'GitLab',
      token: 'encrypted_gitlab_token',
      isActive: true,
    },
  });

  const azureIntegration = await prisma.integration.upsert({
    where: {
      userId_platform_name: {
        userId: user.id,
        platform: 'azure-devops',
        name: 'Azure DevOps',
      },
    },
    update: {},
    create: {
      userId: user.id,
      platform: 'azure-devops',
      name: 'Azure DevOps',
      token: 'encrypted_azure_token',
      baseUrl: 'https://dev.azure.com/your-org',
      isActive: true,
    },
  });

  const bitbucketIntegration = await prisma.integration.upsert({
    where: {
      userId_platform_name: {
        userId: user.id,
        platform: 'bitbucket',
        name: 'Bitbucket',
      },
    },
    update: {},
    create: {
      userId: user.id,
      platform: 'bitbucket',
      name: 'Bitbucket',
      token: 'encrypted_bitbucket_token',
      isActive: true,
    },
  });

  console.log('✓ Created 5 integrations');

  // Create sample tickets
  const tickets = [
    {
      externalId: 'PROJ-101',
      platform: 'jira',
      integrationId: jiraIntegration.id,
      title: 'Implement user authentication system',
      description: 'Add OAuth2 authentication with social login support',
      status: 'In Progress',
      priority: 'High',
      type: 'Feature',
      assignee: 'John Doe',
      reporter: 'Jane Smith',
      projectKey: 'PROJ',
      projectName: 'Main Project',
      labels: JSON.stringify(['backend', 'security']),
      url: 'https://jira.example.com/browse/PROJ-101',
      createdAt: new Date('2025-11-20'),
      updatedAt: new Date('2025-12-07'),
      dueDate: new Date('2025-12-15'),
      estimatedHours: 24,
      loggedHours: 16,
      remainingHours: 8,
      sprint: 'Sprint 24',
      storyPoints: 8,
      ticketId: 'PROJ-101',
    },
    {
      externalId: 'PROJ-102',
      platform: 'jira',
      integrationId: jiraIntegration.id,
      title: 'Fix database connection pooling',
      description: 'Optimize connection pool settings for better performance',
      status: 'In Progress',
      priority: 'Critical',
      type: 'Bug',
      assignee: 'John Doe',
      reporter: 'Tech Lead',
      projectKey: 'PROJ',
      projectName: 'Main Project',
      labels: JSON.stringify(['database', 'performance']),
      url: 'https://jira.example.com/browse/PROJ-102',
      createdAt: new Date('2025-12-01'),
      updatedAt: new Date('2025-12-08'),
      dueDate: new Date('2025-12-10'),
      estimatedHours: 8,
      loggedHours: 5,
      remainingHours: 3,
      sprint: 'Sprint 23',
      storyPoints: 5,
      ticketId: 'PROJ-102',
    },
    {
      externalId: 'PROJ-103',
      platform: 'jira',
      integrationId: jiraIntegration.id,
      title: 'Optimize image loading performance',
      description: 'Implement lazy loading and image compression',
      status: 'Done',
      priority: 'Medium',
      type: 'Performance',
      assignee: 'John Doe',
      reporter: 'Performance Team',
      projectKey: 'PROJ',
      projectName: 'Frontend Optimization',
      labels: JSON.stringify(['performance', 'frontend']),
      url: 'https://jira.example.com/browse/PROJ-103',
      createdAt: new Date('2025-11-18'),
      updatedAt: new Date('2025-12-02'),
      dueDate: new Date('2025-12-02'),
      estimatedHours: 6,
      loggedHours: 6,
      remainingHours: 0,
      sprint: 'Sprint 23',
      storyPoints: 3,
      ticketId: 'PROJ-103',
    },
    {
      externalId: '123',
      platform: 'github',
      integrationId: githubIntegration.id,
      title: 'Update README with installation instructions',
      description: 'Add comprehensive setup guide for new developers',
      status: 'To Do',
      priority: 'Medium',
      type: 'Documentation',
      assignee: 'John Doe',
      reporter: 'Product Manager',
      projectKey: 'repo',
      projectName: 'Documentation',
      labels: JSON.stringify(['documentation', 'good-first-issue']),
      url: 'https://github.com/example/repo/issues/123',
      createdAt: new Date('2025-12-05'),
      updatedAt: new Date('2025-12-05'),
      dueDate: new Date('2025-12-20'),
      estimatedHours: 4,
      loggedHours: 0,
      remainingHours: 4,
      sprint: 'Sprint 24',
      storyPoints: 2,
      ticketId: '#123',
    },
    {
      externalId: '124',
      platform: 'github',
      integrationId: githubIntegration.id,
      title: 'Add unit tests for API endpoints',
      description: 'Increase test coverage for REST API',
      status: 'In Progress',
      priority: 'High',
      type: 'Task',
      assignee: 'John Doe',
      reporter: 'QA Lead',
      projectKey: 'repo',
      projectName: 'Testing',
      labels: JSON.stringify(['testing', 'api']),
      url: 'https://github.com/example/repo/issues/124',
      createdAt: new Date('2025-11-28'),
      updatedAt: new Date('2025-12-08'),
      dueDate: new Date('2025-12-12'),
      estimatedHours: 16,
      loggedHours: 12,
      remainingHours: 4,
      sprint: 'Sprint 23',
      storyPoints: 5,
      ticketId: '#124',
    },
    {
      externalId: '125',
      platform: 'github',
      integrationId: githubIntegration.id,
      title: 'Implement dark mode theme',
      description: 'Add dark mode support across the application',
      status: 'In Progress',
      priority: 'Low',
      type: 'Feature',
      assignee: 'John Doe',
      reporter: 'UX Designer',
      projectKey: 'repo',
      projectName: 'UI Enhancements',
      labels: JSON.stringify(['ui', 'enhancement']),
      url: 'https://github.com/example/repo/issues/125',
      createdAt: new Date('2025-12-04'),
      updatedAt: new Date('2025-12-08'),
      dueDate: new Date('2025-12-25'),
      estimatedHours: 14,
      loggedHours: 4,
      remainingHours: 10,
      sprint: 'Sprint 24',
      storyPoints: 5,
      ticketId: '#125',
    },
    {
      externalId: '45',
      platform: 'gitlab',
      integrationId: gitlabIntegration.id,
      title: 'Refactor legacy code in payment module',
      description: 'Modernize payment processing code',
      status: 'In Review',
      priority: 'Medium',
      type: 'Refactoring',
      assignee: 'John Doe',
      reporter: 'Team Lead',
      projectKey: 'project',
      projectName: 'Payment System',
      labels: JSON.stringify(['refactoring', 'payment']),
      url: 'https://gitlab.com/example/project/-/issues/45',
      createdAt: new Date('2025-11-15'),
      updatedAt: new Date('2025-12-06'),
      dueDate: new Date('2025-12-18'),
      estimatedHours: 20,
      loggedHours: 18,
      remainingHours: 2,
      sprint: 'Sprint 23',
      storyPoints: 8,
      ticketId: '!45',
    },
    {
      externalId: '46',
      platform: 'gitlab',
      integrationId: gitlabIntegration.id,
      title: 'Security audit for authentication',
      description: 'Conduct comprehensive security review',
      status: 'To Do',
      priority: 'Critical',
      type: 'Security',
      assignee: 'John Doe',
      reporter: 'Security Team',
      projectKey: 'project',
      projectName: 'Security',
      labels: JSON.stringify(['security', 'audit']),
      url: 'https://gitlab.com/example/project/-/issues/46',
      createdAt: new Date('2025-12-06'),
      updatedAt: new Date('2025-12-06'),
      dueDate: new Date('2025-12-13'),
      estimatedHours: 16,
      loggedHours: 0,
      remainingHours: 16,
      sprint: 'Sprint 24',
      storyPoints: 8,
      ticketId: '!46',
    },
    {
      externalId: '1001',
      platform: 'azure-devops',
      integrationId: azureIntegration.id,
      title: 'Design new dashboard layout',
      description: 'Create mockups for new analytics dashboard',
      status: 'Done',
      priority: 'High',
      type: 'Design',
      assignee: 'John Doe',
      reporter: 'Design Lead',
      projectKey: 'WI',
      projectName: 'Analytics Dashboard',
      labels: JSON.stringify(['design', 'dashboard']),
      url: 'https://dev.azure.com/org/project/_workitems/edit/1001',
      createdAt: new Date('2025-11-10'),
      updatedAt: new Date('2025-11-30'),
      dueDate: new Date('2025-11-30'),
      estimatedHours: 12,
      loggedHours: 12,
      remainingHours: 0,
      sprint: 'Sprint 23',
      storyPoints: 5,
      ticketId: 'WI-1001',
    },
    {
      externalId: '67',
      platform: 'bitbucket',
      integrationId: bitbucketIntegration.id,
      title: 'Configure CI/CD pipeline',
      description: 'Set up automated build and deployment',
      status: 'To Do',
      priority: 'High',
      type: 'DevOps',
      assignee: 'John Doe',
      reporter: 'DevOps Engineer',
      projectKey: 'BB',
      projectName: 'Infrastructure',
      labels: JSON.stringify(['devops', 'ci-cd']),
      url: 'https://bitbucket.org/workspace/repo/issues/67',
      createdAt: new Date('2025-12-03'),
      updatedAt: new Date('2025-12-03'),
      dueDate: new Date('2025-12-22'),
      estimatedHours: 10,
      loggedHours: 0,
      remainingHours: 10,
      sprint: 'Sprint 24',
      storyPoints: 3,
      ticketId: 'BB-67',
    },
  ];

  // Delete existing tickets for this user to avoid duplicates
  await prisma.ticket.deleteMany({
    where: { userId: user.id },
  });

  // Create all tickets
  for (const ticketData of tickets) {
    await prisma.ticket.create({
      data: {
        ...ticketData,
        userId: user.id,
      },
    });
  }

  console.log('✓ Created 10 sample tickets');

  // Create some time entries
  const ticket1 = await prisma.ticket.findFirst({
    where: { externalId: 'PROJ-101', userId: user.id },
  });

  const ticket2 = await prisma.ticket.findFirst({
    where: { externalId: '124', userId: user.id },
  });

  if (ticket1) {
    await prisma.timeEntry.createMany({
      data: [
        {
          ticketId: ticket1.id,
          userId: user.id,
          date: new Date('2025-12-02'),
          hours: 4,
          description: 'Set up OAuth2 configuration',
        },
        {
          ticketId: ticket1.id,
          userId: user.id,
          date: new Date('2025-12-03'),
          hours: 6,
          description: 'Implemented social login providers',
        },
        {
          ticketId: ticket1.id,
          userId: user.id,
          date: new Date('2025-12-05'),
          hours: 6,
          description: 'Added unit tests for authentication',
        },
      ],
    });
  }

  if (ticket2) {
    await prisma.timeEntry.createMany({
      data: [
        {
          ticketId: ticket2.id,
          userId: user.id,
          date: new Date('2025-12-04'),
          hours: 5,
          description: 'Created test framework setup',
        },
        {
          ticketId: ticket2.id,
          userId: user.id,
          date: new Date('2025-12-06'),
          hours: 4,
          description: 'Wrote tests for user endpoints',
        },
        {
          ticketId: ticket2.id,
          userId: user.id,
          date: new Date('2025-12-07'),
          hours: 3,
          description: 'Added tests for ticket endpoints',
        },
      ],
    });
  }

  console.log('✓ Created sample time entries');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('  - User: dummy@example.com');
  console.log('  - Integrations: 5 (Jira, GitHub, GitLab, Azure DevOps, Bitbucket)');
  console.log('  - Tickets: 10');
  console.log('  - Time Entries: 6');
  console.log('');
  console.log('🚀 You can now login with: dummy@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
