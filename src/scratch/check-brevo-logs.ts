import dotenv from 'dotenv';
import path from 'path';
// Load from .env in root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

async function run() {
  const apiInstance = new TransactionalEmailsApi();
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('Missing BREVO_API_KEY');
    return;
  }
  
  apiInstance.setApiKey(
    TransactionalEmailsApiApiKeys.apiKey,
    apiKey
  );

  try {
    console.log('Fetching recent email logs from Brevo...');
    // We can use getEmailEventReport to see delivery statuses
    const data = await apiInstance.getEmailEventReport(
      100, // limit
      0,   // offset
      undefined, // startDate
      undefined, // endDate
      undefined, // limit (again? no, this SDK might differ)
    );
    console.log('Response:', JSON.stringify(data.body || data, null, 2));
  } catch (error: any) {
    console.error('Error fetching logs:', error.response?.body || error.message || error);
  }
}

run();
