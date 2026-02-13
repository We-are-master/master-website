// Supabase Edge Function: submit-partner-application
// Two-phase flow: (1) POST form data → create row + return signed upload URLs; (2) client uploads files; (3) POST { id, complete: true } → set URLs, send email.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateRequest,
  logSecurityEvent,
  getCorsHeaders,
  validateEmail,
  sanitizeString,
  validateSupabaseEnv,
} from '../_shared/security.ts'

const BUCKET = 'partner-docs'
// Public storage base URL for document links (DB + email). Avoids internal kong URL.
const STORAGE_PUBLIC_BASE = Deno.env.get('STORAGE_PUBLIC_URL') || 'https://storage.wearemaster.com'

const FILE_SLOTS = [
  'tools_photo',
  'id_document',
  'proof_of_address',
  'right_to_work',
  'public_liability',
  'dbs',
  'profile_photo',
] as const

function parseStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string').map((x) => String(x).trim()).slice(0, 50)
  if (typeof v === 'string') return [v.trim()].filter(Boolean)
  return []
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req.headers.get('origin')) })
  }

  const validation = await validateRequest(req, {
    requireBody: true,
    rateLimitType: 'api',
  })

  if (!validation.valid) {
    logSecurityEvent('partner_application_validation_failed', {
      error: validation.error,
      ip: validation.clientIP,
    }, 'high')
    return new Response(JSON.stringify({ error: validation.error }), {
      status: validation.status || 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const envCheck = validateSupabaseEnv(supabaseUrl, supabaseServiceKey)
  if (!envCheck.valid) {
    return new Response(JSON.stringify({ error: envCheck.error }), {
      status: 500,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const body = (validation.body ?? {}) as Record<string, unknown>

  // Phase 2: complete (set document URLs and send email)
  if (body.complete === true && body.id && typeof body.id === 'string') {
    const applicationId = body.id.trim()
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    const { data: row, error: fetchError } = await supabase
      .from('partner_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !row) {
      return new Response(
        JSON.stringify({ error: 'Application not found or already completed' }),
        { status: 404, headers: { ...validation.headers, 'Content-Type': 'application/json' } }
      )
    }

    const baseStorageUrl = `${STORAGE_PUBLIC_BASE}/storage/v1/object/public/${BUCKET}`
    const urlBySlot: Record<string, string> = {}
    const updates: Record<string, string> = {
      status: 'completed',
      updated_at: new Date().toISOString(),
      tools_photo_url: `${baseStorageUrl}/${applicationId}/tools_photo`,
      id_document_url: `${baseStorageUrl}/${applicationId}/id_document`,
      proof_of_address_url: `${baseStorageUrl}/${applicationId}/proof_of_address`,
      right_to_work_url: `${baseStorageUrl}/${applicationId}/right_to_work`,
      public_liability_url: `${baseStorageUrl}/${applicationId}/public_liability`,
      dbs_url: `${baseStorageUrl}/${applicationId}/dbs`,
      profile_photo_url: `${baseStorageUrl}/${applicationId}/profile_photo`,
    }
    urlBySlot.toolsPhotoUrl = updates.tools_photo_url
    urlBySlot.idDocumentUrl = updates.id_document_url
    urlBySlot.proofOfAddressUrl = updates.proof_of_address_url
    urlBySlot.rightToWorkUrl = updates.right_to_work_url
    urlBySlot.publicLiabilityUrl = updates.public_liability_url
    urlBySlot.dbsUrl = updates.dbs_url
    urlBySlot.profilePhotoUrl = updates.profile_photo_url

    const { error: updateError } = await supabase
      .from('partner_applications')
      .update(updates)
      .eq('id', applicationId)

    if (updateError) {
      logSecurityEvent('partner_application_complete_update_error', { message: updateError.message }, 'medium')
      return new Response(
        JSON.stringify({ error: 'Failed to complete application' }),
        { status: 500, headers: { ...validation.headers, 'Content-Type': 'application/json' } }
      )
    }

    // Send email to hello@wearemaster.com
    const notifyUrl = `${supabaseUrl}/functions/v1/send-email`
    try {
      const emailRes = await fetch(notifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseServiceKey}` },
        body: JSON.stringify({
          template: 'partner_application_notification',
          to: 'hello@wearemaster.com',
          data: {
            id: applicationId,
            fullName: row.full_name,
            email: row.email,
            phone: row.phone,
            street: row.street,
            city: row.city,
            state: row.state,
            postalCode: row.postal_code,
            country: row.country,
            businessStructure: row.business_structure,
            workTypes: row.work_types,
            areaCoverage: row.area_coverage,
            vehicle: row.vehicle,
            teamSize: row.team_size,
            ...urlBySlot,
          },
        }),
      })
      if (!emailRes.ok) console.warn('[submit-partner-application] Notify email failed:', await emailRes.text())
    } catch (e) {
      console.warn('[submit-partner-application] Notify email error:', e)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...validation.headers, 'Content-Type': 'application/json' } }
    )
  }

  // Phase 1: validate form and create row + signed upload URLs
  const fullName = body.fullName != null ? sanitizeString(String(body.fullName), 200) : ''
  const emailRaw = body.email != null ? String(body.email).trim().toLowerCase() : ''
  const phone = body.phone != null ? sanitizeString(String(body.phone), 30) : ''
  const street = body.street != null ? sanitizeString(String(body.street), 300) : null
  const city = body.city != null ? sanitizeString(String(body.city), 100) : null
  const state = body.state != null ? sanitizeString(String(body.state), 100) : null
  const postalCode = body.postalCode != null ? sanitizeString(String(body.postalCode), 20) : null
  const country = body.country != null ? sanitizeString(String(body.country), 100) : 'United Kingdom'
  const businessStructure = body.businessStructure != null ? sanitizeString(String(body.businessStructure), 50) : ''
  const workTypes = parseStringArray(body.workTypes)
  const areaCoverage = parseStringArray(body.areaCoverage)
  const vehicle = body.vehicle != null ? sanitizeString(String(body.vehicle), 20) : ''
  const teamSize = body.teamSize != null ? sanitizeString(String(body.teamSize), 20) : null
  const declaration = body.declaration === true || body.declaration === 'true'

  if (!fullName) {
    return new Response(JSON.stringify({ error: 'Full name is required' }), {
      status: 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }
  const emailValidation = validateEmail(emailRaw)
  if (!emailValidation.valid || !emailValidation.sanitized) {
    return new Response(JSON.stringify({ error: 'Valid email is required' }), {
      status: 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }
  if (!phone) {
    return new Response(JSON.stringify({ error: 'Phone is required' }), {
      status: 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }
  if (!businessStructure) {
    return new Response(JSON.stringify({ error: 'Business structure is required' }), {
      status: 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }
  if (workTypes.length === 0) {
    return new Response(JSON.stringify({ error: 'Select at least one work type' }), {
      status: 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }
  if (areaCoverage.length === 0) {
    return new Response(JSON.stringify({ error: 'Select at least one area' }), {
      status: 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }
  if (!vehicle) {
    return new Response(JSON.stringify({ error: 'Vehicle option is required' }), {
      status: 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }
  if (!declaration) {
    return new Response(JSON.stringify({ error: 'You must accept the declaration' }), {
      status: 400,
      headers: { ...validation.headers, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

  const row = {
    full_name: fullName,
    email: emailValidation.sanitized,
    phone,
    street,
    city,
    state,
    postal_code: postalCode,
    country,
    business_structure: businessStructure,
    work_types: workTypes,
    area_coverage: areaCoverage,
    vehicle,
    team_size: teamSize,
    declaration,
  }

  const { data: inserted, error: insertError } = await supabase
    .from('partner_applications')
    .insert(row)
    .select('id')
    .single()

  if (insertError) {
    logSecurityEvent('partner_application_insert_error', { message: insertError.message }, 'medium')
    return new Response(
      JSON.stringify({ error: 'Failed to save application. Please try again.' }),
      { status: 500, headers: { ...validation.headers, 'Content-Type': 'application/json' } }
    )
  }

  const applicationId = inserted.id

  const uploads: Record<string, { url: string; token: string; path: string }> = {}
  for (const slot of FILE_SLOTS) {
    const path = `${applicationId}/${slot}`
    const { data: signed, error: signError } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path)
    if (signError) {
      console.warn(`[submit-partner-application] Signed URL for ${slot}:`, signError.message)
      continue
    }
    if (signed?.signedUrl && signed?.token) {
      uploads[slot === 'tools_photo' ? 'toolsPhoto' : slot === 'id_document' ? 'idDocument' : slot === 'proof_of_address' ? 'proofOfAddress' : slot === 'right_to_work' ? 'rightToWork' : slot === 'public_liability' ? 'publicLiability' : slot === 'dbs' ? 'dbs' : 'profilePhoto'] = {
        url: signed.signedUrl,
        token: signed.token,
        path: signed.path,
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      id: applicationId,
      uploads,
    }),
    { status: 200, headers: { ...validation.headers, 'Content-Type': 'application/json' } }
  )
})
