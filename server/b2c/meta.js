/**
 * Compra paga vai à Meta também pelo servidor (Conversions API), com o mesmo
 * event_id do Pixel (`Purchase-<ref>`) para a Meta contar uma vez só. Cobre o
 * que o navegador perde: bloqueador de anúncio, aba fechada depois de pagar,
 * volta do Klarna. Só para quem aceitou cookies de marketing no site: o sim
 * viaja na metadata da Stripe (`mc`), gravada quando a cobrança nasce, e sem
 * ele nada sai daqui. Sem META_CAPI_TOKEN, nada sai também.
 */
import { createHash } from 'node:crypto'

const GRAPH = 'https://graph.facebook.com/v23.0'
const FB_ID_RE = /^fb\.\d\.\d{10,13}\.[\w.-]{1,190}$/

const sha = (v) => createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex')
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** 07700 900123 → 447700900123 (formato E.164 sem o +, que a Meta pede). */
function ukPhone(raw = '') {
  const d = String(raw).replace(/\D/g, '')
  if (d.startsWith('44')) return d
  if (d.startsWith('0')) return `44${d.slice(1)}`
  return d
}

/** Primeiro IP do x-forwarded-for (quem pagou), não o do proxy da Vercel. */
export function clientIp(req) {
  const fwd = String(req?.headers?.['x-forwarded-for'] || '').split(',')[0].trim()
  return fwd || req?.socket?.remoteAddress || ''
}

/**
 * Chaves extras da metadata da Stripe quando há o sim de marketing. Sem o sim,
 * objeto vazio: nem o IP nem o navegador ficam guardados.
 */
export function adMetadata(ad, request = {}) {
  if (!ad || ad.consent !== true) return {}
  const out = { mc: '1' }
  const fbp = str(ad.fbp, 200)
  const fbc = str(ad.fbc, 200)
  if (FB_ID_RE.test(fbp)) out.fbp = fbp
  if (FB_ID_RE.test(fbc)) out.fbc = fbc
  const ip = str(request.ip, 64)
  const ua = str(request.userAgent, 490)
  if (ip) out.cip = ip
  if (ua) out.cua = ua
  return out
}

/**
 * Manda o Purchase. Nunca derruba a reserva: erro só vai para o log.
 * Devolve 'sent', 'skipped' ou 'failed' (para o log de quem chamou).
 */
export async function sendPurchase(env, { metadata = {}, ref, value, contact = {}, postcode = '' }) {
  if (metadata.mc !== '1') return 'skipped'
  if (!env.metaCapiToken || !env.metaPixelId) {
    console.error('[b2c/meta] META_CAPI_TOKEN not set: Purchase not sent for', ref)
    return 'skipped'
  }
  const user = {
    em: contact.email ? [sha(contact.email)] : undefined,
    ph: contact.phone ? [sha(ukPhone(contact.phone))] : undefined,
    fn: contact.firstName ? [sha(contact.firstName)] : undefined,
    ln: contact.lastName ? [sha(contact.lastName)] : undefined,
    zp: postcode ? [sha(String(postcode).replace(/\s/g, ''))] : undefined,
    ct: [sha('london')],
    country: [sha('gb')],
    client_ip_address: metadata.cip || undefined,
    client_user_agent: metadata.cua || undefined,
    fbp: metadata.fbp || undefined,
    fbc: metadata.fbc || undefined,
  }
  const body = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: `Purchase-${ref}`,
        action_source: 'website',
        event_source_url: `${env.siteUrl}/book/confirmed`,
        user_data: user,
        custom_data: { value, currency: 'GBP', order_id: ref },
      },
    ],
    ...(env.metaTestEventCode ? { test_event_code: env.metaTestEventCode } : {}),
  }
  try {
    const res = await fetch(`${GRAPH}/${env.metaPixelId}/events?access_token=${encodeURIComponent(env.metaCapiToken)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error('[b2c/meta] Purchase failed', ref, res.status, (await res.text()).slice(0, 300))
      return 'failed'
    }
    return 'sent'
  } catch (err) {
    console.error('[b2c/meta] Purchase failed', ref, err)
    return 'failed'
  }
}
