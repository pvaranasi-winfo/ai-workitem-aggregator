import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ tickets: [] })
    }

    // Build where clause
    const where: any = {
      userId: user.id,
    }

    if (platform) {
      where.platform = platform
    }

    if (status) {
      where.status = {
        contains: status,
        mode: 'insensitive',
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { externalId: { contains: search, mode: 'insensitive' } },
      ]
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 1000, // Limit to prevent performance issues
    })

    // Parse labels JSON
    const ticketsWithLabels = tickets.map(ticket => ({
      ...ticket,
      labels: ticket.labels ? JSON.parse(ticket.labels) : [],
    }))

    return NextResponse.json({ tickets: ticketsWithLabels })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
