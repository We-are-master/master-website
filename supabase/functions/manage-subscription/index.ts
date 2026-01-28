// Supabase Edge Function: manage-subscription
// Manages subscription actions: pause, cancel, resume, update payment method

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  validateEmail,
  logSecurityEvent,
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
      logSecurityEvent('invalid_request', { reason: validation.error }, 'medium')
      return new Response(
        JSON.stringify({ error: validation.error || 'Invalid request' }),
        {
          status: 400,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
      return new Response(
        JSON.stringify({ error: 'STRIPE_SECRET_KEY is not configured' }),
        {
          status: 500,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        {
          status: 500,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Stripe and Supabase
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-11-20.acacia' })
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const body = await req.json()
    const { action, email, subscription_id, payment_method_id } = body

    // Validate action
    const validActions = ['pause', 'cancel', 'resume', 'update_payment_method', 'get_subscription']
    if (!action || !validActions.includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be one of: ' + validActions.join(', ') }),
        {
          status: 400,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
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
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    const customerEmail = emailValidation.sanitized

    // Get subscription from database (website table)
    let subscriptionRecord
    if (subscription_id) {
      const { data, error } = await supabase
        .from('master_club_subscriptions_website')
        .select('*')
        .eq('stripe_subscription_id', subscription_id)
        .eq('customer_email', customerEmail.toLowerCase())
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Subscription not found' }),
          {
            status: 404,
            headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
          }
        )
      }
      subscriptionRecord = data
    } else {
      // Get by email (website table)
      const { data, error } = await supabase
        .from('master_club_subscriptions_website')
        .select('*')
        .eq('customer_email', customerEmail.toLowerCase())
        .in('status', ['active', 'trialing', 'past_due', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) {
        // For 'get_subscription' action, return empty result instead of error
        if (action === 'get_subscription') {
          return new Response(
            JSON.stringify({ 
              subscription_id: null,
              status: null,
              has_subscription: false
            }),
            {
              status: 200,
              headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
            }
          )
        }
        
        return new Response(
          JSON.stringify({ error: 'No active subscription found' }),
          {
            status: 404,
            headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
          }
        )
      }
      subscriptionRecord = data
    }

    // Get subscription from Stripe
    let subscription
    try {
      subscription = await stripe.subscriptions.retrieve(subscriptionRecord.stripe_subscription_id)
    } catch (stripeError) {
      console.error('Error retrieving subscription from Stripe:', stripeError)
      // If subscription doesn't exist in Stripe, return error
      return new Response(
        JSON.stringify({ error: 'Subscription not found in Stripe' }),
        {
          status: 404,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    let result

    switch (action) {
      case 'get_subscription':
        result = {
          subscription_id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          paused: subscriptionRecord.status === 'paused',
        }
        break

      case 'pause':
        // Pause subscription by canceling at period end (Stripe doesn't have native pause)
        // We'll mark it as paused in our DB and cancel at period end
        const pausedSubscription = await stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: true,
          metadata: {
            ...subscription.metadata,
            paused_by_user: 'true',
            paused_at: new Date().toISOString(),
          },
        })

        // Update database (website table)
        await supabase
          .from('master_club_subscriptions_website')
          .update({
            status: 'paused',
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        result = {
          subscription_id: pausedSubscription.id,
          status: 'paused',
          cancel_at_period_end: true,
          current_period_end: pausedSubscription.current_period_end,
        }
        break

      case 'resume':
        // Resume subscription by removing cancel_at_period_end
        const resumedSubscription = await stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: false,
          metadata: {
            ...subscription.metadata,
            paused_by_user: 'false',
            resumed_at: new Date().toISOString(),
          },
        })

        // Update database (website table)
        await supabase
          .from('master_club_subscriptions_website')
          .update({
            status: 'active',
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        result = {
          subscription_id: resumedSubscription.id,
          status: 'active',
          cancel_at_period_end: false,
        }
        break

      case 'cancel':
        // Cancel immediately
        const canceledSubscription = await stripe.subscriptions.cancel(subscription.id)

        // Update database (website table)
        await supabase
          .from('master_club_subscriptions_website')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        result = {
          subscription_id: canceledSubscription.id,
          status: 'canceled',
        }
        break

      case 'update_payment_method':
        if (!payment_method_id) {
          return new Response(
            JSON.stringify({ error: 'Payment method ID is required' }),
            {
              status: 400,
              headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
            }
          )
        }

        // Attach payment method to customer
        await stripe.paymentMethods.attach(payment_method_id, {
          customer: subscription.customer as string,
        })

        // Set as default payment method
        await stripe.customers.update(subscription.customer as string, {
          invoice_settings: {
            default_payment_method: payment_method_id,
          },
        })

        // Update subscription default payment method
        const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
          default_payment_method: payment_method_id,
        })

        result = {
          subscription_id: updatedSubscription.id,
          payment_method_updated: true,
        }
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
          }
        )
    }

    logSecurityEvent('subscription_managed', {
      action,
      subscription_id: subscription.id,
      email: customerEmail,
      ip: validation.clientIP,
    }, 'low')

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error managing subscription:', error)
    logSecurityEvent('subscription_management_error', {
      error: error.message,
    }, 'high')

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to manage subscription. Please try again.' 
      }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
      }
    )
  }
})
