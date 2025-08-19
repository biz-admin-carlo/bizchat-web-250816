# Payment API Scripts

This directory contains utility scripts for interacting with the external payment API.

## Available Scripts

### fetch-payments.js

This script fetches all payments from the external payment API.

```bash
# Set your API token
export PAYMENTS_API_TOKEN=your_api_token_here

# Run the script
node fetch-payments.js
```

### update-payment-status.js

This script updates the payment status for a specific tenant in the external payment API.

```bash
# Set your API token
export PAYMENTS_API_TOKEN=your_api_token_here

# Edit the script to set the correct tenantId and payment details
# Then run the script
node update-payment-status.js
```

## API Endpoints

- Fetch Payments: `https://production-api-v3-20250508.onrender.com/api/v2/internal/fetch-payments/`
- Update Payment Status: `https://production-api-v3-20250508.onrender.com/api/v2/internal/update-payment-status/`

## Authentication

All requests to the external payment API require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_API_TOKEN
```

The token should be set in your environment variables as `PAYMENTS_API_TOKEN`.