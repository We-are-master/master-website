import { handleBooking } from '../../server/b2c/booking.js'
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
    const { status, data } = await handleBooking(await readBody(req))
    res.writeHead(status, headers)
    res.end(JSON.stringify(data))
  } catch (err) {
    console.error('[api/b2c/booking]', err)
    res.writeHead(500, headers)
    res.end(JSON.stringify({ error: 'We could not complete the booking. Please try again or email hello@getfixfy.com.' }))
  }
}
