// Script to update payment status via the external API
const fetch = require('node-fetch');

// Replace with your actual API token
const API_TOKEN = process.env.PAYMENTS_API_TOKEN || 'YOUR_API_TOKEN';

// Sample payment data - replace with actual values
const paymentData = {
  tenantId: 'TENANT_ID_HERE',
  paymentStatus: 'paid',
  paymentId: 'PAYMENT_ID_HERE',
  amount: 1000, // Amount in cents
  currency: 'usd',
  paymentMethod: 'stripe',
  timestamp: new Date().toISOString()
};

async function updatePaymentStatus() {
  try {
    const response = await fetch(
      'https://production-api-v3-20250508.onrender.com/api/v2/internal/update-payment-status/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      }
    );

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error updating payment status:', error.message);
    return { error: 'Failed to update payment status' };
  }
}

// Execute the function
updatePaymentStatus();