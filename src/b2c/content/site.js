/**
 * Dados do negócio usados pelas páginas B2C.
 *
 * Tudo que é promessa pública mora aqui para ser conferido num lugar só antes
 * de ir ao ar. Campo `null` some da página (telefone e WhatsApp esperam o
 * canal novo que o plano 3 decide).
 */

export const COMPANY = {
  legalName: 'Getfixfy Ltd',
  address: '124 City Road, London, England, EC1V 2NX',
  companyNumber: '15406523',
  vatNumber: '478 1027 82',
  email: 'hello@getfixfy.com',
  /** Ex.: '+44 20 0000 0000'. Null esconde. */
  phone: null,
  /** Número no formato internacional sem espaços, ex.: '447700900000'. Null esconde. */
  whatsapp: null,
}

/**
 * Promessas da oferta. Cada uma precisa ser verdade no dia em que for ao ar;
 * as marcadas `pending` ainda esperam o sim do dono (ver plano de 18/09).
 */
export const PROMISES = {
  /** 18/09/2026: o dono descartou "cartão guardado, cobra depois"; paga no checkout (Stripe). */
  payAtCheckout: true,
  freeCancellationHours: 48,
  recleanDays: { value: 7, pending: false }, // aprovado pelo dono em 18/09
  pricesIncludeVat: true,
}

/** Áreas de postcode atendidas: Londres inteira, centro e periferia. */
export const COVERED_AREAS = [
  'E', 'EC', 'N', 'NW', 'SE', 'SW', 'W', 'WC',
  'BR', 'CR', 'DA', 'EN', 'HA', 'IG', 'KT', 'RM', 'SM', 'TW', 'UB',
]

/**
 * Regiões da seção de cobertura: Londres inteira, sem destacar lado nenhum
 * (dono, 18/09/2026: cada lado de Londres é falado no criativo do anúncio).
 */
export const AREA_GROUPS = [
  { area: 'Central London', code: 'EC · WC · W1 · SW1', places: ['City', 'Holborn', 'Covent Garden', 'Clerkenwell', 'Marylebone', 'Westminster'] },
  { area: 'North London', code: 'N · NW', places: ['Islington', 'Camden', 'Kentish Town', 'Finsbury Park', 'Hampstead', 'Tottenham'] },
  { area: 'East London', code: 'E', places: ['Stratford', 'Hackney', 'Bow', 'Canary Wharf', 'Walthamstow', 'Bethnal Green'] },
  { area: 'South London', code: 'SE · SW', places: ['Peckham', 'Brixton', 'Clapham', 'Greenwich', 'Lewisham', 'Wimbledon'] },
  { area: 'West London', code: 'W · TW · UB', places: ['Ealing', 'Hammersmith', 'Shepherd’s Bush', 'Chiswick', 'Acton', 'Hounslow'] },
]

export const OUTER_BOROUGHS = ['Bromley', 'Croydon', 'Harrow', 'Kingston', 'Romford', 'Enfield', 'Sutton', 'Bexley']

export function outwardCode(postcode = '') {
  const clean = String(postcode).toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (clean.length < 2) return ''
  return clean.length > 4 ? clean.slice(0, clean.length - 3) : clean
}

export function postcodeArea(postcode = '') {
  const m = /^[A-Z]{1,2}/.exec(outwardCode(postcode))
  return m ? m[0] : ''
}

/** Formato básico de postcode do Reino Unido (a validação fina é do postcodes.io). */
export function looksLikePostcode(postcode = '') {
  return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(String(postcode).trim())
}

export function formatPostcode(postcode = '') {
  const clean = String(postcode).toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (clean.length < 5) return clean
  return `${clean.slice(0, -3)} ${clean.slice(-3)}`
}

export function isCovered(postcode = '') {
  return COVERED_AREAS.includes(postcodeArea(postcode))
}

export function whatsappLink(text = '') {
  if (!COMPANY.whatsapp) return null
  const q = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${COMPANY.whatsapp}${q}`
}
