import { handleWebhook } from '../../server/b2c/booking.js'

/** A assinatura da Stripe é sobre o corpo cru: nada de parser antes. */
export const config = { api: { bodyParser: false } }

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ error: 'Method not allowed' }))
  }
  try {
    const { status, data } = await handleWebhook(await rawBody(req), req.headers['stripe-signature'])
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  } catch (err) {
    console.error('[api/b2c/webhook]', err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Webhook failed' }))
  }
}
