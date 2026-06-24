#!/usr/bin/env node
/** Print Supabase secrets checklist for Growth + Network + Calendar integration. */

const secrets = [
  ['STRIPE_SECRET_KEY', 'Stripe API secret (sk_test_ or sk_live_)'],
  ['STRIPE_WEBHOOK_SECRET', 'From Stripe webhook endpoint (whsec_...)'],
  ['STRIPE_GROWTH_PRICE_ID', '£379 one-off — run: npm run setup:stripe'],
  ['STRIPE_NETWORK_MONTHLY_PRICE_ID', '£99/mo — run: npm run setup:stripe'],
  ['STRIPE_NETWORK_ANNUAL_PRICE_ID', '£499/yr — run: npm run setup:stripe'],
  ['GOOGLE_SERVICE_ACCOUNT_JSON', 'Full service account JSON (one line)'],
  ['GROWTH_CALENDAR_ID', 'Google Calendar ID shared with service account'],
  ['GROWTH_NOTIFY_EMAIL', 'Internal attendee email (e.g. victor@getfixfy.com)'],
  ['RESEND_API_KEY', 'Transactional email for Growth confirmations'],
  ['NETWORK_ACCESS_TOKENS', 'Optional — comma-separated invite tokens'],
]

console.log('Supabase Edge Function secrets\n' + '='.repeat(60))
console.log('Set via Dashboard or: supabase secrets set NAME=value\n')
for (const [name, desc] of secrets) {
  console.log(`${name}`)
  console.log(`  ${desc}\n`)
}
console.log('Webhook URL: https://<SUPABASE_URL>/functions/v1/stripe-webhook')
console.log('See GROWTH-SETUP.md for full steps.')
