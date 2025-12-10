import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sprint data...');

  // Get projects
  const projects = await prisma.project.findMany({ take: 2 });
  if (projects.length === 0) {
    console.log('No projects found. Please seed projects first.');
    return;
  }

  // Get users
  const users = await prisma.user.findMany({ take: 5 });
  if (users.length === 0) {
    console.log('No users found. Please seed users first.');
    return;
  }

  // Get tickets
  const tickets = await prisma.ticket.findMany({ take: 20 });
  if (tickets.length === 0) {
    console.log('No tickets found. Please seed tickets first.');
    return;
  }

  // Create Sprint 12 (Active)
  const sprint12 = await prisma.sprint.create({
    data: {
      projectId: projects[0].id,
      name: 'Sprint 12 - Q1 2025',
      goal: 'Complete user authentication refactor and implement role-based permissions',
      startDate: new Date('2025-01-20'),
      endDate: new Date('2025-02-03'),
      status: 'Active',
      velocity: 45,
      capacity: 160,
      commitment: 50
    }
  });
  console.log(`Created Sprint: ${sprint12.name}`);

  // Add tickets to Sprint 12
  if (tickets.length >= 6) {
    await prisma.sprintTicket.createMany({
      data: [
        { sprintId: sprint12.id, ticketId: tickets[0].id, storyPoints: 8, status: 'Done' },
        { sprintId: sprint12.id, ticketId: tickets[1].id, storyPoints: 5, status: 'Done' },
        { sprintId: sprint12.id, ticketId: tickets[2].id, storyPoints: 13, status: 'InProgress' },
        { sprintId: sprint12.id, ticketId: tickets[3].id, storyPoints: 3, status: 'InProgress' },
        { sprintId: sprint12.id, ticketId: tickets[4].id, storyPoints: 5, status: 'Todo' },
        { sprintId: sprint12.id, ticketId: tickets[5].id, storyPoints: 8, status: 'Todo' }
      ]
    });
    console.log('Added 6 tickets to Sprint 12');
  }

  // Add daily standups for Sprint 12
  if (users.length >= 3) {
    await prisma.dailyStandup.createMany({
      data: [
        {
          sprintId: sprint12.id,
          userId: users[0].id,
          date: new Date(),
          yesterday: 'Completed authentication API endpoints',
          today: 'Working on role-based permissions',
          blockers: null
        },
        {
          sprintId: sprint12.id,
          userId: users[1].id,
          date: new Date(),
          yesterday: 'Fixed critical security vulnerability',
          today: 'Implementing permission middleware',
          blockers: 'Waiting for security audit approval'
        },
        {
          sprintId: sprint12.id,
          userId: users[2].id,
          date: new Date(),
          yesterday: 'Updated user dashboard UI',
          today: 'Adding permission toggles to admin panel',
          blockers: null
        }
      ]
    });
    console.log('Added 3 daily standups to Sprint 12');
  }

  // Create Sprint 13 (Planning)
  const sprint13 = await prisma.sprint.create({
    data: {
      projectId: projects[0].id,
      name: 'Sprint 13 - Q1 2025',
      goal: 'Develop advanced reporting features and dashboards',
      startDate: new Date('2025-02-03'),
      endDate: new Date('2025-02-17'),
      status: 'Planning',
      capacity: 160,
      commitment: 55
    }
  });
  console.log(`Created Sprint: ${sprint13.name}`);

  // Add tickets to Sprint 13
  if (tickets.length >= 10) {
    await prisma.sprintTicket.createMany({
      data: [
        { sprintId: sprint13.id, ticketId: tickets[6].id, storyPoints: 8, status: 'Todo' },
        { sprintId: sprint13.id, ticketId: tickets[7].id, storyPoints: 13, status: 'Todo' },
        { sprintId: sprint13.id, ticketId: tickets[8].id, storyPoints: 5, status: 'Todo' },
        { sprintId: sprint13.id, ticketId: tickets[9].id, storyPoints: 8, status: 'Todo' }
      ]
    });
    console.log('Added 4 tickets to Sprint 13');
  }

  if (projects.length >= 2) {
    // Create Sprint 8 (Completed)
    const sprint8 = await prisma.sprint.create({
      data: {
        projectId: projects[1].id,
        name: 'Sprint 8 - Dec 2024',
        goal: 'API integration improvements and performance optimization',
        startDate: new Date('2024-12-16'),
        endDate: new Date('2024-12-30'),
        status: 'Completed',
        velocity: 38,
        capacity: 144,
        commitment: 40
      }
    });
    console.log(`Created Sprint: ${sprint8.name}`);

    // Add tickets to Sprint 8
    if (tickets.length >= 15) {
      const completedDate = new Date('2024-12-28');
      await prisma.sprintTicket.createMany({
        data: [
          { sprintId: sprint8.id, ticketId: tickets[10].id, storyPoints: 5, status: 'Done', completedAt: completedDate },
          { sprintId: sprint8.id, ticketId: tickets[11].id, storyPoints: 8, status: 'Done', completedAt: completedDate },
          { sprintId: sprint8.id, ticketId: tickets[12].id, storyPoints: 13, status: 'Done', completedAt: completedDate },
          { sprintId: sprint8.id, ticketId: tickets[13].id, storyPoints: 5, status: 'Done', completedAt: completedDate },
          { sprintId: sprint8.id, ticketId: tickets[14].id, storyPoints: 8, status: 'Done', completedAt: completedDate }
        ]
      });
      console.log('Added 5 tickets to Sprint 8');
    }

    // Add retrospectives for Sprint 8
    if (users.length >= 2) {
      await prisma.retrospective.createMany({
        data: [
          {
            sprintId: sprint8.id,
            type: 'WentWell',
            content: 'Team collaboration was excellent during this sprint',
            votes: 5
          },
          {
            sprintId: sprint8.id,
            type: 'WentWell',
            content: 'Successfully completed all critical bug fixes',
            votes: 3
          },
          {
            sprintId: sprint8.id,
            type: 'NeedsImprovement',
            content: 'API documentation needs to be updated more frequently',
            votes: 4
          },
          {
            sprintId: sprint8.id,
            type: 'NeedsImprovement',
            content: 'Code review process took longer than expected',
            votes: 2
          },
          {
            sprintId: sprint8.id,
            type: 'ActionItem',
            content: 'Schedule documentation workshop for next sprint',
            votes: 0,
            status: 'Open',
            assigneeId: users[0].id
          },
          {
            sprintId: sprint8.id,
            type: 'ActionItem',
            content: 'Implement automated code review checklist',
            votes: 0,
            status: 'InProgress',
            assigneeId: users[1].id
          }
        ]
      });
      console.log('Added 6 retrospective items to Sprint 8');
    }

    // Create Sprint 9 (Active)
    const sprint9 = await prisma.sprint.create({
      data: {
        projectId: projects[1].id,
        name: 'Sprint 9 - Jan 2025',
        goal: 'Mobile responsiveness and UI/UX enhancements',
        startDate: new Date('2025-01-13'),
        endDate: new Date('2025-01-27'),
        status: 'Active',
        velocity: 42,
        capacity: 144,
        commitment: 45
      }
    });
    console.log(`Created Sprint: ${sprint9.name}`);
  }

  console.log('Sprint seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding sprint data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
