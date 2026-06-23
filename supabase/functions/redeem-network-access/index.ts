import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  validateEmail,
  validatePhone,
  sanitizeString,
  getCorsHeaders,
  validateSupabaseEnv,
} from '../_shared/security.ts'

function onboardingUrl(name: string, email: string, phone: string, business: string, trade?: string, trades?: string): string {
  const params = new URLSearchParams()
  if (name) params.set('name', name)
  if (email) params.set('email', email)
  if (phone) params.set('phone', phone)
  if (business) params.set('business', business)
  if (trade) params.set('trade', trade)
  if (trades) params.set('trades', trades)
  return `https://partners.getfixfy.com/?${params.toString()}`
}

function validAccessTokens(): Set<string> {
  const raw = Deno.env.get('NETWORK_ACCESS_TOKENS') || ''
  return new Set(
    raw.split(',').map((t) => t.trim()).filter(Boolean),
  )
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  const validation = await validateRequest(req, {
    requireBody: true,
    rateLimitType: 'payment',
    maxPayloadSize: 128 * 1024,
  })

  if (!validation.valid) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: validation.status || 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const headers = {
    ...validation.headers,
    'Content-Type': 'application/json',
  }

  try {
    const body = validation.body as Record<string, unknown>
    const accessToken = sanitizeString(String(body.accessToken || ''), 128)
    const plan = String(body.plan || 'annual')
    const lead = (body.lead || {}) as Record<string, unknown>
    const biz = (body.biz || {}) as Record<string, unknown>

    if (!accessToken || !validAccessTokens().has(accessToken)) {
      return new Response(JSON.stringify({ error: 'Invalid or expired access link' }), { status: 403, headers })
    }

    if (!['monthly', 'annual'].includes(plan)) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400, headers })
    }

    const emailVal = validateEmail(String(lead.email || ''))
    if (!emailVal.valid || !emailVal.sanitized) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), { status: 400, headers })
    }

    const name = sanitizeString(String(lead.name || ''), 120)
    if (!name) {
      return new Response(JSON.stringify({ error: 'Name required' }), { status: 400, headers })
    }

    const bizName = sanitizeString(String(biz.bizname || ''), 160)
    if (!bizName) {
      return new Response(JSON.stringify({ error: 'Business name required' }), { status: 400, headers })
    }

    const phoneRaw = String(lead.phone || '')
    const phoneVal = phoneRaw ? validatePhone(phoneRaw) : { valid: false, sanitized: '' }
    if (!phoneVal.valid || !phoneVal.sanitized) {
      return new Response(JSON.stringify({ error: 'Valid phone required' }), { status: 400, headers })
    }

    const tradesRaw = sanitizeString(String(biz.trades || biz.trade || ''), 120)
    const trade = tradesRaw
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)

    if (!envCheck.valid) {
      return new Response(JSON.stringify({ error: 'Service not configured' }), { status: 500, headers })
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const redirectUrl = onboardingUrl(
      name, emailVal.sanitized, phoneVal.sanitized, bizName,
      trade ? trade.split(',')[0] : undefined,
      trade || undefined,
    )

    const { data: signup, error: insertErr } = await supabase
      .from('network_signups')
      .insert({
        status: 'active',
        plan,
        payment_waived: true,
        access_token: accessToken,
        lead_name: name,
        lead_email: emailVal.sanitized,
        lead_phone: phoneVal.sanitized,
        biz_name: bizName,
        onboarding_redirect_url: redirectUrl,
      })
      .select('id')
      .single()

    if (insertErr) {
      console.error('[redeem-network-access] insert failed:', insertErr)
      return new Response(JSON.stringify({ error: 'Failed to save signup' }), { status: 500, headers })
    }

    return new Response(
      JSON.stringify({
        signupId: signup.id,
        onboardingUrl: redirectUrl,
        paymentWaived: true,
      }),
      { status: 200, headers },
    )
  } catch (err) {
    console.error('[redeem-network-access]', err)
    return new Response(JSON.stringify({ error: 'Could not redeem access link' }), { status: 500, headers })
  }
})
