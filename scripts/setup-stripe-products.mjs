#!/usr/bin/env node
/**
 * Create Stripe test products/prices for Growth + Network funnels.
 * Requires STRIPE_SECRET_KEY in env (or .env via dotenv — loaded manually from .env if present).
 *
 * Usage: STRIPE_SECRET_KEY=sk_test_... npm run setup:stripe
 * Output: price IDs to paste into Supabase secrets.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile() {
  const p = resolve(process.cwd(), '.env')
  if (!existsSync(p)) return
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    const k = t.slice(0, i).trim()
    const v = t.slice(i + 1).trim()
    if (!process.env[k]) process.env[k] = v
  }
}

loadEnvFile()

const key = (process.env.STRIPE_SECRET_KEY || '').trim()
if (!key) {
  console.error('Missing STRIPE_SECRET_KEY. Set it in .env or pass on the command line.')
  process.exit(1)
}

const PRODUCTS = [
  {
    secret: 'STRIPE_GROWTH_PRICE_ID',
    name: 'Fixfy Growth',
    description: 'Growth funnel — £379 one-off website + booking + CRM',
    amount: 37900,
    interval: null,
  },
  {
    secret: 'STRIPE_NETWORK_MONTHLY_PRICE_ID',
    name: 'Fixfy Network Monthly',
    description: 'Network partner — £99/mo',
    amount: 9900,
    interval: 'month',
  },
  {
    secret: 'STRIPE_NETWORK_ANNUAL_PRICE_ID',
    name: 'Fixfy Network Annual',
    description: 'Network partner — £499/yr',
    amount: 49900,
    interval: 'year',
  },
]

async function stripe(path, opts = {}) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(opts.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `Stripe ${path} failed`)
  return data
}

function formBody(obj) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v != null) p.set(k, String(v))
  }
  return p.toString()
}

async function findOrCreatePrice(spec) {
  const products = await stripe(`/products?active=true&limit=100`)
  let product = products.data.find((p) => p.name === spec.name)
  if (!product) {
    product = await stripe('/products', {
      method: 'POST',
      body: formBody({ name: spec.name, description: spec.description }),
    })
    console.log(`Created product: ${product.name} (${product.id})`)
  } else {
    console.log(`Found product: ${product.name} (${product.id})`)
  }

  const prices = await stripe(`/prices?product=${product.id}&active=true&limit=100`)
  const match = prices.data.find((pr) => {
    if (pr.currency !== 'gbp' || pr.unit_amount !== spec.amount) return false
    if (spec.interval) return pr.recurring?.interval === spec.interval
    return !pr.recurring
  })
  if (match) {
    console.log(`  Using existing price: ${match.id}`)
    return { secret: spec.secret, priceId: match.id }
  }

  const body = {
    product: product.id,
    currency: 'gbp',
    unit_amount: spec.amount,
  }
  if (spec.interval) body['recurring[interval]'] = spec.interval

  const price = await stripe('/prices', {
    method: 'POST',
    body: formBody(body),
  })
  console.log(`  Created price: ${price.id}`)
  return { secret: spec.secret, priceId: price.id }
}

async function main() {
  const mode = key.startsWith('sk_live_') ? 'LIVE' : 'TEST'
  console.log(`Stripe mode: ${mode}\n`)

  const results = []
  for (const spec of PRODUCTS) {
    results.push(await findOrCreatePrice(spec))
  }

  console.log('\n--- Add these to Supabase Edge Function secrets ---\n')
  for (const { secret, priceId } of results) {
    console.log(`${secret}=${priceId}`)
  }
  console.log('\n--- Webhook (create in Stripe Dashboard) ---')
  console.log('URL: https://<SUPABASE_URL>/functions/v1/stripe-webhook')
  console.log('Events: payment_intent.succeeded, customer.subscription.created, customer.subscription.updated')
  console.log('Then set STRIPE_WEBHOOK_SECRET=whsec_...')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
