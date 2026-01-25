// Shared CORS headers for all Edge Functions
// NOTE: Use getCorsHeaders() from security.ts instead of this directly
// This is kept for backward compatibility but should be migrated

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}
