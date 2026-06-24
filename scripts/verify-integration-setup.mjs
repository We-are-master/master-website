#!/usr/bin/env node
/**
 * Verify local + documented integration setup for Main / Growth / Network.
 * Does not call external APIs except optional Supabase health check.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile() {
  const p = resolve(process.cwd(), '.env')
  if (!existsSync(p)) return {}
  const out = {}
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return out
}

const env = { ...loadEnvFile(), ...process.env }
const checks = []

function check(name, ok, detail) {
  checks.push({ name, ok, detail })
}

const viteUrl = env.VITE_SUPABASE_URL || ''
const viteAnon = env.VITE_SUPABASE_ANON_KEY || ''
const vitePk = env.VITE_STRIPE_PUBLISHABLE_KEY || ''

check('VITE_SUPABASE_URL', Boolean(viteUrl && !viteUrl.includes('your_')),
  viteUrl || 'missing — set in .env')
check('VITE_SUPABASE_ANON_KEY', Boolean(viteAnon && !viteAnon.includes('your_')),
  viteAnon ? `${viteAnon.slice(0, 12)}…` : 'missing — Supabase Dashboard → API')
check('VITE_STRIPE_PUBLISHABLE_KEY', Boolean(vitePk && vitePk.startsWith('pk_')),
  vitePk ? `${vitePk.slice(0, 12)}…` : 'missing')

const growthCfg = resolve('public/growth/growth-config.js')
if (existsSync(growthCfg)) {
  const body = readFileSync(growthCfg, 'utf8')
  check('growth-config.js generated', body.includes('"supabaseUrl":"http') || body.includes(viteUrl.replace(/\/$/, '')),
    'Run npm run dev or npm run build to regenerate from .env')
}

const migrations = [
  'supabase/migrations/20260619120000_growth_bookings.sql',
  'supabase/migrations/20260622120000_network_signups.sql',
  'supabase/migrations/20260623120000_network_signups_payment_intent.sql',
  'supabase/migrations/20260623130000_network_signups_access.sql',
]
for (const m of migrations) {
  check(`migration file ${m.split('/').pop()}`, existsSync(resolve(m)), existsSync(resolve(m)) ? 'ok' : 'missing')
}

const functions = [
  'growth-availability', 'book-meeting', 'create-growth-checkout', 'create-network-checkout',
  'stripe-webhook', 'send-email', 'update-growth-quiz', 'redeem-network-access',
]
for (const f of functions) {
  check(`function ${f}`, existsSync(resolve(`supabase/functions/${f}/index.ts`)), 'source present')
}

const linked = existsSync(resolve('supabase/.temp/project-ref'))
check('supabase link', linked, linked ? readFileSync(resolve('supabase/.temp/project-ref'), 'utf8').trim() : 'run: supabase link --project-ref <ref>')

console.log('\nIntegration setup check\n' + '='.repeat(50))
let pass = 0
for (const c of checks) {
  const icon = c.ok ? '✓' : '✗'
  console.log(`${icon} ${c.name}`)
  if (c.detail) console.log(`    ${c.detail}`)
  if (c.ok) pass++
}
console.log('='.repeat(50))
console.log(`${pass}/${checks.length} checks passed\n`)
console.log('Supabase secrets (dashboard): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,')
console.log('  STRIPE_GROWTH_PRICE_ID, STRIPE_NETWORK_*_PRICE_ID,')
console.log('  GOOGLE_SERVICE_ACCOUNT_JSON, GROWTH_CALENDAR_ID, RESEND_API_KEY')
console.log('\nFull guide: GROWTH-SETUP.md')

process.exit(pass === checks.length ? 0 : 1)
