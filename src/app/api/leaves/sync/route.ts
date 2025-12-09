import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Mock sync function - replace with actual API integration
async function syncFromPlatform(platform: string) {
  // This is a mock implementation
  // In production, integrate with actual APIs:
  // - Jira: Use Jira Time Off API
  // - Azure DevOps: Use Azure DevOps REST API
  // - Slack: Use Slack Time Off Bot API
  
  const mockData = [
    {
      externalId: `${platform}-001`,
      userId: '', // Will be filled from actual user
      leaveType: 'Annual',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-20'),
      days: 5,
      status: 'Approved',
      source: platform,
    },
  ];

  return mockData;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform } = body;

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      );
    }

    // Sync leave data from external platform
    const externalLeaves = await syncFromPlatform(platform);

    // Get first user for demo purposes
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      return NextResponse.json(
        { error: 'No users found in system' },
        { status: 400 }
      );
    }

    let syncedCount = 0;

    for (const extLeave of externalLeaves) {
      // Check if leave already exists
      const existing = await prisma.leave.findFirst({
        where: {
          externalId: extLeave.externalId,
          source: platform,
        },
      });

      if (!existing) {
        await prisma.leave.create({
          data: {
            ...extLeave,
            userId: firstUser.id, // In production, map to actual user
          },
        });
        syncedCount++;
      }
    }

    return NextResponse.json({
      message: `Successfully synced ${syncedCount} leaves from ${platform}`,
      platform,
      synced: syncedCount,
    });
  } catch (error) {
    console.error('Error syncing leaves:', error);
    return NextResponse.json(
      { error: 'Failed to sync leaves' },
      { status: 500 }
    );
  }
}
