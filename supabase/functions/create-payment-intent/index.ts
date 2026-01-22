// Supabase Edge Function: create-payment-intent
// This function creates a Stripe PaymentIntent and saves booking data to the database

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Initialize Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { amount, currency, metadata, customer_email, booking_data } = await req.json()

    // Validate required fields
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount. Amount must be greater than 0.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Ensure amount is an integer (Stripe expects amounts in smallest currency unit)
    const amountInPence = Math.round(amount)

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: currency || 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        created_via: 'supabase_edge_function',
        timestamp: new Date().toISOString(),
      },
      // Optional: Add receipt email if provided
      ...(customer_email && { receipt_email: customer_email }),
    })

    console.log(`PaymentIntent created: ${paymentIntent.id} for £${(amountInPence / 100).toFixed(2)}`)

    // Save booking data to database if provided
    if (booking_data) {
      try {
        // Parse preferred_dates from array of ISO strings to array of date strings
        let preferredDates = null
        if (booking_data.scheduled_dates && Array.isArray(booking_data.scheduled_dates)) {
          preferredDates = booking_data.scheduled_dates
        }

        const bookingRecord = {
          stripe_payment_intent_id: paymentIntent.id,
          status: 'pending',
          payment_status: 'pending',
          amount: amountInPence / 100, // Convert to pounds
          currency: currency || 'gbp',
          customer_name: booking_data.customer_name || 'Unknown',
          customer_email: booking_data.customer_email || customer_email || 'unknown@email.com',
          customer_phone: booking_data.customer_phone || null,
          address_line1: booking_data.address_line1 || null,
          address_line2: booking_data.address_line2 || null,
          city: booking_data.city || null,
          postcode: booking_data.postcode || 'Unknown',
          service_id: booking_data.service_id || null,
          service_name: booking_data.service_name || 'Service',
          service_category: booking_data.service_category || null,
          job_description: booking_data.job_description || null,
          preferred_dates: preferredDates,
          preferred_time_slots: booking_data.scheduled_time_slots || [],
          property_type: booking_data.property_type || null,
          bedrooms: booking_data.bedrooms || null,
          bathrooms: booking_data.bathrooms || null,
          cleaning_addons: booking_data.cleaning_addons || [],
          source: 'website',
          metadata: metadata || {},
        }

        const { data: insertedBooking, error: insertError } = await supabase
          .from('booking_website')
          .insert(bookingRecord)
          .select('id, booking_ref')
          .single()

        if (insertError) {
          console.error('Error saving booking to database:', insertError)
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
    if (error.type === 'StripeCardError') {
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Handle other errors
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create payment intent',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
