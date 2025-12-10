import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    const sprints = await prisma.sprint.findMany({
      where: projectId ? { projectId: parseInt(projectId) } : {},
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
                status: true,
                priority: true,
                sprint: true
              }
            }
          }
        },
        _count: {
          select: {
            sprintTickets: true,
            retrospectives: true,
            dailyStandups: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return NextResponse.json(sprints);
  } catch (error) {
    console.error('Error fetching sprints:', error);
    return NextResponse.json({ error: 'Failed to fetch sprints' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, name, goal, startDate, endDate, capacity, commitment } = body;

    if (!projectId || !name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, name, startDate, endDate' },
        { status: 400 }
      );
    }

    const sprint = await prisma.sprint.create({
      data: {
        projectId: parseInt(projectId),
        name,
        goal: goal || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'Planning',
        capacity: capacity || null,
        commitment: commitment || null
      },
      include: {
        project: {
          select: { id: true, title: true }
        }
      }
    });

    return NextResponse.json(sprint, { status: 201 });
  } catch (error) {
    console.error('Error creating sprint:', error);
    return NextResponse.json({ error: 'Failed to create sprint' }, { status: 500 });
  }
}
