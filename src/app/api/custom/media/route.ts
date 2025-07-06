import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create media document
    const result = await payload.create({
      collection: 'media',
      data: {
        alt: alt || file.name,
      },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    });

    return NextResponse.json({ doc: result });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'image' or 'file'
    const search = searchParams.get('search');

    let where: any = {};

    // Filter by file type if specified
    if (type === 'image') {
      where.mimeType = {
        contains: 'image/',
      };
    } else if (type === 'file') {
      where.mimeType = {
        not_contains: 'image/',
      };
    }

    // Add search functionality
    if (search) {
      where.alt = {
        contains: search,
      };
    }

    const result = await payload.find({
      collection: 'media',
      where,
      sort: '-createdAt',
      limit: 20,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
