import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET Entra ID configuration
export async function GET(request: NextRequest) {
  try {
    const config = await prisma.entraConfig.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!config) {
      return NextResponse.json(
        { isEnabled: false },
        { status: 200 }
      );
    }

    // Don't send the client secret back
    return NextResponse.json({
      tenantId: config.tenantId,
      clientId: config.clientId,
      isEnabled: config.isEnabled,
      lastSyncedAt: config.lastSyncedAt,
    });
  } catch (error) {
    console.error('Error fetching Entra config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

// POST save Entra ID configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, clientId, clientSecret, isEnabled } = body;

    // Delete existing config
    await prisma.entraConfig.deleteMany({});

    // Create new config
    const config = await prisma.entraConfig.create({
      data: {
        tenantId: tenantId || '',
        clientId: clientId || '',
        clientSecret: clientSecret || '', // In production, encrypt this
        isEnabled: isEnabled || false,
      },
    });

    return NextResponse.json({
      message: 'Configuration saved successfully',
      isEnabled: config.isEnabled,
    });
  } catch (error) {
    console.error('Error saving Entra config:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}
