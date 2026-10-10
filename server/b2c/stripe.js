/**
 * Pagamento pelo Stripe Checkout hospedado: o cliente paga na página da
 * Stripe (cartão, Apple Pay, Google Pay) e volta para a confirmação. Só
 * precisa da chave secreta: o formulário embutido pediria a publicável do
 * mesmo modo, que a gente não tem para a conta live.
 *
 * A reserva inteira viaja na metadata da sessão (a Stripe guarda, a gente
 * relê): quem finaliza (a página de volta ou o webhook) confia no que o
 * servidor gravou, nunca no navegador.
 */
import Stripe from 'stripe'

let client = null

function stripe(env) {
  if (!client) client = new Stripe(env.stripeSecretKey)
  return client
}

const CHUNK = 480
// A Stripe aceita 50 chaves de metadata: 38 pedaços + bn + as fixas (ref, source,
// collection_agent, promo_mode, promo, promo_id) + as 5 do anúncio = 50.
const MAX_CHUNKS = 38

export function packBooking(booking) {
  const json = JSON.stringify(booking)
  const parts = Math.ceil(json.length / CHUNK)
  if (parts > MAX_CHUNKS) throw new Error('Booking too large for Stripe metadata')
  const out = { bn: String(parts) }
  for (let i = 0; i < parts; i += 1) out[`b${i}`] = json.slice(i * CHUNK, (i + 1) * CHUNK)
  return out
}

export function unpackBooking(metadata = {}) {
  const parts = Number(metadata.bn || 0)
  if (!parts) return null
  let json = ''
  for (let i = 0; i < parts; i += 1) json += metadata[`b${i}`] || ''
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

const pence = (gbp) => Math.round(gbp * 100)

/**
 * Modelo de agente (06/10/2026): a Fixfy recebe o pagamento como agente do
 * profissional, que ainda não está escolhido na hora do checkout. A descrição
 * aparece no recibo da Stripe; quando o OS confirmar o profissional, ela vira
 * "Booking with {nome} via Fixfy · {ref}" no mesmo PaymentIntent.
 */
export const agentDescription = (ref, summary) =>
  `Fixfy booking ${ref} · ${summary} · received by GETFIXFY LTD as agent for an independent professional`

/** Texto acima do botão de pagar na página da Stripe (custom_text.submit). */
export const AGENT_SUBMIT_TEXT =
  'Your job is carried out by an independent professional, named in your booking confirmation before the visit. GETFIXFY LTD (Fixfy) receives this payment as their agent, and paying Fixfy counts as paying them. No Fixfy fee.'

/** Consentimento do cartão salvo (Fase 0): o restante é cobrado no fim do job. */
export function cardOnFileText(payLater) {
  const resto = typeof payLater === 'number' ? `the remaining £${payLater.toFixed(2)}` : 'the remaining balance'
  return `Your card is saved securely by Stripe and ${resto} is charged automatically when your job is completed and checked. Extra work or materials you approve, or a late-cancellation charge under our booking terms, may also be charged to this card.`
}

/** Metadata de todo pagamento do site: a Fixfy cobra como agente de pagamento. */
const AGENT_METADATA = { collection_agent: 'true' }

/**
 * Nome do desconto no Checkout e no recibo. A Stripe limita o nome do cupom a
 * 40 caracteres, então "on your behalf" fica na linha do resumo e do e-mail.
 */
export const PROMO_COUPON_NAME = 'Fixfy promotion, paid by Fixfy'

/**
 * A promoção entra como desconto da Stripe, com as linhas no preço cheio do
 * profissional (nunca linha mais barata). Cupom avulso, de uso único, com o
 * valor exato em pence e o nome que o cliente lê. Se a chave não puder criar
 * cupom (chave restrita sem escrita em Coupons), usa o próprio código
 * promocional do dono: aí a Stripe arredonda a porcentagem do jeito dela, e
 * quem fecha a reserva lê o desconto que ela aplicou (total_details).
 */
async function promotionDiscount(env, promotion) {
  if (!promotion || !(promotion.offPence > 0)) return null
  try {
    const coupon = await stripe(env).coupons.create({
      amount_off: promotion.offPence,
      currency: 'gbp',
      duration: 'once',
      max_redemptions: 1,
      name: PROMO_COUPON_NAME,
      metadata: { source: 'b2c-site', promo: promotion.code || '', promo_id: promotion.id || '' },
    })
    return { discounts: [{ coupon: coupon.id }], mode: 'coupon' }
  } catch (err) {
    console.error('[b2c/stripe] promotion coupon not created, using the promotion code instead', err?.message)
    if (!promotion.id) throw err
    return { discounts: [{ promotion_code: promotion.id }], mode: 'code' }
  }
}

export async function createCheckoutSession(
  env,
  { ref, lines, email, booking, baseUrl, summary, contextLine, suffix, promotion = null, extraMetadata = {}, saveCard = false, payLater = null },
) {
  const discount = await promotionDiscount(env, promotion)
  const session = await stripe(env).checkout.sessions.create({
    mode: 'payment',
    locale: 'en-GB',
    currency: 'gbp',
    customer_email: email,
    client_reference_id: ref,
    line_items: lines.map((l) => ({
      quantity: 1,
      price_data: {
        currency: 'gbp',
        unit_amount: pence(l.amount),
        product_data: { name: l.label, ...(l.detail ? { description: l.detail } : {}) },
      },
    })),
    ...(discount ? { discounts: discount.discounts } : {}),
    // Sinal com cartão salvo: a Stripe guarda o cartão e o OS cobra o restante no fim do job.
    ...(saveCard ? { customer_creation: 'always' } : {}),
    payment_intent_data: {
      description: agentDescription(ref, summary),
      receipt_email: email,
      statement_descriptor_suffix: suffix,
      metadata: { ref, source: 'b2c-site', ...AGENT_METADATA },
      ...(saveCard ? { setup_future_usage: 'off_session' } : {}),
    },
    custom_text: {
      submit: { message: saveCard ? `${AGENT_SUBMIT_TEXT} ${cardOnFileText(payLater)}`.slice(0, 1000) : AGENT_SUBMIT_TEXT },
      after_submit: { message: contextLine.slice(0, 1000) },
    },
    metadata: {
      ref,
      source: 'b2c-site',
      ...AGENT_METADATA,
      ...(discount ? { promo_mode: discount.mode } : {}),
      ...packBooking(booking),
      ...extraMetadata,
    },
    success_url: `${baseUrl}/book/confirmed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/book?step=4&cancelled=1`,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
  })
  return { url: session.url, id: session.id }
}

/**
 * Checkout transparente: a cobrança nasce aqui com o valor do servidor e a
 * reserva inteira na metadata; o navegador só confirma com o cartão.
 */
export async function createPaymentIntent(env, { ref, amount, email, booking, summary, suffix, extraMetadata = {} }) {
  const intent = await stripe(env).paymentIntents.create({
    amount: pence(amount),
    currency: 'gbp',
    automatic_payment_methods: { enabled: true },
    receipt_email: email,
    description: agentDescription(ref, summary),
    statement_descriptor_suffix: suffix,
    metadata: { ref, source: 'b2c-site', ...AGENT_METADATA, ...packBooking(booking), ...extraMetadata },
  })
  return { clientSecret: intent.client_secret, id: intent.id }
}

export async function retrievePaymentIntent(env, id) {
  return stripe(env).paymentIntents.retrieve(id)
}

export async function retrieveSession(env, id) {
  return stripe(env).checkout.sessions.retrieve(id, { expand: ['payment_intent'] })
}

/** Marca a cobrança como já reservada, para clique duplo e webhook não duplicarem job. */
export async function markBooked(env, paymentIntentId, jobs) {
  await stripe(env).paymentIntents.update(paymentIntentId, {
    metadata: { booked: '1', jobs: jobs.join(', ').slice(0, 480) },
  })
}

export function constructWebhookEvent(env, rawBody, signature) {
  return stripe(env).webhooks.constructEvent(rawBody, signature, env.webhookSecret)
}

/** O código que o cliente digitou (a Stripe não diferencia maiúsculas), já com o cupom. */
export async function findPromotionCode(env, code) {
  const list = await stripe(env).promotionCodes.list({ code, active: true, limit: 1, expand: ['data.promotion.coupon'] })
  return list.data[0] || null
}

/**
 * Reservas pagas com o código. O PaymentIntent não baixa o cupom na Stripe
 * (só o Checkout baixa), então o limite de usos é contado aqui. A busca da
 * Stripe leva até um minuto para enxergar um pagamento novo.
 */
export async function countPromoRedemptions(env, promoId) {
  if (!/^promo_[A-Za-z0-9]+$/.test(promoId)) return 0
  const found = await stripe(env).paymentIntents.search({ query: `status:'succeeded' AND metadata['promo_id']:'${promoId}'`, limit: 100 })
  return found.data.length
}
