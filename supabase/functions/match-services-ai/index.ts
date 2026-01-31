// Supabase Edge Function: match-services-ai
// Proxy for OpenAI API – keeps API key on server and hides api.openai.com from the client

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getCorsHeaders } from '../_shared/security.ts'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

const SYSTEM_PROMPT = 'You are a helpful service matching assistant. Match user queries with relevant services. Return a JSON array with service IDs and relevance scores. Always return valid JSON - use format: [{"id": "uuid", "score": 0.9}]. Be helpful and include services that match the user\'s intent.'

function buildUserPrompt(userQuery: string, serviceList: unknown[]): string {
  return `Match the user's service request with relevant services. BE PRECISE - prioritize exact matches.

USER REQUEST: "${userQuery}"

AVAILABLE SERVICES:
${JSON.stringify(serviceList.slice(0, 100), null, 2)}

CRITICAL RULES:
1. PRIORITY ORDER (most important first):
   - Services with EXACT keyword match (if user searches "tv mount", return services with keyword "tv mount")
   - Services with service name containing the exact search terms
   - Services with keywords containing the search terms
   - Only include generic services (like "Carpenter") if NO specific matches exist

2. EXAMPLES:
   - "tv mount" → Return TV mounting/installation services, NOT generic carpentry
   - "tap leak" → Return plumbing services, NOT general handyman
   - "deep clean" → Return deep cleaning services, NOT general cleaning

3. DO NOT return generic services (Carpenter, Handyman, etc.) when specific services match

RETURN FORMAT: JSON array with service IDs and scores.
Example: [{"id": "abc-123-uuid", "score": 0.95}, {"id": "def-456-uuid", "score": 0.85}]

SCORING:
- Exact keyword match: 0.95-1.0
- Service name match: 0.85-0.94
- Keyword contains match: 0.75-0.84
- Generic/category match: 0.5-0.74 (only if no specific matches)

Return up to 15 services, ordered by relevance. Return [] only if absolutely nothing matches.`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
    )
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey || !apiKey.startsWith('sk-')) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY not configured', matchedIds: [] }),
        { status: 503, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json() as { userQuery?: string; serviceList?: unknown[] }
    const userQuery = typeof body?.userQuery === 'string' ? body.userQuery.trim() : ''
    const serviceList = Array.isArray(body?.serviceList) ? body.serviceList : []

    if (!userQuery || serviceList.length === 0) {
      return new Response(
        JSON.stringify({ error: 'userQuery and serviceList required', matchedIds: [] }),
        { status: 400, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
      )
    }

    const prompt = buildUserPrompt(userQuery, serviceList)

    const openaiRes = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    })

    if (!openaiRes.ok) {
      const errText = await openaiRes.text()
      console.error('[match-services-ai] OpenAI error:', openaiRes.status, errText)
      return new Response(
        JSON.stringify({ error: 'AI service unavailable', matchedIds: [] }),
        { status: 502, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
      )
    }

    const data = await openaiRes.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) {
      return new Response(
        JSON.stringify({ matchedIds: [] }),
        { status: 200, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
      )
    }

    let cleanedContent = content
    if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
    }
    const jsonMatch = cleanedContent.match(/\[[\s\S]*?\]/)
    const raw = jsonMatch ? jsonMatch[0] : cleanedContent
    const parsed = JSON.parse(raw) as Array<{ id?: string } | string>

    const matchedIds = parsed
      .map((m) => (typeof m === 'string' ? m : m?.id))
      .filter((id): id is string => typeof id === 'string' && id.length > 0)

    return new Response(
      JSON.stringify({ matchedIds }),
      { status: 200, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('[match-services-ai] Error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal error', matchedIds: [] }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
    )
  }
})
