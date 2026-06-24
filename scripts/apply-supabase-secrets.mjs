#!/usr/bin/env node
/**
 * Print supabase secrets set commands from a local secrets file.
 *
 * Create supabase/secrets.local.env (gitignored) with one secret per line:
 *   STRIPE_SECRET_KEY=sk_test_...
 *   STRIPE_WEBHOOK_SECRET=whsec_...
 *
 * Then: npm run setup:secrets:apply
 *
 * Requires: supabase link (supabase link --project-ref <ref>)
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { loadIntegrationEnv } from './load-integration-env.mjs'

loadIntegrationEnv()

const secretsPath = resolve('supabase/secrets.local.env')

if (!existsSync(secretsPath)) {
  console.log('Generating secrets.local.env from integration env...')
  const gen = spawnSync('node', ['scripts/setup-supabase-stripe-secrets.mjs'], { stdio: 'inherit' })
  if (gen.status !== 0 || !existsSync(secretsPath)) {
    console.log(`Create ${secretsPath} with your secrets (see supabase/secrets.local.env.example)`)
    console.log('Then run: supabase link --project-ref <ref>')
    console.log('Then run: npm run setup:secrets:apply')
    process.exit(1)
  }
}

const lines = readFileSync(secretsPath, 'utf8').split('\n').filter((l) => {
  const t = l.trim()
  return t && !t.startsWith('#') && t.includes('=')
})

if (!lines.length) {
  console.error('No secrets in secrets.local.env')
  process.exit(1)
}

console.log(`Applying ${lines.length} secrets to linked Supabase project...\n`)

for (const line of lines) {
  const i = line.indexOf('=')
  const name = line.slice(0, i).trim()
  const value = line.slice(i + 1).trim()
  if (!name || !value) continue

  console.log(`Setting ${name}...`)
  const r = spawnSync('supabase', ['secrets', 'set', `${name}=${value}`], {
    stdio: 'inherit',
    shell: false,
  })
  if (r.status !== 0) {
    console.error(`Failed to set ${name}`)
    process.exit(r.status || 1)
  }
}

console.log('\nDone. Deploy functions: npm run deploy:integrations')
