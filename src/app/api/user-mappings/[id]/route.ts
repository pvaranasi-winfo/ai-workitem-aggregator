import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// DELETE user mapping
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.userProject.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'User mapping deleted successfully' });
  } catch (error) {
    console.error('Error deleting user mapping:', error);
    return NextResponse.json(
      { error: 'Failed to delete user mapping' },
      { status: 500 }
    );
  }
}
