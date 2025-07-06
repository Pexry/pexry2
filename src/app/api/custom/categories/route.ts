import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function GET() {
  try {
    const payload = await getPayload({ config });
    
    const result = await payload.find({
      collection: 'categories',
      sort: 'name',
      limit: 100,
      depth: 2, // Include parent relationships
    });

    console.log('Categories API result:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
