/**
 * Dados do negócio usados pelas páginas B2C.
 *
 * Tudo que é promessa pública mora aqui para ser conferido num lugar só antes
 * de ir ao ar. Campo `null` some da página (telefone e WhatsApp esperam o
 * canal novo que o plano 3 decide).
 */

export const COMPANY = {
  legalName: 'GETFIXFY LTD',
  address: '124 City Road, London, England, EC1V 2NX',
  companyNumber: '15406523',
  vatNumber: '478 1027 82',
  email: 'hello@getfixfy.com',
  /** Ex.: '+44 20 0000 0000'. Null esconde. */
  phone: null,
  /**
   * Número no formato internacional sem espaços. Null esconde o botão.
   * 23/09/2026: o fixo do Zendesk Talk, que é onde a equipe atende.
   */
  whatsapp: '442045384668',
}

/**
 * Promessas da oferta. Cada uma precisa ser verdade no dia em que for ao ar;
 * as marcadas `pending` ainda esperam o sim do dono (ver plano de 18/09).
 */
export const PROMISES = {
  /** 18/09/2026: o dono descartou "cartão guardado, cobra depois"; paga no checkout (Stripe). */
  payAtCheckout: true,
  freeCancellationHours: 48,
  // 06/10/2026 (modelo de agente): garantia de 7 dias dada pelo profissional, e o re-clean acompanha.
  recleanDays: { value: 7, pending: false },
  /**
   * Nada de VAT por cima do preço: o preço da tela é o total. Se o profissional
   * for registrado no VAT, o VAT dele já está dentro e sai no recibo. Nunca
   * "prices include VAT": a Fixfy não vende o serviço (VAT Notice 700, seção 22).
   */
  noVatAddedOnTop: true,
}

/**
 * Oferta de quem está indo embora (dono, 22/09/2026): o pop-up guarda o código
 * e o checkout aplica sozinho. O código tem de existir na Stripe (Coupons +
 * Promotion code); se não existir, o checkout só não aplica e ninguém vê erro.
 */
export const EXIT_OFFER = { code: 'FIXFY10', percentOff: 10 }

/**
 * Selo do Trustpilot no topo da home. Só aparece com `url` preenchida: o
 * endereço do NOSSO perfil, conferido, e `label` igual à nota que ele mostra
 * hoje (Excellent é TrustScore 4,3 ou mais). Selo de nota que não temos é
 * avaliação falsa (DMCC Act) e uso indevido da marca deles.
 */
export const TRUSTPILOT = { url: null, label: 'Excellent' }

/**
 * Nota do perfil da Fixfy no Google, conferida à mão (o selo não lê a nota
 * sozinho): mudou lá, muda aqui, com a data. `url: null` esconde o selo.
 */
export const GOOGLE_REVIEWS = {
  url: 'https://share.google/xs9HzIccBF88TgZoj',
  rating: 4.4,
  count: 13,
  checkedAt: '2026-09-24',
}

/**
 * Regras dos termos da reserva (/terms), modelo de agente de 06/10/2026: a
 * Fixfy é agente declarada do profissional e recebe o pagamento em nome dele.
 * A taxa de cancelamento tardio é do profissional, inteira (a Fixfy não fica
 * com nada). Peça extra sai pelo preço do profissional, sem margem da Fixfy.
 * Mudou aqui, muda na página e no FAQ.
 */
export const TERMS = {
  version: '6 October 2026',
  /** Versão que estes termos substituem (para reservas feitas antes da data acima). */
  replaces: '23 September 2026',
  lateCancellationPercent: 50,
  /** A taxa de cancelamento tardio vai 100% para o profissional. */
  lateCancellationToProfessionalPercent: 100,
  noAccessMinutes: 30,
  replyWorkingDays: 2,
  resolveDays: 14,
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

/**
 * Garantia de todo serviço reservado na Fixfy (dono, 06/10/2026): dada pelo
 * profissional que faz o trabalho e organizada pela Fixfy. 7 dias como regra
 * (com o re-clean), e os prazos maiores de pintura e obra, também dados pelo
 * profissional. Soma-se aos direitos do consumidor, nunca os substitui. Os
 * prazos contam do dia em que o trabalho termina; o que não está na lista
 * fica com o prazo padrão. Reservas de antes de 06/10/2026 ficam com o que
 * foi vendido (14 dias).
 */
export const GUARANTEE = {
  standardDays: 7,
  /** Quem dá a garantia: o profissional independente, não a Fixfy. */
  givenBy: 'professional',
  longer: [
    { id: 'painting', label: 'Painting and decorating', months: 3 },
    { id: 'tiling', label: 'Tiling', months: 3 },
    { id: 'walls', label: 'Wall treatments', months: 6 },
    { id: 'wood', label: 'Woodwork and structural work', months: 6 },
  ],
}

