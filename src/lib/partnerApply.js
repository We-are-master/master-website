// Partner application submission: form + file uploads via signed URLs, then complete (email).

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''

/**
 * Build serializable form payload (no File objects).
 * @param {object} form - Form state from PartnerApply
 * @returns {object}
 */
function buildPayload(form) {
  return {
    fullName: form.fullName || '',
    email: form.email || '',
    phone: form.phone || '',
    street: form.street || '',
    city: form.city || '',
    state: form.state || '',
    postalCode: form.postalCode || '',
    country: form.country || 'United Kingdom',
    businessStructure: form.businessStructure || '',
    workTypes: Array.isArray(form.workTypes) ? form.workTypes : [],
    areaCoverage: Array.isArray(form.areaCoverage) ? form.areaCoverage : [],
    vehicle: form.vehicle || '',
    teamSize: form.teamSize || '',
    declaration: form.declaration === true,
  }
}

const FILE_KEYS = [
  { formKey: 'toolsPhoto', uploadKey: 'toolsPhoto' },
  { formKey: 'idDocument', uploadKey: 'idDocument' },
  { formKey: 'proofOfAddress', uploadKey: 'proofOfAddress' },
  { formKey: 'rightToWork', uploadKey: 'rightToWork' },
  { formKey: 'publicLiability', uploadKey: 'publicLiability' },
  { formKey: 'dbs', uploadKey: 'dbs' },
  { formKey: 'profilePhoto', uploadKey: 'profilePhoto' },
]

/**
 * Upload one file to a signed URL (PUT with Bearer token).
 * @param {{ url: string, token: string }} upload
 * @param {File} file
 */
async function uploadToSignedUrl(upload, file) {
  const res = await fetch(upload.url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      Authorization: `Bearer ${upload.token}`,
    },
    body: file,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Upload failed: ${res.status} ${text}`)
  }
}

/**
 * Submit partner application: create row, upload files, complete (sends email).
 * @param {object} form - Full form state from PartnerApply (including File fields)
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function submitPartnerApplication(form) {
  if (!SUPABASE_URL) {
    return { success: false, error: 'Service not configured' }
  }

  const payload = buildPayload(form)

  // 1) Create application and get signed upload URLs
  const createRes = await fetch(`${SUPABASE_URL}/functions/v1/submit-partner-application`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}))
    return { success: false, error: err.error || 'Failed to create application' }
  }

  const createData = await createRes.json()
  const { id, uploads } = createData
  if (!id || !uploads) {
    return { success: false, error: 'Invalid response from server' }
  }

  // 2) Upload each file that exists
  for (const { formKey, uploadKey } of FILE_KEYS) {
    const file = form[formKey]
    const upload = uploads[uploadKey]
    if (file && upload?.url && upload?.token) {
      try {
        await uploadToSignedUrl(upload, file)
      } catch (e) {
        console.error('[PartnerApply] Upload failed for', formKey, e)
        return { success: false, error: `Upload failed for ${formKey}. Please try again.` }
      }
    }
  }

  // 3) Complete application (set URLs, send email)
  const completeRes = await fetch(`${SUPABASE_URL}/functions/v1/submit-partner-application`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, complete: true }),
  })

  if (!completeRes.ok) {
    const err = await completeRes.json().catch(() => ({}))
    return { success: false, error: err.error || 'Failed to complete application' }
  }

  return { success: true }
}
