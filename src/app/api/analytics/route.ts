import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'month':
      default:
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    // Fetch sprints data
    let sprints: any[] = [];
    let velocityTrend: any[] = [];
    try {
      // @ts-ignore - Sprint model may not exist yet
      sprints = await prisma.sprint?.findMany({
        where: {
          startDate: {
            gte: startDate,
          },
        },
        include: {
          sprintTickets: true,
          project: true,
        },
        orderBy: {
          startDate: 'asc',
        },
      }) || [];

      // Calculate velocity trends
      velocityTrend = sprints.map((sprint: any) => {
        const totalPoints = sprint.sprintTickets.reduce(
          (sum: number, st: any) => sum + (st.storyPoints || 0), 
          0
        );
        const completedPoints = sprint.sprintTickets
          .filter((st: any) => st.status === 'Done')
          .reduce((sum: number, st: any) => sum + (st.storyPoints || 0), 0);

        return {
          sprintName: sprint.name,
          committed: totalPoints,
          completed: completedPoints,
          completionRate: totalPoints > 0 ? (completedPoints / totalPoints * 100).toFixed(1) : 0,
        };
      });
    } catch (e) {
      // Sprint model not available
      sprints = [];
      velocityTrend = [];
    }

    // Fetch team and capacity data
    const users = await prisma.user.findMany({
      include: {
        userProjects: {
          include: {
            project: true,
          },
        },
      },
    });

    const projects = await prisma.project.findMany({
      include: {
        userProjects: {
          include: {
            user: true,
          },
        },
      },
    });

    // Fetch tickets data
    const tickets = await prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Calculate team performance metrics
    const teamPerformance = {
      throughput: tickets.filter(t => t.status === 'Done').length,
      avgCycleTime: calculateAvgCycleTime(tickets),
      avgLeadTime: calculateAvgLeadTime(tickets),
      workInProgress: tickets.filter(t => t.status === 'In Progress').length,
    };

    // Calculate capacity utilization
    const totalCapacity = users.length * 40; // 40 hours per week per user
    const allocatedCapacity = users.reduce((sum, user) => {
      const allocation = user.userProjects.reduce(
        (pSum, up) => pSum + (up.allocationPercentage || 0),
        0
      );
      return sum + (allocation / 100 * 40);
    }, 0);

    // Calculate project health scores
    const projectHealth = projects.map(project => {
      const teamSize = project.userProjects.length;
      const avgAllocation = project.userProjects.reduce(
        (sum, up) => sum + (up.allocationPercentage || 0),
        0
      ) / (teamSize || 1);

      const projectTickets = tickets.filter(t => t.projectId === project.id);
      const completionRate = projectTickets.length > 0
        ? (projectTickets.filter(t => t.status === 'Done').length / projectTickets.length * 100)
        : 0;

      // Health score calculation (0-100)
      const healthScore = Math.round(
        (completionRate * 0.4) + 
        (Math.min(avgAllocation, 100) * 0.3) +
        (Math.min(teamSize / 5 * 100, 100) * 0.3)
      );

      return {
        projectId: project.id,
        projectName: project.title,
        teamSize,
        avgAllocation,
        completionRate: completionRate.toFixed(1),
        healthScore,
        status: healthScore >= 70 ? 'healthy' : healthScore >= 50 ? 'at-risk' : 'critical',
      };
    });

    // Predictive analytics
    const avgVelocity = velocityTrend.length > 0
      ? velocityTrend.reduce((sum, v) => sum + Number(v.completed), 0) / velocityTrend.length
      : 0;

    const velocityVariance = velocityTrend.length > 1
      ? calculateVariance(velocityTrend.map(v => Number(v.completed)))
      : 0;

    const predictedVelocity = Math.round(avgVelocity * (1 - velocityVariance / 100));

    // Release burnup data (mock for now)
    const releaseBurnup = generateReleaseBurnup(sprints, velocityTrend);

    // Risk indicators
    const riskIndicators = {
      overallocatedResources: users.filter(u => 
        u.userProjects.reduce((sum, up) => sum + (up.allocationPercentage || 0), 0) > 100
      ).length,
      criticalProjects: projectHealth.filter(p => p.status === 'critical').length,
      lowVelocityTrend: velocityTrend.length >= 2 && 
        Number(velocityTrend[velocityTrend.length - 1].completed) < 
        Number(velocityTrend[velocityTrend.length - 2].completed),
      highWIP: teamPerformance.workInProgress > users.length * 2,
    };

    const analytics = {
      velocityTrend,
      teamPerformance,
      capacityUtilization: {
        total: totalCapacity,
        allocated: allocatedCapacity,
        available: totalCapacity - allocatedCapacity,
        utilizationRate: ((allocatedCapacity / totalCapacity) * 100).toFixed(1),
      },
      projectHealth,
      predictive: {
        avgVelocity: avgVelocity.toFixed(1),
        predictedVelocity,
        variance: velocityVariance.toFixed(1),
        trend: velocityTrend.length >= 2
          ? Number(velocityTrend[velocityTrend.length - 1].completed) >= 
            Number(velocityTrend[velocityTrend.length - 2].completed)
            ? 'up'
            : 'down'
          : 'stable',
      },
      releaseBurnup,
      riskIndicators,
      executiveSummary: {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => 
          projectHealth.find(ph => ph.projectId === p.id)?.status !== 'critical'
        ).length,
        teamUtilization: ((allocatedCapacity / totalCapacity) * 100).toFixed(1),
        avgProjectHealth: (
          projectHealth.reduce((sum, p) => sum + p.healthScore, 0) / 
          (projectHealth.length || 1)
        ).toFixed(1),
        completedTickets: tickets.filter(t => t.status === 'Done').length,
        avgThroughput: (teamPerformance.throughput / users.length).toFixed(1),
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function calculateAvgCycleTime(tickets: any[]): number {
  const completedTickets = tickets.filter(t => t.status === 'Done');
  if (completedTickets.length === 0) return 0;

  const totalCycleTime = completedTickets.reduce((sum, ticket) => {
    const cycleTime = ticket.updatedAt.getTime() - ticket.createdAt.getTime();
    return sum + cycleTime;
  }, 0);

  return Math.round(totalCycleTime / completedTickets.length / (1000 * 60 * 60)); // hours
}

function calculateAvgLeadTime(tickets: any[]): number {
  const completedTickets = tickets.filter(t => t.status === 'Done');
  if (completedTickets.length === 0) return 0;

  const totalLeadTime = completedTickets.reduce((sum, ticket) => {
    const leadTime = ticket.updatedAt.getTime() - ticket.createdAt.getTime();
    return sum + leadTime;
  }, 0);

  return Math.round(totalLeadTime / completedTickets.length / (1000 * 60 * 60)); // hours
}

function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.sqrt(variance);
}

function generateReleaseBurnup(sprints: any[], velocityTrend: any[]): any {
  const totalScope = 200; // Mock total scope
  const completedSoFar = velocityTrend.reduce((sum, v) => sum + Number(v.completed), 0);
  
  return {
    totalScope,
    completed: completedSoFar,
    remaining: totalScope - completedSoFar,
    percentComplete: ((completedSoFar / totalScope) * 100).toFixed(1),
    sprintsData: velocityTrend.map((v, idx) => ({
      sprint: v.sprintName,
      cumulative: velocityTrend
        .slice(0, idx + 1)
        .reduce((sum, vt) => sum + Number(vt.completed), 0),
    })),
  };
}
