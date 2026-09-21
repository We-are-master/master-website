/**
 * Eventos do funil B2C e origem da visita.
 *
 * A origem (UTM, fbclid, gclid) é guardada na primeira página da sessão e
 * viaja com a reserva até o job no OS: sem isso não dá para medir custo por
 * job pago por canal, que é a régua do plano.
 */

const KEY = 'fx_b2c_attr'
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ref']

function storage() {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function captureAttribution() {
  if (typeof window === 'undefined') return
  const store = storage()
  if (!store) return
  try {
    if (store.getItem(KEY)) return
    const url = new URL(window.location.href)
    const found = {}
    for (const p of PARAMS) {
      const v = url.searchParams.get(p)
      if (v) found[p] = v.slice(0, 200)
    }
    found.landing = url.pathname
    if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
      found.referrer = document.referrer.slice(0, 300)
    }
    found.at = new Date().toISOString()
    store.setItem(KEY, JSON.stringify(found))
  } catch {
    /* sessão sem storage: segue sem origem */
  }
}

export function getAttribution() {
  try {
    return JSON.parse(storage()?.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

// Reserva paga é Purchase (com valor): é nele que a Meta otimiza venda e mede ROAS.
const META_EVENTS = {
  price_viewed: 'ViewContent',
  booking_started: 'InitiateCheckout',
  payment_info_added: 'AddPaymentInfo',
  booking_confirmed: 'Purchase',
}

export function track(event, params = {}) {
  if (typeof window === 'undefined') return
  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: `b2c_${event}`, ...params })
    const metaName = META_EVENTS[event]
    if (metaName && typeof window.fbq === 'function') {
      const payload = params.value != null ? { value: params.value, currency: 'GBP' } : {}
      // Mesmo eventID para a mesma reserva: se a página de confirmação recarregar,
      // a Meta conta a compra uma vez só.
      const options = params.ref ? { eventID: `${metaName}-${params.ref}` } : undefined
      window.fbq('track', metaName, payload, options)
    }
  } catch {
    /* analytics nunca derruba a página */
  }
}
