import { handleConfig } from '../../server/b2c/booking.js'
import { corsHeaders } from '../../server/growth/http.js'

export default async function handler(req, res) {
  const origin = req.headers.origin || null
  const { status, data } = handleConfig()
  res.writeHead(status, { ...corsHeaders(origin), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(data))
}
