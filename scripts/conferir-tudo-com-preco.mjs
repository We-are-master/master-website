/**
 * Prova da tabela com tudo que tem preço em Services (dono, 07/10/2026).
 *
 *   node scripts/conferir-tudo-com-preco.mjs caminho-do-documento.json
 *
 * 1. O que o site já vendia continua com o MESMO total (só o EICR 5+ quartos
 *    deixa de ser "sob consulta" e passa a ter preço).
 * 2. Cada item novo sai com o preço e o repasse de Services.
 */
import { readFileSync } from 'node:fs'
import { strictEqual, ok } from 'node:assert/strict'
import * as P from '../src/b2c/content/pricing.js'
import { restaurarEmbutida } from '../src/b2c/content/tabela-ao-vivo.js'
import { partnerPayFor, restaurarRepasse } from '../server/b2c/partner-pay.js'
import { aplicarDocumento } from '../server/b2c/tabela.js'
import { catalog } from '../server/b2c/agent.js'

const DOC = JSON.parse(readFileSync(process.argv[2], 'utf8'))
let falhas = 0
const passo = (nome, fn) => {
  try {
    fn()
    console.log(`  ok  ${nome}`)
  } catch (e) {
    falhas += 1
    console.log(`  FALHOU  ${nome}: ${e.message.split('\n')[0]}`)
  }
}

// ---------- 1. o que já existia ----------
restaurarEmbutida()
restaurarRepasse()
const antigas = []
for (const size of P.PROPERTY_SIZES.map((s) => s.id)) {
  for (const kind of P.CLEAN_KINDS.map((k) => k.id)) {
    for (const bathrooms of [1, 2, 3, 4]) {
      for (const extras of [{}, ...P.CLEAN.extras.map((e) => ({ [e.id]: e.unit ? 3 : 1 }))]) {
        antigas.push({ services: ['clean'], size, bathrooms, clean: { kind, extras } })
      }
    }
  }
  for (const items of [['gas'], ['eicr'], ['epc'], ['gas', 'eicr', 'epc']]) antigas.push({ services: ['cert'], size, cert: { items } })
}
for (const option of ['touchup', 'rooms']) for (const materials of [true, false]) antigas.push({ services: ['paint'], paint: { option, rooms: 3, materials } })
for (const pkg of ['half', 'day']) antigas.push({ services: ['fix'], fix: { tasks: ['holes'], package: pkg } })
antigas.push({ services: ['fix'], fix: { tasks: ['holes', 'silicone', 'tap', 'doors', 'brackets'] } })
const antes = antigas.map((s) => P.priceSelection(s))

console.log('\n1. Documento do OS aplicado')
passo('válido (tabela e repasse)', () => {
  const r = aplicarDocumento(DOC, 4)
  ok(r.ok, r.erro)
  ok(r.repasse.ok && !r.repasse.embutido, r.repasse.erro || 'repasse embutido')
})

console.log('\n2. O que o site já vendia: mesmo total')
let iguais = 0
const mudou = []
antigas.forEach((s, i) => {
  const depois = P.priceSelection(s)
  if (depois.total === antes[i].total && depois.needsQuote === antes[i].needsQuote) iguais += 1
  else mudou.push({ s, antes: antes[i].needsQuote ? 'quote' : antes[i].total, depois: depois.needsQuote ? 'quote' : depois.total })
})
console.log(`  ${iguais} de ${antigas.length} iguais`)
passo('só o EICR de 5+ quartos mudou (de sob consulta para preço)', () => {
  for (const m of mudou) {
    ok(m.s.services[0] === 'cert' && m.s.size === '5' && m.s.cert.items.includes('eicr') && m.antes === 'quote', `mudou: ${JSON.stringify(m)}`)
  }
})

console.log('\n3. Itens novos: preço e repasse de Services')
const pp = DOC.partnerPay
const caso = (nome, sel, total, repasse, extra = {}) =>
  passo(`${nome}: £${total}, repasse £${repasse}`, () => {
    const pr = P.priceSelection(sel)
    strictEqual(pr.total, total)
    strictEqual(pr.needsQuote, false)
    const s = pr.selection
    const service = s.services[0]
    const certItem = service === 'cert' ? P.CERT.items.find((i) => i.id === s.cert.items[0]) : undefined
    const pay = partnerPayFor({
      service,
      lines: pr.lines,
      size: s.size,
      kind: s.clean.kind,
      bathrooms: s.bathrooms,
      certItem,
      fixTrade: s.fix.trade,
      hours: s.fix.hours,
      certOption: certItem ? P.certOption(certItem, s)?.id : null,
      certExtra: certItem ? P.certExtraQty(certItem, s) : 0,
      ...extra,
    })
    strictEqual(pay, repasse)
  })

caso('EoT 2 quartos + sofá 3 lugares + 2 colchões de casal', { services: ['clean'], size: '2', clean: { kind: 'eot', extras: { sofa3: 1, mattress2: 2 } } },
  DOC.clean.kinds.find((k) => k.id === 'eot').prices['2'] + 42 + 33 * 2,
  pp.clean.bySize.eot['2'] + pp.clean.extras.eot.sofa3 + pp.clean.extras.eot.mattress2 * 2)
caso('Deep 1 quarto + estacionamento + congestion', { services: ['clean'], size: '1', clean: { kind: 'deep', extras: { parking: 1, congestion: 1 } } },
  DOC.clean.kinds.find((k) => k.id === 'deep').prices['1'] + 14 + 18, pp.clean.bySize.deep['1'] + 14 + 18)
caso('Pintura diária com material', { services: ['paint'], paint: { option: 'day', materials: true } }, 465 + 130, 240 + 100)
caso('Handyman 3 horas', { services: ['fix'], fix: { tasks: ['holes'], package: 'hour', hours: 3 } }, 72 * 3, 40 * 3)
caso('Plumber meia diária', { services: ['fix'], fix: { trade: 'plumber', package: 'half' } }, 180, 117)
caso('Carpenter diária', { services: ['fix'], fix: { trade: 'carpenter', package: 'day' } }, 329, 214)
caso('Electrician 2 horas', { services: ['fix'], fix: { trade: 'electrician', hours: 2 } }, 84 * 2, 50 * 2)
caso('Gas com 3 aparelhos', { services: ['cert'], cert: { items: ['gas'], options: { gas: 'a3' } } }, 99, 72)
caso('Gas sem escolher (1 aparelho)', { services: ['cert'], cert: { items: ['gas'] } }, 79, 60)
caso('EICR 5+ quartos', { services: ['cert'], size: '5', cert: { items: ['eicr'] } }, 265, 165)
caso('Fire risk, HMO 3 a 4 quartos', { services: ['cert'], cert: { items: ['fra'], options: { fra: 'hmo34' } } }, 209, 155)
caso('Fire door, 1 + 3 portas', { services: ['cert'], cert: { items: ['firedoor'], extra: { firedoor: 3 } } }, 159 + 99 * 3, 120 + 75 * 3)
caso('Asbestos, 1 + 2 amostras', { services: ['cert'], cert: { items: ['asbestos'], extra: { asbestos: 2 } } }, 399 + 69 * 2, 300 + 50 * 2)
caso('PAT 21 a 30 itens', { services: ['cert'], cert: { items: ['pat'], options: { pat: 'i30' } } }, 109, 85)
caso('Fire alarm comercial', { services: ['cert'], cert: { items: ['alarm'], options: { alarm: 'commercial' } } }, 91, 79)
caso('Emergency lighting 4 a 10', { services: ['cert'], cert: { items: ['emlight'], options: { emlight: 'up10' } } }, 149, 110)
caso('Extintores 4 a 8', { services: ['cert'], cert: { items: ['extinguisher'], options: { extinguisher: 'up8' } } }, 179, 135)
caso('Legionella', { services: ['cert'], cert: { items: ['legionella'] } }, 329, 250)
caso('Boiler service', { services: ['cert'], cert: { items: ['boiler'] } }, 70, 56)

console.log('\n4. Seleção estranha não quebra')
passo('profissão desconhecida vira handyman', () => strictEqual(P.normalizeSelection({ fix: { trade: 'astronaut' } }).fix.trade, 'handyman'))
passo('opção desconhecida vira a primeira', () => strictEqual(P.normalizeSelection({ services: ['cert'], cert: { items: ['gas'], options: { gas: 'zzz' } } }).cert.options.gas, 'a1'))
passo('extra acima do máximo fica no máximo', () => strictEqual(P.normalizeSelection({ services: ['cert'], cert: { items: ['firedoor'], extra: { firedoor: 999 } } }).cert.extra.firedoor, 20))
passo('handyman ainda sugere meia diária para 1 tarefa', () => strictEqual(P.suggestFixPackage(['holes']).id, 'half'))
passo('"from" do reparo segue a meia diária', () => strictEqual(P.FROM_PRICE.fix, 180))
passo('Harvey vê profissões e opções', () => {
  const c = catalog()
  ok(c.handyman.trades.some((t) => t.id === 'electrician'))
  ok(c.certificates.find((i) => i.id === 'gas').options.length === 4)
})

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTudo certo.')
process.exit(falhas ? 1 : 0)
