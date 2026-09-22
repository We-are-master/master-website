/**
 * O que a reserva manda ao servidor. A confirmação vem pronta do servidor
 * (é ele que relê a reserva gravada na sessão da Stripe).
 */
import { formatPostcode } from '../content/site.js'
import { adSignals, getAttribution } from './track.js'

export const cleanPhone = (v = '') => v.replace(/[\s()-]/g, '')

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
      firstName: (b.contact?.firstName || '').trim(),
      lastName: (b.contact?.lastName || '').trim(),
      email: (b.contact?.email || '').trim(),
      phone: cleanPhone(b.contact?.phone),
    },
    address: { line1: (b.address?.line1 || '').trim(), line2: (b.address?.line2 || '').trim() },
    marketing: Boolean(b.marketing),
    attribution: getAttribution(),
    // Só com o sim de marketing o servidor manda a compra à Meta (Conversions API).
    ad: adSignals(),
    // Só o código: o desconto quem calcula é o servidor, relendo o cupom na Stripe.
    promoCode: b.promo?.code || undefined,
    ...extra,
  }
}

