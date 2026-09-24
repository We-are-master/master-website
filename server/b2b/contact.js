/**
 * "Talk to us" do site (modal GetInTouchModal, /business e páginas antigas).
 *
 *   POST /api/b2b/contact → { name, email, company, phone, industry, message, page, website, elapsedMs }
 *
 * Dois e-mails (templates em ./emails.js): a confirmação com a marca para
 * quem preencheu ("respondemos em 24 a 48 horas", resposta vai para o time)
 * e o aviso para B2B_NOTIFY_EMAIL (padrão victor@getfixfy.com), com o
 * "responder" indo direto ao lead. Antes ia para funções do Supabase em
 * supabase.wearemaster.com, domínio que não existe mais: todo lead se perdia.
 *
 * Só envia de verdade na Vercel (ou com B2B_CONTACT_LIVE=1): no localhost
 * responde dryRun, para teste de tela não virar e-mail.
 */
import { loadLocalEnv } from '../growth/load-env.js'
import { clientEmail, internalEmail } from './emails.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max).replace(/\0/g, '') : '')

export function b2bEnv() {
  loadLocalEnv()
  return {
    live: process.env.VERCEL === '1' || process.env.B2B_CONTACT_LIVE === '1',
    resendKey: (process.env.RESEND_API_KEY || '').trim(),
    resendFrom: (process.env.RESEND_FROM_EMAIL || 'Fixfy <hello@getfixfy.com>').trim(),
    notifyEmail: (process.env.B2B_NOTIFY_EMAIL || 'victor@getfixfy.com').trim(),
  }
}

async function sendEmail(env, { to, subject, html, text, replyTo, attachments }) {
  if (!env.resendKey) throw new Error('RESEND_API_KEY missing')
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.resendFrom, to: [to], subject, html, text, reply_to: replyTo, attachments }),
  })
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`)
}

const confirmedAt = new Map()
function recentlyConfirmed(email, now = Date.now()) {
  const last = confirmedAt.get(email)
  confirmedAt.set(email, now)
  return last != null && now - last < 10 * 60_000
}

export async function handleContact(body = {}) {
  const env = b2bEnv()
  // Robô: campo escondido preenchido ou envio rápido demais. 200 para não ensinar nada.
  if (str(body.website) || (Number(body.elapsedMs) > 0 && Number(body.elapsedMs) < 2000)) return { status: 200, data: { success: true } }

  const lead = {
    name: str(body.name, 120),
    email: str(body.email, 200).toLowerCase(),
    phone: str(body.phone, 40),
    company: str(body.company, 200),
    industry: str(body.industry, 200),
    message: str(body.message, 5000),
    page: str(body.page, 200),
  }
  if (lead.name.length < 2) return { status: 400, data: { error: 'Please add your name.' } }
  if (!EMAIL_RE.test(lead.email)) return { status: 400, data: { error: 'Please check your email address.' } }

  if (!env.live) {
    console.log('[b2b/contact] dry run', lead.email.replace(/^(.).*@/, '$1***@'))
    return { status: 200, data: { success: true, dryRun: true } }
  }

  // Confirmação ao cliente primeiro, para o aviso interno dizer se ela saiu.
  // Uma por endereço a cada 10 min na mesma instância: o formulário não vira
  // canhão de e-mail para o endereço de outra pessoa.
  let clientCopy = 'skipped'
  if (!recentlyConfirmed(lead.email)) {
    try {
      await sendEmail(env, { to: lead.email, replyTo: env.notifyEmail, ...clientEmail(lead) })
      clientCopy = 'sent'
    } catch (err) {
      clientCopy = 'failed'
      console.error('[b2b/contact] client confirmation failed:', err.message)
    }
  }
  await sendEmail(env, { to: env.notifyEmail, replyTo: lead.email, ...internalEmail(lead, { clientCopy }) })
  return { status: 200, data: { success: true } }
}
