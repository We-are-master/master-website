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

    // Parse and validate request body
    const body = validation.body as {
      amount?: number | string
      currency?: string
      metadata?: Record<string, string>
      customer_email?: string
      booking_data?: Record<string, unknown>
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

    // Sanitize metadata
    const metadata: Record<string, string> = {}
    if (body.metadata) {
      for (const [key, value] of Object.entries(body.metadata)) {
        if (typeof value === 'string' && key.length < 100 && value.length < 500) {
          metadata[sanitizeString(key, 100)] = sanitizeString(value, 500)
        }
      }
    }

    // Create PaymentIntent with sanitized data
    // Klarna enabled for testing - configured for inline/embedded checkout
    const paymentIntentConfig: {
      amount: number
      currency: string
      payment_method_types: string[]
      metadata: Record<string, string>
      receipt_email?: string
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
      [key: string]: unknown // Allow additional properties
    } = {
      amount: amountInPence,
      currency: currency,
      payment_method_types: ['card', 'klarna'],
      metadata: {
        ...metadata,
        created_via: 'supabase_edge_function',
        timestamp: new Date().toISOString(),
        client_ip: validation.clientIP || 'unknown',
      },
      ...(customerEmail && { receipt_email: customerEmail }),
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

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig)

    logSecurityEvent('payment_intent_created', {
      payment_intent_id: paymentIntent.id,
      amount: amountInPence,
      currency,
      ip: validation.clientIP,
    }, 'low')

    // Save booking data to database if provided (with validation)
    if (body.booking_data) {
      try {
        const bookingData = body.booking_data as Record<string, unknown>
        
        // Validate and sanitize booking data
        let customerEmailForBooking = customerEmail || 'unknown@email.com'
        if (bookingData.customer_email && typeof bookingData.customer_email === 'string') {
          const emailVal = validateEmail(bookingData.customer_email)
          if (emailVal.valid && emailVal.sanitized) {
            customerEmailForBooking = emailVal.sanitized
          }
        }

        // Validate phone if provided
        let customerPhone: string | null = null
        if (bookingData.customer_phone && typeof bookingData.customer_phone === 'string') {
          const phoneVal = validatePhone(bookingData.customer_phone)
          if (phoneVal.valid && phoneVal.sanitized) {
            customerPhone = phoneVal.sanitized
          }
        }

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

        // Sanitize all string fields
        const bookingRecord = {
          stripe_payment_intent_id: paymentIntent.id,
          status: 'pending',
          payment_status: 'pending',
          amount: amountInPence / 100, // Convert to pounds
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
          service_id: bookingData.service_id && typeof bookingData.service_id === 'string'
            ? sanitizeString(bookingData.service_id, 100)
            : null,
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
          logSecurityEvent('booking_insert_error', {
            payment_intent_id: paymentIntent.id,
            error: insertError.message,
            ip: validation.clientIP,
          }, 'medium')
          // Don't fail the whole request - payment intent was created successfully
        } else {
          logSecurityEvent('booking_created', {
            booking_ref: insertedBooking.booking_ref,
            payment_intent_id: paymentIntent.id,
            ip: validation.clientIP,
          }, 'low')
        }
      } catch (dbError) {
        logSecurityEvent('database_error', {
          payment_intent_id: paymentIntent.id,
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
          ip: validation.clientIP,
        }, 'high')
        // Don't fail the whole request - payment intent was created successfully
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
