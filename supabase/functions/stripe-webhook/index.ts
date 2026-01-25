// Supabase Edge Function: stripe-webhook
// This function handles Stripe webhook events (payment confirmations, etc.)
// Uses the existing booking_website table
// Enterprise-grade security implementation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  logSecurityEvent,
  getCorsHeaders,
  sanitizeString,
  validateEmail,
} from '../_shared/security.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  // Security validation (webhooks have different rate limits)
  const validation = await validateRequest(req, {
    requireBody: true,
    rateLimitType: 'webhook',
    maxPayloadSize: 5 * 1024 * 1024, // 5MB for webhooks
  })

  if (!validation.valid) {
    logSecurityEvent('webhook_validation_failed', {
      error: validation.error,
      ip: validation.clientIP,
    }, 'high')
    
    return new Response(
      JSON.stringify({ error: validation.error }),
      {
        status: validation.status || 400,
        headers: {
          ...validation.headers,
          'Content-Type': 'application/json',
        },
      }
    )
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
      logSecurityEvent('webhook_missing_signature', {
        ip: validation.clientIP,
      }, 'critical')
      
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        {
          status: 400,
          headers: {
            ...validation.headers,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Get the raw body (already validated for size)
    const body = await req.text()

    // Verify the webhook signature (CRITICAL SECURITY CHECK)
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      
      logSecurityEvent('webhook_signature_verification_failed', {
        error: errorMessage,
        ip: validation.clientIP,
      }, 'critical')
      
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        {
          status: 400,
          headers: {
            ...validation.headers,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    logSecurityEvent('webhook_received', {
      event_type: event.type,
      event_id: event.id,
      ip: validation.clientIP,
    }, 'low')

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
          // Parse and sanitize address if provided as single string
          const addressParts = (metadata.customer_address || '').split(', ').map(part => sanitizeString(part, 200))
          
          // Parse scheduled_dates from metadata (comma-separated string)
          let preferredDates: string[] | null = null
          if (metadata.scheduled_dates) {
            preferredDates = metadata.scheduled_dates
              .split(', ')
              .filter(d => d.trim())
              .slice(0, 10) // Limit to 10 dates
          }
          
          // Validate and sanitize email
          let customerEmail = 'unknown@email.com'
          if (metadata.customer_email) {
            const emailVal = validateEmail(metadata.customer_email)
            if (emailVal.valid && emailVal.sanitized) {
              customerEmail = emailVal.sanitized
            }
          } else if (paymentIntent.receipt_email) {
            const emailVal = validateEmail(paymentIntent.receipt_email)
            if (emailVal.valid && emailVal.sanitized) {
              customerEmail = emailVal.sanitized
            }
          }
          
          const { data, error } = await supabase
            .from('booking_website')
            .insert({
              stripe_payment_intent_id: paymentIntent.id,
              status: 'confirmed',
              amount: paymentIntent.amount / 100, // Convert from pence to pounds
              currency: paymentIntent.currency,
              customer_name: metadata.customer_name ? sanitizeString(metadata.customer_name, 200) : 'Unknown',
              customer_email: customerEmail,
              customer_phone: metadata.customer_phone ? sanitizeString(metadata.customer_phone, 50) : null,
              address_line1: addressParts[0] || null,
              city: addressParts.length > 1 ? addressParts[addressParts.length - 2] : null,
              postcode: metadata.postcode ? sanitizeString(metadata.postcode, 20) : (addressParts.length > 0 ? addressParts[addressParts.length - 1] : 'Unknown'),
              service_id: metadata.service_id ? sanitizeString(metadata.service_id, 100) : null,
              service_name: metadata.service_name ? sanitizeString(metadata.service_name, 200) : 'Service',
              service_category: metadata.service_category ? sanitizeString(metadata.service_category, 100) : null,
              job_description: metadata.job_description ? sanitizeString(metadata.job_description, 5000) : null,
              preferred_dates: preferredDates,
              preferred_time_slots: metadata.scheduled_time_slots
                ? metadata.scheduled_time_slots.split(', ').filter(s => s.trim()).slice(0, 10)
                : [],
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
      {
        status: 200,
        headers: {
          ...validation.headers,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    logSecurityEvent('webhook_error', {
      error: errorMessage,
      ip: validation.clientIP,
    }, 'high')
    
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      {
        status: 500,
        headers: {
          ...validation.headers,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
