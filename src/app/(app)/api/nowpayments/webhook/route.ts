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
      // Try to find the order first
      const foundOrders = await payload.find({
        collection: 'orders',
        where: { transactionId: { equals: orderId } },
      });
      console.log('Order search result:', foundOrders);
      if (foundOrders.docs && foundOrders.docs.length > 0) {
        // Update the order status to 'paid' and store NowPayments payment_id
        const updateResult = await payload.update({
          collection: 'orders',
          where: { transactionId: { equals: orderId } },
          data: { status: 'paid', nowPaymentsPaymentId: body.payment_id },
        });
        console.log(`Order ${orderId} marked as paid. Update result:`, updateResult);
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
