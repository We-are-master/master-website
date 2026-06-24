import { handleCreateCheckout } from '../../server/growth/create-checkout.js'
import { corsHeaders } from '../../server/growth/http.js'

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  const origin = req.headers.origin || null
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(origin))
    return res.end()
  }
  if (req.method !== 'POST') {
    res.writeHead(405, { ...corsHeaders(origin), 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ error: 'Method not allowed' }))
  }
  try {
    const body = await readBody(req)
    const { status, data } = await handleCreateCheckout(body)
    res.writeHead(status, { ...corsHeaders(origin), 'Content-Type': 'application/json' })
    res.end(JSON.stringify(data))
  } catch (err) {
    console.error('[api/growth/create-checkout]', err)
    res.writeHead(500, { ...corsHeaders(origin), 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Checkout failed' }))
  }
}
