import { handleAgent } from '../../server/b2c/agent.js'
import { readBody } from './_body.js'
import { garantirTabela } from '../../server/b2c/tabela.js'

// Só servidor a servidor (o Harvey no OS): sem CORS.
export default async function handler(req, res) {
  // Tabela de preço do OS (só com TABELA_DO_OS=1; nunca lança).
  await garantirTabela()
  const headers = { 'Content-Type': 'application/json' }
  if (req.method !== 'POST') {
    res.writeHead(405, headers)
    return res.end(JSON.stringify({ error: 'Method not allowed' }))
  }
  try {
    const { status, data } = await handleAgent(await readBody(req), req.headers)
    res.writeHead(status, headers)
    res.end(JSON.stringify(data))
  } catch (err) {
    console.error('[api/b2c/agent]', err)
    res.writeHead(500, headers)
    res.end(JSON.stringify({ error: 'Agent request failed' }))
  }
}
