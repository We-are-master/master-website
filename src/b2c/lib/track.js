/**
 * Eventos do funil B2C e origem da visita.
 *
 * A origem (UTM, página de entrada, referrer) é guardada na primeira página
 * da sessão e viaja com a reserva até o job no OS: sem isso não dá para
 * medir custo por job pago por canal, que é a régua do plano. Só é gravada
 * com o sim de "Analytics" no banner; até a resposta fica na memória da
 * página. O id de clique de anúncio (fbclid, gclid) é marketing: só com esse sim.
 */
import { CONSENT_EVENT, hasConsent, readConsent } from '../../lib/consent.js'

const KEY = 'fx_b2c_attr'
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref']
const CLICK_IDS = ['fbclid', 'gclid']

// Retrato da página de entrada, na memória até a resposta do banner.
let landing = null

function storage() {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

function read() {
  try {
    return JSON.parse(storage()?.getItem(KEY) || 'null')
  } catch {
    return null
  }
}

function write(value) {
  try {
    storage()?.setItem(KEY, JSON.stringify(value))
  } catch {
    /* sessão sem storage: segue sem origem */
  }
}

function snapshot() {
  const url = new URL(window.location.href)
  const found = {}
  for (const p of [...PARAMS, ...CLICK_IDS]) {
    const v = url.searchParams.get(p)
    if (v) found[p] = v.slice(0, 200)
  }
  found.landing = url.pathname
  if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
    found.referrer = document.referrer.slice(0, 300)
  }
  found.at = new Date().toISOString()
  return found
}

/** Sem o sim de marketing, os ids de clique ficam de fora. */
function withoutClicks(found) {
  if (hasConsent('marketing')) return found
  const out = { ...found }
  for (const p of CLICK_IDS) delete out[p]
  return out
}

function persist() {
  if (!landing || !hasConsent('analytics')) return
  const stored = read()
  if (!stored) return write(withoutClicks(landing))
  // A primeira página da sessão manda; o sim de marketing só acrescenta os ids de clique.
  if (hasConsent('marketing') && CLICK_IDS.some((p) => landing[p] && !stored[p])) {
    const clicks = Object.fromEntries(CLICK_IDS.filter((p) => landing[p]).map((p) => [p, landing[p]]))
    write({ ...stored, ...clicks })
  }
}

export function captureAttribution() {
  if (typeof window === 'undefined') return
  if (!landing) landing = snapshot()
  persist()
}

// Etiquetas de campanha do próprio link (utm_*, ref). Sem o sim de Analytics
// elas vão com a reserva direto da memória da página: nada é gravado no aparelho,
// então a lei de cookies não se aplica, e o job no OS sabe de qual anúncio veio.
const CAMPAIGN_TAGS = PARAMS

function campaignOnly(found) {
  const out = {}
  for (const p of CAMPAIGN_TAGS) if (found?.[p]) out[p] = found[p]
  return out
}

export function getAttribution() {
  if (typeof window === 'undefined') return {}
  if (!hasConsent('analytics')) return campaignOnly(landing)
  return withoutClicks(read() || landing || {})
}

// Reserva paga é Purchase (com valor): é nele que a Meta otimiza venda e mede ROAS.
const META_EVENTS = {
  price_viewed: 'ViewContent',
  booking_started: 'InitiateCheckout',
  payment_info_added: 'AddPaymentInfo',
  booking_confirmed: 'Purchase',
}

// Passos do meio da reserva, como eventos próprios da Meta: cada um vira uma
// conversão personalizada e uma coluna no Ads Manager, e dá para ver em qual
// passo a pessoa desiste. O passo 1 (Your job) é o InitiateCheckout.
const STEP_EVENTS = {
  2: 'BookingDetails',
  3: 'BookingDateAccess',
  4: 'BookingCheckout',
}

// Voltar e avançar de novo não conta duas vezes na mesma visita.
const stepsSent = new Set()

function metaEventFor(event, params) {
  if (event !== 'booking_step') return META_EVENTS[event] ? { name: META_EVENTS[event], custom: false } : null
  const name = STEP_EVENTS[params.step]
  if (!name || stepsSent.has(name)) return null
  stepsSent.add(name)
  return { name, custom: true }
}

// Evento que nasce antes da resposta do banner espera aqui: sai se o sim vier.
const pending = []

function sendMeta({ name, custom }, params) {
  const payload = params.value != null ? { value: params.value, currency: 'GBP' } : {}
  // Mesmo eventID para a mesma reserva: se a página de confirmação recarregar,
  // a Meta conta a compra uma vez só (e o servidor manda o mesmo id).
  const options = params.ref ? { eventID: `${name}-${params.ref}` } : undefined
  window.fbq(custom ? 'trackCustom' : 'track', name, payload, options)
}

if (typeof window !== 'undefined') {
  // Retrato na carga do módulo: o /book limpa a URL num efeito que roda antes
  // do efeito da moldura, e a UTM de quem cai direto na reserva se perdia.
  landing = snapshot()
  window.addEventListener(CONSENT_EVENT, (e) => {
    const prefs = e.detail || {}
    if (prefs.analytics) persist()
    const queued = pending.splice(0)
    if (prefs.marketing && typeof window.fbq === 'function') queued.forEach(([name, params]) => sendMeta(name, params))
  })
}

export function track(event, params = {}) {
  if (typeof window === 'undefined') return
  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: `b2c_${event}`, ...params })
    // O GA4 só existe com o sim de Analytics; sem o GTM, o dataLayer sozinho não chega nele.
    if (typeof window.gtag === 'function') window.gtag('event', `b2c_${event}`, params)
    const meta = metaEventFor(event, params)
    if (!meta) return
    if (typeof window.fbq === 'function') sendMeta(meta, params)
    else if (!readConsent() && pending.length < 20) pending.push([meta, params])
  } catch {
    /* analytics nunca derruba a página */
  }
}

function cookie(name) {
  const hit = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : ''
}

/**
 * O que vai com a reserva para o servidor mandar a compra à Meta (Conversions
 * API). Sem o sim de marketing, só `consent: false` e nada sai do servidor.
 */
export function adSignals() {
  if (typeof window === 'undefined' || !hasConsent('marketing')) return { consent: false }
  const attr = getAttribution()
  let fbc = cookie('_fbc')
  if (!fbc && attr.fbclid) fbc = `fb.1.${Date.parse(attr.at) || Date.now()}.${attr.fbclid}`
  return { consent: true, fbp: cookie('_fbp'), fbc }
}
