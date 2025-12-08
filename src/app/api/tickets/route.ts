import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Dummy data for demonstration when email is dummy@example.com
const DUMMY_TICKETS = [
  {
    id: '1',
    ticketId: 'PROJ-101',
    externalId: 'PROJ-101',
    title: 'Implement user authentication system',
    description: 'Add OAuth2 authentication with social login support',
    status: 'In Progress',
    priority: 'High',
    type: 'Feature',
    platform: 'jira',
    url: 'https://jira.example.com/browse/PROJ-101',
    assignee: 'John Doe',
    reporter: 'Jane Smith',
    projectKey: 'PROJ',
    projectName: 'Main Project',
    labels: '["backend", "security"]',
    createdAt: new Date('2025-11-20'),
    updatedAt: new Date('2025-12-07'),
    dueDate: new Date('2025-12-15'),
    estimatedHours: 24,
    loggedHours: 16,
    remainingHours: 8,
    sprint: 'Sprint 24',
    storyPoints: 8,
  },
  {
    id: '2',
    ticketId: 'PROJ-102',
    externalId: 'PROJ-102',
    title: 'Fix database connection pooling',
    description: 'Optimize connection pool settings for better performance',
    status: 'In Progress',
    priority: 'Critical',
    type: 'Bug',
    platform: 'jira',
    url: 'https://jira.example.com/browse/PROJ-102',
    assignee: 'John Doe',
    reporter: 'Tech Lead',
    projectKey: 'PROJ',
    projectName: 'Main Project',
    labels: '["database", "performance"]',
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-08'),
    dueDate: new Date('2025-12-10'),
    estimatedHours: 8,
    loggedHours: 5,
    remainingHours: 3,
    sprint: 'Sprint 23',
    storyPoints: 5,
  },
  {
    id: '3',
    ticketId: '#123',
    externalId: '123',
    title: 'Update README with installation instructions',
    description: 'Add comprehensive setup guide for new developers',
    status: 'To Do',
    priority: 'Medium',
    type: 'Documentation',
    platform: 'github',
    url: 'https://github.com/example/repo/issues/123',
    assignee: 'John Doe',
    reporter: 'Product Manager',
    projectKey: 'repo',
    projectName: 'Documentation',
    labels: '["documentation", "good-first-issue"]',
    createdAt: new Date('2025-12-05'),
    updatedAt: new Date('2025-12-05'),
    dueDate: new Date('2025-12-20'),
    estimatedHours: 4,
    loggedHours: 0,
    remainingHours: 4,
    sprint: 'Sprint 24',
    storyPoints: 2,
  },
  {
    id: '4',
    ticketId: '#124',
    externalId: '124',
    title: 'Add unit tests for API endpoints',
    description: 'Increase test coverage for REST API',
    status: 'In Progress',
    priority: 'High',
    type: 'Task',
    platform: 'github',
    url: 'https://github.com/example/repo/issues/124',
    assignee: 'John Doe',
    reporter: 'QA Lead',
    projectKey: 'repo',
    projectName: 'Testing',
    labels: '["testing", "api"]',
    createdAt: new Date('2025-11-28'),
    updatedAt: new Date('2025-12-08'),
    dueDate: new Date('2025-12-12'),
    estimatedHours: 16,
    loggedHours: 12,
    remainingHours: 4,
    sprint: 'Sprint 23',
    storyPoints: 5,
  },
  {
    id: '5',
    ticketId: '!45',
    externalId: '45',
    title: 'Refactor legacy code in payment module',
    description: 'Modernize payment processing code',
    status: 'In Review',
    priority: 'Medium',
    type: 'Refactoring',
    platform: 'gitlab',
    url: 'https://gitlab.com/example/project/-/issues/45',
    assignee: 'John Doe',
    reporter: 'Team Lead',
    projectKey: 'project',
    projectName: 'Payment System',
    labels: '["refactoring", "payment"]',
    createdAt: new Date('2025-11-15'),
    updatedAt: new Date('2025-12-06'),
    dueDate: new Date('2025-12-18'),
    estimatedHours: 20,
    loggedHours: 18,
    remainingHours: 2,
    sprint: 'Sprint 23',
    storyPoints: 8,
  },
  {
    id: '6',
    ticketId: 'WI-1001',
    externalId: '1001',
    title: 'Design new dashboard layout',
    description: 'Create mockups for new analytics dashboard',
    status: 'Done',
    priority: 'High',
    type: 'Design',
    platform: 'azure-devops',
    url: 'https://dev.azure.com/org/project/_workitems/edit/1001',
    assignee: 'John Doe',
    reporter: 'Design Lead',
    projectKey: 'WI',
    projectName: 'Analytics Dashboard',
    labels: '["design", "dashboard"]',
    createdAt: new Date('2025-11-10'),
    updatedAt: new Date('2025-11-30'),
    dueDate: new Date('2025-11-30'),
    estimatedHours: 12,
    loggedHours: 12,
    remainingHours: 0,
    sprint: 'Sprint 23',
    storyPoints: 5,
  },
  {
    id: '7',
    ticketId: 'BB-67',
    externalId: '67',
    title: 'Configure CI/CD pipeline',
    description: 'Set up automated build and deployment',
    status: 'To Do',
    priority: 'High',
    type: 'DevOps',
    platform: 'bitbucket',
    url: 'https://bitbucket.org/workspace/repo/issues/67',
    assignee: 'John Doe',
    reporter: 'DevOps Engineer',
    projectKey: 'BB',
    projectName: 'Infrastructure',
    labels: '["devops", "ci-cd"]',
    createdAt: new Date('2025-12-03'),
    updatedAt: new Date('2025-12-03'),
    dueDate: new Date('2025-12-22'),
    estimatedHours: 10,
    loggedHours: 0,
    remainingHours: 10,
    sprint: 'Sprint 24',
    storyPoints: 3,
  },
  {
    id: '8',
    ticketId: 'PROJ-103',
    externalId: 'PROJ-103',
    title: 'Optimize image loading performance',
    description: 'Implement lazy loading and image compression',
    status: 'Done',
    priority: 'Medium',
    type: 'Performance',
    platform: 'jira',
    url: 'https://jira.example.com/browse/PROJ-103',
    assignee: 'John Doe',
    reporter: 'Performance Team',
    projectKey: 'PROJ',
    projectName: 'Frontend Optimization',
    labels: '["performance", "frontend"]',
    createdAt: new Date('2025-11-18'),
    updatedAt: new Date('2025-12-02'),
    dueDate: new Date('2025-12-02'),
    estimatedHours: 6,
    loggedHours: 6,
    remainingHours: 0,
    sprint: 'Sprint 23',
    storyPoints: 3,
  },
  {
    id: '9',
    ticketId: '#125',
    externalId: '125',
    title: 'Implement dark mode theme',
    description: 'Add dark mode support across the application',
    status: 'In Progress',
    priority: 'Low',
    type: 'Feature',
    platform: 'github',
    url: 'https://github.com/example/repo/issues/125',
    assignee: 'John Doe',
    reporter: 'UX Designer',
    projectKey: 'repo',
    projectName: 'UI Enhancements',
    labels: '["ui", "enhancement"]',
    createdAt: new Date('2025-12-04'),
    updatedAt: new Date('2025-12-08'),
    dueDate: new Date('2025-12-25'),
    estimatedHours: 14,
    loggedHours: 4,
    remainingHours: 10,
    sprint: 'Sprint 24',
    storyPoints: 5,
  },
  {
    id: '10',
    ticketId: '!46',
    externalId: '46',
    title: 'Security audit for authentication',
    description: 'Conduct comprehensive security review',
    status: 'To Do',
    priority: 'Critical',
    type: 'Security',
    platform: 'gitlab',
    url: 'https://gitlab.com/example/project/-/issues/46',
    assignee: 'John Doe',
    reporter: 'Security Team',
    projectKey: 'project',
    projectName: 'Security',
    labels: '["security", "audit"]',
    createdAt: new Date('2025-12-06'),
    updatedAt: new Date('2025-12-06'),
    dueDate: new Date('2025-12-13'),
    estimatedHours: 16,
    loggedHours: 0,
    remainingHours: 16,
    sprint: 'Sprint 24',
    storyPoints: 8,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Return dummy data for demonstration
    if (email === 'dummy@example.com') {
      let filteredTickets = [...DUMMY_TICKETS];

      // Filter by platform
      if (platform && platform !== 'all') {
        filteredTickets = filteredTickets.filter(t => t.platform === platform);
      }

      // Filter by status
      if (status) {
        filteredTickets = filteredTickets.filter(t => 
          t.status.toLowerCase().includes(status.toLowerCase())
        );
      }

      // Filter by search query
      if (search) {
        const searchLower = search.toLowerCase();
        filteredTickets = filteredTickets.filter(t =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower) ||
          t.ticketId.toLowerCase().includes(searchLower)
        );
      }

      return NextResponse.json({ tickets: filteredTickets });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ tickets: [] })
    }

    // Build where clause
    const where: any = {
      userId: user.id,
    }

    if (platform) {
      where.platform = platform
    }

    if (status) {
      where.status = {
        contains: status,
        mode: 'insensitive',
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { externalId: { contains: search, mode: 'insensitive' } },
      ]
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 1000, // Limit to prevent performance issues
    })

    // Parse labels JSON
    const ticketsWithLabels = tickets.map(ticket => ({
      ...ticket,
      labels: ticket.labels ? JSON.parse(ticket.labels) : [],
    }))

    return NextResponse.json({ tickets: ticketsWithLabels })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
