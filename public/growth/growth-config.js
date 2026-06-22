/* Fixfy Growth — public client config (safe to ship in the browser).
 *
 * Fill the three values below with your LIVE keys, then redeploy:
 *   - supabaseUrl           : your Supabase project URL (e.g. https://supabase.wearemaster.com)
 *   - supabaseAnonKey       : Supabase "anon" public key (Project Settings → API)
 *   - stripePublishableKey  : Stripe LIVE publishable key, starts with pk_live_ (Stripe → Developers → API keys)
 *
 * NEVER put the Stripe SECRET key (sk_live_) here — that is server-side only and
 * goes in the Supabase Edge Function secrets (see growth-setup notes). This file is
 * public and shipped to every visitor's browser.
 */
window.GROWTH_CONFIG = {
  supabaseUrl: "https://supabase.wearemaster.com",
  supabaseAnonKey: "",        // <-- paste Supabase anon (public) key
  stripePublishableKey: ""    // <-- paste Stripe LIVE publishable key (pk_live_...)
};
