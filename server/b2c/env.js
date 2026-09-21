/**
 * Ambiente do servidor da reserva B2C.
 *
 * Em dev, `loadLocalEnv()` puxa o .env.local do master-os (mesma máquina),
 * então a chave do OS e do Resend já existem. Na Vercel, cada variável
 * precisa ser cadastrada no projeto. Ver .env.example.
 *
 * `mode` (B2C_BOOKING_MODE):
 *  - 'test' (padrão): nada é gravado no OS e nenhum e-mail sai.
 *  - 'live': job no OS (com ticket do Zendesk) e e-mails.
 *
 * Pagamento: o Stripe Checkout só abre se a chave for de TESTE (qualquer
 * modo) ou se o modo for 'live'. Chave live em modo test ficaria cobrando
 * dinheiro de verdade sem criar job nenhum, então fica desligado.
 *
 * Checkout transparente (cartão na própria página) precisa também da chave
 * PUBLICÁVEL do mesmo modo da secreta (live com live, test com test). Sem
 * ela, ou com o par trocado, a reserva usa a página hospedada da Stripe.
 */
import { loadLocalEnv } from '../growth/load-env.js'

export function b2cServerEnv() {
  loadLocalEnv()
  const stripeSecretKey = (process.env.B2C_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || '').trim()
  const mode = (process.env.B2C_BOOKING_MODE || 'test').trim() === 'live' ? 'live' : 'test'
  const stripeTest = /^(sk|rk)_test_/.test(stripeSecretKey)
  const stripeLive = /^(sk|rk)_live_/.test(stripeSecretKey)
  const pk = (process.env.B2C_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim()
  const pkMatches = (stripeTest && pk.startsWith('pk_test_')) || (stripeLive && pk.startsWith('pk_live_'))
  return {
    mode,
    stripeSecretKey,
    stripeTest,
    stripeLive,
    paymentsEnabled: stripeTest || (stripeLive && mode === 'live'),
    publishableKey: pkMatches ? pk : '',
    webhookSecret: (process.env.B2C_STRIPE_WEBHOOK_SECRET || '').trim(),
    osUrl: (process.env.MASTER_OS_URL || 'http://localhost:3000').replace(/\/$/, ''),
    osKey: (process.env.MASTER_OS_JOB_WEBHOOK_API_KEY || '').trim(),
    fixfyAccountId: (process.env.FIXFY_ACCOUNT_ID || process.env.NEXT_PUBLIC_FIXFY_ACCOUNT_ID || '').trim(),
    supabaseUrl: (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, ''),
    serviceKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || '').trim(),
    resendKey: (process.env.RESEND_API_KEY || '').trim(),
    resendFrom: (process.env.RESEND_FROM_EMAIL || 'Fixfy <hello@getfixfy.com>').trim(),
    notifyEmail: (process.env.B2C_NOTIFY_EMAIL || 'victor@getfixfy.com').trim(),
    siteUrl: (process.env.B2C_SITE_URL || 'https://getfixfy.com').replace(/\/$/, ''),
    // Conversions API da Meta: a compra também sai do servidor (só com o sim de marketing).
    metaPixelId: (process.env.META_PIXEL_ID || '1555218078932742').trim(),
    metaCapiToken: (process.env.META_CAPI_TOKEN || '').trim(),
    metaTestEventCode: (process.env.META_TEST_EVENT_CODE || '').trim(),
  }
}

const ORIGINS = [/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/, /^https:\/\/(www\.)?getfixfy\.com$/, /^https:\/\/[a-z0-9-]+\.vercel\.app$/]

/** Para onde a Stripe devolve o cliente: a origem da página, se for nossa. */
export function returnBaseUrl(env, origin) {
  if (origin && ORIGINS.some((rx) => rx.test(origin))) return origin
  return env.siteUrl
}
