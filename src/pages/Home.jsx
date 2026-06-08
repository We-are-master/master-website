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
import HowItWorksHome from '../components/fixfy/HowItWorksHome'

const HOW_IT_WORKS = {
  title: 'From request to resolution, one flow',
  lede: 'Post jobs, assign vetted trades, and close with proof — all in one ledger.',
  steps: [
    {
      n: '01',
      title: 'Post & triage',
      body: 'Raise reactive or planned work in seconds. SLAs, priorities and escalation paths use your rules.',
    },
    {
      n: '02',
      title: 'Assign & execute',
      body: 'Dispatch to your supply or ours. Track ETAs, evidence on site and completion in real time.',
    },
    {
      n: '03',
      title: 'Report & close',
      body: 'Invoices, compliance records and audit-ready exports — without piecing together spreadsheets.',
    },
  ],
}

const CUSTOMERS = [
  'Kvadrat',
  'Li & Fung',
  'Good Place Lettings',
  'Cornwallis',
  'Eagle Vision',
  'Crystal Facilities',
  'SC Johnson',
  'Fantastic Services',
  'StyleSmith',
  'NHS Property',
  'Homyze',
  'Checkatrade',
]

const PLATFORM_CARDS = [
  {
    icon: '◇',
    title: 'Assets',
    body: 'Every site, every asset — fully tracked. Service history, warranties and spend, all linked and accessible.',
  },
  {
    icon: '⌘',
    title: 'Jobs & SLAs',
    body: 'Manage reactive, planned and compliance work in one place. Track SLAs automatically, escalate when needed and close with full reports.',
  },
  {
    icon: '◯',
    title: 'Supply network',
    body: 'Access a network of vetted professionals. Fully vetted and approved, insured and ready to deliver at scale.',
  },
  {
    icon: '△',
    title: 'Compliance',
    body: 'Stay compliant without the manual work. Automated scheduling, complete records and audit-ready reporting.',
  },
]

const AUDIENCE_CARDS = [
  {
    to: '/platform',
    kicker: 'For real estate',
    line: 'Manage portfolios, compliance and maintenance across every asset.',
  },
  {
    to: '/platform',
    kicker: 'For franchises',
    line: 'Standardise maintenance across locations, with full control and visibility.',
  },
  {
    to: '/platform',
    kicker: 'For enterprise operations',
    line: 'Handle high-volume requests with consistent delivery and reporting.',
  },
  {
    to: '/platform',
    kicker: 'For service platforms',
    line: 'Plug into our infrastructure to manage jobs, suppliers and reporting at scale.',
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
              <Chip dot>Pre-fixed pricing · Certified partners</Chip>
              <h1 className="fx-display-lg fx-mt-24">
                Maintenance <span className="fx-coral-text">infrastructure</span> for British business.
              </h1>
              <p className="fx-lede fx-mt-24">
                {
                  'Fully handled, end to end. Trades, scheduling, compliance, execution & reporting — all in one place.'
                }
              </p>
              <div className="fx-flex fx-gap-8 fx-mt-32" style={{ flexWrap: 'wrap' }}>
                <Button to="/contact" arrow>Get in touch</Button>
                <Button to="/platform" variant="ghost">See the platform</Button>
              </div>
              <div className="fx-hero-meta fx-mt-48">
                <span className="fx-hero-cert-label">Certified ›</span>
                <div className="fx-hero-certs">
                  <span className="fx-mono">Gas Safe</span>
                  <span className="fx-mono">NICEIC</span>
                  <span className="fx-mono">OFTEC</span>
                  <span className="fx-mono">NAPIT</span>
                </div>
              </div>
            </div>

            <div className="fx-hero-motion">
              <HeroPortalMotion />
            </div>
          </div>
        </Container>
      </section>

      {/* STATS */}
      <Section size="compact">
        <Container>
          <Eyebrow>By the numbers · Q1 2026</Eyebrow>
          <div className="fx-stats-grid fx-mt-32">
            <Stat
              kicker="AVG SLA P1"
              number={<>17<span className="fx-unit">h</span> 48<span className="fx-unit">m</span></>}
              label="Average time to fully resolve urgent P1 jobs."
            />
            <Stat
              kicker="Trades compliance"
              number="99.7"
              unit="%"
              label="Vetted, insured and continuously monitored professionals."
            />
            <Stat
              kicker="Avg response time"
              number={<>8<span className="fx-unit">m</span> 4<span className="fx-unit">s</span></>}
              label="From first contact to job acknowledgement."
            />
            <Stat
              kicker="Fast partner payouts"
              number="98.4"
              unit="%"
              label="Paid within 7 days. Trade invoices settled within a week of completion."
            />
          </div>
        </Container>
      </Section>

      <HowItWorksHome
        title={HOW_IT_WORKS.title}
        lede={HOW_IT_WORKS.lede}
        steps={HOW_IT_WORKS.steps}
      />

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
          <Eyebrow>The infrastructure</Eyebrow>
          <h2 className="fx-display fx-mt-16" style={{ maxWidth: '32ch' }}>
            Everything your properties need, without the overhead.
          </h2>
          <p className="fx-lede fx-mt-24">
            Four modules. One system. Everyone working from the same source of truth.
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
          <Eyebrow style={{ color: 'rgba(255,255,255,0.76)' }}>Customer · Li &amp; Fung</Eyebrow>
          <blockquote className="fx-pullquote fx-mt-24">
            A backlog of critical jobs was resolved in weeks. Fixfy quoted, planned and delivered
            everything — with trades fully managed and no chasing required.
          </blockquote>
          <div className="fx-quote-cite fx-mt-32">
            <div className="fx-quote-avatar">SB</div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 16 }}>Sabrina Braz</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>Facilities Manager · Li &amp; Fung</div>
            </div>
          </div>
        </Container>
      </Section>

      {/* LIVE SMART PORTAL */}
      <Section tone="paper">
        <Container>
          <Eyebrow>LIVE SMART PORTAL</Eyebrow>
          <h2 className="fx-display fx-mt-16" style={{ maxWidth: '22ch' }}>
            One dashboard for every property.
          </h2>
          <p className="fx-lede fx-mt-24">
            Manage one or thousands, with the same control.
          </p>
          <div className="fx-grid-4 fx-mt-64">
            {AUDIENCE_CARDS.map((p) => (
              <Link key={p.kicker} to={p.to} className="fx-persona-card">
                <div>
                  <div className="fx-persona-kicker">{p.kicker}</div>
                  <h3 className="fx-h3 fx-mt-16">{p.line}</h3>
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
              <Button to="/contact" arrow>Get in touch</Button>
              <Button to="/platform" variant="ghost">See the platform</Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
