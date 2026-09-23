/**
 * O que a Fixfy paga ao parceiro em cada reserva do site (dono, 22/09/2026).
 *
 * Vai como `partner_cost` no job do OS, então o job já nasce com o repasse
 * certo e ninguém precisa corrigir depois. Quem atribui continua mandando:
 * escolher um parceiro com outro valor no OS sobrescreve isto.
 *
 * Os números são os mesmos das faixas do service catalog do OS (aba Services),
 * copiados aqui porque o site não consulta o OS na hora de criar o job. Mudou
 * lá, muda aqui:
 *
 *  - Limpeza: base por tipo mais a escada de cômodo. A escada é a mesma para
 *    quarto e banheiro extra, contada em separado, e é 60% do que o cliente
 *    paga a mais, o que segura a margem quando o imóvel cresce.
 *  - Add-ons de limpeza (carpete, geladeira, janela, varanda): 60% do preço.
 *  - Reparos: hora, meia diária (3,5h) e diária do handyman.
 *  - Pintura: valor fechado por faixa. O pacote de material é reembolso do
 *    custo, porque o site cobra custo mais 30%.
 *  - Certificados: o custo que o catálogo do OS paga em cada faixa.
 */
import { PAINT } from '../../src/b2c/content/pricing.js'

export const PARTNER_PAY = {
  clean: {
    /** Base do tipo: cobre 1 quarto, 1 banheiro, cozinha, sala e hall. */
    base: { eot: 140, deep: 130, after: 140 },
    /** Por quarto e por banheiro além do primeiro, na ordem. */
    step: [26, 31, 40, 40, 48],
    /** Add-on de limpeza: o parceiro leva esta fatia do preço do add-on. */
    extraPct: 60,
  },
  /** Handyman: hora, meia diária 3,5h, diária 7h. */
  fix: { hour: 40, half: 117, day: 214 },
  /** Pintura: touch-up até 3,5h, cômodo em duas demãos, e o material a custo. */
  paint: { touchup: 95, rooms: 230, materials: 100 },
  /** Certificados: o custo do catálogo em cada faixa. */
  cert: {
    gas: 60,
    boiler: 56,
    pat: 50,
    eicr: { studio: 69, 1: 69, 2: 99, 3: 99, 4: 139, 5: null },
    /** O preço do EICR por tamanho vive em pricing.js; aqui fica só o custo. */
  },
}

/** Studio e 1 quarto são a base; o degrau começa no segundo quarto. */
const SIZE_ORDER = ['studio', '1', '2', '3', '4', '5']
const extraBedrooms = (size) => Math.max(0, SIZE_ORDER.indexOf(String(size)) - 1)
const round = (n) => Math.round(n * 100) / 100
const sum = (lines) => lines.reduce((s, l) => s + (l.amount || 0), 0)

/** Soma os primeiros `n` degraus da escada; o último se repete se acabar. */
function steps(n) {
  const { step } = PARTNER_PAY.clean
  let total = 0
  for (let i = 0; i < n; i += 1) total += step[Math.min(i, step.length - 1)]
  return total
}

/** Repasse da limpeza: base do tipo, escada de quarto e de banheiro, add-ons a 60%. */
function cleanPay({ lines, size, kind, bathrooms }) {
  const base = PARTNER_PAY.clean.base[kind]
  if (base == null || SIZE_ORDER.indexOf(String(size)) < 0) return null
  const beds = extraBedrooms(size)
  const extras = sum(lines.filter((l) => l.id !== 'clean-base' && l.id !== 'clean-bathrooms'))
  return round(base + steps(beds) + steps(Math.max(0, (Number(bathrooms) || 1) - 1)) + (extras * PARTNER_PAY.clean.extraPct) / 100)
}

/**
 * Repasse do job, em libras, ou null quando o site não sabe (aí o OS calcula
 * e o escritório ajusta na hora de atribuir).
 *
 * `lines` são as linhas de preço DESTE job (sem desconto: o cupom sai da
 * margem da Fixfy, não do parceiro).
 */
export function partnerPayFor({ service, lines = [], size, kind, bathrooms = 1, certItem, withBoiler }) {
  if (!lines.length) return null

  if (service === 'clean') return cleanPay({ lines, size, kind, bathrooms })

  if (service === 'fix') {
    const pkg = lines.find((l) => l.id?.startsWith('fix-'))?.id.slice(4)
    return PARTNER_PAY.fix[pkg] ?? null
  }

  if (service === 'paint') {
    const materials = lines.some((l) => l.id === 'paint-materials') ? PARTNER_PAY.paint.materials : 0
    const rooms = lines.find((l) => l.id === 'paint-rooms')
    if (rooms) {
      // O preço do cômodo é por unidade; o repasse acompanha a quantidade.
      const perRoom = PAINT.options.find((o) => o.id === 'rooms')?.price || 1
      const qty = Math.max(1, Math.round(rooms.amount / perRoom))
      return round(PARTNER_PAY.paint.rooms * qty + materials)
    }
    return round(PARTNER_PAY.paint.touchup + materials)
  }

  if (service === 'cert') {
    const id = certItem?.id
    if (!id) return null
    const own = id === 'eicr' ? PARTNER_PAY.cert.eicr[String(size)] : PARTNER_PAY.cert[id]
    if (own == null) return null
    return round(own + (withBoiler ? PARTNER_PAY.cert.boiler : 0))
  }

  return null
}
