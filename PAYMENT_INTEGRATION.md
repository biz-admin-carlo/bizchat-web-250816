# Payment Integration Documentation

## Overview

This document outlines the payment integration between BizChat and the external payment processing system. The integration handles payment processing through Stripe and synchronizes payment status with an external payment API.

## Components

### 1. Stripe Checkout Integration

The application uses Stripe Checkout for payment processing. The flow is as follows:

1. User selects a pricing tier in the `PricingTiers` component
2. A tenant is created with payment status set to "pending"
3. User is redirected to Stripe Checkout
4. After successful payment, user is redirected to the success page

### 2. Stripe Webhook Handler

The Stripe webhook handler (`/app/api/stripe-webhook/route.ts`) processes payment events from Stripe:

- Listens for the `checkout.session.completed` event
- Updates the tenant's payment status to "paid" in Firestore
- Notifies the external payment API about the successful payment

### 3. External Payment API Integration

The application integrates with an external payment API:

- Webhook handler notifies the external API when payments are completed
- A proxy endpoint (`/app/api/fetch-payments/route.ts`) allows fetching payment data from the external API

## Environment Variables

The following environment variables are required for the payment integration:

```
# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# External API Configuration
PAYMENTS_API_TOKEN=your_payments_api_token
```

## Setting Up Stripe Webhooks

1. Create a webhook in the Stripe dashboard pointing to your application's webhook endpoint:
   - Endpoint URL: `https://your-domain.com/api/stripe-webhook`
   - Events to listen for: `checkout.session.completed`

2. Get the webhook signing secret from Stripe and add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

## Testing Payments

To test the payment flow:

1. Use Stripe test cards (e.g., `4242 4242 4242 4242`) for test payments
2. Monitor the webhook events in the Stripe dashboard
3. Check the application logs for successful payment processing

## Fetching Payments

To fetch payments from the external API, make a request to the proxy endpoint:

```bash
curl --location 'https://your-domain.com/api/fetch-payments' \
--header 'Authorization: Bearer your_auth_token'
```

This will forward the request to the external payment API and return the results.