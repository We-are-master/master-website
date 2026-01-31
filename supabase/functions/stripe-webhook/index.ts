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
  validateSupabaseEnv,
} from '../_shared/security.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  // Security validation (rate limit + size). Do NOT use requireBody: we need the raw body for Stripe signature verification.
  const validation = await validateRequest(req, {
    requireBody: false,
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

    const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)
    if (!envCheck.valid) {
      logSecurityEvent('invalid_supabase_config', { error: envCheck.error }, 'critical')
      return new Response(
        JSON.stringify({ error: envCheck.error }),
        {
          status: 500,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

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

        // Get customer email for confirmation email
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
            
            // Send confirmation email
            try {
              await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  template: 'booking_confirmed',
                  to: customerEmail,
                  data: {
                    name: metadata.customer_name || 'there',
                    bookingRef: existingBooking.booking_ref || paymentIntent.id.slice(-8).toUpperCase(),
                  },
                }),
              })
            } catch (emailErr) {
              console.warn('Failed to send confirmation email:', emailErr)
            }
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

        // If checkout had "Add Master Club" checked, create Stripe subscription (first month already paid in this PaymentIntent)
        if (metadata.add_subscription === 'true') {
          const paymentMethodId = typeof paymentIntent.payment_method === 'string'
            ? paymentIntent.payment_method
            : (paymentIntent.payment_method as Stripe.PaymentMethod)?.id
          const customerName = metadata.customer_name ? sanitizeString(String(metadata.customer_name), 200) : undefined

          if (paymentMethodId && customerEmail && customerEmail !== 'unknown@email.com') {
            try {
              const priceId = Deno.env.get('STRIPE_MASTER_CLUB_PRICE_ID')
              if (!priceId || !priceId.startsWith('price_')) {
                console.warn('STRIPE_MASTER_CLUB_PRICE_ID not set – skipping subscription creation')
              } else {
                // Check if customer already has active subscription (website table)
                const { data: existingSub } = await supabase
                  .from('master_club_subscriptions_website')
                  .select('stripe_subscription_id')
                  .eq('customer_email', customerEmail.toLowerCase())
                  .in('status', ['active', 'trialing', 'past_due'])
                  .maybeSingle()

                if (existingSub?.stripe_subscription_id) {
                  console.log(`Customer ${customerEmail} already has subscription – skip`)
                } else {
                  // Get or create Stripe customer
                  let stripeCustomer: Stripe.Customer | null = null
                  const { data: existingRow } = await supabase
                    .from('master_club_subscriptions_website')
                    .select('stripe_customer_id')
                    .eq('customer_email', customerEmail.toLowerCase())
                    .not('stripe_customer_id', 'is', null)
                    .limit(1)
                    .maybeSingle()

                  if (existingRow?.stripe_customer_id) {
                    try {
                      stripeCustomer = await stripe.customers.retrieve(existingRow.stripe_customer_id) as Stripe.Customer
                    } catch (_) {
                      stripeCustomer = null
                    }
                  }
                  if (!stripeCustomer || stripeCustomer.deleted) {
                    stripeCustomer = await stripe.customers.create({
                      email: customerEmail,
                      name: customerName,
                      metadata: { source: 'website', created_via: 'webhook_add_subscription' },
                    })
                  }

                  try {
                    await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomer.id })
                  } catch (attachErr: unknown) {
                    const msg = attachErr instanceof Error ? attachErr.message : String(attachErr)
                    if (msg.includes('already been attached') || msg.includes('already attached')) {
                      const pm = await stripe.paymentMethods.retrieve(paymentMethodId)
                      const existingCustomerId = (pm as Stripe.PaymentMethod & { customer?: string })?.customer
                      if (typeof existingCustomerId === 'string') {
                        stripeCustomer = await stripe.customers.retrieve(existingCustomerId) as Stripe.Customer
                      }
                    } else {
                      throw attachErr
                    }
                  }
                  await stripe.customers.update(stripeCustomer.id, {
                    invoice_settings: { default_payment_method: paymentMethodId },
                  })

                  const subscription = await stripe.subscriptions.create({
                    customer: stripeCustomer.id,
                    items: [{ price: priceId }],
                    trial_period_days: 30,
                    default_payment_method: paymentMethodId,
                    metadata: {
                      source: 'website',
                      customer_email: customerEmail,
                      customer_name: customerName || '',
                    },
                  })
                  console.log(`Master Club subscription created from webhook: ${subscription.id} for ${customerEmail}`)
                }
              }
            } catch (subErr) {
              console.error('Error creating Master Club subscription from webhook:', subErr)
            }
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent failed: ${paymentIntent.id}`)

        // Get customer email for failure email
        const metadata = paymentIntent.metadata || {}
        let customerEmail = null
        if (metadata.customer_email) {
          const emailVal = validateEmail(metadata.customer_email)
          if (emailVal.valid && emailVal.sanitized) {
            customerEmail = emailVal.sanitized
          }
        }

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

        // Send payment failed email
        if (customerEmail) {
          try {
            await fetch(`${supabaseUrl}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                template: 'payment_failed',
                to: customerEmail,
                data: {
                  name: metadata.customer_name || 'there',
                  retryUrl: `https://www.wearemaster.com/checkout?payment_intent=${paymentIntent.id}`,
                },
              }),
            })
          } catch (emailErr) {
            console.warn('Failed to send payment failed email:', emailErr)
          }
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

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`Subscription ${event.type}: ${subscription.id}`)

        // Only handle website subscriptions (check metadata)
        const metadata = subscription.metadata || {}
        if (metadata.source !== 'website') {
          console.log(`Skipping subscription ${subscription.id} - not from website`)
          break
        }

        // Get customer email from metadata or customer object
        let customerEmail = metadata.customer_email
        if (!customerEmail && subscription.customer) {
          try {
            const customer = await stripe.customers.retrieve(subscription.customer as string)
            if (customer && !customer.deleted && customer.email) {
              const emailVal = validateEmail(customer.email)
              if (emailVal.valid && emailVal.sanitized) {
                customerEmail = emailVal.sanitized
              }
            }
          } catch (err) {
            console.error('Error retrieving customer:', err)
          }
        }

        if (!customerEmail) {
          console.warn(`No customer email found for subscription ${subscription.id}`)
          break
        }

        // Upsert subscription in website table
        const { error } = await supabase
          .from('master_club_subscriptions_website')
          .upsert({
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            customer_email: customerEmail.toLowerCase(),
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            source: 'website',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'stripe_subscription_id',
          })

        if (error) {
          console.error('Error upserting subscription:', error)
        } else {
          console.log(`Subscription ${subscription.id} synced to website table`)

          // Send welcome email if this is a new subscription
          if (event.type === 'customer.subscription.created') {
            try {
              await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  template: 'subscription_welcome',
                  to: customerEmail,
                  data: {
                    name: metadata.customer_name || customerEmail.split('@')[0],
                  },
                }),
              })
            } catch (emailErr) {
              console.warn('Failed to send subscription welcome email:', emailErr)
            }
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`Subscription deleted: ${subscription.id}`)

        // Only handle website subscriptions
        const metadata = subscription.metadata || {}
        if (metadata.source !== 'website') {
          console.log(`Skipping subscription ${subscription.id} - not from website`)
          break
        }

        // Update subscription status to canceled
        const { error } = await supabase
          .from('master_club_subscriptions_website')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error updating deleted subscription:', error)
        } else {
          console.log(`Subscription ${subscription.id} marked as canceled`)

          // Send cancellation email
          let customerEmail = metadata.customer_email
          if (!customerEmail && subscription.customer) {
            try {
              const customer = await stripe.customers.retrieve(subscription.customer as string)
              if (customer && !customer.deleted && customer.email) {
                const emailVal = validateEmail(customer.email)
                if (emailVal.valid && emailVal.sanitized) {
                  customerEmail = emailVal.sanitized
                }
              }
            } catch (err) {
              console.error('Error retrieving customer:', err)
            }
          }

          if (customerEmail) {
            try {
              await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  template: 'subscription_cancelled',
                  to: customerEmail,
                  data: {
                    name: metadata.customer_name || customerEmail.split('@')[0],
                  },
                }),
              })
            } catch (emailErr) {
              console.warn('Failed to send subscription cancellation email:', emailErr)
            }
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Invoice payment succeeded: ${invoice.id}`)

        // Only handle subscription invoices from website
        if (invoice.subscription) {
          const subscriptionId = invoice.subscription as string
          
          // Check if this is a website subscription
          const { data: websiteSubscription } = await supabase
            .from('master_club_subscriptions_website')
            .select('customer_email, customer_name')
            .eq('stripe_subscription_id', subscriptionId)
            .single()

          if (websiteSubscription) {
            // This is a website subscription - update period dates
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            
            await supabase
              .from('master_club_subscriptions_website')
              .update({
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                status: subscription.status,
                updated_at: new Date().toISOString(),
              })
              .eq('stripe_subscription_id', subscriptionId)

            console.log(`Website subscription ${subscriptionId} period updated`)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Invoice payment failed: ${invoice.id}`)

        // Only handle subscription invoices from website
        if (invoice.subscription) {
          const subscriptionId = invoice.subscription as string
          
          // Check if this is a website subscription
          const { data: websiteSubscription } = await supabase
            .from('master_club_subscriptions_website')
            .select('customer_email, customer_name')
            .eq('stripe_subscription_id', subscriptionId)
            .single()

          if (websiteSubscription) {
            // Update subscription status
            await supabase
              .from('master_club_subscriptions_website')
              .update({
                status: 'past_due',
                updated_at: new Date().toISOString(),
              })
              .eq('stripe_subscription_id', subscriptionId)

            // Send payment failed email
            if (websiteSubscription.customer_email) {
              try {
                await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    template: 'payment_failed',
                    to: websiteSubscription.customer_email,
                    data: {
                      name: websiteSubscription.customer_name || websiteSubscription.customer_email.split('@')[0],
                      retryUrl: `https://www.wearemaster.com/my-bookings`,
                    },
                  }),
                })
              } catch (emailErr) {
                console.warn('Failed to send subscription payment failed email:', emailErr)
              }
            }
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
    console.error('[stripe-webhook] 500:', errorMessage)

    return new Response(
      JSON.stringify({ error: 'Webhook processing failed', details: errorMessage }),
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
