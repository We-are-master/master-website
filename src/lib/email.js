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
