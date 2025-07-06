import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function POST(req: NextRequest) {
  let body;
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const text = await req.text();
    try {
      body = JSON.parse(text);
    } catch (e) {
      console.error('Invalid JSON received:', text);
      return new NextResponse('Invalid JSON', { status: 400 });
    }
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    body = Object.fromEntries(new URLSearchParams(text));
  } else {
    return new NextResponse('Unsupported Content-Type', { status: 415 });
  }

  // Log webhook for debugging
  console.log('NowPayments webhook received:', body);

  // Only handle finished payments
  if (body.payment_status === 'finished') {
    const payload = await getPayload({ config });
    const orderId = body.order_id;
    if (orderId) {
      // Enhanced debugging - try multiple search approaches
      console.log(`Searching for order with transactionId: "${orderId}"`);
      
      // Try exact match first
      let foundOrders = await payload.find({
        collection: 'orders',
        where: { transactionId: { equals: orderId } },
        limit: 10,
      });
      console.log('Exact match search result:', foundOrders);
      
      // If no exact match, try case-insensitive search (this handles whitespace issues too)
      if (foundOrders.docs.length === 0) {
        console.log('No exact match found, trying case-insensitive search...');
        const caseInsensitiveSearch = await payload.find({
          collection: 'orders',
          where: { 
            transactionId: { 
              like: orderId 
            } 
          },
          limit: 10,
        });
        console.log('Case-insensitive search result:', caseInsensitiveSearch);
        
        // Use the case-insensitive result if found
        if (caseInsensitiveSearch.docs.length > 0) {
          foundOrders = caseInsensitiveSearch;
          console.log('Using case-insensitive search result');
        } else {
          // If still no match, let's see what orders exist
          console.log('No case-insensitive match found, checking recent orders...');
          const recentOrders = await payload.find({
            collection: 'orders',
            sort: '-createdAt',
            limit: 5,
          });
          console.log('Recent orders (last 5):', recentOrders.docs.map(order => ({
            id: order.id,
            transactionId: order.transactionId,
            status: order.status,
            createdAt: order.createdAt,
            amount: order.amount
          })));
        }
      }
      
      if (foundOrders.docs && foundOrders.docs.length > 0) {
        const order = foundOrders.docs[0];
        if (order) {
          console.log(`Found order with ID: ${order.id}, current status: ${order.status}`);
          
          // Update the order status to 'paid' and store NowPayments payment_id
          const updateResult = await payload.update({
            collection: 'orders',
            id: order.id, // Use the order ID instead of where clause for more reliable update
            data: { 
              status: 'paid', 
              nowPaymentsPaymentId: body.payment_id.toString(),
              updatedAt: new Date().toISOString()
            },
          });
          console.log(`Order ${order.id} (transactionId: "${order.transactionId}") marked as paid. Update result:`, updateResult);
        }
      } else {
        console.log(`No order found with transactionId = ${orderId}`);
      }
    } else {
      console.log('No order_id in webhook body.');
    }
  } else {
    console.log('Webhook received but payment_status is not finished:', body.payment_status);
  }

  return NextResponse.json({ received: true });
}
