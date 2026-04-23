import React from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import Container from '../components/fixfy/Container'
import Section from '../components/fixfy/Section'
import Eyebrow from '../components/fixfy/Eyebrow'
import Chip from '../components/fixfy/Chip'
import Button from '../components/fixfy/Button'
import Card from '../components/fixfy/Card'
import Stat from '../components/fixfy/Stat'
import HeroPortalMotion from '../components/fixfy/HeroPortalMotion'

const PRESS = ['BBC', 'Financial Times', 'The Times', 'Sifted', 'PBC Today', 'FM Business Daily']

const CUSTOMERS = [
  'The Crown Estate', 'Pret a Manger', 'John Lewis & Partners', 'British Land',
  'Selfridges', 'Mitie', 'NHS Property', 'Canary Wharf Group',
  'Landsec', 'Grosvenor', 'Segro', 'Hammerson',
]

const PLATFORM_CARDS = [
  { icon: '⌘', title: 'Jobs & SLAs',      body: 'Post reactive, planned and compliance work. Automatic SLA tracking, escalation, photos on completion.' },
  { icon: '◇', title: 'Asset register',   body: 'Every plant item, every site, one QR code. Service history, warranty, parts spend — in one place.' },
  { icon: '◯', title: 'Supplier network', body: '3,400+ vetted UK trades. Insurance and qualifications verified. Rate-carded or marketplace.' },
  { icon: '△', title: 'Compliance',       body: 'Legionella, fire doors, PAT, gas, LOLER. Automated scheduling. Auditor-ready paper trail.' },
]

const PERSONAS = [
  {
    to: '/for-fms',
    kicker: 'For facilities managers',
    h: ['Stop chasing emails.', 'Start closing jobs.'],
    body: 'Multi-site visibility, SLA tracking, and a supplier network your finance team will actually sign off.',
  },
  {
    to: '/for-owners',
    kicker: 'For property owners',
    h: ['One dashboard.', 'Every building.'],
    body: 'Portfolio-level spend, compliance and asset condition. White-label for your tenants if you want.',
  },
  {
    to: '/for-trades',
    kicker: 'For tradespeople',
    h: ['Fair work.', 'Paid in seven days.'],
    body: 'No commission. No marketplace fees. Transparent rate cards. 98.4% of invoices paid within a week.',
  },
]

export default function Home() {
  return (
    <>
      <SEO
        title="Fixfy — Maintenance infrastructure for British business"
        description="A free-first platform connecting facilities teams, property owners and 3,400+ vetted tradespeople. Jobs, assets, suppliers and compliance — in one place."
        keywords="facilities management, commercial maintenance, UK trades, compliance, SLA tracking, asset register"
      />

      {/* HERO */}
      <section className="fx-hero">
        <Container>
          <div className="fx-hero-grid">
            <div>
              <Chip dot>Free to list · No ticket fees, ever</Chip>
              <h1 className="fx-display-lg fx-mt-24">
                Maintenance <span className="fx-coral-text">infrastructure</span> for British business.
              </h1>
              <p className="fx-lede fx-mt-24">
                One calm place for facilities teams, property owners and 3,400+ vetted tradespeople.
                Free to list. No ticket fees. Ever.
              </p>
              <div className="fx-flex fx-gap-8 fx-mt-32" style={{ flexWrap: 'wrap' }}>
                <Button to="/contact" arrow>Book a demo</Button>
                <Button to="/platform" variant="ghost">See the platform</Button>
              </div>
              <div className="fx-hero-meta fx-mt-48">
                <span className="fx-mono">SOC 2 Type II</span>
                <span className="fx-mono">ISO 27001</span>
                <span className="fx-mono">Cyber Essentials Plus</span>
                <span className="fx-mono">GDPR</span>
              </div>
            </div>

            <div className="fx-hero-motion">
              <HeroPortalMotion />
            </div>
          </div>
        </Container>
      </section>

      {/* PRESS */}
      <section className="fx-press-section">
        <Container>
          <div className="fx-press-row">
            <div className="fx-press-row-lbl">As covered by</div>
            <div className="fx-press-row-logos">
              {PRESS.map((p) => <span key={p} className="fx-press-logo">{p}</span>)}
            </div>
          </div>
        </Container>
      </section>

      {/* STATS */}
      <Section size="compact">
        <Container>
          <Eyebrow>By the numbers · Q1 2026</Eyebrow>
          <div className="fx-stats-grid fx-mt-32">
            <Stat kicker="Tradespeople" number="3,412"
                  label="Vetted, insured UK tradespeople active on the platform today." />
            <Stat kicker="Jobs · last 30d" number="14,219"
                  label="Reactive, planned and compliance jobs completed this month." />
            <Stat kicker="Avg SLA" number={<>3<span className="fx-unit">h</span> 48<span className="fx-unit">m</span></>}
                  label="Median time from job post to trade on-site for P1 reactive." />
            <Stat kicker="Paid in 7 days" number="98.4" unit="%"
                  label="Of trade invoices settled within a week of completion." />
          </div>
        </Container>
      </Section>

      {/* CUSTOMER WALL */}
      <Section tone="paper">
        <Container>
          <Eyebrow>Trusted by the estates that run Britain</Eyebrow>
          <h2 className="fx-h1 fx-mt-16" style={{ maxWidth: '22ch' }}>
            From listed estates to high-street chains, Fixfy keeps the lights on.
          </h2>
          <div className="fx-logo-wall">
            {CUSTOMERS.map((c) => (
              <div key={c} className="fx-logo-wall-cell"><span>{c}</span></div>
            ))}
          </div>
        </Container>
      </Section>

      {/* PLATFORM */}
      <Section>
        <Container>
          <Eyebrow>The platform</Eyebrow>
          <h2 className="fx-display fx-mt-16" style={{ maxWidth: '18ch' }}>
            Everything a building needs. Nothing it doesn&rsquo;t.
          </h2>
          <p className="fx-lede fx-mt-24">
            Four modules. One ledger. Built so the facilities manager, the finance director
            and the trade on site are looking at the same truth.
          </p>
          <div className="fx-grid-4 fx-mt-64">
            {PLATFORM_CARDS.map((c) => (
              <Card key={c.title} icon={c.icon} title={c.title} body={c.body} />
            ))}
          </div>
          <div className="fx-flex fx-gap-16 fx-mt-48">
            <Button to="/platform" variant="ghost" arrow>Explore the platform</Button>
          </div>
        </Container>
      </Section>

      {/* CORAL PULLQUOTE */}
      <Section tone="coral">
        <Container narrow>
          <Eyebrow style={{ color: 'rgba(255,255,255,0.76)' }}>Customer · Selfridges</Eyebrow>
          <blockquote className="fx-pullquote fx-mt-24">
            We moved 340 sites onto Fixfy in seven weeks. The dashboard tells us more in a glance
            than our last CAFM platform did in a monthly export.
          </blockquote>
          <div className="fx-quote-cite fx-mt-32">
            <div className="fx-quote-avatar">EH</div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 16 }}>Eleanor Harding</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>Group Head of Facilities · Selfridges</div>
            </div>
          </div>
        </Container>
      </Section>

      {/* THREE AUDIENCES */}
      <Section tone="paper">
        <Container>
          <Eyebrow>Built for three audiences</Eyebrow>
          <h2 className="fx-display fx-mt-16" style={{ maxWidth: '16ch' }}>
            One platform, three points of view.
          </h2>
          <div className="fx-grid-3 fx-mt-64">
            {PERSONAS.map((p) => (
              <Link key={p.to} to={p.to} className="fx-persona-card">
                <div>
                  <div className="fx-persona-kicker">{p.kicker}</div>
                  <h3 className="fx-h2 fx-mt-16">
                    {p.h[0]}<br />{p.h[1]}
                  </h3>
                  <p className="fx-body fx-mt-16">{p.body}</p>
                </div>
                <span className="fx-persona-link fx-mt-32">Learn more →</span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* FINAL CTA */}
      <Section>
        <Container narrow>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex' }}><Eyebrow>Ready when you are</Eyebrow></div>
            <h2 className="fx-display-lg fx-mt-24" style={{ maxWidth: '18ch', margin: '24px auto 0' }}>
              See Fixfy with your portfolio.
            </h2>
            <p className="fx-lede fx-mt-24" style={{ margin: '24px auto 0' }}>
              30-minute demo. We&rsquo;ll load three of your sites into a sandbox so you can see exactly
              what your team would use on day one.
            </p>
            <div className="fx-flex fx-gap-8 fx-mt-32" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button to="/contact" arrow>Book a demo</Button>
              <Button to="/platform" variant="ghost">See the platform</Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
