import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Get time entries for a specific date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const date = searchParams.get('date');

    if (!email || !date) {
      return NextResponse.json(
        { error: 'Email and date are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ entries: [] });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const entries = await prisma.timeEntry.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        ticket: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

// Create or update time entries
export async function POST(request: NextRequest) {
  try {
    const { email, date, entries } = await request.json();

    if (!email || !date || !entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'Email, date, and entries array are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const entryDate = new Date(date);
    entryDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

    // Delete existing entries for this date
    await prisma.timeEntry.deleteMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(date + 'T00:00:00'),
          lte: new Date(date + 'T23:59:59'),
        },
      },
    });

    // Create new entries
    const createdEntries = await Promise.all(
      entries.map((entry: any) =>
        prisma.timeEntry.create({
          data: {
            userId: user.id,
            ticketId: entry.ticketId,
            date: entryDate,
            hours: entry.hours,
            description: entry.description || '',
          },
        })
      )
    );

    // Update ticket logged hours
    for (const entry of entries) {
      const ticket = await prisma.ticket.findUnique({
        where: { id: entry.ticketId },
      });

      if (ticket) {
        const totalLogged = await prisma.timeEntry.aggregate({
          where: { ticketId: entry.ticketId },
          _sum: { hours: true },
        });

        await prisma.ticket.update({
          where: { id: entry.ticketId },
          data: {
            loggedHours: totalLogged._sum.hours || 0,
            remainingHours: (ticket.estimatedHours || 0) - (totalLogged._sum.hours || 0),
          },
        });
      }
    }

    return NextResponse.json({
      message: 'Timesheet saved successfully',
      entries: createdEntries,
    });
  } catch (error) {
    console.error('Error saving timesheet:', error);
    return NextResponse.json(
      { error: 'Failed to save timesheet' },
      { status: 500 }
    );
  }
}
