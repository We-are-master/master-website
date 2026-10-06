/**
 * E-mail "Booking received" (modelo de agente, 06/10/2026): sai na hora do
 * pagamento, antes de existir um profissional. O nome dele chega depois, no
 * e-mail "Booking confirmed with {profissional}" que o OS manda quando alguém
 * aceita o job (é aí que o contrato do serviço começa; até lá o cancelamento
 * é grátis). Texto da seção (c) C1 do documento 04-booking-copy.
 *
 * HTML de e-mail: tabelas, estilo inline, fonte do sistema. O logo vai
 * embutido (cid:fixfy-logo) porque o getfixfy.com devolve 429 ao proxy de
 * imagens do Gmail. O encoded id do ticket do Zendesk vai escondido no fim,
 * do mesmo jeito que o Zendesk faz nos e-mails dele: quando o cliente
 * responde, o Zendesk acha o código na citação e junta a resposta ao ticket
 * da compra (uma conversa só, no hello@).
 */
import { COMPANY, GUARANTEE, PROMISES, TERMS } from '../../src/b2c/content/site.js'
import { beforeWeArrive, workOrderLine } from '../../src/b2c/content/copy.js'
import { LOGO_EMAIL_ATTACHMENT } from './brand.js'

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

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
}

function money(n) {
  const d = Math.round(n * 100) % 100 !== 0 ? 2 : 0 // com cupom o valor pode ter pence
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: d, maximumFractionDigits: d }).format(n)
}

/** Como o profissional entra, do jeito que o cliente escolheu (texto para o cliente). */
const ACCESS = {
  meet: 'You, or someone you trust, will be there',
  agent: 'Keys with your letting agent. Your professional collects and returns them',
  keysafe: 'Key safe. We ask for the code the day before and pass it only to your professional',
  concierge: 'Concierge or porter. Your professional signs the keys out',
}

/** Link do Google Calendar com a janela de chegada, no horário de Londres. */
export function calendarUrl(b) {
  const [from, to] = String(b.windowRange || '09:00 - 18:00')
    .split('-')
    .map((t) => `${t.trim().replace(':', '')}00`)
  const day = String(b.dateIso || '').replace(/-/g, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Fixfy: ${b.summary}`,
    dates: `${day}T${from}/${day}T${to || from}`,
    ctz: 'Europe/London',
    details: `Booking ${b.ref}. Your professional arrives ${b.windowLabel}. To change anything, reply to your booking email.`,
    location: b.addressLine,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

const td = (style, inner, attrs = '') => `<td ${attrs} style="${style}">${inner}</td>`

function label(text) {
  return `<div style="font:700 11px/16px ${FONT};letter-spacing:0.08em;text-transform:uppercase;color:${C.mute};">${esc(text)}</div>`
}

function detailRow(name, value, last = false) {
  return `<tr>${td(
    `padding:14px 0;${last ? '' : `border-bottom:1px solid ${C.line};`}`,
    `${label(name)}<div style="font:500 16px/24px ${FONT};color:${C.ink};margin-top:2px;">${value}</div>`,
  )}</tr>`
}

function step(n, title, text, last = false) {
  return `<tr>
    ${td('width:40px;vertical-align:top;padding:0 0 ' + (last ? '0' : '18px') + ' 0;', `<div style="width:28px;height:28px;border-radius:14px;background:${C.orangeWash};color:${C.orange};font:800 14px/28px ${FONT};text-align:center;">${n}</div>`, 'width="40" valign="top"')}
    ${td(`vertical-align:top;padding:3px 0 ${last ? '0' : '18px'} 0;`, `<div style="font:700 15px/22px ${FONT};color:${C.ink};">${esc(title)}</div><div style="font:400 15px/23px ${FONT};color:${C.ink2};margin-top:2px;">${esc(text)}</div>`, 'valign="top"')}
  </tr>`
}

/** Bloco de texto com fundo (aviso de cancelamento, garantia). */
function noteBox(inner, { bg = C.paper } = {}) {
  return `<tr><td style="background:${C.white};padding:0 32px 28px;" class="fx-pad">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg};border-radius:14px;">
      <tr>${td(`padding:18px 20px;font:400 15px/23px ${FONT};color:${C.ink2};`, inner)}</tr>
    </table>
  </td></tr>`
}

/**
 * Monta o e-mail. `encodedId` é o código do ticket do Zendesk (sem os
 * colchetes); sem ele o e-mail sai igual, só que a resposta vira ticket novo.
 */
export function confirmationEmail(env, b, { encodedId = null } = {}) {
  const services = b.services || []
  const eot = services.includes('clean') && b.cleanKind !== 'deep'
  const prep = beforeWeArrive(services, b.cleanKind)
  const order = workOrderLine(services)
  const calendar = calendarUrl(b)
  const terms = `${env.siteUrl}/terms`
  const privacy = `${env.siteUrl}/privacy`
  const guarantee = `${env.siteUrl}/guarantee`
  const access = ACCESS[b.accessId] || b.access || ''
  const firstName = b.firstName || 'there'
  const summary = b.summary.toLowerCase()
  const paid = b.deposit || b.total
  const balance = b.deposit ? Math.round((b.total - b.deposit) * 100) / 100 : null
  const cancelHours = PROMISES.freeCancellationHours
  const days = GUARANTEE.standardDays
  const payment = `${money(paid)} received by ${COMPANY.legalName} (Fixfy), as agent for the professional who does your job.${balance ? ` The balance of ${money(balance)} is due when the work is done.` : ''} Your receipt, in your professional's name, comes with your booking confirmation.`

  // Linhas no preço do profissional; a promoção (se houver) é a linha negativa do fim.
  const lines = b.lines
    .map(
      (l) => `<tr>
        ${td(`padding:14px 20px;border-top:1px solid ${C.line};font:600 16px/22px ${FONT};color:${l.service === 'promo' ? C.green : C.ink};`, `${esc(l.label)}${l.detail ? `<div style="font:400 14px/20px ${FONT};color:${C.mute};margin-top:2px;">${esc(l.detail)}</div>` : ''}`)}
        ${td(`padding:14px 20px;border-top:1px solid ${C.line};font:600 16px/22px ${FONT};color:${l.service === 'promo' ? C.green : C.ink};text-align:right;white-space:nowrap;vertical-align:top;`, l.amount == null ? 'Quote' : money(l.amount), 'align="right" valign="top"')}
      </tr>`,
    )
    .join('')

  const steps = [
    step(1, 'Your professional', 'We confirm your professional and email you their name and details as soon as they accept, always before your visit.'),
    step(2, 'The day before', 'We call or message you to confirm your professional, the time and how they get in.'),
    step(3, `${b.dateLabel}`, `${order}Your professional arrives ${b.windowLabel} and photographs every room as they finish.`),
    step(4, 'Same day', 'Your photo report lands in your inbox, with a photo of every room they worked on.', true),
  ].join('')

  const guaranteeBox = noteBox(
    eot
      ? `<span style="font-weight:700;color:${C.green};">&#10003;&nbsp; Free re-clean within ${PROMISES.recleanDays.value} days.</span> If your letting agent or landlord flags anything on our checklist, reply with their note and we arrange for your cleaner to come back at no cost.`
      : `<span style="font-weight:700;color:${C.green};">&#10003;&nbsp; ${days}-day guarantee.</span> If anything is not right, reply within ${days} days of the job and we arrange for your professional to come back at no cost.`,
    { bg: C.greenWash },
  )

  const prepList = prep.length
    ? `<tr><td style="background:${C.white};padding:0 32px 28px;" class="fx-pad">
        ${label('Before your professional arrives')}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
          ${prep
            .map(
              (p) => `<tr>
                ${td(`width:26px;vertical-align:top;padding:4px 0;font:700 15px/23px ${FONT};color:${C.green};`, '&#10003;', 'width="26" valign="top"')}
                ${td(`vertical-align:top;padding:4px 0;font:400 15px/23px ${FONT};color:${C.ink2};`, esc(p), 'valign="top"')}
              </tr>`,
            )
            .join('')}
        </table>
      </td></tr>`
    : ''

  const hiddenId = encodedId
    ? `<span style="color:${C.white};font-size:1px;line-height:1px;" aria-hidden="true" class="zd_encoded_id">[${esc(encodedId)}]</span>`
    : ''

  const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Booking received</title>
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
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">We are confirming your professional now. Their name comes in your booking confirmation.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
<tr><td align="center" style="padding:28px 12px 36px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

  <tr><td style="background:${C.navy};border-radius:22px 22px 0 0;padding:28px 32px 0;" class="fx-pad">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      ${td('vertical-align:middle;', `<img src="cid:fixfy-logo" width="96" height="34" alt="Fixfy" style="display:block;border:0;outline:none;width:96px;height:34px;">`)}
      ${td(`vertical-align:middle;text-align:right;font:700 11px/16px ${FONT};letter-spacing:0.08em;text-transform:uppercase;color:${C.onNavyMute};`, `Booking<br><span style="font:700 15px/20px ${FONT};letter-spacing:0.02em;color:${C.white};">${esc(b.ref)}</span>`, 'align="right"')}
    </tr></table>
  </td></tr>

  <tr><td style="background:${C.navy};padding:34px 32px 38px;" class="fx-pad">
    <div class="fx-h1" style="font:800 40px/44px ${FONT};letter-spacing:-0.02em;color:${C.white};">Booking received<span style="color:${C.orange};">.</span></div>
    <div style="font:400 17px/26px ${FONT};color:${C.onNavy};margin-top:12px;">Thanks, ${esc(firstName)}. We have your booking for ${esc(summary)} on <span style="color:${C.white};font-weight:600;">${esc(b.dateLabel)}</span>, arriving ${esc(b.windowLabel)}.</div>
  </td></tr>

  <tr><td style="background:${C.white};padding:30px 32px 6px;" class="fx-pad">
    ${label('Your professional')}
    <div style="font:400 16px/25px ${FONT};color:${C.ink2};margin-top:8px;">Your job is carried out by an independent, vetted professional. We are confirming yours now, and we email you their name and details as soon as they accept, always before your visit. If we cannot confirm a professional for your day, we offer you another day, or a full refund.</div>
  </td></tr>

  <tr><td style="background:${C.white};padding:24px 32px 8px;" class="fx-pad">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.line};border-radius:16px;border-collapse:separate;">
      <tr>${td(`padding:16px 20px 12px;`, label('Your booking'), 'colspan="2"')}</tr>
      ${lines}
      <tr>
        ${td(`padding:16px 20px;background:${C.paper};border-top:1px solid ${C.line};border-radius:0 0 0 16px;font:600 15px/21px ${FONT};color:${C.ink};`, `${b.deposit ? '50% deposit paid by card' : 'Paid by card'}<div style="font:400 13px/18px ${FONT};color:${C.mute};">${esc(payment)}</div>`)}
        ${td(`padding:16px 20px;background:${C.paper};border-top:1px solid ${C.line};border-radius:0 0 16px 0;font:800 26px/30px ${FONT};color:${C.ink};text-align:right;white-space:nowrap;vertical-align:top;`, money(paid), 'align="right" valign="top"')}
      </tr>
    </table>
  </td></tr>

  <tr><td style="background:${C.white};padding:14px 32px 6px;" class="fx-pad">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${detailRow('When', `${esc(b.dateLabel)}<br><span style="color:${C.ink2};">Arriving ${esc(b.windowLabel)}</span>`)}
      ${detailRow('Where', esc(b.addressLine))}
      ${detailRow('How your professional gets in', esc(access), true)}
    </table>
  </td></tr>

  <tr><td style="background:${C.white};padding:18px 32px 30px;" class="fx-pad">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="fx-btn"><tr>
      <td style="background:${C.orange};border-radius:999px;">
        <a href="${esc(calendar)}" style="display:inline-block;padding:14px 26px;font:700 15px/20px ${FONT};color:${C.white};text-decoration:none;border-radius:999px;">Add to Google Calendar</a>
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="background:${C.white};padding:0 32px 28px;" class="fx-pad">
    <div style="border-top:1px solid ${C.line};padding-top:26px;">
      <div style="font:800 20px/26px ${FONT};color:${C.ink};margin-bottom:16px;">What happens next</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${steps}</table>
    </div>
  </td></tr>

  ${guaranteeBox}
  ${prepList}

  ${noteBox(`<span style="font-weight:700;color:${C.ink};">Changed your mind?</span> Until a professional is confirmed, you can cancel for free and get a full refund. After that, changes and cancellation are free up to ${cancelHours} hours before your slot. Just reply to this email.`)}

  <tr><td style="background:${C.white};border-radius:0 0 22px 22px;padding:0 32px 26px;font:400 12px/18px ${FONT};color:${C.mute};" class="fx-pad">
    <b style="color:${C.ink2};">Who you are booking with.</b> Your job is carried out by an independent trader, and your contract for it is with the professional who accepts it. ${esc(COMPANY.legalName)} (Fixfy) arranges the booking as their agent and received your payment on their behalf, so paying Fixfy counts as paying them. Your booking is under our <a href="${esc(terms)}" style="color:${C.ink2};text-decoration:underline;">booking terms</a> (version of ${esc(TERMS.version)}), which also explain your legal right to cancel within 14 days and how to use it. You asked for the work to be done on the day you picked, so once it is done it can no longer be cancelled.
    ${hiddenId}
  </td></tr>

  <tr><td align="center" style="padding:22px 24px 0;font:400 12px/19px ${FONT};color:${C.mute};">
    Fixfy · Bookings with vetted independent professionals across London<br>
    ${esc(COMPANY.legalName)}, trading as Fixfy · 124 City Road, London EC1V 2NX · Company number ${esc(COMPANY.companyNumber)}<br>
    <a href="${esc(terms)}" style="color:${C.mute};text-decoration:underline;">Terms</a> &nbsp;·&nbsp; <a href="${esc(privacy)}" style="color:${C.mute};text-decoration:underline;">Privacy</a> &nbsp;·&nbsp; <a href="${esc(guarantee)}" style="color:${C.mute};text-decoration:underline;">Guarantee</a>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

  const text = [
    'Booking received.',
    '',
    `Thanks, ${firstName}. We have your booking for ${summary} on ${b.dateLabel}, arriving ${b.windowLabel}.`,
    '',
    'Your job is carried out by an independent, vetted professional. We are confirming yours now, and we email you their name and details as soon as they accept, always before your visit. If we cannot confirm a professional for your day, we offer you another day, or a full refund.',
    '',
    `Booking ${b.ref}`,
    ...b.lines.map((l) => `${l.label}${l.detail ? `, ${l.detail}` : ''}: ${l.amount == null ? 'quote' : money(l.amount)}`),
    `${b.deposit ? '50% deposit paid by card' : 'Paid by card'}: ${money(paid)}`,
    `Payment: ${payment}`,
    '',
    `When: ${b.dateLabel}, arriving ${b.windowLabel}`,
    `Where: ${b.addressLine}`,
    access ? `How your professional gets in: ${access}` : null,
    '',
    'What happens next',
    '1. Your professional: we confirm them and email you their name and details as soon as they accept, always before your visit.',
    '2. The day before: we call or message you to confirm your professional, the time and how they get in.',
    `3. ${b.dateLabel}: ${order}Your professional arrives ${b.windowLabel} and photographs every room as they finish.`,
    '4. Same day: your photo report lands in your inbox.',
    '',
    eot
      ? `Free re-clean within ${PROMISES.recleanDays.value} days: if your letting agent or landlord flags anything on our checklist, reply with their note and we arrange for your cleaner to come back at no cost.`
      : `${days}-day guarantee: if anything is not right, reply within ${days} days and we arrange for your professional to come back at no cost.`,
    prep.length ? `\nBefore your professional arrives\n${prep.map((p) => `- ${p}`).join('\n')}` : null,
    '',
    `Add to Google Calendar: ${calendar}`,
    '',
    `Changed your mind? Until a professional is confirmed, you can cancel for free and get a full refund. After that, changes and cancellation are free up to ${cancelHours} hours before your slot. Just reply to this email.`,
    '',
    `Who you are booking with: your job is carried out by an independent trader, and your contract for it is with the professional who accepts it. ${COMPANY.legalName} (Fixfy) arranges the booking as their agent and received your payment on their behalf.`,
    `Booking terms (version of ${TERMS.version}), including your legal right to cancel within 14 days: ${terms}`,
    'You asked for the work to be done on the day you picked, so once it is done it can no longer be cancelled.',
    '',
    `${COMPANY.legalName}, trading as Fixfy · 124 City Road, London EC1V 2NX · Company number ${COMPANY.companyNumber}`,
    encodedId ? `\n[${encodedId}]` : null,
  ]
    .filter((l) => l !== null)
    .join('\n')

  return {
    subject: `Booking received: ${b.summary} on ${b.dateLabel} (${b.ref})`,
    html,
    text,
    attachments: [LOGO_EMAIL_ATTACHMENT],
  }
}
