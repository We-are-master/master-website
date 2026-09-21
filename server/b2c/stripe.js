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
const MAX_CHUNKS = 40

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

export async function createCheckoutSession(env, { ref, lines, email, booking, baseUrl, summary, contextLine, extraMetadata = {} }) {
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
    payment_intent_data: {
      description: `Fixfy ${summary} · ${ref}`,
      receipt_email: email,
      statement_descriptor_suffix: 'FIXFY',
      metadata: { ref, source: 'b2c-site' },
    },
    custom_text: { submit: { message: contextLine.slice(0, 1000) } },
    metadata: { ref, source: 'b2c-site', ...packBooking(booking), ...extraMetadata },
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
export async function createPaymentIntent(env, { ref, amount, email, booking, summary, extraMetadata = {} }) {
  const intent = await stripe(env).paymentIntents.create({
    amount: pence(amount),
    currency: 'gbp',
    automatic_payment_methods: { enabled: true },
    receipt_email: email,
    description: `Fixfy ${summary} · ${ref}`,
    statement_descriptor_suffix: 'FIXFY',
    metadata: { ref, source: 'b2c-site', ...packBooking(booking), ...extraMetadata },
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
