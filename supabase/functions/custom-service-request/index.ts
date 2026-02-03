// Supabase Edge Function: custom-service-request
// Handles custom service requests when no matching services are found
// Sends webhook to n8n for processing

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { getCorsHeaders } from '../_shared/security.ts'

const N8N_CUSTOM_REQUEST_WEBHOOK_URL = Deno.env.get('N8N_CUSTOM_REQUEST_WEBHOOK_URL') || 
  'https://n8n.wearemaster.com/webhook/42366965-944b-48db-b294-3567f140cbab'

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
    const body = await req.json() as {
      name?: string
      email?: string
      phone?: string
      serviceDescription?: string
      location?: string
      preferredDate?: string
      preferredTime?: string
      searchQuery?: string
    }

    // Validate required fields
    if (!body.name || !body.email || !body.serviceDescription) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, and serviceDescription are required' }),
        { status: 400, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
      )
    }

    // Prepare webhook payload
    const webhookPayload = {
      type: 'custom_service_request',
      timestamp: new Date().toISOString(),
      source: 'b2c_booking',
      customer: {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
      },
      request: {
        service_description: body.serviceDescription.trim(),
        location: body.location?.trim() || null,
        preferred_date: body.preferredDate || null,
        preferred_time: body.preferredTime || null,
        original_search_query: body.searchQuery?.trim() || null,
      },
    }

    // Send to n8n webhook
    try {
      const webhookResponse = await fetch(N8N_CUSTOM_REQUEST_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      })

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text()
        console.error('[custom-service-request] n8n webhook error:', webhookResponse.status, errorText)
        
        // Still return success to user, but log the error
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Request submitted successfully',
            warning: 'Notification may be delayed'
          }),
          { 
            status: 200, 
            headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Your custom service request has been submitted successfully. We will contact you soon!' 
        }),
        { 
          status: 200, 
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } 
        }
      )
    } catch (webhookError) {
      console.error('[custom-service-request] Webhook fetch error:', webhookError)
      
      // Return success to user even if webhook fails (graceful degradation)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Request submitted successfully',
          warning: 'Notification may be delayed'
        }),
        { 
          status: 200, 
          headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (err) {
    console.error('[custom-service-request] Error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
    )
  }
})
