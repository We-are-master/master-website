// Supabase Edge Function: send-email
// Handles sending transactional emails with templates
// Enterprise-grade security implementation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  logSecurityEvent,
  getCorsHeaders,
  validateEmail,
  validateSupabaseEnv,
} from '../_shared/security.ts'
import { getEmailTemplate } from '../_shared/email-templates.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  const validation = await validateRequest(req, {
    requireBody: true,
    rateLimitType: 'api',
  })

  if (!validation.valid) {
    logSecurityEvent('email_validation_failed', {
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
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)
    if (!envCheck.valid) {
      return new Response(
        JSON.stringify({ error: envCheck.error }),
        {
          status: 500,
          headers: { ...validation.headers, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const body = await req.json()

    // Validate required fields
    const { template, to, data } = body

    if (!template || !to) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: template and to' }),
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
    const emailValidation = validateEmail(to)
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

    // Get email template
    const emailContent = getEmailTemplate(template, data || {})
    if (!emailContent) {
      return new Response(
        JSON.stringify({ error: `Template "${template}" not found` }),
        {
          status: 400,
          headers: {
            ...validation.headers,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Master <hello@wearemaster.com>',
        to: [emailValidation.sanitized],
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text()
      console.error('Resend API error:', errorData)
      throw new Error(`Failed to send email: ${resendResponse.statusText}`)
    }

    const resendData = await resendResponse.json()

    // Log email sent event
    logSecurityEvent('email_sent', {
      template,
      to: emailValidation.sanitized,
      email_id: resendData.id,
      ip: validation.clientIP,
    }, 'low')

    // Optionally save to database for tracking
    try {
      await supabase
        .from('email_logs')
        .insert({
          template,
          recipient_email: emailValidation.sanitized,
          subject: emailContent.subject,
          status: 'sent',
          external_id: resendData.id,
          sent_at: new Date().toISOString(),
        })
    } catch (dbError) {
      // Don't fail if logging fails
      console.warn('Failed to log email to database:', dbError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        email_id: resendData.id 
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
    
    logSecurityEvent('email_error', {
      error: errorMessage,
      ip: validation.clientIP,
    }, 'high')
    
    return new Response(
      JSON.stringify({ error: 'Failed to send email', details: errorMessage }),
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
