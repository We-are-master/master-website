import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  getCorsHeaders,
  validateSupabaseEnv,
} from '../_shared/security.ts'
import { createOnboardingEvent } from '../_shared/google-calendar.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  const serviceKey = req.headers.get('Authorization')?.replace('Bearer ', '')
  const expected = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!serviceKey || serviceKey !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
    })
  }

  const validation = await validateRequest(req, {
    requireBody: true,
    rateLimitType: 'api',
  })

  if (!validation.valid) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: validation.status || 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const headers = { ...validation.headers, 'Content-Type': 'application/json' }

  try {
    const body = validation.body as Record<string, unknown>
    const bookingId = String(body.bookingId || '')
    if (!bookingId) {
      return new Response(JSON.stringify({ error: 'bookingId required' }), { status: 400, headers })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)
    if (!envCheck.valid) {
      return new Response(JSON.stringify({ error: envCheck.error }), { status: 500, headers })
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const { data: booking, error } = await supabase
      .from('growth_bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404, headers })
    }

    if (booking.google_event_id) {
      return new Response(JSON.stringify({ eventId: booking.google_event_id, htmlLink: booking.google_event_link }), { status: 200, headers })
    }

    const notifyEmail = Deno.env.get('GROWTH_NOTIFY_EMAIL') || 'victor@getfixfy.com'
    const event = await createOnboardingEvent({
      businessName: booking.biz_name || booking.lead_name,
      leadName: booking.lead_name,
      leadEmail: booking.lead_email,
      leadPhone: booking.lead_phone || undefined,
      slotStart: booking.slot_start,
      plan: booking.plan,
      payMode: booking.pay_mode,
      quizAnswers: booking.quiz_answers || {},
      notifyEmail,
    })

    await supabase
      .from('growth_bookings')
      .update({
        google_event_id: event.eventId,
        google_event_link: event.htmlLink,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    return new Response(JSON.stringify(event), { status: 200, headers })
  } catch (err) {
    console.error('[growth-calendar-event]', err)
    return new Response(JSON.stringify({ error: 'Failed to create calendar event' }), { status: 500, headers })
  }
})
