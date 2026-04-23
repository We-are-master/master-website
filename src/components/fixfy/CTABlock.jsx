import React from 'react'
import Container from './Container'
import Section from './Section'
import Eyebrow from './Eyebrow'
import Button from './Button'

export default function CTABlock() {
  return (
    <Section>
      <Container narrow>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex' }}><Eyebrow>Ready when you are</Eyebrow></div>
          <h2 className="fx-display-lg fx-mt-24" style={{ maxWidth: '18ch', margin: '24px auto 0' }}>
            See Fixfy with your portfolio.
          </h2>
          <p className="fx-lede fx-mt-24" style={{ margin: '24px auto 0' }}>
            30-minute demo. We&rsquo;ll load three of your sites into a sandbox so you can see
            exactly what your team would use on day one.
          </p>
          <div className="fx-flex fx-gap-8 fx-mt-32" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button to="/contact" arrow>Book a demo</Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}
