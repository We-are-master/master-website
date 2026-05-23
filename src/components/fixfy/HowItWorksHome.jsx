import React from 'react'
import Section from './Section'
import Container from './Container'
import Eyebrow from './Eyebrow'
import Button from './Button'

/**
 * “How it works” band: eyebrow, headline, visual timeline (rail + steps), CTA to /platform.
 * Desktop: nodes + connecting lines; mobile: same steps with inline nodes (rail hidden).
 */
export default function HowItWorksHome({ title, lede, steps }) {
  return (
    <Section id="how-it-works">
      <Container>
        <Eyebrow>How it works</Eyebrow>
        <h2 className="fx-h1 fx-mt-16" style={{ maxWidth: '20ch' }}>
          {title}
        </h2>
        {lede && <p className="fx-lede fx-mt-24">{lede}</p>}

        <div className="fx-how-timeline" aria-label="How Fixfy works">
          {/* Horizontal rail: visible from md breakpoint */}
          <div className="fx-how-timeline-rail" aria-hidden="true">
            {steps.map((s, i) => (
              <React.Fragment key={s.n}>
                <span className="fx-how-timeline-node">{s.n}</span>
                {i < steps.length - 1 && <span className="fx-how-timeline-line" />}
              </React.Fragment>
            ))}
          </div>

          <ol className="fx-how-timeline-panels">
            {steps.map((s) => (
              <li key={s.n} className="fx-how-timeline-panel">
                <span className="fx-how-timeline-nodeDim" aria-hidden="true">
                  {s.n}
                </span>
                <div className="fx-how-timeline-copy">
                  <h3 className="fx-h3">{s.title}</h3>
                  <p className="fx-body fx-mt-8">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="fx-flex fx-mt-48" style={{ flexWrap: 'wrap' }}>
          <Button to="/platform" variant="ghost" arrow>Explore the platform</Button>
        </div>
      </Container>
    </Section>
  )
}
