import { createClient } from '@supabase/supabase-js'
import { initSecurity } from './security.js'

// Initialize security features
initSecurity()

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[SECURITY] Missing Supabase configuration. Please check your environment variables.')
}

// Enhanced Supabase client with security features
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Use sessionStorage for auth tokens (more secure than localStorage)
    storage: typeof window !== 'undefined' ? window.sessionStorage : null,
    storageKey: 'sb-auth-token',
    // Security: Auto-refresh token before expiration
    autoRefreshToken: true,
    // Security: Detect and handle token expiration
    detectSessionInUrl: true,
    // Security: Flow type for better security
    flowType: 'pkce', // PKCE flow for better security
  },
  // Global security headers
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
  // Database security: Use RLS (Row Level Security) policies
  db: {
    schema: 'public',
  },
  // Realtime security: Disable if not needed
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limit realtime events
    },
  },
})

// Security: Monitor auth state changes for suspicious activity
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    // Log security-relevant auth events
    if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      console.log('[SECURITY] Auth event:', event)
    }
    
    // Security: Clear sensitive data on sign out
    if (event === 'SIGNED_OUT') {
      // Clear any cached sensitive data
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('csrf_token')
      }
    }
  })
}

