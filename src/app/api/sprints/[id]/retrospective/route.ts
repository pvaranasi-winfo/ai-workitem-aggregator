import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sprintId = parseInt(params.id);

    const retrospectives = await prisma.retrospective.findMany({
      where: { sprintId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(retrospectives);
  } catch (error) {
    console.error('Error fetching retrospectives:', error);
    return NextResponse.json({ error: 'Failed to fetch retrospectives' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sprintId = parseInt(params.id);
    const body = await request.json();
    const { type, content, assigneeId } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: 'type and content are required' },
        { status: 400 }
      );
    }

    const retrospective = await prisma.retrospective.create({
      data: {
        sprintId,
        type,
        content,
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        votes: 0,
        status: type === 'ActionItem' ? 'Open' : null
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(retrospective, { status: 201 });
  } catch (error) {
    console.error('Error creating retrospective:', error);
    return NextResponse.json({ error: 'Failed to create retrospective' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { retroId, votes, status, assigneeId } = body;

    if (!retroId) {
      return NextResponse.json({ error: 'retroId is required' }, { status: 400 });
    }

    const retrospective = await prisma.retrospective.update({
      where: { id: parseInt(retroId) },
      data: {
        ...(votes !== undefined && { votes }),
        ...(status && { status }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId ? parseInt(assigneeId) : null })
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(retrospective);
  } catch (error) {
    console.error('Error updating retrospective:', error);
    return NextResponse.json({ error: 'Failed to update retrospective' }, { status: 500 });
  }
}
