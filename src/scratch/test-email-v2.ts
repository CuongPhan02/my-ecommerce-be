import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { BrevoProvider } from '../provider/brevo-provider';

async function run() {
  console.log('Sending test email via BrevoProvider...');
  try {
    const res = await BrevoProvider.sendReactMail(
      'cuongphanq138@gmail.com', // Let's send to the user's email
      'Test Order Confirmation Email (V2)',
      'OrderConfirmationEmail',
      {
        orderId: 'TEST9999',
        name: 'Test Customer',
        totalAmount: '150,000 đ',
        shippingAddress: '123 Test Street, Ward 5, District 1, HCM',
        items: [
          { name: 'Sản phẩm Test', quantity: 1, price: '150,000 đ' }
        ]
      }
    );
    console.log('Success!', res);
  } catch (err) {
    console.error('Failure:', err);
  }
}

run();
