import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  validateEmail,
  validatePhone,
  sanitizeString,
  getCorsHeaders,
  validateSupabaseEnv,
} from '../_shared/security.ts'
import { isSlotAvailable } from '../_shared/google-calendar.ts'

const SLOT_MINUTES = 15

const PRICES = {
  monthly_full: 7900,
  onetime_full: 49900,
  deposit: 9900,
} as const

function amountFor(plan: string, payMode: string): number {
  if (payMode === 'deposit') return PRICES.deposit
  if (plan === 'onetime') return PRICES.onetime_full
  return PRICES.monthly_full
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  const validation = await validateRequest(req, {
    requireBody: true,
    rateLimitType: 'payment',
    maxPayloadSize: 256 * 1024,
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
    const plan = String(body.plan || 'monthly')
    const payMode = String(body.payMode || 'full')
    const slot = String(body.slot || '')
    const lead = (body.lead || {}) as Record<string, unknown>
    const biz = (body.biz || {}) as Record<string, unknown>
    const answers = (body.answers || {}) as Record<string, unknown>
    const addons = Array.isArray(body.addons) ? body.addons.map(String) : []

    if (!['monthly', 'onetime'].includes(plan)) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400, headers })
    }
    if (!['full', 'deposit'].includes(payMode)) {
      return new Response(JSON.stringify({ error: 'Invalid pay mode' }), { status: 400, headers })
    }
    if (!slot || Number.isNaN(Date.parse(slot))) {
      return new Response(JSON.stringify({ error: 'Invalid onboarding slot' }), { status: 400, headers })
    }

    const emailVal = validateEmail(String(lead.email || ''))
    if (!emailVal.valid || !emailVal.sanitized) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), { status: 400, headers })
    }

    const name = sanitizeString(String(lead.name || ''), 120)
    if (!name) {
      return new Response(JSON.stringify({ error: 'Name required' }), { status: 400, headers })
    }

    const phoneRaw = String(lead.phone || '')
    const phoneVal = phoneRaw ? validatePhone(phoneRaw) : { valid: true, sanitized: '' }
    if (!phoneVal.valid) {
      return new Response(JSON.stringify({ error: 'Invalid phone number' }), { status: 400, headers })
    }

    const slotAvailable = await isSlotAvailable(slot)
    if (!slotAvailable) {
      return new Response(JSON.stringify({ error: 'That time slot is no longer available. Please pick another.' }), { status: 409, headers })
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)

    if (!stripeKey || !envCheck.valid) {
      return new Response(JSON.stringify({ error: 'Payment service not configured' }), { status: 500, headers })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    const amountPence = amountFor(plan, payMode)
    const slotStart = new Date(slot)
    const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60_000)

    const customer = await stripe.customers.create({
      email: emailVal.sanitized,
      name,
      phone: phoneVal.sanitized || undefined,
      metadata: { source: 'growth' },
    })

    let clientSecret = ''
    let paymentIntentId = ''
    let subscriptionId: string | null = null

    if (plan === 'monthly' && payMode === 'full') {
      const priceId = Deno.env.get('STRIPE_GROWTH_MONTHLY_PRICE_ID')
      if (!priceId) {
        return new Response(JSON.stringify({ error: 'Monthly plan not configured' }), { status: 500, headers })
      }

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          source: 'growth',
          plan,
          pay_mode: payMode,
          slot,
        },
      })

      subscriptionId = subscription.id
      const invoice = subscription.latest_invoice as Stripe.Invoice
      const pi = invoice.payment_intent as Stripe.PaymentIntent
      clientSecret = pi.client_secret || ''
      paymentIntentId = pi.id
    } else {
      const pi = await stripe.paymentIntents.create({
        amount: amountPence,
        currency: 'gbp',
        customer: customer.id,
        setup_future_usage: 'off_session',
        automatic_payment_methods: { enabled: true },
        receipt_email: emailVal.sanitized,
        metadata: {
          source: 'growth',
          customer_email: emailVal.sanitized,
          customer_name: name,
          plan,
          pay_mode: payMode,
          slot,
          business_name: sanitizeString(String(biz.bizname || ''), 160),
        },
      })
      clientSecret = pi.client_secret || ''
      paymentIntentId = pi.id
    }

    const { data: booking, error: insertErr } = await supabase
      .from('growth_bookings')
      .insert({
        status: 'pending',
        plan,
        pay_mode: payMode,
        amount_pence: amountPence,
        stripe_payment_intent_id: paymentIntentId,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customer.id,
        slot_start: slotStart.toISOString(),
        slot_end: slotEnd.toISOString(),
        lead_name: name,
        lead_email: emailVal.sanitized,
        lead_phone: phoneVal.sanitized || null,
        biz_name: sanitizeString(String(biz.bizname || ''), 160) || null,
        biz_area: sanitizeString(String(biz.area || ''), 160) || null,
        biz_years: sanitizeString(String(biz.years || ''), 40) || null,
        quiz_answers: answers,
        addons,
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error('[create-growth-checkout] insert failed:', insertErr)
      return new Response(JSON.stringify({ error: 'Failed to save booking' }), { status: 500, headers })
    }

    return new Response(
      JSON.stringify({
        clientSecret,
        bookingId: booking.id,
        paymentIntentId,
        subscriptionId,
      }),
      { status: 200, headers },
    )
  } catch (err) {
    console.error('[create-growth-checkout]', err)
    return new Response(JSON.stringify({ error: 'Checkout failed' }), { status: 500, headers })
  }
})
