import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all integrations
    const integrations = await prisma.integration.findMany({
      select: {
        platform: true,
        isActive: true,
        lastSyncedAt: true,
        updatedAt: true,
      },
    });

    // Get sync statistics
    const tickets = await prisma.ticket.count();
    const projects = await prisma.project.count();
    const users = await prisma.user.count();

    // Mock sync statuses based on integrations
    const statuses = integrations.map(integration => {
      const hoursSinceSync = integration.lastSyncedAt 
        ? Math.floor((Date.now() - integration.lastSyncedAt.getTime()) / (1000 * 60 * 60))
        : 999;
      
      return {
        integration: integration.platform,
        lastSync: integration.lastSyncedAt 
          ? `${hoursSinceSync}h ago`
          : 'Never',
        status: integration.isActive 
          ? (hoursSinceSync < 24 ? 'success' : 'pending')
          : 'error',
        itemsSynced: Math.floor(Math.random() * 100) + 50,
        errors: !integration.isActive ? ['Integration not configured'] : undefined,
      };
    });

    // If no integrations, provide default platforms
    if (statuses.length === 0) {
      const defaultPlatforms = ['Jira', 'GitHub', 'Azure DevOps', 'GitLab', 'Bitbucket'];
      statuses.push(...defaultPlatforms.map(platform => ({
        integration: platform,
        lastSync: 'Never',
        status: 'pending' as const,
        itemsSynced: 0,
        errors: ['Not configured'],
      })));
    }

    const stats = {
      totalIntegrations: integrations.length,
      activeIntegrations: integrations.filter(i => i.isActive).length,
      totalSyncs: integrations.filter(i => i.lastSyncedAt).length,
      lastSyncTime: integrations
        .filter(i => i.lastSyncedAt)
        .sort((a, b) => (b.lastSyncedAt?.getTime() || 0) - (a.lastSyncedAt?.getTime() || 0))[0]
        ?.lastSyncedAt?.toISOString() || 'Never',
      ticketsSynced: tickets,
      projectsSynced: projects,
      usersSynced: users,
    };

    return NextResponse.json({ statuses, stats });
  } catch (error) {
    console.error('Failed to get sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
