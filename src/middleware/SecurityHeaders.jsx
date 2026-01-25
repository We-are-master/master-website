// Security headers middleware component
// Adds security headers via meta tags and ensures secure connections

import { useEffect } from 'react'

export function SecurityHeaders() {
  useEffect(() => {
    // Add security meta tags
    const addMetaTag = (name, content, httpEquiv = false) => {
      // Remove existing tag if present
      const existing = document.querySelector(
        httpEquiv
          ? `meta[http-equiv="${name}"]`
          : `meta[name="${name}"]`
      )
      if (existing) {
        existing.remove()
      }

      // Create new tag
      const meta = document.createElement('meta')
      if (httpEquiv) {
        meta.setAttribute('http-equiv', name)
      } else {
        meta.setAttribute('name', name)
      }
      meta.setAttribute('content', content)
      document.head.appendChild(meta)
    }

    // Content Security Policy (via meta tag - note: limited compared to HTTP header)
    addMetaTag(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://connect.facebook.net https://cdn-eu.pagesense.io https://www.clarity.ms https://salesiq.zoho.eu; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.stripe.com https://*.supabase.co https://supabase.wearemaster.com https://api.openai.com https://maps.googleapis.com https://connect.facebook.net https://www.facebook.com https://www.clarity.ms https://salesiq.zoho.eu; frame-src https://js.stripe.com;"
    )

    // Referrer Policy
    addMetaTag('referrer', 'strict-origin-when-cross-origin')

    // Viewport (security: prevent zoom-based attacks)
    addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes')

    // X-UA-Compatible (for IE, but good practice)
    addMetaTag('X-UA-Compatible', 'IE=edge', true)

    // Prevent clickjacking (additional protection via meta tag)
    addMetaTag('X-Frame-Options', 'DENY')

    // Cleanup on unmount
    return () => {
      // Meta tags will persist, but we could remove them if needed
    }
  }, [])

  return null // This component doesn't render anything
}

// Security: Force HTTPS in production
export function enforceHTTPS() {
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'http:' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    window.location.replace(
      window.location.href.replace('http:', 'https:')
    )
  }
}

// Initialize on import
if (typeof window !== 'undefined') {
  enforceHTTPS()
}
