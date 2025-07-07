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

    // Debug: Log the request details
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    console.log('Content-Type:', request.headers.get('content-type'));
    
    const contentType = request.headers.get('content-type') || '';
    let data: any = {};
    let uploadedFiles: any = {};

    if (contentType.includes('application/json')) {
      // Handle JSON requests
      try {
        data = await request.json();
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return NextResponse.json({ 
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        }, { status: 400 });
      }
    } else if (contentType.includes('multipart/form-data')) {
      // Handle multipart/form-data requests (with file uploads)
      try {
        const formData = await request.formData();
        
        console.log('FormData entries:');
        for (const [key, value] of formData.entries()) {
          console.log(`- ${key}: ${value instanceof File ? `File(${value.name})` : value}`);
        }
        
        // Map form field names to expected database field names
        const fieldMapping: { [key: string]: string } = {
          'Name': 'name',
          'name': 'name',
          'Price': 'price', 
          'price': 'price',
          'Description': 'description',
          'description': 'description',
          'Category': 'category',
          'category': 'category',
          'Subcategory': 'subcategory',
          'subcategory': 'subcategory',
          'Tags': 'tags',
          'tags': 'tags',
          'Image': 'image',
          'image': 'image',
          'File': 'file',
          'file': 'file',
          'DeliveryType': 'deliveryType',
          'deliveryType': 'deliveryType',
          'DeliveryText': 'deliveryText',
          'deliveryText': 'deliveryText',
          'RefundPolicy': 'refundPolicy',
          'refundPolicy': 'refundPolicy',
          'IsArchived': 'isArchived',
          'isArchived': 'isArchived'
        };
        
        // Check if this is a Payload admin interface request with _payload field
        const payloadData = formData.get('_payload');
        if (payloadData && typeof payloadData === 'string') {
          // Handle Payload admin interface format
          try {
            const parsedPayload = JSON.parse(payloadData);
            console.log('Parsed _payload data:', parsedPayload);
            data = { ...parsedPayload };
          } catch (parseError) {
            console.error('Failed to parse _payload field:', parseError);
            return NextResponse.json({ 
              error: 'Invalid _payload JSON format',
              details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
            }, { status: 400 });
          }
          
          // Handle any additional files that might be uploaded alongside _payload
          for (const [key, value] of formData.entries()) {
            if (key !== '_payload' && value instanceof File) {
              const buffer = Buffer.from(await value.arrayBuffer());
              
              const mediaResult = await payload.create({
                collection: 'media',
                data: {
                  alt: `${key} for product`,
                },
                file: {
                  data: buffer,
                  mimetype: value.type,
                  name: value.name,
                  size: value.size,
                },
              });
              
              uploadedFiles[key] = mediaResult.id;
            }
          }
        } else {
          // Handle standard multipart/form-data format
          for (const [key, value] of formData.entries()) {
            const mappedKey = fieldMapping[key] || key.toLowerCase();
            
            if (value instanceof File) {
              // Handle file uploads
              const buffer = Buffer.from(await value.arrayBuffer());
              
              // Upload file to media collection first
              const mediaResult = await payload.create({
                collection: 'media',
                data: {
                  alt: `${mappedKey} for product`,
                },
                file: {
                  data: buffer,
                  mimetype: value.type,
                  name: value.name,
                  size: value.size,
                },
              });
              
              uploadedFiles[mappedKey] = mediaResult.id;
            } else {
              // Handle regular form fields
              let processedValue: any = value;
              
              try {
                // Try to parse as JSON if it looks like JSON
                if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                  processedValue = JSON.parse(value);
                } else if (typeof value === 'string') {
                  // Handle specific field types
                  if (mappedKey === 'price') {
                    processedValue = parseFloat(value) || 0;
                  } else if (mappedKey === 'isArchived') {
                    processedValue = value === 'true' || value === '1';
                  } else if (mappedKey === 'tags' && value.includes(',')) {
                    // Handle comma-separated tags
                    processedValue = value.split(',').map(tag => tag.trim());
                  } else {
                    processedValue = value;
                  }
                }
              } catch (parseError) {
                console.warn(`Failed to parse value for ${mappedKey}:`, parseError);
                processedValue = value;
              }
              
              data[mappedKey] = processedValue;
            }
          }
        }
        
        // Merge uploaded file IDs into data
        data = { ...data, ...uploadedFiles };
        
        console.log('Processed form data:', data);
        
      } catch (error) {
        console.error('FormData parse error:', error);
        return NextResponse.json({ 
          error: 'Failed to process form data',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 });
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // Handle URL-encoded form data
      try {
        const formText = await request.text();
        const urlParams = new URLSearchParams(formText);
        
        console.log('URL-encoded form entries:');
        for (const [key, value] of urlParams.entries()) {
          console.log(`- ${key}: ${value}`);
        }
        
        // Map form field names to expected database field names
        const fieldMapping: { [key: string]: string } = {
          'Name': 'name',
          'name': 'name',
          'Price': 'price', 
          'price': 'price',
          'Description': 'description',
          'description': 'description',
          'Category': 'category',
          'category': 'category',
          'Subcategory': 'subcategory',
          'subcategory': 'subcategory',
          'Tags': 'tags',
          'tags': 'tags',
          'Image': 'image',
          'image': 'image',
          'File': 'file',
          'file': 'file',
          'DeliveryType': 'deliveryType',
          'deliveryType': 'deliveryType',
          'DeliveryText': 'deliveryText',
          'deliveryText': 'deliveryText',
          'RefundPolicy': 'refundPolicy',
          'refundPolicy': 'refundPolicy',
          'IsArchived': 'isArchived',
          'isArchived': 'isArchived'
        };

        // Check if this is a Payload admin interface request with _payload field
        const payloadData = urlParams.get('_payload');
        if (payloadData) {
          // Handle Payload admin interface format
          try {
            const parsedPayload = JSON.parse(payloadData);
            console.log('Parsed _payload data from URL-encoded:', parsedPayload);
            data = { ...parsedPayload };
          } catch (parseError) {
            console.error('Failed to parse _payload field from URL-encoded:', parseError);
            return NextResponse.json({ 
              error: 'Invalid _payload JSON format in URL-encoded data',
              details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
            }, { status: 400 });
          }
        } else {
          // Handle standard URL-encoded format
          for (const [key, value] of urlParams.entries()) {
            const mappedKey = fieldMapping[key] || key.toLowerCase();
            let processedValue: any = value;
            
            try {
              // Try to parse as JSON if it looks like JSON
              if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                processedValue = JSON.parse(value);
              } else if (typeof value === 'string') {
                // Handle specific field types
                if (mappedKey === 'price') {
                  processedValue = parseFloat(value) || 0;
                } else if (mappedKey === 'isArchived') {
                  processedValue = value === 'true' || value === '1';
                } else if (mappedKey === 'tags' && value.includes(',')) {
                  // Handle comma-separated tags
                  processedValue = value.split(',').map(tag => tag.trim());
                } else {
                  processedValue = value;
                }
              }
            } catch (parseError) {
              console.warn(`Failed to parse URL-encoded value for ${mappedKey}:`, parseError);
              processedValue = value;
            }
            
            data[mappedKey] = processedValue;
          }
        }
        
        console.log('Processed URL-encoded data:', data);
        
      } catch (error) {
        console.error('URL-encoded parse error:', error);
        return NextResponse.json({ 
          error: 'Failed to process URL-encoded form data',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 });
      }
    } else {
      console.log('Invalid content type:', contentType);
      return NextResponse.json({ 
        error: 'Invalid content type. Expected application/json, multipart/form-data, or application/x-www-form-urlencoded' 
      }, { status: 400 });
    }

    // Check if this is actually a query request that should be handled as GET
    const isQueryRequest = data.depth !== undefined || 
                          data.limit !== undefined || 
                          data.page !== undefined || 
                          data.sort !== undefined ||
                          data.draft !== undefined ||
                          Object.keys(data).some(key => key.startsWith('select[') || key.startsWith('where['));

    if (isQueryRequest) {
      console.log('Detected query request in POST, handling as product fetch...');
      
      // Build query parameters for find operation
      const searchParams = new URL(request.url).searchParams;
      
      // Extract query parameters from both URL and body data
      const depth = parseInt(data.depth || searchParams.get('depth') || '0');
      const limit = parseInt(data.limit || searchParams.get('limit') || '100');
      const page = parseInt(data.page || searchParams.get('page') || '1');
      const sort = data.sort || searchParams.get('sort') || '-createdAt';
      
      // Handle the query as a find operation
      const result = await payload.find({
        collection: 'products',
        where: {
          vendor: { equals: session.user.id },
        },
        sort: sort,
        limit: limit,
        depth: depth,
        page: page,
      });

      return NextResponse.json(result);
    }

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

    // Validate required fields
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      console.log('Missing or invalid name field:', data.name);
      return NextResponse.json({ 
        error: 'Product name is required',
        received: data
      }, { status: 400 });
    }

    if (data.price === undefined || data.price === null || isNaN(Number(data.price))) {
      console.log('Missing or invalid price field:', data.price);
      return NextResponse.json({ 
        error: 'Valid product price is required',
        received: data
      }, { status: 400 });
    }

    // Ensure price is a number
    data.price = Number(data.price);

    console.log('Final product data to create:', {
      ...data,
      vendor: session.user.id,
    });

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

export async function GET() {
  try {
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    
    // Get user session
    const session = await payload.auth({ headers });
    
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const result = await payload.find({
      collection: 'products',
      where: {
        vendor: { equals: session.user.id },
      },
      sort: '-createdAt',
      limit: 100,
      depth: 2,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    
    // Get user session
    const session = await payload.auth({ headers });
    
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters to get the product IDs to delete
    const url = new URL(request.url);
    const whereParam = url.searchParams.get('where[id][in][0]');
    
    if (!whereParam) {
      return NextResponse.json({ error: 'No product ID specified for deletion' }, { status: 400 });
    }

    // Check if the product exists and user has permission to delete it
    const existingProduct = await payload.findByID({
      collection: 'products',
      id: whereParam,
      depth: 1,
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if user is the vendor of this product or is a super admin
    const user = await payload.findByID({
      collection: 'users',
      id: session.user.id,
      depth: 1,
    });

    const isSuperAdmin = user.roles?.includes('super-admin');
    const isVendor = existingProduct.vendor === session.user.id || 
                    (typeof existingProduct.vendor === 'object' && existingProduct.vendor?.id === session.user.id);

    if (!isSuperAdmin && !isVendor) {
      return NextResponse.json({ 
        error: 'You do not have permission to delete this product' 
      }, { status: 403 });
    }

    // Delete the product
    await payload.delete({
      collection: 'products',
      id: whereParam,
      user: session.user,
    });

    return NextResponse.json({ 
      message: 'Product deleted successfully',
      id: whereParam 
    });

  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
