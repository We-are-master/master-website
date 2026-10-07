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
    // Studio 10% abaixo do 1 quarto, arredondado para baixo (dono, 23/09/2026).
    prices: { studio: 204, 1: 227, 2: 269, 3: 322, 4: 388, 5: 455 },
    osTitle: 'After Builders Clean',
  },
]

/**
 * Link sem tipo (anúncio, chip, reserva antiga) continua sendo end of tenancy.
 * `let` porque a tabela do OS (tabela-ao-vivo.js) pode trocar o tipo padrão;
 * quem importa enxerga o valor novo (binding vivo do ES module).
 */
export let DEFAULT_CLEAN_KIND = 'eot'

/** Só para tabela-ao-vivo.js: troca o tipo padrão vindo do OS. */
export function definirTipoPadrao(id) {
  DEFAULT_CLEAN_KIND = id
}

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

/**
 * Regras da limpeza de um tipo (dono, 07/10/2026): cada tipo pode ter o seu
 * banheiro incluso, a sua escada de banheiro extra, o tamanho a partir do
 * qual vão dois profissionais e a sua lista de add-ons. Campo ausente no tipo
 * = vale o do CLEAN (a regra geral de hoje). Sem tipo = tipo padrão.
 */
export function regrasDaLimpeza(kindId) {
  const k = cleanKind(kindId)
  return {
    includedBathrooms: k.includedBathrooms ?? CLEAN.includedBathrooms,
    extraBathroomSteps: k.extraBathroomSteps ?? CLEAN.extraBathroomSteps,
    teamOfTwoFromSize: k.teamOfTwoFromSize ?? CLEAN.teamOfTwoFromSize,
    extras: k.extras ?? CLEAN.extras,
  }
}

/** Quantos profissionais vão no imóvel: um até o tamanho da regra do tipo, dois dali para cima. */
export function cleanTeamSize(size, kindId) {
  const order = PROPERTY_SIZES.map((s) => s.id)
  return order.indexOf(String(size)) >= order.indexOf(regrasDaLimpeza(kindId).teamOfTwoFromSize) ? 2 : 1
}

/** Quanto custam os banheiros além do que já vem no preço do tipo, pela escada do tipo. */
export function extraBathroomsPrice(bathrooms, kindId) {
  const regras = regrasDaLimpeza(kindId)
  const extra = Math.max(0, (Number(bathrooms) || 1) - regras.includedBathrooms)
  const steps = regras.extraBathroomSteps
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

/**
 * Quem vai no Fix (dono, 07/10/2026: "tudo que tem preço no OS vai pro
 * site"). O handyman é o próprio FIX (pacotes e lista de tarefas acima); as
 * outras profissões vêm da tabela do OS em `FIX.trades`, cada uma com o seu
 * título do OS e os seus pacotes. Pacote com `perHour` é cobrado por hora
 * (o cliente escolhe quantas).
 */
export const HANDYMAN = 'handyman'

export function fixTrades() {
  return [
    { id: HANDYMAN, label: 'Handyman', detail: 'Small repairs and odd jobs', osTitle: FIX.osTitle, packages: FIX.packages, tasks: FIX.tasks },
    ...(FIX.trades || []).map((t) => ({ ...t, tasks: [] })),
  ]
}

export function fixTrade(id) {
  const lista = fixTrades()
  return lista.find((t) => t.id === id) || lista[0]
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

/** Preço de um item de certificado no tamanho escolhido (null = sob consulta). Com opções, o da primeira (o "from"). */
export function certPrice(item, size) {
  if (item.prices) return item.prices[size] ?? null
  if (item.options?.length) return item.options[0].price
  return item.price
}

/** A opção escolhida de um certificado com opções (ex.: quantos aparelhos a gás). */
export function certOption(item, sel) {
  if (!item.options?.length) return null
  return item.options.find((o) => o.id === sel?.cert?.options?.[item.id]) || item.options[0]
}

/** Quantas unidades extras (ex.: porta corta-fogo a mais) o cliente pediu. */
export function certExtraQty(item, sel) {
  if (!item.extra) return 0
  return sel?.cert?.extra?.[item.id] || 0
}

/** Preço do certificado na reserva: tamanho, opção e extras. null = sob consulta. */
export function certLinePrice(item, sel) {
  const opt = certOption(item, sel)
  const base = opt ? opt.price : certPrice(item, sel?.size)
  if (base == null) return null
  return base + (item.extra ? item.extra.price * certExtraQty(item, sel) : 0)
}

export const SERVICES = { clean: CLEAN, paint: PAINT, fix: FIX, cert: CERT }
export const SERVICE_ORDER = ['clean', 'paint', 'fix', 'cert']

/** Nome do serviço numa reserva: a limpeza leva o nome do tipo escolhido. */
export function serviceName(id, selection) {
  if (id === 'clean') return cleanKind(selection?.clean?.kind).name
  return SERVICES[id]?.name || ''
}

/**
 * O menor preço de cada serviço, para os "from £" da página (limpeza: o tipo
 * mais barato, no menor tamanho com preço). Objeto fixo, recalculado no lugar
 * por `calcularFromPrice` quando a tabela do OS chega.
 */
export const FROM_PRICE = {}

export function calcularFromPrice() {
  const ativos = PROPERTY_SIZES.map((s) => s.id)
  const menor = (prices) => Math.min(...ativos.map((id) => prices[id]).filter((v) => v != null))
  FROM_PRICE.clean = Math.min(...CLEAN_KINDS.map((k) => menor(k.prices)))
  FROM_PRICE.paint = PAINT.options[0].price
  FROM_PRICE.fix = FIX.packages.filter((p) => !p.perHour)[0]?.price ?? FIX.packages[0].price
  FROM_PRICE.cert = Math.min(...CERT.items.map((i) => (i.prices ? menor(i.prices) : certPrice(i))))
}
calcularFromPrice()

/**
 * Pacote sugerido para a lista de tarefas: o menor que cabe no tempo. A hora
 * avulsa nunca é sugerida (fica como escolha do cliente); profissão só com
 * hora avulsa sugere a hora.
 */
export function suggestFixPackage(taskIds = [], tradeId = HANDYMAN) {
  const trade = fixTrade(tradeId)
  const fechados = trade.packages.filter((p) => !p.perHour)
  if (!fechados.length) return trade.packages[0]
  const minutes = taskIds.reduce((sum, id) => {
    const task = trade.tasks.find((t) => t.id === id)
    return sum + (task ? task.minutes : 0)
  }, 0)
  if (minutes === 0) return fechados[0]
  return fechados.find((p) => p.minutes >= minutes) || fechados[fechados.length - 1]
}

export function emptySelection() {
  return {
    services: [],
    size: '1',
    bathrooms: 1,
    clean: { kind: DEFAULT_CLEAN_KIND, extras: {} },
    paint: { option: 'touchup', rooms: 1, materials: false },
    fix: { trade: HANDYMAN, tasks: [], package: null, hours: 1 },
    cert: { items: [], options: {}, extra: {} },
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
  // Só os add-ons do tipo escolhido: add-on de outro tipo some da seleção.
  const extras = {}
  for (const extra of regrasDaLimpeza(kind).extras) {
    const qty = raw.clean?.extras?.[extra.id]
    if (!qty) continue
    extras[extra.id] = extra.unit ? clampInt(qty, 1, extra.max || 8) : 1
  }

  const paintOption = PAINT.options.some((o) => o.id === raw.paint?.option) ? raw.paint.option : 'touchup'
  const paintRooms = clampInt(raw.paint?.rooms ?? 1, 1, 8)
  const paintMaterials = raw.paint?.materials === true

  const trade = fixTrade(raw.fix?.trade)
  const tasks = Array.isArray(raw.fix?.tasks)
    ? trade.tasks.filter((t) => raw.fix.tasks.includes(t.id)).map((t) => t.id)
    : []
  const pkg = trade.packages.some((p) => p.id === raw.fix?.package) ? raw.fix.package : null
  const hours = clampInt(raw.fix?.hours ?? 1, 1, 8)

  const certItems = Array.isArray(raw.cert?.items)
    ? CERT.items.filter((i) => raw.cert.items.includes(i.id)).map((i) => i.id)
    : []
  // Opção e extras só dos certificados marcados que têm opção ou extra.
  const certOptions = {}
  const certExtra = {}
  for (const item of CERT.items) {
    if (!certItems.includes(item.id)) continue
    const opt = raw.cert?.options?.[item.id]
    if (item.options?.some((o) => o.id === opt)) certOptions[item.id] = opt
    else if (item.options?.length) certOptions[item.id] = item.options[0].id
    const qty = raw.cert?.extra?.[item.id]
    if (item.extra && qty) certExtra[item.id] = clampInt(qty, 0, item.extra.max || 10)
  }

  return {
    ...base,
    services,
    size,
    bathrooms,
    clean: { kind, extras },
    paint: { option: paintOption, rooms: paintRooms, materials: paintMaterials },
    fix: { trade: trade.id, tasks, package: pkg, hours },
    cert: { items: certItems, options: certOptions, extra: certExtra },
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
    const regras = regrasDaLimpeza(sel.clean.kind)
    const extraBaths = Math.max(0, sel.bathrooms - regras.includedBathrooms)
    if (extraBaths > 0) {
      lines.push({
        service: 'clean',
        id: 'clean-bathrooms',
        label: extraBaths === 1 ? 'Extra bathroom' : `${extraBaths} extra bathrooms`,
        amount: extraBathroomsPrice(sel.bathrooms, sel.clean.kind),
      })
    }
    for (const extra of regras.extras) {
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
      detail: option.unit ? `${qty} ${qty === 1 ? 'room' : 'rooms'}` : option.time || 'Up to 3.5 hours',
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
    const trade = fixTrade(sel.fix.trade)
    const pkg = trade.packages.find((p) => p.id === sel.fix.package) || suggestFixPackage(sel.fix.tasks, trade.id)
    const qty = pkg.perHour ? sel.fix.hours : 1
    lines.push({
      service: 'fix',
      id: `fix-${pkg.id}`,
      label: `${trade.id === HANDYMAN ? FIX.name : trade.label}: ${pkg.label.toLowerCase()}`,
      detail: pkg.perHour
        ? `${qty} ${qty === 1 ? 'hour' : 'hours'}`
        : sel.fix.tasks.length
          ? `${sel.fix.tasks.length} ${sel.fix.tasks.length === 1 ? 'job' : 'jobs'} on your list`
          : pkg.detail || '',
      amount: pkg.price * qty,
    })
  }

  if (sel.services.includes('cert')) {
    for (const item of CERT.items) {
      if (!sel.cert.items.includes(item.id)) continue
      const amount = certLinePrice(item, sel)
      if (amount == null) needsQuote = true
      const opt = certOption(item, sel)
      const extraQty = certExtraQty(item, sel)
      lines.push({
        service: 'cert',
        id: `cert-${item.id}`,
        label: item.label,
        detail: [opt ? opt.label : item.prices ? sizeLabel : item.valid, extraQty ? `${item.extra.label} × ${extraQty}` : null]
          .filter(Boolean)
          .join(', '),
        amount,
      })
    }
  }

  const total = lines.reduce((sum, line) => sum + (line.amount || 0), 0)
  return { selection: sel, lines, total, needsQuote }
}

/** Menor cobrança da Stripe em libra: abaixo disso o cartão nem passa. */
export const MIN_CHARGE = 0.3

/** Como a promoção aparece para o cliente: linha própria, paga pela Fixfy (modelo de agente). */
export const PROMO_LINE_LABEL = 'Fixfy promotion, paid by Fixfy on your behalf'

/**
 * Cupom aplicado ao preço: a linha do desconto entra no fim e o total cai.
 * `promo` é o que o servidor validou na Stripe (percentOff OU amountOff, em
 * libras). A conta é em pence para o total bater com a cobrança.
 *
 * Modelo de agente (06/10/2026, VAT Notice 700 22.2): as linhas de serviço
 * ficam SEMPRE no preço publicado, que é o preço do profissional. A promoção
 * é a Fixfy pagando parte desse preço em nome do cliente, então vira uma
 * linha separada e nunca baixa a linha do serviço nem o repasse.
 *
 * `offPence` (opcional) fixa o desconto em pence: é o valor que a Stripe
 * aplicou de fato no Checkout, quando o arredondamento dela difere do nosso.
 */
export function applyPromo(priced, promo, { offPence = null } = {}) {
  if (!promo || priced.needsQuote || !(priced.total > 0)) return priced
  const subtotal = Math.round(priced.total * 100)
  const off =
    offPence != null
      ? Math.min(Math.max(0, Math.round(offPence)), subtotal)
      : promo.percentOff
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
        label: PROMO_LINE_LABEL,
        detail: `Code ${promo.code}${promo.percentOff ? `, ${promo.percentOff}% off` : ''}`,
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
 * Reparte o desconto entre partes (jobs no OS) na proporção de cada uma, em
 * pence; a sobra do arredondamento fica na maior. Só serve para dizer quanto
 * o cliente pagou de cada job: o preço do job continua cheio.
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
