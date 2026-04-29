import { createClient } from '@supabase/supabase-js'
import { initSecurity } from './security.js'

// Initialize security features
initSecurity()

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

// createClient() throws if URL or key is empty — white screen when .env is missing or incomplete.
// In dev, use a non-throwing placeholder so the UI loads; real auth/API need .env from .env.example
const PLACEHOLDER_URL = 'https://placeholder.local.supabase.co'
const PLACEHOLDER_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDE3NjE5ODAsImV4cCI6MTk1NzI5Mzk4MH0.E7WQZUaLehzedTukipUNsAlwlRkfjJAjY2SzsLezfSo'

const resolvedUrl = hasSupabaseConfig
  ? supabaseUrl
  : import.meta.env.DEV
    ? PLACEHOLDER_URL
    : supabaseUrl
const resolvedKey = hasSupabaseConfig
  ? supabaseAnonKey
  : import.meta.env.DEV
    ? PLACEHOLDER_ANON_KEY
    : supabaseAnonKey

if (!hasSupabaseConfig) {
  if (import.meta.env.DEV) {
    console.warn(
      '[Supabase] Using dev placeholder: copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for real data.'
    )
  } else {
    console.error(
      '[SECURITY] Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    )
  }
}

// Enhanced Supabase client with security features
export const supabase = createClient(resolvedUrl, resolvedKey, {
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

