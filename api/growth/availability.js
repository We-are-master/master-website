import { handleAvailability } from '../../server/growth/availability.js'
import { corsHeaders } from '../../server/growth/http.js'

export default async function handler(req, res) {
  const origin = req.headers.origin || null
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(origin))
    return res.end()
  }
  if (req.method !== 'GET') {
    res.writeHead(405, { ...corsHeaders(origin), 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ error: 'Method not allowed' }))
  }
  const { status, data } = await handleAvailability()
  res.writeHead(status, { ...corsHeaders(origin), 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}
