/**
 * Lead do primeiro passo da reserva: nome e e-mail de quem começou a reservar.
 *
 *   POST /api/b2c/lead → { name, email, services, kind, size, postcode, noOffers, attribution }
 *
 * Vira cliente no OS pela mesma porta dos leads do Checkatrade
 * (`/api/contacts/ingest`: acha pelo e-mail ou cria, e só enriquece), na
 * conta Fixfy. Quem desistir no meio entra no pós-venda do OS; quem pagar
 * depois cai no mesmo cliente, porque o job procura pelo e-mail na conta.
 *
 * "Don't email me offers" marcado vai como `marketing_opt_out` e vira a
 * etiqueta `no-marketing`, que o pós-venda respeita (recusa na coleta, como a
 * lei pede para ofertas a quem negociou uma compra).
 *
 * Só grava de verdade em produção (Vercel + modo live). Em dev e em teste
 * devolve `dryRun`: o OS local aponta para o banco de produção e um teste
 * de tela não pode virar lead.
 */
import { b2cServerEnv } from './env.js'
import { resolveFixfyAccountId } from './os.js'
import { normalizeSelection, serviceName } from '../../src/b2c/content/pricing.js'
import { postSiteLead } from './site-lead.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max).replace(/\0/g, '') : '')
const SERVICES = ['clean', 'paint', 'fix', 'cert']
const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'landing', 'referrer']

/** O que a pessoa estava reservando, em inglês, para a nota do cliente no OS. */
export function leadWanted(body) {
  const services = (Array.isArray(body.services) ? body.services : []).filter((s) => SERVICES.includes(s))
  if (!services.length) return 'nothing chosen yet'
  const sel = normalizeSelection({
    services,
    size: body.size,
    clean: { kind: body.kind },
  })
  const parts = services.map((s) => serviceName(s, sel))
  if (body.size) parts.push(`size ${str(body.size, 8)}`)
  return parts.join(', ')
}

/** Nota do cliente no OS. Linha datada: a mesma pessoa voltando em outro dia é um fato novo. */
export function leadNotes(body, today = new Date()) {
  const attribution = {}
  for (const k of ATTR_KEYS) {
    const v = str(body.attribution?.[k], 200)
    if (v) attribution[k] = v
  }
  return [
    `Website lead ${today.toISOString().slice(0, 10)}: started a booking at getfixfy.com and has not paid yet. Wanted: ${leadWanted(body)}.`,
    body.noOffers ? 'Asked for no offers by email.' : null,
    Object.keys(attribution).length ? `Source: ${JSON.stringify(attribution)}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

/** Origem limpa (só as chaves conhecidas), para o lead do OS. */
function cleanAttribution(body) {
  const out = {}
  for (const k of ATTR_KEYS) {
    const v = str(body.attribution?.[k], 200)
    if (v) out[k] = v
  }
  return out
}

/** Aviso de passo à aba Leads do OS (e-mails de retomada). */
function stepPayload(body, email, name, step) {
  const price = Number(body.price)
  return {
    event: 'step',
    email,
    name,
    phone: str(body.phone, 30) || null,
    postcode: str(body.postcode, 10) || null,
    step,
    selection: body.selection && typeof body.selection === 'object' ? body.selection : {},
    serviceLabel: str(body.serviceLabel, 120) || null,
    price: Number.isFinite(price) && price > 0 ? price : null,
    resumeUrl: /^https:\/\/(www\.)?getfixfy\.com\//.test(str(body.resumeUrl, 1000)) ? str(body.resumeUrl, 1000) : null,
    source: cleanAttribution(body),
    marketingOptOut: Boolean(body.noOffers),
  }
}

export async function handleLead(body = {}) {
  const env = b2cServerEnv()
  const name = str(body.name, 120)
  const email = str(body.email, 200).toLowerCase()
  // Robô: campo escondido preenchido, ou rápido demais. Responde 200 para não ensinar nada.
  if (str(body.website) || (Number(body.elapsedMs) > 0 && Number(body.elapsedMs) < 1500)) return { status: 200, data: { ok: true } }
  if (name.length < 2 || !EMAIL_RE.test(email)) return { status: 400, data: { error: 'Name and email are needed.' } }
  const step = Math.min(4, Math.max(1, Math.round(Number(body.step) || 1)))

  // A aba Leads do OS recebe todo passo. O cliente (contacts/ingest) nasce no 1 ou
  // no 2: quem digita e clica em Continue sem sair do campo pula o aviso do 1.
  const siteLead = await postSiteLead(stepPayload(body, email, name, step), env)
  if (step > 2) return { status: 200, data: { ok: true, step, siteLead: siteLead.ok !== false } }

  const live = env.mode === 'live' && process.env.VERCEL === '1'
  const key = env.osLeadKey || env.osKey
  const contact = {
    name,
    email,
    postcode: str(body.postcode, 10) || null,
    notes: leadNotes(body),
    marketing_opt_out: Boolean(body.noOffers),
  }
  if (!live || !key) {
    console.log('[b2c/lead] dry run', JSON.stringify({ ...contact, email: email.replace(/^(.).*@/, '$1***@') }))
    return { status: 200, data: { ok: true, dryRun: true } }
  }
  try {
    const accountId = await resolveFixfyAccountId(env)
    const res = await fetch(`${env.osUrl}/api/contacts/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
      body: JSON.stringify({ account_id: accountId, contacts: [contact] }),
    })
    if (!res.ok) {
      console.error('[b2c/lead] OS', res.status, (await res.text()).slice(0, 200))
      return { status: 200, data: { ok: false } }
    }
    const data = await res.json().catch(() => ({}))
    return { status: 200, data: { ok: true, action: data.results?.[0]?.action || null } }
  } catch (err) {
    // Lead é bônus: nunca vira erro para quem está reservando.
    console.error('[b2c/lead] failed', err?.message)
    return { status: 200, data: { ok: false } }
  }
}
