import React from 'react'
import { SEO } from '../SEO'
import Container from './Container'
import Section from './Section'
import Eyebrow from './Eyebrow'
import Button from './Button'
import Stat from './Stat'
import Card from './Card'
import CTABlock from './CTABlock'

/**
 * Template for a "For {audience}" page. Takes copy props and renders
 * the reference layout: page header + stats + features + coral pullquote + CTA.
 *
 * Keeps the three audience pages DRY.
 */
export default function AudiencePage({
  eyebrow,
  headline,   // string or ReactNode (supports <br/>)
  lede,
  ctaLabel = 'Book a demo',
  stats,      // [{ number, unit, label }]
  features,   // [{ title, body }]
  quote,
  quoteWho,   // "Name · Role, Company"
  seoTitle,
  seoDescription,
}) {
  const initials = (quoteWho || '').split(' ').slice(0, 2).map((w) => w[0]).join('')
  const [name, role] = (quoteWho || '').split(' · ')

  return (
    <>
      <SEO title={seoTitle} description={seoDescription || lede} />

      <Section size="page-header">
        <Container>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="fx-display fx-mt-16" style={{ maxWidth: '16ch' }}>{headline}</h1>
          <p className="fx-lede fx-mt-24">{lede}</p>
          <div className="fx-flex fx-gap-8 fx-mt-32" style={{ flexWrap: 'wrap' }}>
            <Button to="/contact" arrow>{ctaLabel}</Button>
            <Button to="/platform" variant="ghost">See the platform</Button>
          </div>
        </Container>
      </Section>

      <Section size="compact">
        <Container>
          <div className="fx-stats-grid">
            {stats.map((s) => (
              <Stat key={s.label} number={s.number} unit={s.unit} label={s.label} />
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Eyebrow>What you get</Eyebrow>
          <h2 className="fx-display fx-mt-16" style={{ maxWidth: '16ch' }}>The short list.</h2>
          <div className="fx-grid-2 fx-mt-48">
            {features.map((f) => (
              <div key={f.title} className="fx-card">
                <h3 className="fx-h2">{f.title}</h3>
                <p className="fx-body fx-mt-16">{f.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {quote && (
        <Section tone="coral">
          <Container narrow>
            <blockquote className="fx-pullquote">{quote}</blockquote>
            <div className="fx-quote-cite fx-mt-32">
              <div className="fx-quote-avatar">{initials}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 16 }}>{name}</div>
                {role && <div style={{ fontSize: 13, opacity: 0.8 }}>{role}</div>}
              </div>
            </div>
          </Container>
        </Section>
      )}

      <CTABlock />
    </>
  )
}
