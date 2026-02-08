// Supabase Edge Function: save-hero-lead
// Saves hero form data (service, postcode, email) for remarketing

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  logSecurityEvent,
  getCorsHeaders,
  validateEmail,
  sanitizeString,
  validateSupabaseEnv,
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
    logSecurityEvent('hero_lead_validation_failed', {
      error: validation.error,
      ip: validation.clientIP,
    }, 'high')

    return new Response(JSON.stringify({ error: validation.error }), {
      status: validation.status || 400,
      headers: {
        ...validation.headers,
        'Content-Type': 'application/json',
      },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)
    if (!envCheck.valid) {
      return new Response(JSON.stringify({ error: envCheck.error }), {
        status: 500,
        headers: { ...validation.headers, 'Content-Type': 'application/json' },
      })
    }

    const body = (validation.body ?? {}) as Record<string, unknown>
    const { email, service, postcode, source } = body

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: { ...validation.headers, 'Content-Type': 'application/json' },
        }
      )
    }

    const emailValidation = validateEmail(email)
    if (!emailValidation.valid || !emailValidation.sanitized) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        {
          status: 400,
          headers: { ...validation.headers, 'Content-Type': 'application/json' },
        }
      )
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    const row = {
      email: emailValidation.sanitized,
      service: service ? sanitizeString(String(service), 500) : null,
      postcode: postcode ? sanitizeString(String(postcode).trim().toUpperCase(), 20) : null,
      source: source ? sanitizeString(String(source), 50) : 'hero_b2c',
    }

    const { error: insertError } = await supabase
      .from('hero_leads')
      .insert(row)

    if (insertError) {
      // Table might not exist yet; log but don't expose internal error
      logSecurityEvent('hero_lead_insert_error', {
        code: insertError.code,
        message: insertError.message,
        ip: validation.clientIP,
      }, 'medium')
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save. Please try again.' }),
        {
          status: 500,
          headers: { ...validation.headers, 'Content-Type': 'application/json' },
        }
      )
    }

    logSecurityEvent('hero_lead_saved', {
      email: emailValidation.sanitized,
      source: row.source,
      ip: validation.clientIP,
    }, 'low')

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...validation.headers, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logSecurityEvent('hero_lead_error', { error: errorMessage, ip: validation.clientIP }, 'high')
    return new Response(
      JSON.stringify({ error: 'Failed to save', details: errorMessage }),
      {
        status: 500,
        headers: { ...validation.headers, 'Content-Type': 'application/json' },
      }
    )
  }
})
