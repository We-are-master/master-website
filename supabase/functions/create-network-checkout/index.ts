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

function onboardingUrl(name: string, email: string, phone: string, business: string, trade?: string, trades?: string): string {
  const params = new URLSearchParams()
  if (name) params.set('name', name)
  if (email) params.set('email', email)
  if (phone) params.set('phone', phone)
  if (business) params.set('business', business)
  if (trade) params.set('trade', trade)
  if (trades) params.set('trades', trades)
  return `https://partners.getfixfy.com/get-started?${params.toString()}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  const validation = await validateRequest(req, {
    requireBody: true,
    rateLimitType: 'payment',
    maxPayloadSize: 128 * 1024,
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
    const lead = (body.lead || {}) as Record<string, unknown>
    const biz = (body.biz || {}) as Record<string, unknown>

    if (!['monthly', 'annual'].includes(plan)) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400, headers })
    }

    const emailVal = validateEmail(String(lead.email || ''))
    if (!emailVal.valid || !emailVal.sanitized) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), { status: 400, headers })
    }

    const name = sanitizeString(String(lead.name || ''), 120)
    if (!name) {
      return new Response(JSON.stringify({ error: 'Name required' }), { status: 400, headers })
    }

    const bizName = sanitizeString(String(biz.bizname || ''), 160)
    if (!bizName) {
      return new Response(JSON.stringify({ error: 'Business name required' }), { status: 400, headers })
    }

    const phoneRaw = String(lead.phone || '')
    const phoneVal = phoneRaw ? validatePhone(phoneRaw) : { valid: false, sanitized: '' }
    if (!phoneVal.valid || !phoneVal.sanitized) {
      return new Response(JSON.stringify({ error: 'Valid phone required' }), { status: 400, headers })
    }

    const tradesRaw = sanitizeString(String(biz.trades || biz.trade || ''), 120)
    const trade = tradesRaw

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)

    if (!stripeKey || !envCheck.valid) {
      return new Response(JSON.stringify({ error: 'Payment service not configured' }), { status: 500, headers })
    }

    const priceId = plan === 'annual'
      ? Deno.env.get('STRIPE_NETWORK_ANNUAL_PRICE_ID')
      : Deno.env.get('STRIPE_NETWORK_MONTHLY_PRICE_ID')

    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Plan not configured in Stripe' }), { status: 500, headers })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    const redirectUrl = onboardingUrl(
      name, emailVal.sanitized, phoneVal.sanitized, bizName,
      trade ? trade.split(',')[0] : undefined,
      trade || undefined,
    )

    const customer = await stripe.customers.create({
      email: emailVal.sanitized,
      name,
      phone: phoneVal.sanitized,
      metadata: { source: 'network', business_name: bizName, trade: trade || '' },
    })

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        source: 'network',
        plan,
        business_name: bizName,
        trade: trade || '',
      },
    })

    const invoice = subscription.latest_invoice as Stripe.Invoice | null
    const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent | string | null
    const paymentIntentObj = typeof paymentIntent === 'string' ? null : paymentIntent
    const clientSecret = paymentIntentObj?.client_secret || ''
    const paymentIntentId = paymentIntentObj?.id || (typeof paymentIntent === 'string' ? paymentIntent : null)

    if (!clientSecret) {
      return new Response(JSON.stringify({ error: 'Could not initialise payment' }), { status: 500, headers })
    }

    const { data: signup, error: insertErr } = await supabase
      .from('network_signups')
      .insert({
        status: 'pending',
        plan,
        lead_name: name,
        lead_email: emailVal.sanitized,
        lead_phone: phoneVal.sanitized,
        biz_name: bizName,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        stripe_payment_intent_id: paymentIntentId,
        onboarding_redirect_url: redirectUrl,
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error('[create-network-checkout] insert failed:', insertErr)
      return new Response(JSON.stringify({ error: 'Failed to save signup' }), { status: 500, headers })
    }

    return new Response(
      JSON.stringify({
        clientSecret,
        intentType: 'payment',
        signupId: signup.id,
        subscriptionId: subscription.id,
        onboardingUrl: redirectUrl,
      }),
      { status: 200, headers },
    )
  } catch (err) {
    console.error('[create-network-checkout]', err)
    return new Response(JSON.stringify({ error: 'Checkout failed' }), { status: 500, headers })
  }
})
