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
 *  - Limpeza: a faixa de 1 banheiro de cada tipo e tamanho, mais a escada
 *    de banheiro extra (a mesma do add-on de banheiro do catálogo). No end of
 *    tenancy e no after builders a faixa sobe pela escada de cômodo; no deep
 *    clean, £20 por quarto a mais (dono, 23/09/2026).
 *  - Add-ons de limpeza (carpete, geladeira, janela, varanda): 60% do preço.
 *  - Reparos: hora, meia diária (3,5h) e diária do handyman.
 *  - Pintura: valor fechado por faixa. O pacote de material é reembolso do
 *    custo, porque o site cobra custo mais 30%.
 *  - Certificados: o custo que o catálogo do OS paga em cada faixa.
 */
import { CLEAN, PAINT } from '../../src/b2c/content/pricing.js'

export const PARTNER_PAY = {
  clean: {
    /**
     * A faixa "X bed · 1 bath" do catálogo, por tipo e tamanho: cobre os
     * quartos, 1 banheiro, cozinha, sala e hall. End of tenancy e after
     * builders: £140 até 1 quarto e depois +£26, +£31, +£40, +£40. Deep clean:
     * £110 no studio, £120 no 1 quarto e £20 por quarto a mais.
     */
    bySize: {
      eot: { studio: 140, 1: 140, 2: 166, 3: 197, 4: 237, 5: 277 },
      deep: { studio: 110, 1: 120, 2: 140, 3: 160, 4: 180, 5: 200 },
      after: { studio: 140, 1: 140, 2: 166, 3: 197, 4: 237, 5: 277 },
    },
    /** Por banheiro além do primeiro, na ordem (o add-on de banheiro do catálogo). */
    step: [26, 31, 40, 40, 48],
    /** Add-on de limpeza: o parceiro leva esta fatia do preço do add-on. */
    extraPct: 60,
  },
  /** Handyman: hora, meia diária 3,5h, diária 7h. */
  fix: { hour: 40, half: 117, day: 214 },
  /** Pintura: touch-up até 3,5h, cômodo em duas demãos, e o material a custo. */
  paint: { touchup: 95, rooms: 230, materials: 100 },
  /**
   * Certificados: o custo do catálogo em cada faixa. O preço de venda vive em
   * pricing.js; aqui fica só o que o parceiro recebe.
   */
  cert: {
    gas: 60,
    eicr: { studio: 69, 1: 69, 2: 99, 3: 99, 4: 139, 5: null },
    /** O assessor de EPC cobra o mesmo em qualquer tamanho (dono, 23/09/2026). */
    epc: 60,
  },
}

const round = (n) => Math.round(n * 100) / 100

/** Soma os primeiros `n` degraus da escada; o último se repete se acabar. */
function steps(n) {
  const { step } = PARTNER_PAY.clean
  let total = 0
  for (let i = 0; i < n; i += 1) total += step[Math.min(i, step.length - 1)]
  return total
}

/**
 * Add-ons de limpeza: 60% do preço de cada unidade, em libra inteira, igual ao
 * add-on gravado no catálogo do OS (carpete £38 → £23 por cômodo, geladeira
 * £43 → £26, janela £35 → £21, varanda £57 → £34). Antes saía 60% exato
 * (£22,80 no carpete) e o job nascia com um repasse que o catálogo não tinha.
 */
function extrasPay(lines) {
  let total = 0
  for (const l of lines) {
    if (l.id === 'clean-base' || l.id === 'clean-bathrooms') continue
    const extra = CLEAN.extras.find((x) => `clean-${x.id}` === l.id)
    if (!extra) {
      total += ((l.amount || 0) * PARTNER_PAY.clean.extraPct) / 100
      continue
    }
    const qty = Math.max(1, Math.round((l.amount || 0) / extra.price))
    total += Math.round((extra.price * PARTNER_PAY.clean.extraPct) / 100) * qty
  }
  return total
}

/** Repasse da limpeza: a faixa do tamanho, a escada de banheiro e os add-ons a 60% por unidade. */
function cleanPay({ lines, size, kind, bathrooms }) {
  const band = PARTNER_PAY.clean.bySize[kind]?.[String(size)]
  if (band == null) return null
  return round(band + steps(Math.max(0, (Number(bathrooms) || 1) - 1)) + extrasPay(lines))
}

/**
 * Repasse do job, em libras, ou null quando o site não sabe (aí o OS calcula
 * e o escritório ajusta na hora de atribuir).
 *
 * `lines` são as linhas de preço DESTE job (sem desconto: o cupom sai da
 * margem da Fixfy, não do parceiro).
 */
export function partnerPayFor({ service, lines = [], size, kind, bathrooms = 1, certItem }) {
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
    const table = PARTNER_PAY.cert[certItem?.id]
    if (table == null) return null
    const own = typeof table === 'object' ? table[String(size)] : table
    return own == null ? null : round(own)
  }

  return null
}
