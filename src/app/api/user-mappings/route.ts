import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all user mappings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const where = projectId ? { projectId } : {};

    const mappings = await prisma.userProject.findMany({
      where,
      include: {
        user: true,
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ mappings });
  } catch (error) {
    console.error('Error fetching user mappings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user mappings' },
      { status: 500 }
    );
  }
}

// POST create new user mapping
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, userId, role, allocationPercentage, startDate, endDate } = body;

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: 'Project ID and User ID are required' },
        { status: 400 }
      );
    }

    // Check if mapping already exists
    const existing = await prisma.userProject.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This user is already mapped to this project' },
        { status: 400 }
      );
    }

    const mapping = await prisma.userProject.create({
      data: {
        userId,
        projectId,
        role: role || null,
        allocationPercentage: allocationPercentage ? parseFloat(allocationPercentage) : 100,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        user: true,
        project: true,
      },
    });

    return NextResponse.json({ mapping }, { status: 201 });
  } catch (error) {
    console.error('Error creating user mapping:', error);
    return NextResponse.json(
      { error: 'Failed to create user mapping' },
      { status: 500 }
    );
  }
}
