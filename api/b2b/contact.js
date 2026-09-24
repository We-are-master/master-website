import { handleContact } from '../../server/b2b/contact.js'
import { corsHeaders } from '../../server/growth/http.js'
import { readBody } from '../b2c/_body.js'

/** POST do "Talk to us": vira e-mail para o time. */
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
    const { status, data } = await handleContact(await readBody(req))
    res.writeHead(status, headers)
    res.end(JSON.stringify(data))
  } catch (err) {
    console.error('[api/b2b/contact]', err)
    res.writeHead(500, headers)
    res.end(JSON.stringify({ error: 'Could not send. Please email hello@getfixfy.com.' }))
  }
}
