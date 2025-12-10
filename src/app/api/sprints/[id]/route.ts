import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sprintId = parseInt(params.id);

    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        project: {
          select: { id: true, title: true }
        },
        sprintTickets: {
          include: {
            ticket: {
              select: {
                id: true,
                title: true,
                description: true,
                status: true,
                priority: true,
                sprint: true,
                assignee: true
              }
            }
          },
          orderBy: { addedAt: 'asc' }
        },
        retrospectives: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        dailyStandups: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!sprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
    }

    return NextResponse.json(sprint);
  } catch (error) {
    console.error('Error fetching sprint:', error);
    return NextResponse.json({ error: 'Failed to fetch sprint' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sprintId = parseInt(params.id);
    const body = await request.json();
    const { name, goal, startDate, endDate, status, velocity, capacity, commitment } = body;

    const sprint = await prisma.sprint.update({
      where: { id: sprintId },
      data: {
        ...(name && { name }),
        ...(goal !== undefined && { goal }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status }),
        ...(velocity !== undefined && { velocity }),
        ...(capacity !== undefined && { capacity }),
        ...(commitment !== undefined && { commitment })
      },
      include: {
        project: {
          select: { id: true, title: true }
        }
      }
    });

    return NextResponse.json(sprint);
  } catch (error) {
    console.error('Error updating sprint:', error);
    return NextResponse.json({ error: 'Failed to update sprint' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sprintId = parseInt(params.id);

    await prisma.sprint.delete({
      where: { id: sprintId }
    });

    return NextResponse.json({ message: 'Sprint deleted successfully' });
  } catch (error) {
    console.error('Error deleting sprint:', error);
    return NextResponse.json({ error: 'Failed to delete sprint' }, { status: 500 });
  }
}
