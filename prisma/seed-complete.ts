import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed with user dashboard and leave features...');

  // Create users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        displayName: 'John Doe',
        jobTitle: 'Senior Software Engineer',
        department: 'Engineering',
        officeLocation: 'New York',
        resourceType: 'Dedicated',
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        displayName: 'Jane Smith',
        jobTitle: 'Product Manager',
        department: 'Product',
        officeLocation: 'San Francisco',
        resourceType: 'Shared',
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob.wilson@example.com' },
      update: {},
      create: {
        email: 'bob.wilson@example.com',
        name: 'Bob Wilson',
        displayName: 'Bob Wilson',
        jobTitle: 'DevOps Engineer',
        department: 'Engineering',
        officeLocation: 'Austin',
        resourceType: 'Shared',
      },
    }),
    prisma.user.upsert({
      where: { email: 'alice.johnson@example.com' },
      update: {},
      create: {
        email: 'alice.johnson@example.com',
        name: 'Alice Johnson',
        displayName: 'Alice Johnson',
        jobTitle: 'UX Designer',
        department: 'Design',
        officeLocation: 'Seattle',
        resourceType: 'Dedicated',
      },
    }),
    prisma.user.upsert({
      where: { email: 'mike.brown@example.com' },
      update: {},
      create: {
        email: 'mike.brown@example.com',
        name: 'Mike Brown',
        displayName: 'Mike Brown',
        jobTitle: 'QA Engineer',
        department: 'Quality Assurance',
        officeLocation: 'Boston',
        resourceType: 'Unassigned',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create projects
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: 'proj-1' },
      update: {},
      create: {
        id: 'proj-1',
        title: 'E-Commerce Platform',
        description: 'Next-gen e-commerce platform with AI recommendations',
        status: 'Active',
        capacity: 8,
        location: 'New York',
        startDate: new Date('2024-01-01'),
      },
    }),
    prisma.project.upsert({
      where: { id: 'proj-2' },
      update: {},
      create: {
        id: 'proj-2',
        title: 'Mobile App Redesign',
        description: 'Complete redesign of mobile applications',
        status: 'Active',
        capacity: 5,
        location: 'San Francisco',
        startDate: new Date('2024-02-15'),
      },
    }),
    prisma.project.upsert({
      where: { id: 'proj-3' },
      update: {},
      create: {
        id: 'proj-3',
        title: 'Cloud Migration',
        description: 'Migrate legacy systems to cloud infrastructure',
        status: 'Active',
        capacity: 6,
        location: 'Austin',
        startDate: new Date('2024-03-01'),
      },
    }),
  ]);

  console.log(`Created ${projects.length} projects`);

  // Create user-project mappings
  const mappings = await Promise.all([
    // John - Dedicated to E-Commerce Platform
    prisma.userProject.upsert({
      where: { id: 'mapping-1' },
      update: {},
      create: {
        id: 'mapping-1',
        userId: users[0].id,
        projectId: projects[0].id,
        role: 'Tech Lead',
        allocationPercentage: 100,
      },
    }),
    // Jane - Shared across E-Commerce and Mobile App
    prisma.userProject.upsert({
      where: { id: 'mapping-2' },
      update: {},
      create: {
        id: 'mapping-2',
        userId: users[1].id,
        projectId: projects[0].id,
        role: 'Product Manager',
        allocationPercentage: 50,
      },
    }),
    prisma.userProject.upsert({
      where: { id: 'mapping-3' },
      update: {},
      create: {
        id: 'mapping-3',
        userId: users[1].id,
        projectId: projects[1].id,
        role: 'Product Manager',
        allocationPercentage: 50,
      },
    }),
    // Bob - Shared across Mobile App and Cloud Migration
    prisma.userProject.upsert({
      where: { id: 'mapping-4' },
      update: {},
      create: {
        id: 'mapping-4',
        userId: users[2].id,
        projectId: projects[1].id,
        role: 'DevOps Engineer',
        allocationPercentage: 40,
      },
    }),
    prisma.userProject.upsert({
      where: { id: 'mapping-5' },
      update: {},
      create: {
        id: 'mapping-5',
        userId: users[2].id,
        projectId: projects[2].id,
        role: 'Cloud Architect',
        allocationPercentage: 60,
      },
    }),
    // Alice - Dedicated to Mobile App
    prisma.userProject.upsert({
      where: { id: 'mapping-6' },
      update: {},
      create: {
        id: 'mapping-6',
        userId: users[3].id,
        projectId: projects[1].id,
        role: 'UX Lead',
        allocationPercentage: 100,
      },
    }),
  ]);

  console.log(`Created ${mappings.length} user-project mappings`);

  // Create leave records
  const leaves = await Promise.all([
    // John's annual leave
    prisma.leave.create({
      data: {
        userId: users[0].id,
        leaveType: 'Annual',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-22'),
        days: 6,
        status: 'Approved',
        reason: 'Family vacation',
        source: 'manual',
      },
    }),
    // Jane's sick leave
    prisma.leave.create({
      data: {
        userId: users[1].id,
        leaveType: 'Sick',
        startDate: new Date('2024-12-05'),
        endDate: new Date('2024-12-06'),
        days: 2,
        status: 'Approved',
        reason: 'Flu',
        source: 'jira',
        externalId: 'JIRA-LEAVE-001',
      },
    }),
    // Bob's personal leave
    prisma.leave.create({
      data: {
        userId: users[2].id,
        leaveType: 'Personal',
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-10'),
        days: 1,
        status: 'Approved',
        reason: 'Personal matters',
        source: 'manual',
      },
    }),
    // Alice's upcoming leave
    prisma.leave.create({
      data: {
        userId: users[3].id,
        leaveType: 'Annual',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-05'),
        days: 5,
        status: 'Pending',
        reason: 'Winter break',
        source: 'manual',
      },
    }),
  ]);

  console.log(`Created ${leaves.length} leave records`);

  // Create integrations
  const integration = await prisma.integration.upsert({
    where: {
      userId_platform_name: {
        userId: users[0].id,
        platform: 'jira',
        name: 'Main Jira',
      },
    },
    update: {},
    create: {
      userId: users[0].id,
      platform: 'jira',
      name: 'Main Jira',
      token: 'encrypted_token_here',
      baseUrl: 'https://company.atlassian.net',
      isActive: true,
    },
  });

  console.log('Created integration');

  // Create tickets with time entries
  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        userId: users[0].id,
        integrationId: integration.id,
        externalId: 'PROJ-101',
        title: 'Implement payment gateway',
        description: 'Integrate Stripe payment processing',
        status: 'In Progress',
        priority: 'High',
        platform: 'jira',
        url: 'https://company.atlassian.net/browse/PROJ-101',
        assignee: users[0].id,
        sprint: 'Sprint 5',
        storyPoints: 8,
        estimatedHours: 40,
        loggedHours: 24,
        remainingHours: 16,
        ticketId: 'PROJ-101',
        createdAt: new Date('2024-11-20'),
        updatedAt: new Date('2024-12-10'),
      },
    }),
    prisma.ticket.create({
      data: {
        userId: users[0].id,
        integrationId: integration.id,
        externalId: 'PROJ-102',
        title: 'Fix checkout bug',
        description: 'Cart items disappearing on refresh',
        status: 'Done',
        priority: 'Critical',
        platform: 'jira',
        url: 'https://company.atlassian.net/browse/PROJ-102',
        assignee: users[0].id,
        sprint: 'Sprint 4',
        storyPoints: 3,
        estimatedHours: 8,
        loggedHours: 10,
        remainingHours: 0,
        ticketId: 'PROJ-102',
        createdAt: new Date('2024-11-15'),
        updatedAt: new Date('2024-11-29'),
      },
    }),
  ]);

  console.log(`Created ${tickets.length} tickets`);

  // Create time entries
  const timeEntries = await Promise.all([
    prisma.timeEntry.create({
      data: {
        ticketId: tickets[0].id,
        userId: users[0].id,
        date: new Date('2024-12-08'),
        hours: 6,
        description: 'Initial implementation of Stripe SDK',
      },
    }),
    prisma.timeEntry.create({
      data: {
        ticketId: tickets[0].id,
        userId: users[0].id,
        date: new Date('2024-12-09'),
        hours: 8,
        description: 'Webhook setup and testing',
      },
    }),
    prisma.timeEntry.create({
      data: {
        ticketId: tickets[0].id,
        userId: users[0].id,
        date: new Date('2024-12-10'),
        hours: 5,
        description: 'Error handling and validation',
      },
    }),
    prisma.timeEntry.create({
      data: {
        ticketId: tickets[1].id,
        userId: users[0].id,
        date: new Date('2024-11-28'),
        hours: 4,
        description: 'Bug investigation',
      },
    }),
    prisma.timeEntry.create({
      data: {
        ticketId: tickets[1].id,
        userId: users[0].id,
        date: new Date('2024-11-29'),
        hours: 6,
        description: 'Fix implementation and testing',
      },
    }),
  ]);

  console.log(`Created ${timeEntries.length} time entries`);

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
