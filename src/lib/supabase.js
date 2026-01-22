import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate Supabase configuration
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not configured. Please set it in your environment variables.')
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not configured. Please set it in your environment variables.')
}

// Check if URL looks valid (should start with http:// or https://)
if (supabaseUrl && !supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.error('❌ Invalid Supabase URL format. URL should start with http:// or https://')
  console.error('Current URL:', supabaseUrl)
}

// Warn about common misconfigurations
if (supabaseUrl && supabaseUrl.includes('storage.wearemaster.com')) {
  console.error('❌ WARNING: Detected incorrect URL "storage.wearemaster.com"')
  console.error('   This domain does not exist. The correct URL should be:')
  console.error('   https://supabase.wearemaster.com (or your actual Supabase URL)')
  console.error('   Please update VITE_SUPABASE_URL in your production environment variables')
}

// Log configuration in development
if (import.meta.env.DEV) {
  console.log('🔧 Supabase Config:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET',
    hasKey: !!supabaseAnonKey
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'sb-auth-token',
  },
  // Add better error handling
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

