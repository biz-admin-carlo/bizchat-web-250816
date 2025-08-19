# Payment Verification System

## Overview

The payment verification system ensures that user tiers are only updated to "paid" status when payments are genuinely successful. This system provides an additional layer of security and verification beyond the Stripe webhook handler.

## Components

### 1. Payment Verification Handler (`/app/api/handlers/paymentVerification.ts`)

This utility module contains the core logic for verifying payments and updating user tiers:

#### Key Functions:

- **`isPaymentSuccessful(payment: PaymentData): boolean`**

  - Verifies if a payment meets all success criteria
  - Checks payment status, confirmation, amount, and refund status
  - Returns `true` only if payment is genuinely successful

- **`updateUserTierToPaid(userId: string, payment: PaymentData): Promise<PaymentVerificationResult>`**

  - Updates user subscription tier to "paid" directly
  - Also updates tenant subscription tier if tenantId is available
  - Stores payment details for audit trail
  - Notifies external payment API of the update

- **`verifyAndUpdatePaymentTiers(payments: PaymentData[]): Promise<PaymentVerificationResult[]>`**
  - Processes a list of payments
  - Only updates tiers for successful payments
  - Returns detailed results for each payment

### 2. Enhanced Fetch Payments Route (`/app/api/fetch-payments/route.ts`)

The fetch payments endpoint now includes automatic payment verification:

- When a GET request is made, it automatically verifies all received payments
- Only successful payments trigger tier updates
- Failed or incomplete payments are logged but don't affect user tiers

### 3. Test Endpoint (`/app/api/test-payment-verification/route.ts`)

A testing endpoint for verifying the payment verification logic:

- `GET /api/test-payment-verification` - Returns sample payment data
- `POST /api/test-payment-verification` - Processes payment verification with provided data

## Payment Success Criteria

A payment is considered successful only if ALL of the following criteria are met:

1. **Status Check**: Payment status must be one of:

   - `"succeeded"`
   - `"completed"`
   - `"paid"`
   - `"success"`

2. **Confirmation Check**: Payment must be confirmed:

   - `payment.confirmed === true` OR
   - `payment.paid === true` OR
   - `payment.confirmed === undefined` (optional)

3. **Amount Validation**: Payment must have a valid amount:

   - `payment.amount > 0`

4. **No Refunds**: Payment must not be refunded:

   - `payment.refunded !== true`
   - `payment.status !== "refunded"`

5. **Not Already Processed**: Payment must not have been previously processed:
   - `payment.tierUpdated !== true`

## Tier Restrictions

The system enforces that tiers can only be **"paid"** or **"free"**:

- ✅ **"paid"** - For successful payments
- ✅ **"free"** - Default tier for all other cases
- ❌ **"base"**, **"basic"**, **"pro"**, etc. - Automatically converted to "free"

The `normalizeTier()` function ensures all tier values are properly normalized.

## Database Updates

When a payment is verified as successful, the following updates occur:

### Tenant Level Updates

```typescript
// Updates /tenants/{tenantId}/payments/subscriptions
{
  tier: "paid",
  paymentId: payment.id,
  paymentAmount: payment.amount,
  paymentCurrency: payment.currency,
  paymentMethod: payment.paymentMethod || "stripe",
  paymentDate: payment.created || payment.timestamp,
  updatedAt: FieldValue.serverTimestamp()
}
```

### User Level Updates

The specific user's subscription tier is updated directly:

```typescript
// Updates /users/{userId}/payments/subscriptions
{
  tier: "paid",
  paymentId: payment.id,
  paymentAmount: payment.amount,
  paymentCurrency: payment.currency,
  paymentMethod: payment.paymentMethod || "stripe",
  paymentDate: payment.created || payment.timestamp,
  updatedAt: FieldValue.serverTimestamp()
}
```

## External API Integration

After successfully updating tiers, the system notifies the external payment API:

```typescript
POST https://production-api-v3-20250508.onrender.com/api/v2/internal/update-payment-status/
{
  tenantId,
  paymentStatus: "paid",
  paymentId: payment.id,
  amount: payment.amount,
  currency: payment.currency,
  paymentMethod: payment.paymentMethod || "stripe",
  tierUpdated: true,
  timestamp: new Date().toISOString()
}
```

## Usage Examples

### 1. Automatic Verification (via fetch-payments)

```typescript
// This happens automatically when calling GET /api/fetch-payments
const response = await fetch("/api/fetch-payments", {
  headers: {
    Authorization: "Bearer your-token",
  },
});
// Payment verification happens automatically in the background
```

### 2. Manual Verification

```typescript
import {
  verifyAndUpdatePaymentTiers,
  PaymentData,
} from "@/app/api/handlers/paymentVerification";

const payments: PaymentData[] = [
  {
    id: "payment_123",
    status: "succeeded",
    amount: 2900,
    currency: "usd",
    userId: "user_456",
    tenantId: "tenant_456",
    confirmed: true,
    paid: true,
    tierUpdated: false,
  },
];

const results = await verifyAndUpdatePaymentTiers(payments);
console.log(results);
```

### 3. Testing

```typescript
// Get sample payment data
const sampleData = await fetch("/api/test-payment-verification");
const { payments } = await sampleData.json();

// Test verification
const testResults = await fetch("/api/test-payment-verification", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ payments }),
});
```

### 4. Debugging Payment Data

```typescript
// Debug payment data to see why verification failed
const debugResults = await fetch("/api/debug-payment-data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ payments }),
});
```

### 5. Cleaning Up Invalid Tiers

```typescript
// Clean up existing invalid tier values
const cleanupResults = await fetch("/api/cleanup-tiers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: "user123",
    tenantId: "tenant456",
  }),
});
```

## Security Features

1. **Multiple Verification Criteria**: Payments must pass multiple checks before being considered successful
2. **Audit Trail**: All payment details are stored for verification and debugging
3. **Idempotency**: Payments are only processed once (checked via `tierUpdated` flag)
4. **Error Handling**: Failed verifications don't affect successful ones
5. **External API Notification**: Ensures external systems are aware of tier updates

## Monitoring and Logging

The system provides comprehensive logging:

- Payment verification attempts and results
- Tier update successes and failures
- External API notification status
- Detailed error messages for debugging

## Environment Variables

Required environment variables:

```bash
PAYMENTS_API_TOKEN=your_external_api_token
```

## Error Handling

The system gracefully handles various error scenarios:

- Missing tenant IDs
- Database connection issues
- External API failures
- Invalid payment data
- Duplicate payment processing

All errors are logged and don't prevent other payments from being processed.
