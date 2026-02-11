// Email service helper functions
// Handles sending transactional emails via Supabase Edge Functions

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''

/**
 * Send a transactional email
 * @param {string} template - Email template name
 * @param {string} to - Recipient email address
 * @param {object} data - Template data (name, bookingRef, etc.)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendEmail(template, to, data = {}) {
  try {
    if (!SUPABASE_URL) {
      console.error('[Email] SUPABASE_URL not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template,
        to,
        data,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('[Email] Failed to send email:', errorData)
      return { success: false, error: errorData.error || 'Failed to send email' }
    }

    const result = await response.json()
    return { success: true, ...result }
  } catch (error) {
    console.error('[Email] Error sending email:', error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

/**
 * Save hero lead for remarketing (service + postcode + email from home form or LP).
 * Also triggers an email to hello@wearemaster.com with the lead details.
 * @param {{ email: string, service?: string, postcode?: string, source?: string, phone?: string, preferred_contact?: string }} leadData
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveHeroLead(leadData) {
  try {
    if (!SUPABASE_URL) {
      return { success: false, error: 'Service not configured' }
    }
    const { email, service, postcode, source = 'hero_b2c', phone, preferred_contact } = leadData || {}
    if (!email || !String(email).trim()) {
      return { success: false, error: 'Email is required' }
    }
    const payload = {
      email: String(email).trim().toLowerCase(),
      service: service || null,
      postcode: postcode || null,
      source,
    }
    if (phone != null && String(phone).trim()) payload.phone = String(phone).trim()
    if (preferred_contact != null && String(preferred_contact).trim()) payload.preferred_contact = String(preferred_contact).trim()
    const response = await fetch(`${SUPABASE_URL}/functions/v1/save-hero-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { success: false, error: err.error || 'Failed to save lead' }
    }
    const result = await response.json()
    return { success: true, ...result }
  } catch (error) {
    console.error('[HeroLead] Error saving lead:', error)
    return { success: false, error: error.message || 'Failed to save lead' }
  }
}

/**
 * Track abandoned checkout
 * Saves checkout data when user leaves without completing
 * @param {object} checkoutData - Checkout data to save
 * @returns {Promise<{success: boolean, checkoutId?: string, error?: string}>}
 */
export async function trackAbandonedCheckout(checkoutData) {
  try {
    if (!SUPABASE_URL) {
      return { success: false, error: 'Service not configured' }
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/track-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'abandon',
        ...checkoutData,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      return { success: false, error: errorData.error || 'Failed to track checkout' }
    }

    const result = await response.json()
    return { success: true, checkoutId: result.checkoutId }
  } catch (error) {
    console.error('[Checkout] Error tracking abandoned checkout:', error)
    return { success: false, error: error.message || 'Failed to track checkout' }
  }
}
