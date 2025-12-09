import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    // If no email, return all users for dropdown/selection
    if (!email) {
      const users = await prisma.user.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          name: true,
          displayName: true,
          jobTitle: true,
          department: true,
          officeLocation: true,
          resourceType: true,
        },
      })
      
      return NextResponse.json({ users })
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

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error in /api/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
