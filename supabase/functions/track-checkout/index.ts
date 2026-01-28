// Supabase Edge Function: track-checkout
// Tracks checkout abandonment and schedules recovery emails
// Enterprise-grade security implementation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  logSecurityEvent,
  getCorsHeaders,
  validateEmail,
  sanitizeString,
} from '../_shared/security.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  const validation = await validateRequest(req, {
    requireBody: true,
    rateLimitType: 'api',
  })

  if (!validation.valid) {
    logSecurityEvent('checkout_tracking_validation_failed', {
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await req.json()

    const { action, email, name, service, amount, clientSecret, paymentIntentId } = body

    if (action !== 'abandon') {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        {
          status: 400,
          headers: {
            ...validation.headers,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: {
            ...validation.headers,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid || !emailValidation.sanitized) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        {
          status: 400,
          headers: {
            ...validation.headers,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Check if checkout already tracked (avoid duplicates)
    const { data: existingCheckout } = await supabase
      .from('abandoned_checkouts')
      .select('id')
      .eq('email', emailValidation.sanitized)
      .eq('payment_intent_id', paymentIntentId || '')
      .eq('status', 'pending')
      .single()

    if (existingCheckout) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          checkoutId: existingCheckout.id,
          message: 'Checkout already tracked' 
        }),
        {
          status: 200,
          headers: {
            ...validation.headers,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Save abandoned checkout
    const { data: checkoutData, error: insertError } = await supabase
      .from('abandoned_checkouts')
      .insert({
        email: emailValidation.sanitized,
        customer_name: name ? sanitizeString(name, 200) : null,
        service_name: service ? sanitizeString(service, 200) : null,
        amount: amount || null,
        payment_intent_id: paymentIntentId || null,
        client_secret: clientSecret || null,
        status: 'pending',
        abandoned_at: new Date().toISOString(),
        email_1h_sent: false,
        email_24h_sent: false,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error saving abandoned checkout:', insertError)
      throw new Error('Failed to save checkout data')
    }

    logSecurityEvent('checkout_abandoned_tracked', {
      checkout_id: checkoutData.id,
      email: emailValidation.sanitized,
      ip: validation.clientIP,
    }, 'low')

    // Schedule recovery emails via pg_cron or external scheduler
    // For now, we'll rely on a scheduled function to check and send emails
    // This can be set up as a cron job that runs every hour

    return new Response(
      JSON.stringify({ 
        success: true, 
        checkoutId: checkoutData.id,
        message: 'Checkout tracked successfully' 
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
    
    logSecurityEvent('checkout_tracking_error', {
      error: errorMessage,
      ip: validation.clientIP,
    }, 'high')
    
    return new Response(
      JSON.stringify({ error: 'Failed to track checkout', details: errorMessage }),
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
