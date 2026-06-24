/**
 * Dev server middleware: /api/growth/* (Railway Supabase edge functions return 401).
 */
import { handleAvailability } from '../server/growth/availability.js'
import { handleCreateCheckout } from '../server/growth/create-checkout.js'
import { corsHeaders, readJsonBody } from '../server/growth/http.js'

export default function growthApiPlugin() {
  return {
    name: 'growth-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] || ''
        const origin = req.headers.origin || null

        if (url === '/api/growth/availability' && req.method === 'GET') {
          const { status, data } = await handleAvailability()
          res.writeHead(status, { ...corsHeaders(origin), 'Content-Type': 'application/json' })
          res.end(JSON.stringify(data))
          return
        }

        if (url === '/api/growth/create-checkout' && req.method === 'POST') {
          try {
            const body = await readJsonBody(req)
            const { status, data } = await handleCreateCheckout(body)
            res.writeHead(status, { ...corsHeaders(origin), 'Content-Type': 'application/json' })
            res.end(JSON.stringify(data))
          } catch (err) {
            console.error('[growth-api]', err)
            res.writeHead(500, { ...corsHeaders(origin), 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Checkout failed' }))
          }
          return
        }

        if (url.startsWith('/api/growth/') && req.method === 'OPTIONS') {
          res.writeHead(204, corsHeaders(origin))
          res.end()
          return
        }

        next()
      })
    },
  }
}
