/**
 * Consentimento de cookies (PECR). Nada que rastreie roda antes da escolha:
 * o index.html só carrega Pixel, Google Analytics, Clarity, PageSense, GTM e
 * o chat da Zoho quando `window.fixfyConsent.apply` recebe o sim da categoria.
 * A escolha fica no localStorage (`cookieConsent`), lida também pelo
 * index.html para quem volta ao site.
 */

export const CONSENT_KEY = 'cookieConsent'
export const CONSENT_EVENT = 'fixfy:consent'
export const SETTINGS_EVENT = 'fixfy:cookie-settings'

export const NO_CONSENT = { necessary: true, analytics: false, marketing: false, functional: false }
export const ALL_CONSENT = { necessary: true, analytics: true, marketing: true, functional: true }

/** A escolha gravada, ou null se a pessoa ainda não respondeu o banner. */
export function readConsent() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(CONSENT_KEY) || 'null')
    return raw && typeof raw === 'object' ? { ...NO_CONSENT, ...raw, necessary: true } : null
  } catch {
    return null
  }
}

export const hasConsent = (category) => Boolean(readConsent()?.[category])

// Cookies que as ferramentas de cada categoria deixam: saem quando o sim é retirado.
const TRACKING_COOKIES = {
  marketing: [/^_fbp$/, /^_fbc$/, /^_gcl_/], // Meta Pixel e conversão do Google
  analytics: [/^_ga/, /^_gid$/, /^_clck$/, /^_clsk$/, /^CLID$/, /^MUID$/, /^zab/, /^zsc/, /^zft-/, /^zps-/, /^ps_/], // Google Analytics, Clarity, PageSense
  functional: [/_zldp$/, /_zldt$/, /^siq/], // Zoho SalesIQ
}

function expire(name) {
  const parts = window.location.hostname.split('.')
  const domains = ['']
  for (let i = 0; i < parts.length - 1; i += 1) {
    const d = parts.slice(i).join('.')
    domains.push(d, `.${d}`)
  }
  for (const d of domains) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ''}`
  }
}

export function clearTrackingCookies(categories = Object.keys(TRACKING_COOKIES)) {
  const patterns = categories.flatMap((c) => TRACKING_COOKIES[c] || [])
  document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((name) => patterns.some((rx) => rx.test(name)))
    .forEach(expire)
}

/**
 * Grava a escolha e liga o que ela permite. Retirar um sim que já valia
 * recarrega a página: script carregado não descarrega.
 */
export function saveConsent(next) {
  const prefs = { ...NO_CONSENT, ...next, necessary: true }
  const before = readConsent()
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs))
    window.localStorage.setItem('cookieConsentDate', new Date().toISOString())
  } catch {
    /* sem storage: a escolha vale só para esta página */
  }
  const withdrawn = ['analytics', 'marketing', 'functional'].filter((k) => before?.[k] && !prefs[k])
  if (withdrawn.length) {
    clearTrackingCookies(withdrawn)
    // Origem da visita do site B2C (src/b2c/lib/track.js): sem Analytics sai toda,
    // sem marketing saem os ids de clique de anúncio.
    try {
      const attr = JSON.parse(window.sessionStorage.getItem('fx_b2c_attr') || 'null')
      if (attr && !prefs.analytics) window.sessionStorage.removeItem('fx_b2c_attr')
      else if (attr && !prefs.marketing) {
        delete attr.fbclid
        delete attr.gclid
        window.sessionStorage.setItem('fx_b2c_attr', JSON.stringify(attr))
      }
    } catch {
      /* nada a apagar */
    }
    window.location.reload()
    return prefs
  }
  window.fixfyConsent?.apply(prefs)
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: prefs }))
  return prefs
}

/** "Cookie settings" no rodapé: reabre as preferências com a escolha atual. */
export function openCookieSettings() {
  window.dispatchEvent(new Event(SETTINGS_EVENT))
}
