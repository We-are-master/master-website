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
import { partnerPayFor } from '../server/b2c/partner-pay.js'

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
        const itens = service === 'cert' ? linhas.map((l) => ({ lines: [l], certItem: l.id.slice(5) })) : [{ lines: linhas }]
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

console.log(`\nTudo certo: ${passos} conferências, ${embutida.precos.length} seleções por retrato.`)
