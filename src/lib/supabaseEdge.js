/**
 * Invoke Supabase Edge Functions from the marketing site (contact form, leads, etc.)
 */

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export function isSupabaseFunctionsConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

function friendlyFetchError(error) {
  const msg = error?.message || ''
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Load failed')) {
    return 'Could not reach the server — check your connection or email hello@getfixfy.com'
  }
  return msg || 'Request failed'
}

/**
 * @param {string} functionName
 * @param {Record<string, unknown>} body
 * @returns {Promise<{ ok: boolean, status: number, data?: Record<string, unknown>, error?: string }>}
 */
export async function invokeSupabaseFunction(functionName, body) {
  if (!isSupabaseFunctionsConfigured()) {
    return { ok: false, status: 0, error: 'Service not configured' }
  }

  const url = `${SUPABASE_URL}/functions/v1/${functionName}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: data.error || data.msg || `Request failed (${response.status})`,
      }
    }

    return { ok: true, status: response.status, data }
  } catch (error) {
    console.error(`[Supabase] ${functionName} failed:`, error)
    return { ok: false, status: 0, error: friendlyFetchError(error) }
  }
}
