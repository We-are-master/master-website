/**
 * E-mails da reserva pelo Resend (API direta, sem SDK). Dois envios: a
 * confirmação ao cliente e o aviso ao escritório. Texto em inglês.
 */
import { COMPANY, PROMISES, TERMS } from '../../src/b2c/content/site.js'
import { LOGO_EMAIL_ATTACHMENT } from './brand.js'
import { confirmationEmail } from './confirmation-email.js'

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function money(n) {
  const d = Math.round(n * 100) % 100 !== 0 ? 2 : 0 // com cupom pode ter pence
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: d, maximumFractionDigits: d }).format(n)
}

async function send(env, { to, subject, html, text, replyTo, attachments }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.resendFrom,
      to: [to],
      subject,
      html,
      text: text || undefined,
      reply_to: replyTo || undefined,
      attachments: attachments?.length ? attachments : undefined,
    }),
  })
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`)
  return res.json()
}

function layout(title, body) {
  return `<!doctype html><html><body style="margin:0;background:#f7f7fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0a0a1f">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#020040;border-radius:16px 16px 0 0;padding:20px 24px"><img src="cid:fixfy-logo" width="108" height="38" alt="Fixfy" style="display:block;border:0;outline:none;width:108px;height:38px"></div>
    <div style="background:#fff;border:1px solid #e4e4ec;border-top:0;border-radius:0 0 16px 16px;padding:24px">
      <h1 style="font-size:22px;margin:0 0 12px">${esc(title)}</h1>
      ${body}
    </div>
    <p style="font-size:12px;color:#6b6b85;margin:16px 4px 0">${esc(COMPANY.legalName)}, trading as Fixfy · 124 City Road, London EC1V 2NX · Company number ${esc(COMPANY.companyNumber)}</p>
  </div></body></html>`
}

function linesTable(lines, total) {
  const rows = lines
    .map(
      (l) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e4e4ec">${esc(l.label)}${l.detail ? `<br><span style="color:#6b6b85;font-size:13px">${esc(l.detail)}</span>` : ''}</td><td style="padding:8px 0;border-bottom:1px solid #e4e4ec;text-align:right;white-space:nowrap">${l.amount == null ? 'Quote' : money(l.amount)}</td></tr>`,
    )
    .join('')
  return `<table style="width:100%;border-collapse:collapse;font-size:15px">${rows}<tr><td style="padding:12px 0;font-weight:700">Paid by card to Fixfy, as agent for your professional</td><td style="padding:12px 0;text-align:right;font-weight:700">${money(total)}</td></tr></table>`
}

/**
 * Cópia do "Booking received" que fica no ticket do Zendesk como nota interna
 * (o cliente recebe a versão com a marca, de sendCustomerConfirmation). HTML
 * simples: o Zendesk limpa estilo. Modelo de agente: o profissional ainda
 * não está escolhido; o nome dele vai no e-mail de confirmação do OS.
 */
export function customerMessageHtml(env, b) {
  const lines = b.lines
    .map((l) => `<li>${esc(l.label)}${l.detail ? `, ${esc(l.detail)}` : ''}: <b>${l.amount == null ? 'quote' : money(l.amount)}</b></li>`)
    .join('')
  const paid = b.deposit || b.total
  const balance = b.deposit ? Math.round((b.total - b.deposit) * 100) / 100 : null
  return [
    `<p>Hi ${esc(b.firstName)},</p>`,
    `<p>We have your booking <b>${esc(b.ref)}</b> for ${esc(b.summary.toLowerCase())}. Your job is carried out by an independent, vetted professional. We are confirming yours now, and we email you their name and details as soon as they accept, always before your visit.</p>`,
    `<ul>${lines}</ul>`,
    `<p><b>When:</b> ${esc(b.dateLabel)}, arriving ${esc(b.windowLabel)}<br><b>Where:</b> ${esc(b.addressLine)}<br><b>Paid:</b> ${money(paid)} by card${balance ? ` (50% deposit; the balance of ${money(balance)} is due when the work is done)` : ''}. Your receipt, in your professional's name, comes with your booking confirmation.</p>`,
    `<p>We call or message you the day before to confirm your professional, the time and how they get in. The photo report of every room comes the same day the work is done.</p>`,
    `<p>Until a professional is confirmed, you can cancel for free and get a full refund. After that, changes and cancellation are free up to ${PROMISES.freeCancellationHours} hours before your slot. Your contract for this job is with your professional, an independent trader, and Fixfy arranged it as their agent. Your booking is under our <a href="${esc(env.siteUrl)}/terms">booking terms</a> (version of ${esc(TERMS.version)}), which also explain your legal right to cancel within 14 days and how to use it. You asked for the work to be done on the day you picked, so once it is done it can no longer be cancelled.</p>`,
    `<p>Anything to add or change? Just reply to this email.</p>`,
    `<p>Fixfy</p>`,
  ].join('\n')
}

/**
 * Confirmação ao cliente, com a marca (server/b2c/confirmation-email.js). Sai
 * do hello@ com resposta para o hello@; com o encoded id do ticket, a resposta
 * do cliente cai no ticket da compra no Zendesk.
 */
export async function sendCustomerConfirmation(env, b, { encodedId = null } = {}) {
  const mail = confirmationEmail(env, b, { encodedId })
  return send(env, { to: b.email, replyTo: 'hello@getfixfy.com', ...mail })
}

export async function sendOfficeNotification(env, b) {
  const jobs = (b.osJobs || []).map((j) => `<li>${esc(j.reference)} · ${esc(j.title)}${j.ticket ? ` · Zendesk #${esc(j.ticket)}` : ''}</li>`).join('')
  const body = `
    <p style="font-size:15px;line-height:1.5;margin:0 0 12px"><b>${esc(b.ref)}</b> · ${esc(b.dateLabel)} · ${esc(b.windowLabel)}<br>${esc(b.name)} · ${esc(b.email)} · ${esc(b.phone)}<br>${esc(b.addressLine)}${b.role ? ` · ${esc(b.role)}` : ''}</p>
    ${linesTable(b.lines, b.total)}
    <p style="font-size:14px;line-height:1.5;margin:14px 0 0"><b>Access:</b> ${esc(b.access)}${b.accessNote ? ` (${esc(b.accessNote)})` : ''} · <b>Parking:</b> ${esc(b.parking)}</p>
    ${b.notes ? `<p style="font-size:14px;line-height:1.5;margin:8px 0 0"><b>Notes:</b> ${esc(b.notes)}</p>` : ''}
    <p style="font-size:14px;line-height:1.5;margin:8px 0 0"><b>Payment:</b> paid ${money(b.deposit || b.total)} by card${b.deposit ? ` (50% deposit of ${money(b.total)})` : ''}, received as agent for the professional, Stripe ${esc(b.paymentIntentId || '')} · <b>Marketing opt-in:</b> ${b.marketing ? 'yes' : 'no'}</p>
    ${jobs ? `<p style="font-size:14px;margin:12px 0 4px"><b>OS jobs</b></p><ul style="font-size:14px;margin:0;padding-left:18px">${jobs}</ul>` : '<p style="font-size:14px;color:#b93b00;margin:12px 0 0">No OS job was created (see error below).</p>'}
    ${b.osError ? `<p style="font-size:13px;color:#b93b00;margin:8px 0 0">${esc(b.osError)}</p>` : ''}
    <p style="font-size:13px;color:#6b6b85;margin:12px 0 0">Source: ${esc(JSON.stringify(b.attribution || {}))}</p>`
  return send(env, {
    to: env.notifyEmail,
    subject: `New B2C booking ${b.ref}: ${b.summary}, ${b.dateLabel}`,
    html: layout('New booking from the website', body),
    replyTo: b.email,
    attachments: [LOGO_EMAIL_ATTACHMENT],
  })
}
