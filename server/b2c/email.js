/**
 * E-mails da reserva pelo Resend (API direta, sem SDK). Dois envios: a
 * confirmação ao cliente e o aviso ao escritório. Texto em inglês.
 */
import { TERMS } from '../../src/b2c/content/site.js'

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function money(n) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 }).format(n)
}

async function send(env, { to, subject, html, replyTo }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.resendFrom, to: [to], subject, html, reply_to: replyTo || undefined }),
  })
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`)
  return res.json()
}

function layout(title, body) {
  return `<!doctype html><html><body style="margin:0;background:#f7f7fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0a0a1f">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#020040;border-radius:16px 16px 0 0;padding:20px 24px;color:#fff;font-weight:700;font-size:18px">Fixfy <span style="color:#ed4b00">.</span></div>
    <div style="background:#fff;border:1px solid #e4e4ec;border-top:0;border-radius:0 0 16px 16px;padding:24px">
      <h1 style="font-size:22px;margin:0 0 12px">${esc(title)}</h1>
      ${body}
    </div>
    <p style="font-size:12px;color:#6b6b85;margin:16px 4px 0">Getfixfy Ltd · 124 City Road, London EC1V 2NX · Company number 15406523 · VAT 478 1027 82</p>
  </div></body></html>`
}

function linesTable(lines, total) {
  const rows = lines
    .map(
      (l) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e4e4ec">${esc(l.label)}${l.detail ? `<br><span style="color:#6b6b85;font-size:13px">${esc(l.detail)}</span>` : ''}</td><td style="padding:8px 0;border-bottom:1px solid #e4e4ec;text-align:right;white-space:nowrap">${l.amount == null ? 'Quote' : money(l.amount)}</td></tr>`,
    )
    .join('')
  return `<table style="width:100%;border-collapse:collapse;font-size:15px">${rows}<tr><td style="padding:12px 0;font-weight:700">Paid by card, VAT included</td><td style="padding:12px 0;text-align:right;font-weight:700">${money(total)}</td></tr></table>`
}

/**
 * Confirmação que o cliente recebe pelo ticket do Zendesk (sai do hello@, e a
 * resposta dele volta para o mesmo ticket). HTML simples: o Zendesk põe o
 * próprio cabeçalho e limpa estilo, então nada de tabela nem CSS.
 */
export function customerMessageHtml(env, b) {
  const lines = b.lines
    .map((l) => `<li>${esc(l.label)}${l.detail ? `, ${esc(l.detail)}` : ''}: <b>${l.amount == null ? 'quote' : money(l.amount)}</b></li>`)
    .join('')
  return [
    `<p>Hi ${esc(b.firstName)},</p>`,
    `<p>Your booking <b>${esc(b.ref)}</b> is confirmed and paid.</p>`,
    `<ul>${lines}</ul>`,
    `<p><b>When:</b> ${esc(b.dateLabel)}, arriving ${esc(b.windowLabel)}<br><b>Where:</b> ${esc(b.addressLine)}<br><b>Paid:</b> ${money(b.total)} by card, VAT included. Your receipt from Stripe arrives separately.</p>`,
    `<p>We will call or message you the day before to confirm the team and how we get in. The photo report of every room comes the same day the work is done.</p>`,
    `<p>Free changes and cancellation up to 48 hours before your slot, refunded in full. Your booking is under our <a href="${esc(env.siteUrl)}/terms">booking terms</a> (version of ${esc(TERMS.version)}), which also explain your legal right to cancel within 14 days. You asked us to do the work on the day you picked, so once it is done it can no longer be cancelled.</p>`,
    `<p>Anything to add or change? Just reply to this email.</p>`,
    `<p>Fixfy</p>`,
  ].join('\n')
}

export async function sendCustomerConfirmation(env, b) {
  const body = `
    <p style="font-size:16px;line-height:1.5;margin:0 0 16px">Hi ${esc(b.firstName)}, your booking <b>${esc(b.ref)}</b> is in for <b>${esc(b.dateLabel)}</b>, arriving <b>${esc(b.windowLabel)}</b>, at ${esc(b.addressLine)}.</p>
    ${linesTable(b.lines, b.total)}
    <p style="font-size:15px;line-height:1.5;margin:16px 0 0">Paid by card through Stripe; your receipt arrives separately. The photo report of every room comes the same day the work is done.</p>
    <p style="font-size:15px;line-height:1.5;margin:12px 0 0">We will call or message you the day before to confirm the team and how we get in. Free changes and cancellation up to 48 hours before your slot, refunded in full. Reply to this email if anything changes.</p>
    <p style="font-size:13px;line-height:1.5;color:#6b6b85;margin:16px 0 0">Your booking is under our <a href="${esc(env.siteUrl)}/terms" style="color:#0a0a1f">booking terms</a> (version of ${esc(TERMS.version)}), which also explain your legal right to cancel within 14 days and how to use it. You asked us to do the work on the day you picked, so once it is done it can no longer be cancelled.</p>`
  return send(env, {
    to: b.email,
    subject: `Booked: ${b.summary} on ${b.dateLabel} (${b.ref})`,
    html: layout('Booked and paid. See you on the day.', body),
    replyTo: 'hello@getfixfy.com',
  })
}

export async function sendOfficeNotification(env, b) {
  const jobs = (b.osJobs || []).map((j) => `<li>${esc(j.reference)} · ${esc(j.title)}${j.ticket ? ` · Zendesk #${esc(j.ticket)}` : ''}</li>`).join('')
  const body = `
    <p style="font-size:15px;line-height:1.5;margin:0 0 12px"><b>${esc(b.ref)}</b> · ${esc(b.dateLabel)} · ${esc(b.windowLabel)}<br>${esc(b.name)} · ${esc(b.email)} · ${esc(b.phone)}<br>${esc(b.addressLine)}${b.role ? ` · ${esc(b.role)}` : ''}</p>
    ${linesTable(b.lines, b.total)}
    <p style="font-size:14px;line-height:1.5;margin:14px 0 0"><b>Access:</b> ${esc(b.access)}${b.accessNote ? ` (${esc(b.accessNote)})` : ''} · <b>Parking:</b> ${esc(b.parking)}</p>
    ${b.notes ? `<p style="font-size:14px;line-height:1.5;margin:8px 0 0"><b>Notes:</b> ${esc(b.notes)}</p>` : ''}
    <p style="font-size:14px;line-height:1.5;margin:8px 0 0"><b>Payment:</b> paid ${money(b.total)} by card, Stripe ${esc(b.paymentIntentId || '')} · <b>Marketing opt-in:</b> ${b.marketing ? 'yes' : 'no'}</p>
    ${jobs ? `<p style="font-size:14px;margin:12px 0 4px"><b>OS jobs</b></p><ul style="font-size:14px;margin:0;padding-left:18px">${jobs}</ul>` : '<p style="font-size:14px;color:#b93b00;margin:12px 0 0">No OS job was created (see error below).</p>'}
    ${b.osError ? `<p style="font-size:13px;color:#b93b00;margin:8px 0 0">${esc(b.osError)}</p>` : ''}
    <p style="font-size:13px;color:#6b6b85;margin:12px 0 0">Source: ${esc(JSON.stringify(b.attribution || {}))}</p>`
  return send(env, {
    to: env.notifyEmail,
    subject: `New B2C booking ${b.ref}: ${b.summary}, ${b.dateLabel}`,
    html: layout('New booking from the website', body),
    replyTo: b.email,
  })
}
