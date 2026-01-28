// Supabase Edge Function: check-subscription
// Checks if a customer has an active Master Club subscription by email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  validateEmail,
  getCorsHeaders,
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
    const validation = validateRequest(req)
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error || 'Invalid request' }),
        {
          status: 400,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        {
          status: 500,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const body = await req.json()
    const { email } = body

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

    // Check for active subscription (website table)
    const { data: subscription, error } = await supabase
      .from('master_club_subscriptions_website')
      .select('*')
      .eq('customer_email', customerEmail.toLowerCase())
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !subscription) {
      return new Response(
        JSON.stringify({ 
          has_subscription: false 
        }),
        {
          status: 200,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        has_subscription: true,
        subscription_id: subscription.stripe_subscription_id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
      }),
      {
        status: 200,
        headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error checking subscription:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to check subscription. Please try again.',
        has_subscription: false 
      }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
      }
    )
  }
})
