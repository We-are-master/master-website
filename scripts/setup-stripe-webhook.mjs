#!/usr/bin/env node
/**
 * Create or list Stripe webhook endpoint for stripe-webhook edge function.
 * Requires STRIPE_SECRET_KEY and VITE_SUPABASE_URL (from .env).
 *
 * Usage: npm run setup:webhook
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
const supabaseUrl = (
  process.env.SUPABASE_WEBHOOK_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
).replace(/\/$/, '')

if (!key) {
  console.error('Missing STRIPE_SECRET_KEY in .env')
  process.exit(1)
}
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL in .env')
  process.exit(1)
}

const webhookUrl = `${supabaseUrl}/functions/v1/stripe-webhook`
const events = [
  'payment_intent.succeeded',
  'customer.subscription.created',
  'customer.subscription.updated',
]

async function stripe(path, opts = {}) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${key}`,
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
    if (Array.isArray(v)) v.forEach((item, i) => p.append(`${k}[${i}]`, item))
    else if (v != null) p.set(k, String(v))
  }
  return p.toString()
}

async function main() {
  const mode = key.startsWith('sk_live_') ? 'LIVE' : 'TEST'
  console.log(`Stripe ${mode} webhook setup\nTarget: ${webhookUrl}\n`)

  const list = await stripe('/webhook_endpoints?limit=100')
  const existing = list.data.find((w) => w.url === webhookUrl)

  if (existing) {
    console.log('Existing endpoint found:')
    console.log(`  ID: ${existing.id}`)
    console.log(`  Status: ${existing.status}`)
    console.log('\nSigning secret is only shown at creation time.')
    console.log('If you lost it: Stripe Dashboard → Webhooks → Reveal secret, or create a new endpoint.')
    return
  }

  const created = await stripe('/webhook_endpoints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ url: webhookUrl, enabled_events: events }),
  })

  console.log('Created webhook endpoint:')
  console.log(`  ID: ${created.id}`)
  console.log(`  Secret: ${created.secret}`)
  console.log('\n--- Add to Supabase secrets ---')
  console.log(`STRIPE_WEBHOOK_SECRET=${created.secret}`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
