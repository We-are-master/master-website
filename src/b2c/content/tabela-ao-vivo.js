/**
 * Tabela de preço ao vivo: o documento que o OS publica em
 * /api/public/tabela-de-precos (formato 1, o mesmo do seed
 * master-os supabase/seed/tabela-de-precos-v1.json) aplicado POR CIMA da
 * tabela embutida em pricing.js.
 *
 * Os objetos e arrays exportados por pricing.js são alterados no lugar (nunca
 * substituídos), então todo mundo que já importou PROPERTY_SIZES, CLEAN, etc.
 * passa a ver os números novos sem mudar uma linha. A cópia intacta da tabela
 * embutida fica guardada aqui para voltar a ela quando um documento inválido
 * chegar depois de um válido.
 *
 * Usado pelo servidor (server/b2c/tabela.js) e pelo navegador (src/main.jsx).
 */
import {
  BATHROOM_OPTIONS,
  CERT,
  CLEAN,
  CLEAN_KINDS,
  DEFAULT_CLEAN_KIND,
  FIX,
  PAINT,
  PROPERTY_SIZES,
  calcularFromPrice,
  definirTipoPadrao,
} from './pricing.js'

const copia = (v) => JSON.parse(JSON.stringify(v))

/** Retrato da tabela embutida, tirado antes de qualquer documento do OS. */
const EMBUTIDA = copia({
  sizes: PROPERTY_SIZES,
  bathroomOptions: BATHROOM_OPTIONS,
  defaultCleanKind: DEFAULT_CLEAN_KIND,
  kinds: CLEAN_KINDS,
  clean: { ...CLEAN, kinds: undefined },
  paint: PAINT,
  fix: FIX,
  cert: CERT,
})

/**
 * Ids que o código usa pelo nome (padrões do normalizeSelection, repasse do
 * parceiro, títulos do OS). O documento pode acrescentar, nunca tirar.
 */
const IDS_OBRIGATORIOS = {
  kinds: EMBUTIDA.kinds.map((k) => k.id),
  paint: EMBUTIDA.paint.options.map((o) => o.id),
  fix: EMBUTIDA.fix.packages.map((p) => p.id),
  cert: EMBUTIDA.cert.items.map((i) => i.id),
}

/** Versão do documento aplicado (null = tabela embutida). */
let aplicada = null

export function tabelaAplicada() {
  return aplicada
}

const ehObjeto = (v) => v != null && typeof v === 'object' && !Array.isArray(v)
const ehTexto = (v) => typeof v === 'string' && v.trim().length > 0
const ehPreco = (v) => typeof v === 'number' && Number.isFinite(v) && v > 0
const ehInteiroPositivo = (v) => Number.isInteger(v) && v > 0

/** Lista de itens com id texto, sem repetir. Devolve o erro ou null. */
function conferirIds(lista, onde) {
  if (!Array.isArray(lista) || lista.length === 0) return `${onde}: lista vazia ou ausente`
  const vistos = new Set()
  for (const item of lista) {
    if (!ehObjeto(item) || !ehTexto(item.id)) return `${onde}: item sem id texto`
    if (vistos.has(item.id)) return `${onde}: id repetido ${item.id}`
    vistos.add(item.id)
  }
  return null
}

function faltando(lista, obrigatorios, onde) {
  const ids = new Set(lista.map((i) => i.id))
  const falta = obrigatorios.find((id) => !ids.has(id))
  return falta ? `${onde}: falta o id ${falta}` : null
}

/** Tabela por tamanho: cada tamanho ativo com número > 0 ou null. */
function conferirPrecosPorTamanho(prices, ativos, onde) {
  if (!ehObjeto(prices)) return `${onde}: prices ausente`
  for (const id of ativos) {
    if (!(id in prices)) return `${onde}: sem preço para o tamanho ${id}`
    const v = prices[id]
    if (v !== null && !ehPreco(v)) return `${onde}: preço inválido no tamanho ${id}`
  }
  return null
}

/** Lista de add-ons: ids únicos, rótulo, preço, unidade e máximo opcionais. */
function conferirExtras(lista, onde) {
  const e = conferirIds(lista, onde)
  if (e) return e
  for (const x of lista) {
    if (!ehTexto(x.label) || !ehPreco(x.price)) return `${onde}: rótulo ou preço inválido em ${x.id}`
    if (x.detail !== undefined && typeof x.detail !== 'string') return `${onde}: detail inválido em ${x.id}`
    if (x.unit !== undefined && !ehTexto(x.unit)) return `${onde}: unit inválido em ${x.id}`
    if (x.max !== undefined && !ehInteiroPositivo(x.max)) return `${onde}: max inválido em ${x.id}`
  }
  return null
}

/**
 * Regras próprias do tipo de limpeza (dono, 07/10/2026), todas opcionais:
 * ausente = vale a do CLEAN.
 */
function conferirRegrasDoTipo(k, ativos) {
  const onde = `clean.kinds.${k.id}`
  if (k.includedBathrooms !== undefined && !ehInteiroPositivo(k.includedBathrooms)) return `${onde}: includedBathrooms inválido`
  if (
    k.extraBathroomSteps !== undefined &&
    (!Array.isArray(k.extraBathroomSteps) || k.extraBathroomSteps.length === 0 || !k.extraBathroomSteps.every(ehPreco))
  ) {
    return `${onde}: extraBathroomSteps inválido`
  }
  if (k.teamOfTwoFromSize !== undefined && !ativos.includes(String(k.teamOfTwoFromSize))) {
    return `${onde}: teamOfTwoFromSize não é tamanho ativo`
  }
  if (k.extras !== undefined) return conferirExtras(k.extras, `${onde}.extras`)
  return null
}

/**
 * Conferência estrita do documento. Qualquer coisa fora do formato derruba
 * o documento inteiro (o site segue na tabela que já tem).
 */
export function validarTabela(doc) {
  const erro = (msg) => ({ ok: false, erro: msg })
  if (!ehObjeto(doc)) return erro('documento não é objeto')
  if (doc.formato !== undefined && doc.formato !== 1) return erro(`formato ${doc.formato} desconhecido`)
  if (doc.moeda !== undefined && doc.moeda !== 'GBP') return erro(`moeda ${doc.moeda} não suportada`)

  // Tamanhos.
  let e = conferirIds(doc.sizes, 'sizes')
  if (e) return erro(e)
  for (const s of doc.sizes) {
    if (!ehTexto(s.label) || !ehTexto(s.short) || !ehTexto(s.tiny)) return erro(`sizes: rótulo ausente em ${s.id}`)
    if (s.ativo !== undefined && typeof s.ativo !== 'boolean') return erro(`sizes: ativo não é booleano em ${s.id}`)
  }
  const ativos = doc.sizes.filter((s) => s.ativo !== false).map((s) => s.id)
  if (ativos.length === 0) return erro('sizes: nenhum tamanho ativo')
  // emptySelection() começa em '1': sem ele ativo a reserva nasceria inválida.
  if (!ativos.includes('1')) return erro('sizes: o tamanho 1 precisa estar ativo')

  // Banheiros.
  const banhos = doc.bathroomOptions
  if (!Array.isArray(banhos) || banhos.length === 0 || !banhos.every(ehInteiroPositivo)) {
    return erro('bathroomOptions inválido')
  }

  // Limpeza.
  const clean = doc.clean
  if (!ehObjeto(clean)) return erro('clean ausente')
  if (clean.id !== 'clean' || !ehTexto(clean.verb)) return erro('clean: id ou verb inválido')
  if (!ehInteiroPositivo(clean.includedBathrooms)) return erro('clean: includedBathrooms inválido')
  if (typeof clean.ovenIncluded !== 'boolean' || typeof clean.productsIncluded !== 'boolean') {
    return erro('clean: ovenIncluded/productsIncluded não booleano')
  }
  if (!ativos.includes(String(clean.teamOfTwoFromSize))) return erro('clean: teamOfTwoFromSize não é tamanho ativo')
  if (!Array.isArray(clean.extraBathroomSteps) || clean.extraBathroomSteps.length === 0 || !clean.extraBathroomSteps.every(ehPreco)) {
    return erro('clean: extraBathroomSteps inválido')
  }
  e = conferirExtras(clean.extras, 'clean.extras')
  if (e) return erro(e)
  e = conferirIds(clean.kinds, 'clean.kinds') || faltando(clean.kinds, IDS_OBRIGATORIOS.kinds, 'clean.kinds')
  if (e) return erro(e)
  for (const k of clean.kinds) {
    if (!ehTexto(k.name) || !ehTexto(k.osTitle) || !ehTexto(k.short) || !ehTexto(k.tiny)) {
      return erro(`clean.kinds: texto ausente em ${k.id}`)
    }
    e = conferirPrecosPorTamanho(k.prices, ativos, `clean.kinds.${k.id}`) || conferirRegrasDoTipo(k, ativos)
    if (e) return erro(e)
  }
  if (!clean.kinds.some((k) => k.id === doc.defaultCleanKind)) return erro('defaultCleanKind não é um tipo da lista')

  // Pintura.
  const paint = doc.paint
  if (!ehObjeto(paint) || paint.id !== 'paint' || !ehTexto(paint.name) || !ehTexto(paint.osTitle)) {
    return erro('paint inválido')
  }
  e = conferirIds(paint.options, 'paint.options') || faltando(paint.options, IDS_OBRIGATORIOS.paint, 'paint.options')
  if (e) return erro(e)
  for (const o of paint.options) {
    if (!ehTexto(o.label) || !ehPreco(o.price)) return erro(`paint.options: rótulo ou preço inválido em ${o.id}`)
    if (o.max !== undefined && !ehInteiroPositivo(o.max)) return erro(`paint.options: max inválido em ${o.id}`)
  }
  if (!ehObjeto(paint.materials) || !ehTexto(paint.materials.label) || !ehPreco(paint.materials.price)) {
    return erro('paint.materials inválido')
  }

  // Reparos.
  const fix = doc.fix
  if (!ehObjeto(fix) || fix.id !== 'fix' || !ehTexto(fix.name) || !ehTexto(fix.osTitle)) return erro('fix inválido')
  e = conferirIds(fix.packages, 'fix.packages') || faltando(fix.packages, IDS_OBRIGATORIOS.fix, 'fix.packages')
  if (e) return erro(e)
  for (const p of fix.packages) {
    if (!ehTexto(p.label) || !ehPreco(p.price) || !ehInteiroPositivo(p.minutes)) {
      return erro(`fix.packages: rótulo, preço ou minutos inválido em ${p.id}`)
    }
  }
  e = conferirIds(fix.tasks, 'fix.tasks')
  if (e) return erro(e)
  for (const t of fix.tasks) {
    if (!ehTexto(t.label) || !ehInteiroPositivo(t.minutes)) return erro(`fix.tasks: rótulo ou minutos inválido em ${t.id}`)
  }

  // Certificados.
  const cert = doc.cert
  if (!ehObjeto(cert) || cert.id !== 'cert' || !ehTexto(cert.name)) return erro('cert inválido')
  e = conferirIds(cert.items, 'cert.items') || faltando(cert.items, IDS_OBRIGATORIOS.cert, 'cert.items')
  if (e) return erro(e)
  for (const i of cert.items) {
    if (!ehTexto(i.label) || !ehTexto(i.osTitle)) return erro(`cert.items: texto ausente em ${i.id}`)
    if (i.prices !== undefined) {
      e = conferirPrecosPorTamanho(i.prices, ativos, `cert.items.${i.id}`)
      if (e) return erro(e)
    } else if (!ehPreco(i.price)) {
      return erro(`cert.items: preço inválido em ${i.id}`)
    }
  }

  return { ok: true, erro: null }
}

/** Troca o conteúdo de um array sem trocar o array. */
function trocarArray(alvo, novos) {
  alvo.splice(0, alvo.length, ...novos)
}

/** Troca o conteúdo de um objeto sem trocar o objeto. */
function trocarObjeto(alvo, novo) {
  for (const k of Object.keys(alvo)) delete alvo[k]
  Object.assign(alvo, novo)
}

/** Só os tamanhos ativos (o site não oferece nem cobra os outros). */
function soAtivos(prices, ativos) {
  const out = {}
  for (const id of ativos) out[id] = prices[id] ?? null
  return out
}

/** Escreve uma tabela já conferida nos objetos de pricing.js. */
function escrever(t) {
  const ativos = t.sizes.filter((s) => s.ativo !== false).map((s) => s.id)

  trocarArray(
    PROPERTY_SIZES,
    t.sizes.filter((s) => s.ativo !== false).map(({ ativo: _ativo, ...s }) => s),
  )
  trocarArray(BATHROOM_OPTIONS, t.bathroomOptions)
  definirTipoPadrao(t.defaultCleanKind)

  trocarArray(
    CLEAN_KINDS,
    t.kinds.map((k) => {
      const tipo = { ...k, prices: soAtivos(k.prices, ativos) }
      if (tipo.teamOfTwoFromSize !== undefined) tipo.teamOfTwoFromSize = String(tipo.teamOfTwoFromSize)
      return tipo
    }),
  )
  const padrao = CLEAN_KINDS.find((k) => k.id === t.defaultCleanKind)
  const { kinds: _kinds, prices: _prices, name: _name, osTitle: _osTitle, ...cleanResto } = t.clean
  trocarObjeto(CLEAN, {
    ...cleanResto,
    teamOfTwoFromSize: String(cleanResto.teamOfTwoFromSize),
    kinds: CLEAN_KINDS,
    name: padrao.name,
    osTitle: padrao.osTitle,
    prices: padrao.prices,
  })

  trocarObjeto(PAINT, t.paint)
  trocarObjeto(FIX, t.fix)
  trocarObjeto(CERT, {
    ...t.cert,
    items: t.cert.items.map((i) => (i.prices ? { ...i, prices: soAtivos(i.prices, ativos) } : i)),
  })

  calcularFromPrice()
}

/** Volta para a tabela embutida em pricing.js. */
export function restaurarEmbutida() {
  escrever(copia(EMBUTIDA))
  aplicada = null
}

/**
 * Aplica o documento do OS. Inválido: volta para a tabela embutida e devolve
 * o erro. `versao` é só para saber qual documento está no ar.
 */
export function aplicarTabela(doc, versao = null) {
  const r = validarTabela(doc)
  if (!r.ok) {
    if (aplicada) restaurarEmbutida()
    return r
  }
  const d = copia(doc)
  escrever({
    sizes: d.sizes,
    bathroomOptions: d.bathroomOptions,
    defaultCleanKind: d.defaultCleanKind,
    kinds: d.clean.kinds,
    clean: d.clean,
    paint: d.paint,
    fix: d.fix,
    cert: d.cert,
  })
  aplicada = { versao, documento: d }
  return r
}
