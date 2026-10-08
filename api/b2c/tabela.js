import { handleTabela } from '../../server/b2c/tabela.js'
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
  try {
    const { status, data } = await handleTabela()
    if (status === 204) {
      // Sem tabela do OS: a página fica com a embutida. Cache curto na borda para
      // a chave desligada não custar uma função fria em toda visita.
      res.writeHead(204, { ...corsHeaders(origin), 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' })
      return res.end()
    }
    res.writeHead(status, {
      ...corsHeaders(origin),
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    })
    res.end(JSON.stringify(data))
  } catch (err) {
    console.error('[api/b2c/tabela]', err)
    res.writeHead(204, { ...corsHeaders(origin), 'Cache-Control': 'no-store' })
    res.end()
  }
}
