// Enterprise-grade security utilities for Supabase Edge Functions
// Implements security measures similar to Uber, Amazon, Brex

import { corsHeaders } from './cors.ts'

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Allowed origins for CORS (configure based on your domains)
const ALLOWED_ORIGINS = [
  'https://wearemaster.com',
  'https://www.wearemaster.com',
  'https://b2b.wearemaster.com',
  'https://www.b2b.wearemaster.com',
  'https://supabase.wearemaster.com',
  'https://www.supabase.wearemaster.com',
  'https://www.storage.wearemaster.com',
  'https://storage.wearemaster.com',

  // Add your production domains here
  // For development, you can add localhost (but remove in production)
  ...(Deno.env.get('ENVIRONMENT') === 'development' 
    ? ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'] 
    : [])
]

// Maximum payload size (10MB)
const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024

// Rate limiting configuration
const RATE_LIMITS = {
  // General API endpoints
  default: { requests: 100, window: 60 }, // 100 requests per minute
  // Authentication endpoints (stricter)
  auth: { requests: 5, window: 60 }, // 5 requests per minute
  // Payment endpoints (very strict)
  payment: { requests: 10, window: 60 }, // 10 requests per minute
  // Webhook endpoints
  webhook: { requests: 1000, window: 60 }, // 1000 requests per minute (webhooks can be bursty)
}

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://*.supabase.co; frame-src https://js.stripe.com;",
}

/**
 * Get client IP address from request
 */
export function getClientIP(req: Request): string {
  // Check various headers for real IP (in case of proxies/load balancers)
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = req.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback (not reliable in serverless, but better than nothing)
  return 'unknown'
}

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string, 
  limitType: keyof typeof RATE_LIMITS = 'default'
): { allowed: boolean; remaining: number; resetTime: number } {
  const limit = RATE_LIMITS[limitType]
  const now = Date.now()
  
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    // Create new record
    const resetTime = now + (limit.window * 1000)
    rateLimitStore.set(key, { count: 1, resetTime })
    
    // Cleanup old records periodically (simple cleanup)
    if (rateLimitStore.size > 10000) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (now > v.resetTime) {
          rateLimitStore.delete(k)
        }
      }
    }
    
    return { allowed: true, remaining: limit.requests - 1, resetTime }
  }
  
  if (record.count >= limit.requests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }
  
  record.count++
  return { allowed: true, remaining: limit.requests - record.count, resetTime: record.resetTime }
}

/**
 * Get CORS headers based on origin
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const baseHeaders = {
    ...corsHeaders,
    ...securityHeaders,
  }
  
  if (!origin) {
    return baseHeaders
  }
  
  // Check if origin is allowed
  const isAllowed = ALLOWED_ORIGINS.some(allowed => {
    if (allowed.includes('*')) {
      const pattern = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$')
      return pattern.test(origin)
    }
    return origin === allowed
  })
  
  if (isAllowed) {
    return {
      ...baseHeaders,
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
    }
  }
  
  // Origin not allowed - return base headers without CORS
  return {
    ...baseHeaders,
    'Access-Control-Allow-Origin': 'null',
  }
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email: string): { valid: boolean; sanitized?: string; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }
  
  // Trim and lowercase
  const sanitized = email.trim().toLowerCase()
  
  // Length check
  if (sanitized.length > 254) {
    return { valid: false, error: 'Email is too long' }
  }
  
  // Basic format validation (RFC 5322 simplified)
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i
  
  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid email format' }
  }
  
  // Check for dangerous patterns
  if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.endsWith('.')) {
    return { valid: false, error: 'Invalid email format' }
  }
  
  return { valid: true, sanitized }
}

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeString(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength)
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Basic XSS prevention (for display, not for storage - use proper escaping in templates)
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
  
  return sanitized
}

/**
 * Validate amount (for payments)
 */
export function validateAmount(amount: number | string): { valid: boolean; value?: number; error?: string } {
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
  
  // Maximum amount check (adjust based on your business rules)
  const MAX_AMOUNT = 100000 // £100,000
  if (numAmount > MAX_AMOUNT) {
    return { valid: false, error: 'Amount exceeds maximum allowed' }
  }
  
  // Round to 2 decimal places for currency
  const rounded = Math.round(numAmount * 100) / 100
  
  return { valid: true, value: rounded }
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): { valid: boolean; sanitized?: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' }
  }
  
  // Remove all non-digit characters except +
  let sanitized = phone.replace(/[^\d+]/g, '')
  
  // UK phone number validation (adjust for your region)
  // Basic validation: should start with +44 or 0, and be 10-15 digits
  if (sanitized.startsWith('+44')) {
    sanitized = sanitized.replace('+44', '0')
  }
  
  // Remove leading 0 if present for length check
  const digitsOnly = sanitized.replace(/^\+?0?/, '').replace(/\D/g, '')
  
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { valid: false, error: 'Invalid phone number format' }
  }
  
  return { valid: true, sanitized }
}

/**
 * Validate postcode (UK format)
 */
export function validatePostcode(postcode: string): { valid: boolean; sanitized?: string; error?: string } {
  if (!postcode || typeof postcode !== 'string') {
    return { valid: false, error: 'Postcode is required' }
  }
  
  // UK postcode regex
  const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i
  const sanitized = postcode.trim().toUpperCase().replace(/\s+/g, ' ')
  
  if (!postcodeRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid postcode format' }
  }
  
  return { valid: true, sanitized }
}

/**
 * Check payload size
 */
export function validatePayloadSize(body: string | null): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: true }
  }
  
  const size = new TextEncoder().encode(body).length
  
  if (size > MAX_PAYLOAD_SIZE) {
    return { valid: false, error: `Payload too large. Maximum size is ${MAX_PAYLOAD_SIZE / 1024 / 1024}MB` }
  }
  
  return { valid: true }
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
    environment: Deno.env.get('ENVIRONMENT') || 'production',
  }
  
  // In production, send to your logging service (e.g., Datadog, CloudWatch, etc.)
  console.error(`[SECURITY ${severity.toUpperCase()}]`, JSON.stringify(logEntry))
  
  // For critical events, you might want to send alerts
  if (severity === 'critical') {
    // TODO: Integrate with alerting service (PagerDuty, Slack, etc.)
    console.error('CRITICAL SECURITY EVENT - ALERT REQUIRED:', logEntry)
  }
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify CSRF token (simple implementation - use proper session storage in production)
 */
export function verifyCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false
  }
  
  // Use constant-time comparison to prevent timing attacks
  if (token.length !== expectedToken.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Validate request with comprehensive security checks
 */
export async function validateRequest(
  req: Request,
  options: {
    requireAuth?: boolean
    requireBody?: boolean
    rateLimitType?: keyof typeof RATE_LIMITS
    maxPayloadSize?: number
  } = {}
): Promise<{
  valid: boolean
  error?: string
  status?: number
  headers?: Record<string, string>
  body?: unknown
  clientIP?: string
}> {
  const clientIP = getClientIP(req)
  const origin = req.headers.get('origin')
  
  // Check rate limit
  const rateLimitKey = `${clientIP}:${req.url}`
  const rateLimit = checkRateLimit(rateLimitKey, options.rateLimitType || 'default')
  
  if (!rateLimit.allowed) {
    logSecurityEvent('rate_limit_exceeded', {
      ip: clientIP,
      url: req.url,
      method: req.method,
    }, 'high')
    
    return {
      valid: false,
      error: 'Rate limit exceeded. Please try again later.',
      status: 429,
      headers: {
        ...getCorsHeaders(origin),
        'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
        'X-RateLimit-Limit': RATE_LIMITS[options.rateLimitType || 'default'].requests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      },
    }
  }
  
  // Validate payload size
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const body = await req.clone().text()
    const payloadCheck = validatePayloadSize(body)
    
    if (!payloadCheck.valid) {
      logSecurityEvent('payload_too_large', {
        ip: clientIP,
        url: req.url,
        size: body.length,
      }, 'medium')
      
      return {
        valid: false,
        error: payloadCheck.error,
        status: 413,
        headers: getCorsHeaders(origin),
      }
    }
  }
  
  // Parse body if needed
  let parsedBody: unknown = null
  if (options.requireBody && req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const body = await req.text()
      if (body) {
        parsedBody = JSON.parse(body)
      }
    } catch (error) {
      logSecurityEvent('invalid_json', {
        ip: clientIP,
        url: req.url,
        error: error.message,
      }, 'low')
      
      return {
        valid: false,
        error: 'Invalid JSON in request body',
        status: 400,
        headers: getCorsHeaders(origin),
      }
    }
  }
  
  return {
    valid: true,
    body: parsedBody,
    clientIP,
    headers: {
      ...getCorsHeaders(origin),
      'X-RateLimit-Limit': RATE_LIMITS[options.rateLimitType || 'default'].requests.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': rateLimit.resetTime.toString(),
    },
  }
}
