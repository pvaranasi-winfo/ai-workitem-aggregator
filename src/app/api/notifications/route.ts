import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // In a real implementation, this would:
    // 1. Get user-specific notifications from database
    // 2. Check sprint deadlines and capacity issues
    // 3. Generate alerts based on system state
    // 4. Return personalized notification feed

    // For now, we'll generate mock notifications based on actual data
    let sprints: any[] = [];
    try {
      // @ts-ignore - Sprint model may not exist yet
      sprints = await prisma.sprint?.findMany({
        where: { status: 'ACTIVE' },
        include: { project: true },
        take: 5,
      }) || [];
    } catch (e) {
      // Sprint model not available
      sprints = [];
    }

    const leaves = await prisma.leave.findMany({
      where: {
        status: 'PENDING',
      },
      take: 5,
    });

    const notifications = [];

    // Sprint notifications
    for (const sprint of sprints) {
      const daysRemaining = Math.ceil(
        (sprint.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysRemaining <= 3 && daysRemaining > 0) {
        notifications.push({
          id: `sprint-${sprint.id}`,
          type: 'sprint',
          title: 'Sprint Ending Soon',
          message: `Sprint "${sprint.name}" ends in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}.`,
          timestamp: '2h ago',
          read: false,
          priority: 'high',
          actionUrl: `/sprints/${sprint.id}`,
        });
      }
    }

    // Leave notifications
    for (const leave of leaves.slice(0, 2)) {
      notifications.push({
        id: `leave-${leave.id}`,
        type: 'leave',
        title: 'Leave Request Pending',
        message: `Leave request for ${leave.startDate.toLocaleDateString()} needs your review.`,
        timestamp: '4h ago',
        read: false,
        priority: 'medium',
        actionUrl: '/leave-management',
      });
    }

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}
