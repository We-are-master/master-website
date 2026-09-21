import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronUp, Loader2, Lock, MapPin, Plus, X } from 'lucide-react'
import B2CLayout from '../components/Chrome.jsx'
import PlanSummary from '../components/PlanSummary.jsx'
import AddressField from '../components/AddressField.jsx'
import { Stepper, useTween } from '../components/QuoteWidget.jsx'
import { PostcodeResult, usePostcodeCheck } from '../components/Sections.jsx'
import {
  CERT,
  CLEAN,
  FIX,
  FROM_PRICE,
  PAINT,
  PROPERTY_SIZES,
  SERVICE_ORDER,
  SERVICES,
  certPrice,
  cleanKind,
  cleanPrice,
  formatGBP,
  priceSelection,
  serviceName,
  suggestFixPackage,
} from '../content/pricing.js'
import { COMPANY, PROMISES, formatPostcode, whatsappLink } from '../content/site.js'
import { applyQuery, clearBooking, emptyBooking, loadBooking, saveBooking } from '../lib/store.js'
import { bookableDates, windowsFor } from '../lib/slots.js'
import { track } from '../lib/track.js'
import { createCheckout, createPayment, getBookingConfig, submitBooking } from '../lib/api.js'
import { bookingPayload, cleanPhone } from '../lib/payload.js'
import { usePageMeta } from '../lib/meta.js'
import '../book.css'

const EmbeddedPayment = lazy(() => import('../components/EmbeddedPayment.jsx'))

// No domínio publicado, reserva só existe em modo live: o ensaio (modo test)
// daria "reservado" a um cliente de verdade sem nada chegar ao escritório.
const LIVE_HOST = typeof window !== 'undefined' && /(^|\.)getfixfy\.com$/.test(window.location.hostname)


const STEPS = [
  { id: 'move', label: 'Your job' },
  { id: 'details', label: 'Details' },
  { id: 'when', label: 'Date and access' },
  { id: 'checkout', label: 'Checkout' },
]

const ROLES = [
  { id: 'homeowner', label: 'Homeowner' },
  { id: 'tenant', label: 'Tenant moving out' },
  { id: 'landlord', label: 'Landlord' },
  { id: 'agent', label: 'Letting agent' },
]

const ACCESS = [
  { id: 'meet', label: 'I will be there', detail: 'Or someone I trust' },
  { id: 'agent', label: 'Keys with my agent', detail: 'We collect and return them', ask: 'Agent name, branch and address' },
  { id: 'keysafe', label: 'Key safe', detail: 'We ask for the code the day before', ask: 'Where is the key safe?' },
  { id: 'concierge', label: 'Concierge or porter', detail: 'We sign the keys out', ask: 'Building name and concierge phone' },
]

const PARKING = [
  { id: 'free', label: 'Free parking nearby' },
  { id: 'paid', label: 'Paid or permit parking' },
  { id: 'none', label: 'No parking at all' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^(\+44|0)\d{9,10}$/

function validate(step, b, ctx) {
  const e = {}
  const sel = b.selection
  if (step === 0) {
    if (sel.services.length === 0) e.services = 'Choose at least one: clean, paint or fix.'
    if (!b.postcode) e.address = 'Find the property address to continue.'
    else if (ctx.pc.status === 'outside') e.address = 'We only book London postcodes for now.'
    else if (!b.address.line1.trim()) e.address = 'Add the house number and street.'
    else if (ctx.pc.status === 'checking') e.address = 'Checking the postcode…'
    else if (ctx.pc.status !== 'covered') e.address = 'Check the postcode of the property.'
    const needsSize = sel.services.includes('clean') || (sel.services.includes('cert') && sel.cert.items.includes('eicr'))
    if (needsSize && !b.sizeChosen) e.size = 'Choose the size of the place.'
    if (ctx.priced.needsQuote) e.size = 'For 5 or more bedrooms we price from photos. Send us a message and we reply within the day.'
  }
  if (step === 1) {
    if (sel.services.includes('fix') && sel.fix.tasks.length === 0) e.tasks = 'Tick at least one job so the team brings the right tools.'
    if (sel.services.includes('cert') && sel.cert.items.length === 0) e.cert = 'Tick at least one certificate.'
  }
  if (step === 2) {
    if (!b.date) e.date = 'Choose a day.'
    if (!ctx.windows.some((w) => w.id === b.window)) e.window = 'Choose an arrival time.'
    if (!b.access) e.access = 'Tell us how we get in.'
    const access = ACCESS.find((a) => a.id === b.access)
    if (access?.ask && !b.accessNote.trim()) e.accessNote = 'Add the details so the team is not stuck at the door.'
    if (!b.parking) e.parking = 'Choose the parking situation.'
  }
  if (step === 3) {
    if (!b.contact.firstName.trim()) e.firstName = 'Enter your first name.'
    if (!b.contact.lastName.trim()) e.lastName = 'Enter your last name.'
    if (!EMAIL_RE.test(b.contact.email.trim())) e.email = 'Enter an email we can send the report to.'
    if (!PHONE_RE.test(cleanPhone(b.contact.phone))) e.phone = 'Enter a UK mobile, like 07700 900123.'
    if (!ctx.terms) e.terms = 'Tick to accept the booking terms.'
  }
  return e
}

function Field({ label, hint, error, children, id, className = '' }) {
  return (
    <div className={`bk-field${error ? ' has-error' : ''}${className ? ` ${className}` : ''}`}>
      <label className="bk-label" htmlFor={id}>
        {label}
        {hint && <span>{hint}</span>}
      </label>
      {children}
      {error && (
        <p className="bk-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

function ErrorText({ children }) {
  if (!children) return null
  return <p className="bk-error">{children}</p>
}

export default function BookPage() {
  const navigate = useNavigate()
  const location = useLocation()
  usePageMeta({
    title: 'Book cleaning, painting, repairs or certificates at a fixed price | Fixfy',
    description: 'Fixed prices for cleaning, painting, repairs and landlord certificates in London. Book and pay online in two minutes.',
    path: '/book',
    noindex: true,
  })

  // Estado inicial: o que estava salvo + o que veio no link.
  const [booking, setBooking] = useState(() => {
    const saved = typeof window === 'undefined' ? emptyBooking() : loadBooking()
    const merged = applyQuery(saved, location.search)
    const q = new URLSearchParams(location.search)
    return { ...merged, sizeChosen: Boolean(saved.sizeChosen || q.get('size')) }
  })
  const [step, setStep] = useState(() => {
    const n = Number(new URLSearchParams(location.search).get('step'))
    return n >= 1 && n <= 4 ? n - 1 : 0
  })
  const [errors, setErrors] = useState({})
  const [terms, setTerms] = useState(false)
  const [honey, setHoney] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [sheet, setSheet] = useState(false)
  const [config, setConfig] = useState({ mode: 'test', payments: false, loaded: false })
  // Voltou da página da Stripe sem pagar: a reserva continua aqui.
  const [cancelled] = useState(() => new URLSearchParams(location.search).get('cancelled') === '1')
  const startedAt = useRef(Date.now())
  const payment = useRef(null)
  const registerPayment = useCallback((api) => {
    payment.current = api
  }, [])

  const priced = useMemo(() => priceSelection(booking.selection), [booking.selection])
  const pc = usePostcodeCheck(booking.postcode)
  const dates = useMemo(() => bookableDates(), [])
  const windows = useMemo(() => windowsFor(), [])
  const totalShown = useTween(priced.needsQuote ? null : priced.total)

  useEffect(() => saveBooking(booking), [booking])

  useEffect(() => {
    track('booking_started', { value: priced.total })
    getBookingConfig().then((c) => setConfig({ ...c, loaded: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // O passo vive na URL: voltar no navegador volta um passo.
  useEffect(() => {
    const q = new URLSearchParams(location.search)
    const n = Number(q.get('step'))
    const fromUrl = n >= 1 && n <= 4 ? n - 1 : 0
    if (fromUrl !== step) setStep(fromUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  useEffect(() => {
    // Limpa os parâmetros de preset depois de aplicados.
    const q = new URLSearchParams(location.search)
    if ([...q.keys()].some((k) => k !== 'step')) {
      navigate(`/book?step=${step + 1}`, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goTo = (n) => {
    setErrors({})
    setSubmitError('')
    setSheet(false)
    navigate(`/book?step=${n + 1}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    track('booking_step', { step: n + 1, value: priced.total })
  }

  const update = (patch) => setBooking((b) => ({ ...b, ...patch }))
  const updateSel = (patch) => setBooking((b) => ({ ...b, selection: { ...b.selection, ...patch } }))

  const toggleService = (id) => {
    setBooking((b) => {
      const has = b.selection.services.includes(id)
      const services = has ? b.selection.services.filter((s) => s !== id) : SERVICE_ORDER.filter((s) => s === id || b.selection.services.includes(s))
      return { ...b, selection: { ...b.selection, services } }
    })
    setErrors((e) => ({ ...e, services: undefined }))
  }

  const ctx = { pc, priced, windows, terms }

  const next = async (ev) => {
    ev?.preventDefault()
    if (step === 3) {
      // Quem chegou direto no último passo (link, refresh) passa pelos anteriores.
      for (let i = 0; i < 3; i += 1) {
        const earlier = validate(i, booking, ctx)
        if (Object.keys(earlier).length) {
          goTo(i)
          setTimeout(() => setErrors(earlier), 60)
          return
        }
      }
    }
    const e = validate(step, booking, ctx)
    if (Object.keys(e).length) {
      setErrors(e)
      requestAnimationFrame(() => {
        document.querySelector('.has-error, .bk-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return
    }
    if (step < 3) {
      goTo(step + 1)
      return
    }
    await submit()
  }

  const submit = async () => {
    setSubmitting(true)
    setSubmitError('')
    const payload = bookingPayload(booking, { elapsedMs: Date.now() - startedAt.current, website: honey })
    try {
      if (embedded) {
        // Checkout transparente: o cartão é confirmado aqui mesmo.
        if (!payment.current) throw new Error('The card form is still loading. Try again in a second.')
        const invalid = await payment.current.validate()
        if (invalid) throw new Error(invalid)
        const intent = await createPayment(payload)
        saveBooking({ ...booking, ref: intent.ref })
        track('payment_info_added', { value: intent.total, ref: intent.ref })
        const result = await payment.current.confirm({
          clientSecret: intent.clientSecret,
          receiptEmail: payload.contact.email,
          billing: {
            name: `${payload.contact.firstName} ${payload.contact.lastName}`,
            email: payload.contact.email,
            phone: payload.contact.phone,
            address: {
              line1: payload.address.line1,
              line2: payload.address.line2 || undefined,
              city: 'London',
              postal_code: payload.postcode,
              country: 'GB',
            },
          },
        })
        if (result.error) throw new Error(result.error)
        const res = await submitBooking({ paymentIntentId: result.paymentIntentId })
        if (res.mode === 'live') track('booking_confirmed', { value: res.total, ref: res.ref })
        clearBooking()
        navigate('/book/confirmed', { replace: true, state: res })
        return
      }
      if (canPay) {
        // Sem chave publicável: o servidor abre a página hospedada da Stripe;
        // a reserva viaja na sessão e volta para a confirmação.
        const checkout = await createCheckout(payload)
        track('payment_info_added', { value: checkout.total, ref: checkout.ref })
        saveBooking({ ...booking, ref: checkout.ref })
        window.location.assign(checkout.url)
        return
      }
      if (config.mode === 'live' || LIVE_HOST) {
        throw new Error(`Online payment is not available right now. Please try again in a few minutes or email ${COMPANY.email}.`)
      }
      // Modo test sem Stripe: ensaio do fluxo, nada cobrado nem gravado (e nada vai para o Pixel).
      const res = await submitBooking(payload)
      clearBooking()
      navigate('/book/confirmed', { replace: true, state: res })
    } catch (err) {
      setSubmitError(err.message || 'We could not complete the booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const sel = booking.selection
  const has = (id) => sel.services.includes(id)
  const suggested = suggestFixPackage(sel.fix.tasks)
  const fixPkg = FIX.packages.find((p) => p.id === sel.fix.package) || suggested
  const accessOption = ACCESS.find((a) => a.id === booking.access)
  const help = whatsappLink('Hi Fixfy, I have a question about my booking')
  const canPay = config.loaded && config.payments
  const embedded = canPay && Boolean(config.publishableKey)
  const ctaLabel = step < 3 ? 'Continue' : canPay ? `Pay ${formatGBP(priced.total)} securely` : 'Book now'

  return (
    <B2CLayout
      minimalHeader
      footer={false}
      headerRight={
        <span className="bk-secure">
          <Lock size={15} /> Secure booking
        </span>
      }
    >
      <div className="bk">
        <div className="mo-wrap">
          <ol className="bk-progress" aria-label="Booking steps">
            {STEPS.map((s, i) => (
              <li key={s.id} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
                {i < step ? (
                  <button type="button" onClick={() => goTo(i)}>
                    <span className="bk-progress__n">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span className="bk-progress__label">{s.label}</span>
                  </button>
                ) : (
                  <span>
                    <span className="bk-progress__n">{i + 1}</span>
                    <span className="bk-progress__label">{s.label}</span>
                  </span>
                )}
              </li>
            ))}
          </ol>

          <div className="bk__grid">
            <form className="bk__main" onSubmit={next} noValidate>
              {/* ---------- Passo 1 ---------- */}
              {step === 0 && (
                <>
                  <header className="bk-head">
                    <h1 className="bk-title">
                      What do you need done<span className="mo-dot">?</span>
                    </h1>
                    <p className="bk-sub">Pick one or all four. We plan the order for you.</p>
                  </header>

                  <fieldset className="bk-block">
                    <legend className="bk-legend">Services</legend>
                    <div className="bk-services">
                      {SERVICE_ORDER.map((id) => (
                        <button
                          key={id}
                          type="button"
                          className="bk-service"
                          aria-pressed={has(id)}
                          onClick={() => toggleService(id)}
                        >
                          <span className="bk-service__check" aria-hidden="true">
                            <Check size={14} strokeWidth={3} />
                          </span>
                          <span className="bk-service__verb">
                            {SERVICES[id].verb}
                            <span className="mo-dot">.</span>
                          </span>
                          <span className="bk-service__name">{serviceName(id, sel)}</span>
                          <span className="bk-service__from">from {formatGBP(FROM_PRICE[id])}</span>
                        </button>
                      ))}
                    </div>
                    <ErrorText>{errors.services}</ErrorText>
                  </fieldset>

                  <fieldset className="bk-block">
                    <legend className="bk-legend">Where is it?</legend>
                    <AddressField
                      value={{ line1: booking.address.line1, line2: booking.address.line2, postcode: booking.postcode }}
                      error={errors.address}
                      onChange={(patch) => {
                        setBooking((b) => ({
                          ...b,
                          postcode: patch.postcode ?? b.postcode,
                          address: {
                            line1: patch.line1 ?? b.address.line1,
                            line2: patch.line2 ?? b.address.line2,
                          },
                        }))
                        setErrors((e) => ({ ...e, address: undefined }))
                      }}
                    />
                    {booking.postcode && <PostcodeResult check={pc} />}
                    <ErrorText>{errors.address}</ErrorText>
                  </fieldset>

                  {has('clean') && (
                    <fieldset className="bk-block">
                      <legend className="bk-legend">What kind of clean?</legend>
                      <div
                        className="mo-chips mo-chips--grid"
                        style={{ '--mo-cols': CLEAN.kinds.length }}
                        role="radiogroup"
                        aria-label="Type of clean"
                      >
                        {CLEAN.kinds.map((k) => {
                          const price = cleanPrice(booking.sizeChosen ? sel.size : 'studio', k.id)
                          return (
                            <button
                              key={k.id}
                              type="button"
                              role="radio"
                              aria-checked={sel.clean.kind === k.id}
                              className="mo-chip"
                              onClick={() => updateSel({ clean: { ...sel.clean, kind: k.id } })}
                            >
                              {k.short}
                              <span className="mo-chip__price">
                                {price == null ? 'quote' : booking.sizeChosen ? formatGBP(price) : `from ${formatGBP(price)}`}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <p className="bk-note">
                        {cleanKind(sel.clean.kind).detail}. {cleanKind(sel.clean.kind).hint}.
                      </p>
                    </fieldset>
                  )}

                  {(has('clean') || (has('cert') && sel.cert.items.includes('eicr'))) && (
                    <fieldset className={`bk-block${errors.size ? ' has-error' : ''}`}>
                      <legend className="bk-legend">How big is it?</legend>
                      <div className="mo-chips" role="radiogroup" aria-label="Property size">
                        {PROPERTY_SIZES.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            role="radio"
                            aria-checked={booking.sizeChosen && sel.size === s.id}
                            className="mo-chip"
                            onClick={() => {
                              setBooking((b) => ({ ...b, sizeChosen: true, selection: { ...b.selection, size: s.id } }))
                              setErrors((e) => ({ ...e, size: undefined }))
                            }}
                          >
                            {s.label}
                            <span className="mo-chip__price">
                              {has('clean')
                                ? cleanPrice(s.id, sel.clean.kind) == null
                                  ? 'quote'
                                  : formatGBP(cleanPrice(s.id, sel.clean.kind))
                                : certPrice(CERT.items[1], s.id) == null
                                  ? 'quote'
                                  : formatGBP(certPrice(CERT.items[1], s.id))}
                            </span>
                          </button>
                        ))}
                      </div>
                      {has('clean') && (
                        <div className="mo-row bk-baths">
                          <span className="bk-label" style={{ margin: 0 }}>
                            Bathrooms
                            <span>
                              {CLEAN.includedBathrooms} included, then {formatGBP(CLEAN.extraBathroom)} each
                            </span>
                          </span>
                          <Stepper value={sel.bathrooms} min={1} max={4} onChange={(v) => updateSel({ bathrooms: v })} label="bathrooms" />
                        </div>
                      )}
                      <ErrorText>{errors.size}</ErrorText>
                      {priced.needsQuote && help && (
                        <a className="mo-link" href={help} target="_blank" rel="noreferrer">
                          Message us for a photo quote <ArrowRight size={16} />
                        </a>
                      )}
                      {priced.needsQuote && !help && (
                        <a className="mo-link" href={`mailto:${COMPANY.email}?subject=Photo quote, 5+ bedrooms`}>
                          Email us for a photo quote <ArrowRight size={16} />
                        </a>
                      )}
                    </fieldset>
                  )}

                  <fieldset className="bk-block">
                    <legend className="bk-legend">
                      You are <span className="bk-optional">optional</span>
                    </legend>
                    <div className="mo-chips" role="radiogroup" aria-label="Who is booking">
                      {ROLES.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          role="radio"
                          aria-checked={booking.role === r.id}
                          className="mo-chip"
                          onClick={() => update({ role: booking.role === r.id ? '' : r.id })}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                    {booking.role === 'agent' && (
                      <p className="bk-note">
                        Booking for a portfolio? <Link to="/contact">Ask about an agent account</Link> for account prices. This
                        booking still goes through as normal.
                      </p>
                    )}
                  </fieldset>
                </>
              )}

              {/* ---------- Passo 2 ---------- */}
              {step === 1 && (
                <>
                  <header className="bk-head">
                    <h1 className="bk-title">
                      The details<span className="mo-dot">.</span>
                    </h1>
                    <p className="bk-sub">Everything here has a fixed price. Add what applies and skip the rest.</p>
                  </header>

                  {has('clean') && (
                    <fieldset className="bk-block" id="bk-clean">
                      <legend className="bk-legend">
                        Clean<span className="mo-dot">.</span> Add-ons
                      </legend>
                      <ul className="bk-extras">
                        {CLEAN.extras.map((x) => {
                          const qty = sel.clean.extras[x.id] || 0
                          const setQty = (v) =>
                            updateSel({ clean: { ...sel.clean, extras: { ...sel.clean.extras, [x.id]: v || undefined } } })
                          return (
                            <li key={x.id} className={qty ? 'is-on' : ''}>
                              <div className="bk-extra__text">
                                <b>{x.label}</b>
                                <span>{x.detail}</span>
                              </div>
                              <span className="bk-extra__price">
                                {formatGBP(x.price)}
                                {x.unit ? ` a ${x.unit}` : ''}
                              </span>
                              {x.unit && qty ? (
                                <Stepper value={qty} min={0} max={x.max || 8} onChange={setQty} label={`${x.label} rooms`} />
                              ) : (
                                <button
                                  type="button"
                                  className={`bk-toggle${qty ? ' is-on' : ''}`}
                                  aria-pressed={Boolean(qty)}
                                  onClick={() => setQty(qty ? 0 : 1)}
                                >
                                  {qty ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={2.6} />}
                                  <span className="mo-sr">{qty ? `Remove ${x.label}` : `Add ${x.label}`}</span>
                                </button>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </fieldset>
                  )}

                  {has('paint') && (
                    <fieldset className="bk-block" id="bk-paint">
                      <legend className="bk-legend">
                        Paint<span className="mo-dot">.</span> What needs doing?
                      </legend>
                      <div className="mo-options mo-options--2" role="radiogroup" aria-label="Painting">
                        {PAINT.options.map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            role="radio"
                            aria-checked={sel.paint.option === o.id}
                            className="mo-option"
                            onClick={() => updateSel({ paint: { ...sel.paint, option: o.id } })}
                          >
                            <span className="mo-option__top">
                              {o.label}
                              <span className="mo-option__price">
                                {formatGBP(o.price)}
                                {o.unit ? ` a ${o.unit}` : ''}
                              </span>
                            </span>
                            <span className="mo-option__detail">{o.detail}</span>
                          </button>
                        ))}
                      </div>
                      {sel.paint.option === 'rooms' && (
                        <div className="mo-row bk-baths">
                          <span className="bk-label" style={{ margin: 0 }}>
                            Rooms to repaint<span>walls, two coats</span>
                          </span>
                          <Stepper
                            value={sel.paint.rooms}
                            min={1}
                            max={8}
                            onChange={(v) => updateSel({ paint: { ...sel.paint, rooms: v } })}
                            label="rooms"
                          />
                        </div>
                      )}
                      <ul className="bk-extras bk-extras--single">
                        <li className={sel.paint.materials ? 'is-on' : ''}>
                          <div className="bk-extra__text">
                            <b>{PAINT.materials.label}</b>
                            <span>{PAINT.materials.detail}</span>
                          </div>
                          <span className="bk-extra__price">{formatGBP(PAINT.materials.price)}</span>
                          <button
                            type="button"
                            className={`bk-toggle${sel.paint.materials ? ' is-on' : ''}`}
                            aria-pressed={sel.paint.materials}
                            onClick={() => updateSel({ paint: { ...sel.paint, materials: !sel.paint.materials } })}
                          >
                            {sel.paint.materials ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={2.6} />}
                            <span className="mo-sr">
                              {sel.paint.materials ? 'Remove the paint and materials pack' : 'Add the paint and materials pack'}
                            </span>
                          </button>
                        </li>
                      </ul>
                      <p className="bk-note">
                        {sel.paint.materials
                          ? 'Everything the painter needs is in the price. Want a colour other than white or magnolia? Say so in the notes.'
                          : 'No pack? Leave the paint on site (the landlord’s is fine) and anything else the painter uses is billed at the end.'}
                      </p>
                    </fieldset>
                  )}

                  {has('fix') && (
                    <fieldset className={`bk-block${errors.tasks ? ' has-error' : ''}`} id="bk-fix">
                      <legend className="bk-legend">
                        Fix<span className="mo-dot">.</span> What is on the list?
                      </legend>
                      <div className="mo-chips" role="group" aria-label="Repair jobs">
                        {FIX.tasks.map((t) => {
                          const on = sel.fix.tasks.includes(t.id)
                          return (
                            <button
                              key={t.id}
                              type="button"
                              aria-pressed={on}
                              className="mo-chip"
                              onClick={() => {
                                const tasks = on ? sel.fix.tasks.filter((x) => x !== t.id) : [...sel.fix.tasks, t.id]
                                updateSel({ fix: { ...sel.fix, tasks } })
                                setErrors((e) => ({ ...e, tasks: undefined }))
                              }}
                            >
                              {on && <Check size={14} strokeWidth={3} />}
                              {t.label}
                            </button>
                          )
                        })}
                      </div>
                      <ErrorText>{errors.tasks}</ErrorText>
                      <p className="bk-label" style={{ marginTop: 22 }}>
                        Time on site
                        <span>
                          {sel.fix.tasks.length
                            ? `We suggest ${suggested.label.toLowerCase()} for ${sel.fix.tasks.length} ${sel.fix.tasks.length === 1 ? 'job' : 'jobs'}`
                            : 'Half day or full day, no call-out fee'}
                        </span>
                      </p>
                      <div className="mo-chips" role="radiogroup" aria-label="Time on site">
                        {FIX.packages.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            role="radio"
                            aria-checked={fixPkg.id === p.id}
                            className="mo-chip"
                            onClick={() => updateSel({ fix: { ...sel.fix, package: p.id } })}
                          >
                            {p.label}
                            <span className="mo-chip__price">{formatGBP(p.price)}</span>
                            {sel.fix.tasks.length > 0 && suggested.id === p.id && <span className="bk-suggested">Suggested</span>}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  {has('cert') && (
                    <fieldset className={`bk-block${errors.cert ? ' has-error' : ''}`} id="bk-cert">
                      <legend className="bk-legend">
                        Certify<span className="mo-dot">.</span> What is due?
                      </legend>
                      <ul className="bk-extras">
                        {CERT.items.map((item) => {
                          const on = sel.cert.items.includes(item.id)
                          const price = certPrice(item, sel.size)
                          return (
                            <li key={item.id} className={on ? 'is-on' : ''}>
                              <div className="bk-extra__text">
                                <b>{item.label}</b>
                                <span>
                                  {item.detail}. {item.valid}.
                                </span>
                              </div>
                              <span className="bk-extra__price">{price == null ? 'Ask us' : formatGBP(price)}</span>
                              <button
                                type="button"
                                className={`bk-toggle${on ? ' is-on' : ''}`}
                                aria-pressed={on}
                                onClick={() => {
                                  const items = on ? sel.cert.items.filter((x) => x !== item.id) : [...sel.cert.items, item.id]
                                  updateSel({ cert: { items, boiler: items.includes('gas') ? sel.cert.boiler : false } })
                                  setErrors((e) => ({ ...e, cert: undefined }))
                                }}
                              >
                                {on ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={2.6} />}
                                <span className="mo-sr">{on ? `Remove ${item.label}` : `Add ${item.label}`}</span>
                              </button>
                            </li>
                          )
                        })}
                        {sel.cert.items.includes('gas') && (
                          <li className={sel.cert.boiler ? 'is-on' : ''}>
                            <div className="bk-extra__text">
                              <b>{CERT.items[0].addOn.label}</b>
                              <span>{CERT.items[0].addOn.detail}</span>
                            </div>
                            <span className="bk-extra__price">{formatGBP(CERT.items[0].addOn.price)}</span>
                            <button
                              type="button"
                              className={`bk-toggle${sel.cert.boiler ? ' is-on' : ''}`}
                              aria-pressed={sel.cert.boiler}
                              onClick={() => updateSel({ cert: { ...sel.cert, boiler: !sel.cert.boiler } })}
                            >
                              {sel.cert.boiler ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={2.6} />}
                              <span className="mo-sr">{sel.cert.boiler ? 'Remove the boiler service' : 'Add the boiler service'}</span>
                            </button>
                          </li>
                        )}
                      </ul>
                      <ErrorText>{errors.cert}</ErrorText>
                      <p className="bk-note">
                        Gas by a Gas Safe registered engineer, electrics by a NICEIC or NAPIT registered electrician. The certificate and the photo
                        report land on the same day.
                      </p>
                    </fieldset>
                  )}

                  {SERVICE_ORDER.filter((id) => !has(id)).length > 0 && (
                    <div className="bk-block">
                      <p className="bk-legend">Add to the same booking</p>
                      <div className="bk-upsell">
                        {SERVICE_ORDER.filter((id) => !has(id)).map((id) => (
                          <button key={id} type="button" className="bk-upsell__item" onClick={() => toggleService(id)}>
                            <span>
                              <b>
                                {SERVICES[id].verb}
                                <span className="mo-dot">.</span>
                              </b>{' '}
                              {id === 'clean'
                                ? serviceName('clean', sel)
                                : id === 'paint'
                                  ? 'Touch up the walls before check-out'
                                  : 'Holes, handles, rails and sealant'}
                            </span>
                            <span className="bk-upsell__cta">
                              from {formatGBP(FROM_PRICE[id])} <Plus size={16} strokeWidth={2.6} />
                            </span>
                          </button>
                        ))}
                      </div>
                      {!has('clean') && (
                        <p className="bk-note">Adding a clean? Go back one step to choose the size of the place.</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ---------- Passo 3 ---------- */}
              {step === 2 && (
                <>
                  <header className="bk-head">
                    <h1 className="bk-title">
                      When, and how we get in<span className="mo-dot">.</span>
                    </h1>
                    <p className="bk-sub">Monday to Saturday. We confirm the team and the plan with you the day before.</p>
                  </header>

                  <fieldset className={`bk-block${errors.date ? ' has-error' : ''}`}>
                    <legend className="bk-legend">Day</legend>
                    <div className="bk-dates" role="radiogroup" aria-label="Day">
                      {dates.map((d) => (
                        <button
                          key={d.iso}
                          type="button"
                          role="radio"
                          aria-checked={booking.date === d.iso}
                          className="bk-date"
                          onClick={() => {
                            update({ date: d.iso })
                            setErrors((e) => ({ ...e, date: undefined }))
                          }}
                        >
                          <span className="bk-date__wd">{d.weekday}</span>
                          <span className="bk-date__d">{d.day}</span>
                          <span className="bk-date__m">{d.month}</span>
                        </button>
                      ))}
                    </div>
                    <ErrorText>{errors.date}</ErrorText>
                  </fieldset>

                  <fieldset className={`bk-block${errors.window ? ' has-error' : ''}`}>
                    <legend className="bk-legend">Arrival time</legend>
                    <div className="bk-slots" role="radiogroup" aria-label="Arrival time">
                      {windows.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          role="radio"
                          aria-checked={booking.window === w.id}
                          className="bk-slot"
                          onClick={() => {
                            update({ window: w.id })
                            setErrors((e) => ({ ...e, window: undefined }))
                          }}
                        >
                          <b>{w.title}</b>
                          <span>{w.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="bk-note">The team arrives within the slot you pick. Any time is the easiest to fit if the keys are with your agent.</p>
                    <ErrorText>{errors.window}</ErrorText>
                  </fieldset>

                  <fieldset className={`bk-block${errors.access ? ' has-error' : ''}`}>
                    <legend className="bk-legend">How do we get in?</legend>
                    <div className="mo-options mo-options--2" role="radiogroup" aria-label="Access">
                      {ACCESS.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          role="radio"
                          aria-checked={booking.access === a.id}
                          className="mo-option"
                          onClick={() => {
                            update({ access: a.id })
                            setErrors((e) => ({ ...e, access: undefined }))
                          }}
                        >
                          <span className="mo-option__top">{a.label}</span>
                          <span className="mo-option__detail">{a.detail}</span>
                        </button>
                      ))}
                    </div>
                    <ErrorText>{errors.access}</ErrorText>
                    {accessOption?.ask && (
                      <Field id="bk-access" label={accessOption.ask} error={errors.accessNote} className="bk-field--after">
                        <input
                          id="bk-access"
                          className="mo-input"
                          value={booking.accessNote}
                          maxLength={300}
                          onChange={(e) => update({ accessNote: e.target.value })}
                        />
                      </Field>
                    )}
                    {booking.access === 'keysafe' && (
                      <p className="bk-note">Do not type the key safe code here. We ask for it by phone the day before.</p>
                    )}
                  </fieldset>

                  <fieldset className={`bk-block${errors.parking ? ' has-error' : ''}`}>
                    <legend className="bk-legend">Parking</legend>
                    <div className="mo-chips" role="radiogroup" aria-label="Parking">
                      {PARKING.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          role="radio"
                          aria-checked={booking.parking === p.id}
                          className="mo-chip"
                          onClick={() => {
                            update({ parking: p.id })
                            setErrors((e) => ({ ...e, parking: undefined }))
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <ErrorText>{errors.parking}</ErrorText>
                  </fieldset>

                  <fieldset className="bk-block">
                    <Field id="bk-notes" label="Anything else?" hint="optional">
                      <textarea
                        id="bk-notes"
                        className="mo-input bk-textarea"
                        rows={3}
                        maxLength={1000}
                        placeholder="Still moving out on the day, stairs and no lift, a pet, the agent's check-out time…"
                        value={booking.notes}
                        onChange={(e) => update({ notes: e.target.value })}
                      />
                    </Field>
                  </fieldset>
                </>
              )}

              {/* ---------- Passo 4 ---------- */}
              {step === 3 && (
                <>
                  <header className="bk-head">
                    <h1 className="bk-title">
                      Your details<span className="mo-dot">.</span>
                    </h1>
                    <p className="bk-sub">The photo report and the booking confirmation go to this email.</p>
                  </header>

                  <div className="bk-prop">
                    <MapPin size={18} />
                    <div>
                      <b>{[booking.address.line2, booking.address.line1].filter(Boolean).join(', ')}</b>
                      <span>London {formatPostcode(booking.postcode)}</span>
                    </div>
                    <button type="button" className="mo-link" onClick={() => goTo(0)}>
                      Change
                    </button>
                  </div>

                  <fieldset className="bk-block">
                    <legend className="bk-legend">Contact</legend>
                    <div className="bk-grid2">
                      <Field id="bk-fn" label="First name" error={errors.firstName}>
                        <input
                          id="bk-fn"
                          className="mo-input"
                          autoComplete="given-name"
                          value={booking.contact.firstName}
                          onChange={(e) => update({ contact: { ...booking.contact, firstName: e.target.value } })}
                        />
                      </Field>
                      <Field id="bk-ln" label="Last name" error={errors.lastName}>
                        <input
                          id="bk-ln"
                          className="mo-input"
                          autoComplete="family-name"
                          value={booking.contact.lastName}
                          onChange={(e) => update({ contact: { ...booking.contact, lastName: e.target.value } })}
                        />
                      </Field>
                    </div>
                    <div className="bk-grid2">
                      <Field id="bk-em" label="Email" error={errors.email}>
                        <input
                          id="bk-em"
                          type="email"
                          inputMode="email"
                          className="mo-input"
                          autoComplete="email"
                          value={booking.contact.email}
                          onChange={(e) => update({ contact: { ...booking.contact, email: e.target.value } })}
                        />
                      </Field>
                      <Field id="bk-ph" label="Mobile" hint="for the day-before call" error={errors.phone}>
                        <input
                          id="bk-ph"
                          type="tel"
                          inputMode="tel"
                          className="mo-input"
                          autoComplete="tel"
                          placeholder="07700 900123"
                          value={booking.contact.phone}
                          onChange={(e) => update({ contact: { ...booking.contact, phone: e.target.value } })}
                        />
                      </Field>
                    </div>
                  </fieldset>


                  <fieldset className="bk-block">
                    <legend className="bk-legend">Payment</legend>
                    {!config.loaded ? (
                      <p className="bk-pay__loading">
                        <Loader2 size={18} className="bk-spin" /> Loading…
                      </p>
                    ) : embedded ? (
                      <div className="bk-stripe">
                        <div className="bk-stripe__head">
                          <img className="bk-stripe__mark" src="/b2c/stripe-emblem.png" alt="Stripe" width="44" height="44" />
                          <div>
                            <b>Secure payment by Stripe</b>
                            <span className="bk-stripe__sub">Pay {formatGBP(priced.total)} now. You stay on this page.</span>
                          </div>
                        </div>
                        <Suspense
                          fallback={
                            <p className="bk-pay__loading">
                              <Loader2 size={18} className="bk-spin" /> Loading the secure card form…
                            </p>
                          }
                        >
                          <EmbeddedPayment publishableKey={config.publishableKey} amount={priced.total} register={registerPayment} />
                        </Suspense>
                        <p className="bk-fine">
                          <Lock size={14} /> We never see your card details. Free changes up to {PROMISES.freeCancellationHours} hours
                          before, refunded in full.
                        </p>
                      </div>
                    ) : canPay ? (
                      <div className="bk-stripe">
                        <div className="bk-stripe__head">
                          <img className="bk-stripe__mark" src="/b2c/stripe-emblem.png" alt="Stripe" width="44" height="44" />
                          <div>
                            <b>Secure checkout by Stripe</b>
                            <span className="bk-stripe__sub">
                              Pay {formatGBP(priced.total)} on Stripe&apos;s page, then you come straight back here for your
                              confirmation.
                            </span>
                          </div>
                        </div>
                        <ul className="bk-stripe__methods" aria-label="Ways to pay">
                          {['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'Google Pay'].map((m) => (
                            <li key={m}>{m}</li>
                          ))}
                        </ul>
                        <p className="bk-fine">
                          <Lock size={14} /> We never see your card details. Free changes up to {PROMISES.freeCancellationHours} hours
                          before, refunded in full.
                        </p>
                      </div>
                    ) : config.mode !== 'live' && !LIVE_HOST ? (
                      <div className="bk-pay bk-pay--link">
                        <p className="bk-pay__lead">
                          <b>Test mode.</b> Nothing is charged: the booking goes through so the flow can be checked.
                        </p>
                        {import.meta.env.DEV && (
                          <p className="bk-devnote">
                            Dev: add a Stripe test secret key as <code>B2C_STRIPE_SECRET_KEY</code> (sk_test) in the site .env to
                            open the real Stripe Checkout with test cards.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bk-alert" role="alert">
                        <X size={18} /> Online payment is not available right now. Email {COMPANY.email} and we will book it for you.
                      </div>
                    )}
                  </fieldset>

                  <fieldset className="bk-block">
                    <label className="bk-check">
                      <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                      <span>
                        I agree to the <Link to="/terms" target="_blank">booking terms</Link>. Free changes and cancellation up to{' '}
                        {PROMISES.freeCancellationHours} hours before the slot.
                      </span>
                    </label>
                    <ErrorText>{errors.terms}</ErrorText>
                    <label className="bk-check">
                      <input
                        type="checkbox"
                        checked={booking.marketing}
                        onChange={(e) => update({ marketing: e.target.checked })}
                      />
                      <span>Send me the occasional offer from Fixfy. Unsubscribe any time.</span>
                    </label>
                    <div className="bk-honey" aria-hidden="true">
                      <label>
                        Website
                        <input tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
                      </label>
                    </div>
                  </fieldset>
                </>
              )}

              {cancelled && step === 3 && !submitError && (
                <div className="bk-alert bk-alert--soft" role="status">
                  <Check size={18} /> Payment cancelled, nothing was charged. Your booking is still here when you are ready.
                </div>
              )}

              {submitError && (
                <div className="bk-alert" role="alert">
                  <X size={18} /> {submitError}
                </div>
              )}

              {/* Sem saída para a home no primeiro passo: o caminho é seguir. */}
              <div className={`bk-actions${step === 0 ? ' bk-actions--solo' : ''}`}>
                {step > 0 ? (
                  <button type="button" className="mo-btn mo-btn--ghost" onClick={() => goTo(step - 1)}>
                    <ArrowLeft size={18} /> Back
                  </button>
                ) : (
                  <span />
                )}
                <button type="submit" className="mo-btn mo-btn--primary mo-btn--lg bk-next" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="bk-spin" /> {embedded ? 'Paying…' : canPay ? 'Opening secure checkout…' : 'Booking…'}
                    </>
                  ) : (
                    <>
                      {ctaLabel} <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <aside className="bk__aside" aria-label="Your booking">
              <div className="bk__sticky">
                <PlanSummary booking={booking} priced={priced} sizeChosen={booking.sizeChosen} />
                {help && (
                  <a className="bk-help" href={help} target="_blank" rel="noreferrer">
                    Questions? Message us on WhatsApp
                  </a>
                )}
              </div>
            </aside>
          </div>
        </div>

        {/* Barra do celular: total sempre à vista */}
        <div className="bk-bar">
          <button type="button" className="bk-bar__total" onClick={() => setSheet(true)} aria-expanded={sheet}>
            <span>Total, VAT included</span>
            <b className="mo-num">{priced.needsQuote ? 'Quote' : formatGBP(totalShown)}</b>
            <ChevronUp size={16} />
          </button>
          <button type="button" className="mo-btn mo-btn--primary" onClick={next} disabled={submitting}>
            {submitting ? <Loader2 size={18} className="bk-spin" /> : step < 3 ? 'Continue' : canPay ? `Pay ${formatGBP(priced.total)}` : 'Book now'}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </div>

        {sheet && (
          <div className="bk-sheet" role="dialog" aria-modal="true" aria-label="Your booking">
            <button type="button" className="bk-sheet__scrim" aria-label="Close" onClick={() => setSheet(false)} />
            <div className="bk-sheet__panel">
              <button type="button" className="bk-sheet__close" onClick={() => setSheet(false)}>
                <X size={18} /> Close
              </button>
              <PlanSummary booking={booking} priced={priced} sizeChosen={booking.sizeChosen} />
            </div>
          </div>
        )}
      </div>
    </B2CLayout>
  )
}

