import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST sync users from Entra ID
export async function POST(request: NextRequest) {
  try {
    // Get Entra config
    const config = await prisma.entraConfig.findFirst({
      where: { isEnabled: true },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Entra ID integration is not configured or enabled' },
        { status: 400 }
      );
    }

    // In a production environment, you would:
    // 1. Use Microsoft Graph API to fetch users
    // 2. Authenticate using the client credentials
    // 3. Fetch users from the directory
    // 4. Sync them to the database

    // For now, this is a placeholder that simulates the sync
    // You'll need to install @microsoft/microsoft-graph-client package
    
    // Mock implementation - replace with actual Graph API call
    const mockUsers = [
      {
        id: 'entra-user-1',
        mail: 'john.doe@company.com',
        displayName: 'John Doe',
        jobTitle: 'Software Engineer',
        department: 'Engineering',
        officeLocation: 'New York',
      },
      {
        id: 'entra-user-2',
        mail: 'jane.smith@company.com',
        displayName: 'Jane Smith',
        jobTitle: 'Senior Developer',
        department: 'Engineering',
        officeLocation: 'San Francisco',
      },
    ];

    let syncedCount = 0;

    for (const entraUser of mockUsers) {
      await prisma.user.upsert({
        where: { email: entraUser.mail },
        update: {
          entraId: entraUser.id,
          displayName: entraUser.displayName,
          jobTitle: entraUser.jobTitle,
          department: entraUser.department,
          officeLocation: entraUser.officeLocation,
        },
        create: {
          email: entraUser.mail,
          name: entraUser.displayName,
          entraId: entraUser.id,
          displayName: entraUser.displayName,
          jobTitle: entraUser.jobTitle,
          department: entraUser.department,
          officeLocation: entraUser.officeLocation,
        },
      });
      syncedCount++;
    }

    // Update last synced time
    await prisma.entraConfig.update({
      where: { id: config.id },
      data: { lastSyncedAt: new Date() },
    });

    return NextResponse.json({
      message: 'Users synced successfully',
      synced: syncedCount,
    });
  } catch (error) {
    console.error('Error syncing from Entra ID:', error);
    return NextResponse.json(
      { error: 'Failed to sync users from Entra ID' },
      { status: 500 }
    );
  }
}
