/**
 * O que a reserva manda ao servidor. A confirmação vem pronta do servidor
 * (é ele que relê a reserva gravada na sessão da Stripe).
 */
import { formatPostcode } from '../content/site.js'
import { adSignals, getAttribution } from './track.js'

export const cleanPhone = (v = '') => v.replace(/[\s()-]/g, '')

/**
 * Nome como o cliente digitou no primeiro passo ("Full name"). Reserva salva
 * antes do campo único ainda tem só primeiro e último nome separados.
 */
export function contactName(b) {
  const c = b?.contact || {}
  if (c.fullName) return c.fullName
  return [c.firstName, c.lastName].filter(Boolean).join(' ')
}

/** "Mary Ann Smith" → primeiro nome "Mary", sobrenome "Ann Smith" (o servidor pede os dois). */
export function splitName(full = '') {
  const parts = String(full).trim().split(/\s+/).filter(Boolean)
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') }
}

export function bookingPayload(b, extra = {}) {
  return {
    selection: b.selection,
    postcode: formatPostcode(b.postcode),
    role: b.role,
    date: b.date,
    window: b.window,
    access: b.access,
    accessNote: (b.accessNote || '').trim(),
    parking: b.parking,
    notes: (b.notes || '').trim(),
    contact: {
      ...splitName(contactName(b)),
      email: (b.contact?.email || '').trim(),
      phone: cleanPhone(b.contact?.phone),
    },
    address: { line1: (b.address?.line1 || '').trim(), line2: (b.address?.line2 || '').trim() },
    // Ofertas por e-mail: quem não quer marca no primeiro passo (recusa na coleta, como a lei pede).
    marketing: !b.noOffers,
    attribution: getAttribution(),
    // Só com o sim de marketing o servidor manda a compra à Meta (Conversions API).
    ad: adSignals(),
    // Só o código: o desconto quem calcula é o servidor, relendo o cupom na Stripe.
    promoCode: b.promo?.code || undefined,
    ...extra,
  }
}


/** O que o primeiro passo manda como lead: só o que a pessoa já deu, nada de endereço completo. */
export function leadPayload(b, extra = {}) {
  const sel = b.selection || {}
  return {
    name: contactName(b).trim(),
    email: (b.contact?.email || '').trim(),
    services: sel.services || [],
    kind: sel.services?.includes('clean') ? sel.clean?.kind : undefined,
    size: b.sizeChosen ? sel.size : undefined,
    postcode: b.postcode ? formatPostcode(b.postcode) : undefined,
    noOffers: Boolean(b.noOffers),
    attribution: getAttribution(),
    ...extra,
  }
}
