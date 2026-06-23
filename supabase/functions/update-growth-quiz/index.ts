import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  validateEmail,
  sanitizeString,
  getCorsHeaders,
  validateSupabaseEnv,
} from '../_shared/security.ts'

const ALLOWED_KEYS = new Set(['trade', 'source', 'website', 'goal'])

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  const validation = await validateRequest(req, {
    requireBody: true,
    rateLimitType: 'api',
    maxPayloadSize: 32 * 1024,
  })

  if (!validation.valid) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: validation.status || 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const headers = {
    ...validation.headers,
    'Content-Type': 'application/json',
  }

  try {
    const body = validation.body as Record<string, unknown>
    const bookingId = sanitizeString(String(body.bookingId || ''), 64)
    const answersRaw = (body.answers || {}) as Record<string, unknown>

    const emailVal = validateEmail(String(body.email || ''))
    if (!emailVal.valid || !emailVal.sanitized) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), { status: 400, headers })
    }
    if (!bookingId) {
      return new Response(JSON.stringify({ error: 'Booking ID required' }), { status: 400, headers })
    }

    const answers: Record<string, string> = {}
    for (const [key, val] of Object.entries(answersRaw)) {
      if (!ALLOWED_KEYS.has(key)) continue
      const s = sanitizeString(String(val ?? ''), 200)
      if (s) answers[key] = s
    }

    if (!answers.trade || !answers.source || !answers.website || !answers.goal) {
      return new Response(JSON.stringify({ error: 'All brief questions are required' }), { status: 400, headers })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)
    if (!envCheck.valid) {
      return new Response(JSON.stringify({ error: 'Service not configured' }), { status: 500, headers })
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const { data: booking, error: fetchErr } = await supabase
      .from('growth_bookings')
      .select('id, lead_email, status')
      .eq('id', bookingId)
      .maybeSingle()

    if (fetchErr || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404, headers })
    }

    if (booking.lead_email?.toLowerCase() !== emailVal.sanitized.toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Email does not match booking' }), { status: 403, headers })
    }

    const { error: updateErr } = await supabase
      .from('growth_bookings')
      .update({
        quiz_answers: answers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateErr) {
      console.error('[update-growth-quiz] update failed:', updateErr)
      return new Response(JSON.stringify({ error: 'Failed to save brief' }), { status: 500, headers })
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
  } catch (err) {
    console.error('[update-growth-quiz]', err)
    return new Response(JSON.stringify({ error: 'Request failed' }), { status: 500, headers })
  }
})
