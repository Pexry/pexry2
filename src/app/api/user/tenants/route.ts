import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { headers as getHeaders } from 'next/headers';

export async function GET() {
  try {
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    
    // Get user session
    const session = await payload.auth({ headers });
    
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with tenants
    const user = await payload.findByID({
      collection: 'users',
      id: session.user.id,
      depth: 1,
    });

    return NextResponse.json({ 
      tenants: user.tenants || [],
      hasTenants: user.tenants && user.tenants.length > 0
    });
  } catch (error) {
    console.error('User tenants check error:', error);
    return NextResponse.json(
      { error: 'Failed to check user tenants' },
      { status: 500 }
    );
  }
}
