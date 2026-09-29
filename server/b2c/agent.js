/**
 * A porta do Harvey (vendedor da Fixfy no WhatsApp) para o que o site sabe:
 * catálogo, preço, datas e o link de pagamento. Ele nunca calcula preço
 * sozinho: pergunta aqui, que usa a mesma tabela e o mesmo checkout do site.
 *
 *   POST /api/b2c/agent  { action: "catalog" }
 *   POST /api/b2c/agent  { action: "quote", selection, postcode?, promoCode? }
 *   POST /api/b2c/agent  { action: "slots" }
 *   POST /api/b2c/agent  { action: "checkout", booking, deposit?, campaign? }
 *
 * Só com X-Agent-Key (a chave de lead do OS, a mesma que o site já usa para
 * falar com ele). O job nasce pelo caminho de sempre: pagou, o webhook da
 * Stripe cria o job no OS (pago ou com 50% de depósito) e manda a confirmação.
 */
import { timingSafeEqual } from 'node:crypto'
import { b2cServerEnv } from './env.js'
import { handleCheckout, handleBankBooking, depositOf } from './booking.js'
import { resolvePromo } from './promo.js'
import {
  CLEAN,
  CLEAN_KINDS,
  PAINT,
  FIX,
  CERT,
  PROPERTY_SIZES,
  priceSelection,
  normalizeSelection,
} from '../../src/b2c/content/pricing.js'
import { COVERED_AREAS, GOOGLE_REVIEWS, PROMISES, formatPostcode, looksLikePostcode, postcodeArea } from '../../src/b2c/content/site.js'
import { bookableDates, windowsFor } from '../../src/b2c/lib/slots.js'
import { capacidadeDoOs } from './capacity.js'
import { diasSemVaga } from '../../src/b2c/lib/capacity.js'

function keyOk(given, env) {
  const want = env.osLeadKey || env.osKey
  if (!want || typeof given !== 'string' || given.length !== want.length) return false
  return timingSafeEqual(Buffer.from(given), Buffer.from(want))
}

/** Tudo que ele vende, com preço, do jeito que o site vende. */
export function catalog() {
  return {
    currency: 'GBP',
    vatIncluded: true,
    sizes: PROPERTY_SIZES.map((s) => ({ id: s.id, label: s.label })),
    cleaning: {
      kinds: CLEAN_KINDS.map((k) => ({ id: k.id, name: k.name, forWhat: k.detail, prices: k.prices })),
      includedBathrooms: CLEAN.includedBathrooms,
      extraBathroomSteps: CLEAN.extraBathroomSteps,
      extras: CLEAN.extras.map((e) => ({ id: e.id, label: e.label, detail: e.detail, price: e.price, perRoom: e.unit === 'room' })),
      included: ['Oven', 'Cleaning products and equipment', 'VAT', 'A photo of every room when we finish'],
      teamOfTwoFromSize: CLEAN.teamOfTwoFromSize,
      fiveBedNote: '5+ bedrooms: priced from photos, pass to the team',
    },
    painting: {
      options: PAINT.options.map((o) => ({ id: o.id, label: o.label, detail: o.detail, price: o.price, perRoom: o.unit === 'room' })),
      materialsPack: { price: PAINT.materials.price, detail: PAINT.materials.detail },
    },
    handyman: {
      packages: FIX.packages.map((p) => ({ id: p.id, label: p.label, detail: p.detail, price: p.price })),
      tasks: FIX.tasks.map((t) => ({ id: t.id, label: t.label })),
      note: 'Tools included, no call-out fee. Materials are not included (customer supplies them, or we quote them separately).',
    },
    certificates: CERT.items.map((i) => ({ id: i.id, label: i.label, detail: i.detail, valid: i.valid, price: i.price ?? null, prices: i.prices ?? null })),
    coverage: { postcodeAreas: COVERED_AREAS, note: 'All of London' },
    promises: PROMISES,
    reviews: { google: { rating: GOOGLE_REVIEWS.rating, count: GOOGLE_REVIEWS.count, url: GOOGLE_REVIEWS.url } },
    access: { meet: 'Customer will be there', agent: 'Keys with the letting agent', keysafe: 'Key safe', concierge: 'Concierge or porter' },
    parking: { free: 'Free parking nearby', paid: 'Paid or permit parking', none: 'No parking' },
    payment: { options: ['full', 'deposit50'], note: 'Full payment now, or 50% now and 50% after the job' },
  }
}

async function quote(body, env) {
  const priced = priceSelection(body.selection || {})
  const out = { selection: priced.selection, lines: priced.lines, total: priced.total, needsQuote: priced.needsQuote, deposit: depositOf(priced.total) }
  if (body.postcode) {
    const pc = formatPostcode(String(body.postcode))
    out.postcode = pc
    // "E17" sozinho já diz a área: dá para cotar. O postcode inteiro só é preciso para reservar.
    out.postcodeFull = looksLikePostcode(pc)
    out.postcodeValid = out.postcodeFull || /^[A-Z]{1,2}\d[A-Z\d]?$/i.test(String(body.postcode).replace(/\s/g, ''))
    out.covered = out.postcodeValid && COVERED_AREAS.includes(postcodeArea(pc))
    if (out.covered && !out.postcodeFull) out.note = 'Area covered. Ask for the full postcode only when booking.'
  }
  if (body.promoCode && !priced.needsQuote) {
    const r = await resolvePromo(env, body.promoCode, priced)
    if (r.ok) Object.assign(out, { promo: r.promo, lines: r.priced.lines, total: r.priced.total, deposit: depositOf(r.priced.total) })
    else out.promoError = r.error
  }
  return out
}

/** Datas livres: agenda do site menos os dias sem vaga na categoria do serviço (OS). */
async function slots(body, env) {
  const services = Array.isArray(body.services) ? body.services.filter((s) => typeof s === 'string') : []
  const fora = diasSemVaga(await capacidadeDoOs(env), services)
  return {
    dates: bookableDates().filter((d) => !fora.has(d.iso)).slice(0, 12),
    windows: windowsFor().map((w) => ({ id: w.id, label: w.label })),
    note: fora.size ? 'Monday to Saturday. No same-day bookings. Fully booked days are left out.' : 'Monday to Saturday. No same-day bookings.',
  }
}

export async function handleAgent(body = {}, headers = {}) {
  const env = b2cServerEnv()
  if (!keyOk(headers['x-agent-key'], env)) return { status: 401, data: { error: 'Unauthorized' } }
  switch (body.action) {
    case 'catalog':
      return { status: 200, data: catalog() }
    case 'quote':
      return { status: 200, data: await quote(body, env) }
    case 'slots':
      return { status: 200, data: await slots(body, env) }
    case 'checkout': {
      const booking = body.booking || {}
      const attribution = { utm_source: 'whatsapp', utm_medium: 'chat', utm_campaign: String(body.campaign || 'wa_v1').slice(0, 60), landing: 'whatsapp' }
      const r = await handleCheckout(
        { ...booking, selection: normalizeSelection(booking.selection || {}), attribution, marketing: false },
        { origin: 'https://www.getfixfy.com', deposit: body.deposit === true },
      )
      return r
    }
    case 'bank': {
      // Transferência: a reserva nasce no OS aguardando o depósito de 50%.
      const booking = body.booking || {}
      const attribution = { utm_source: 'whatsapp', utm_medium: 'chat', utm_campaign: String(body.campaign || 'wa_v1').slice(0, 60), landing: 'whatsapp' }
      return handleBankBooking({ ...booking, selection: normalizeSelection(booking.selection || {}), attribution, marketing: false })
    }
    default:
      return { status: 400, data: { error: 'Unknown action' } }
  }
}
