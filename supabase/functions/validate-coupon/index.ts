// Supabase Edge Function: validate-coupon
// Validates a discount code and returns the discount amount in pence (GBP).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { getCorsHeaders, validateSupabaseEnv } from '../_shared/security.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

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

    const body = await req.json().catch(() => ({}))
    const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : ''
    const orderTotalPence = typeof body?.order_total_pence === 'number' ? Math.round(body.order_total_pence) : 0

    if (!code) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Cupom inválido ou expirado.' }),
        {
          status: 200,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('id, code, discount_type, discount_value, valid_from, valid_until, max_uses, uses_count, min_order_pence')
      .ilike('code', code)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[validate-coupon] DB error:', error)
      return new Response(
        JSON.stringify({ valid: false, error: 'Cupom inválido ou expirado.' }),
        {
          status: 200,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    if (!coupon) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Cupom não encontrado.' }),
        {
          status: 200,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    const now = new Date()

    if (coupon.valid_from) {
      const from = new Date(coupon.valid_from)
      if (now < from) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Este cupom ainda não está válido.' }),
          {
            status: 200,
            headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
          }
        )
      }
    }

    if (coupon.valid_until) {
      const until = new Date(coupon.valid_until)
      if (now > until) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Este cupom expirou.' }),
          {
            status: 200,
            headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
          }
        )
      }
    }

    if (coupon.max_uses != null && (coupon.uses_count ?? 0) >= coupon.max_uses) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Este cupom atingiu o limite de uso.' }),
        {
          status: 200,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    const minOrder = coupon.min_order_pence ?? 0
    if (orderTotalPence > 0 && orderTotalPence < minOrder) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: `Pedido mínimo para este cupom: £${(minOrder / 100).toFixed(2)}.`,
        }),
        {
          status: 200,
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        }
      )
    }

    let discountPence: number
    if (coupon.discount_type === 'percent') {
      const pct = Math.min(100, Math.max(0, Number(coupon.discount_value)))
      discountPence = Math.round((orderTotalPence * pct) / 100)
    } else {
      // fixed: discount_value is in GBP
      discountPence = Math.round(Number(coupon.discount_value) * 100)
    }

    const finalDiscount = Math.max(0, Math.min(discountPence, orderTotalPence - 50)) // Stripe min 50p

    return new Response(
      JSON.stringify({
        valid: true,
        discount_pence: finalDiscount,
        code: coupon.code,
        label: coupon.discount_type === 'percent'
          ? `${coupon.discount_value}% off`
          : `£${Number(coupon.discount_value).toFixed(2)} off`,
      }),
      {
        status: 200,
        headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('[validate-coupon] Error:', err)
    return new Response(
      JSON.stringify({ valid: false, error: 'Não foi possível validar o cupom. Tente novamente.' }),
      {
        status: 200,
        headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
      }
    )
  }
})
