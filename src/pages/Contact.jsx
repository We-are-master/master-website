import React, { useState } from 'react'
import { SEO } from '../components/SEO'
import Container from '../components/fixfy/Container'
import Section from '../components/fixfy/Section'
import Eyebrow from '../components/fixfy/Eyebrow'
import Button from '../components/fixfy/Button'

const CONTACT_CHANNELS = [
  { label: 'Sales',    value: 'sales@getfixfy.com',    sub: '+44 (0)117 403 8800' },
  { label: 'Support',  value: 'support@getfixfy.com',  sub: '24/7 for Enterprise' },
  { label: 'Press',    value: 'press@getfixfy.com',    sub: null },
  { label: 'Careers',  value: 'careers@getfixfy.com',  sub: 'See open roles' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', company: '', sites: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    // TODO: wire up to Supabase edge function / HubSpot / Zoho when endpoint is ready
  }

  return (
    <>
      <SEO
        title="Contact — Fixfy"
        description="Book a 30-minute demo of Fixfy. We'll load three of your sites into a sandbox so you can see exactly what your team would use on day one."
      />

      <Section size="page-header">
        <Container>
          <Eyebrow>Talk to us</Eyebrow>
          <h1 className="fx-display fx-mt-16" style={{ maxWidth: '20ch' }}>
            Book a demo. Or don&rsquo;t &mdash; look around first.
          </h1>
          <p className="fx-lede fx-mt-24">
            30-minute call. No slide deck. We&rsquo;ll load three of your sites into a sandbox
            and walk you through how your team would actually use it on Monday morning.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="fx-grid-2" style={{ gap: 64, alignItems: 'start' }}>
            {/* Form */}
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {submitted && (
                <div className="fx-card" style={{ borderColor: 'rgba(14,138,95,0.4)', background: 'rgba(14,138,95,0.08)' }}>
                  <strong style={{ color: '#fff' }}>Thanks &mdash; we&rsquo;ll be in touch.</strong>
                  <p className="fx-body fx-mt-8">
                    A human from the sales team will reply within one working day.
                  </p>
                </div>
              )}

              <Field label="Your name" name="name" value={form.name} onChange={onChange} required />
              <Field label="Work email" name="email" type="email" value={form.email} onChange={onChange} required />
              <Field label="Organisation" name="company" value={form.company} onChange={onChange} required />
              <Field label="How many sites?" name="sites" value={form.sites} onChange={onChange}
                     placeholder="e.g. 14 retail units across London" />
              <Field label="What&rsquo;s on your mind?" name="message" as="textarea" rows={5}
                     value={form.message} onChange={onChange} />

              <Button type="submit" arrow>Book a demo</Button>
            </form>

            {/* Info */}
            <aside className="fx-card" style={{ padding: 0 }}>
              <div style={{ padding: 32 }}>
                <Eyebrow>Other ways to reach us</Eyebrow>
                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {CONTACT_CHANNELS.map((c) => (
                    <div key={c.label} style={{
                      paddingBottom: 16,
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      <div className="fx-mono" style={{
                        fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.5)', marginBottom: 6,
                      }}>{c.label}</div>
                      <div style={{ fontSize: 15, color: '#fff' }}>
                        <a href={`mailto:${c.value}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {c.value}
                        </a>
                        {c.sub && (
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{c.sub}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div>
                    <div className="fx-mono" style={{
                      fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.5)', marginBottom: 6,
                    }}>Office</div>
                    <div style={{ fontSize: 15, color: '#fff' }}>
                      Bristol, United Kingdom<br />
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>By appointment only</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  )
}

function Field({ label, name, as = 'input', ...rest }) {
  const Tag = as === 'textarea' ? 'textarea' : 'input'
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span className="fx-mono" style={{
        fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.6)',
      }}>{label}</span>
      <Tag
        name={name}
        {...rest}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 4,
          padding: '12px 14px',
          color: '#fff',
          fontFamily: 'var(--fx-sans)',
          fontSize: 14,
          outline: 'none',
          resize: as === 'textarea' ? 'vertical' : undefined,
          minHeight: as === 'textarea' ? 120 : undefined,
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--fx-coral)' }}
        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)' }}
      />
    </label>
  )
}
