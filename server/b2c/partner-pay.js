/**
 * O que a Fixfy paga ao parceiro em cada reserva do site (dono, 22/09/2026).
 *
 * Vai como `partner_cost` no job do OS, então o job já nasce com o repasse
 * certo e ninguém precisa corrigir depois. Quem atribui continua mandando:
 * escolher um parceiro com outro valor no OS sobrescreve isto.
 *
 *  - Limpeza: valor fechado por tamanho, não porcentagem. Add-ons (banheiro
 *    extra, carpete, geladeira, janelas, varanda) entram a 60%.
 *  - Reparos: meia diária (3,5h) e diária do handyman.
 *  - Pintura: 60% do preço do site (40% fica com a Fixfy). O pacote de
 *    material é reembolso do custo, porque o site cobra custo + 30%.
 *  - Certificados: o custo do catálogo. O site cobra 30% a mais.
 *
 * Quando o service catalog do OS tiver esses valores, isto aqui sai e o OS
 * passa a decidir sozinho.
 */
export const PARTNER_PAY = {
  /** Limpeza por tamanho, igual para end of tenancy e deep clean. */
  clean: { studio: 100, 1: 120, 2: 140, 3: 160, 4: 180 },
  /** Add-on de limpeza: o parceiro leva esta fatia do preço do add-on. */
  cleanExtraPct: 60,
  /** Handyman: hora 40, meia diária 3,5h, diária. */
  fix: { hour: 40, half: 109, day: 189 },
  /** Pintura: fatia do preço que vai para o parceiro. */
  paintPct: 60,
  /**
   * Certificado: o que o parceiro recebe, em libras, por item.
   *
   * Até 22/09/2026 isto era preço ÷ 1,3, um chute. Medido contra os jobs que
   * já rodaram no OS, o chute pagava £36 a £67 a MAIS por certificado do que
   * a gente paga de verdade, e esse número ia direto para a self-bill. Agora
   * são os valores da tabela do catálogo (faixa de EICR validada com a
   * Express: £69 até 8 circuitos, £79 no 2 quartos, £99 no 3).
   */
  cert: {
    gas: 60,
    eicr: { studio: 69, 1: 69, 2: 79, 3: 99, 4: 109 },
    pat: 50,
    boiler: 65,
  },
  /** Material de pintura: o site cobra o custo × isto. */
  markup: 1.3,
}

const round = (n) => Math.round(n * 100) / 100
const sum = (lines) => lines.reduce((s, l) => s + (l.amount || 0), 0)

/**
 * Repasse do job, em libras, ou null quando o site não sabe (aí o OS calcula
 * e o escritório ajusta na hora de atribuir).
 *
 * `lines` são as linhas de preço DESTE job (sem desconto: o cupom sai da
 * margem da Fixfy, não do parceiro).
 */
export function partnerPayFor({ service, lines = [], size }) {
  if (!lines.length) return null
  if (service === 'clean') {
    const base = PARTNER_PAY.clean[size]
    if (base == null) return null
    const extras = sum(lines.filter((l) => l.id !== 'clean-base'))
    return round(base + (extras * PARTNER_PAY.cleanExtraPct) / 100)
  }
  if (service === 'fix') {
    const pkg = lines.find((l) => l.id?.startsWith('fix-'))?.id.slice(4)
    return PARTNER_PAY.fix[pkg] ?? null
  }
  if (service === 'paint') {
    const materials = sum(lines.filter((l) => l.id === 'paint-materials'))
    const work = sum(lines.filter((l) => l.id !== 'paint-materials'))
    return round((work * PARTNER_PAY.paintPct) / 100 + materials / PARTNER_PAY.markup)
  }
  if (service === 'cert') {
    // Um job de certificado pode ter duas linhas (gás + serviço da caldeira).
    // Item fora da tabela devolve null: o site não inventa repasse, o OS decide.
    let total = 0
    for (const l of lines) {
      const tabela = PARTNER_PAY.cert[String(l.id || '').replace(/^cert-/, '')]
      const valor = typeof tabela === 'number' ? tabela : tabela?.[size]
      if (valor == null) return null
      total += valor
    }
    return round(total)
  }
  return null
}
