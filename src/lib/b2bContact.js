/**
 * "Talk to us" (GetInTouchModal) → /api/b2b/contact, rota da Vercel no próprio
 * site, que manda o lead por e-mail. Antes ia para funções do Supabase em
 * supabase.wearemaster.com, que não existe mais.
 */

/**
 * @param {Record<string, string>} fields name, email, company, phone, industry, message, website
 * @param {number} openedAt quando o formulário abriu (robô envia em menos de 2 s)
 */
export async function sendContact(fields, openedAt) {
  try {
    const res = await fetch('/api/b2b/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fields, page: window.location.pathname, elapsedMs: Date.now() - openedAt }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return { success: false, error: data.error || 'Could not send. Please email hello@getfixfy.com.' }
    return { success: true }
  } catch {
    return { success: false, error: 'Could not reach the server. Please email hello@getfixfy.com.' }
  }
}
