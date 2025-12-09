import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'dummy@example.com' },
    update: {},
    create: {
      email: 'dummy@example.com',
      name: 'Demo User',
      displayName: 'Demo User',
      jobTitle: 'Software Engineer',
      department: 'Engineering',
      officeLocation: 'Remote',
    },
  });

  console.log('Created user:', user.email);

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      title: 'E-Commerce Platform',
      description: 'Building next-generation e-commerce platform',
      capacity: 160,
      location: 'New York',
      status: 'Active',
      startDate: new Date('2025-01-01'),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Mobile App Redesign',
      description: 'Complete redesign of mobile applications',
      capacity: 80,
      location: 'San Francisco',
      status: 'Active',
      startDate: new Date('2025-02-01'),
    },
  });

  const project3 = await prisma.project.create({
    data: {
      title: 'Data Analytics Dashboard',
      description: 'Business intelligence and analytics platform',
      capacity: 120,
      location: 'Remote',
      status: 'Active',
      startDate: new Date('2025-01-15'),
    },
  });

  console.log('Created projects');

  // Create user-project mappings
  await prisma.userProject.create({
    data: {
      userId: user.id,
      projectId: project1.id,
      role: 'Lead Developer',
      allocationPercentage: 50,
      startDate: new Date('2025-01-01'),
    },
  });

  await prisma.userProject.create({
    data: {
      userId: user.id,
      projectId: project2.id,
      role: 'Developer',
      allocationPercentage: 30,
      startDate: new Date('2025-02-01'),
    },
  });

  await prisma.userProject.create({
    data: {
      userId: user.id,
      projectId: project3.id,
      role: 'Consultant',
      allocationPercentage: 20,
      startDate: new Date('2025-01-15'),
    },
  });

  console.log('Created user-project mappings');

  // Create integrations
  const integrations = [
    {
      userId: user.id,
      platform: 'jira',
      name: 'Company Jira',
      token: 'demo-token-jira',
      baseUrl: 'https://company.atlassian.net',
      isActive: true,
    },
    {
      userId: user.id,
      platform: 'github',
      name: 'GitHub Enterprise',
      token: 'demo-token-github',
      baseUrl: 'https://github.com/company',
      isActive: true,
    },
    {
      userId: user.id,
      platform: 'gitlab',
      name: 'GitLab Self-Hosted',
      token: 'demo-token-gitlab',
      baseUrl: 'https://gitlab.company.com',
      isActive: true,
    },
    {
      userId: user.id,
      platform: 'azure-devops',
      name: 'Azure DevOps',
      token: 'demo-token-azure',
      baseUrl: 'https://dev.azure.com/company',
      isActive: true,
    },
    {
      userId: user.id,
      platform: 'bitbucket',
      name: 'Bitbucket Cloud',
      token: 'demo-token-bitbucket',
      baseUrl: 'https://bitbucket.org/company',
      isActive: true,
    },
  ];

  for (const integration of integrations) {
    await prisma.integration.upsert({
      where: {
        userId_platform_name: {
          userId: integration.userId,
          platform: integration.platform,
          name: integration.name,
        },
      },
      update: {},
      create: integration,
    });
  }

  console.log('Created integrations');

  // Get created integrations
  const createdIntegrations = await prisma.integration.findMany({
    where: { userId: user.id },
  });

  // Create sample tickets
  const tickets = [
    {
      userId: user.id,
      integrationId: createdIntegrations[0].id,
      platform: 'jira',
      externalId: 'ECOM-123',
      ticketId: 'ECOM-123',
      title: 'Implement payment gateway integration',
      description: 'Add Stripe payment gateway to checkout flow',
      status: 'In Progress',
      priority: 'High',
      type: 'Feature',
      assignee: 'Demo User',
      reporter: 'Product Manager',
      projectKey: 'ECOM',
      projectName: 'E-Commerce Platform',
      labels: JSON.stringify(['backend', 'payment']),
      url: 'https://company.atlassian.net/browse/ECOM-123',
      createdAt: new Date('2025-12-01'),
      updatedAt: new Date('2025-12-08'),
      estimatedHours: 16,
      loggedHours: 8,
      remainingHours: 8,
      sprint: 'Sprint 24',
      storyPoints: 5,
    },
    {
      userId: user.id,
      integrationId: createdIntegrations[1].id,
      platform: 'github',
      externalId: '456',
      ticketId: 'GH-456',
      title: 'Fix mobile app crash on Android 14',
      description: 'App crashes when opening product details on Android 14',
      status: 'In Progress',
      priority: 'Critical',
      type: 'Bug',
      assignee: 'Demo User',
      reporter: 'QA Team',
      projectKey: 'MOBILE',
      projectName: 'Mobile App Redesign',
      labels: JSON.stringify(['android', 'bug', 'critical']),
      url: 'https://github.com/company/mobile-app/issues/456',
      createdAt: new Date('2025-12-05'),
      updatedAt: new Date('2025-12-08'),
      estimatedHours: 8,
      loggedHours: 4,
      remainingHours: 4,
      sprint: 'Sprint 12',
      storyPoints: 3,
    },
    {
      userId: user.id,
      integrationId: createdIntegrations[0].id,
      platform: 'jira',
      externalId: 'ECOM-124',
      ticketId: 'ECOM-124',
      title: 'Optimize database queries for product listing',
      description: 'Product listing page is slow, need to optimize queries',
      status: 'To Do',
      priority: 'Medium',
      type: 'Task',
      assignee: 'Demo User',
      reporter: 'Tech Lead',
      projectKey: 'ECOM',
      projectName: 'E-Commerce Platform',
      labels: JSON.stringify(['performance', 'database']),
      url: 'https://company.atlassian.net/browse/ECOM-124',
      createdAt: new Date('2025-12-06'),
      updatedAt: new Date('2025-12-07'),
      estimatedHours: 12,
      loggedHours: 0,
      remainingHours: 12,
      sprint: 'Sprint 24',
      storyPoints: 8,
    },
  ];

  for (const ticket of tickets) {
    await prisma.ticket.create({
      data: ticket,
    });
  }

  console.log('Created tickets');

  // Create some time entries
  const createdTickets = await prisma.ticket.findMany({
    where: { userId: user.id },
  });

  await prisma.timeEntry.create({
    data: {
      userId: user.id,
      ticketId: createdTickets[0].id,
      date: new Date('2025-12-08'),
      hours: 4.5,
      description: 'Implemented Stripe SDK integration',
    },
  });

  await prisma.timeEntry.create({
    data: {
      userId: user.id,
      ticketId: createdTickets[1].id,
      date: new Date('2025-12-08'),
      hours: 2.5,
      description: 'Debugged Android crash issue',
    },
  });

  console.log('Created time entries');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
