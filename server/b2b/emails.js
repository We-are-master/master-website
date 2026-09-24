/**
 * E-mails do "Talk to us" (/api/b2b/contact).
 *
 *   clientEmail   → para quem preencheu: com a marca, confirma que recebemos e
 *                   que o time responde em 24 a 48 horas. Resposta vai para o
 *                   time (reply-to = B2B_NOTIFY_EMAIL).
 *   internalEmail → para o time: simples, com os dados e botões de responder
 *                   e ligar. Resposta vai direto para o lead.
 *
 * HTML de e-mail no molde de server/b2c/confirmation-email.js: tabelas,
 * estilo inline, fonte do sistema, logo embutido (cid:fixfy-logo) porque o
 * proxy de imagens do Gmail leva 429 do getfixfy.com.
 */
import { LOGO_EMAIL_ATTACHMENT } from '../b2c/brand.js'

export const REPLY_WINDOW = '24 to 48 hours'

const C = {
  page: '#EEEEF4',
  navy: '#020040',
  onNavy: '#C9C8E3',
  onNavyMute: '#8E8DB8',
  orange: '#ED4B00',
  orangeWash: '#FFF1EA',
  ink: '#0A0A1F',
  ink2: '#3A3A55',
  mute: '#6B6B85',
  line: '#E4E4EC',
  paper: '#F7F7FB',
  green: '#0B7A53',
  greenWash: '#E9F6F0',
  white: '#FFFFFF',
}
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Helvetica,Arial,sans-serif"
const SITE = 'https://www.getfixfy.com'
const COMPANY_LINE = 'Getfixfy Ltd · 124 City Road, London EC1V 2NX · Company number 15406523 · VAT 478 1027 82'

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

const firstName = (name = '') => String(name).trim().split(/\s+/)[0] || 'there'

const td = (style, inner, attrs = '') => `<td ${attrs} style="${style}">${inner}</td>`

function label(text) {
  return `<div style="font:700 11px/16px ${FONT};letter-spacing:0.08em;text-transform:uppercase;color:${C.mute};">${esc(text)}</div>`
}

function detailRow(name, value, last = false) {
  return `<tr>${td(
    `padding:12px 0;${last ? '' : `border-bottom:1px solid ${C.line};`}`,
    `${label(name)}<div style="font:500 16px/24px ${FONT};color:${C.ink};margin-top:2px;">${value}</div>`,
  )}</tr>`
}

function step(n, title, text, last = false) {
  return `<tr>
    ${td('width:40px;vertical-align:top;padding:0 0 ' + (last ? '0' : '18px') + ' 0;', `<div style="width:28px;height:28px;border-radius:14px;background:${n === 1 ? C.greenWash : C.orangeWash};color:${n === 1 ? C.green : C.orange};font:800 14px/28px ${FONT};text-align:center;">${n === 1 ? '&#10003;' : n}</div>`, 'width="40" valign="top"')}
    ${td(`vertical-align:top;padding:3px 0 ${last ? '0' : '18px'} 0;`, `<div style="font:700 15px/22px ${FONT};color:${C.ink};">${esc(title)}</div><div style="font:400 15px/23px ${FONT};color:${C.ink2};margin-top:2px;">${esc(text)}</div>`, 'valign="top"')}
  </tr>`
}

function shell({ title, preheader, body }) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title>
<style>
  @media (max-width: 620px) {
    .fx-pad { padding-left: 22px !important; padding-right: 22px !important; }
    .fx-h1 { font-size: 32px !important; line-height: 36px !important; }
    .fx-btn { width: 100% !important; }
    .fx-btn a { display: block !important; text-align: center !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
<tr><td align="center" style="padding:28px 12px 36px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
${body}
</table>
</td></tr>
</table>
</body>
</html>`
}

/* ---------- Para o cliente ---------- */

export function clientEmail(lead) {
  const name = firstName(lead.name)
  const sent = [
    lead.company && detailRow('Company', esc(lead.company)),
    lead.industry && detailRow('You are', esc(lead.industry)),
    detailRow('Contact', `${esc(lead.email)}${lead.phone ? `<br><span style="color:${C.ink2};">${esc(lead.phone)}</span>` : ''}`, !lead.message),
    lead.message &&
      `<tr>${td('padding:12px 0 0;', `${label('Your message')}<div style="margin-top:8px;padding:14px 16px;background:${C.paper};border-radius:12px;font:400 15px/23px ${FONT};color:${C.ink2};white-space:pre-wrap;">${esc(lead.message)}</div>`)}</tr>`,
  ]
    .filter(Boolean)
    .join('')

  const steps = [
    step(1, 'Enquiry received', 'It is with our partnerships team now.'),
    step(2, `We get in touch within ${REPLY_WINDOW}`, 'By email or phone, to understand your properties and what you need.'),
    step(3, 'Your proposal in writing', 'On demand prices, or an annual plan for maintenance and compliance. You decide.', true),
  ].join('')

  const fronts = ['Tradespeople', 'Certified engineers', 'Professional cleaning']
    // Fundo na própria célula: as três ficam sempre da mesma altura, mesmo quando uma quebra linha.
    .map((f) => td(`padding:14px 8px;background:${C.paper};border-radius:12px;text-align:center;vertical-align:middle;font:700 13px/18px ${FONT};color:${C.ink};`, `${f}<span style="color:${C.orange};">.</span>`, 'width="33%" valign="middle"'))
    .join('')

  const body = `
  <tr><td style="background:${C.navy};border-radius:22px 22px 0 0;padding:28px 32px 0;" class="fx-pad">
    <img src="cid:fixfy-logo" width="96" height="34" alt="Fixfy" style="display:block;border:0;outline:none;width:96px;height:34px;">
  </td></tr>

  <tr><td style="background:${C.navy};padding:34px 32px 38px;" class="fx-pad">
    <div class="fx-h1" style="font:800 40px/44px ${FONT};letter-spacing:-0.02em;color:${C.white};">Thanks, ${esc(name)}<span style="color:${C.orange};">.</span></div>
    <div style="font:400 17px/26px ${FONT};color:${C.onNavy};margin-top:12px;">We have your enquiry. Someone from our team will get in touch <span style="color:${C.white};font-weight:600;">within ${REPLY_WINDOW}</span>.</div>
  </td></tr>

  <tr><td style="background:${C.white};padding:30px 32px 6px;" class="fx-pad">
    <div style="font:800 20px/26px ${FONT};color:${C.ink};margin-bottom:16px;">What happens next</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${steps}</table>
  </td></tr>

  <tr><td style="background:${C.white};padding:24px 32px 8px;" class="fx-pad">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.line};border-radius:16px;border-collapse:separate;">
      <tr><td style="padding:16px 20px 18px;">
        ${label('What you sent us')}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:4px;">${sent}</table>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="background:${C.white};padding:24px 26px 6px;" class="fx-pad">
    <div style="padding:0 6px 6px;font:800 20px/26px ${FONT};color:${C.ink};">Any job, made easy</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="6" border="0" style="border-collapse:separate;border-spacing:6px;"><tr>${fronts}</tr></table>
  </td></tr>

  <tr><td style="background:${C.white};padding:24px 32px 30px;" class="fx-pad">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="fx-btn"><tr>
      <td style="background:${C.orange};border-radius:999px;">
        <a href="${SITE}/business" style="display:inline-block;padding:14px 26px;font:700 15px/20px ${FONT};color:${C.white};text-decoration:none;border-radius:999px;">See how we work</a>
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="background:${C.white};border-radius:0 0 22px 22px;padding:0 32px 30px;" class="fx-pad">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.paper};border-radius:14px;">
      <tr>${td(`padding:18px 20px;font:400 15px/23px ${FONT};color:${C.ink2};`, `<span style="font-weight:700;color:${C.ink};">Something to add?</span> Just reply to this email. It goes straight to our team.`)}</tr>
    </table>
  </td></tr>

  <tr><td align="center" style="padding:22px 24px 0;font:400 12px/19px ${FONT};color:${C.mute};">
    Fixfy · Property maintenance for letting agents and businesses across London<br>
    ${COMPANY_LINE}<br>
    <a href="${SITE}/privacy" style="color:${C.mute};text-decoration:underline;">Privacy</a>
  </td></tr>`

  const text = [
    `Thanks, ${name}.`,
    '',
    `We have your enquiry. Someone from our team will get in touch within ${REPLY_WINDOW}.`,
    '',
    'What happens next',
    '1. Enquiry received: it is with our partnerships team now.',
    `2. We get in touch within ${REPLY_WINDOW}, by email or phone.`,
    '3. Your proposal in writing: on demand prices, or an annual plan for maintenance and compliance.',
    '',
    'What you sent us',
    lead.company ? `Company: ${lead.company}` : null,
    lead.industry ? `You are: ${lead.industry}` : null,
    `Contact: ${lead.email}${lead.phone ? `, ${lead.phone}` : ''}`,
    lead.message ? `Message:\n${lead.message}` : null,
    '',
    'Something to add? Just reply to this email.',
    '',
    `${SITE}/business`,
    COMPANY_LINE,
  ]
    .filter((l) => l !== null)
    .join('\n')

  return {
    subject: 'We have your enquiry | Fixfy',
    html: shell({ title: 'We have your enquiry', preheader: `Thanks, ${name}. We will get in touch within ${REPLY_WINDOW}.`, body }),
    text,
    attachments: [LOGO_EMAIL_ATTACHMENT],
  }
}

/* ---------- Para o time ---------- */

export function internalEmail(lead, { clientCopy = 'sent' } = {}) {
  const who = lead.company ? `${lead.company} (${lead.name})` : lead.name
  const rows = [
    ['Name', esc(lead.name)],
    ['Email', `<a href="mailto:${esc(lead.email)}" style="color:${C.ink};">${esc(lead.email)}</a>`],
    ['Phone', lead.phone && `<a href="tel:${esc(lead.phone.replace(/\s/g, ''))}" style="color:${C.ink};">${esc(lead.phone)}</a>`],
    ['Company', esc(lead.company)],
    ['Type', esc(lead.industry)],
    ['Page', esc(lead.page)],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr>${td(`padding:7px 16px 7px 0;font:400 14px/20px ${FONT};color:${C.mute};white-space:nowrap;vertical-align:top;`, k)}${td(`padding:7px 0;font:500 15px/20px ${FONT};color:${C.ink};`, v)}</tr>`)
    .join('')

  const btn = (href, text, primary) =>
    `<td style="padding-right:8px;"><a href="${esc(href)}" style="display:inline-block;padding:11px 18px;border-radius:999px;font:700 14px/18px ${FONT};text-decoration:none;${primary ? `background:${C.orange};color:${C.white};` : `border:1px solid ${C.line};color:${C.ink};`}">${text}</a></td>`

  const body = `
  <tr><td style="background:${C.white};border-radius:18px;padding:26px 28px;" class="fx-pad">
    <div style="font:700 12px/16px ${FONT};letter-spacing:0.06em;text-transform:uppercase;color:${C.orange};">New business enquiry</div>
    <div style="font:800 24px/30px ${FONT};color:${C.ink};margin-top:6px;">${esc(who)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">${rows}</table>
    ${lead.message ? `<div style="margin-top:14px;padding:14px 16px;background:${C.paper};border-radius:12px;font:400 15px/23px ${FONT};color:${C.ink2};white-space:pre-wrap;">${esc(lead.message)}</div>` : ''}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;"><tr>
      ${btn(`mailto:${lead.email}?subject=${encodeURIComponent('Your enquiry with Fixfy')}`, `Reply to ${esc(firstName(lead.name))}`, true)}
      ${lead.phone ? btn(`tel:${lead.phone.replace(/\s/g, '')}`, 'Call', false) : ''}
    </tr></table>
    <div style="margin-top:18px;font:400 13px/19px ${FONT};color:${C.mute};">${{ sent: `The client got an automatic confirmation saying we reply within ${REPLY_WINDOW}.`, skipped: 'Same person sent another enquiry in the last 10 minutes, so no second confirmation went out.', failed: 'The automatic confirmation to the client failed: reply to them yourself.' }[clientCopy]} Replying to this email goes straight to ${esc(lead.email)}.</div>
  </td></tr>`

  return {
    subject: `New business enquiry: ${who}`,
    html: shell({ title: 'New business enquiry', preheader: `${who}${lead.message ? `: ${lead.message.slice(0, 90)}` : ''}`, body }),
    text: [
      `New business enquiry: ${who}`,
      '',
      `Name: ${lead.name}`,
      `Email: ${lead.email}`,
      lead.phone && `Phone: ${lead.phone}`,
      lead.company && `Company: ${lead.company}`,
      lead.industry && `Type: ${lead.industry}`,
      lead.page && `Page: ${lead.page}`,
      lead.message && `\n${lead.message}`,
    ]
      .filter(Boolean)
      .join('\n'),
  }
}
