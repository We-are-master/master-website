import React from 'react'
import { SEO } from '../components/SEO'
import Container from '../components/fixfy/Container'
import Section from '../components/fixfy/Section'
import Eyebrow from '../components/fixfy/Eyebrow'
import CTABlock from '../components/fixfy/CTABlock'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  mainEntity: {
    '@type': 'Organization',
    name: 'Fixfy Ltd',
    url: 'https://getfixfy.com',
    logo: 'https://getfixfy.com/brand/fixfy-primary-white.png',
    description: 'Maintenance infrastructure for UK commercial buildings.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bristol',
      addressCountry: 'GB',
    },
  },
}

const TEAM = [
  { initials: 'VS', name: 'Victor Souza',       role: 'CEO' },
  { initials: 'GD', name: 'Guilherme Dantas',   role: 'CTO' },
  // TODO: roles for Orlando and William pending from the team
  { initials: 'OF', name: 'Orlando Favaretto',  role: '' },
  { initials: 'W',  name: 'William',            role: '' },
]

const BACKERS = ['Index Ventures', 'LocalGlobe', 'Balderton', 'Atomico', 'Entrepreneur First']

export default function About() {
  return (
    <>
      <SEO
        title="About — Fixfy"
        description="Fixfy was founded in Bristol in 2022. Maintenance infrastructure for British business, free to list — forever."
        structuredData={structuredData}
      />

      <Section size="page-header">
        <Container>
          <Eyebrow>About Fixfy</Eyebrow>
          <h1 className="fx-display fx-mt-16" style={{ maxWidth: '18ch' }}>
            We started this because British buildings deserve better.
          </h1>
          <p className="fx-lede fx-mt-24">
            Fixfy was founded by a team who&rsquo;d spent years running facilities, trading
            on site and building software. They kept meeting the same ugly truth: the
            middle of the supply chain was eating everyone.
          </p>
        </Container>
      </Section>

      <Section size="compact">
        <Container>
          <div className="fx-grid-2" style={{ gap: 64, alignItems: 'start' }}>
            <div>
              <Eyebrow>Mission</Eyebrow>
              <h2 className="fx-h1 fx-mt-16">
                Make maintenance fair, fast and free &mdash; at the bottom of the stack.
              </h2>
            </div>
            <div>
              <p className="fx-body">
                We don&rsquo;t want to be a marketplace. We want to be the layer underneath
                &mdash; the infrastructure. The bit that every British commercial building
                takes for granted in ten years, the way they take Stripe or Twilio for
                granted now.
              </p>
              <p className="fx-body fx-mt-16">
                That means no ticket fees. No commission. No margin on labour. We make our
                money on enterprise seats and finance float. Everything else is free, forever.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Eyebrow>Leadership</Eyebrow>
          <h2 className="fx-display fx-mt-16" style={{ maxWidth: '14ch' }}>The team.</h2>
          <div className="fx-team-grid fx-mt-48">
            {TEAM.map((m) => (
              <div key={m.name} className="fx-team-card">
                <div className="fx-team-avatar">{m.initials}</div>
                <h4>{m.name}</h4>
                {m.role && <div className="fx-role">{m.role}</div>}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <Eyebrow>Investors &amp; board</Eyebrow>
          <h2 className="fx-display fx-mt-16" style={{ maxWidth: '20ch' }}>
            £68M raised &middot; backed by the best.
          </h2>
          <div className="fx-backers-row">
            {BACKERS.map((b) => (
              <div key={b} className="fx-backer">{b}</div>
            ))}
          </div>
        </Container>
      </Section>

      <CTABlock />
    </>
  )
}
