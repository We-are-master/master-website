/**
 * A capacidade que o OS calcula pela disponibilidade dos parceiros, com um
 * cache curto. Sem resposta do OS em 4 s, segue como se estivesse desligada:
 * a venda nunca trava por falta de conexão.
 */
import { b2cServerEnv } from './env.js'

let cache = { em: 0, dados: null }

export async function capacidadeDoOs(env = b2cServerEnv()) {
  if (cache.dados && Date.now() - cache.em < 60_000) return cache.dados
  try {
    const res = await fetch(`${env.osUrl}/api/public/capacity`, { signal: AbortSignal.timeout(4000) })
    const dados = res.ok ? await res.json() : { ligado: false, dias: [] }
    cache = { em: Date.now(), dados }
    return dados
  } catch {
    return { ligado: false, dias: [] }
  }
}
