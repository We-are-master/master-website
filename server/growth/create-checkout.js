import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { growthServerEnv } from './load-env.js'
import { validateEmail, validatePhone, sanitizeString } from './validate.js'
import { isSlotAvailable } from './google-calendar.js'

const SLOT_MINUTES = 15

async function resolveGrowthAmount(stripe, priceId) {
  if (!priceId) {
    return { error: 'Growth plan not configured (set STRIPE_GROWTH_PRICE_ID)' }
  }
  const price = await stripe.prices.retrieve(priceId)
  const amountPence = price.unit_amount
  if (!amountPence || price.currency !== 'gbp') {
    return { error: 'Invalid Growth price — must be GBP one-off' }
  }
  if (price.recurring) {
    return { error: 'Growth price must be one-off, not recurring' }
  }
  return { amountPence }
}

export async function handleCreateCheckout(body) {
  const slot = String(body.slot || '')
  const lead = body.lead || {}
  const biz = body.biz || {}
  const answers = body.answers || {}
  const addons = Array.isArray(body.addons) ? body.addons.map(String) : []
  const attendantName = sanitizeString(String(body.attendantName || answers.attendant_name || ''), 40)

  if (!slot || Number.isNaN(Date.parse(slot))) {
    return { status: 400, data: { error: 'Invalid onboarding slot' } }
  }

  const emailVal = validateEmail(String(lead.email || ''))
  if (!emailVal.valid || !emailVal.sanitized) {
    return { status: 400, data: { error: 'Valid email required' } }
  }

  const name = sanitizeString(String(lead.name || ''), 120)
  if (!name) return { status: 400, data: { error: 'Name required' } }

  const phoneRaw = String(lead.phone || '')
  const phoneVal = phoneRaw ? validatePhone(phoneRaw) : { valid: true, sanitized: '' }
  if (!phoneVal.valid) return { status: 400, data: { error: 'Invalid phone number' } }

  if (!(await isSlotAvailable(slot))) {
    return { status: 409, data: { error: 'That time slot is no longer available. Please pick another.' } }
  }

  const env = growthServerEnv()
  if (!env.stripeSecretKey || !env.supabaseUrl || !env.serviceKey) {
    return {
      status: 500,
      data: {
        error: 'Payment service not configured (set STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY in server env)',
      },
    }
  }

  const stripe = new Stripe(env.stripeSecretKey, { apiVersion: '2023-10-16' })
  const supabase = createClient(env.supabaseUrl, env.serviceKey)

  const amountResult = await resolveGrowthAmount(stripe, env.growthPriceId)
  if (amountResult.error) {
    return { status: 500, data: { error: amountResult.error } }
  }
  const amountPence = amountResult.amountPence

  const slotStart = new Date(slot)
  const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60_000)

  const quizAnswers = {
    ...answers,
    ...(attendantName ? { attendant_name: attendantName } : {}),
  }

  const customer = await stripe.customers.create({
    email: emailVal.sanitized,
    name,
    phone: phoneVal.sanitized || undefined,
    metadata: { source: 'growth' },
  })

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
      plan: 'growth',
      pay_mode: 'full',
      slot,
      stripe_price_id: env.growthPriceId,
      business_name: sanitizeString(String(biz.bizname || ''), 160),
      ...(attendantName ? { attendant_name: attendantName } : {}),
    },
  })

  const { data: booking, error: insertErr } = await supabase
    .from('growth_bookings')
    .insert({
      status: 'pending',
      plan: 'growth',
      pay_mode: 'full',
      amount_pence: amountPence,
      stripe_payment_intent_id: pi.id,
      stripe_subscription_id: null,
      stripe_customer_id: customer.id,
      slot_start: slotStart.toISOString(),
      slot_end: slotEnd.toISOString(),
      lead_name: name,
      lead_email: emailVal.sanitized,
      lead_phone: phoneVal.sanitized || null,
      biz_name: sanitizeString(String(biz.bizname || ''), 160) || null,
      biz_area: sanitizeString(String(biz.area || ''), 160) || null,
      biz_years: sanitizeString(String(biz.years || ''), 40) || null,
      quiz_answers: quizAnswers,
      addons,
    })
    .select('id')
    .single()

  if (insertErr) {
    console.error('[growth-api] insert failed:', insertErr)
    return { status: 500, data: { error: 'Failed to save booking' } }
  }

  return {
    status: 200,
    data: {
      clientSecret: pi.client_secret || '',
      bookingId: booking.id,
      paymentIntentId: pi.id,
      subscriptionId: null,
      amountPence,
    },
  }
}
