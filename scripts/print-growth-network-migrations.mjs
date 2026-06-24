#!/usr/bin/env node
/**
 * Print combined SQL for Growth + Network migrations (for Supabase SQL editor).
 * Or apply via CLI: supabase db push (after supabase link)
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

const dir = resolve('supabase/migrations')
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.sql'))
  .filter((f) => f.includes('growth_bookings') || f.includes('network_signups'))
  .sort()

if (!files.length) {
  console.error('No growth/network migration files found.')
  process.exit(1)
}

const parts = files.map((f) => {
  const sql = readFileSync(join(dir, f), 'utf8')
  return `-- ========== ${f} ==========\n${sql.trim()}\n`
})

const combined = parts.join('\n')

if (process.argv.includes('--write')) {
  const out = resolve('supabase/migrations/_combined_growth_network.sql')
  writeFileSync(out, combined, 'utf8')
  console.log(`Wrote ${out}`)
} else {
  console.log(combined)
  console.log('\n-- Apply: paste into Supabase SQL Editor, or run: supabase link && supabase db push')
}
