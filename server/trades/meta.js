/**
 * Demo marcada no /for-trades vai à Meta pelo servidor (Conversions API) com o
 * mesmo event id do Pixel (`Schedule-<uid da reserva no Cal>`), para a Meta
 * contar uma vez só e não perder quem tem bloqueador de anúncio.
 *
 * Quem chama é o webhook BOOKING_CREATED do Cal.com. Só sai evento se a
 * reserva veio da página (`metadata.source = for-trades`) e se a pessoa deu o
 * sim de marketing (`metadata.mc = '1'`, gravado pelo navegador na reserva).
 * Sem META_CAPI_TOKEN, nada sai.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { loadLocalEnv } from '../growth/load-env.js'

const GRAPH = 'https://graph.facebook.com/v23.0'
const FB_ID_RE = /^fb\.\d\.\d{10,13}\.[\w.-]{1,190}$/
const SITE = 'https://getfixfy.com/for-trades'

const sha = (v) => createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex')

export function tradesEnv() {
  loadLocalEnv()
  return {
    calWebhookSecret: (process.env.CAL_WEBHOOK_SECRET || '').trim(),
    metaPixelId: (process.env.META_PIXEL_ID || '1555218078932742').trim(),
    metaCapiToken: (process.env.META_CAPI_TOKEN || '').trim(),
    metaTestEventCode: (process.env.META_TEST_EVENT_CODE || '').trim(),
  }
}

/** Cal assina o corpo cru com HMAC-SHA256 (hex) no header x-cal-signature-256. */
export function calSignatureOk(raw, signature, secret) {
  if (!secret || !signature) return false
  const want = Buffer.from(createHmac('sha256', secret).update(raw).digest('hex'))
  const got = Buffer.from(String(signature).trim())
  return want.length === got.length && timingSafeEqual(want, got)
}

/** Monta o evento Schedule a partir do payload do Cal, ou null se não é para sair. */
export function scheduleEvent(payload = {}, now = Date.now()) {
  const meta = payload.metadata || {}
  if (meta.source !== 'for-trades' || meta.mc !== '1' || !payload.uid) return null
  const who = (payload.attendees && payload.attendees[0]) || {}
  const resp = payload.responses || {}
  const val = (k) => (resp[k] && typeof resp[k] === 'object' ? resp[k].value : resp[k]) || ''
  const email = String(who.email || val('email') || '').trim()
  const phone = String(who.phoneNumber || val('attendeePhoneNumber') || '').replace(/\D/g, '')
  const parts = String(who.name || val('name') || '').trim().split(/\s+/).filter(Boolean)
  const fbp = FB_ID_RE.test(meta.fbp || '') ? meta.fbp : undefined
  const fbc = FB_ID_RE.test(meta.fbc || '') ? meta.fbc : undefined
  const trade = String(val('trade') || '').trim().slice(0, 80)
  return {
    event_name: 'Schedule',
    event_time: Math.floor(now / 1000),
    event_id: `Schedule-${payload.uid}`,
    action_source: 'website',
    event_source_url: SITE,
    user_data: {
      em: email ? [sha(email)] : undefined,
      ph: phone ? [sha(phone)] : undefined,
      fn: parts[0] ? [sha(parts[0])] : undefined,
      ln: parts.length > 1 ? [sha(parts[parts.length - 1])] : undefined,
      country: [sha('gb')],
      client_user_agent: typeof meta.cua === 'string' && meta.cua ? meta.cua.slice(0, 490) : undefined,
      fbp,
      fbc,
    },
    custom_data: { content_name: 'Fixfy for Trades demo', ...(trade ? { trade } : {}) },
  }
}

/** Manda para a Meta. Nunca lança: devolve 'sent', 'skipped' ou 'failed'. */
export async function sendToMeta(env, event) {
  if (!event) return 'skipped'
  if (!env.metaCapiToken || !env.metaPixelId) {
    console.error('[trades/meta] META_CAPI_TOKEN not set: Schedule not sent', event.event_id)
    return 'skipped'
  }
  const body = { data: [event], ...(env.metaTestEventCode ? { test_event_code: env.metaTestEventCode } : {}) }
  try {
    const res = await fetch(`${GRAPH}/${env.metaPixelId}/events?access_token=${encodeURIComponent(env.metaCapiToken)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error('[trades/meta] Schedule failed', event.event_id, res.status, (await res.text()).slice(0, 300))
      return 'failed'
    }
    return 'sent'
  } catch (err) {
    console.error('[trades/meta] Schedule failed', event.event_id, err)
    return 'failed'
  }
}
