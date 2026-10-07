/**
 * Prova de que a tabela do OS dá o MESMO preço que a tabela embutida.
 *
 *   node scripts/conferir-tabela.mjs [caminho-do-documento.json]
 *
 * 1. Calcula uma bateria larga de seleções com a tabela embutida (pricing.js).
 * 2. Aplica o documento do OS (padrão: scripts/fixtures/tabela-de-precos-v1.json,
 *    cópia do seed do master-os) e confere que tudo sai idêntico: linhas,
 *    total, needsQuote, tamanhos, FROM_PRICE, catálogo do Harvey.
 * 3. Confere que os tamanhos inativos (6 a 10) são recusados igual a hoje.
 * 4. Aplica um documento alterado (tamanho 6 ativo, preço mudado) e confere
 *    que a mudança aparece. Depois um inválido, que volta para a embutida.
 *
 * Sai com código 1 em qualquer diferença.
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deepStrictEqual, strictEqual, ok } from 'node:assert/strict'
import * as P from '../src/b2c/content/pricing.js'
import { aplicarTabela, restaurarEmbutida, tabelaAplicada, validarTabela } from '../src/b2c/content/tabela-ao-vivo.js'
import { catalog } from '../server/b2c/agent.js'
import { partnerPayFor, restaurarRepasse } from '../server/b2c/partner-pay.js'
import { aplicarDocumento } from '../server/b2c/tabela.js'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const caminho = process.argv[2] || resolve(raiz, 'scripts/fixtures/tabela-de-precos-v1.json')
const SEED = JSON.parse(readFileSync(caminho, 'utf8'))
const copia = (v) => JSON.parse(JSON.stringify(v))

// ---------- bateria de seleções ----------
function selecoes() {
  const out = []
  const tamanhos = [...P.PROPERTY_SIZES.map((s) => s.id), '6', '7', '8', '9', '10', 'abc', undefined]
  const kinds = [...P.CLEAN_KINDS.map((k) => k.id), 'regular', undefined]
  const extrasCombos = [
    {},
    ...P.CLEAN.extras.map((e) => ({ [e.id]: 1 })),
    { carpet: 3 },
    { carpet: 8 },
    { carpet: 12 },
    Object.fromEntries(P.CLEAN.extras.map((e) => [e.id, 2])),
  ]
  for (const size of tamanhos) {
    for (const kind of kinds) {
      for (const bathrooms of [1, 2, 3, 4, 5, 0]) {
        for (const extras of extrasCombos) {
          out.push({ services: ['clean'], size, bathrooms, clean: { kind, extras } })
        }
      }
    }
  }
  for (const option of [...P.PAINT.options.map((o) => o.id), 'nope']) {
    for (let rooms = 0; rooms <= 9; rooms += 1) {
      for (const materials of [false, true]) out.push({ services: ['paint'], paint: { option, rooms, materials } })
    }
  }
  const tarefas = P.FIX.tasks.map((t) => t.id)
  const listas = [[], ...tarefas.map((t) => [t]), tarefas, tarefas.slice(0, 4), tarefas.slice(0, 7), ['holes', 'silicone', 'brackets', 'flatpack', 'tap']]
  for (const pkg of [null, ...P.FIX.packages.map((p) => p.id), 'week']) {
    for (const tasks of listas) out.push({ services: ['fix'], fix: { tasks, package: pkg } })
  }
  const certs = P.CERT.items.map((i) => i.id)
  for (const size of tamanhos) {
    for (const items of [...certs.map((c) => [c]), certs, []]) out.push({ services: ['cert'], size, cert: { items } })
  }
  // Combinações de serviços.
  for (const size of tamanhos) {
    out.push({
      services: ['cert', 'clean', 'paint', 'fix'],
      size,
      bathrooms: 3,
      clean: { kind: 'deep', extras: { carpet: 2, fridge: 1 } },
      paint: { option: 'rooms', rooms: 3, materials: true },
      fix: { tasks: ['holes', 'tap'] },
      cert: { items: certs },
    })
    out.push({ services: ['clean', 'cert'], size, clean: { kind: 'after' }, cert: { items: ['eicr'] } })
  }
  out.push({}, { services: 'clean' }, { services: ['bogus'] })
  return out
}

/** Tudo que depende da tabela, num retrato comparável. */
function retrato() {
  const sels = selecoes()
  return {
    precos: sels.map((s) => {
      const r = P.priceSelection(s)
      return { lines: r.lines, total: r.total, needsQuote: r.needsQuote, selection: r.selection }
    }),
    promo: sels.slice(0, 200).map((s) => P.applyPromo(P.priceSelection(s), { code: 'TEST10', percentOff: 10 })),
    normalizados: sels.map((s) => P.normalizeSelection(s)),
    servico: sels.map((s) => P.normalizeSelection(s).services.map((id) => P.serviceName(id, P.normalizeSelection(s)))),
    // Repasse do parceiro por serviço (e por certificado), como o booking.js monta.
    repasse: sels.map((s) => {
      const r = P.priceSelection(s)
      const sel = r.selection
      const partes = []
      for (const service of sel.services) {
        const linhas = r.lines.filter((l) => l.service === service)
        const itens = service === 'cert' ? linhas.map((l) => ({ lines: [l], certItem: { id: l.id.slice(5) } })) : [{ lines: linhas }]
        for (const { lines, certItem } of itens) {
          try {
            partes.push(partnerPayFor({ service, lines, size: sel.size, kind: sel.clean?.kind, bathrooms: sel.bathrooms, certItem }))
          } catch (e) {
            partes.push(`erro: ${e.message}`)
          }
        }
      }
      return partes
    }),
    tamanhos: copia(P.PROPERTY_SIZES),
    banheiros: copia(P.BATHROOM_OPTIONS),
    tipos: copia(P.CLEAN_KINDS),
    tipoPadrao: P.DEFAULT_CLEAN_KIND,
    vazio: P.emptySelection(),
    fromPrice: { ...P.FROM_PRICE },
    clean: copia({ ...P.CLEAN, kinds: undefined }),
    paint: copia(P.PAINT),
    fix: copia(P.FIX),
    cert: copia(P.CERT),
    times: [...P.PROPERTY_SIZES.map((s) => s.id), '6'].map((id) => P.cleanTeamSize(id)),
    escada: [0, 1, 2, 3, 4, 5, 6].map((b) => P.extraBathroomsPrice(b)),
    sugestao: [[], ['holes'], P.FIX.tasks.map((t) => t.id)].map((t) => P.suggestFixPackage(t).id),
    harvey: catalog(),
  }
}

// Objetos com a mesma informação podem ter chaves em outra ordem: comparar canônico.
function canonico(v) {
  if (Array.isArray(v)) return v.map(canonico)
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.keys(v).sort().filter((k) => v[k] !== undefined).map((k) => [k, canonico(v[k])]))
  }
  return v
}

let passos = 0
function passo(nome, fn) {
  fn()
  passos += 1
  console.log(`  ok  ${nome}`)
}

console.log(`Documento: ${caminho}`)
const refs = { sizes: P.PROPERTY_SIZES, kinds: P.CLEAN_KINDS, clean: P.CLEAN, cert: P.CERT, from: P.FROM_PRICE }
const embutida = retrato()
console.log(`Bateria: ${embutida.precos.length} seleções`)

// ---------- 1. documento do OS igual à tabela de hoje ----------
console.log('\n1. Documento do OS = tabela embutida')
passo('documento válido', () => deepStrictEqual(validarTabela(SEED), { ok: true, erro: null }))
passo('aplicado', () => strictEqual(aplicarTabela(SEED, 1).ok, true))
passo('versão registrada', () => strictEqual(tabelaAplicada()?.versao, 1))
const doOs = retrato()
passo('mesmos objetos (mutados no lugar, não trocados)', () => {
  strictEqual(P.PROPERTY_SIZES, refs.sizes)
  strictEqual(P.CLEAN_KINDS, refs.kinds)
  strictEqual(P.CLEAN, refs.clean)
  strictEqual(P.CERT, refs.cert)
  strictEqual(P.FROM_PRICE, refs.from)
  strictEqual(P.CLEAN.kinds, P.CLEAN_KINDS)
  strictEqual(P.CLEAN.prices, P.cleanKind('eot').prices)
})
for (const chave of Object.keys(embutida)) {
  passo(`idêntico: ${chave}`, () => deepStrictEqual(canonico(doOs[chave]), canonico(embutida[chave])))
}
passo('totais idênticos um a um', () => {
  embutida.precos.forEach((p, i) => {
    strictEqual(doOs.precos[i].total, p.total)
    strictEqual(doOs.precos[i].needsQuote, p.needsQuote)
  })
})

// ---------- 2. tamanhos inativos ----------
console.log('\n2. Tamanhos inativos (6 a 10) recusados igual a hoje')
for (const id of ['6', '7', '8', '9', '10']) {
  passo(`tamanho ${id} vira '1'`, () => {
    strictEqual(P.normalizeSelection({ size: id }).size, '1')
    ok(!P.PROPERTY_SIZES.some((s) => s.id === id))
    strictEqual(P.priceSelection({ services: ['clean'], size: id }).total, P.priceSelection({ services: ['clean'], size: '1' }).total)
  })
}
passo('preços dos inativos não vazam para o Harvey', () => {
  for (const k of catalog().cleaning.kinds) ok(!('6' in k.prices))
})

// ---------- 3. documento alterado ----------
console.log('\n3. Documento alterado: tamanho 6 ativo e EoT 2 quartos £999')
const alterado = copia(SEED)
alterado.sizes.find((s) => s.id === '6').ativo = true
alterado.clean.kinds.find((k) => k.id === 'eot').prices['2'] = 999
alterado.paint.materials.price = 140
passo('aplicado', () => strictEqual(aplicarTabela(alterado, 2).ok, true))
passo('tamanho 6 oferecido', () => ok(P.PROPERTY_SIZES.some((s) => s.id === '6')))
passo('tamanho 6 aceito e cobrado £518 (EoT)', () => {
  const r = P.priceSelection({ services: ['clean'], size: '6' })
  strictEqual(r.selection.size, '6')
  strictEqual(r.total, 518)
  strictEqual(r.needsQuote, false)
})
passo('EICR no 6 quartos fica sob consulta', () => strictEqual(P.priceSelection({ services: ['cert'], size: '6', cert: { items: ['eicr'] } }).needsQuote, true))
passo('EoT 2 quartos agora £999', () => strictEqual(P.priceSelection({ services: ['clean'], size: '2' }).total, 999))
passo('CLEAN.prices segue o tipo padrão', () => strictEqual(P.CLEAN.prices['2'], 999))
passo('pacote de material £140', () => strictEqual(P.priceSelection({ services: ['paint'], paint: { materials: true } }).total, 215 + 140))
passo('Harvey vê o preço novo', () => strictEqual(catalog().cleaning.kinds.find((k) => k.id === 'eot').prices['2'], 999))
passo('tamanho 7 continua recusado', () => strictEqual(P.normalizeSelection({ size: '7' }).size, '1'))

// ---------- 3b. regras próprias por tipo de limpeza ----------
console.log('\n3b. Regras por tipo: deep com 2 banheiros inclusos, escada própria, dois a partir de 3 quartos e add-ons próprios')
const porTipo = copia(SEED)
const deepDoc = porTipo.clean.kinds.find((k) => k.id === 'deep')
deepDoc.includedBathrooms = 2
deepDoc.extraBathroomSteps = [30, 40, 50]
deepDoc.teamOfTwoFromSize = '3'
deepDoc.extras = [
  { id: 'oven-extra', label: 'Second oven', detail: 'Range or double oven', price: 25 },
  { id: 'carpet', label: 'Carpet steam clean', detail: 'Per room', price: 30, unit: 'room', max: 6 },
]
passo('documento válido e aplicado', () => strictEqual(aplicarTabela(porTipo, 4).ok, true))
const deep = (extra) => P.priceSelection({ services: ['clean'], size: '2', clean: { kind: 'deep', extras: {} }, ...extra })
const eot = (extra) => P.priceSelection({ services: ['clean'], size: '2', clean: { kind: 'eot', extras: {} }, ...extra })
passo('deep: 2 banheiros sem cobrança extra', () => strictEqual(deep({ bathrooms: 2 }).total, 237))
passo('deep: 3 banheiros = +£30, 4 = +£70', () => {
  strictEqual(deep({ bathrooms: 3 }).total, 237 + 30)
  strictEqual(deep({ bathrooms: 4 }).total, 237 + 30 + 40)
  strictEqual(P.extraBathroomsPrice(4, 'deep'), 70)
})
passo('deep: equipe de dois só a partir de 3 quartos', () => {
  strictEqual(P.cleanTeamSize('2', 'deep'), 1)
  strictEqual(P.cleanTeamSize('3', 'deep'), 2)
  strictEqual(P.cleanTeamSize('2', 'eot'), 2)
})
passo('deep: add-ons próprios cobrados', () => {
  const r = deep({ clean: { kind: 'deep', extras: { 'oven-extra': 1, carpet: 9 } } })
  deepStrictEqual(r.selection.clean.extras, { 'oven-extra': 1, carpet: 6 })
  strictEqual(r.total, 237 + 25 + 30 * 6)
})
passo('deep: add-on só do eot (fridge) sai da seleção', () => {
  const r = deep({ clean: { kind: 'deep', extras: { fridge: 1, balcony: 1 } } })
  deepStrictEqual(r.selection.clean.extras, {})
  strictEqual(r.total, 237)
})
passo('eot sem mudança (banheiros, add-ons, equipe)', () => {
  strictEqual(eot({ bathrooms: 3, clean: { kind: 'eot', extras: { fridge: 1, carpet: 2 } } }).total, 266 + 42 + 52 + 43 + 76)
  strictEqual(eot({ clean: { kind: 'eot', extras: { 'oven-extra': 1 } } }).total, 266)
})
passo('eot e after idênticos à embutida em toda a bateria', () => {
  const agora = retrato().precos
  embutida.precos.forEach((p, i) => {
    if (p.selection.clean.kind === 'deep' && p.selection.services.includes('clean')) return
    deepStrictEqual(canonico(agora[i]), canonico(p))
  })
})
passo('repasse do parceiro usa os add-ons do deep', () => {
  const r = deep({ clean: { kind: 'deep', extras: { 'oven-extra': 1 } } })
  strictEqual(partnerPayFor({ service: 'clean', lines: r.lines, size: '2', kind: 'deep', bathrooms: 1 }), 140 + 15)
})
passo('Harvey vê as regras por tipo', () => {
  const kinds = catalog().cleaning.kinds
  const d = kinds.find((k) => k.id === 'deep')
  const e = kinds.find((k) => k.id === 'eot')
  strictEqual(d.includedBathrooms, 2)
  deepStrictEqual(d.extraBathroomSteps, [30, 40, 50])
  strictEqual(d.teamOfTwoFromSize, '3')
  deepStrictEqual(d.extras.map((x) => x.id), ['oven-extra', 'carpet'])
  strictEqual(e.includedBathrooms, 1)
  deepStrictEqual(e.extras.map((x) => x.id), ['carpet', 'fridge', 'windows', 'balcony'])
})
const invalidosPorTipo = {
  'includedBathrooms texto': (k) => (k.includedBathrooms = '2'),
  'escada vazia': (k) => (k.extraBathroomSteps = []),
  'escada com zero': (k) => (k.extraBathroomSteps = [30, 0]),
  'teamOfTwoFromSize inativo': (k) => (k.teamOfTwoFromSize = '7'),
  'add-on repetido no tipo': (k) => (k.extras = [{ id: 'a', label: 'A', price: 1 }, { id: 'a', label: 'B', price: 2 }]),
  'add-on sem preço': (k) => (k.extras = [{ id: 'a', label: 'A' }]),
}
for (const [nome, estraga] of Object.entries(invalidosPorTipo)) {
  passo(`recusa por tipo: ${nome}`, () => {
    const d = copia(porTipo)
    estraga(d.clean.kinds.find((k) => k.id === 'deep'))
    strictEqual(validarTabela(d).ok, false)
  })
}

// ---------- 4. documento inválido volta para a embutida ----------
console.log('\n4. Documento inválido volta para a tabela embutida')
const invalidos = {
  'preço negativo': (d) => (d.clean.kinds[0].prices['1'] = -5),
  'preço texto': (d) => (d.clean.extras[0].price = '38'),
  'tamanho ativo sem preço': (d) => delete d.clean.kinds[1].prices['3'],
  'tipo eot removido': (d) => d.clean.kinds.shift(),
  'pacote sem preço': (d) => delete d.fix.packages[0].price,
  'id numérico': (d) => (d.fix.tasks[0].id = 7),
  'id repetido': (d) => (d.clean.extras[1].id = d.clean.extras[0].id),
  'certificado sem preço no tamanho': (d) => delete d.cert.items[2].prices['4'],
  'tamanho 1 inativo': (d) => (d.sizes[1].ativo = false),
  'tipo padrão inexistente': (d) => (d.defaultCleanKind = 'regular'),
}
for (const [nome, estraga] of Object.entries(invalidos)) {
  passo(`recusa: ${nome}`, () => {
    const d = copia(SEED)
    estraga(d)
    strictEqual(validarTabela(d).ok, false)
  })
}
passo('recusa: nulo / texto', () => {
  strictEqual(validarTabela(null).ok, false)
  strictEqual(validarTabela('x').ok, false)
})
const estragado = copia(alterado)
estragado.clean.kinds[0].prices['1'] = 0
passo('aplicar inválido devolve erro', () => strictEqual(aplicarTabela(estragado, 3).ok, false))
passo('voltou para a embutida', () => strictEqual(tabelaAplicada(), null))
const deVolta = retrato()
for (const chave of Object.keys(embutida)) {
  passo(`idêntico à embutida: ${chave}`, () => deepStrictEqual(canonico(deVolta[chave]), canonico(embutida[chave])))
}
restaurarEmbutida()

// ---------- 5. documento do OS com partnerPay (aba Services) ----------
const URL_OS = process.env.OS_TABELA_URL || 'http://localhost:3018/api/public/tabela-de-precos'
const FIXTURE_OS = resolve(raiz, 'scripts/fixtures/tabela-do-os-v3-services.json')
let vivo
try {
  const res = await fetch(URL_OS, { signal: AbortSignal.timeout(3000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  vivo = await res.json()
  console.log(`\n5. Documento do OS ao vivo (${URL_OS}, versão ${vivo.versao}, fonte ${vivo.documento?.fonte})`)
} catch (err) {
  vivo = JSON.parse(readFileSync(FIXTURE_OS, 'utf8'))
  console.log(`\n5. OS fora do ar (${err.message}): cópia salva ${FIXTURE_OS} (versão ${vivo.versao})`)
}
const DOC_OS = vivo.documento
passo('tem partnerPay e fonte services', () => {
  ok(DOC_OS.partnerPay)
  strictEqual(DOC_OS.fonte, 'services')
})
passo('aplicado com repasse do OS', () => {
  const r = aplicarDocumento(DOC_OS, vivo.versao)
  strictEqual(r.ok, true)
  strictEqual(r.repasse.ok, true)
  ok(!r.repasse.embutido)
})
const comOs = retrato()
for (const chave of Object.keys(embutida)) {
  passo(`idêntico com o OS: ${chave}`, () => deepStrictEqual(canonico(comOs[chave]), canonico(embutida[chave])))
}
passo('repasse por seleção idêntico um a um (cliente e parceiro)', () => {
  embutida.repasse.forEach((r, i) => deepStrictEqual(comOs.repasse[i], r))
  ok(embutida.repasse.flat().filter((v) => typeof v === 'number').length > 1000)
})
const repasse = (service, extra) => {
  const r = P.priceSelection({ services: [service], size: '2', ...extra })
  return partnerPayFor({ service, lines: r.lines, size: r.selection.size, kind: r.selection.clean.kind, bathrooms: r.selection.bathrooms, certItem: extra?.certItem })
}
passo('EPC por tamanho (£60) e escada além do documento (5 banheiros extra)', () => {
  strictEqual(repasse('cert', { size: '4', cert: { items: ['epc'] }, certItem: { id: 'epc' } }), 60)
  const r = P.priceSelection({ services: ['clean'], size: '1' })
  strictEqual(partnerPayFor({ service: 'clean', lines: r.lines, size: '1', kind: 'eot', bathrooms: 6 }), 140 + 26 + 31 + 40 + 40 + 48)
})
const mexido = copia(DOC_OS)
mexido.partnerPay.clean.extras.deep.carpet = 20
mexido.partnerPay.fix.half = 120
mexido.partnerPay.cert.epc = 70
mexido.partnerPay.clean.bySize.after['2'] = 170
passo('partnerPay alterado vale (add-on por tipo, meia diária, EPC número antigo, faixa)', () => {
  strictEqual(aplicarDocumento(mexido, 4).repasse.ok, true)
  strictEqual(repasse('clean', { clean: { kind: 'deep', extras: { carpet: 3 } } }), 140 + 20 * 3)
  strictEqual(repasse('clean', { clean: { kind: 'eot', extras: { carpet: 3 } } }), 166 + 23 * 3)
  strictEqual(repasse('fix', { fix: { package: 'half' } }), 120)
  strictEqual(repasse('cert', { size: '5', cert: { items: ['epc'] }, certItem: { id: 'epc' } }), 70)
  strictEqual(repasse('clean', { clean: { kind: 'after' } }), 170)
})
passo('add-on sem valor no OS cai nos 60%', () => {
  const d = copia(DOC_OS)
  delete d.partnerPay.clean.extras.eot.fridge
  aplicarDocumento(d, 5)
  strictEqual(repasse('clean', { clean: { kind: 'eot', extras: { fridge: 1 } } }), 166 + 26)
})
const repasseRuim = {
  'meia diária negativa': (pp) => (pp.fix.half = -1),
  'faixa texto': (pp) => (pp.clean.bySize.eot['2'] = '166'),
  'sem o tipo deep': (pp) => delete pp.clean.bySize.deep,
  'escada vazia': (pp) => (pp.clean.step = []),
  'EPC texto': (pp) => (pp.cert.epc = 'sixty'),
  'add-on zero': (pp) => (pp.clean.extras.eot.carpet = 0),
}
for (const [nome, estraga] of Object.entries(repasseRuim)) {
  passo(`partnerPay inválido (${nome}) volta para o repasse embutido`, () => {
    aplicarDocumento(mexido, 6)
    const d = copia(DOC_OS)
    estraga(d.partnerPay)
    const r = aplicarDocumento(d, 7)
    strictEqual(r.ok, true)
    strictEqual(r.repasse.ok, false)
    deepStrictEqual(retrato().repasse, embutida.repasse)
  })
}
passo('documento sem partnerPay = repasse embutido', () => {
  aplicarDocumento(mexido, 8)
  const d = copia(DOC_OS)
  delete d.partnerPay
  strictEqual(aplicarDocumento(d, 9).repasse.embutido, true)
  deepStrictEqual(retrato().repasse, embutida.repasse)
})
passo('tabela inválida volta as duas para as embutidas', () => {
  aplicarDocumento(mexido, 10)
  const d = copia(mexido)
  d.fix.packages = []
  strictEqual(aplicarDocumento(d, 11).ok, false)
  deepStrictEqual(canonico(retrato()), canonico(embutida))
})
restaurarEmbutida()
restaurarRepasse()

console.log(`\nTudo certo: ${passos} conferências, ${embutida.precos.length} seleções por retrato.`)
