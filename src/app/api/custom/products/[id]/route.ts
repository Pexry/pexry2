import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { headers as getHeaders } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config });
    
    // Get product with populated relationships
    const result = await payload.findByID({
      collection: 'products',
      id,
      depth: 2,
    });

    return NextResponse.json({ doc: result });
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    
    // Get user session
    const session = await payload.auth({ headers });
    
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Check if the product exists and user has permission
    const existingProduct = await payload.findByID({
      collection: 'products',
      id,
      depth: 1,
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get the current user with their tenants
    const user = await payload.findByID({
      collection: 'users',
      id: session.user.id,
      depth: 1,
    });

    // Check if user owns this product either directly (vendor) or through tenant
    const userOwnsProduct = existingProduct.vendor === session.user.id;
    
    // Check if user has access through tenant
    const userTenants = user.tenants || [];
    const productTenantId = existingProduct.tenant
      ? (typeof existingProduct.tenant === 'object' ? existingProduct.tenant.id : existingProduct.tenant)
      : null;
      
    const userHasTenantAccess = productTenantId && userTenants.some((tenantRel: any) => {
      const tenantId = typeof tenantRel === 'object' && tenantRel.tenant
        ? (typeof tenantRel.tenant === 'object' ? tenantRel.tenant.id : tenantRel.tenant)
        : tenantRel;
      return tenantId === productTenantId;
    });

    if (!userOwnsProduct && !userHasTenantAccess) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own products' }, { status: 403 });
    }

    // Update the product
    const result = await payload.update({
      collection: 'products',
      id,
      data,
      user: session.user,
    });

    return NextResponse.json({ doc: result });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getPayload({ config });
    const headers = await getHeaders();
    
    // Get user session
    const session = await payload.auth({ headers });
    
    if (!session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the product exists and user has permission
    const existingProduct = await payload.findByID({
      collection: 'products',
      id,
      depth: 1,
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get the current user with their tenants
    const user = await payload.findByID({
      collection: 'users',
      id: session.user.id,
      depth: 1,
    });

    // More detailed logging to debug permission issues
    console.log('Product vendor:', existingProduct.vendor, 'Product tenant:', existingProduct.tenant, 'Current user:', session.user.id);

    // Get the current user with their tenants
    // Check if user owns this product either directly (vendor) or through tenant
    const userOwnsProduct = existingProduct.vendor === session.user.id;
    
    // Check if user has access through tenant
    const userTenants = user.tenants || [];
    const productTenantId = existingProduct.tenant
      ? (typeof existingProduct.tenant === 'object' ? existingProduct.tenant.id : existingProduct.tenant)
      : null;
      
    const userHasTenantAccess = productTenantId && userTenants.some((tenantRel: any) => {
      const tenantId = typeof tenantRel === 'object' && tenantRel.tenant
        ? (typeof tenantRel.tenant === 'object' ? tenantRel.tenant.id : tenantRel.tenant)
        : tenantRel;
      return tenantId === productTenantId;
    });

    if (!userOwnsProduct && !userHasTenantAccess) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own products' }, { status: 403 });
    }

    // Delete the product
    await payload.delete({
      collection: 'products',
      id,
      user: session.user,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
