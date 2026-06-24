/**
 * Serve static microsites at /network and /growth in dev/preview,
 * and inject runtime config for Growth funnel (Stripe + Supabase).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const STATIC_ROUTES = [
  { path: '/network', index: '/network/index.html' },
  { path: '/partners', index: '/network/index.html' },
  { path: '/growth', index: '/growth/index.html' },
]

function staticRewriteMiddleware(req, _res, next) {
  const raw = req.url || ''
  const [pathname, search = ''] = raw.split('?')
  for (const route of STATIC_ROUTES) {
    if (pathname === route.path || pathname === `${route.path}/`) {
      req.url = `${route.index}${search ? `?${search}` : ''}`
      break
    }
  }
  next()
}

function growthConfigBody(env) {
  const supabaseUrl = (env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
  const apiBase = (env.VITE_GROWTH_API_URL || '/api/growth').replace(/\/$/, '')
  const payload = {
    supabaseUrl,
    supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || '',
    stripePublishableKey: env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    apiBase,
  }
  return `window.GROWTH_CONFIG = ${JSON.stringify(payload)};\nwindow.NETWORK_CONFIG = ${JSON.stringify(payload)};\n`
}

function writeGrowthConfig(env, outPath) {
  mkdirSync(resolve(outPath, '..'), { recursive: true })
  writeFileSync(outPath, growthConfigBody(env), 'utf8')
}

export default function staticSitesPlugin() {
  let root = process.cwd()
  let env = {}

  return {
    name: 'static-sites',
    configResolved(config) {
      root = config.root
      env = config.env
    },
    configureServer(server) {
      server.middlewares.use(staticRewriteMiddleware)
      server.middlewares.use((req, res, next) => {
        const pathOnly = req.url?.split('?')[0]
        if (pathOnly === '/growth/growth-config.js' || pathOnly === '/network/network-config.js') {
          res.setHeader('Content-Type', 'application/javascript')
          res.end(growthConfigBody(server.config.env))
          return
        }
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use(staticRewriteMiddleware)
    },
    closeBundle() {
      writeGrowthConfig(env, resolve(root, 'dist/growth/growth-config.js'))
      writeGrowthConfig(env, resolve(root, 'dist/network/network-config.js'))
    },
    buildStart() {
      writeGrowthConfig(env, resolve(root, 'public/growth/growth-config.js'))
      writeGrowthConfig(env, resolve(root, 'public/network/network-config.js'))
    },
  }
}
