import React from 'react'
import { SEO } from '../components/SEO'
import Container from '../components/fixfy/Container'
import Section from '../components/fixfy/Section'
import Eyebrow from '../components/fixfy/Eyebrow'
import Card from '../components/fixfy/Card'
import CTABlock from '../components/fixfy/CTABlock'

const BADGES = [
  { seal: 'SOC 2', title: 'SOC 2 Type II',       body: 'Annual audit by a Big Four firm. Report available under NDA.' },
  { seal: 'ISO',   title: 'ISO 27001:2022',      body: 'Certified information security management system.' },
  { seal: 'CE+',   title: 'Cyber Essentials Plus', body: 'NCSC-backed, annually renewed.' },
  { seal: 'GDPR',  title: 'UK & EU GDPR',         body: 'Data Protection Impact Assessments on every release.' },
  { seal: 'PCI',   title: 'PCI DSS v4.0',         body: 'Stripe-backed payment processing. We never see card data.' },
  { seal: 'DPA',   title: 'UK DPA 2018',          body: 'Registered data controller. Full DPA available on request.' },
  { seal: 'BCP',   title: 'ISO 22301',            body: 'Business continuity management — certified 2025.' },
  { seal: '99.99', title: '99.99% uptime SLA',    body: 'Four 9s, backed by a credit schedule. Status page live.' },
]

const VETTING_STEPS = [
  { n: '01', title: 'Insurance',      body: "Public liability (£5M min), employers' liability and professional indemnity verified with the underwriter." },
  { n: '02', title: 'Qualifications', body: 'Gas Safe, NICEIC, NAPIT, SafeContractor, CHAS — verified against the source register.' },
  { n: '03', title: 'Financial health', body: 'Experian credit check and Companies House filings reviewed quarterly.' },
  { n: '04', title: 'References',     body: 'Three named references. Called by our team, not an email survey.' },
]

export default function Trust() {
  return (
    <>
      <SEO
        title="Trust & security — Fixfy"
        description="SOC 2 Type II, ISO 27001, Cyber Essentials Plus, GDPR. UK data residency and a security contact who picks up the phone."
      />

      <Section size="page-header">
        <Container>
          <Eyebrow>Trust &amp; security</Eyebrow>
          <h1 className="fx-display fx-mt-16" style={{ maxWidth: '18ch' }}>
            Built for buildings the country can&rsquo;t afford to stop.
          </h1>
          <p className="fx-lede fx-mt-24">
            The trades we onboard are vetted by humans. The infrastructure we run is audited
            by the best. The policies we hold are published. Here&rsquo;s the long list.
          </p>
        </Container>
      </Section>

      <Section size="compact">
        <Container>
          <Eyebrow>Certifications</Eyebrow>
          <div className="fx-trust-grid fx-mt-32">
            {BADGES.map((b) => (
              <div key={b.title} className="fx-trust-badge">
                <div className="fx-seal">{b.seal}</div>
                <h4>{b.title}</h4>
                <p>{b.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <Eyebrow>How we vet tradespeople</Eyebrow>
          <h2 className="fx-display fx-mt-16" style={{ maxWidth: '20ch' }}>
            A human reviews every supplier before they see a single job.
          </h2>
          <div className="fx-grid-4 fx-mt-48">
            {VETTING_STEPS.map((s) => (
              <Card key={s.n} icon={s.n} title={s.title} body={s.body} />
            ))}
          </div>
        </Container>
      </Section>

      <CTABlock />
    </>
  )
}
