import { handleLead } from '../../server/b2c/lead.js'
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
    const { status, data } = await handleLead(await readBody(req))
    res.writeHead(status, headers)
    res.end(JSON.stringify(data))
  } catch (err) {
    console.error('[api/b2c/lead]', err)
    // Lead nunca atrapalha a reserva: o navegador ignora a resposta.
    res.writeHead(200, headers)
    res.end(JSON.stringify({ ok: false }))
  }
}
