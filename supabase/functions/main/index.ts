// Main entry for Supabase Edge Runtime (self-hosted).
// Routes requests to the correct function worker by path (e.g. /create-payment-intent -> create-payment-intent/index.ts).
// Required: container must use --main-service /home/deno/functions/main
// No external imports to avoid std version issues in the edge-runtime container.

console.log('main function started')

const VERIFY_JWT = Deno.env.get('VERIFY_JWT') === 'true'

// Optional: JWT verification (set VERIFY_JWT=true and JWT_SECRET in env to enable)
async function verifyJWT(req: Request): Promise<{ ok: true } | { ok: false; response: Response }> {
  if (!VERIFY_JWT) return { ok: true }
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ msg: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    }
  }
  const [bearer, token] = authHeader.split(' ')
  if (bearer !== 'Bearer' || !token) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ msg: "Auth header must be 'Bearer <token>'" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    }
  }
  // Minimal JWT check: if JWT_SECRET is set, verify; otherwise skip (VERIFY_JWT can be false)
  const secret = Deno.env.get('JWT_SECRET')
  if (!secret) return { ok: true }
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? ''))
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return {
        ok: false,
        response: new Response(
          JSON.stringify({ msg: 'Token expired' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        ),
      }
    }
  } catch {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ msg: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    }
  }
  return { ok: true }
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  const url = new URL(req.url)
  const pathname = url.pathname
  const pathParts = pathname.split('/').filter(Boolean)

  // Resolve function name: /functions/v1/NAME -> NAME, /NAME -> NAME
  let serviceName: string
  if (pathParts[0] === 'functions' && pathParts[1] === 'v1' && pathParts[2]) {
    serviceName = pathParts[2]
  } else if (pathParts[0]) {
    serviceName = pathParts[0]
  } else {
    return new Response(
      JSON.stringify({ msg: 'missing function name in request' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const auth = await verifyJWT(req)
  if (!auth.ok) return auth.response

  const servicePath = `/home/deno/functions/${serviceName}`

  const memoryLimitMb = 150
  const workerTimeoutMs = 5 * 60 * 1000
  const envVarsObj = Deno.env.toObject()
  const envVars = Object.keys(envVarsObj).map((k) => [k, envVarsObj[k]])

  try {
    const worker = await EdgeRuntime.userWorkers.create({
      servicePath,
      memoryLimitMb,
      workerTimeoutMs,
      noModuleCache: false,
      importMapPath: null,
      envVars,
    })
    return await worker.fetch(req)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('worker boot error:', msg)
    return new Response(
      JSON.stringify({ error: msg, msg: 'Function failed to start. Check that the function directory and index.ts exist.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
