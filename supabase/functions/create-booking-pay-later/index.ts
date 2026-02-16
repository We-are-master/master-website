// Supabase Edge Function: create-booking-pay-later
// Creates a booking_website row without Stripe (pay later). Same booking_data shape as create-payment-intent.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  logSecurityEvent,
  getCorsHeaders,
  validateEmail,
  validatePhone,
  validatePostcode,
  sanitizeString,
  validateSupabaseEnv,
} from '../_shared/security.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  const validation = await validateRequest(req, {
    requireBody: true,
    rateLimitType: 'api',
  })

  if (!validation.valid) {
    logSecurityEvent('create_booking_pay_later_validation_failed', {
      error: validation.error,
      ip: validation.clientIP,
    }, 'high')
    return new Response(JSON.stringify({ error: validation.error }), {
      status: validation.status || 400,
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

  const body = validation.body as { booking_data?: Record<string, unknown>; amount?: number }
  const bookingData = body.booking_data

  if (!bookingData || typeof bookingData !== 'object') {
    return new Response(JSON.stringify({ error: 'booking_data is required' }), {
      status: 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const emailVal = bookingData.customer_email && typeof bookingData.customer_email === 'string'
    ? validateEmail(bookingData.customer_email)
    : { valid: false as const }
  if (!emailVal.valid || !emailVal.sanitized) {
    return new Response(JSON.stringify({ error: 'Valid email is required' }), {
      status: 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  let postcode = 'Unknown'
  if (bookingData.postcode && typeof bookingData.postcode === 'string') {
    const postcodeVal = validatePostcode(bookingData.postcode)
    if (postcodeVal.valid && postcodeVal.sanitized) postcode = postcodeVal.sanitized
  }

  const amountPounds = typeof body.amount === 'number' && body.amount >= 0
    ? Math.round(body.amount * 100) / 100
    : 0

  let preferredDates: string[] | null = null
  if (Array.isArray(bookingData.scheduled_dates)) {
    preferredDates = bookingData.scheduled_dates
      .filter((d): d is string => typeof d === 'string')
      .slice(0, 10)
  }

  const rawServiceId = bookingData.service_id && typeof bookingData.service_id === 'string' ? bookingData.service_id.trim() : null
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const serviceIdForDb = rawServiceId && uuidRegex.test(rawServiceId) ? rawServiceId : null

  const customerPhone = bookingData.customer_phone && typeof bookingData.customer_phone === 'string'
    ? (validatePhone(bookingData.customer_phone).sanitized ?? null)
    : null

  const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

  const bookingRecord = {
    stripe_payment_intent_id: null as string | null,
    status: 'pending',
    payment_status: 'pay_later',
    amount: amountPounds,
    currency: 'gbp',
    customer_name: bookingData.customer_name && typeof bookingData.customer_name === 'string'
      ? sanitizeString(bookingData.customer_name, 200)
      : 'Unknown',
    customer_email: emailVal.sanitized,
    customer_phone: customerPhone,
    address_line1: bookingData.address_line1 && typeof bookingData.address_line1 === 'string'
      ? sanitizeString(bookingData.address_line1, 200)
      : null,
    address_line2: bookingData.address_line2 && typeof bookingData.address_line2 === 'string'
      ? sanitizeString(bookingData.address_line2, 200)
      : null,
    city: bookingData.city && typeof bookingData.city === 'string'
      ? sanitizeString(bookingData.city, 100)
      : null,
    postcode,
    service_id: serviceIdForDb,
    service_name: bookingData.service_name && typeof bookingData.service_name === 'string'
      ? sanitizeString(bookingData.service_name, 200)
      : 'Service',
    service_category: bookingData.service_category && typeof bookingData.service_category === 'string'
      ? sanitizeString(bookingData.service_category, 100)
      : null,
    job_description: bookingData.job_description && typeof bookingData.job_description === 'string'
      ? sanitizeString(bookingData.job_description, 5000)
      : null,
    preferred_dates: preferredDates,
    preferred_time_slots: Array.isArray(bookingData.scheduled_time_slots)
      ? bookingData.scheduled_time_slots.slice(0, 10).filter((s): s is string => typeof s === 'string')
      : [],
    property_type: bookingData.property_type && typeof bookingData.property_type === 'string'
      ? sanitizeString(bookingData.property_type, 50)
      : null,
    bedrooms: typeof bookingData.bedrooms === 'number' && bookingData.bedrooms >= 0 && bookingData.bedrooms <= 20
      ? bookingData.bedrooms
      : null,
    bathrooms: typeof bookingData.bathrooms === 'number' && bookingData.bathrooms >= 0 && bookingData.bathrooms <= 20
      ? bookingData.bathrooms
      : null,
    cleaning_addons: Array.isArray(bookingData.cleaning_addons)
      ? bookingData.cleaning_addons.slice(0, 20).filter((a): a is string => typeof a === 'string')
      : [],
    source: 'website',
    metadata: { pay_later: true, created_via: 'create_booking_pay_later' },
  }

  const { data: inserted, error: insertError } = await supabase
    .from('booking_website')
    .insert(bookingRecord)
    .select('id, booking_ref')
    .single()

  if (insertError) {
    logSecurityEvent('create_booking_pay_later_insert_error', {
      message: insertError.message,
      ip: validation.clientIP,
    }, 'high')
    return new Response(
      JSON.stringify({ error: 'Failed to save booking. Please try again.' }),
      { status: 500, headers: { ...validation.headers, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, booking_ref: inserted.booking_ref, id: inserted.id }),
    { status: 200, headers: { ...validation.headers, 'Content-Type': 'application/json' } }
  )
})
