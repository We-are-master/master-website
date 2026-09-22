/**
 * Cupom da reserva. O dono cria na Stripe: o cupom (Product catalogue →
 * Coupons: % ou valor em libra) e o código que o cliente digita (Promotion
 * codes, com limite de usos e validade se quiser). O site só lê os dois.
 *
 *   POST /api/b2c/promo → { code, selection }: confere antes de pagar
 *
 * A cobrança revalida o código, e o que foi aplicado viaja na metadata da
 * Stripe junto com a reserva: quem fecha a reserva usa o desconto gravado,
 * não uma nova consulta. O que a reserva do site não sabe honrar (cliente
 * específico, produto específico, primeira compra) é recusado inteiro.
 */
import { b2cServerEnv } from './env.js'
import { countPromoRedemptions, findPromotionCode } from './stripe.js'
import { MIN_CHARGE, applyPromo, formatGBP, priceSelection } from '../../src/b2c/content/pricing.js'

// A Stripe só aceita letras, números e hífen no código.
const CODE_RE = /^[A-Za-z0-9-]{2,40}$/
const UNAVAILABLE = 'Promo codes are not available right now. Please try again later.'
const nope = (error) => ({ ok: false, error })

/** Confere o código e devolve o preço com o desconto: { ok, promo, priced } ou { ok: false, error }. */
export async function resolvePromo(env, rawCode, priced) {
  const code = String(rawCode || '').trim()
  if (!CODE_RE.test(code)) return nope('That code is not valid.')
  if (!env.stripeSecretKey) return nope(UNAVAILABLE)
  let pc
  try {
    pc = await findPromotionCode(env, code)
  } catch (err) {
    // A chave restrita da Stripe precisa ler Coupons e Promotion codes; sem isso cai aqui.
    console.error('[b2c/promo] lookup failed', code, err?.message)
    return nope(UNAVAILABLE)
  }
  const coupon = pc?.promotion?.coupon
  if (!pc || !coupon || typeof coupon !== 'object' || !coupon.valid) return nope('That code is not valid or has expired.')
  if (pc.expires_at && pc.expires_at * 1000 < Date.now()) return nope('That code has expired.')
  const restricted =
    pc.customer ||
    pc.customer_account ||
    pc.restrictions?.first_time_transaction ||
    coupon.applies_to?.products?.length ||
    (coupon.amount_off && String(coupon.currency).toLowerCase() !== 'gbp')
  if (restricted || !(coupon.percent_off || coupon.amount_off)) return nope('That code cannot be used for online bookings.')
  const min = pc.restrictions?.minimum_amount
  if (min && String(pc.restrictions.minimum_amount_currency || 'gbp').toLowerCase() === 'gbp' && Math.round(priced.total * 100) < min) {
    return nope(`That code needs a booking of at least ${formatGBP(min / 100)}.`)
  }
  const limits = [pc.max_redemptions, coupon.max_redemptions].filter((n) => n > 0)
  if (limits.length) {
    let used
    try {
      used = await countPromoRedemptions(env, pc.id)
    } catch (err) {
      console.error('[b2c/promo] redemption count failed', code, err?.message)
      return nope(UNAVAILABLE)
    }
    if (used >= Math.min(...limits)) return nope('That code has already been used.')
  }
  const promo = { id: pc.id, code: pc.code, percentOff: coupon.percent_off || null, amountOff: coupon.amount_off ? coupon.amount_off / 100 : null }
  const withPromo = applyPromo(priced, promo)
  // 100% (ou quase) daria cobrança abaixo do mínimo da Stripe: reserva grátis não passa pelo site.
  if (withPromo.total < MIN_CHARGE) return nope('That code cannot be used on this booking.')
  return { ok: true, promo, priced: withPromo }
}

/** O código antes do pagamento, para o cliente ver o desconto no resumo. */
export async function handlePromo(body = {}) {
  const env = b2cServerEnv()
  if (!env.paymentsEnabled) return { status: 409, data: { error: UNAVAILABLE } }
  const priced = priceSelection(body.selection || {})
  if (priced.needsQuote || !(priced.total > 0)) return { status: 400, data: { error: 'Choose your job first, then add the code.' } }
  const r = await resolvePromo(env, body.code, priced)
  if (!r.ok) return { status: 400, data: { error: r.error } }
  const { code, percentOff, amountOff } = r.promo
  return { status: 200, data: { promo: { code, percentOff, amountOff }, discount: r.priced.discount, total: r.priced.total } }
}
