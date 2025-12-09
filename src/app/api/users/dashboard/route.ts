import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        userProjects: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                location: true,
              },
            },
          },
        },
        tickets: {
          select: {
            id: true,
          },
        },
        leaves: {
          where: {
            OR: [
              { startDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, // Last 30 days
              { endDate: { gte: new Date() } }, // Future leaves
            ],
          },
          orderBy: {
            startDate: 'desc',
          },
          take: 3,
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    // Calculate total hours worked and determine resource type for each user
    const usersWithStats = await Promise.all(
      users.map(async (user: any) => {
        // Calculate total hours from time entries
        const timeEntries = await prisma.timeEntry.findMany({
          where: {
            ticket: {
              assignee: user.id,
            },
          },
        });

        const totalHours = timeEntries.reduce((sum: number, entry: any) => sum + entry.hours, 0);

        // Determine resource type based on project assignments
        let resourceType = 'Unassigned';
        if (user.userProjects.length === 1) {
          resourceType = 'Dedicated';
        } else if (user.userProjects.length > 1) {
          resourceType = 'Shared';
        }

        return {
          ...user,
          totalHours,
          resourceType,
          _count: {
            tickets: user._count.tickets,
            userProjects: user.userProjects.length,
          },
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error('Error fetching users dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users dashboard' },
      { status: 500 }
    );
  }
}
