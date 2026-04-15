# Stripe Setup — GSR-DOC-207

Manual steps in the Stripe Dashboard (test mode until launch). Run these once per environment (test, then live at launch).

## 1. Create the Membership Product

Stripe Dashboard → **Products** → **Add product**

- Name: `Grey Sky Annual Membership`
- Description: `$100/year — includes 1,000 Sky Coins on each renewal.`
- Pricing model: **Recurring**
- Price: `$100.00 USD`
- Billing period: **Yearly**
- Save the product, then copy the generated **Price ID** (starts with `price_`).

Set the price id in env:

```
STRIPE_MEMBERSHIP_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
```

## 2. Configure the Customer Portal

Stripe Dashboard → **Settings → Billing → Customer portal**

Enable:
- Cancel subscription (immediately or at period end — recommend "at period end")
- Update payment method
- Update billing details (email, address, tax id)
- View invoice history

Save settings.

## 3. Create the Webhook Endpoint

Stripe Dashboard → **Developers → Webhooks → Add endpoint**

- Endpoint URL: `https://greysky.dev/api/stripe/webhook`
  - For local development with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Events to send:
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Save, then reveal the **Signing secret** (starts with `whsec_`) and set it in env:

```
STRIPE_WEBHOOK_SECRET=<your-webhook-signing-secret>
```

## 4. Verify Test-Mode Keys

From **Developers → API keys**, set:

```
STRIPE_SECRET_KEY=<your-stripe-secret-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
```

## 5. End-to-End Test

Use Stripe's test cards:
- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0027 6000 3184`
- Declined: `4000 0000 0000 0002`

Verify after a successful membership checkout:
- `users.membership_status` is `active`
- `users.membership_expires_at` is one year out
- A `coin_transactions` row of type `membership_grant` for 1,000 coins exists
- The `stripe_events` table has the event id recorded
- Replaying the same webhook event returns `duplicate: true` (no double-credit)

## 6. Going Live

When ready to flip to live mode:
- Re-run steps 1–4 in **live mode** (separate keys, products, webhook endpoint)
- Keep test keys for staging
- Coordinate with Roy before changing the production env vars
