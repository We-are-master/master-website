/**
 * "Talk to us" do site (modal GetInTouchModal, /business e páginas antigas).
 *
 *   POST /api/b2b/contact → { name, email, company, phone, industry, message, page, website, elapsedMs }
 *
 * Vira um e-mail para B2B_NOTIFY_EMAIL (padrão victor@getfixfy.com), com o
 * "responder" indo direto ao lead. Antes ia para funções do Supabase em
 * supabase.wearemaster.com, domínio que não existe mais: todo lead se perdia.
 *
 * Só envia de verdade na Vercel (ou com B2B_CONTACT_LIVE=1): no localhost
 * responde dryRun, para teste de tela não virar e-mail.
 */
import { loadLocalEnv } from '../growth/load-env.js'

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

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function leadText(l) {
  return [
    `Name: ${l.name}`,
    `Email: ${l.email}`,
    l.phone && `Phone: ${l.phone}`,
    l.company && `Company: ${l.company}`,
    l.industry && `Type: ${l.industry}`,
    l.page && `Page: ${l.page}`,
    l.message && `\n${l.message}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export function notificationEmail(lead) {
  const who = lead.company ? `${lead.company} (${lead.name})` : lead.name
  const subject = `New business enquiry: ${who}`
  const rows = [
    ['Name', esc(lead.name)],
    ['Email', `<a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a>`],
    ['Phone', lead.phone && `<a href="tel:${esc(lead.phone.replace(/\s/g, ''))}">${esc(lead.phone)}</a>`],
    ['Company', esc(lead.company)],
    ['Type', esc(lead.industry)],
    ['Page', esc(lead.page)],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#6b6b85;white-space:nowrap">${k}</td><td style="padding:6px 0">${v}</td></tr>`)
    .join('')
  const html = `<!doctype html><html><body style="margin:0;background:#f7f7fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0a0a1f">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px"><div style="background:#fff;border:1px solid #e4e4ec;border-radius:16px;padding:24px">
  <h1 style="font-size:20px;margin:0 0 14px">New enquiry from the website</h1>
  <table style="border-collapse:collapse;font-size:15px">${rows}</table>
  ${lead.message ? `<p style="margin:16px 0 0;padding:14px;background:#f7f7fb;border-radius:10px;font-size:15px;line-height:1.5;white-space:pre-wrap">${esc(lead.message)}</p>` : ''}
  <p style="margin:16px 0 0;font-size:13px;color:#6b6b85">Reply to this email to answer ${esc(lead.name)} directly.</p>
  </div></div></body></html>`
  return { subject, html, text: `${subject}\n\n${leadText(lead)}` }
}

async function sendEmail(env, { to, subject, html, text, replyTo }) {
  if (!env.resendKey) throw new Error('RESEND_API_KEY missing')
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.resendFrom, to: [to], subject, html, text, reply_to: replyTo }),
  })
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`)
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

  await sendEmail(env, { to: env.notifyEmail, replyTo: lead.email, ...notificationEmail(lead) })
  return { status: 200, data: { success: true } }
}
