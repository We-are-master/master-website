# Fixfy Growth — setup

## URLs

- Marketing site: `/growth` (static files in this folder)
- Funnel: `/growth/start.html`

## Frontend env (Vite / Vercel)

Set in `.env` or Vercel project settings. **Full guide:** [`GROWTH-SETUP.md`](../../GROWTH-SETUP.md) (repo root).

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`

`growth-config.js` is generated at build/dev from these values.

## Supabase secrets (Edge Functions)

| Secret | Purpose |
|--------|---------|
| `STRIPE_SECRET_KEY` | Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature |
| `STRIPE_GROWTH_PRICE_ID` | Stripe Price ID for £379 one-off (required; amount from Stripe) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Full JSON key for Calendar API service account |
| `GROWTH_CALENDAR_ID` | Your Google Calendar ID (share calendar with SA email) |
| `GROWTH_NOTIFY_EMAIL` | Internal notifications (default: `victor@getfixfy.com`) |
| `RESEND_API_KEY` | Transactional email |

## Google Calendar

1. Create a service account in Google Cloud with Calendar API enabled.
2. Download JSON key → set `GOOGLE_SERVICE_ACCOUNT_JSON` in Supabase.
3. Share your onboarding calendar with the service account email (Make changes to events).
4. Set `GROWTH_CALENDAR_ID` to that calendar's ID.

## Database

Run migration: `supabase/migrations/20260619120000_growth_bookings.sql`

## Deploy functions

```bash
npm run deploy:growth
# or all integrations: npm run deploy:integrations
```

See [`GROWTH-SETUP.md`](../../GROWTH-SETUP.md) for Stripe, Calendar, and secrets.

## Stripe webhook

Point Stripe webhook to `stripe-webhook` edge function. Events: `payment_intent.succeeded` (and existing events you already use).

## Local test

1. `npm run dev`
2. Open `http://localhost:3000/growth/start.html`
3. Complete funnel with Stripe test card `4242 4242 4242 4242`
