import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sprintId = parseInt(params.id);

    const standups = await prisma.dailyStandup.findMany({
      where: { sprintId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(standups);
  } catch (error) {
    console.error('Error fetching standups:', error);
    return NextResponse.json({ error: 'Failed to fetch standups' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sprintId = parseInt(params.id);
    const body = await request.json();
    const { userId, date, yesterday, today, blockers } = body;

    if (!userId || !date) {
      return NextResponse.json(
        { error: 'userId and date are required' },
        { status: 400 }
      );
    }

    // Check if standup already exists for this user and date
    const existing = await prisma.dailyStandup.findUnique({
      where: {
        sprintId_userId_date: {
          sprintId,
          userId: parseInt(userId),
          date: new Date(date)
        }
      }
    });

    if (existing) {
      // Update existing standup
      const standup = await prisma.dailyStandup.update({
        where: {
          sprintId_userId_date: {
            sprintId,
            userId: parseInt(userId),
            date: new Date(date)
          }
        },
        data: {
          yesterday: yesterday || null,
          today: today || null,
          blockers: blockers || null
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      return NextResponse.json(standup);
    }

    // Create new standup
    const standup = await prisma.dailyStandup.create({
      data: {
        sprintId,
        userId: parseInt(userId),
        date: new Date(date),
        yesterday: yesterday || null,
        today: today || null,
        blockers: blockers || null
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(standup, { status: 201 });
  } catch (error) {
    console.error('Error creating standup:', error);
    return NextResponse.json({ error: 'Failed to create standup' }, { status: 500 });
  }
}
