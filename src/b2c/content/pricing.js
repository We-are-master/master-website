/**
 * Tabela de preço do B2C (end of tenancy). Um arquivo só, lido pela página,
 * pela reserva e pelo servidor (que recalcula tudo: o preço do navegador
 * nunca é confiado).
 *
 * Origem dos números:
 *  - Limpeza (dono, 22/09/2026): a tabela é a da Housekeep menos 5%,
 *    arredondada para baixo no £, medida no quote deles em 22/09 para um
 *    postcode de Londres. Cada tipo tem a SUA tabela (não é mais um percentual
 *    do end of tenancy): end of tenancy, deep clean e after builders são três
 *    produtos com preço próprio, do mesmo jeito que a Housekeep vende.
 *  - Banheiro extra e extras de limpeza: mesma régua, Housekeep menos 5%. O
 *    banheiro sobe em escada (£42, £52, £66) porque na Housekeep o segundo
 *    banheiro custa menos que o terceiro.
 *  - Janela por fora não existe na Housekeep e fica no preço que já tínhamos.
 *  - Pintura: catálogo público do OS (/api/public/service-catalog, lido em
 *    18/09/2026): Painter meia diária £215, cômodo £450.
 *  - Reparos: só por tempo, sem hora avulsa. Meia diária £180 (3h30) e diária
 *    £329 (7h), decisão do dono em 22/09/2026, abaixo do Checkatrade Express
 *    (£190 e £350 com a booking fee deles dentro). Ferramentas inclusas,
 *    material nunca.
 *  - Certificados (dono, 23/09/2026): o site vende EPC, gas safety e EICR. O
 *    EPC entrou no preço do Checkatrade Express, que é o teto do mercado, por
 *    ser o certificado para o qual ainda não temos mão de obra própria.
 *    Appliance testing e boiler service saíram da vitrine.
 *    Referências de mercado: OpenRent vende CP12 a partir de £55 e EICR a
 *    £185; o Express cobra EPC de £75 a £130 em Londres.
 *  - Pacote de materiais de pintura £130 (tinta, massa, lixa, fita e lonas):
 *    valor do dono, 18/09/2026, fixo por reserva.
 *
 * Os textos ficam em inglês (cliente final em Londres).
 */

export const CURRENCY = 'GBP'

/** `tiny` é o rótulo do celular, onde os seis chips precisam caber numa linha. */
export const PROPERTY_SIZES = [
  { id: 'studio', label: 'Studio', short: 'Studio', tiny: 'Studio' },
  { id: '1', label: '1 bedroom', short: '1 bed', tiny: '1' },
  { id: '2', label: '2 bedrooms', short: '2 bed', tiny: '2' },
  { id: '3', label: '3 bedrooms', short: '3 bed', tiny: '3' },
  { id: '4', label: '4 bedrooms', short: '4 bed', tiny: '4' },
  { id: '5', label: '5+ bedrooms', short: '5+ bed', tiny: '5+' },
]

export const BATHROOM_OPTIONS = [1, 2, 3, 4]

/**
 * Três tipos de limpeza (dono, 22/09/2026), cada um com a sua tabela, tirada
 * do preço da Housekeep menos 5% e arredondada para baixo:
 *  - eot: imóvel vazio, dia da entrega das chaves.
 *  - deep: casa ocupada (mudança para dentro, faxina de primavera, atrasada).
 *  - after: depois de obra, reforma ou instalação nova.
 * Forno incluso nos três. Tipo desconhecido (inclusive `regular`, pedido e
 * retirado pelo dono no mesmo dia) volta para end of tenancy.
 *
 * `osTitle` só da lista canônica do OS (master-os src/lib/type-of-work.ts):
 * "Deep Clean" é o nome que a migration 273 deu ao "(DC) Deep Cleaning" e o
 * que `normalizeTypeOfWork` devolve para "deep clean"/"deep cleaning".
 *
 * `short` é o rótulo do botão de escolha, `tiny` o cabeçalho da tabela da
 * home, `hint` a frase ao lado da pergunta (tem que ser verdade no tipo) e
 * `detail` a frase embaixo da escolha na reserva.
 */
export const CLEAN_KINDS = [
  {
    id: 'eot',
    name: 'End of tenancy clean',
    short: 'Moving out',
    tiny: 'Moving out',
    hint: 'Oven included',
    detail: 'For an empty property, cleaned for check-out day',
    // Studio 10% abaixo do 1 quarto, arredondado para baixo (dono, 23/09/2026).
    prices: { studio: 200, 1: 223, 2: 266, 3: 318, 4: 384, 5: 451 },
    osTitle: 'End of Tenancy Clean',
  },
  {
    id: 'deep',
    name: 'Deep clean',
    short: 'Deep clean',
    tiny: 'Deep',
    hint: 'Oven included',
    detail: 'For the home you live in: moving in, a spring clean, or just overdue',
    // Studio 10% abaixo do 1 quarto, arredondado para baixo (dono, 23/09/2026).
    prices: { studio: 174, 1: 194, 2: 237, 3: 289, 4: 356, 5: 422 },
    osTitle: 'Deep Clean',
  },
  {
    id: 'after',
    name: 'After builders clean',
    short: 'After builders',
    tiny: 'After works',
    hint: 'Dust and residue',
    detail: 'For a property that has just had building, refit or renovation work',
    prices: { studio: 227, 1: 227, 2: 269, 3: 322, 4: 388, 5: 455 },
    osTitle: 'After Builders Clean',
  },
]

/** Link sem tipo (anúncio, chip, reserva antiga) continua sendo end of tenancy. */
export const DEFAULT_CLEAN_KIND = 'eot'

export function cleanKind(id) {
  return CLEAN_KINDS.find((k) => k.id === id) || CLEAN_KINDS.find((k) => k.id === DEFAULT_CLEAN_KIND)
}

export const CLEAN = {
  id: 'clean',
  verb: 'Clean',
  kinds: CLEAN_KINDS,
  /** Nome e título do tipo padrão, para quem não sabe o tipo escolhido. */
  name: cleanKind(DEFAULT_CLEAN_KIND).name,
  osTitle: cleanKind(DEFAULT_CLEAN_KIND).osTitle,
  /**
   * Tabela do tipo padrão (end of tenancy). Cada tipo tem a sua em
   * `CLEAN_KINDS[].prices`; esta fica aqui para quem só precisa saber se o
   * tamanho tem preço fixo. null = sob consulta (6+ quartos).
   */
  prices: cleanKind(DEFAULT_CLEAN_KIND).prices,
  includedBathrooms: 1,
  /** Forno entra no preço base dos três tipos desde 18/09 (o mercado inclui; decisão do dono). */
  ovenIncluded: true,
  /**
   * Produtos, pano, aspirador e mop entram no preço. É diferencial de venda:
   * a faxina por hora do mercado londrino chega sem equipamento.
   */
  productsIncluded: true,
  /** De 2 quartos para cima vai equipe de dois (dono, 22/09/2026). */
  teamOfTwoFromSize: '2',
  /**
   * Banheiro extra em escada, igual à Housekeep: o segundo custa £42, o
   * terceiro £52, o quarto £66. Fora da lista, repete o último degrau.
   */
  extraBathroomSteps: [42, 52, 66],
  extras: [
    { id: 'carpet', label: 'Carpet steam clean', detail: 'Per room, hallway or staircase', price: 38, unit: 'room', max: 8 },
    { id: 'fridge', label: 'Fridge freezer', detail: 'Defrosted, cleaned inside and out', price: 43 },
    { id: 'windows', label: 'Windows outside', detail: 'Ground floor and safely reachable', price: 35 },
    { id: 'balcony', label: 'Balcony or patio', detail: 'Swept, washed and wiped down', price: 57 },
  ],
}

/** Preço da limpeza no tamanho e tipo. null = sob consulta. */
export function cleanPrice(size, kindId) {
  const price = cleanKind(kindId).prices[size]
  return price == null ? null : price
}

/** Quantos profissionais vão no imóvel: um até 1 quarto, dois de 2 para cima. */
export function cleanTeamSize(size) {
  const order = PROPERTY_SIZES.map((s) => s.id)
  return order.indexOf(String(size)) >= order.indexOf(CLEAN.teamOfTwoFromSize) ? 2 : 1
}

/** Quanto custam os banheiros além do que já vem no preço, pela escada. */
export function extraBathroomsPrice(bathrooms) {
  const extra = Math.max(0, (Number(bathrooms) || 1) - CLEAN.includedBathrooms)
  const steps = CLEAN.extraBathroomSteps
  let total = 0
  for (let i = 0; i < extra; i += 1) total += steps[Math.min(i, steps.length - 1)]
  return total
}

export const PAINT = {
  id: 'paint',
  verb: 'Paint',
  name: 'Fresh coat',
  osTitle: 'Painter',
  options: [
    {
      id: 'touchup',
      label: 'Touch-ups',
      detail: 'Holes filled, marks and scuffs touched up across the property. Up to 3.5 hours.',
      price: 215,
    },
    {
      id: 'rooms',
      label: 'Full repaint',
      detail: 'Walls in two coats, priced per room.',
      price: 450,
      unit: 'room',
      max: 8,
    },
  ],
  materials: {
    id: 'materials',
    label: 'Paint and materials pack',
    detail: 'Paint in white or magnolia, filler, sandpaper, tape and dust sheets',
    price: 130,
  },
}

export const FIX = {
  id: 'fix',
  verb: 'Fix',
  name: 'Repairs',
  osTitle: 'General Maintenance',
  packages: [
    { id: 'half', label: 'Half day', detail: 'Up to 3.5 hours', minutes: 210, price: 180 },
    { id: 'day', label: 'Full day', detail: 'Up to 7 hours', minutes: 420, price: 329 },
  ],
  /** Ferramentas sempre incluídas; material do cliente ou cotado à parte (dono, 22/09/2026). */
  toolsIncluded: true,
  tasks: [
    { id: 'holes', label: 'Fill holes and nail marks', minutes: 30 },
    { id: 'silicone', label: 'Reseal a bath or shower', minutes: 60 },
    { id: 'handles', label: 'Handles, hinges and door stops', minutes: 20 },
    { id: 'rails', label: 'Curtain rails and blinds', minutes: 30 },
    { id: 'brackets', label: 'Take down a TV bracket or shelves', minutes: 45 },
    { id: 'flatpack', label: 'Take apart flat-pack furniture', minutes: 45 },
    { id: 'doors', label: 'Sticking doors and cupboards', minutes: 30 },
    { id: 'tap', label: 'Dripping tap', minutes: 45 },
    { id: 'bulbs', label: 'Replace bulbs', minutes: 15 },
    { id: 'other', label: 'Something else', minutes: 30 },
  ],
}

export const CERT = {
  id: 'cert',
  verb: 'Certify',
  name: 'Landlord certificates',
  /** Cada item vira um job no OS com o seu próprio título da lista canônica. */
  items: [
    {
      id: 'gas',
      label: 'Gas safety certificate (CP12)',
      short: 'Gas safety (CP12)',
      detail: 'Boiler and every gas appliance checked by a Gas Safe registered engineer',
      valid: 'Renew every 12 months',
      price: 79,
      osTitle: 'Gas Safety Certificate',
    },
    {
      id: 'eicr',
      label: 'Electrical safety report (EICR)',
      short: 'Electrical safety (EICR)',
      detail: 'Every circuit tested and signed off by a NICEIC or NAPIT registered electrician',
      valid: 'Renew every 5 years',
      // Preço do Checkatrade Express em Londres (dono, 23/09/2026). O 5+ fica
      // sob consulta porque "cinco ou mais" é aberto e o número de circuitos
      // é o que manda no tempo do eletricista.
      prices: { studio: 129, 1: 129, 2: 165, 3: 195, 4: 225, 5: null },
      osTitle: 'Electrical Safety Report',
    },
    {
      id: 'epc',
      label: 'Energy performance certificate (EPC)',
      short: 'Energy performance (EPC)',
      detail: 'Accredited assessor visits, rates the property and lodges the certificate on the national register',
      valid: 'Valid for 10 years',
      // O assessor cobra £60 cravado em qualquer tamanho (dono, 23/09/2026),
      // então os pequenos têm piso de £95: a £75 do Express sobrava £1 depois
      // do VAT. Do três quartos para cima, o preço é o do Express.
      prices: { studio: 95, 1: 95, 2: 95, 3: 99, 4: 109, 5: 130 },
      osTitle: 'Energy Performance Certificate',
    },
  ],
}

/** Preço de um item de certificado no tamanho escolhido (null = sob consulta). */
export function certPrice(item, size) {
  if (item.prices) return item.prices[size] ?? null
  return item.price
}

export const SERVICES = { clean: CLEAN, paint: PAINT, fix: FIX, cert: CERT }
export const SERVICE_ORDER = ['clean', 'paint', 'fix', 'cert']

/** Nome do serviço numa reserva: a limpeza leva o nome do tipo escolhido. */
export function serviceName(id, selection) {
  if (id === 'clean') return cleanKind(selection?.clean?.kind).name
  return SERVICES[id]?.name || ''
}

/** O menor preço de cada serviço, para os "from £" da página (limpeza: o tipo mais barato). */
export const FROM_PRICE = {
  clean: Math.min(...CLEAN_KINDS.map((k) => cleanPrice('studio', k.id))),
  paint: PAINT.options[0].price,
  fix: FIX.packages[0].price,
  cert: Math.min(...CERT.items.map((i) => (i.prices ? Math.min(...Object.values(i.prices).filter((v) => v != null)) : i.price))),
}

/** Pacote sugerido para a lista de tarefas: o menor que cabe no tempo. */
export function suggestFixPackage(taskIds = []) {
  const minutes = taskIds.reduce((sum, id) => {
    const task = FIX.tasks.find((t) => t.id === id)
    return sum + (task ? task.minutes : 0)
  }, 0)
  if (minutes === 0) return FIX.packages[0]
  return FIX.packages.find((p) => p.minutes >= minutes) || FIX.packages[FIX.packages.length - 1]
}

export function emptySelection() {
  return {
    services: [],
    size: '1',
    bathrooms: 1,
    clean: { kind: DEFAULT_CLEAN_KIND, extras: {} },
    paint: { option: 'touchup', rooms: 1, materials: false },
    fix: { tasks: [], package: null },
    cert: { items: [] },
  }
}

const clampInt = (value, min, max) => {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return min
  return Math.min(max, Math.max(min, n))
}

/**
 * Normaliza uma seleção vinda da URL, do storage ou do navegador, para que
 * o servidor e a página calculem sobre o mesmo formato.
 */
export function normalizeSelection(raw = {}) {
  const base = emptySelection()
  const services = Array.isArray(raw.services)
    ? SERVICE_ORDER.filter((id) => raw.services.includes(id))
    : []
  const size = PROPERTY_SIZES.some((s) => s.id === String(raw.size)) ? String(raw.size) : base.size
  const bathrooms = clampInt(raw.bathrooms ?? 1, 1, 4)

  // Tipo desconhecido, ausente ou `regular` (retirado) vira end of tenancy.
  const kind = CLEAN_KINDS.some((k) => k.id === raw.clean?.kind) ? raw.clean.kind : DEFAULT_CLEAN_KIND
  const extras = {}
  for (const extra of CLEAN.extras) {
    const qty = raw.clean?.extras?.[extra.id]
    if (!qty) continue
    extras[extra.id] = extra.unit ? clampInt(qty, 1, extra.max || 8) : 1
  }

  const paintOption = PAINT.options.some((o) => o.id === raw.paint?.option) ? raw.paint.option : 'touchup'
  const paintRooms = clampInt(raw.paint?.rooms ?? 1, 1, 8)
  const paintMaterials = raw.paint?.materials === true

  const tasks = Array.isArray(raw.fix?.tasks)
    ? FIX.tasks.filter((t) => raw.fix.tasks.includes(t.id)).map((t) => t.id)
    : []
  const pkg = FIX.packages.some((p) => p.id === raw.fix?.package) ? raw.fix.package : null

  const certItems = Array.isArray(raw.cert?.items)
    ? CERT.items.filter((i) => raw.cert.items.includes(i.id)).map((i) => i.id)
    : []

  return {
    ...base,
    services,
    size,
    bathrooms,
    clean: { kind, extras },
    paint: { option: paintOption, rooms: paintRooms, materials: paintMaterials },
    fix: { tasks, package: pkg },
    cert: { items: certItems },
  }
}

/**
 * Linhas e total da reserva. `needsQuote` quando algum item não tem preço
 * fixo (5+ quartos): nesse caso a reserva vira pedido de preço.
 */
export function priceSelection(rawSelection) {
  const sel = normalizeSelection(rawSelection)
  const lines = []
  let needsQuote = false
  const sizeLabel = PROPERTY_SIZES.find((s) => s.id === sel.size)?.label || ''

  if (sel.services.includes('clean')) {
    const base = cleanPrice(sel.size, sel.clean.kind)
    const label = cleanKind(sel.clean.kind).name
    if (base == null) {
      needsQuote = true
      lines.push({ service: 'clean', id: 'clean-base', label, detail: sizeLabel, amount: null })
    } else {
      lines.push({ service: 'clean', id: 'clean-base', label, detail: sizeLabel, amount: base })
    }
    const extraBaths = Math.max(0, sel.bathrooms - CLEAN.includedBathrooms)
    if (extraBaths > 0) {
      lines.push({
        service: 'clean',
        id: 'clean-bathrooms',
        label: extraBaths === 1 ? 'Extra bathroom' : `${extraBaths} extra bathrooms`,
        amount: extraBathroomsPrice(sel.bathrooms),
      })
    }
    for (const extra of CLEAN.extras) {
      const qty = sel.clean.extras[extra.id]
      if (!qty) continue
      lines.push({
        service: 'clean',
        id: `clean-${extra.id}`,
        label: extra.unit && qty > 1 ? `${extra.label} × ${qty}` : extra.label,
        amount: extra.price * qty,
      })
    }
  }

  if (sel.services.includes('paint')) {
    const option = PAINT.options.find((o) => o.id === sel.paint.option)
    const qty = option.unit ? sel.paint.rooms : 1
    lines.push({
      service: 'paint',
      id: `paint-${option.id}`,
      label: `${PAINT.name}: ${option.label.toLowerCase()}`,
      detail: option.unit ? `${qty} ${qty === 1 ? 'room' : 'rooms'}` : 'Up to 3.5 hours',
      amount: option.price * qty,
    })
    if (sel.paint.materials) {
      lines.push({
        service: 'paint',
        id: 'paint-materials',
        label: PAINT.materials.label,
        detail: 'Paint, filler, sandpaper and dust sheets',
        amount: PAINT.materials.price,
      })
    }
  }

  if (sel.services.includes('fix')) {
    const pkg = FIX.packages.find((p) => p.id === sel.fix.package) || suggestFixPackage(sel.fix.tasks)
    lines.push({
      service: 'fix',
      id: `fix-${pkg.id}`,
      label: `${FIX.name}: ${pkg.label.toLowerCase()}`,
      detail: sel.fix.tasks.length
        ? `${sel.fix.tasks.length} ${sel.fix.tasks.length === 1 ? 'job' : 'jobs'} on your list`
        : pkg.detail || '',
      amount: pkg.price,
    })
  }

  if (sel.services.includes('cert')) {
    for (const item of CERT.items) {
      if (!sel.cert.items.includes(item.id)) continue
      const amount = certPrice(item, sel.size)
      if (amount == null) needsQuote = true
      lines.push({
        service: 'cert',
        id: `cert-${item.id}`,
        label: item.label,
        detail: item.prices ? sizeLabel : item.valid,
        amount,
      })
    }
  }

  const total = lines.reduce((sum, line) => sum + (line.amount || 0), 0)
  return { selection: sel, lines, total, needsQuote }
}

/** Menor cobrança da Stripe em libra: abaixo disso o cartão nem passa. */
export const MIN_CHARGE = 0.3

/**
 * Cupom aplicado ao preço: a linha do desconto entra no fim e o total cai.
 * `promo` é o que o servidor validou na Stripe (percentOff OU amountOff, em
 * libras). A conta é em pence para o total bater com a cobrança.
 */
export function applyPromo(priced, promo) {
  if (!promo || priced.needsQuote || !(priced.total > 0)) return priced
  const subtotal = Math.round(priced.total * 100)
  const off = promo.percentOff
    ? Math.round((subtotal * promo.percentOff) / 100)
    : Math.min(Math.round((promo.amountOff || 0) * 100), subtotal)
  if (off <= 0) return priced
  const discount = off / 100
  return {
    ...priced,
    lines: [
      ...priced.lines,
      {
        service: 'promo',
        id: 'promo',
        label: `Promo code ${promo.code}`,
        detail: promo.percentOff ? `${promo.percentOff}% off` : '',
        amount: -discount,
      },
    ],
    subtotal: priced.total,
    discount,
    total: (subtotal - off) / 100,
    promo,
  }
}

/**
 * Reparte o desconto entre partes (jobs no OS, linhas do Checkout) na
 * proporção de cada uma, em pence; a sobra do arredondamento fica na maior.
 */
export function splitDiscount(amounts, discount) {
  const pence = amounts.map((a) => Math.round((a || 0) * 100))
  const whole = pence.reduce((s, p) => s + p, 0)
  const off = Math.round((discount || 0) * 100)
  if (!whole || !off) return amounts.map(() => 0)
  const shares = pence.map((p) => Math.floor((off * p) / whole))
  shares[pence.indexOf(Math.max(...pence))] += off - shares.reduce((s, x) => s + x, 0)
  return shares.map((s) => s / 100)
}

export function formatGBP(amount, { pence = false } = {}) {
  if (amount == null) return 'On request'
  // Com cupom o valor pode ter pence: aí aparecem, senão £120.60 viraria £121.
  const digits = pence || Math.round(amount * 100) % 100 !== 0 ? 2 : 0
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount)
}
