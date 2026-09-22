/**
 * Chamadas da reserva para o servidor do site (/api/b2c/*: funções da
 * Vercel em produção, middleware do Vite em dev).
 */

async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong. Please try again.')
    err.field = data.field
    err.status = res.status
    throw err
  }
  return data
}

let configPromise = null

/** O que está ligado neste ambiente: pagamento (Stripe) e envio ao OS. */
export function getBookingConfig() {
  if (!configPromise) {
    configPromise = fetch('/api/b2c/config')
      .then((r) => (r.ok ? r.json() : { mode: 'test', payments: false }))
      .catch(() => ({ mode: 'test', payments: false }))
  }
  return configPromise
}

/** Checkout transparente: valida a reserva e cria a cobrança ({ clientSecret, ref, total }). */
export function createPayment(payload) {
  return post('/api/b2c/payment', payload)
}

/** Valida a reserva no servidor e abre o Stripe Checkout: devolve { url, ref }. */
export function createCheckout(payload) {
  return post('/api/b2c/checkout', payload)
}

export function submitBooking(payload) {
  return post('/api/b2c/booking', payload)
}

/** Confere o cupom antes de pagar: { promo: { code, percentOff, amountOff }, discount, total }. */
export function checkPromo({ code, selection }) {
  return post('/api/b2c/promo', { code, selection })
}
