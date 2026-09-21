import { handleCheckout } from '../../server/b2c/booking.js'
import { corsHeaders } from '../../server/growth/http.js'
import { readBody } from './_body.js'

export default async function handler(req, res) {
  const origin = req.headers.origin || null
  const headers = { ...corsHeaders(origin), 'Content-Type': 'application/json' }
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(origin))
    return res.end()
  }
  if (req.method !== 'POST') {
    res.writeHead(405, headers)
    return res.end(JSON.stringify({ error: 'Method not allowed' }))
  }
  try {
    const { status, data } = await handleCheckout(await readBody(req), { origin })
    res.writeHead(status, headers)
    res.end(JSON.stringify(data))
  } catch (err) {
    console.error('[api/b2c/checkout]', err)
    res.writeHead(500, headers)
    res.end(JSON.stringify({ error: 'We could not open the payment page. Please try again.' }))
  }
}
