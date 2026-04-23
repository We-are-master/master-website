import React from 'react'
import { SEO } from '../components/SEO'
import Container from '../components/fixfy/Container'
import Section from '../components/fixfy/Section'
import Eyebrow from '../components/fixfy/Eyebrow'
import Chip from '../components/fixfy/Chip'
import CTABlock from '../components/fixfy/CTABlock'

const MODULES = [
  {
    n: '01',
    title: 'Jobs & SLAs',
    body: 'Raise reactive tickets in 12 seconds. Automatic SLA clocks, auto-escalation, in-line photo evidence, sign-off flows your finance team will accept.',
    bullets: [
      'Reactive, planned and compliance in one queue',
      'Configurable SLAs per site, asset class or priority',
      'Push-to-trade dispatch with ETA tracking',
      'Photos, signatures and parts on completion',
    ],
    visual: '[ jobs board visual ]',
  },
  {
    n: '02',
    title: 'Asset register',
    body: 'Every boiler, every lift, every AC unit, one QR code. Scan on site to see history, warranty, parts spend and the next service due.',
    bullets: [
      'Bulk import from any CAFM or spreadsheet',
      'QR labels mailed to site, free',
      'Cost-to-repair vs. cost-to-replace alerts',
      'Warranty expiry reminders',
    ],
    visual: '[ asset register visual ]',
  },
  {
    n: '03',
    title: 'Supplier network',
    body: '3,412 vetted UK trades on the platform today. Insurance, qualifications and references verified by a human before they see a single job.',
    bullets: [
      'Rate-card or marketplace — your call',
      'Your existing suppliers onboarded free in 48h',
      "Public liability, employers' and PL certificates tracked",
      'Automatic payment runs on job completion',
    ],
    visual: '[ supplier network visual ]',
  },
  {
    n: '04',
    title: 'Compliance',
    body: 'Legionella, fire doors, PAT, gas safety, LOLER, asbestos. Scheduled automatically. Certificates stored. Auditor-ready the day the auditor walks in.',
    bullets: [
      '18 compliance types out of the box',
      'RAG-rated dashboard by site and portfolio',
      'Certificate expiry alerts 60 / 30 / 7 days out',
      'One-click audit pack export',
    ],
    visual: '[ compliance dashboard visual ]',
  },
]

export default function Platform() {
  return (
    <>
      <SEO
        title="Platform — Fixfy"
        description="Jobs & SLAs, asset register, supplier network and compliance. Four modules, one ledger — the operating system for commercial maintenance."
      />

      <Section size="page-header">
        <Container>
          <Eyebrow>The platform</Eyebrow>
          <h1 className="fx-display fx-mt-16" style={{ maxWidth: '20ch' }}>
            The operating system for commercial maintenance.
          </h1>
          <p className="fx-lede fx-mt-24">
            Four modules, one ledger. From the FM raising the job to the trade closing it out
            to the CFO signing the invoice &mdash; everyone&rsquo;s looking at the same truth.
          </p>
        </Container>
      </Section>

      <Section size="compact">
        <Container>
          {MODULES.map((m, i) => (
            <div key={m.n} className={`fx-feat-row ${i % 2 === 1 ? 'reverse' : ''}`}>
              {i % 2 === 1 && <div className="fx-feat-visual">{m.visual}</div>}
              <div className="fx-feat-copy">
                <Chip dot>Module {m.n}</Chip>
                <h2 className="fx-h1 fx-mt-16">{m.title}</h2>
                <p className="fx-body fx-mt-16">{m.body}</p>
                <ul className="fx-feat-list fx-mt-24">
                  {m.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>
              {i % 2 === 0 && <div className="fx-feat-visual">{m.visual}</div>}
            </div>
          ))}
        </Container>
      </Section>

      <CTABlock />
    </>
  )
}
