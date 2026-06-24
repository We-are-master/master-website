export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' }
  }
  const sanitized = email.trim().toLowerCase()
  if (sanitized.length > 254) return { valid: false, error: 'Email is too long' }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitized)) return { valid: false, error: 'Invalid email format' }
  return { valid: true, sanitized }
}

export function sanitizeString(input, maxLength = 10000) {
  if (typeof input !== 'string') return ''
  return input.trim().slice(0, maxLength).replace(/\0/g, '')
}

export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Invalid phone number' }
  }
  const digits = phone.replace(/[^\d+]/g, '')
  if (digits.length < 8 || digits.length > 16) {
    return { valid: false, error: 'Invalid phone number' }
  }
  return { valid: true, sanitized: digits }
}
