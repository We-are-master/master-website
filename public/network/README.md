# Fixfy Network: setup

## URLs

- Landing: `/network` (React page `src/b2c/pages/PartnersPage.jsx`; redirect from `/partners`)
- **Partner signup:** `/network/start` → redirects to **`https://partners.getfixfy.com/get-started`**

## Partner money model (6 October 2026)

- Joining is free. Fixfy has **no paid plans, subscriptions or trials** for partners.
- Partners see what they will receive before they accept each job.
- Cancellation charges and call-outs on customer bookings go to the partner in full.
- Payouts every two weeks by bank transfer, with a statement for every job.

## Retired: paid funnel

The old paid/token funnel (`?pay=1`, `?access=`, `?invite=`, £99/mo and £499/yr plans) is retired.
`start.html` and `start-legacy.html` both forward to the Trade Portal, and `funnel.js` / `network-checkout.js`
were removed. The notes below describe the old Supabase/Stripe setup and are kept only for reference.

## Frontend env (Vite / Vercel)

Same as Growth. **Full guide:** [`GROWTH-SETUP.md`](../../GROWTH-SETUP.md) (repo root).

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`

`network-config.js` is generated at build/dev (also sets `window.NETWORK_CONFIG`).

## Supabase secrets (Edge Functions)

| Secret | Purpose |
|--------|---------|
| `STRIPE_SECRET_KEY` | Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature |
| `STRIPE_NETWORK_MONTHLY_PRICE_ID` | £99/mo recurring price |
| `STRIPE_NETWORK_ANNUAL_PRICE_ID` | £499/yr recurring price |
| `NETWORK_ACCESS_TOKENS` | Comma-separated invite tokens for OS partner links (skip payment) |

Create both prices in Stripe Dashboard (GBP, recurring). Payment is charged immediately on checkout (no trial).

Partner invite links from Fixfy Pro:

```
/network/start?access=YOUR_TOKEN&plan=annual
```

Tokens must match `NETWORK_ACCESS_TOKENS`. Payment step is skipped; user goes straight to Fixfy Pro after details.

## Database

Run migrations:

- `supabase/migrations/20260622120000_network_signups.sql`
- `supabase/migrations/20260623120000_network_signups_payment_intent.sql`
- `supabase/migrations/20260623130000_network_signups_access.sql`

## Deploy functions

```bash
npm run deploy:network
# or all integrations: npm run deploy:integrations
```

See [`GROWTH-SETUP.md`](../../GROWTH-SETUP.md) for Stripe webhook and secrets.

## Stripe webhook events

Ensure `stripe-webhook` receives:

- `payment_intent.succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`

## Post-checkout / token redirect

After token access (`?access=`) or legacy paid checkout (`?pay=1`), users are sent to:

```
https://partners.getfixfy.com/get-started?name=...&email=...&phone=...&business=...&trades=...
```

Every path to **`/network/start`** redirects straight to the Trade Portal onboarding, with or without a query.

For local dev, set `VITE_PARTNER_PORTAL_GET_STARTED_URL=http://localhost:3001/get-started` in `.env`.

## Local test

1. `npm run dev`
2. Open `http://localhost:5173/network/start.html`: it forwards to the Trade Portal `get-started` page.
