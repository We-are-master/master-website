/**
 * Dev server: /api/b2c/* com o mesmo código das funções da Vercel.
 */
import { handleBooking, handleCheckout, handleConfig, handlePayment, handleWebhook } from '../server/b2c/booking.js'
import { handlePromo } from '../server/b2c/promo.js'
import { handleLead } from '../server/b2c/lead.js'
import { clientIp } from '../server/b2c/meta.js'
import { corsHeaders, readJsonBody } from '../server/growth/http.js'

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default function b2cApiPlugin() {
  return {
    name: 'b2c-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] || ''
        if (!url.startsWith('/api/b2c/')) return next()
        const origin = req.headers.origin || null
        const headers = { ...corsHeaders(origin), 'Content-Type': 'application/json' }
        const reply = ({ status, data }) => {
          res.writeHead(status, headers)
          res.end(JSON.stringify(data))
        }
        try {
          if (req.method === 'OPTIONS') {
            res.writeHead(204, corsHeaders(origin))
            return res.end()
          }
          if (url === '/api/b2c/config' && req.method === 'GET') return reply(handleConfig())
          if (url === '/api/b2c/payment' && req.method === 'POST') return reply(await handlePayment(await readJsonBody(req), { ip: clientIp(req), userAgent: req.headers['user-agent'] }))
          if (url === '/api/b2c/checkout' && req.method === 'POST') return reply(await handleCheckout(await readJsonBody(req), { origin, ip: clientIp(req), userAgent: req.headers['user-agent'] }))
          if (url === '/api/b2c/booking' && req.method === 'POST') return reply(await handleBooking(await readJsonBody(req)))
          if (url === '/api/b2c/promo' && req.method === 'POST') return reply(await handlePromo(await readJsonBody(req)))
          if (url === '/api/b2c/lead' && req.method === 'POST') return reply(await handleLead(await readJsonBody(req)))
          if (url === '/api/b2c/webhook' && req.method === 'POST') return reply(await handleWebhook(await readRaw(req), req.headers['stripe-signature']))
          return reply({ status: 404, data: { error: 'Not found' } })
        } catch (err) {
          console.error('[b2c-api]', err)
          return reply({ status: 500, data: { error: err.message || 'Server error' } })
        }
      })
    },
  }
}
