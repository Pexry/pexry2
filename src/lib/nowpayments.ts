import axios from 'axios';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;

export async function createNowPayment(amount: number, currency: string, orderId: string) {
  const response = await axios.post(
    'https://api.nowpayments.io/v1/invoice',
    {
      price_amount: amount,
      price_currency: currency,
      order_id: orderId,
    },
    {
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}
