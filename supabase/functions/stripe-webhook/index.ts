// Supabase Edge Function: stripe-webhook
// This function handles Stripe webhook events (payment confirmations, etc.)
// Uses the existing booking_website table

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey || !webhookSecret) {
      throw new Error('Stripe configuration missing')
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the raw body
    const body = await req.text()

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Received webhook event: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`)

        // Extract metadata from payment intent
        const metadata = paymentIntent.metadata || {}

        // First try to find existing booking by stripe_payment_intent_id
        const { data: existingBooking } = await supabase
          .from('booking_website')
          .select('id, booking_ref')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (existingBooking) {
          // Update existing booking to confirmed/paid
          const { error } = await supabase
            .from('booking_website')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              paid_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', paymentIntent.id)

          if (error) {
            console.error('Error updating booking:', error)
          } else {
            console.log(`Booking confirmed: ${existingBooking.booking_ref}`)
          }
        } else {
          // Create new booking from webhook (fallback if not created during checkout)
          // Parse address if provided as single string
          const addressParts = (metadata.customer_address || '').split(', ')
          
          // Parse scheduled_dates from metadata (comma-separated string)
          let preferredDates = null
          if (metadata.scheduled_dates) {
            preferredDates = metadata.scheduled_dates.split(', ').filter(d => d.trim())
          }
          
          const { data, error } = await supabase
            .from('booking_website')
            .insert({
              stripe_payment_intent_id: paymentIntent.id,
              status: 'confirmed',
              amount: paymentIntent.amount / 100, // Convert from pence to pounds
              currency: paymentIntent.currency,
              customer_name: metadata.customer_name || 'Unknown',
              customer_email: metadata.customer_email || paymentIntent.receipt_email || 'unknown@email.com',
              customer_phone: metadata.customer_phone || null,
              address_line1: addressParts[0] || null,
              city: addressParts.length > 1 ? addressParts[addressParts.length - 2] : null,
              postcode: metadata.postcode || (addressParts.length > 0 ? addressParts[addressParts.length - 1] : 'Unknown'),
              service_id: metadata.service_id || null,
              service_name: metadata.service_name || 'Service',
              service_category: metadata.service_category || null,
              job_description: metadata.job_description || null,
              preferred_dates: preferredDates,
              preferred_time_slots: metadata.scheduled_time_slots ? metadata.scheduled_time_slots.split(', ').filter(s => s.trim()) : [],
              payment_status: 'paid',
              paid_at: new Date().toISOString(),
              source: 'website',
            })

          if (error) {
            console.error('Error creating booking:', error)
          } else {
            console.log('New booking created from webhook:', data)
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent failed: ${paymentIntent.id}`)

        // Update booking status to failed
        const { error } = await supabase
          .from('booking_website')
          .update({
            status: 'payment_failed',
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (error) {
          console.error('Error updating failed booking:', error)
        }
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent canceled: ${paymentIntent.id}`)

        const { error } = await supabase
          .from('booking_website')
          .update({
            status: 'canceled',
            payment_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (error) {
          console.error('Error updating canceled booking:', error)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        console.log(`Charge refunded: ${charge.id}`)

        if (charge.payment_intent) {
          const { error } = await supabase
            .from('booking_website')
            .update({
              status: 'refunded',
              payment_status: 'refunded',
              refunded_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', charge.payment_intent)

          if (error) {
            console.error('Error updating refunded booking:', error)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
