#!/usr/bin/env node
/**
 * Validate Google Calendar credentials and print Supabase secret instructions.
 * Optional: set GOOGLE_SERVICE_ACCOUNT_JSON + GROWTH_CALENDAR_ID in .env or secrets.local.env for JSON validation.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    const k = t.slice(0, i).trim()
    const v = t.slice(i + 1).trim()
    if (!process.env[k]) process.env[k] = v
  }
}

loadEnvFile(resolve('.env'))
loadEnvFile(resolve('supabase/secrets.local.env'))

const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || ''
const calendarId = process.env.GROWTH_CALENDAR_ID || ''

console.log('Google Calendar setup\n' + '='.repeat(50))

console.log(`
1. Google Cloud → enable Google Calendar API
2. Create Service Account → download JSON key
3. Google Calendar → share with SA email ("Make changes to events")
4. Set Supabase secrets:
   GOOGLE_SERVICE_ACCOUNT_JSON=<full JSON, one line>
   GROWTH_CALENDAR_ID=<calendar id>
   GROWTH_NOTIFY_EMAIL=victor@getfixfy.com

Google Meet on invites requires Google Workspace on the target calendar.
`)

if (jsonRaw) {
  try {
    const sa = JSON.parse(jsonRaw)
    if (sa.client_email && sa.private_key) {
      console.log('✓ GOOGLE_SERVICE_ACCOUNT_JSON parses OK')
      console.log(`  client_email: ${sa.client_email}`)
      console.log('\nShare your calendar with this email, then set GROWTH_CALENDAR_ID in Supabase.')
    } else {
      console.log('✗ JSON missing client_email or private_key')
    }
  } catch {
    console.log('✗ GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON')
  }
}

if (calendarId) {
  console.log(`✓ GROWTH_CALENDAR_ID set: ${calendarId}`)
}

if (!jsonRaw) {
  console.log('Tip: paste JSON into supabase/secrets.local.env for local validation.')
}
