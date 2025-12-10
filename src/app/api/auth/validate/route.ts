import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        role: true,
        jobTitle: true,
        department: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        email: user.email,
        name: user.displayName || user.name,
        role: user.role,
        jobTitle: user.jobTitle,
        department: user.department,
      }
    });
  } catch (error) {
    console.error('Error validating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
