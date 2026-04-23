import React from 'react'
import { SEO } from '../components/SEO'
import Container from '../components/fixfy/Container'
import Section from '../components/fixfy/Section'
import Eyebrow from '../components/fixfy/Eyebrow'
import CTABlock from '../components/fixfy/CTABlock'

const FEATURED_LIST = [
  { tag: 'Guide',    title: "The FM's 90-day playbook",       desc: 'When you inherit an estate',  date: "Apr '26" },
  { tag: 'Benchmark', title: 'P1 reactive SLAs',              desc: 'By sector, UK',                date: "Mar '26" },
  { tag: 'Deep-dive', title: 'Why fire door compliance keeps failing', desc: 'And how to fix it',  date: "Feb '26" },
  { tag: 'Guide',    title: 'Legionella scheduling, done right', desc: 'A step-by-step',            date: "Feb '26" },
  { tag: 'Essay',    title: 'The case against CAFM',           desc: 'Marcus Thorne',                date: "Jan '26" },
]

const ALL_POSTS = [
  ['Case study', 'How Pret rebuilt reactive across 489 shops', "Mar '26"],
  ['Essay',      'Maintenance infrastructure — a manifesto',    "Feb '26"],
  ['Guide',      'PAT testing: the honest calendar',            "Feb '26"],
  ['Research',   'Trade retention on marketplaces, 2020-2026',  "Jan '26"],
  ['Case study', 'Canary Wharf Group: portfolio visibility at scale', "Jan '26"],
  ['Essay',      "Why we'll never charge ticket fees",          "Dec '25"],
  ['Guide',      'Asset registers, without spreadsheets',       "Nov '25"],
  ['Benchmark',  'The true cost of reactive maintenance, 2025', "Oct '25"],
]

export default function Resources() {
  return (
    <>
      <SEO
        title="Resources — Fixfy"
        description="Field notes on commercial maintenance. Practitioner guides, whitepapers and the Fixfy quarterly index."
      />

      <Section size="page-header">
        <Container>
          <Eyebrow>Resources</Eyebrow>
          <h1 className="fx-display fx-mt-16" style={{ maxWidth: '18ch' }}>
            Field notes on running British buildings.
          </h1>
          <p className="fx-lede fx-mt-24">
            Research, benchmarks and long-form writing for the people who keep the lights on.
          </p>
        </Container>
      </Section>

      <Section size="compact">
        <Container>
          <div className="fx-res-hero">
            <a href="#" className="fx-res-feat">
              <div className="cover">
                <div className="kicker">Industry report · 2026</div>
                <h3>The State of UK Commercial Maintenance &mdash; 2026</h3>
              </div>
              <div className="body-pad">
                <p className="fx-body" style={{ color: 'var(--fx-slate)' }}>
                  48-page report based on 14,219 reactive jobs and 4,000+ buildings. Spend,
                  SLAs, supplier concentration, what&rsquo;s breaking, what&rsquo;s holding up.
                </p>
                <span className="fx-mono fx-coral-text fx-mt-16" style={{
                  display: 'inline-block', fontSize: 12,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>Download PDF →</span>
              </div>
            </a>

            <div className="fx-res-list">
              {FEATURED_LIST.map((r) => (
                <a key={r.title} href="#" className="fx-res-item">
                  <span className="fx-tag">{r.tag}</span>
                  <span className="fx-title">
                    {r.title}
                    <span className="fx-d">· {r.desc}</span>
                  </span>
                  <span className="fx-date">{r.date}</span>
                </a>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <Eyebrow>All posts</Eyebrow>
          <div className="fx-res-list fx-mt-32">
            {ALL_POSTS.map(([tag, title, date]) => (
              <a key={title} href="#" className="fx-res-item">
                <span className="fx-tag">{tag}</span>
                <span className="fx-title">{title}</span>
                <span className="fx-date">{date}</span>
              </a>
            ))}
          </div>
        </Container>
      </Section>

      <CTABlock />
    </>
  )
}
