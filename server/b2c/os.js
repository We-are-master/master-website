/**
 * A reserva vira job no OS pelo POST /api/jobs (a mesma porta dos outros
 * agentes). Regras que valem para todo agente que cria job:
 *  - nasce com ticket do Zendesk (`create_zendesk_ticket: true`, nota privada);
 *  - título SÓ da lista canônica de type of work (End of Tenancy Clean,
 *    Painter, General Maintenance);
 *  - scope completo, em inglês, sem nome de plataforma.
 * Um job por serviço: no OS cada trade tem parceiro e roteamento próprios.
 */
import { createClient } from '@supabase/supabase-js'

let cachedAccountId = null

/** Conta "Fixfy" para cliente direto: env primeiro, depois a mesma busca do OS. */
export async function resolveFixfyAccountId(env) {
  if (env.fixfyAccountId) return env.fixfyAccountId
  if (cachedAccountId) return cachedAccountId
  if (!env.supabaseUrl || !env.serviceKey) throw new Error('FIXFY_ACCOUNT_ID not set and no Supabase service key to look it up')
  const supabase = createClient(env.supabaseUrl, env.serviceKey, { auth: { persistSession: false } })
  const { data, error } = await supabase
    .from('accounts')
    .select('id, company_name')
    .is('deleted_at', null)
    .ilike('company_name', 'fixfy')
    .limit(1)
    .maybeSingle()
  if (error || !data?.id) throw new Error('Fixfy account not found in the OS. Set FIXFY_ACCOUNT_ID.')
  cachedAccountId = data.id
  return cachedAccountId
}

export async function createOsJob(env, job) {
  const res = await fetch(`${env.osUrl}/api/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': env.osKey },
    body: JSON.stringify({ ...job, create_zendesk_ticket: true, rate_type: 'fixed' }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`OS /api/jobs ${res.status}: ${data.error || 'unknown error'}`)
  return {
    id: data.id,
    reference: data.reference,
    status: data.status,
    ticket: data.zendesk_ticket_id || null,
    customerMessagePosted: data.customer_message_posted === true,
    customerRequesterSet: data.customer_requester_set === true,
    encodedId: data.zendesk_encoded_id || null,
  }
}
