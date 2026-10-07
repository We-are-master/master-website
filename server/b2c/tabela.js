/**
 * Tabela de preço lida do OS ao vivo, no servidor.
 *
 * Chave: TABELA_DO_OS=1. Desligada (padrão), nada muda: o servidor cobra pela
 * tabela embutida em src/b2c/content/pricing.js, exatamente como antes.
 *
 * Ligada, cada função que cobra ou reserva chama `garantirTabela()` antes de
 * tudo. O documento vem de OS_TABELA_URL (padrão: o endpoint público do OS),
 * com 2,5s de limite, e fica 60s em memória. Falha de rede, resposta ruim ou
 * documento inválido nunca derrubam a reserva: segue a tabela que já está
 * aplicada (a última boa do OS ou a embutida) e o erro vai para o log.
 * Documento inválido volta para a embutida (aplicarTabela cuida disso).
 */
import { loadLocalEnv } from '../growth/load-env.js'
import { aplicarTabela, tabelaAplicada } from '../../src/b2c/content/tabela-ao-vivo.js'

const URL_PADRAO = 'https://app.getfixfy.com/api/public/tabela-de-precos'
const LIMITE_MS = 2500
const CACHE_MS = 60_000

let ultimaTentativa = 0
let emAndamento = null

export function tabelaDoOsLigada() {
  loadLocalEnv()
  return (process.env.TABELA_DO_OS || '').trim() === '1'
}

async function buscar() {
  const url = (process.env.OS_TABELA_URL || '').trim() || URL_PADRAO
  const controle = new AbortController()
  const timer = setTimeout(() => controle.abort(), LIMITE_MS)
  try {
    const res = await fetch(url, { signal: controle.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const corpo = await res.json()
    if (!corpo || typeof corpo !== 'object' || !corpo.documento) throw new Error('resposta sem documento')
    const versaoAtual = tabelaAplicada()?.versao
    if (versaoAtual != null && corpo.versao === versaoAtual) return
    const r = aplicarTabela(corpo.documento, corpo.versao ?? null)
    if (!r.ok) throw new Error(`documento inválido: ${r.erro}`)
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Garante que a tabela do OS está aplicada (quando a chave está ligada).
 * Nunca lança: no pior caso o servidor segue com a tabela que já tem.
 */
export async function garantirTabela() {
  if (!tabelaDoOsLigada()) return
  if (Date.now() - ultimaTentativa < CACHE_MS) return
  if (!emAndamento) {
    emAndamento = buscar()
      .catch((err) => {
        console.error('[b2c/tabela] tabela do OS indisponível, seguindo com a atual:', err?.message || err)
      })
      .finally(() => {
        // Falha também espera os 60s: o OS fora do ar não pode custar 2,5s em toda reserva.
        ultimaTentativa = Date.now()
        emAndamento = null
      })
  }
  await emAndamento
}

/**
 * GET /api/b2c/tabela: o documento do OS que o servidor está usando, para a
 * página calcular igual. 204 quando a chave está desligada ou o servidor está
 * na tabela embutida (a página fica com a dela, que é a mesma).
 */
export async function handleTabela() {
  await garantirTabela()
  const atual = tabelaDoOsLigada() ? tabelaAplicada() : null
  if (!atual) return { status: 204, data: null }
  return { status: 200, data: { versao: atual.versao, documento: atual.documento } }
}
