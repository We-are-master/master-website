import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getCorsHeaders } from '../_shared/security.ts'
import { listAvailableSlots } from '../_shared/google-calendar.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  const headers = {
    ...getCorsHeaders(req.headers.get('origin')),
    'Content-Type': 'application/json',
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  }

  try {
    const { days, fallback } = await listAvailableSlots(5)
    return new Response(JSON.stringify({ days, fallback }), { status: 200, headers })
  } catch (err) {
    console.error('[growth-availability]', err)
    return new Response(JSON.stringify({ error: 'Failed to load availability' }), { status: 500, headers })
  }
})
