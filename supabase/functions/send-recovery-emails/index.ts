// Supabase Edge Function: send-recovery-emails
// Scheduled function to send recovery emails for abandoned checkouts
// Should be called every hour via cron job or Supabase pg_cron

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { getCorsHeaders } from '../_shared/cors.ts'
import { validateSupabaseEnv } from '../_shared/security.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)
    if (!envCheck.valid) {
      return new Response(
        JSON.stringify({ error: envCheck.error }),
        {
          status: 500,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Find checkouts that need 1h email
    const { data: checkouts1h, error: error1h } = await supabase
      .from('abandoned_checkouts')
      .select('*')
      .eq('status', 'pending')
      .eq('email_1h_sent', false)
      .lte('abandoned_at', oneHourAgo.toISOString())
      .gte('abandoned_at', twentyFourHoursAgo.toISOString())

    if (error1h) {
      console.error('Error fetching 1h checkouts:', error1h)
    } else if (checkouts1h && checkouts1h.length > 0) {
      // Send 1h emails
      for (const checkout of checkouts1h) {
        try {
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              template: 'cart_abandoned_1h',
              to: checkout.email,
              data: {
                name: checkout.customer_name || 'there',
              },
            }),
          })

          if (emailResponse.ok) {
            // Mark as sent
            await supabase
              .from('abandoned_checkouts')
              .update({ email_1h_sent: true })
              .eq('id', checkout.id)
          }
        } catch (err) {
          console.error(`Error sending 1h email for checkout ${checkout.id}:`, err)
        }
      }
    }

    // Find checkouts that need 24h email
    const { data: checkouts24h, error: error24h } = await supabase
      .from('abandoned_checkouts')
      .select('*')
      .eq('status', 'pending')
      .eq('email_24h_sent', false)
      .lte('abandoned_at', twentyFourHoursAgo.toISOString())

    if (error24h) {
      console.error('Error fetching 24h checkouts:', error24h)
    } else if (checkouts24h && checkouts24h.length > 0) {
      // Send 24h emails
      for (const checkout of checkouts24h) {
        try {
          const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              template: 'cart_abandoned_24h',
              to: checkout.email,
              data: {
                name: checkout.customer_name || 'there',
              },
            }),
          })

          if (emailResponse.ok) {
            // Mark as sent
            await supabase
              .from('abandoned_checkouts')
              .update({ email_24h_sent: true })
              .eq('id', checkout.id)
          }
        } catch (err) {
          console.error(`Error sending 24h email for checkout ${checkout.id}:`, err)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Recovery emails processed',
        sent_1h: checkouts1h?.length || 0,
        sent_24h: checkouts24h?.length || 0,
      }),
      {
        status: 200,
        headers: {
          ...getCorsHeaders(req.headers.get('origin')),
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in send-recovery-emails:', errorMessage)
    
    return new Response(
      JSON.stringify({ error: 'Failed to process recovery emails', details: errorMessage }),
      {
        status: 500,
        headers: {
          ...getCorsHeaders(req.headers.get('origin')),
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
