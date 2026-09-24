/**
 * Aviso ao OS sobre o lead da reserva (aba Leads, e-mails de retomada).
 *
 *   step  a cada passo: quem é, o que escolheu, preço, até onde chegou
 *   paid  a reserva foi paga: o lead vira cliente e a sequência para
 *
 * Mesma chave e mesmo gate do lead do passo 1: só grava em produção (Vercel +
 * modo live). Em dev e em teste só escreve no log, porque o OS local aponta
 * para o banco de produção. Nunca vira erro para quem está reservando, e
 * sempre com `await` (na Vercel, promessa solta depois da resposta morre).
 */
import { b2cServerEnv } from './env.js'

export async function postSiteLead(payload, env = b2cServerEnv()) {
  const live = env.mode === 'live' && process.env.VERCEL === '1'
  const key = env.osLeadKey || env.osKey
  if (!live || !key) {
    const email = String(payload.email || '').replace(/^(.).*@/, '$1***@')
    console.log('[b2c/site-lead] dry run', payload.event, JSON.stringify({ ...payload, email }))
    return { ok: true, dryRun: true }
  }
  try {
    const res = await fetch(`${env.osUrl}/api/site-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) {
      console.error('[b2c/site-lead] OS', payload.event, res.status, (await res.text()).slice(0, 200))
      return { ok: false }
    }
    return await res.json().catch(() => ({ ok: true }))
  } catch (err) {
    console.error('[b2c/site-lead] failed', payload.event, err?.message)
    return { ok: false }
  }
}
