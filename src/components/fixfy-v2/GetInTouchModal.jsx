import React, { useCallback, useEffect, useRef, useState } from 'react'
import { sendContact } from '../../lib/b2bContact'
import './get-in-touch-modal.css'

/*
 * "Talk to us": um formulário só, que vira e-mail para o time
 * (/api/b2b/contact). Sem agenda: quem quiser conversar diz na mensagem e o
 * time responde por e-mail.
 */

const INDUSTRIES = [
  'Letting agent',
  'Property or block manager',
  'Landlord or portfolio owner',
  'Business or offices',
  'Other',
]

/** Abre de qualquer lugar: window.dispatchEvent(new CustomEvent('fixfy:open-contact')) */
const OPEN_EVENT = 'fixfy:open-contact'

function isPlainLeftClick(e) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
}

export default function GetInTouchModal() {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef(null)
  const firstFieldRef = useRef(null)

  const close = useCallback(() => setOpen(false), [])
  const openModal = useCallback(() => setOpen(true), [])

  // Abre pelo evento e por qualquer link para /contact no app.
  useEffect(() => {
    window.addEventListener(OPEN_EVENT, openModal)

    // Fase de captura + stopPropagation para ganhar do Link do React Router:
    // abre o modal em vez de navegar para /contact.
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
      openModal()
    }
    document.addEventListener('click', onDocClick, true)

    return () => {
      window.removeEventListener(OPEN_EVENT, openModal)
      document.removeEventListener('click', onDocClick, true)
    }
  }, [openModal])

  // Esc fecha; a página não rola por trás enquanto está aberto.
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
          <p className="gim-sub">Tell us about your properties. We&rsquo;ll get in touch within 24 to 48 hours.</p>
        </div>

        <div className="gim-body">
          <ContactForm firstFieldRef={firstFieldRef} onClose={close} />
        </div>
      </div>
    </div>
  )
}

function ContactForm({ firstFieldRef, onClose }) {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')
  const openedAt = useRef(Date.now())

  async function onSubmit(e) {
    e.preventDefault()
    if (status === 'sending') return
    const fd = new FormData(e.currentTarget)
    setStatus('sending'); setError('')
    const result = await sendContact({
      name: fd.get('name'), email: fd.get('email'), company: fd.get('company'),
      phone: fd.get('phone'), industry: fd.get('industry'), message: fd.get('message'),
      website: fd.get('website'),
    }, openedAt.current)
    if (result.success) setStatus('sent')
    else { setStatus('error'); setError(result.error || 'Something went wrong. Please try again.') }
  }

  if (status === 'sent') {
    return (
      <div className="gim-success">
        <div className="gim-success-ic" aria-hidden>✓</div>
        <h3 className="gim-success-title">Message sent</h3>
        <p className="gim-success-body">Thanks. We&rsquo;ve emailed you a copy and we&rsquo;ll get in touch within 24 to 48 hours.</p>
        <button type="button" className="gim-submit" onClick={onClose}>Done</button>
      </div>
    )
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
      <label><span className="gim-l">You are</span>
        <select name="industry" defaultValue={INDUSTRIES[0]}>
          {INDUSTRIES.map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>
      <label><span className="gim-l">Message</span>
        <textarea name="message" placeholder="How many properties, where, and what you need help with." />
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="gim-hp" />
      {error ? <div className="gim-error">{error}</div> : null}
      <button type="submit" className="gim-submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message →'}
      </button>
    </form>
  )
}
