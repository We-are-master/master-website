import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

let loaded = false

function loadEnvFile(path, override = false) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (!override && process.env[k]) continue
    if (v.includes('YOUR_') || v.endsWith('...')) continue
    process.env[k] = v
  }
}

export function loadLocalEnv() {
  if (loaded) return
  loaded = true
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  const masterOs = resolve(root, '../master-os')
  for (const p of [
    resolve(masterOs, '.env'),
    resolve(masterOs, '.env.local'),
    resolve(root, '.env'),
    resolve(root, 'supabase/secrets.local.env'),
  ]) {
    loadEnvFile(p, true)
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY
  }
}

export function growthServerEnv() {
  loadLocalEnv()
  const supabaseUrl = (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  ).replace(/\/$/, '')
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY ||
    ''
  return {
    supabaseUrl,
    serviceKey,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    growthPriceId: process.env.STRIPE_GROWTH_PRICE_ID || '',
    googleServiceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '',
    growthCalendarId: process.env.GROWTH_CALENDAR_ID || '',
  }
}
