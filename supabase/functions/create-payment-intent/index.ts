// Supabase Edge Function: create-payment-intent
// This function creates a Stripe PaymentIntent and saves booking data to the database
// Enterprise-grade security implementation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  validateAmount,
  validateEmail,
  validatePhone,
  validatePostcode,
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
        headers: {
          ...getCorsHeaders(req.headers.get('origin')),
          'Content-Type': 'application/json',
        },
      }
    )
  }

  // Comprehensive security validation
  const validation = await validateRequest(req, {
    requireBody: true,
    rateLimitType: 'payment',
    maxPayloadSize: 1024 * 1024, // 1MB for payment requests
  })

  if (!validation.valid) {
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
    // Log: pagamento iniciado
    const bodyForLog = validation.body as { amount?: number; currency?: string }
    const amountPence = typeof bodyForLog?.amount === 'number' ? bodyForLog.amount : 0
    const currencyLog = bodyForLog?.currency || 'gbp'
    console.log('[create-payment-intent] invoked', {
      amount_pence: amountPence,
      amount_gbp: (amountPence / 100).toFixed(2),
      currency: currencyLog,
      ip: validation.clientIP,
      ts: new Date().toISOString(),
    })

    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey) {
      logSecurityEvent('missing_stripe_key', { ip: validation.clientIP }, 'critical')
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }

    const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)
    if (!envCheck.valid) {
      logSecurityEvent('invalid_supabase_config', { ip: validation.clientIP, error: envCheck.error }, 'critical')
      return new Response(
        JSON.stringify({ error: envCheck.error }),
        {
          status: 500,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
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

    // Parse and validate request body (metadata values can be string or boolean from client)
    const body = validation.body as {
      amount?: number | string
      currency?: string
      metadata?: Record<string, string | boolean>
      customer_email?: string
      booking_data?: Record<string, unknown>
      add_subscription?: string | boolean
      coupon_code?: string
    }

    // Validate amount
    const amountValidation = validateAmount(body.amount)
    if (!amountValidation.valid) {
      logSecurityEvent('invalid_amount', {
        ip: validation.clientIP,
        amount: body.amount,
      }, 'medium')
      
      return new Response(
        JSON.stringify({ error: amountValidation.error }),
        {
          status: 400,
          headers: {
            ...validation.headers,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Frontend sends amount in pence (GBP); do not multiply by 100
    const amountInPence = Math.round(Number(amountValidation.value))

    // Optional coupon: validate and compute discount (server-side)
    let finalAmountPence = amountInPence
    let couponCodeForMetadata: string | null = null
    const rawCouponCode = typeof body.coupon_code === 'string' ? body.coupon_code.trim().toUpperCase() : ''
    if (rawCouponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('id, code, discount_type, discount_value, valid_from, valid_until, max_uses, uses_count, min_order_pence')
        .ilike('code', rawCouponCode)
        .limit(1)
        .maybeSingle()

      const now = new Date()
      const valid =
        coupon &&
        (coupon.valid_from == null || now >= new Date(coupon.valid_from)) &&
        (coupon.valid_until == null || now <= new Date(coupon.valid_until)) &&
        (coupon.max_uses == null || (coupon.uses_count ?? 0) < coupon.max_uses) &&
        (coupon.min_order_pence == null || amountInPence >= coupon.min_order_pence)

      if (valid && coupon) {
        let discountPence: number
        if (coupon.discount_type === 'percent') {
          const pct = Math.min(100, Math.max(0, Number(coupon.discount_value)))
          discountPence = Math.round((amountInPence * pct) / 100)
        } else {
          discountPence = Math.round(Number(coupon.discount_value) * 100)
        }
        const cappedDiscount = Math.min(discountPence, amountInPence - 50) // Stripe min 50p
        finalAmountPence = Math.max(50, amountInPence - Math.max(0, cappedDiscount))
        couponCodeForMetadata = coupon.code
      }
    }

    // Validate currency
    const currency = (body.currency || 'gbp').toLowerCase()
    const allowedCurrencies = ['gbp', 'usd', 'eur']
    if (!allowedCurrencies.includes(currency)) {
      logSecurityEvent('invalid_currency', {
        ip: validation.clientIP,
        currency,
      }, 'medium')
      
      return new Response(
        JSON.stringify({ error: 'Invalid currency. Allowed: GBP, USD, EUR' }),
        {
          status: 400,
          headers: {
            ...validation.headers,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Validate and sanitize email if provided
    let customerEmail: string | undefined
    if (body.customer_email) {
      const emailValidation = validateEmail(body.customer_email)
      if (!emailValidation.valid) {
        return new Response(
          JSON.stringify({ error: emailValidation.error }),
          {
            status: 400,
            headers: {
              ...validation.headers,
              'Content-Type': 'application/json',
            },
          }
        )
      }
      customerEmail = emailValidation.sanitized
    }

    // Sanitize metadata (Stripe metadata values must be strings; accept string or boolean from client)
    const metadata: Record<string, string> = {}
    if (body.metadata) {
      for (const [key, value] of Object.entries(body.metadata)) {
        if (key.length >= 100) continue
        const strVal = value === true ? 'true' : value === false ? 'false' : typeof value === 'string' ? value : null
        if (strVal !== null && strVal.length < 500) {
          metadata[sanitizeString(key, 100)] = sanitizeString(strVal, 500)
        }
      }
    }

    // Prefer top-level body.add_subscription so frontend can guarantee it is received
    const rawAddSub = body.add_subscription ?? body.metadata?.add_subscription ?? (body.booking_data as Record<string, unknown>)?.add_subscription
    const addSubscription = rawAddSub === true || rawAddSub === 'true'
    console.log('[create-payment-intent] request', {
      add_subscription: addSubscription,
      raw_add_subscription: rawAddSub,
      has_customer_email: !!customerEmail,
      ts: new Date().toISOString(),
    })
    if (addSubscription && !customerEmail) {
      // Fallback: use email from metadata or booking_data so we don't miss it
      const fromMeta = body.metadata && typeof (body.metadata as Record<string, unknown>).customer_email === 'string'
        ? (body.metadata as Record<string, unknown>).customer_email as string
        : undefined
      const fromBooking = body.booking_data && typeof (body.booking_data as Record<string, unknown>).customer_email === 'string'
        ? (body.booking_data as Record<string, unknown>).customer_email as string
        : undefined
      const rawEmail = customerEmail || fromMeta || fromBooking
      if (rawEmail) {
        const emailValidation = validateEmail(rawEmail)
        if (emailValidation.valid) customerEmail = emailValidation.sanitized
      }
    }
    if (addSubscription && !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Email is required when adding a subscription.' }),
        {
          status: 400,
          headers: {
            ...validation.headers,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    let stripeCustomerId: string | undefined
    if (addSubscription && customerEmail) {
      try {
        const existing = await stripe.customers.list({ email: customerEmail, limit: 1 })
        if (existing.data.length > 0 && !existing.data[0].deleted) {
          stripeCustomerId = existing.data[0].id
        } else {
          const customerName = (body.booking_data as Record<string, unknown>)?.customer_name
          const name = typeof customerName === 'string' ? customerName.trim().slice(0, 200) : undefined
          const newCustomer = await stripe.customers.create({
            email: customerEmail,
            name: name || undefined,
            metadata: { source: 'website', created_via: 'create_payment_intent_subscription' },
          })
          stripeCustomerId = newCustomer.id
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        logSecurityEvent('stripe_customer_create_failed', { email: customerEmail, error: errMsg, ip: validation.clientIP }, 'high')
        return new Response(
          JSON.stringify({
            error: 'Unable to set up subscription. Please try again or use checkout without subscription.',
          }),
          {
            status: 502,
            headers: {
              ...validation.headers,
              'Content-Type': 'application/json',
            },
          }
        )
      }
    }

    // CRITICAL: Get and validate email from booking_data if available (required for booking creation)
    // This ensures we always have a valid email before creating PaymentIntent
    let emailForMetadata: string | null = customerEmail || null
    let phoneForMetadata: string | null = null
    
    if (body.booking_data) {
      const bookingData = body.booking_data as Record<string, unknown>
      
      // Validate email
      if (bookingData.customer_email && typeof bookingData.customer_email === 'string') {
        const emailVal = validateEmail(bookingData.customer_email)
        if (emailVal.valid && emailVal.sanitized) {
          emailForMetadata = emailVal.sanitized
        }
      }
      
      // Validate phone (optional but should be in metadata if provided)
      if (bookingData.customer_phone && typeof bookingData.customer_phone === 'string') {
        const phoneVal = validatePhone(bookingData.customer_phone)
        if (phoneVal.valid && phoneVal.sanitized) {
          phoneForMetadata = phoneVal.sanitized
        }
      }
    }
    
    // CRITICAL: If we have booking_data, we MUST have a valid email - fail early before creating PaymentIntent
    if (body.booking_data && !emailForMetadata) {
      logSecurityEvent('payment_intent_blocked_no_email', {
        ip: validation.clientIP,
        has_booking_data: true,
        has_top_level_email: !!customerEmail,
        has_booking_data_email: !!(body.booking_data as Record<string, unknown>)?.customer_email,
      }, 'critical')
      return new Response(
        JSON.stringify({
          error: 'Valid email address is required to complete booking. Please provide a valid email address.',
        }),
        {
          status: 400,
          headers: {
            ...validation.headers,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Create PaymentIntent with sanitized data
    // When add_subscription=true: customer + setup_future_usage so Stripe saves card to customer after payment; card only (no Klarna for subscriptions)
    const paymentIntentConfig: {
      amount: number
      currency: string
      payment_method_types: string[]
      metadata: Record<string, string>
      receipt_email?: string
      customer?: string
      setup_future_usage?: 'off_session' | 'on_session'
      shipping?: {
        name: string
        address: {
          line1?: string
          line2?: string | null
          city?: string | null
          postal_code?: string
          country: string
        }
      }
      [key: string]: unknown
    } = {
      amount: finalAmountPence,
      currency: currency,
      payment_method_types: addSubscription ? ['card'] : ['card', 'klarna'],
      metadata: {
        ...metadata,
        created_via: 'supabase_edge_function',
        timestamp: new Date().toISOString(),
        client_ip: validation.clientIP || 'unknown',
        // CRITICAL: Always include customer_email and customer_phone in metadata so webhook can recover them
        ...(emailForMetadata && { customer_email: emailForMetadata }),
        ...(phoneForMetadata && { customer_phone: phoneForMetadata }),
        ...(couponCodeForMetadata && { coupon_code: couponCodeForMetadata }),
      },
      ...(emailForMetadata && { receipt_email: emailForMetadata }),
      ...(stripeCustomerId && { customer: stripeCustomerId }),
      ...(addSubscription && stripeCustomerId && { setup_future_usage: 'off_session' as const }),
    }

    // Add shipping info if available (helps Klarna work inline)
    if (body.booking_data) {
      const bookingData = body.booking_data as Record<string, unknown>
      const customerName = bookingData.customer_name && typeof bookingData.customer_name === 'string'
        ? bookingData.customer_name
        : 'Customer'
      const addressLine1 = bookingData.address_line1 && typeof bookingData.address_line1 === 'string'
        ? bookingData.address_line1
        : null
      const city = bookingData.city && typeof bookingData.city === 'string'
        ? bookingData.city
        : null
      const postcode = bookingData.postcode && typeof bookingData.postcode === 'string'
        ? bookingData.postcode
        : null

      if (addressLine1 && postcode) {
        paymentIntentConfig.shipping = {
          name: customerName,
          address: {
            line1: addressLine1,
            line2: bookingData.address_line2 && typeof bookingData.address_line2 === 'string'
              ? bookingData.address_line2
              : null,
            city: city || null,
            postal_code: postcode,
            country: 'GB', // Default to GB, adjust if needed
          },
        }
      }
    }

    // When add_subscription was requested we must have attached a Customer (enforced above)
    if (addSubscription && !stripeCustomerId) {
      logSecurityEvent('subscription_without_customer_blocked', { ip: validation.clientIP }, 'critical')
      return new Response(
        JSON.stringify({ error: 'Subscription requires a customer. Please try again.' }),
        {
          status: 500,
          headers: { ...validation.headers, 'Content-Type': 'application/json' },
        }
      )
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig)

    if (addSubscription) {
      console.log('[create-payment-intent] subscription checkout – customer attached', {
        payment_intent_id: paymentIntent.id,
        has_customer: !!stripeCustomerId,
        ts: new Date().toISOString(),
      })
    }

    logSecurityEvent('payment_intent_created', {
      payment_intent_id: paymentIntent.id,
      amount: finalAmountPence,
      currency,
      coupon: couponCodeForMetadata ?? undefined,
      ip: validation.clientIP,
    }, 'low')

    // Save booking data to database if provided (with validation)
    if (body.booking_data) {
      try {
        const bookingData = body.booking_data as Record<string, unknown>
        
        // Use emailForMetadata which was already validated before PaymentIntent creation
        // This ensures consistency - same email used in PaymentIntent metadata and booking
        const customerEmailForBooking = emailForMetadata
        
        // This should never happen because we validate email before creating PaymentIntent,
        // but add safety check just in case
        if (!customerEmailForBooking) {
          logSecurityEvent('booking_creation_blocked_no_email_after_pi', {
            payment_intent_id: paymentIntent.id,
            ip: validation.clientIP,
          }, 'critical')
          // PaymentIntent already created, but we can't create booking - this is a critical error
          // Return error but PaymentIntent exists - webhook will handle fallback
          return new Response(
            JSON.stringify({
              error: 'Failed to save booking information. Please contact support with PaymentIntent ID: ' + paymentIntent.id,
            }),
            {
              status: 500,
              headers: {
                ...validation.headers,
                'Content-Type': 'application/json',
              },
            }
          )
        }

        // Use phoneForMetadata which was already validated before PaymentIntent creation
        // This ensures consistency - same phone used in PaymentIntent metadata and booking
        const customerPhone = phoneForMetadata

        // Validate postcode
        let postcode = 'Unknown'
        if (bookingData.postcode && typeof bookingData.postcode === 'string') {
          const postcodeVal = validatePostcode(bookingData.postcode)
          if (postcodeVal.valid && postcodeVal.sanitized) {
            postcode = postcodeVal.sanitized
          }
        }

        // Parse preferred_dates from array of ISO strings to array of date strings
        let preferredDates: string[] | null = null
        if (bookingData.scheduled_dates && Array.isArray(bookingData.scheduled_dates)) {
          preferredDates = bookingData.scheduled_dates
            .filter((d): d is string => typeof d === 'string')
            .slice(0, 10) // Limit to 10 dates
        }

        // service_id in DB is UUID; only set if value is a valid UUID (e.g. from services_v2). Slug strings like "painting" must be null.
        const rawServiceId = bookingData.service_id && typeof bookingData.service_id === 'string' ? bookingData.service_id.trim() : null
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        const serviceIdForDb = rawServiceId && uuidRegex.test(rawServiceId) ? rawServiceId : null

        // Sanitize all string fields
        const bookingRecord = {
          stripe_payment_intent_id: paymentIntent.id,
          status: 'pending',
          payment_status: 'pending',
          amount: finalAmountPence / 100, // Convert to pounds
          currency: currency,
          customer_name: bookingData.customer_name && typeof bookingData.customer_name === 'string'
            ? sanitizeString(bookingData.customer_name, 200)
            : 'Unknown',
          customer_email: customerEmailForBooking,
          customer_phone: customerPhone,
          address_line1: bookingData.address_line1 && typeof bookingData.address_line1 === 'string'
            ? sanitizeString(bookingData.address_line1, 200)
            : null,
          address_line2: bookingData.address_line2 && typeof bookingData.address_line2 === 'string'
            ? sanitizeString(bookingData.address_line2, 200)
            : null,
          city: bookingData.city && typeof bookingData.city === 'string'
            ? sanitizeString(bookingData.city, 100)
            : null,
          postcode: postcode,
          service_id: serviceIdForDb,
          service_name: bookingData.service_name && typeof bookingData.service_name === 'string'
            ? sanitizeString(bookingData.service_name, 200)
            : 'Service',
          service_category: bookingData.service_category && typeof bookingData.service_category === 'string'
            ? sanitizeString(bookingData.service_category, 100)
            : null,
          job_description: bookingData.job_description && typeof bookingData.job_description === 'string'
            ? sanitizeString(bookingData.job_description, 5000)
            : null,
          preferred_dates: preferredDates,
          preferred_time_slots: Array.isArray(bookingData.scheduled_time_slots)
            ? bookingData.scheduled_time_slots.slice(0, 10).filter((s): s is string => typeof s === 'string')
            : [],
          property_type: bookingData.property_type && typeof bookingData.property_type === 'string'
            ? sanitizeString(bookingData.property_type, 50)
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
          metadata: metadata,
        }

        const { data: insertedBooking, error: insertError } = await supabase
          .from('booking_website')
          .insert(bookingRecord)
          .select('id, booking_ref')
          .single()

        if (insertError) {
          const errorMsg = insertError.message || JSON.stringify(insertError)
          logSecurityEvent('booking_insert_error', {
            payment_intent_id: paymentIntent.id,
            error: errorMsg,
            error_code: (insertError as { code?: string })?.code,
            customer_email: customerEmailForBooking,
            ip: validation.clientIP,
          }, 'critical')
          
          // CRITICAL: Fail the request if booking insert fails - PaymentIntent should not exist without booking
          // This ensures webhook can always find the booking
          console.error(`CRITICAL: Failed to create booking for PaymentIntent ${paymentIntent.id}:`, errorMsg)
          return new Response(
            JSON.stringify({
              error: 'Failed to save booking information. Payment was not processed. Please try again.',
              details: (typeof import.meta !== 'undefined' && import.meta?.env?.DEV) ? errorMsg : undefined,
            }),
            {
              status: 500,
              headers: {
                ...validation.headers,
                'Content-Type': 'application/json',
              },
            }
          )
        } else {
          logSecurityEvent('booking_created', {
            booking_ref: insertedBooking.booking_ref,
            payment_intent_id: paymentIntent.id,
            customer_email: customerEmailForBooking,
            ip: validation.clientIP,
          }, 'low')
          console.log(`Booking created successfully: ${insertedBooking.booking_ref} for PaymentIntent ${paymentIntent.id}`)
        }
      } catch (dbError) {
        const errorMsg = dbError instanceof Error ? dbError.message : 'Unknown database error'
        logSecurityEvent('database_error', {
          payment_intent_id: paymentIntent.id,
          error: errorMsg,
          ip: validation.clientIP,
        }, 'critical')
        
        // CRITICAL: Fail the request if database error occurs
        console.error(`CRITICAL: Database error creating booking for PaymentIntent ${paymentIntent.id}:`, errorMsg)
        return new Response(
          JSON.stringify({
            error: 'Failed to save booking information. Payment was not processed. Please try again.',
            details: (typeof import.meta !== 'undefined' && import.meta?.env?.DEV) ? errorMsg : undefined,
          }),
          {
            status: 500,
            headers: {
              ...validation.headers,
              'Content-Type': 'application/json',
            },
          }
        )
      }
    }

    // Log: pagamento criado com sucesso (antes de devolver resposta)
    console.log('[create-payment-intent] success', {
      payment_intent_id: paymentIntent.id,
      amount_pence: paymentIntent.amount,
      currency: paymentIntent.currency,
      ts: new Date().toISOString(),
    })

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
        headers: {
          ...validation.headers,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    logSecurityEvent('payment_intent_error', {
      error: errorMessage,
      ip: validation.clientIP,
      url: req.url,
    }, 'high')

    // Handle Stripe-specific errors
    if (error && typeof error === 'object' && 'type' in error && error.type === 'StripeCardError') {
      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: 400,
          headers: {
            ...validation.headers,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Handle other errors (don't expose internal details)
    return new Response(
      JSON.stringify({
        error: 'Failed to create payment intent. Please try again.',
      }),
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
