/**

* PHASE 6: PAYMENT INTEGRATION - ENVIRONMENT SETUP GUIDE
*
* This document explains all environment variables needed for the payment system
 */

# Payment Integration Environment Variables

## Stripe Configuration

### Required for Production

```env
# Stripe API Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_PUBLIC_KEY=pk_live_your_public_key_here
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### For Testing/Development

```env
# Stripe Test Keys (use test keys from dashboard)
STRIPE_PUBLIC_KEY=pk_test_your_test_public_key
STRIPE_SECRET_KEY=sk_test_your_test_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret
```

## Application Configuration

```env
# Base URL for redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Dev
# OR
NEXT_PUBLIC_BASE_URL=https://nyasawave.com  # Production
```

## Stripe Setup Instructions

### 1. Create Stripe Account

- Go to <https://stripe.com>
* Sign up and create a new account
* Go to Dashboard → Developers → API keys

### 2. Get API Keys

- **Public Key (Publishable Key)**
  * Format: pk_test_... (test) or pk_live_... (production)
  * Used on frontend for Stripe Elements
  * Safe to expose in frontend code

* **Secret Key**
  * Format: sk_test_... (test) or sk_live_... (production)
  * KEEP PRIVATE - only use on backend
  * Add to .env.local only

### 3. Set Up Webhook

Stripe needs to notify your app about payment completion:

1. Go to Dashboard → Developers → Webhooks
2. Click "Add an endpoint"
3. Endpoint URL: `https://yourdomain.com/api/payments/webhook`
4. Select events:
   * checkout.session.completed
   * customer.subscription.updated
   * customer.subscription.deleted
   * charge.refunded
5. Copy the "Signing secret" (whsec_...)
6. Add to .env.local as STRIPE_WEBHOOK_SECRET

### 4. Create Products and Prices

#### Premium Monthly Subscription

1. Dashboard → Products
2. Click "Create product"
3. Name: "Premium Monthly"
4. Pricing: $9.99/month
5. Get the Price ID (price_...)

#### Premium Annual Subscription

1. Create another product
2. Name: "Premium Annual"
3. Pricing: $99.99/year
4. Get the Price ID

(Note: Our code uses hardcoded prices. For advanced setup, retrieve these from Stripe API)

## .env.local Template

```env
# Stripe Keys
STRIPE_PUBLIC_KEY=pk_test_51234567890...
STRIPE_SECRET_KEY=sk_test_51234567890...
STRIPE_WEBHOOK_SECRET=whsec_1234567890...

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# NextAuth (existing)
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

## Testing Stripe Integration Locally

### 1. Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
# Download from https://github.com/stripe/stripe-cli/releases

# Linux
# Download from https://github.com/stripe/stripe-cli/releases
```

### 2. Login to Stripe CLI

```bash
stripe login
# Follow the authentication flow
```

### 3. Forward Webhook Events

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
# You'll get a webhook secret to add to .env.local
```

### 4. Test with Stripe Test Cards

Use these card numbers in Stripe Elements:

```
Success Scenarios:
- Card: 4242 4242 4242 4242
- CVC: 424
- Expiry: 12/25

Authentication Required:
- Card: 4000 0025 0000 3155
- Requires 3D Secure confirmation

Declined:
- Card: 4000 0000 0000 0002

Express Checkout:
- Card: 5555 5555 5555 4444
- CVC: 222
- Expiry: 12/25
```

## Webhook Events Explained

### checkout.session.completed

Triggered when:
* User successfully completes checkout
* Payment is processed
* **Action**: Update user.premiumListener = true, set subscription dates

### customer.subscription.updated

Triggered when:
* Subscription renewed
* Subscription modified
* **Action**: Update premium expiration dates

### customer.subscription.deleted

Triggered when:
* User cancels subscription
* Subscription billing fails permanently
* **Action**: Set user.premiumListener = false

### charge.refunded

Triggered when:
* User requests refund
* Payment fails and is refunded
* **Action**: Handle refund logic (optional)

## Database Schema for Payments

When a user completes payment, the following is updated in `data/users.json`:

```typescript
{
  id: "user_id",
  premiumListener: true,  // Active subscription
  payment: {
    provider: "stripe",
    customerId: "cus_...",  // Stripe customer ID
    verified: true,
    stripeSubscriptionId: "sub_..."
  },
  subscriptions: {
    premiumListener: {
      active: true,
      plan: "premium",
      expiresAt: "2024-02-15T10:30:00Z",
      stripeSubscriptionId: "sub_..."
    }
  }
}
```

## Endpoints Created

### POST /api/payments/checkout

Creates a Stripe checkout session

**Request:**

```json
{
  "plan": "monthly" | "annual",
  "type": "subscription" | "tournament" | "marketplace"
}
```

**Response:**

```json
{
  "success": true,
  "sessionId": "cs_...",
  "redirectUrl": "https://checkout.stripe.com/pay/cs_..."
}
```

### GET /api/payments/verify?session_id={sessionId}

Verifies payment was completed

**Response:**

```json
{
  "success": true,
  "sessionId": "cs_...",
  "paymentStatus": "paid",
  "type": "subscription",
  "message": "Payment verified successfully"
}
```

### POST /api/payments/webhook

Receives Stripe webhook events (no auth required)

**Handles:**
* Subscription confirmations
* Subscription updates
* Subscription cancellations
* Refunds

## Testing the Payment Flow

### Step 1: Start Dev Server

```bash
npm run dev
```

### Step 2: Sign Up / Sign In

- Navigate to <http://localhost:3000/signin>
* Create account or sign in

### Step 3: Go to Subscribe Page

- Click "Subscribe" button or visit /subscribe
* Choose a plan (Monthly or Annual)

### Step 4: Complete Checkout

- Click "Proceed to Checkout"
* Enter test card: 4242 4242 4242 4242
* Fill in name and email
* Click "Complete Payment"

### Step 5: Verify Success

- You should see success page
* Check user's premium status in /me
* Download functionality should work

## Troubleshooting

### "No signingSecret provided"

- Add STRIPE_WEBHOOK_SECRET to .env.local
* Make sure it matches the webhook endpoint signing secret from Stripe dashboard

### "API key not valid"

- Check STRIPE_SECRET_KEY format (should start with sk_)
* Verify you're using the correct key (test vs live)
* Make sure key is in .env.local (not .env.example)

### Webhook not triggering

- Verify webhook URL is publicly accessible
* Run `stripe listen` to forward events locally
* Check webhook logs in Stripe dashboard

### Payment succeeds but premium status doesn't update

- Check console logs for errors
* Verify users.json file is writeable
* Check webhook events in Stripe dashboard

## Security Considerations

1. **Never expose secret keys**
   * Keep STRIPE_SECRET_KEY only in .env.local
   * Don't commit to git

2. **Verify webhook signatures**
   * Our webhook handler validates Stripe signatures
   * Prevents spoofed webhook events

3. **Use HTTPS in production**
   * Stripe requires HTTPS for live payments
   * Set up SSL certificate before going live

4. **Validate user authorization**
   * Verify user owns the subscription
   * Check user ID matches payment metadata

5. **Implement rate limiting**
   * Prevent checkout endpoint abuse
   * Add per-user checkout limits

## Next Steps After Payment Integration

1. **Test with real Stripe account**
   * Create production Stripe account
   * Switch to live keys

2. **Implement subscription management**
   * Cancel/pause subscriptions
   * Update payment methods
   * Download invoice history

3. **Add premium feature enforcement**
   * Lock downloads behind premium
   * Lock tournaments behind premium
   * Lock marketplace behind premium

4. **Set up payouts**
   * Configure Stripe Connect for artist payouts
   * Implement revenue sharing
   * Create payout dashboard

5. **Monitor and analytics**
   * Track conversion rates
   * Monitor churn
   * Analyze payment failures

## Support & Resources

* Stripe Documentation: <https://stripe.com/docs>
* Stripe API Reference: <https://stripe.com/docs/api>
* Stripe Test Data: <https://stripe.com/docs/testing>
* Stripe CLI: <https://stripe.com/docs/stripe-cli>
