// Supabase Edge Function: book-meeting
// Main-site "Get in touch → Schedule a meeting" → creates a Google Calendar intro call
// (with Meet link) on the same calendar/service account as the Growth onboarding flow.
// Public endpoint (anon key), modeled on submit-contact-enquiry. No payment, no booking row.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import {
  validateRequest,
  logSecurityEvent,
  getCorsHeaders,
  validateEmail,
  sanitizeString,
} from '../_shared/security.ts'
import { createMeetingEvent, isSlotAvailable } from '../_shared/google-calendar.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  const validation = await validateRequest(req, { requireBody: true, rateLimitType: 'api' })
  if (!validation.valid) {
    logSecurityEvent('book_meeting_validation_failed', { error: validation.error, ip: validation.clientIP }, 'high')
    return new Response(JSON.stringify({ error: validation.error }), {
      status: validation.status || 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const headers = { ...validation.headers, 'Content-Type': 'application/json' }
  const body = (validation.body ?? {}) as Record<string, unknown>

  // Honeypot — bots fill hidden fields; humans leave empty.
  const honeypot = body.website != null ? String(body.website).trim() : ''
  if (honeypot) {
    logSecurityEvent('book_meeting_honeypot', { ip: validation.clientIP }, 'medium')
    return new Response(JSON.stringify({ success: true }), { status: 200, headers })
  }

  const nameRaw = body.name
  const emailRaw = body.email
  const slotRaw = body.slotStart

  if (!nameRaw || typeof nameRaw !== 'string' || !nameRaw.trim()) {
    return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400, headers })
  }
  if (!emailRaw || typeof emailRaw !== 'string') {
    return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400, headers })
  }
  const emailValidation = validateEmail(emailRaw)
  if (!emailValidation.valid || !emailValidation.sanitized) {
    return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400, headers })
  }
  if (!slotRaw || typeof slotRaw !== 'string' || Number.isNaN(Date.parse(slotRaw))) {
    return new Response(JSON.stringify({ error: 'Pick a valid time slot' }), { status: 400, headers })
  }
  const slotStart = new Date(slotRaw).toISOString()
  if (new Date(slotStart).getTime() < Date.now()) {
    return new Response(JSON.stringify({ error: 'That time is in the past — pick another slot' }), { status: 400, headers })
  }

  const name = sanitizeString(nameRaw.trim(), 120)
  const company = body.company != null ? sanitizeString(String(body.company), 200) : ''
  const phone = body.phone != null ? sanitizeString(String(body.phone), 30) : ''
  const industry = body.industry != null ? sanitizeString(String(body.industry), 200) : ''
  const message = body.message != null ? sanitizeString(String(body.message), 5000) : ''

  try {
    const available = await isSlotAvailable(slotStart)
    if (!available) {
      return new Response(JSON.stringify({ error: 'That slot was just taken — pick another time' }), { status: 409, headers })
    }

    const notifyEmail = Deno.env.get('GROWTH_NOTIFY_EMAIL') || 'victor@getfixfy.com'
    const event = await createMeetingEvent({
      name,
      email: emailValidation.sanitized,
      phone: phone || undefined,
      company: company || undefined,
      industry: industry || undefined,
      message: message || undefined,
      slotStart,
      notifyEmail,
    })

    logSecurityEvent('book_meeting_created', { email: emailValidation.sanitized, name, ip: validation.clientIP }, 'low')
    return new Response(
      JSON.stringify({ success: true, eventId: event.eventId, htmlLink: event.htmlLink, slotStart }),
      { status: 200, headers },
    )
  } catch (err) {
    console.error('[book-meeting]', err)
    return new Response(JSON.stringify({ error: 'Could not book the meeting. Try another time or send a message.' }), { status: 500, headers })
  }
})
