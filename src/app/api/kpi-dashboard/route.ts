import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || 'month';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }

    // Fetch all necessary data
    const [users, projects, tickets, timeEntries, leaves] = await Promise.all([
      prisma.user.findMany({
        include: {
          _count: {
            select: {
              tickets: true,
            },
          },
        },
      }),
      prisma.project.findMany(),
      prisma.ticket.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),
      prisma.timeEntry.findMany({
        where: {
          date: {
            gte: startDate,
          },
        },
      }),
      prisma.leave.findMany({
        where: {
          OR: [
            {
              startDate: {
                gte: startDate,
              },
            },
            {
              endDate: {
                gte: now,
              },
            },
          ],
        },
      }),
    ]);

    // Get user projects for resource type calculation
    const userProjects = await prisma.userProject.findMany();
    const userProjectCounts = userProjects.reduce((acc: any, up) => {
      acc[up.userId] = (acc[up.userId] || 0) + 1;
      return acc;
    }, {});

    // Calculate team metrics
    const dedicatedResources = Object.values(userProjectCounts).filter((count: any) => count === 1).length;
    const sharedResources = Object.values(userProjectCounts).filter((count: any) => count > 1).length;
    const unassigned = users.length - dedicatedResources - sharedResources;

    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const avgHoursPerUser = users.length > 0 ? totalHours / users.length : 0;
    const utilizationRate = Math.min((avgHoursPerUser / 40) * 100, 100); // Assuming 40h work week

    // Calculate project metrics
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const onTrackProjects = Math.floor(activeProjects * 0.7); // Mock: 70% on track
    const atRiskProjects = activeProjects - onTrackProjects;

    // Calculate ticket metrics
    const completedTickets = tickets.filter(t => t.status === 'Done' || t.status === 'Closed').length;
    const inProgressTickets = tickets.filter(t => t.status === 'In Progress').length;
    const todoTickets = tickets.filter(t => t.status === 'To Do' || t.status === 'Open').length;
    const completionRate = tickets.length > 0 ? (completedTickets / tickets.length) * 100 : 0;

    // Calculate time metrics
    const estimatedHours = tickets.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const loggedHours = tickets.reduce((sum, t) => sum + (t.loggedHours || 0), 0);
    const variance = loggedHours - estimatedHours;
    const efficiency = estimatedHours > 0 ? (loggedHours / estimatedHours) * 100 : 0;

    // Calculate velocity metrics
    const storyPoints = tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedStoryPoints = tickets
      .filter(t => t.status === 'Done' || t.status === 'Closed')
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const currentSprint = completedStoryPoints; // Simplified
    const avgVelocity = Math.floor(currentSprint * 0.9); // Mock average
    const trend = currentSprint > avgVelocity ? 'up' : currentSprint < avgVelocity ? 'down' : 'stable';

    // Calculate quality metrics
    const bugTickets = tickets.filter(t => t.type === 'bug' || t.priority === 'Critical');
    const criticalBugs = tickets.filter(t => t.priority === 'Critical').length;
    const avgTimeToFix = bugTickets.length > 0
      ? bugTickets.reduce((sum, t) => sum + (t.loggedHours || 0), 0) / bugTickets.length
      : 0;
    const reopenRate = 5; // Mock value

    // Calculate leave metrics
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const upcomingLeaves = leaves.filter(l => new Date(l.startDate) > now).length;
    const totalLeaveDays = leaves.reduce((sum, l) => sum + l.days, 0);
    const approvedThisMonth = leaves.filter(l => 
      l.status === 'Approved' && 
      new Date(l.createdAt) >= new Date(now.getFullYear(), now.getMonth(), 1)
    ).length;

    const kpiData = {
      team: {
        totalUsers: users.length,
        dedicatedResources,
        sharedResources,
        unassigned,
        utilizationRate: Math.round(utilizationRate),
        avgHoursPerUser: Math.round(avgHoursPerUser * 10) / 10,
      },
      projects: {
        total: projects.length,
        active: activeProjects,
        completed: completedProjects,
        onTrack: onTrackProjects,
        atRisk: atRiskProjects,
        avgCapacity: projects.reduce((sum, p) => sum + (p.capacity || 0), 0) / projects.length || 0,
      },
      tickets: {
        total: tickets.length,
        completed: completedTickets,
        inProgress: inProgressTickets,
        todo: todoTickets,
        completionRate: Math.round(completionRate),
        avgResolutionTime: Math.round(avgTimeToFix * 10) / 10,
      },
      time: {
        totalHours: Math.round(totalHours * 10) / 10,
        billableHours: Math.round(totalHours * 0.8 * 10) / 10, // Mock: 80% billable
        estimatedHours: Math.round(estimatedHours),
        loggedHours: Math.round(loggedHours),
        efficiency: Math.round(efficiency),
        variance: Math.round(variance * 10) / 10,
      },
      velocity: {
        currentSprint,
        avgVelocity,
        trend,
        storyPointsCompleted: completedStoryPoints,
      },
      quality: {
        bugCount: bugTickets.length,
        criticalBugs,
        avgTimeToFix: Math.round(avgTimeToFix * 10) / 10,
        reopenRate,
      },
      leave: {
        totalDays: Math.round(totalLeaveDays * 10) / 10,
        pendingRequests: pendingLeaves,
        approvedThisMonth,
        upcomingLeaves,
      },
    };

    return NextResponse.json(kpiData);
  } catch (error) {
    console.error('Error fetching KPI dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI dashboard' },
      { status: 500 }
    );
  }
}
