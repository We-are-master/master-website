#!/usr/bin/env node
/**
 * Create Stripe webhook (if needed) and apply STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET
 * to Supabase edge functions (self-hosted via SSH or Supabase CLI).
 *
 * Loads env from master-website/.env + ../master-os/.env(.local) — website wins for Stripe.
 *
 * Usage: npm run setup:supabase-stripe-secrets
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { loadIntegrationEnv } from './load-integration-env.mjs'

loadIntegrationEnv()

const stripeKey = (process.env.STRIPE_SECRET_KEY || '').trim()
const supabaseUrl = (
  process.env.SUPABASE_WEBHOOK_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ''
).replace(/\/$/, '')
const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim()
const sshHost = (process.env.SUPABASE_SSH_HOST || '').trim()
const dockerDir = (process.env.SUPABASE_DOCKER_DIR || '/root/supabase-project').trim()

if (!stripeKey || !stripeKey.startsWith('sk_')) {
  console.error('Missing STRIPE_SECRET_KEY (sk_test_ or sk_live_) in .env')
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
    headers: { Authorization: `Bearer ${stripeKey}`, ...(opts.headers || {}) },
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

async function resolveWebhookSecret() {
  if (webhookSecret.startsWith('whsec_')) {
    console.log('Using STRIPE_WEBHOOK_SECRET from env')
    return webhookSecret
  }

  console.log(`Stripe webhook target: ${webhookUrl}\n`)
  const list = await stripe('/webhook_endpoints?limit=100')
  const existing = list.data.find((w) => w.url === webhookUrl)

  if (existing) {
    console.log(`Existing webhook: ${existing.id} (${existing.status})`)
    console.log('Signing secret only shown at creation — set STRIPE_WEBHOOK_SECRET in .env if missing.')
    if (webhookSecret) return webhookSecret
    console.error('\nAdd STRIPE_WEBHOOK_SECRET=whsec_... to .env (Stripe Dashboard → Webhooks → Reveal secret)')
    process.exit(1)
  }

  const created = await stripe('/webhook_endpoints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ url: webhookUrl, enabled_events: events }),
  })
  console.log(`Created webhook: ${created.id}`)
  console.log(`STRIPE_WEBHOOK_SECRET=${created.secret}`)
  return created.secret
}

function updateEnvFile(secret) {
  const envPath = resolve('.env')
  if (!existsSync(envPath)) return
  let content = readFileSync(envPath, 'utf8')
  if (/^STRIPE_WEBHOOK_SECRET=/m.test(content)) {
    content = content.replace(/^STRIPE_WEBHOOK_SECRET=.*/m, `STRIPE_WEBHOOK_SECRET=${secret}`)
  } else {
    content += `\nSTRIPE_WEBHOOK_SECRET=${secret}\n`
  }
  if (!/^STRIPE_SECRET_KEY=/m.test(content)) {
    content += `STRIPE_SECRET_KEY=${stripeKey}\n`
  }
  writeFileSync(envPath, content)
  console.log('Updated .env with STRIPE_WEBHOOK_SECRET')
}

function writeSecretsLocal(secret) {
  const p = resolve('supabase/secrets.local.env')
  const entries = [
    ['STRIPE_SECRET_KEY', stripeKey],
    ['STRIPE_WEBHOOK_SECRET', secret],
    ['STRIPE_GROWTH_PRICE_ID', process.env.STRIPE_GROWTH_PRICE_ID],
    ['RESEND_API_KEY', process.env.RESEND_API_KEY],
    ['GROWTH_NOTIFY_EMAIL', process.env.GROWTH_NOTIFY_EMAIL || 'victor@getfixfy.com'],
    ['GOOGLE_SERVICE_ACCOUNT_JSON', process.env.GOOGLE_SERVICE_ACCOUNT_JSON],
    ['GROWTH_CALENDAR_ID', process.env.GROWTH_CALENDAR_ID],
  ]
  const lines = entries.filter(([, v]) => v).map(([k, v]) => `${k}=${v}`)
  writeFileSync(p, `${lines.join('\n')}\n`)
  console.log(`Wrote ${p} (${lines.length} secrets)`)
}

function applyViaSsh(secret) {
  if (!sshHost) return false

  console.log(`\nApplying via SSH → ${sshHost} (${dockerDir})`)
  const remoteScript = `#!/bin/bash
set -e
DIR="${dockerDir}"
for f in "$DIR/.env" "$DIR/docker/.env"; do
  [ -f "$f" ] || continue
  for kv in STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET; do
    val=""
    [ "$kv" = "STRIPE_SECRET_KEY" ] && val='${stripeKey.replace(/'/g, "'\\''")}'
    [ "$kv" = "STRIPE_WEBHOOK_SECRET" ] && val='${secret.replace(/'/g, "'\\''")}'
    if grep -q "^$kv=" "$f"; then
      sed -i "s|^$kv=.*|$kv=$val|" "$f"
    else
      echo "$kv=$val" >> "$f"
    fi
  done
done
docker ps --format '{{.Names}}' | grep -i edge | head -1 | xargs -r docker restart
echo "Secrets updated and edge container restarted"
`
  const local = '/tmp/apply-growth-stripe-secrets.sh'
  writeFileSync(local, remoteScript)
  const scp = spawnSync('scp', [local, `${sshHost}:/tmp/apply-growth-stripe-secrets.sh`], { stdio: 'inherit' })
  if (scp.status !== 0) return false
  const ssh = spawnSync('ssh', [sshHost, 'bash /tmp/apply-growth-stripe-secrets.sh'], { stdio: 'inherit' })
  return ssh.status === 0
}

function applyViaSupabaseCli(secret) {
  const linked = existsSync(resolve('supabase/.temp/project-ref'))
  if (!linked) return false

  console.log('\nApplying via supabase secrets set...')
  for (const [name, value] of [
    ['STRIPE_SECRET_KEY', stripeKey],
    ['STRIPE_WEBHOOK_SECRET', secret],
  ]) {
    const r = spawnSync('supabase', ['secrets', 'set', `${name}=${value}`], { stdio: 'inherit' })
    if (r.status !== 0) return false
  }
  return true
}

async function main() {
  const mode = stripeKey.startsWith('sk_live_') ? 'LIVE' : 'TEST'
  console.log(`Stripe ${mode} — Supabase Stripe secrets setup\n`)

  const secret = await resolveWebhookSecret()
  updateEnvFile(secret)
  writeSecretsLocal(secret)

  if (applyViaSsh(secret)) {
    console.log('\nDone (SSH). Redeploy functions if needed: npm run deploy:growth')
    return
  }
  if (applyViaSupabaseCli(secret)) {
    console.log('\nDone (Supabase CLI). Deploy: npm run deploy:growth')
    return
  }

  console.log('\n--- Manual step: set on Supabase edge runtime ---')
  console.log('STRIPE_SECRET_KEY=<from .env>')
  console.log('STRIPE_WEBHOOK_SECRET=<from .env>')
  console.log('\nOptions:')
  console.log('  1. SSH: export SUPABASE_SSH_HOST=root@<host> && npm run setup:supabase-stripe-secrets')
  console.log('  2. Supabase Cloud: supabase link --project-ref <ref> && npm run setup:secrets:apply')
  console.log('  3. Railway: set variables on the edge-functions service, then redeploy')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
