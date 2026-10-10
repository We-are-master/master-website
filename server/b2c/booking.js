/**
 * Reserva B2C: valida, reprecifica no servidor (o preço do navegador é só
 * exibição), cobra pelo Stripe Checkout e, em modo live, grava no OS e avisa
 * por e-mail.
 *
 *   GET  /api/b2c/config    → o que está ligado neste ambiente
 *   POST /api/b2c/payment   → checkout transparente: valida e cria o PaymentIntent
 *   POST /api/b2c/checkout  → sem chave publicável: abre a página hospedada da Stripe
 *   POST /api/b2c/booking   → { paymentIntentId } ou { checkoutSessionId }: confere
 *                             o pagamento e grava (sem nenhum, só em modo test)
 *   POST /api/b2c/webhook   → rede de segurança: quem pagou e fechou a aba
 */
import { randomBytes } from 'node:crypto'
import { b2cServerEnv, returnBaseUrl } from './env.js'
import {
  constructWebhookEvent,
  createCheckoutSession,
  createPaymentIntent,
  markBooked,
  retrievePaymentIntent,
  retrieveSession,
  unpackBooking,
} from './stripe.js'
import { customerMessageHtml, sendCustomerConfirmation, sendOfficeNotification } from './email.js'
import { createOsJob, resolveFixfyAccountId } from './os.js'
import { capacidadeDoOs } from './capacity.js'
import { diasSemVaga } from '../../src/b2c/lib/capacity.js'
import { adMetadata, sendPurchase } from './meta.js'
import { partnerPayFor } from './partner-pay.js'
import { resolvePromo } from './promo.js'
import { postSiteLead } from './site-lead.js'
import {
  CERT,
  FIX,
  HANDYMAN,
  PAINT,
  PROMO_LINE_LABEL,
  PROPERTY_SIZES,
  SERVICES,
  applyPromo,
  cleanKind,
  certExtraQty,
  certOption,
  cleanPrice,
  fixTrade,
  normalizeSelection,
  priceSelection,
  regrasDaLimpeza,
  serviceName,
  splitDiscount,
} from '../../src/b2c/content/pricing.js'
import { COVERED_AREAS, PROMISES, formatPostcode, looksLikePostcode, postcodeArea } from '../../src/b2c/content/site.js'
import { findWindow, formatLongDate, isBookableDate } from '../../src/b2c/lib/slots.js'

const ACCESS_LABEL = {
  meet: 'Customer will be there',
  agent: 'Keys with the letting agent',
  keysafe: 'Key safe (ask for the code the day before)',
  concierge: 'Concierge or porter',
}
const PARKING_LABEL = { free: 'Free parking nearby', paid: 'Paid or permit parking', none: 'No parking' }
const ROLE_LABEL = { homeowner: 'Homeowner', tenant: 'Tenant moving out', landlord: 'Landlord', agent: 'Letting agent' }
const ORDER_NOTE = { cert: 'first, before the work', fix: 'first', paint: 'after repairs', clean: 'last, after paint and repairs' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^(\+44|0)\d{9,10}$/
const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max).replace(/\0/g, '') : '')
const pence = (gbp) => Math.round(gbp * 100)

/**
 * Depósito de 50% (reserva pelo WhatsApp, dono 29/09/2026): o cliente paga
 * metade agora e o resto depois do serviço, pelo link de pagamento do OS. Em
 * pence, arredondado para cima, para as duas metades somarem o total.
 */
export function depositOf(total) {
  return Math.ceil(pence(total) / 2) / 100
}

export async function handleConfig() {
  const env = b2cServerEnv()
  // Dias sem vaga por categoria (a página esconde conforme o que está na reserva).
  const capacity = await capacidadeDoOs(env)
  return {
    status: 200,
    data: {
      mode: env.mode,
      payments: env.paymentsEnabled,
      stripe: env.stripeTest ? 'test' : env.stripeLive ? 'live' : 'none',
      // Com a publicável do mesmo modo, o cartão vai na própria página.
      publishableKey: env.paymentsEnabled && env.publishableKey ? env.publishableKey : null,
      capacity,
    },
  }
}

function newRef() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(6)
  let out = ''
  for (const b of bytes) out += alphabet[b % alphabet.length]
  return `FX-${out}`
}

/** Só o que interessa da origem da visita, curto (vai para a metadata da Stripe). */
function trimAttribution(a) {
  if (!a || typeof a !== 'object') return {}
  const keep = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ref', 'landing', 'referrer', 'at']
  const out = {}
  for (const k of keep) if (typeof a[k] === 'string' && a[k]) out[k] = a[k].slice(0, k === 'referrer' ? 160 : 120)
  return out
}

function validate(body) {
  const e = []
  const selection = normalizeSelection(body.selection || {})
  if (selection.services.length === 0) e.push('Choose at least one service.')
  const postcode = formatPostcode(str(body.postcode, 10))
  if (!looksLikePostcode(postcode)) e.push('Enter a full UK postcode.')
  else if (!COVERED_AREAS.includes(postcodeArea(postcode))) e.push('We only book London postcodes for now.')
  if (selection.services.includes('clean') && cleanPrice(selection.size, selection.clean?.kind) == null) e.push('Homes with 5 or more bedrooms are priced from photos.')
  if (selection.services.includes('fix') && selection.fix.trade === HANDYMAN && selection.fix.tasks.length === 0) e.push('Tick at least one repair job.')
  if (selection.services.includes('cert') && selection.cert.items.length === 0) e.push('Tick at least one certificate.')
  const date = str(body.date, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) e.push('Choose a day.')
  const win = findWindow(body.window)
  if (!win) e.push('Choose an arrival time.')
  if (!ACCESS_LABEL[body.access]) e.push('Tell us how your professional gets in.')
  if (!PARKING_LABEL[body.parking]) e.push('Choose the parking situation.')
  const c = body.contact || {}
  const contact = {
    firstName: str(c.firstName, 60),
    lastName: str(c.lastName, 60),
    email: str(c.email, 254).toLowerCase(),
    phone: str(c.phone, 20).replace(/[\s()-]/g, ''),
  }
  if (!contact.firstName || !contact.lastName) e.push('Enter your name.')
  if (!EMAIL_RE.test(contact.email)) e.push('Enter a valid email.')
  if (!PHONE_RE.test(contact.phone)) e.push('Enter a UK phone number.')
  const address = { line1: str(body.address?.line1, 120), line2: str(body.address?.line2, 120) }
  if (!address.line1) e.push('Enter the first line of the address.')
  return {
    errors: e,
    clean: {
      selection,
      postcode,
      date,
      window: win?.id || '',
      access: body.access,
      accessNote: str(body.accessNote, 300),
      parking: body.parking,
      notes: str(body.notes, 1000),
      role: ROLE_LABEL[body.role] ? body.role : '',
      contact,
      address,
      marketing: body.marketing === true,
      attribution: trimAttribution(body.attribution),
    },
  }
}

/** Anti-spam barato: campo escondido preenchido, ou formulário em menos de 4s. */
function looksLikeSpam(body) {
  if (str(body.website)) return 'Could not submit the booking.'
  if (Number(body.elapsedMs) > 0 && Number(body.elapsedMs) < 4000) return 'Please take a moment and try again.'
  return null
}

const addressLineOf = (b) => [b.address.line2, b.address.line1, 'London', b.postcode].filter(Boolean).join(', ')
const summaryOf = (b) => b.selection.services.map((s) => serviceName(s, b.selection)).join(', ')
/** O re-clean grátis é promessa do end of tenancy; reserva com deep clean não leva. */
const hasDeepClean = (sel) => sel.services.includes('clean') && cleanKind(sel.clean.kind).id === 'deep'

const gbp = (n) => (Number.isInteger(n) ? `£${n}` : `£${n.toFixed(2)}`)

/**
 * O que aparece na fatura do cartão, depois do nome da conta na Stripe
 * ("PREFIXO* ISTO"). Uma palavra do serviço, para o cliente reconhecer a
 * cobrança. O prefixo é ajuste de conta na Stripe, não dá para mudar daqui.
 */
const SUFFIX = { clean: 'CLEANING', paint: 'PAINTING', fix: 'REPAIRS', cert: 'CERTIFICATE' }
const statementSuffix = (sel) => (sel.services.length === 1 ? SUFFIX[sel.services[0]] : 'BOOKING')

/**
 * Cupom opcional: sem código nada muda; com código inválido a cobrança nem
 * nasce. O cupom aplicado vai junto com a reserva na metadata (é ele que
 * reprecifica no fim) e em chaves próprias, para contar os usos na busca.
 */
export const AGENT_DISCOUNT_MAX = 5

async function withPromo(env, body, b, priced, agentDiscount = 0) {
  // Desconto do Harvey (dono, 10/10/2026): o link já nasce com o preço descontado, sem
  // cupom criado à mão. Só chega pela rota do agente (X-Agent-Key) e nunca passa de 5%.
  // Segue o mesmo caminho da promoção: custo da Fixfy, repasse do parceiro intacto.
  const pct = Math.min(AGENT_DISCOUNT_MAX, Math.max(0, Math.floor(Number(agentDiscount) || 0)))
  if (pct > 0) {
    const promo = { id: null, code: `HARVEY${pct}`, percentOff: pct, amountOff: null }
    return { priced: applyPromo(priced, promo), booking: { ...b, promo }, metadata: { promo: promo.code, agent_discount: String(pct) } }
  }
  if (!body.promoCode) return { priced, booking: b, metadata: {} }
  const r = await resolvePromo(env, body.promoCode, priced)
  if (!r.ok) return { error: r.error }
  return { priced: r.priced, booking: { ...b, promo: r.promo }, metadata: { promo: r.promo.code, promo_id: r.promo.id } }
}

/**
 * Linhas para a Stripe: sempre no preço publicado, que é o preço do
 * profissional (modelo de agente, VAT Notice 700 22.2: a Fixfy não mexe no
 * valor da venda dele). A promoção vai como desconto da Stripe, à parte.
 */
function listLines(priced) {
  return priced.lines.filter((l) => l.service !== 'promo')
}

/** A promoção da reserva para o Checkout: código, id e o desconto exato em pence. */
function promotionFor(priced) {
  if (!priced.promo || !(priced.discount > 0)) return null
  return { code: priced.promo.code, id: priced.promo.id, offPence: pence(priced.discount) }
}

/**
 * Repasse do parceiro no job: o líquido da tabela (partner-pay.js, igual ao
 * documento 08 de comissão), não uma porcentagem do preço. Cupom é promoção
 * da Fixfy, paga por ela em nome do cliente: nunca reduz nem limita o
 * repasse. O preço do job no OS fica cheio, então o repasse nunca passa dele.
 */
function partnerCostFor(pay) {
  return pay == null ? {} : { partner_cost: pay }
}

/**
 * Nota do job com cupom. O payload do OS não tem campo de promoção, então ela
 * fica registrada aqui: preço cheio no job, quanto a Fixfy paga em nome do
 * cliente e quanto o cliente pagou de fato.
 */
function promotionNote({ code, listPrice, share, paid, pay, deposit = null }) {
  return [
    `FIXFY PROMOTION ${code}: ${gbp(share)} of this job's price (${gbp(listPrice)}) is paid by Fixfy on the customer's behalf. The customer pays ${gbp(paid)} for this job.`,
    `Client price stays at the professional's full price (${gbp(listPrice)}) and partner pay is not reduced${pay == null ? ' (partner pay not set by the website: set it when you assign)' : ` (${gbp(pay)})`}: the promotion is a Fixfy cost.`,
    deposit != null
      ? `BALANCE DUE FROM THE CUSTOMER after the job: ${gbp(Math.round((paid - deposit) * 100) / 100)} for this job, NOT client price minus deposit (the promotion is not owed by the customer): send a fixed-amount pay link (?amount=${(Math.round((paid - deposit) * 100) / 100).toFixed(2)}).`
      : null,
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * Passo 1 do pagamento: a reserva chega inteira, é validada e reprecificada
 * (data incluída, para ninguém pagar um dia que já não existe), e a sessão
 * do Checkout nasce com o valor do servidor. Nada é gravado ainda.
 */
export async function handleCheckout(body, { origin, ip, userAgent, deposit = false, zendeskTicketId = null, agentDiscount = 0 } = {}) {
  const env = b2cServerEnv()
  const spam = looksLikeSpam(body)
  if (spam) return { status: 400, data: { error: spam } }
  const { errors, clean: b } = validate(body)
  if (!errors.length && !isBookableDate(b.date)) errors.push('That day is no longer available. Pick another one.')
  if (!errors.length && diasSemVaga(await capacidadeDoOs(env), b.selection.services).has(b.date)) errors.push('That day is fully booked. Pick another one.')
  if (errors.length) return { status: 400, data: { error: errors[0], errors } }
  const listed = priceSelection(b.selection)
  if (listed.needsQuote) return { status: 400, data: { error: 'This booking needs a photo quote.' } }
  if (!env.paymentsEnabled) {
    return { status: 409, data: { error: 'Online payment is not enabled in this environment.' } }
  }
  const { priced, booking, metadata, error } = await withPromo(env, body, b, listed, agentDiscount)
  if (error) return { status: 400, data: { error, field: 'promo' } }
  const ref = newRef()
  const win = findWindow(b.window)
  const now = deposit ? depositOf(priced.total) : null
  const later = deposit ? Math.round((priced.total - now) * 100) / 100 : null
  const session = await createCheckoutSession(env, {
    ref,
    // Depósito: uma linha só, do que se paga agora (a promoção já está no total da reserva).
    lines: deposit
      ? [
          {
            label: `50% deposit: ${summaryOf(b)}`,
            detail: [
              `The other ${gbp(later)} is paid after the job`,
              priced.promo ? `${PROMO_LINE_LABEL} (${priced.promo.code}): ${gbp(priced.discount)} already taken off` : null,
            ]
              .filter(Boolean)
              .join(' · '),
            amount: now,
          },
        ]
      : listLines(priced),
    promotion: deposit ? null : promotionFor(priced),
    email: b.contact.email,
    booking: deposit ? { ...booking, deposit: true } : booking,
    baseUrl: returnBaseUrl(env, origin),
    summary: summaryOf(b),
    suffix: statementSuffix(b.selection),
    contextLine: `Booking ${ref}: ${formatLongDate(b.date)}, arriving ${win.phrase}, at ${addressLineOf(b)}. Carried out by an independent professional, named in your confirmation. Free changes up to ${PROMISES.freeCancellationHours} hours before, refunded in full.`,

    // zt: o ticket da conversa do Harvey; o primeiro job pago nasce nele.
    extraMetadata: { ...adMetadata(body.ad, { ip, userAgent }), ...metadata, ...(zendeskTicketId ? { zt: zendeskTicketId } : {}) },
    // Só o sinal guarda o cartão; o /book continua cobrando 100% sem salvar (dono, 09/10/2026).
    saveCard: deposit && env.cardOnFile,
    payLater: later,
  })
  return { status: 200, data: { url: session.url, ref, total: priced.total, ...(deposit ? { payNow: now, payLater: later } : {}) } }
}

/**
 * Reserva por transferência bancária (Harvey no WhatsApp, 29/09/2026): mesma
 * validação e o mesmo preço do checkout; os jobs nascem no OS "aguardando
 * depósito" (50%), sem oferta a parceiro, até a equipe registrar o depósito.
 */
export async function handleBankBooking(body) {
  const env = b2cServerEnv()
  const { errors, clean: b } = validate(body)
  if (!errors.length && !isBookableDate(b.date)) errors.push('That day is no longer available. Pick another one.')
  if (!errors.length && diasSemVaga(await capacidadeDoOs(env), b.selection.services).has(b.date)) errors.push('That day is fully booked. Pick another one.')
  if (errors.length) return { status: 400, data: { error: errors[0], errors } }
  const listed = priceSelection(b.selection)
  if (listed.needsQuote) return { status: 400, data: { error: 'This booking needs a photo quote.' } }
  const { priced, error } = await withPromo(env, body, b, listed)
  if (error) return { status: 400, data: { error, field: 'promo' } }
  const ref = newRef()
  const deposit = depositOf(priced.total)
  if (env.mode !== 'live' || process.env.VERCEL !== '1') {
    console.log('[b2c/booking] bank booking dry run', ref, priced.total)
    return { status: 200, data: { ref, total: priced.total, deposit, jobs: [], dryRun: true } }
  }
  const jobs = await recordBooking(env, b, priced, ref, null, { bank: { deposit } })
  return { status: 200, data: { ref, total: priced.total, deposit, jobs: jobs.map((j) => ({ id: j.id, reference: j.reference })) } }
}

/** Checkout transparente: mesma validação do hospedado, cobrança como PaymentIntent. */
export async function handlePayment(body, { ip, userAgent } = {}) {
  const env = b2cServerEnv()
  const spam = looksLikeSpam(body)
  if (spam) return { status: 400, data: { error: spam } }
  const { errors, clean: b } = validate(body)
  if (!errors.length && !isBookableDate(b.date)) errors.push('That day is no longer available. Pick another one.')
  if (!errors.length && diasSemVaga(await capacidadeDoOs(env), b.selection.services).has(b.date)) errors.push('That day is fully booked. Pick another one.')
  if (errors.length) return { status: 400, data: { error: errors[0], errors } }
  const listed = priceSelection(b.selection)
  if (listed.needsQuote) return { status: 400, data: { error: 'This booking needs a photo quote.' } }
  if (!env.paymentsEnabled || !env.publishableKey) {
    return { status: 409, data: { error: 'Card payment on this page is not enabled in this environment.' } }
  }
  const { priced, booking, metadata, error } = await withPromo(env, body, b, listed)
  if (error) return { status: 400, data: { error, field: 'promo' } }
  const ref = newRef()
  const intent = await createPaymentIntent(env, {
    ref,
    amount: priced.total,
    email: b.contact.email,
    booking,
    summary: summaryOf(b),
    suffix: statementSuffix(b.selection),
    extraMetadata: { ...adMetadata(body.ad, { ip, userAgent }), ...metadata },
  })
  return { status: 200, data: { clientSecret: intent.clientSecret, ref, total: priced.total } }
}

/** O texto que o parceiro lê antes de sair: completo, em inglês. */
function scopeFor(service, b, priced, ref, opts = {}) {
  const sel = b.selection
  const lines = opts.lines || priced.lines.filter((l) => l.service === service)
  const money = (n) => `£${n}`
  const parts = []
  if (service === 'clean') {
    const size = PROPERTY_SIZES.find((s) => s.id === sel.size)?.label
    const rooms = `${size}, ${sel.bathrooms} bathroom${sel.bathrooms > 1 ? 's' : ''}.`
    if (cleanKind(sel.clean.kind).id === 'deep') {
      parts.push(`Deep clean of an occupied home. ${rooms}`)
      parts.push(
        'The customer lives here: work around their furniture and belongings. Clean every room top to bottom to the Fixfy room-by-room checklist, with a photo of each room when finished. Cupboards, drawers and wardrobes inside only where the customer has emptied them.',
      )
    } else {
      parts.push(`End of tenancy clean. ${rooms}`)
      parts.push('Clean to the Fixfy check-out checklist, every room, with a photo of each room when finished.')
    }
    parts.push('Oven deep clean included: inside, racks, trays and door glass.')
    const extras = regrasDaLimpeza(sel.clean.kind).extras.filter((x) => sel.clean.extras[x.id]).map((x) => (x.unit ? `${x.label} x${sel.clean.extras[x.id]}` : x.label))
    if (extras.length) parts.push(`Add-ons: ${extras.join('; ')}.`)
  }
  if (service === 'paint') {
    const option = PAINT.options.find((o) => o.id === sel.paint.option)
    parts.push(
      option.unit
        ? `Painting: full repaint of ${sel.paint.rooms} room${sel.paint.rooms > 1 ? 's' : ''}, walls in two coats.`
        : option.id === 'touchup'
          ? 'Painting: touch-ups across the property. Fill holes, sand, touch up marks and scuffs, colour matched where possible. Up to 3.5 hours.'
          : `Painting: ${option.label.toLowerCase()}. ${option.detail}`,
    )
    parts.push(
      sel.paint.materials
        ? `Materials pack INCLUDED in the price (${PAINT.materials.detail}): bring everything, white or magnolia unless the notes say otherwise.`
        : 'No materials pack: use the paint the customer leaves on site. Anything else needed is quoted to the customer at your price before you buy it, only with their approval, and goes on the report as materials.',
    )
  }
  if (service === 'fix') {
    const trade = fixTrade(sel.fix.trade)
    const pkg = trade.packages.find((p) => priced.lines.some((l) => l.id === `fix-${p.id}`))
    const tempo = pkg?.perHour ? `${sel.fix.hours} ${sel.fix.hours === 1 ? 'hour' : 'hours'}` : pkg?.label.toLowerCase() || 'time as booked'
    if (trade.id === HANDYMAN) {
      const tasks = FIX.tasks.filter((t) => sel.fix.tasks.includes(t.id)).map((t) => t.label)
      parts.push(`Move-out repairs, ${tempo} on site. Jobs: ${tasks.join('; ')}.`)
    } else {
      parts.push(`${trade.label}, ${tempo} on site. What needs doing is in the customer notes below; call the customer before the visit if anything is unclear.`)
    }
    parts.push('Parts: tell the customer what is needed and your price before buying; only with their approval. List them as materials on the report.')
  }
  if (service === 'cert') {
    const item = opts.certItem
    const size = PROPERTY_SIZES.find((x) => x.id === sel.size)?.label
    parts.push(`${item.label}. ${item.detail}.`)
    const opt = certOption(item, sel)
    const extraQty = certExtraQty(item, sel)
    if (opt) parts.push(`Booked: ${opt.label}${extraQty ? `, plus ${item.extra.label.toLowerCase()} x${extraQty}` : ''}.`)
    if (item.id === 'gas') {
      parts.push('Landlord gas safety record (CP12) for the boiler and every gas appliance, issued in the engineer\'s own Gas Safe name and number. Fixfy never issues or reissues the certificate.')
    }
    if (item.id === 'eicr') parts.push(`Full EICR on the installation of a ${size ? size.toLowerCase() : 'flat'}, with observation codes and the schedule of test results, signed by a NICEIC or NAPIT registered electrician.`)
    if (item.id === 'epc') {
      parts.push(`Domestic EPC for a ${size ? size.toLowerCase() : 'flat'}: an accredited energy assessor surveys the property and lodges the certificate on the national EPC register.`)
      parts.push('Upload the certificate PDF to the report with the certificate number and the rating. If the rating is F or G, say so on the report: a landlord cannot let a property below E.')
    } else {
      parts.push('Upload the signed certificate to the report, plus a photo of the appliance or consumer unit tested. Anything that fails: list it with the fix and the price, do not start the work.')
    }
  }
  parts.push(
    `Price: ${money(lines.reduce((s, l) => s + (l.amount || 0), 0))}, the fixed published price (${lines.map((l) => `${l.label} ${money(l.amount)}`).join(', ')}). A Fixfy promotion, if any, is paid by Fixfy and never changes this price.`,
  )
  if (sel.services.length > 1) {
    parts.push(`Part of booking ${ref} with ${sel.services.filter((s) => s !== service).map((s) => serviceName(s, sel).toLowerCase()).join(' and ')}: this job goes ${ORDER_NOTE[service]}.`)
  }
  parts.push(`Access: ${ACCESS_LABEL[b.access]}${b.accessNote ? ` (${b.accessNote})` : ''}. Parking: ${PARKING_LABEL[b.parking]}.`)
  if (b.notes) parts.push(`Customer notes: ${b.notes}`)
  parts.push(
    hasDeepClean(sel)
      ? `Booked and paid online (${ref}).`
      : `Booked and paid online (${ref}). Free re-clean within ${PROMISES.recleanDays.value} days.`,
  )
  return parts.join('\n')
}

/** Resposta da confirmação: o que a página mostra. */
function confirmation(b, priced, ref, mode, payment) {
  return {
    ref,
    mode,
    payment,
    total: priced.total,
    lines: priced.lines,
    summary: summaryOf(b),
    date: b.date,
    window: b.window,
    email: b.contact.email,
    firstName: b.contact.firstName,
    services: b.selection.services,
    cleanKind: b.selection.services.includes('clean') ? cleanKind(b.selection.clean.kind).id : null,
    postcode: b.postcode,
    address: b.address,
  }
}

/** Grava a reserva paga: um job por serviço no OS e os dois e-mails. */
async function recordBooking(env, b, priced, ref, paymentIntentId, { deposit = false, bank = null, ticketId = null, card = null } = {}) {
  const name = `${b.contact.firstName} ${b.contact.lastName}`
  const win = findWindow(b.window)
  // O que o cliente lê (no ticket ou, se ele falhar, por e-mail) e o escritório também.
  const details = {
    ref,
    total: priced.total,
    lines: priced.lines,
    summary: summaryOf(b),
    firstName: b.contact.firstName,
    name,
    email: b.contact.email,
    phone: b.contact.phone,
    dateLabel: formatLongDate(b.date),
    windowLabel: win.phrase,
    addressLine: addressLineOf(b),
    role: ROLE_LABEL[b.role] || '',
    access: ACCESS_LABEL[b.access],
    accessNote: b.accessNote,
    parking: PARKING_LABEL[b.parking],
    notes: b.notes,
    paymentIntentId,
    deposit: deposit ? depositOf(priced.total) : null,
    marketing: b.marketing,
    attribution: b.attribution,
    // Para o e-mail com a marca: serviços, tipo de limpeza, calendário e acesso.
    services: b.selection.services,
    cleanKind: b.selection.services.includes('clean') ? cleanKind(b.selection.clean.kind).id : null,
    dateIso: b.date,
    windowRange: win.range,
    accessId: b.access,
  }
  const osJobs = []
  let osError = null
  // Código do ticket do Zendesk (encoded id) quando o cliente virou o solicitante.
  let threadId = null
  try {
    if (!env.osKey) throw new Error('MASTER_OS_JOB_WEBHOOK_API_KEY not set')
    const accountId = await resolveFixfyAccountId(env)
    const sel = b.selection
    const order = []
    for (const service of ['cert', 'fix', 'paint', 'clean'].filter((s) => sel.services.includes(s))) {
      if (service === 'clean') {
        // Título da lista canônica do OS: End of Tenancy Clean ou Deep Clean.
        order.push({ service, title: cleanKind(sel.clean.kind).osTitle })
        continue
      }
      if (service === 'fix') {
        // Handyman, plumber, carpenter ou eletricista: o título do OS da profissão.
        order.push({ service, title: fixTrade(sel.fix.trade).osTitle })
        continue
      }
      if (service !== 'cert') {
        order.push({ service, title: SERVICES[service].osTitle })
        continue
      }
      // Cada certificado é um job: engenheiro diferente e título da lista canônica do OS.
      for (const item of CERT.items) {
        if (!sel.cert.items.includes(item.id)) continue
        const lines = priced.lines.filter((l) => l.id === `cert-${item.id}`)
        order.push({ service, title: item.osTitle, certItem: item, lines })
      }
    }
    // Preço do job: sempre o publicado (o do profissional). Com cupom, a parte
    // que a Fixfy paga em nome do cliente é repartida entre os jobs só para
    // saber quanto o cliente pagou de cada um (a sobra fica no maior).
    const entryLines = order.map((e) => e.lines || priced.lines.filter((l) => l.service === e.service))
    const listPrices = entryLines.map((lines) => lines.reduce((s, l) => s + (l.amount || 0), 0))
    const discounts = splitDiscount(listPrices, priced.discount)
    for (const entry of order) {
      const { service } = entry
      const i = order.indexOf(entry)
      const price = listPrices[i]
      const paid = Math.round((listPrices[i] - discounts[i]) * 100) / 100
      const pay = partnerPayFor({
        service,
        lines: entryLines[i],
        size: sel.size,
        kind: sel.clean?.kind,
        bathrooms: sel.bathrooms,
        certItem: entry.certItem,
        fixTrade: sel.fix?.trade,
        hours: sel.fix?.hours,
        certOption: entry.certItem ? certOption(entry.certItem, sel)?.id : null,
        certExtra: entry.certItem ? certExtraQty(entry.certItem, sel) : 0,
      })
      const partnerPay = partnerCostFor(pay)
      const notes = [
        `Website booking ${ref} (${order.length > 1 ? `${order.indexOf(entry) + 1} of ${order.length}` : 'single job'}).`,
        bank
          ? `AWAITING BANK TRANSFER: 50% deposit of ${gbp(bank.deposit)} (of ${gbp(priced.total)}) to be paid by bank transfer with reference ${ref}. Booked on WhatsApp with Harvey. Do NOT dispatch until the deposit lands: record it in Finance and the offer goes out. Harvey releases the slot if nothing arrives in 24 hours.`
          : deposit
          ? `50% DEPOSIT PAID: ${gbp(depositOf(priced.total))} of ${gbp(priced.total)} by card at booking, Stripe payment ${paymentIntentId}. The balance of ${gbp(priced.total - depositOf(priced.total))} is due after the job: send the pay link from the OS.`
          : `PAID ${gbp(priced.total)} by card at booking, Stripe payment ${paymentIntentId}${order.length > 1 ? ` (covers the whole booking of ${gbp(priced.total)})` : ''}. Received by Fixfy as agent for the professional. Extra materials, if any, are quoted to the customer at the professional's price, with their approval.`,
        priced.promo
          ? promotionNote({
              code: priced.promo.code,
              listPrice: price,
              share: discounts[i],
              paid,
              pay,
              deposit: bank || deposit ? depositOf(paid) : null,
            })
          : null,
        b.role ? `Booked by: ${ROLE_LABEL[b.role]}.` : null,
        `Marketing opt-in: ${b.marketing ? 'yes' : 'no'}.`,
        Object.keys(b.attribution || {}).length ? `Source: ${JSON.stringify(b.attribution)}` : null,
      ]
        .filter(Boolean)
        .join('\n')
      const job = await createOsJob(env, {
        ...partnerPay,
        account_id: accountId,
        date: b.date,
        // id do slot do OS (ARRIVAL_SLOT_LOOKUP): casa exato, inclusive o 9am sharp
        arrival_time: win.id,
        title: entry.title,
        service_type: entry.title,
        client_name: name,
        client_email: b.contact.email,
        client_phone: b.contact.phone,
        // No Reino Unido o apartamento vem antes da rua: "Flat 3, 112 Rye Lane".
        property_address: [b.address.line2, b.address.line1, 'London'].filter(Boolean).join(', '),
        postcode: b.postcode,
        description: scopeFor(service, b, priced, ref, { certItem: entry.certItem, lines: entry.lines }),
        client_price: price,
        // Promoção paga pela Fixfy em nome do cliente (master-os#696). OS antigo ignora o campo;
        // a nota interna continua contando a mesma coisa.
        ...(priced.promo && discounts[i] > 0 ? { promotion_amount: discounts[i] } : {}),
        // O cartão já passou: o job nasce PAGO e mesmo assim `unassigned`. Sem
        // isto ele nascia `unpaid` e virava "a receber" de um dinheiro que já
        // está na conta, com risco de alguém cobrar quem já pagou.
        // Transferência: nada pago ainda; o job espera o depósito sem ir para a oferta.
        ...(bank
          ? { auto_assign: false, hold_for_deposit: true }
          : {
              payment_status: deposit ? 'partial' : 'paid',
              paid_at: new Date().toISOString(),
              // O que o cliente pagou deste job (com cupom, menos que o preço cheio).
              payment_amount: deposit ? depositOf(paid) : paid,
              stripe_payment_intent_id: paymentIntentId,
              ...(deposit && card ? { stripe_customer_id: card.stripeCustomerId, stripe_payment_method_id: card.stripePaymentMethodId } : {}),
            }),
        internal_notes: notes,
        // Uma conversa por reserva: o cliente vira o solicitante do ticket do
        // primeiro job, a cópia da confirmação fica lá como nota interna e o
        // e-mail com a marca sai daqui com o código do ticket, para a resposta
        // dele cair no mesmo ticket das notas internas.
        ...(osJobs.length === 0 && bank
          ? { ticket_subject: `Booking ${ref} (awaiting bank transfer): ${details.summary}, ${details.dateLabel}` }
          : osJobs.length === 0
          ? {
              // Pago na conversa do Harvey: o job entra no ticket do WhatsApp (o OS
              // guarda a confirmação lá como nota interna, nada público). Só o
              // primeiro: um ticket liga a um job, os outros serviços ganham o deles.
              ...(ticketId ? { ticket_id: ticketId } : {}),
              customer_message_html: customerMessageHtml(env, details),
              customer_message_via: 'email',
              ticket_subject: `Booking ${ref}: ${details.summary}, ${details.dateLabel}`,
            }
          : {}),
      })
      if (osJobs.length === 0 && job.customerRequesterSet) threadId = job.encodedId
      osJobs.push({ ...job, title: entry.title })
    }
  } catch (err) {
    osError = err.message
    console.error('[b2c/booking] OS job failed', ref, err)
  }

  // Transferência: o Harvey fala com o cliente no WhatsApp; confirmação só depois do depósito.
  if (bank) {
    if (osError || !osJobs.length) console.error('[b2c/booking] bank booking without OS job', ref, osError)
    return osJobs
  }
  const emailData = { ...details, osJobs, osError }
  // O cliente sempre recebe o e-mail com a marca; com o código do ticket, a
  // resposta dele cai no ticket da compra. O aviso ao escritório só sai quando
  // o job não nasceu no OS, e vai para o hello@ (vira ticket): nada em e-mail pessoal.
  if (env.resendKey) {
    const sends = [sendCustomerConfirmation(env, emailData, { encodedId: threadId })]
    if (osError || !osJobs.length) sends.push(sendOfficeNotification(env, emailData))
    const results = await Promise.allSettled(sends)
    results.forEach((r) => r.status === 'rejected' && console.error('[b2c/booking] email failed', ref, r.reason))
  } else {
    console.error('[b2c/booking] RESEND_API_KEY not set: no emails sent for', ref)
  }
  return osJobs
}

/**
 * Fecha a reserva paga. A reserva vem da metadata que o próprio servidor
 * gravou (na sessão do Checkout ou no PaymentIntent); a marca `booked` no
 * PaymentIntent segura a segunda chamada (página de volta + webhook, ou refresh).
 */
async function finalizePaid(env, { pi, metadata, amount, discountPence = null }) {
  const ref = metadata?.ref
  const stored = unpackBooking(metadata)
  if (!ref || !stored) return { status: 500, data: { error: `We could not read booking ${ref || ''}. Email hello@getfixfy.com and we will sort it.` } }

  // A data já foi conferida quando a cobrança nasceu; aqui só a forma.
  const { errors, clean: b } = validate(stored)
  // Com cupom, o desconto é o que o servidor gravou na cobrança (nada de consultar de novo).
  const listed = priceSelection(b.selection)
  const deposit = stored.deposit === true
  let priced = applyPromo(listed, stored.promo)
  // Checkout pago com o código do dono (sem o cupom avulso): vale o desconto que a
  // Stripe aplicou, se só o arredondamento da porcentagem separa os dois (até 2p).
  if (stored.promo && !deposit && Number.isInteger(discountPence)) {
    const gap = Math.abs(discountPence - pence(priced.discount || 0))
    if (gap > 0 && gap <= 2) priced = applyPromo(listed, stored.promo, { offPence: discountPence })
  }
  const expected = deposit ? pence(depositOf(priced.total)) : pence(priced.total)
  if (errors.length || priced.needsQuote || amount !== expected) {
    console.error('[b2c/booking] paid amount does not match booking', ref, errors, amount, priced.total)
    return { status: 409, data: { error: `Payment received for ${ref}, but the booking needs a check. We will email you within the hour.` } }
  }

  const data = confirmation(b, priced, ref, env.mode, 'card')
  if (pi.metadata?.booked === '1') return { status: 200, data: { ...data, jobs: (pi.metadata.jobs || '').split(', ').filter(Boolean) } }
  if (env.mode !== 'live') {
    // Ensaio com chave de teste: pagou no Stripe de teste, nada vai ao OS.
    await markBooked(env, pi.id, [])
    return { status: 200, data: { ...data, jobs: [] } }
  }
  const ticketId = /^\d{1,15}$/.test(String(metadata?.zt || '')) ? String(metadata.zt) : null
  // Cartão salvo no sinal: o OS cobra o restante no final review.
  const card =
    deposit && typeof pi.customer === 'string' && typeof pi.payment_method === 'string'
      ? { stripeCustomerId: pi.customer, stripePaymentMethodId: pi.payment_method }
      : null
  const jobs = await recordBooking(env, b, priced, ref, pi.id, { deposit, ticketId, card })
  try {
    await markBooked(env, pi.id, jobs.map((j) => j.reference))
  } catch (err) {
    console.error('[b2c/booking] could not mark payment as booked', ref, err)
  }
  // Depois do booked=1: a compra vai à Meta uma vez só, mesmo com página de volta + webhook.
  await sendPurchase(env, { metadata, ref, value: priced.total, contact: b.contact, postcode: b.postcode })
  // Quem pagou sai dos leads do OS e não recebe mais e-mail de retomada.
  await postSiteLead(
    { event: 'paid', email: b.contact.email, jobId: jobs[0]?.id || null, bookingRef: ref, total: priced.total, promoCode: priced.promo?.code || null },
    env,
  )
  return { status: 200, data: { ...data, jobs: jobs.map((j) => j.reference) } }
}

/** Referência que a Stripe não conhece: resposta clara em vez de erro 500. */
async function fetchOrNull(fn) {
  try {
    return await fn()
  } catch (err) {
    if (err?.code === 'resource_missing' || err?.statusCode === 404) return null
    throw err
  }
}

export async function finalizeSession(sessionId) {
  const env = b2cServerEnv()
  const session = await fetchOrNull(() => retrieveSession(env, sessionId))
  if (!session) return { status: 400, data: { error: 'We could not find that payment.' } }
  const pi = session.payment_intent && typeof session.payment_intent === 'object' ? session.payment_intent : null
  if (session.status !== 'complete' || session.payment_status !== 'paid' || !pi) {
    return { status: 402, data: { error: 'Your payment has not gone through yet.', paymentStatus: session.payment_status } }
  }
  return finalizePaid(env, {
    pi,
    metadata: session.metadata,
    amount: session.amount_total,
    discountPence: session.total_details?.amount_discount ?? null,
  })
}

export async function finalizePaymentIntent(paymentIntentId) {
  const env = b2cServerEnv()
  const pi = await fetchOrNull(() => retrievePaymentIntent(env, paymentIntentId))
  if (!pi || pi.metadata?.source !== 'b2c-site') return { status: 400, data: { error: 'We could not find that payment.' } }
  if (pi.status !== 'succeeded') {
    return { status: 402, data: { error: 'Your payment has not gone through yet.', paymentStatus: pi.status } }
  }
  return finalizePaid(env, { pi, metadata: pi.metadata, amount: pi.amount_received })
}

export async function handleBooking(body) {
  const env = b2cServerEnv()
  const paymentIntentId = str(body.paymentIntentId, 200)
  if (paymentIntentId) {
    if (!/^pi_[A-Za-z0-9]+$/.test(paymentIntentId)) return { status: 400, data: { error: 'Invalid payment reference.' } }
    if (!env.stripeSecretKey) return { status: 503, data: { error: 'Payments are not available right now.' } }
    return finalizePaymentIntent(paymentIntentId)
  }
  const sessionId = str(body.checkoutSessionId, 200)
  if (sessionId) {
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) return { status: 400, data: { error: 'Invalid payment reference.' } }
    if (!env.stripeSecretKey) return { status: 503, data: { error: 'Payments are not available right now.' } }
    return finalizeSession(sessionId)
  }

  // Sem pagamento: só existe em modo test sem Stripe (ensaio do fluxo, nada gravado).
  if (env.mode === 'live' || env.paymentsEnabled) return { status: 402, data: { error: 'Payment is required to complete the booking.' } }
  const spam = looksLikeSpam(body)
  if (spam) return { status: 400, data: { error: spam } }
  const { errors, clean: b } = validate(body)
  if (!errors.length && !isBookableDate(b.date)) errors.push('Choose a bookable day.')
  if (errors.length) return { status: 400, data: { error: errors[0], errors } }
  const priced = priceSelection(b.selection)
  if (priced.needsQuote) return { status: 400, data: { error: 'This booking needs a photo quote.' } }
  return { status: 200, data: confirmation(b, priced, newRef(), 'test', 'none') }
}

/**
 * Webhook da Stripe (checkout.session.completed): cobre quem pagou e fechou
 * a aba antes de voltar. Nos primeiros 5 minutos devolve 409 para a Stripe
 * tentar de novo depois; assim a página de volta, que chega em segundos,
 * grava primeiro e o webhook só confirma. Sem trava de banco nem corrida.
 */
export async function handleWebhook(rawBody, signature) {
  const env = b2cServerEnv()
  if (!env.webhookSecret || !env.stripeSecretKey) return { status: 503, data: { error: 'Webhook not configured' } }
  let event
  try {
    event = constructWebhookEvent(env, rawBody, signature)
  } catch (err) {
    return { status: 400, data: { error: `Bad signature: ${err.message}` } }
  }
  const fresh = Date.now() / 1000 - event.created < 5 * 60
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    // O PaymentIntent do Checkout hospedado não traz a reserva: esse fica com o evento da sessão.
    if (pi.metadata?.source !== 'b2c-site' || !pi.metadata?.bn) return { status: 200, data: { ignored: 'not an embedded b2c payment' } }
    const current = await retrievePaymentIntent(env, pi.id)
    if (current.metadata?.booked === '1') return { status: 200, data: { ok: true, already: true } }
    if (fresh) return { status: 409, data: { retry: 'waiting for the customer to return' } }
    const result = await finalizePaymentIntent(pi.id)
    return { status: result.status === 200 ? 200 : 500, data: result.data }
  }
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
    return { status: 200, data: { ignored: event.type } }
  }
  const session = event.data.object
  if (session.metadata?.source !== 'b2c-site') return { status: 200, data: { ignored: 'not a b2c booking' } }
  const current = await retrieveSession(env, session.id)
  if (current.payment_intent?.metadata?.booked === '1') return { status: 200, data: { ok: true, already: true } }
  if (fresh) return { status: 409, data: { retry: 'waiting for the customer to return' } }
  const result = await finalizeSession(session.id)
  return { status: result.status === 200 ? 200 : 500, data: result.data }
}
