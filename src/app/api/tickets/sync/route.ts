import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/crypto'
import { fetchTicketsFromPlatform } from '@/lib/integrations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, integrationId } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        integrations: {
          where: integrationId ? { id: integrationId } : { isActive: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.integrations.length === 0) {
      return NextResponse.json(
        { error: 'No active integrations found' },
        { status: 404 }
      )
    }

    let totalTickets = 0

    for (const integration of user.integrations) {
      try {
        const token = decrypt(integration.token)
        const externalTickets = await fetchTicketsFromPlatform(
          integration.platform,
          token,
          integration.baseUrl || undefined,
          integration.username || undefined,
          email
        )

        // Delete existing tickets for this integration
        await prisma.ticket.deleteMany({
          where: { integrationId: integration.id },
        })

        // Create new tickets
        if (externalTickets.length > 0) {
          await prisma.ticket.createMany({
            data: externalTickets.map(ticket => ({
              userId: user.id,
              integrationId: integration.id,
              externalId: ticket.id,
              platform: integration.platform,
              title: ticket.title,
              description: ticket.description,
              status: ticket.status,
              priority: ticket.priority,
              type: ticket.type,
              assignee: ticket.assignee,
              reporter: ticket.reporter,
              projectKey: ticket.projectKey,
              projectName: ticket.projectName,
              labels: ticket.labels ? JSON.stringify(ticket.labels) : null,
              url: ticket.url,
              createdAt: ticket.createdAt,
              updatedAt: ticket.updatedAt,
              dueDate: ticket.dueDate,
            })),
          })

          totalTickets += externalTickets.length
        }

        // Update last synced timestamp
        await prisma.integration.update({
          where: { id: integration.id },
          data: { lastSyncedAt: new Date() },
        })
      } catch (error) {
        console.error(`Error syncing ${integration.platform}:`, error)
        // Continue with other integrations even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      ticketCount: totalTickets,
      message: `Successfully synced ${totalTickets} tickets`,
    })
  } catch (error) {
    console.error('Error syncing tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
