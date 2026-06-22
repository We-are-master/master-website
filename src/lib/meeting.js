/**
 * Main-site "Schedule a meeting" client helpers.
 * Reuses the Growth Google Calendar backend: GET growth-availability for open slots,
 * POST book-meeting to create the intro call. Both are gated on the Supabase edge
 * functions being deployed + configured (see GROWTH-SETUP.md).
 */

import { invokeSupabaseFunction, isSupabaseFunctionsConfigured } from './supabaseEdge'

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const SLOT_TIMES = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30']
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Client-side slot generator — next 5 weekdays (starting +2 days) × standard times.
 * Mirrors the Growth funnel fallback so the day/time picker always renders even when the
 * availability backend is unreachable. Times carry no precise iso (''), so a fallback
 * booking routes to an email request that we confirm manually.
 * @returns {Array<{ dow, num, mon, full, times: Array<{ time, iso }> }>}
 */
export function fallbackDays() {
  const out = []
  const d = new Date()
  d.setDate(d.getDate() + 2)
  const times = SLOT_TIMES.map((t) => ({ time: t, iso: '' }))
  let guard = 0
  while (out.length < 5 && guard < 14) {
    const wd = d.getDay()
    if (wd !== 0 && wd !== 6) {
      out.push({ dow: DOW[wd], num: d.getDate(), mon: MON[d.getMonth()], full: `${DOW[wd]}, ${d.getDate()} ${MON[d.getMonth()]}`, times })
    }
    d.setDate(d.getDate() + 1)
    guard++
  }
  return out
}

/**
 * Load available meeting slots.
 * @returns {Promise<{ ok: boolean, days?: Array, fallback?: boolean, error?: string }>}
 *   days: [{ dow, num, mon, full, times: [{ time, iso }] }]
 */
export async function loadMeetingSlots() {
  if (!isSupabaseFunctionsConfigured()) {
    return { ok: false, error: 'Service not configured' }
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/growth-availability`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return { ok: false, error: data.error || `Failed to load times (${res.status})` }
    }
    return { ok: true, days: data.days || [], fallback: Boolean(data.fallback) }
  } catch (error) {
    console.error('[meeting] loadMeetingSlots failed:', error)
    return { ok: false, error: error.message || 'Failed to load times' }
  }
}

/**
 * Book an intro call at the given slot.
 * @param {{ name:string, email:string, slotStart:string, phone?:string, company?:string, industry?:string, message?:string, website?:string }} payload
 * @returns {Promise<{ success: boolean, htmlLink?: string, error?: string }>}
 */
export async function bookMeeting(payload) {
  const { name, email, slotStart } = payload || {}
  if (!name || !String(name).trim()) return { success: false, error: 'Name is required' }
  if (!email || !String(email).trim()) return { success: false, error: 'Email is required' }
  if (!slotStart) return { success: false, error: 'Pick a time slot' }

  const body = {
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    slotStart,
  }
  for (const k of ['phone', 'company', 'industry', 'message', 'website']) {
    const v = payload[k]
    if (v != null && String(v).trim()) body[k] = String(v).trim()
  }

  const result = await invokeSupabaseFunction('book-meeting', body)
  if (!result.ok) return { success: false, error: result.error || 'Could not book the meeting' }
  return { success: true, ...result.data }
}
