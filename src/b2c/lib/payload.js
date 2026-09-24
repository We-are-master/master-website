/**
 * O que a reserva manda ao servidor. A confirmação vem pronta do servidor
 * (é ele que relê a reserva gravada na sessão da Stripe).
 */
import { formatPostcode } from '../content/site.js'
import { CERT, FIX, PAINT, PROPERTY_SIZES, cleanKind, normalizeSelection, priceSelection } from '../content/pricing.js'
import { bookingHref } from './store.js'
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


/**
 * O resumo que o lead leva ao OS: o nome do serviço como entra no e-mail
 * ("2 bed deep clean", "handyman half day"), duas linhas curtas para o cartão
 * da reserva, o preço fixo e o link que reabre a reserva no mesmo serviço,
 * tamanho e postcode (`/book?...&pc=`).
 */
export function leadSummary(b) {
  const sel = normalizeSelection(b.selection || {})
  const priced = priceSelection(sel)
  const size = PROPERTY_SIZES.find((p) => p.id === sel.size)
  const nomes = []
  const detalhes = []
  for (const s of sel.services) {
    if (s === 'clean') {
      nomes.push(`${size ? `${size.short.toLowerCase()} ` : ''}${cleanKind(sel.clean.kind).name.toLowerCase()}`)
      if (size) detalhes.push(size.label)
      detalhes.push('Oven included')
    } else if (s === 'paint') {
      const opt = PAINT.options.find((o) => o.id === sel.paint.option)
      nomes.push(opt?.unit ? `full repaint, ${sel.paint.rooms} ${sel.paint.rooms === 1 ? 'room' : 'rooms'}` : 'painting touch-ups')
      if (sel.paint.materials) detalhes.push('Materials included')
    } else if (s === 'fix') {
      const pkg = FIX.packages.find((p) => p.id === sel.fix.package) || FIX.packages[0]
      nomes.push(`handyman ${pkg.label.toLowerCase()}`)
      if (pkg.detail) detalhes.push(pkg.detail)
    } else if (s === 'cert') {
      const itens = CERT.items.filter((i) => sel.cert.items.includes(i.id)).map((i) => i.label)
      // Só a primeira letra desce: "gas safety certificate (CP12)".
      const juntos = itens.join(' and ')
      nomes.push(juntos ? juntos.charAt(0).toLowerCase() + juntos.slice(1) : 'landlord certificate')
    }
  }
  const preset = {
    services: sel.services,
    kind: sel.clean?.kind,
    size: sel.size,
    bathrooms: sel.bathrooms,
    extras: sel.services.includes('clean') ? sel.clean.extras : undefined,
    paint: sel.services.includes('paint') ? sel.paint : undefined,
    fixPackage: sel.services.includes('fix') ? sel.fix.package : undefined,
    cert: sel.services.includes('cert') ? sel.cert.items : undefined,
  }
  const href = bookingHref(preset)
  const pc = b.postcode ? formatPostcode(b.postcode) : ''
  const resume = `https://www.getfixfy.com${href}${pc ? `${href.includes('?') ? '&' : '?'}pc=${encodeURIComponent(pc)}` : ''}`
  return {
    serviceLabel: nomes.join(' + ') || 'booking',
    details: detalhes.slice(0, 3),
    price: priced.needsQuote ? null : priced.total,
    resumeUrl: resume,
  }
}

/** O que cada passo manda como lead: só o que a pessoa já deu. */
export function leadPayload(b, extra = {}) {
  const sel = b.selection || {}
  const resumo = leadSummary(b)
  return {
    name: contactName(b).trim(),
    email: (b.contact?.email || '').trim(),
    phone: cleanPhone(b.contact?.phone || '') || undefined,
    services: sel.services || [],
    kind: sel.services?.includes('clean') ? sel.clean?.kind : undefined,
    size: b.sizeChosen ? sel.size : undefined,
    postcode: b.postcode ? formatPostcode(b.postcode) : undefined,
    noOffers: Boolean(b.noOffers),
    attribution: getAttribution(),
    selection: { ...sel, details: resumo.details },
    serviceLabel: resumo.serviceLabel,
    price: resumo.price,
    resumeUrl: resumo.resumeUrl,
    ...extra,
  }
}
