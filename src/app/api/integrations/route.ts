import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { encrypt, decrypt } from '@/lib/crypto'
import { testPlatformConnection } from '@/lib/integrations'

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
        integrations: {
          select: {
            id: true,
            platform: true,
            name: true,
            baseUrl: true,
            username: true,
            isActive: true,
            lastSyncedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ integrations: user.integrations })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, platform, name, token, baseUrl, username } = body

    if (!email || !platform || !name || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Test connection first
    const isValid = await testPlatformConnection(platform, token, baseUrl, username)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Failed to connect to platform. Please check your credentials.' },
        { status: 400 }
      )
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: { email },
      })
    }

    // Encrypt token
    const encryptedToken = encrypt(token)

    // Create integration
    const integration = await prisma.integration.create({
      data: {
        userId: user.id,
        platform,
        name,
        token: encryptedToken,
        baseUrl,
        username,
      },
      select: {
        id: true,
        platform: true,
        name: true,
        baseUrl: true,
        username: true,
        isActive: true,
        lastSyncedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ integration }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating integration:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An integration with this name already exists for this platform' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      )
    }

    await prisma.integration.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting integration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isActive } = body

    if (!id || isActive === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const integration = await prisma.integration.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        platform: true,
        name: true,
        baseUrl: true,
        username: true,
        isActive: true,
        lastSyncedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ integration })
  } catch (error) {
    console.error('Error updating integration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
