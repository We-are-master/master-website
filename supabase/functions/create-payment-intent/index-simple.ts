// Supabase Edge Function: create-payment-intent
// This function creates a Stripe PaymentIntent and saves booking data to the database
// Simplified version compatible with current server setup

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { validateSupabaseEnv } from '../_shared/security.ts'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Health check endpoint
  if (req.method === 'GET' && new URL(req.url).pathname.endsWith('/health')) {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    return new Response(
      JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: {
          hasStripeKey: !!stripeKey,
          hasSupabaseUrl: !!supabaseUrl,
          hasSupabaseKey: !!supabaseKey,
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY is not configured')
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }

    const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)
    if (!envCheck.valid) {
      console.error(envCheck.error)
      return new Response(
        JSON.stringify({ error: envCheck.error }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Initialize Supabase
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // Parse request body
    const body = await req.json() as {
      amount?: number | string
      currency?: string
      metadata?: Record<string, string>
      customer_email?: string
      booking_data?: Record<string, unknown>
    }

    // Validate amount
    if (!body.amount || (typeof body.amount === 'number' && body.amount <= 0)) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount. Amount must be greater than 0.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Frontend sends amount in pence (GBP); do not multiply by 100
    const amountInPence = Math.round(Number(body.amount))

    // Validate currency
    const currency = (body.currency || 'gbp').toLowerCase()
    const allowedCurrencies = ['gbp', 'usd', 'eur']
    if (!allowedCurrencies.includes(currency)) {
      return new Response(
        JSON.stringify({ error: 'Invalid currency. Allowed: GBP, USD, EUR' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate email if provided
    let customerEmail: string | undefined
    if (body.customer_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.customer_email)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email address' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
      customerEmail = body.customer_email.trim().toLowerCase()
    }

    // Create PaymentIntent with Klarna support
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: currency,
      payment_method_types: ['card', 'klarna'],
      metadata: {
        ...(body.metadata || {}),
        created_via: 'supabase_edge_function',
        timestamp: new Date().toISOString(),
      },
      ...(customerEmail && { receipt_email: customerEmail }),
    })

    console.log(`Payment intent created: ${paymentIntent.id} for amount: ${amountInPence} ${currency}`)

    // Save booking data to database if provided
    if (body.booking_data) {
      try {
        const bookingData = body.booking_data as Record<string, unknown>
        
        const bookingRecord = {
          stripe_payment_intent_id: paymentIntent.id,
          status: 'pending',
          payment_status: 'pending',
          amount: amountInPence / 100,
          currency: currency,
          customer_name: (bookingData.customer_name && typeof bookingData.customer_name === 'string')
            ? bookingData.customer_name.substring(0, 200)
            : 'Unknown',
          customer_email: customerEmail || (bookingData.customer_email && typeof bookingData.customer_email === 'string')
            ? bookingData.customer_email.substring(0, 200)
            : 'unknown@email.com',
          customer_phone: (bookingData.customer_phone && typeof bookingData.customer_phone === 'string')
            ? bookingData.customer_phone.substring(0, 50)
            : null,
          address_line1: (bookingData.address_line1 && typeof bookingData.address_line1 === 'string')
            ? bookingData.address_line1.substring(0, 200)
            : null,
          address_line2: (bookingData.address_line2 && typeof bookingData.address_line2 === 'string')
            ? bookingData.address_line2.substring(0, 200)
            : null,
          city: (bookingData.city && typeof bookingData.city === 'string')
            ? bookingData.city.substring(0, 100)
            : null,
          postcode: (bookingData.postcode && typeof bookingData.postcode === 'string')
            ? bookingData.postcode.substring(0, 20)
            : 'Unknown',
          service_id: (bookingData.service_id && typeof bookingData.service_id === 'string')
            ? bookingData.service_id.substring(0, 100)
            : null,
          service_name: (bookingData.service_name && typeof bookingData.service_name === 'string')
            ? bookingData.service_name.substring(0, 200)
            : 'Service',
          service_category: (bookingData.service_category && typeof bookingData.service_category === 'string')
            ? bookingData.service_category.substring(0, 100)
            : null,
          job_description: (bookingData.job_description && typeof bookingData.job_description === 'string')
            ? bookingData.job_description.substring(0, 5000)
            : null,
          preferred_dates: Array.isArray(bookingData.scheduled_dates)
            ? bookingData.scheduled_dates.slice(0, 10).filter((d): d is string => typeof d === 'string')
            : null,
          preferred_time_slots: Array.isArray(bookingData.scheduled_time_slots)
            ? bookingData.scheduled_time_slots.slice(0, 10).filter((s): s is string => typeof s === 'string')
            : [],
          property_type: (bookingData.property_type && typeof bookingData.property_type === 'string')
            ? bookingData.property_type.substring(0, 50)
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
          metadata: body.metadata || {},
        }

        const { data: insertedBooking, error: insertError } = await supabase
          .from('booking_website')
          .insert(bookingRecord)
          .select('id, booking_ref')
          .single()

        if (insertError) {
          console.error('Database error:', insertError)
          // Don't fail the whole request - payment intent was created successfully
        } else {
          console.log(`Pending booking created: ${insertedBooking.booking_ref} for PI: ${paymentIntent.id}`)
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Don't fail the whole request - payment intent was created successfully
      }
    }

    // Return the client secret and payment intent ID
    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error creating payment intent:', error)

    // Handle Stripe-specific errors
    if (error && typeof error === 'object' && 'type' in error && error.type === 'StripeCardError') {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Payment error' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create payment intent. Please try again.',
        details: import.meta.env.DEV ? errorMessage : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
