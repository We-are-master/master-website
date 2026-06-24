/**
 * Load env from master-os then master-website (later files override earlier).
 * Order: master-os .env → master-os .env.local → website .env → secrets.local.env
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const masterOs = resolve(root, '../master-os')

const SOURCES = [
  resolve(masterOs, '.env'),
  resolve(masterOs, '.env.local'),
  resolve(root, '.env'),
  resolve(root, 'supabase/secrets.local.env'),
]

function isPlaceholder(key, value) {
  if (!value) return true
  if (value.includes('YOUR_') || value.endsWith('...')) return true
  if (key === 'STRIPE_SECRET_KEY' && !value.startsWith('sk_')) return true
  if (key === 'STRIPE_WEBHOOK_SECRET' && !value.startsWith('whsec_')) return true
  return false
}

export function loadIntegrationEnv() {
  for (const path of SOURCES) {
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#') || !t.includes('=')) continue
      const i = t.indexOf('=')
      const k = t.slice(0, i).trim()
      let v = t.slice(i + 1).trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      if (isPlaceholder(k, v)) continue
      process.env[k] = v
    }
  }

  // Aliases from master-os naming
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY
  }
  if (!process.env.VITE_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.VITE_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')
  }
  if (!process.env.VITE_STRIPE_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  }
}
