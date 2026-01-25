// Enterprise-grade security utilities for frontend
// Implements security measures similar to Uber, Amazon, Brex

/**
 * Rate limiting for client-side requests
 * Uses localStorage to track request counts per endpoint
 */
class ClientRateLimiter {
  constructor() {
    this.store = new Map()
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000) // Cleanup every minute
  }

  cleanup() {
    const now = Date.now()
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key)
      }
    }
  }

  checkLimit(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now()
    const record = this.store.get(key)

    if (!record || now > record.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + windowMs })
      return { allowed: true, remaining: maxRequests - 1 }
    }

    if (record.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime }
    }

    record.count++
    return { allowed: true, remaining: maxRequests - record.count }
  }
}

const rateLimiter = new ClientRateLimiter()

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(str, maxLength = 10000) {
  if (typeof str !== 'string') return ''
  
  // Trim and limit length
  let sanitized = str.trim().slice(0, maxLength)
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Basic XSS prevention (for display)
  const div = document.createElement('div')
  div.textContent = sanitized
  return div.innerHTML
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }

  const sanitized = email.trim().toLowerCase()

  if (sanitized.length > 254) {
    return { valid: false, error: 'Email is too long' }
  }

  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i

  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid email format' }
  }

  if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.endsWith('.')) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true, sanitized }
}

/**
 * Validate phone number
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' }
  }

  let sanitized = phone.replace(/[^\d+]/g, '')

  if (sanitized.startsWith('+44')) {
    sanitized = sanitized.replace('+44', '0')
  }

  const digitsOnly = sanitized.replace(/^\+?0?/, '').replace(/\D/g, '')

  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { valid: false, error: 'Invalid phone number format' }
  }

  return { valid: true, sanitized }
}

/**
 * Validate postcode (UK format)
 */
export function validatePostcode(postcode) {
  if (!postcode || typeof postcode !== 'string') {
    return { valid: false, error: 'Postcode is required' }
  }

  const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i
  const sanitized = postcode.trim().toUpperCase().replace(/\s+/g, ' ')

  if (!postcodeRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid postcode format' }
  }

  return { valid: true, sanitized }
}

/**
 * Validate amount
 */
export function validateAmount(amount) {
  if (amount === null || amount === undefined) {
    return { valid: false, error: 'Amount is required' }
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount) || !isFinite(numAmount)) {
    return { valid: false, error: 'Invalid amount' }
  }

  if (numAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' }
  }

  const MAX_AMOUNT = 100000
  if (numAmount > MAX_AMOUNT) {
    return { valid: false, error: 'Amount exceeds maximum allowed' }
  }

  const rounded = Math.round(numAmount * 100) / 100

  return { valid: true, value: rounded }
}

/**
 * Check rate limit before making request
 */
export function checkRateLimit(endpoint, maxRequests = 10, windowMs = 60000) {
  const key = `${endpoint}:${windowMs}`
  return rateLimiter.checkLimit(key, maxRequests, windowMs)
}

/**
 * Secure fetch wrapper with rate limiting and error handling
 */
export async function secureFetch(url, options = {}) {
  // Check rate limit
  const rateLimit = checkRateLimit(url, 20, 60000) // 20 requests per minute per endpoint
  
  if (!rateLimit.allowed) {
    throw new Error('Rate limit exceeded. Please try again later.')
  }

  // Add security headers
  const secureOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers,
    },
    credentials: 'same-origin', // Don't send credentials to third parties
  }

  try {
    const response = await fetch(url, secureOptions)

    // Check for rate limit headers from server
    const remaining = response.headers.get('X-RateLimit-Remaining')
    if (remaining !== null && parseInt(remaining) < 5) {
      console.warn('Rate limit warning: Only', remaining, 'requests remaining')
    }

    if (!response.ok) {
      // Don't expose error details to prevent information leakage
      if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.')
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else if (response.status === 401) {
        throw new Error('Authentication required.')
      } else if (response.status === 403) {
        throw new Error('Access denied.')
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Request failed')
      }
    }

    return response
  } catch (error) {
    // Log security-relevant errors (in production, send to logging service)
    if (error.message.includes('Rate limit') || error.message.includes('429')) {
      console.error('[SECURITY] Rate limit exceeded:', url)
    }
    throw error
  }
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Store CSRF token in session storage
 */
export function storeCSRFToken() {
  const token = generateCSRFToken()
  sessionStorage.setItem('csrf_token', token)
  return token
}

/**
 * Get CSRF token from session storage
 */
export function getCSRFToken() {
  return sessionStorage.getItem('csrf_token')
}

/**
 * Validate input against common attack patterns
 */
export function validateInput(input, type = 'string', options = {}) {
  if (input === null || input === undefined) {
    return { valid: false, error: 'Input is required' }
  }

  switch (type) {
    case 'email':
      return validateEmail(input)
    case 'phone':
      return validatePhone(input)
    case 'postcode':
      return validatePostcode(input)
    case 'amount':
      return validateAmount(input)
    case 'string':
      const maxLength = options.maxLength || 10000
      if (typeof input !== 'string') {
        return { valid: false, error: 'Input must be a string' }
      }
      if (input.length > maxLength) {
        return { valid: false, error: `Input exceeds maximum length of ${maxLength}` }
      }
      // Check for dangerous patterns
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /data:text\/html/i,
      ]
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(input)) {
          return { valid: false, error: 'Input contains potentially dangerous content' }
        }
      }
      
      return { valid: true, sanitized: sanitizeString(input, maxLength) }
    default:
      return { valid: true, sanitized: input }
  }
}

/**
 * Content Security Policy violation handler
 */
export function setupCSPViolationHandler() {
  if (typeof document !== 'undefined') {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.error('[SECURITY] CSP Violation:', {
        violatedDirective: e.violatedDirective,
        blockedURI: e.blockedURI,
        documentURI: e.documentURI,
      })
      
      // In production, send to logging service
      // logSecurityEvent('csp_violation', { ... })
    })
  }
}

/**
 * Initialize security features
 */
export function initSecurity() {
  // Setup CSP violation handler
  setupCSPViolationHandler()
  
  // Store CSRF token
  if (typeof sessionStorage !== 'undefined') {
    if (!getCSRFToken()) {
      storeCSRFToken()
    }
  }
  
  // Prevent common XSS attacks
  if (typeof window !== 'undefined') {
    // Override dangerous functions (for additional protection)
    const originalEval = window.eval
    window.eval = function() {
      console.warn('[SECURITY] eval() usage blocked')
      throw new Error('eval() is disabled for security reasons')
    }
  }
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  initSecurity()
}
