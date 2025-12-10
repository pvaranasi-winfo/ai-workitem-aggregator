import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        userProjects: {
          include: {
            project: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        tickets: {
          where: {
            status: {
              not: 'Done'
            }
          }
        }
      }
    });

    const allocations = users.map(user => {
      const projects = user.userProjects.map(up => ({
        projectId: up.projectId,
        projectTitle: up.project.title,
        allocationPercentage: up.allocationPercentage || 0,
        role: up.role
      }));

      const totalAllocation = projects.reduce((sum, p) => sum + p.allocationPercentage, 0);
      const activeTickets = user.tickets.length;
      const weeklyHours = (totalAllocation / 100) * 40; // Assuming 40-hour work week

      return {
        userId: user.id,
        userName: user.name,
        email: user.email,
        department: user.department,
        projects,
        totalAllocation,
        activeTickets,
        weeklyHours
      };
    });

    return NextResponse.json(allocations);
  } catch (error) {
    console.error('Error fetching capacity:', error);
    return NextResponse.json({ error: 'Failed to fetch capacity data' }, { status: 500 });
  }
}
