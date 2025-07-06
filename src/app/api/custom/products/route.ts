import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { headers as getHeaders } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    
    // Get user session
    const session = await payload.auth({ headers });
    
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Get user with populated tenants to ensure they have a tenant
    const user = await payload.findByID({
      collection: 'users',
      id: session.user.id,
      depth: 1,
    });

    // If user doesn't have tenants, the beforeChange hook should have created one
    // But let's check and provide a helpful error
    if (!user.tenants || user.tenants.length === 0) {
      return NextResponse.json({ 
        error: 'No store found for your account. Please try refreshing the page or contact support.' 
      }, { status: 400 });
    }

    // Create product - the multi-tenant plugin will automatically handle tenant assignment
    const result = await payload.create({
      collection: 'products',
      data: {
        ...data,
        vendor: session.user.id,
      },
      user: session.user, // Important: Pass user context for multi-tenant plugin
    });

    return NextResponse.json({ doc: result });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
