# PHASE 6: PAYMENT INTEGRATION - QUICK START

## What Was Built

✅ Complete Stripe payment system
✅ Subscription plan selection UI
✅ Secure checkout form
✅ Payment verification
✅ Webhook event handling
✅ Premium status management

---

## Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
cd nyasawave
pnpm install
# OR
npm install
```

### 2. Get Stripe Keys

1. Go to <https://dashboard.stripe.com/apikeys>
2. Copy Test Publishable Key (pk_test_...)
3. Copy Test Secret Key (sk_test_...)

### 3. Create .env.local

```env
STRIPE_PUBLIC_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_test_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Start Server

```bash
pnpm dev
```

### 5. Test Checkout

1. Go to <http://localhost:3000/signin>
2. Sign in: <trapkost2020@gmail.com> / password123
3. Go to /subscribe
4. Select plan and click "Proceed to Checkout"
5. Use card: 4242 4242 4242 4242
6. Complete payment

---

## Files Created

| File | Purpose |
|------|---------|
| `lib/stripe-service.ts` | Stripe API wrapper |
| `app/api/payments/checkout/route.ts` | Checkout endpoint |
| `app/api/payments/webhook/route.ts` | Webhook handler |
| `app/api/payments/verify/route.ts` | Payment verification |
| `app/components/SubscriptionPlans.tsx` | Plan selection UI |
| `app/components/CheckoutForm.tsx` | Payment form |
| `app/subscribe/page.tsx` | Subscription page |
| `PHASE_6_PAYMENT_SETUP.md` | Full setup guide |
| `PHASE_6_COMPLETION_REPORT.md` | Detailed report |

---

## API Endpoints

### Create Checkout

```
POST /api/payments/checkout
{
  "plan": "monthly" | "annual",
  "type": "subscription"
}
↓
{
  "success": true,
  "redirectUrl": "https://checkout.stripe.com/..."
}
```

### Verify Payment

```
GET /api/payments/verify?session_id=cs_...
↓
{
  "success": true,
  "paymentStatus": "paid"
}
```

### Webhook (Stripe → Your App)

```
POST /api/payments/webhook
↓ Handles events:
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted
- charge.refunded
```

---

## Database Updates

When payment succeeds, user in `users.json` gets:

```
premiumListener: true
payment.verified: true
subscriptions.premiumListener.active: true
subscriptions.premiumListener.expiresAt: [date]
```

---

## Test Card Numbers

| Scenario | Card | Result |
|----------|------|--------|
| Success | 4242 4242 4242 4242 | ✓ Payment succeeds |
| Auth | 4000 0025 0000 3155 | Requires 3D Secure |
| Declined | 4000 0000 0000 0002 | ✗ Payment fails |

**CVC**: Any 3-4 digits
**Expiry**: Any future date

---

## Troubleshooting

### "Module not found: stripe"

→ Run `pnpm install` to add Stripe packages

### "No API key"

→ Check STRIPE_SECRET_KEY in .env.local

### "Webhook not triggering"

→ Use `stripe listen` to forward events locally

### "Premium not updating"

→ Check /api/payments/webhook logs, verify users.json writable

---

## Full Documentation

See these files for complete info:

- `PHASE_6_PAYMENT_SETUP.md` - Detailed setup with Stripe account creation
- `PHASE_6_COMPLETION_REPORT.md` - Full architecture and testing guide
- `app/components/SubscriptionPlans.tsx` - Component code
- `lib/stripe-service.ts` - Service code

---

## What's Next

After verifying checkout works:

1. **Phase 7**: Add premium enforcement to downloads
2. **Phase 8**: Add premium enforcement to tournaments
3. **Phase 9**: Add premium enforcement to marketplace
4. **Phase 10+**: Subscription management, payouts, analytics

---

## Commands Reference

```bash
# Start development
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Listen for Stripe webhooks locally
stripe listen --forward-to localhost:3000/api/payments/webhook

# View Stripe events
stripe events list
```

---

## Key Components Used

### SubscriptionPlans

```tsx
<SubscriptionPlans 
  onPlanSelected={(planId) => console.log(planId)}
/>
```

### CheckoutForm

```tsx
<CheckoutForm 
  planId="monthly"
  onSuccess={() => redirect('/checkout/success')}
  onError={(err) => console.error(err)}
/>
```

### AccessGate (Phase 5, ready to use)

```tsx
<AccessGate 
  action="download" 
  resourceType="song"
  isTournament={false}
>
  <DownloadButton />
</AccessGate>
```

---

## Environment Variables Checklist

- [ ] STRIPE_PUBLIC_KEY (starts with pk_)
- [ ] STRIPE_SECRET_KEY (starts with sk_)
- [ ] STRIPE_WEBHOOK_SECRET (starts with whsec_)
- [ ] NEXT_PUBLIC_BASE_URL (your domain)
- [ ] NEXTAUTH_SECRET (existing)
- [ ] NEXTAUTH_URL (existing)

---

## Success Indicators

✅ Checkout button shows on /subscribe
✅ Can click "Proceed to Checkout"
✅ Redirects to Stripe checkout
✅ Can enter test card
✅ Payment succeeds
✅ Redirects to /checkout/success
✅ User email in Stripe dashboard shows customer
✅ user.premiumListener = true in /me
✅ Premium badge shows on profile

---

## Architecture at a Glance

```
User Interface (Next.js)
    ↓
SubscriptionPlans Component
    ↓
/api/payments/checkout
    ↓
Stripe API (Create Session)
    ↓
Stripe Checkout Page
    ↓
User Pays
    ↓
Stripe Webhook
    ↓
/api/payments/webhook
    ↓
Update users.json (premiumListener=true)
    ↓
Success Page
    ↓
/api/payments/verify (Optional verification)
    ↓
Session Updated
    ↓
Premium Features Unlocked
```

---

## Timeline from Start to Premium Feature Access

1. **User visits /subscribe** → See 2 plans (Monthly/Annual)
2. **Click "Proceed to Checkout"** → POST /api/payments/checkout
3. **Redirected to Stripe** → User enters card details
4. **Payment processed** → Stripe sends webhook event
5. **Webhook updates database** → user.premiumListener = true
6. **Redirect to /success** → Payment verification
7. **Session updated** → Frontend knows user is premium
8. **Premium features unlocked** → Downloads work, tournaments open, etc.

**Total time**: ~3-5 minutes

---

## Support

For issues:

1. Check PHASE_6_PAYMENT_SETUP.md troubleshooting section
2. Review Stripe dashboard for webhook events
3. Check browser console for client-side errors
4. Check terminal for server-side logs
5. Verify all environment variables are set

---

Generated: Phase 6 Complete
Ready for: Phase 7 Premium Enforcement
