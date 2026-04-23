import React from 'react'
import AudiencePage from '../components/fixfy/AudiencePage'

export default function ForFMs() {
  return (
    <AudiencePage
      eyebrow="For facilities managers"
      headline={<>Stop chasing emails.<br />Start closing jobs.</>}
      lede="Whether you're running one building or two hundred, Fixfy gives you a single queue, a single supplier list, and a single number you can quote on a Tuesday: jobs open, jobs closed, SLA met."
      stats={[
        { number: '67', unit: '%',  label: 'Less time chasing contractor updates' },
        { number: '£412',           label: 'Avg saved per reactive job' },
        { number: '4.8', unit: 'h', label: 'Median P1 resolution time' },
      ]}
      features={[
        { title: 'Multi-site dashboard',         body: 'See every open job across every site, without opening every site.' },
        { title: 'SLA tracking that actually works', body: 'Configure per site. Auto-escalate. Nothing slips.' },
        { title: 'Supplier network, sorted',     body: '3,400+ vetted trades. Use ours, bring yours, or both.' },
        { title: 'Finance-friendly',             body: 'Every invoice matched to a PO, a job and a photo.' },
      ]}
      quote="Fixfy replaced three systems and a WhatsApp group. My Monday morning is 90 minutes shorter."
      quoteWho="Richard Ashworth · Regional FM, Pret a Manger"
      seoTitle="For facilities managers — Fixfy"
    />
  )
}
