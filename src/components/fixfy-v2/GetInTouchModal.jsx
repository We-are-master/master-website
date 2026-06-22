import React, { useCallback, useEffect, useRef, useState } from 'react'
import { submitContactEnquiry } from '../../lib/email'
import { loadMeetingSlots, bookMeeting, fallbackDays } from '../../lib/meeting'
import './get-in-touch-modal.css'

const INDUSTRIES = [
  'Real Estate · landlords, BTR, agencies',
  'Franchises · multi-site brand operators',
  'Enterprise · corporate facilities',
  'Service Platforms · API + white-label',
  'Other',
]

/** Dispatch this from anywhere to open the modal: window.dispatchEvent(new CustomEvent('fixfy:open-contact', { detail: { tab: 'schedule' } })) */
const OPEN_EVENT = 'fixfy:open-contact'

function isPlainLeftClick(e) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
}

export default function GetInTouchModal() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('schedule') // 'schedule' | 'message'
  const dialogRef = useRef(null)
  const firstFieldRef = useRef(null)

  const close = useCallback(() => setOpen(false), [])

  const openWith = useCallback((nextTab) => {
    setTab(nextTab === 'message' ? 'message' : 'schedule')
    setOpen(true)
  }, [])

  // Open via custom event + intercept clicks on any link to /contact across the app.
  useEffect(() => {
    const onOpenEvent = (e) => openWith(e?.detail?.tab)
    window.addEventListener(OPEN_EVENT, onOpenEvent)

    // Capture phase + stopPropagation so we beat React Router's Link handler and
    // suppress its client-side navigation — we open the modal instead of going to /contact.
    const onDocClick = (e) => {
      if (!isPlainLeftClick(e)) return
      const a = e.target.closest && e.target.closest('a[href]')
      if (!a) return
      if (a.target === '_blank' || a.hasAttribute('download')) return
      let path
      try { path = new URL(a.href, window.location.origin).pathname } catch { return }
      if (path !== '/contact') return
      e.preventDefault()
      e.stopPropagation()
      openWith('schedule')
    }
    document.addEventListener('click', onDocClick, true)

    return () => {
      window.removeEventListener(OPEN_EVENT, onOpenEvent)
      document.removeEventListener('click', onDocClick, true)
    }
  }, [openWith])

  // Esc to close + body scroll lock while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => { firstFieldRef.current?.focus() }, 60)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      clearTimeout(t)
    }
  }, [open, close])

  if (!open) return null

  return (
    <div
      className="gim-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gim-title"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div className="gim-card" ref={dialogRef}>
        <button type="button" className="gim-close" aria-label="Close" onClick={close}>✕</button>

        <div className="gim-head">
          <div className="gim-eyebrow">Get in touch</div>
          <h2 id="gim-title" className="gim-title">Let&rsquo;s talk about your maintenance.</h2>
          <p className="gim-sub">Book a 30-minute walkthrough, or send us a message — we reply within a working day.</p>
        </div>

        <div className="gim-tabs" role="tablist" aria-label="Contact options">
          <button
            type="button" role="tab" aria-selected={tab === 'schedule'}
            className={`gim-tab${tab === 'schedule' ? ' is-active' : ''}`}
            onClick={() => setTab('schedule')}
          >
            <span className="gim-tab-ic" aria-hidden>📅</span> Schedule a meeting
          </button>
          <button
            type="button" role="tab" aria-selected={tab === 'message'}
            className={`gim-tab${tab === 'message' ? ' is-active' : ''}`}
            onClick={() => setTab('message')}
          >
            <span className="gim-tab-ic" aria-hidden>✉️</span> Send a message
          </button>
        </div>

        <div className="gim-body">
          {tab === 'schedule'
            ? <ScheduleTab firstFieldRef={firstFieldRef} onClose={close} />
            : <MessageTab firstFieldRef={firstFieldRef} onClose={close} />}
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- Send a message ----------------------------- */
function MessageTab({ firstFieldRef, onClose }) {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    if (status === 'sending') return
    const fd = new FormData(e.currentTarget)
    setStatus('sending'); setError('')
    const result = await submitContactEnquiry({
      name: fd.get('name'), email: fd.get('email'), company: fd.get('company'),
      phone: fd.get('phone'), industry: fd.get('industry'), message: fd.get('message'),
      website: fd.get('website'),
    })
    if (result.success) setStatus('sent')
    else { setStatus('error'); setError(result.error || 'Something went wrong — try again') }
  }

  if (status === 'sent') {
    return <SuccessPanel title="Message sent" body="Thanks — we'll be in touch within a working day." onClose={onClose} />
  }

  return (
    <form className="gim-form" onSubmit={onSubmit}>
      <div className="gim-row">
        <label><span className="gim-l">Name</span><input ref={firstFieldRef} type="text" name="name" required placeholder="Your name" /></label>
        <label><span className="gim-l">Email</span><input type="email" name="email" required placeholder="you@company.co.uk" /></label>
      </div>
      <div className="gim-row">
        <label><span className="gim-l">Company</span><input type="text" name="company" placeholder="Company name" /></label>
        <label><span className="gim-l">Phone</span><input type="tel" name="phone" placeholder="+44" /></label>
      </div>
      <label><span className="gim-l">Industry</span>
        <select name="industry" defaultValue={INDUSTRIES[0]}>
          {INDUSTRIES.map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>
      <label><span className="gim-l">Message</span>
        <textarea name="message" placeholder="Tell us about your portfolio, what you're using today, and what you'd like to fix." />
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="gim-hp" />
      {error ? <div className="gim-error">{error}</div> : null}
      <button type="submit" className="gim-submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message →'}
      </button>
    </form>
  )
}

/* --------------------------- Schedule a meeting ---------------------------- */
function ScheduleTab({ firstFieldRef, onClose }) {
  const [days, setDays] = useState(() => fallbackDays())
  const [realSlots, setRealSlots] = useState(false)
  const [dayIdx, setDayIdx] = useState(0)
  const [sel, setSel] = useState(null) // { time, iso }
  const [status, setStatus] = useState('idle') // idle | sending | done
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(null) // { whenLabel, htmlLink, requested }

  // Try to replace the client-side fallback with real Google Calendar availability.
  useEffect(() => {
    let alive = true
    ;(async () => {
      const res = await loadMeetingSlots()
      if (!alive) return
      if (res.ok && res.days && res.days.length) {
        setDays(res.days)
        setRealSlots(true)
        const firstWithTimes = res.days.findIndex((d) => d.times && d.times.length)
        setDayIdx(firstWithTimes >= 0 ? firstWithTimes : 0)
        setSel(null)
      }
    })()
    return () => { alive = false }
  }, [])

  const selectedDay = days[dayIdx]
  const whenLabel = sel && selectedDay ? `${selectedDay.full} at ${sel.time}` : ''

  async function onSubmit(e) {
    e.preventDefault()
    if (status === 'sending') return
    if (!sel) { setError('Pick a day and time above'); return }
    const fd = new FormData(e.currentTarget)
    setStatus('sending'); setError('')
    const contact = {
      name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'),
      company: fd.get('company'), industry: fd.get('industry'),
      message: fd.get('message'), website: fd.get('website'),
    }

    // Real slot (precise iso) → try to book a live calendar event.
    if (sel.iso) {
      const result = await bookMeeting({ ...contact, slotStart: sel.iso })
      if (result.success) { setConfirm({ whenLabel, htmlLink: result.htmlLink }); setStatus('done'); return }
      // fall through to email request if the booking backend is unavailable
    }

    // Fallback (no live backend yet) → email request carrying the chosen time; we confirm manually.
    const enquiry = await submitContactEnquiry({
      name: contact.name, email: contact.email, company: contact.company,
      phone: contact.phone, industry: contact.industry, website: contact.website,
      message: `Meeting request for ${whenLabel}.\n\n${contact.message || ''}`,
    })
    if (enquiry.success) { setConfirm({ whenLabel, requested: true }); setStatus('done') }
    else { setStatus('idle'); setError(enquiry.error || 'Could not send — try Send a message') }
  }

  if (status === 'done' && confirm) {
    return (
      <SuccessPanel
        title={confirm.requested ? 'Request received' : 'Meeting booked'}
        body={confirm.requested
          ? `Thanks — we'll confirm ${confirm.whenLabel} by email shortly.`
          : `You're booked for ${confirm.whenLabel}. A calendar invite with a video link is on its way.`}
        link={confirm.htmlLink}
        onClose={onClose}
      />
    )
  }

  return (
    <form className="gim-form" onSubmit={onSubmit}>
      <p className="gim-note">This 15-minute call is where we learn your business and map out the plan.</p>
      <div className="gim-sched">
        <div className="gim-l">Pick a day</div>
        <div className="gim-chips">
          {days.map((d, i) => (
            <button
              key={d.full || i} type="button"
              className={`gim-chip${i === dayIdx ? ' is-active' : ''}`}
              onClick={() => { setDayIdx(i); setSel(null) }}
            >
              <span className="gim-chip-dow">{d.dow}</span>
              <span className="gim-chip-num">{d.num}</span>
              <span className="gim-chip-mon">{d.mon}</span>
            </button>
          ))}
        </div>

        <div className="gim-l" style={{ marginTop: 14 }}>Pick a time</div>
        <div className="gim-times">
          {(selectedDay?.times || []).length === 0
            ? <div className="gim-note">No times left this day — try another.</div>
            : selectedDay.times.map((t) => (
              <button
                key={t.time} type="button"
                className={`gim-time${sel?.time === t.time ? ' is-active' : ''}`}
                onClick={() => setSel({ time: t.time, iso: t.iso })}
              >{t.time}</button>
            ))}
        </div>
      </div>

      <div className="gim-row">
        <label><span className="gim-l">Name</span><input ref={firstFieldRef} type="text" name="name" required placeholder="Your name" /></label>
        <label><span className="gim-l">Email</span><input type="email" name="email" required placeholder="you@company.co.uk" /></label>
      </div>
      <div className="gim-row">
        <label><span className="gim-l">Company</span><input type="text" name="company" placeholder="Company name" /></label>
        <label><span className="gim-l">Phone</span><input type="tel" name="phone" placeholder="+44" /></label>
      </div>
      <label><span className="gim-l">Industry</span>
        <select name="industry" defaultValue={INDUSTRIES[0]}>
          {INDUSTRIES.map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>
      <label><span className="gim-l">Anything to add?</span>
        <textarea name="message" placeholder="What would you like to cover?" />
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="gim-hp" />
      {error ? <div className="gim-error">{error}</div> : null}
      <button type="submit" className="gim-submit" disabled={status === 'sending'}>
        {status === 'sending' ? (realSlots ? 'Booking…' : 'Sending…') : (realSlots ? 'Book my meeting →' : 'Request this time →')}
      </button>
    </form>
  )
}

function SuccessPanel({ title, body, link, onClose }) {
  return (
    <div className="gim-success">
      <div className="gim-success-ic" aria-hidden>✓</div>
      <h3 className="gim-success-title">{title}</h3>
      <p className="gim-success-body">{body}</p>
      {link ? <a className="gim-success-link" href={link} target="_blank" rel="noopener noreferrer">View calendar event →</a> : null}
      <button type="button" className="gim-submit" onClick={onClose}>Done</button>
    </div>
  )
}
