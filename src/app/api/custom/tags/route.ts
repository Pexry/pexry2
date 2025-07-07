import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET() {
  try {
    const payload = await getPayload({ config });
    
    const result = await payload.find({
      collection: 'tags',
      sort: 'name',
      limit: 100,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Tags fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
