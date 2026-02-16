// Supabase Edge Function: notify-booking-lead
// Called when user fills postcode + email on a booking page. Sends internal notification to hello@wearemaster.com.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  logSecurityEvent,
  getCorsHeaders,
  validateEmail,
  sanitizeString,
  validateSupabaseEnv,
} from '../_shared/security.ts'

const NOTIFY_TO = 'hello@wearemaster.com'
const UK_POSTCODE_REGEX = /[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}/i

function isValidUKPostcode(v: string): boolean {
  const trimmed = (v || '').trim().toUpperCase().replace(/\s+/g, ' ')
  return UK_POSTCODE_REGEX.test(trimmed) && trimmed.length >= 5
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  const validation = await validateRequest(req, {
    requireBody: true,
    rateLimitType: 'api',
  })

  if (!validation.valid) {
    logSecurityEvent('notify_booking_lead_validation_failed', {
      error: validation.error,
      ip: validation.clientIP,
    }, 'high')
    return new Response(JSON.stringify({ error: validation.error }), {
      status: validation.status || 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const body = (validation.body ?? {}) as Record<string, unknown>
  const emailRaw = body.email
  const postcodeRaw = body.postcode
  const serviceLabel = body.service != null ? sanitizeString(String(body.service), 200) : 'Booking'

  if (!emailRaw || typeof emailRaw !== 'string') {
    return new Response(JSON.stringify({ error: 'Email is required' }), {
      status: 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const emailValidation = validateEmail(emailRaw)
  if (!emailValidation.valid || !emailValidation.sanitized) {
    return new Response(JSON.stringify({ error: 'Invalid email address' }), {
      status: 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const postcode = postcodeRaw != null ? String(postcodeRaw).trim().toUpperCase().replace(/\s+/g, ' ') : ''
  if (!postcode || !isValidUKPostcode(postcode)) {
    return new Response(JSON.stringify({ error: 'Valid UK postcode is required' }), {
      status: 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)
  if (!envCheck.valid) {
    return new Response(JSON.stringify({ error: envCheck.error }), {
      status: 500,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

  // Send internal notification via send-email (lead_notification template)
  const sendEmailUrl = `${supabaseUrl}/functions/v1/send-email`
  try {
    const emailRes = await fetch(sendEmailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        template: 'lead_notification',
        to: NOTIFY_TO,
        data: {
          email: emailValidation.sanitized,
          postcode,
          service: serviceLabel,
          source: 'booking_quote',
        },
      }),
    })
    if (!emailRes.ok) {
      const errText = await emailRes.text()
      console.warn('[notify-booking-lead] send-email failed:', emailRes.status, errText)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send notification' }),
        { status: 500, headers: { ...validation.headers, 'Content-Type': 'application/json' } }
      )
    }
  } catch (err) {
    console.warn('[notify-booking-lead] send-email error:', err)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to send notification' }),
      { status: 500, headers: { ...validation.headers, 'Content-Type': 'application/json' } }
    )
  }

  logSecurityEvent('booking_lead_notification_sent', {
    email: emailValidation.sanitized,
    postcode,
    service: serviceLabel,
    ip: validation.clientIP,
  }, 'low')

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...validation.headers, 'Content-Type': 'application/json' },
  })
})
