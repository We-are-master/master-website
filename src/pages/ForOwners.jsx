import React from 'react'
import AudiencePage from '../components/fixfy/AudiencePage'

export default function ForOwners() {
  return (
    <AudiencePage
      eyebrow="For property owners"
      headline={<>One dashboard.<br />Every building.</>}
      lede="Portfolio-level visibility of spend, compliance and asset condition. Roll up or drill down. White-label for tenants if you want them to self-serve."
      stats={[
        { number: '340',             label: 'Largest portfolio onboarded to date' },
        { number: '22',  unit: '%',  label: 'Avg reduction in reactive spend, year one' },
        { number: '100', unit: '%',  label: 'RAG-rated compliance across portfolio' },
      ]}
      features={[
        { title: 'Portfolio rollup',   body: 'Spend, compliance, asset condition by building, region, tenant.' },
        { title: 'Tenant self-serve',  body: 'White-label Fixfy so tenants raise their own tickets.' },
        { title: 'Capex vs opex',      body: "See which buildings are bleeding, which are compounding." },
        { title: 'Benchmarking',       body: 'Anonymous peer data across 4,000+ UK commercial buildings.' },
      ]}
      quote="We run 88 buildings across the UK. For the first time we can answer 'how's the portfolio doing?' in under ten seconds."
      quoteWho="Natasha Forbes · Asset Director, British Land"
      seoTitle="For property owners — Fixfy"
    />
  )
}
