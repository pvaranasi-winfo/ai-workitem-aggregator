import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sprintId = parseInt(params.id);
    const body = await request.json();
    const { ticketId, storyPoints } = body;

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
    }

    // Check if ticket already exists in sprint
    const existing = await prisma.sprintTicket.findUnique({
      where: {
        sprintId_ticketId: {
          sprintId,
          ticketId: parseInt(ticketId)
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Ticket already in sprint' }, { status: 400 });
    }

    const sprintTicket = await prisma.sprintTicket.create({
      data: {
        sprintId,
        ticketId: parseInt(ticketId),
        storyPoints: storyPoints || null,
        status: 'Todo'
      },
      include: {
        ticket: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      }
    });

    return NextResponse.json(sprintTicket, { status: 201 });
  } catch (error) {
    console.error('Error adding ticket to sprint:', error);
    return NextResponse.json({ error: 'Failed to add ticket to sprint' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sprintId = parseInt(params.id);
    const body = await request.json();
    const { ticketId, storyPoints, status } = body;

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
    }

    const sprintTicket = await prisma.sprintTicket.update({
      where: {
        sprintId_ticketId: {
          sprintId,
          ticketId: parseInt(ticketId)
        }
      },
      data: {
        ...(storyPoints !== undefined && { storyPoints }),
        ...(status && { status }),
        ...(status === 'Done' && { completedAt: new Date() })
      },
      include: {
        ticket: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      }
    });

    return NextResponse.json(sprintTicket);
  } catch (error) {
    console.error('Error updating sprint ticket:', error);
    return NextResponse.json({ error: 'Failed to update sprint ticket' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sprintId = parseInt(params.id);
    const searchParams = request.nextUrl.searchParams;
    const ticketId = searchParams.get('ticketId');

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
    }

    await prisma.sprintTicket.delete({
      where: {
        sprintId_ticketId: {
          sprintId,
          ticketId: parseInt(ticketId)
        }
      }
    });

    return NextResponse.json({ message: 'Ticket removed from sprint' });
  } catch (error) {
    console.error('Error removing ticket from sprint:', error);
    return NextResponse.json({ error: 'Failed to remove ticket from sprint' }, { status: 500 });
  }
}
