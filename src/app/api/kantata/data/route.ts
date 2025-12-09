import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/crypto'
import { KantataIntegration } from '@/lib/integrations/kantata'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const integrationId = searchParams.get('integrationId')
    const dataType = searchParams.get('type') // 'workspaces', 'tasks', 'timeEntries'

    if (!integrationId || !dataType) {
      return NextResponse.json(
        { error: 'Integration ID and data type are required' },
        { status: 400 }
      )
    }

    // Get the integration from database
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    })

    if (!integration || integration.platform !== 'kantata') {
      return NextResponse.json(
        { error: 'Kantata integration not found' },
        { status: 404 }
      )
    }

    // Get access token and subdomain
    const accessToken = decrypt(integration.token)
    const subdomain = integration.baseUrl?.replace('https://', '').replace('.mavenlink.com', '') || ''

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Kantata subdomain not found' },
        { status: 400 }
      )
    }

    const kantata = new KantataIntegration({
      subdomain,
      accessToken,
    })

    let data: any = null

    try {
      switch (dataType) {
        case 'workspaces':
          data = await kantata.fetchWorkspaces()
          break
        case 'tasks':
          const workspaceIds = searchParams.get('workspaceIds')?.split(',')
          data = await kantata.fetchTasks(workspaceIds)
          break
        case 'timeEntries':
          const startDate = searchParams.get('startDate')
          const endDate = searchParams.get('endDate')
          const workspaceId = searchParams.get('workspaceId')
          data = await kantata.fetchTimeEntries({
            startDate,
            endDate,
            workspaceId,
          })
          break
        case 'test':
          data = await kantata.testConnection()
          break
        default:
          return NextResponse.json(
            { error: 'Invalid data type' },
            { status: 400 }
          )
      }
    } catch (error: any) {
      // For personal access tokens, we don't have refresh capability
      // User needs to update their token manually if it expires
      return NextResponse.json(
        { error: `Kantata API Error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, type: dataType })
  } catch (error: any) {
    console.error('Error fetching Kantata data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}