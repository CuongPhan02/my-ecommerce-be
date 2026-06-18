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
      'OrderCreatedEmail',
      {
        order: {
          id: 'TEST9999',
          totalAmount: 150000,
          totalAmountFormatted: '150.000 đ',
          discountAmount: 0,
          discountAmountFormatted: '0 đ',
          createdAt: new Date(),
          customer: {
            name: 'Test Customer',
            email: 'cuongphanq138@gmail.com',
            phone: '0987654321',
          },
          shippingAddress: {
            street: '123 Test Street',
            city: 'Quận 1',
            province: 'Hồ Chí Minh',
            postalCode: '700000',
            country: 'Vietnam',
          },
          payment: {
            method: 'COD',
            status: 'PENDING',
            amountFormatted: '150.000 đ',
          },
          items: [
            {
              id: 'item-1',
              quantity: 1,
              priceAtPurchase: 150000,
              priceAtPurchaseFormatted: '150.000 đ',
              variant: {
                sku: 'SKU-TEST',
              },
              product: {
                name: 'Sản phẩm Test',
                thumbnail: {
                  url: 'https://framerusercontent.com/images/KxF8H6qGSaJvRZEhALbixoOrQg.jpg',
                },
              },
            },
          ],
        },
      }
    );
    console.log('Success!', res);
  } catch (err) {
    console.error('Failure:', err);
  }
}

run();
