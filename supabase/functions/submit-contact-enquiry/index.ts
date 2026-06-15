// Supabase Edge Function: submit-contact-enquiry
// Contact page form → internal email notification via send-email + Resend.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import {
  validateRequest,
  logSecurityEvent,
  getCorsHeaders,
  validateEmail,
  sanitizeString,
  validateSupabaseEnv,
} from '../_shared/security.ts'

const NOTIFY_TO = 'victor@getfixfy.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  const validation = await validateRequest(req, {
    requireBody: true,
    rateLimitType: 'api',
  })

  if (!validation.valid) {
    logSecurityEvent('contact_enquiry_validation_failed', {
      error: validation.error,
      ip: validation.clientIP,
    }, 'high')
    return new Response(JSON.stringify({ error: validation.error }), {
      status: validation.status || 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const body = (validation.body ?? {}) as Record<string, unknown>

  // Honeypot — bots fill hidden fields; humans leave empty.
  const honeypot = body.website != null ? String(body.website).trim() : ''
  if (honeypot) {
    logSecurityEvent('contact_enquiry_honeypot', { ip: validation.clientIP }, 'medium')
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const nameRaw = body.name
  const emailRaw = body.email

  if (!nameRaw || typeof nameRaw !== 'string' || !nameRaw.trim()) {
    return new Response(JSON.stringify({ error: 'Name is required' }), {
      status: 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

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

  const name = sanitizeString(nameRaw.trim(), 120)
  const company = body.company != null ? sanitizeString(String(body.company), 200) : ''
  const phone = body.phone != null ? sanitizeString(String(body.phone), 30) : ''
  const industry = body.industry != null ? sanitizeString(String(body.industry), 200) : ''
  const message = body.message != null ? sanitizeString(String(body.message), 5000) : ''

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)
  if (!envCheck.valid) {
    return new Response(JSON.stringify({ error: envCheck.error }), {
      status: 500,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const sendEmailUrl = `${supabaseUrl}/functions/v1/send-email`
  const submittedAt = new Date().toISOString()

  try {
    const emailRes = await fetch(sendEmailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        template: 'contact_enquiry_notification',
        to: NOTIFY_TO,
        data: {
          name,
          email: emailValidation.sanitized,
          company: company || undefined,
          phone: phone || undefined,
          industry: industry || undefined,
          message: message || undefined,
          source: 'contact_page',
          submitted_at: submittedAt,
          client_ip: validation.clientIP || undefined,
        },
      }),
    })
    if (!emailRes.ok) {
      const errText = await emailRes.text()
      console.warn('[submit-contact-enquiry] send-email failed:', emailRes.status, errText)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send notification' }),
        { status: 500, headers: { ...validation.headers, 'Content-Type': 'application/json' } },
      )
    }
  } catch (err) {
    console.warn('[submit-contact-enquiry] send-email error:', err)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to send notification' }),
      { status: 500, headers: { ...validation.headers, 'Content-Type': 'application/json' } },
    )
  }

  logSecurityEvent('contact_enquiry_sent', {
    email: emailValidation.sanitized,
    name,
    ip: validation.clientIP,
  }, 'low')

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...validation.headers, 'Content-Type': 'application/json' },
  })
})
