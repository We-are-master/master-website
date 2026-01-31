// Supabase Edge Function: create-subscription
// Creates a Stripe Subscription for Master Club membership

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  validateEmail,
  sanitizeString,
  logSecurityEvent,
  getCorsHeaders,
  validateSupabaseEnv,
} from '../_shared/security.ts'

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // Security validation
    const validation = await validateRequest(req)
    if (!validation.valid) {
      logSecurityEvent('invalid_request', { reason: validation.error }, 'medium')
      return new Response(
        JSON.stringify({ error: validation.error || 'Invalid request' }),
        {
          status: 400,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
      return new Response(
        JSON.stringify({ error: 'STRIPE_SECRET_KEY is not configured' }),
        {
          status: 500,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)
    if (!envCheck.valid) {
      return new Response(
        JSON.stringify({ error: envCheck.error }),
        {
          status: 500,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Stripe and Supabase
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-11-20.acacia' })
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // Parse request body
    const body = await req.json()
    const { email, customer_name, payment_method_id } = body

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid || !emailValidation.sanitized) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        {
          status: 400,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    const customerEmail = emailValidation.sanitized

    // Validate payment method
    if (!payment_method_id || typeof payment_method_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Payment method ID is required' }),
        {
          status: 400,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if customer already has an active subscription (website table)
    const { data: existingSubscription } = await supabase
      .from('master_club_subscriptions_website')
      .select('*')
      .eq('customer_email', customerEmail.toLowerCase())
      .in('status', ['active', 'trialing', 'past_due'])
      .single()

    if (existingSubscription) {
      return new Response(
        JSON.stringify({ 
          error: 'You already have an active Master Club subscription',
          subscription_id: existingSubscription.stripe_subscription_id 
        }),
        {
          status: 400,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    // Get or create Stripe customer (check website table first)
    let customer
    const { data: existingCustomer } = await supabase
      .from('master_club_subscriptions_website')
      .select('stripe_customer_id')
      .eq('customer_email', customerEmail.toLowerCase())
      .not('stripe_customer_id', 'is', null)
      .single()

    if (existingCustomer?.stripe_customer_id) {
      try {
        customer = await stripe.customers.retrieve(existingCustomer.stripe_customer_id)
      } catch (err) {
        console.error('Error retrieving customer:', err)
        customer = null
      }
    }

    if (!customer || customer.deleted) {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customer_name ? sanitizeString(customer_name, 200) : undefined,
        metadata: {
          source: 'website',
          created_via: 'master_club_subscription',
        },
      })
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: customer.id,
    })

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    })

    // Get price ID from environment or use default
    // In production, you should create a price in Stripe Dashboard and set it as env var
    const priceId = Deno.env.get('STRIPE_MASTER_CLUB_PRICE_ID') || 'price_1234567890' // Replace with actual price ID

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        source: 'website',
        customer_email: customerEmail,
      },
    })

    // Get client secret from invoice payment intent
    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent
    const clientSecret = paymentIntent?.client_secret

    if (!clientSecret) {
      return new Response(
        JSON.stringify({ error: 'Failed to create subscription client secret' }),
        {
          status: 500,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    // Save subscription to database (website table)
    const { error: dbError } = await supabase
      .from('master_club_subscriptions_website')
      .insert({
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customer.id,
        customer_email: customerEmail.toLowerCase(),
        customer_name: customer_name ? sanitizeString(customer_name, 200) : null,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Error saving subscription to database:', dbError)
      // Continue anyway - webhook will sync
    }

    logSecurityEvent('subscription_created', {
      subscription_id: subscription.id,
      customer_id: customer.id,
      email: customerEmail,
      ip: validation.clientIP,
    }, 'low')

    return new Response(
      JSON.stringify({
        subscription_id: subscription.id,
        client_secret: clientSecret,
        status: subscription.status,
        customer_id: customer.id,
      }),
      {
        status: 200,
        headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error creating subscription:', error)
    logSecurityEvent('subscription_creation_error', {
      error: error.message,
    }, 'high')

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create subscription. Please try again.' 
      }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
      }
    )
  }
})
