import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { ArrowRight, Camera, Check, CreditCard, Loader2, Phone, Sparkles } from 'lucide-react'
import B2CLayout from '../components/Chrome.jsx'
import { formatGBP } from '../content/pricing.js'
import { COMPANY, PROMISES, whatsappLink } from '../content/site.js'
import { beforeWeArrive, workOrderLine } from '../content/copy.js'
import { findWindow, formatLongDate } from '../lib/slots.js'
import { clearBooking } from '../lib/store.js'
import { submitBooking } from '../lib/api.js'
import { track } from '../lib/track.js'
import { usePageMeta } from '../lib/meta.js'
import '../book.css'


/**
 * Volta da Stripe: `?session_id=cs_...`. O servidor confere que a sessão foi
 * paga, relê a reserva que gravou nela e grava no OS (uma vez só). Um refresh
 * aqui não duplica nada: a segunda chamada devolve a mesma confirmação.
 */
function usePaidSession(reference) {
  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!reference) return undefined
    let cancelled = false
    submitBooking(reference.startsWith('pi_') ? { paymentIntentId: reference } : { checkoutSessionId: reference })
      .then((data) => {
        if (cancelled) return
        clearBooking()
        if (data.mode === 'live') track('booking_confirmed', { value: data.total, ref: data.ref })
        setResult({ status: 'done', data })
      })
      .catch((err) => {
        if (cancelled) return
        // Pagamento ainda processando no banco: tenta de novo algumas vezes.
        if (err.status === 402 && attempt < 5) {
          setResult({ status: 'waiting' })
          setTimeout(() => !cancelled && setAttempt((n) => n + 1), 2500)
          return
        }
        setResult({ status: 'error', message: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [reference, attempt])
  return result
}

export default function ConfirmedPage() {
  const { state } = useLocation()
  const [search] = useSearchParams()
  usePageMeta({ title: 'Booking confirmed | Fixfy', description: 'Your Fixfy booking is confirmed.', path: '/book/confirmed', noindex: true })
  // session_id: Checkout hospedado. payment_intent: formulário na página que
  // passou por um redirecionamento (Klarna, autenticação do banco).
  const sessionId = search.get('session_id') || (search.get('redirect_status') !== 'failed' ? search.get('payment_intent') : null)
  const paidSession = usePaidSession(state?.ref ? null : sessionId)

  const data = state?.ref ? state : paidSession?.status === 'done' ? paidSession.data : null

  if (!data) {
    if (!sessionId) return <Navigate to="/book" replace />
    return (
      <B2CLayout minimalHeader footer={false}>
        <div className="bk">
          <div className="mo-wrap">
            <div className="bk-done__card">
              {paidSession?.status === 'error' ? (
                <>
                  <h1 className="bk-title">
                    We need to check this one<span className="mo-dot">.</span>
                  </h1>
                  <p className="bk-sub">
                    {paidSession.message} If your card was charged, your booking is safe: email{' '}
                    <a href={`mailto:${COMPANY.email}?subject=Booking payment ${sessionId.slice(-8)}`}>{COMPANY.email}</a> and we
                    will confirm it. Nothing is charged twice.
                  </p>
                </>
              ) : (
                <p className="bk-pay__loading">
                  <Loader2 size={18} className="bk-spin" />
                  {paidSession?.status === 'waiting' ? ' Your bank is confirming the payment…' : ' Confirming your payment…'}
                </p>
              )}
            </div>
          </div>
        </div>
      </B2CLayout>
    )
  }

  const win = findWindow(data.window)
  const help = whatsappLink(`Hi Fixfy, about booking ${data.ref}`)
  // Deep clean é casa ocupada: outra preparação e sem o re-clean, que é do end of tenancy.
  const homeClean = (data.services || []).includes('clean') && data.cleanKind === 'deep'
  const prep = beforeWeArrive(data.services || [], data.cleanKind)
  const isPaid = data.payment === 'card'

  return (
    <B2CLayout minimalHeader footer={false}>
      <div className="bk">
        <div className="mo-wrap">
          {data.mode === 'test' && (
            <p className="bk-testbanner">
              {isPaid
                ? 'Test payment with a Stripe test card: nothing was sent to the office.'
                : 'Test booking: nothing was sent to the office and nothing was charged.'}
            </p>
          )}
          <div className="bk-done">
            <div className="bk-done__card">
              <div className="bk-done__badge">
                <Check size={28} strokeWidth={3} />
              </div>
              <h1 className="bk-title">
                Booked, {data.firstName}<span className="mo-dot">.</span>
              </h1>
              <p className="bk-sub">
                {formatLongDate(data.date)}
                {win ? `, arriving ${win.phrase}` : ''}, at {[data.address?.line2, data.address?.line1].filter(Boolean).join(', ')},{' '}
                {data.postcode}. A confirmation is on its way to {data.email}.
              </p>
              <div className="bk-ref">
                Booking <b>{data.ref}</b>
              </div>

              <ol className="bk-timeline">
                <li className="is-done">
                  <span className="bk-timeline__dot">
                    <Check size={15} strokeWidth={3} />
                  </span>
                  <div>
                    <b>Today · booked{isPaid ? ' and paid' : ''}</b>
                    <p>{isPaid ? 'Paid by card. Your receipt from Stripe arrives by email.' : 'Test booking, no payment taken.'}</p>
                  </div>
                </li>
                <li>
                  <span className="bk-timeline__dot">
                    <Phone size={15} />
                  </span>
                  <div>
                    <b>The day before · we confirm the plan</b>
                    <p>A quick call or message to confirm the team, the time and how we get in.</p>
                  </div>
                </li>
                <li>
                  <span className="bk-timeline__dot">
                    <Sparkles size={15} />
                  </span>
                  <div>
                    <b>{formatLongDate(data.date)} · the work</b>
                    <p>{workOrderLine(data.services)}Photos of every room as the team finishes.</p>
                  </div>
                </li>
                <li>
                  <span className="bk-timeline__dot">
                    <Camera size={15} />
                  </span>
                  <div>
                    <b>Same day · your photo report</b>
                    {homeClean ? (
                      <p>It lands in your inbox, with a photo of every room we worked on.</p>
                    ) : (
                      <p>
                        It lands in your inbox, ready to forward to your agent. Anything on the checklist missed? Tell us within{' '}
                        {PROMISES.recleanDays.value} days and we come back free.
                      </p>
                    )}
                  </div>
                </li>
              </ol>

              {prep.length > 0 && (
                <div className="bk-prep">
                  <b>Before we arrive</b>
                  <ul>
                    {prep.map((p) => (
                      <li key={p}>
                        <Check size={16} strokeWidth={2.6} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bk-done__actions">
                {help ? (
                  <a className="mo-btn mo-btn--dark" href={help} target="_blank" rel="noreferrer">
                    Message us on WhatsApp <ArrowRight size={18} />
                  </a>
                ) : (
                  <a className="mo-btn mo-btn--dark" href={`mailto:${COMPANY.email}?subject=Booking ${data.ref}`}>
                    Email us about this booking <ArrowRight size={18} />
                  </a>
                )}
                <Link to="/" className="mo-btn mo-btn--ghost">
                  Back to the site
                </Link>
              </div>
            </div>

            <aside className="bk-plan" aria-label="Booking summary">
              <div className="bk-plan__head">
                <div className="mo-report__title">Your booking</div>
                <div className="bk-plan__meta">{data.postcode}</div>
              </div>
              <ul className="bk-plan__lines">
                {(data.lines || []).map((l) => (
                  <li key={l.id}>
                    <span>
                      {l.label}
                      {l.detail && <small>{l.detail}</small>}
                    </span>
                    <b>{l.amount == null ? 'Quote' : formatGBP(l.amount)}</b>
                  </li>
                ))}
              </ul>
              <div className="bk-plan__total">
                <div>
                  <span>{isPaid ? 'Paid by card, VAT included' : 'Total, VAT included'}</span>
                  <b className="mo-num">{formatGBP(data.total)}</b>
                </div>
              </div>
              <ul className="bk-plan__promises">
                <li>
                  <CreditCard size={15} /> {isPaid ? 'Secure payment by Stripe' : 'No payment taken in test mode'}
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </div>
    </B2CLayout>
  )
}
