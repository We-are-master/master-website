import { tradesEnv, calSignatureOk, scheduleEvent, sendToMeta } from '../../server/trades/meta.js'

/** A assinatura do Cal é sobre o corpo cru: nada de parser antes. */
export const config = { api: { bodyParser: false } }

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function reply(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

/** Webhook do Cal.com (BOOKING_CREATED) → Schedule na Conversions API da Meta. */
export default async function handler(req, res) {
  if (req.method !== 'POST') return reply(res, 405, { error: 'Method not allowed' })
  const env = tradesEnv()
  const raw = await rawBody(req)
  if (!calSignatureOk(raw, req.headers['x-cal-signature-256'], env.calWebhookSecret)) {
    return reply(res, 401, { error: 'Bad signature' })
  }
  let body
  try {
    body = JSON.parse(raw.toString('utf8'))
  } catch {
    return reply(res, 400, { error: 'Bad JSON' })
  }
  if (body.triggerEvent !== 'BOOKING_CREATED') return reply(res, 200, { ok: true, meta: 'ignored' })
  const meta = await sendToMeta(env, scheduleEvent(body.payload))
  return reply(res, 200, { ok: true, meta })
}
