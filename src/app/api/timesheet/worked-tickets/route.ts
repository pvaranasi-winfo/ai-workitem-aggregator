import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Get tickets worked on a specific date (based on recent updates)
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
      return NextResponse.json({ tickets: [] });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Get tickets that were updated on this date or have status "In Progress"
    const tickets = await prisma.ticket.findMany({
      where: {
        userId: user.id,
        OR: [
          {
            updatedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            status: {
              contains: 'In Progress',
            },
          },
        ],
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error fetching worked tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch worked tickets' },
      { status: 500 }
    );
  }
}
