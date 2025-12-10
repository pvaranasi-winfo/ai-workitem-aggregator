import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        integrations: true,
        tickets: true,
      },
    })

    if (!user) {
      return NextResponse.json({
        stats: {
          totalTickets: 0,
          activeIntegrations: 0,
          ticketsByStatus: {},
          ticketsByPlatform: {},
        },
      })
    }

    // Calculate statistics
    const totalTickets = user.tickets.length
    const ticketsByPlatform = user.tickets.reduce((acc, ticket) => {
      acc[ticket.platform] = (acc[ticket.platform] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const ticketsByStatus = user.tickets.reduce((acc, ticket) => {
      const status = ticket.status.toLowerCase()
      if (status.includes('done') || status.includes('closed') || status.includes('merged')) {
        acc.completed = (acc.completed || 0) + 1
      } else if (status.includes('progress') || status.includes('review')) {
        acc.inProgress = (acc.inProgress || 0) + 1
      } else {
        acc.todo = (acc.todo || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const recentTickets = user.tickets
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10)
      .map(ticket => ({
        ...ticket,
        labels: ticket.labels ? JSON.parse(ticket.labels) : [],
      }))

    return NextResponse.json({
      stats: {
        totalTickets,
        totalIntegrations: user.integrations.length,
        activeIntegrations: user.integrations.filter(i => i.isActive).length,
        ticketsByPlatform,
        ticketsByStatus,
      },
      recentTickets,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
