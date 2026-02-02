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

/** Verify Stripe webhook signature manually (exact raw body + secret, no SDK normalization). */
async function verifyStripeSignature(rawBody: string, signatureHeader: string, secret: string): Promise<boolean> {
  const parts = signatureHeader.split(',')
  let timestamp = ''
  const v1Signatures: string[] = []
  for (const part of parts) {
    const [key, value] = part.split('=').map((s) => s.trim())
    if (key === 't') timestamp = value ?? ''
    if (key === 'v1' && value) v1Signatures.push(value)
  }
  if (!timestamp || v1Signatures.length === 0) return false
  const payload = `${timestamp}.${rawBody}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const expectedHex = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  for (const v1 of v1Signatures) {
    if (v1.length !== expectedHex.length) continue
    let match = 0
    for (let i = 0; i < v1.length; i++) match += v1[i] === expectedHex[i] ? 1 : 0
    if (match === v1.length) return true
  }
  return false
}

/** Safe Unix timestamp (seconds) to ISO string; avoids "Invalid time value" if missing/invalid. */
function unixToISO(ts: number | undefined | null): string | null {
  if (ts == null || typeof ts !== 'number' || !Number.isFinite(ts)) return null
  const d = new Date(ts * 1000)
  return Number.isFinite(d.getTime()) ? d.toISOString() : null
}

/** n8n webhook URL – notified when payment is confirmed and approved (payment_intent.succeeded). */
const N8N_PAYMENT_CONFIRMED_WEBHOOK_URL = 'https://n8n.wearemaster.com/webhook/484678e7-a2c2-4178-95e8-49b9bc74870a'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  // Read raw body ONCE – Stripe signature must be verified against the exact bytes received (no proxy/parsing changes).
  const rawBody = await req.text()

  // Security validation (rate limit + size). Pass rawBody so we don't read body again; same string is used for verification below.
  const validation = await validateRequest(req, {
    requireBody: false,
    rateLimitType: 'webhook',
    maxPayloadSize: 5 * 1024 * 1024, // 5MB for webhooks
    rawBody,
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
    // Trim secrets – .env often has trailing newline/space which breaks Stripe signature verification
    const stripeSecretKey = (Deno.env.get('STRIPE_SECRET_KEY') ?? '').trim()
    const webhookSecret = (Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '').trim()
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

    // Get the signature from headers (trim in case proxy adds whitespace)
    const signature = req.headers.get('stripe-signature')?.trim()
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

    // Verify signature with exact raw body + secret (manual HMAC so nothing alters body/secret)
    const signatureValid = await verifyStripeSignature(rawBody, signature, webhookSecret)
    if (!signatureValid) {
      logSecurityEvent('webhook_signature_verification_failed', {
        ip: validation.clientIP,
        bodyLength: rawBody.length,
        secretSet: !!webhookSecret,
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

    let event: Stripe.Event
    try {
      event = JSON.parse(rawBody) as Stripe.Event
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload' }),
        { status: 400, headers: { ...validation.headers, 'Content-Type': 'application/json' } }
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
        const { data: existingBooking, error: findBookingError } = await supabase
          .from('booking_website')
          .select('id, booking_ref')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (findBookingError?.code === 'PGRST116' || !existingBooking) {
          console.log(`PaymentIntent ${paymentIntent.id}: no existing booking found (create-payment-intent may have failed to insert). Will try fallback insert and still send confirmation email.`, findBookingError?.message || '')
        }

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
            // Send confirmation email for fallback-created booking (same as when existing booking found)
            const fallbackEmail = customerEmail
            const fallbackBookingRef = `MAS-${paymentIntent.id.slice(-8).toUpperCase()}`
            try {
              await fetch(`${supabaseUrl}/functions/v1/send-email`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  template: 'booking_confirmed',
                  to: fallbackEmail,
                  data: {
                    name: metadata.customer_name || 'there',
                    bookingRef: fallbackBookingRef,
                  },
                }),
              })
            } catch (emailErr) {
              console.warn('Failed to send confirmation email (fallback branch):', emailErr)
            }
          }
        }

        // If checkout had "Add Master Club" checked, create Stripe subscription (first month already paid in this PaymentIntent)
        if (metadata.add_subscription === 'true') {
          const paymentIntentCustomerId =
            typeof paymentIntent.customer === 'string'
              ? paymentIntent.customer
              : (paymentIntent.customer as Stripe.Customer)?.id

          if (!paymentIntentCustomerId) {
            console.warn(`PaymentIntent ${paymentIntent.id}: add_subscription=true but PaymentIntent has no customer – subscription skipped. Ensure create-payment-intent is deployed and sets Customer when add_subscription=true (same server as supabase.wearemaster.com).`)
          } else {
          console.log(`PaymentIntent ${paymentIntent.id}: add_subscription=true – attempting Master Club subscription for ${customerEmail}`)
          const paymentMethodId = typeof paymentIntent.payment_method === 'string'
            ? paymentIntent.payment_method
            : (paymentIntent.payment_method as Stripe.PaymentMethod)?.id
          const customerName = metadata.customer_name ? sanitizeString(String(metadata.customer_name), 200) : undefined

          if (!paymentMethodId || !customerEmail || customerEmail === 'unknown@email.com') {
            console.warn(`PaymentIntent ${paymentIntent.id}: skipping subscription – missing payment_method or valid customer_email`)
          } else {
            try {
              const priceId = (Deno.env.get('STRIPE_MASTER_CLUB_PRICE_ID') ?? '').trim()
              if (!priceId || !priceId.startsWith('price_')) {
                console.warn('STRIPE_MASTER_CLUB_PRICE_ID not set or invalid – skipping subscription creation. Add it to the Edge Functions env (same .env as STRIPE_SECRET_KEY) and restart the container.')
              } else {
                // Check if customer already has active subscription (website table)
                const { data: existingSub } = await supabase
                  .from('master_club_subscriptions_website')
                  .select('stripe_subscription_id')
                  .eq('customer_email', customerEmail.toLowerCase())
                  .in('status', ['active', 'trialing', 'past_due'])
                  .maybeSingle()

                if (existingSub?.stripe_subscription_id) {
                  console.log(`Customer ${customerEmail} already has active subscription – skipping creation`)
                } else {
                  // paymentIntentCustomerId already set above (required to enter this block)
                  let stripeCustomer: Stripe.Customer | null = null
                  if (paymentIntentCustomerId) {
                    try {
                      stripeCustomer = await stripe.customers.retrieve(paymentIntentCustomerId) as Stripe.Customer
                      if (stripeCustomer.deleted) throw new Error('Customer deleted')
                    } catch (_) {
                      stripeCustomer = await stripe.customers.create({
                        email: customerEmail,
                        name: customerName,
                        metadata: { source: 'website', created_via: 'webhook_add_subscription' },
                      })
                      await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomer.id })
                    }
                  } else {
                    console.warn(`PaymentIntent ${paymentIntent.id}: no customer on PaymentIntent – cannot create subscription (PaymentMethod cannot be reused). Deploy create-payment-intent so future checkouts with add_subscription set a Customer.`)
                  }

                  if (stripeCustomer) {
                    // Ensure PaymentMethod is attached to this customer (Stripe may not attach on confirm in some flows)
                    try {
                      await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomer.id })
                    } catch (attachErr: unknown) {
                      const msg = attachErr instanceof Error ? attachErr.message : String(attachErr)
                      if (msg.includes('already been attached') || msg.includes('already attached')) {
                        // PM is on another customer – use that customer so default_payment_method is valid
                        try {
                          const pm = await stripe.paymentMethods.retrieve(paymentMethodId)
                          const existingCustomerId = (pm as Stripe.PaymentMethod & { customer?: string })?.customer
                          if (typeof existingCustomerId === 'string') {
                            stripeCustomer = await stripe.customers.retrieve(existingCustomerId) as Stripe.Customer
                            if (stripeCustomer.deleted) stripeCustomer = null
                          }
                        } catch (_) {
                          console.warn('Could not get customer from PaymentMethod')
                        }
                      } else if (msg.includes('previously used without being attached') || msg.includes('detached from a Customer') || msg.includes('may not be used again')) {
                        // PaymentIntent was created without customer – PM cannot be reused for subscription; skip
                        console.warn(`PaymentIntent ${paymentIntent.id}: PaymentMethod cannot be reused for subscription (used without Customer). Deploy create-payment-intent so future checkouts with add_subscription set a Customer.`)
                        stripeCustomer = null
                      } else {
                        console.warn('PaymentMethod attach:', msg)
                      }
                    }
                    if (stripeCustomer) {
                      await stripe.customers.update(stripeCustomer.id, {
                        invoice_settings: { default_payment_method: paymentMethodId },
                      })
                    }
                  }

                  if (stripeCustomer) {
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

                    // Save to DB immediately so "contracted Master Club" is persisted (trial 30 days; status trialing = active for display)
                    const subPeriodStart = unixToISO(subscription.current_period_start) ?? new Date().toISOString()
                    const subPeriodEnd = unixToISO(subscription.current_period_end) ?? new Date().toISOString()
                    const nowIso = new Date().toISOString()
                    const { error: upsertErr } = await supabase
                      .from('master_club_subscriptions_website')
                      .upsert({
                        stripe_subscription_id: subscription.id,
                        stripe_customer_id: subscription.customer as string,
                        customer_email: customerEmail.toLowerCase(),
                        customer_name: customerName || null,
                        status: subscription.status,
                        current_period_start: subPeriodStart,
                        current_period_end: subPeriodEnd,
                        cancel_at_period_end: subscription.cancel_at_period_end ?? false,
                        source: 'website',
                        created_at: nowIso,
                        updated_at: nowIso,
                      }, { onConflict: 'stripe_subscription_id' })
                    if (upsertErr) {
                      const errMsg = upsertErr?.message ?? (upsertErr as { code?: string; details?: string })?.code ?? JSON.stringify(upsertErr)
                      console.error('Failed to save Master Club subscription to DB:', errMsg, upsertErr)
                    } else {
                      console.log(`Master Club subscription ${subscription.id} saved to master_club_subscriptions_website`)
                    }
                  }
                }
              }
            } catch (subErr) {
              console.error('Error creating Master Club subscription from webhook:', subErr)
            }
          }
          }
        }

        // Uma query: reserva com todos os campos (email interno + n8n)
        const { data: bookingRow } = await supabase
          .from('booking_website')
          .select('booking_ref, id, customer_name, customer_email, customer_phone, address_line1, address_line2, city, postcode, service_name, service_category, job_description, preferred_dates, preferred_time_slots, amount, currency, paid_at')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .maybeSingle()

        const preferredDatesStr = Array.isArray(bookingRow?.preferred_dates)
          ? (bookingRow?.preferred_dates as string[]).join(', ')
          : (metadata.scheduled_dates ?? '—')
        const preferredSlotsStr = Array.isArray(bookingRow?.preferred_time_slots)
          ? (bookingRow?.preferred_time_slots as string[]).join(', ')
          : (metadata.scheduled_time_slots ?? '—')

        // Email interno: novo trabalho pago para hello@wearemaster.com (todas as descrições)
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              template: 'internal_new_job_paid',
              to: 'hello@wearemaster.com',
              data: {
                bookingRef: bookingRow?.booking_ref ?? metadata.booking_ref ?? paymentIntent.id.slice(-8).toUpperCase(),
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency ?? 'gbp',
                customerName: bookingRow?.customer_name ?? metadata.customer_name ?? '—',
                customerEmail: bookingRow?.customer_email ?? customerEmail,
                customerPhone: bookingRow?.customer_phone ?? metadata.customer_phone ?? '—',
                addressLine1: bookingRow?.address_line1 ?? metadata.address_line1 ?? '—',
                addressLine2: bookingRow?.address_line2 ?? metadata.address_line2 ?? '—',
                city: bookingRow?.city ?? metadata.city ?? '—',
                postcode: bookingRow?.postcode ?? metadata.postcode ?? '—',
                serviceName: bookingRow?.service_name ?? metadata.service_name ?? '—',
                serviceCategory: bookingRow?.service_category ?? metadata.service_category ?? '—',
                jobDescription: bookingRow?.job_description ?? metadata.job_description ?? '—',
                preferredDates: preferredDatesStr || '—',
                preferredTimeSlots: preferredSlotsStr || '—',
                hoursBooked: metadata.hours_booked ?? '—',
                hourlyRate: metadata.hourly_rate ?? '—',
                addSubscription: metadata.add_subscription === 'true',
                paidAt: bookingRow?.paid_at ?? new Date().toISOString(),
              },
            }),
          })
        } catch (internalEmailErr) {
          console.warn('Failed to send internal new job paid email:', internalEmailErr)
        }

        // Notify n8n when payment is confirmed and approved (for workflows / integrations)
        const addressLine1 = bookingRow?.address_line1 ?? metadata.address_line1 ?? null
        const addressLine2 = bookingRow?.address_line2 ?? metadata.address_line2 ?? null
        const city = bookingRow?.city ?? metadata.city ?? null
        const postcode = bookingRow?.postcode ?? metadata.postcode ?? null
        const addressParts = [addressLine1, addressLine2, city, postcode].filter(Boolean) as string[]
        const address_full = addressParts.length > 0 ? addressParts.join(', ') : null

        try {
          await fetch(N8N_PAYMENT_CONFIRMED_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'payment_intent.succeeded',
              payment_intent_id: paymentIntent.id,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              customer_email: customerEmail,
              customer_name: bookingRow?.customer_name ?? metadata.customer_name ?? null,
              customer_phone: bookingRow?.customer_phone ?? metadata.customer_phone ?? null,
              booking_ref: bookingRow?.booking_ref ?? null,
              booking_id: bookingRow?.id ?? null,
              address_line1: addressLine1,
              address_line2: addressLine2,
              city,
              postcode,
              address_full,
              service_name: bookingRow?.service_name ?? metadata.service_name ?? null,
              service_category: bookingRow?.service_category ?? metadata.service_category ?? null,
              job_description: bookingRow?.job_description ?? metadata.job_description ?? null,
              preferred_dates: preferredDatesStr || null,
              preferred_time_slots: preferredSlotsStr || null,
              metadata: metadata,
              created: new Date().toISOString(),
            }),
          })
        } catch (n8nErr) {
          console.warn('Failed to notify n8n payment confirmed webhook:', n8nErr)
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

        const periodStart = unixToISO(subscription.current_period_start) ?? new Date().toISOString()
        const periodEnd = unixToISO(subscription.current_period_end) ?? new Date().toISOString()

        // Upsert subscription in website table
        const nowIso = new Date().toISOString()
        const { error } = await supabase
          .from('master_club_subscriptions_website')
          .upsert({
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            customer_email: customerEmail.toLowerCase(),
            status: subscription.status,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end ?? false,
            source: 'website',
            updated_at: nowIso,
          }, {
            onConflict: 'stripe_subscription_id',
          })

        if (error) {
          const errMsg = error?.message ?? (error as { code?: string; details?: string })?.code ?? JSON.stringify(error)
          console.error('Error upserting subscription:', errMsg, error)
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
            // This is a website subscription - update period dates (safe dates to avoid Invalid time value)
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const periodStart = unixToISO(subscription.current_period_start) ?? new Date().toISOString()
            const periodEnd = unixToISO(subscription.current_period_end) ?? new Date().toISOString()
            await supabase
              .from('master_club_subscriptions_website')
              .update({
                current_period_start: periodStart,
                current_period_end: periodEnd,
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
