import React from 'react'
import { SEO } from '../components/SEO'
import Container from '../components/fixfy/Container'
import Section from '../components/fixfy/Section'
import Eyebrow from '../components/fixfy/Eyebrow'
import Stat from '../components/fixfy/Stat'
import CTABlock from '../components/fixfy/CTABlock'

const CASE_STUDIES = [
  {
    logo: 'Selfridges',
    cover: '',
    stat: '340', unit: 'sites',
    label: 'Onboarded in 7 weeks',
    meta: 'Retail · Enterprise',
    title: 'Unifying reactive across 340 Selfridges Group locations',
    body: "How Eleanor Harding's team consolidated three CAFM platforms and cut reactive spend 28% in year one.",
  },
  {
    logo: 'British Land',
    cover: 'coral',
    stat: '£2.1', unit: 'M',
    label: 'Saved in opex · year 1',
    meta: 'Property · Portfolio',
    title: 'Portfolio-level visibility at British Land',
    body: "From Excel to one dashboard across 88 buildings — and a real answer to 'how's the estate doing?'.",
  },
  {
    logo: 'NHS Property',
    cover: 'ink',
    stat: '100', unit: '%',
    label: 'Statutory compliance',
    meta: 'Healthcare · Compliance',
    title: 'Hitting 100% statutory compliance across NHS primary care',
    body: 'Automating legionella, fire door and PAT scheduling across 1,200 surgeries.',
  },
]

const CUSTOMERS = [
  'The Crown Estate', 'Pret a Manger', 'John Lewis & Partners', 'British Land',
  'Selfridges', 'Mitie', 'NHS Property', 'Canary Wharf Group',
  'Landsec', 'Grosvenor', 'Segro', 'Hammerson',
]

export default function Customers() {
  return (
    <>
      <SEO
        title="Customers — Fixfy"
        description="How Britain's estates run on Fixfy. Case studies from retail, healthcare, co-working and listed estates."
      />

      <Section size="page-header">
        <Container>
          <Eyebrow>Customers</Eyebrow>
          <h1 className="fx-display fx-mt-16" style={{ maxWidth: '20ch' }}>
            The estates that run Britain, running on Fixfy.
          </h1>
          <p className="fx-lede fx-mt-24">
            From listed retail to NHS primary care to grade-A offices &mdash;
            Fixfy keeps 4,000+ UK buildings running. Here&rsquo;s how.
          </p>
        </Container>
      </Section>

      <Section size="compact" tone="paper">
        <Container>
          <Eyebrow style={{ color: 'var(--fx-slate)' }}>Featured case studies</Eyebrow>
          <div className="fx-grid-3 fx-mt-32">
            {CASE_STUDIES.map((c) => (
              <a key={c.logo} href="#" className="fx-case-card">
                <div className={`fx-case-cover ${c.cover}`}>
                  <span className="cv-logo">{c.logo}</span>
                  <div>
                    <div className="cv-stat">
                      {c.stat}<span className="u">{c.unit}</span>
                    </div>
                    <div className="cv-label">{c.label}</div>
                  </div>
                </div>
                <div className="fx-case-body">
                  <div className="fx-case-meta">{c.meta}</div>
                  <h3 className="fx-h3">{c.title}</h3>
                  <p className="fx-body">{c.body}</p>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <Eyebrow>The customer roll</Eyebrow>
          <h2 className="fx-display fx-mt-16" style={{ maxWidth: '18ch' }}>
            You&rsquo;re in company.
          </h2>
          <div className="fx-logo-wall">
            {CUSTOMERS.map((c) => (
              <div key={c} className="fx-logo-wall-cell"><span>{c}</span></div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Eyebrow>Results, in aggregate</Eyebrow>
          <div className="fx-stats-grid fx-mt-32">
            <Stat kicker="Avg spend reduction" number="22" unit="%"
                  label="Reactive maintenance spend year one vs. year zero." />
            <Stat kicker="Avg SLA compliance" number="96" unit="%"
                  label="P1 and P2 SLAs met across the customer base." />
            <Stat kicker="NPS" number="+71"
                  label="Customer NPS over rolling four quarters." />
            <Stat kicker="Retention" number="99.2" unit="%"
                  label="Gross revenue retention · FY26." />
          </div>
        </Container>
      </Section>

      <CTABlock />
    </>
  )
}
