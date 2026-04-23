import React from 'react'
import AudiencePage from '../components/fixfy/AudiencePage'

export default function ForTrades() {
  return (
    <AudiencePage
      eyebrow="For tradespeople"
      headline={<>Fair work.<br />Paid in seven days.</>}
      lede="No commission. No marketplace fees. Transparent rate cards. 98.4% of invoices paid within a week of sign-off. List free, forever."
      ctaLabel="Join the network"
      stats={[
        { number: '£0',             label: 'Commission, ticket fees, or per-job charges' },
        { number: '7', unit: 'd',   label: 'Median invoice-to-payment time' },
        { number: '4.9★',           label: 'Avg trade rating (not a typo, we checked)' },
      ]}
      features={[
        { title: 'Real jobs, not leads',   body: 'Every job on Fixfy is paid-for by a real customer. No lead-gen fees.' },
        { title: 'Transparent rates',      body: 'See the day rate before you bid. No races to the bottom.' },
        { title: 'Paid fast',              body: 'Sign-off triggers payment in 7 days. We chase the customer, not you.' },
        { title: 'Your crew, your call',   body: "Assign your own engineers. We don't touch your team structure." },
      ]}
      quote="I stopped chasing three builders and a property company for invoices. Fixfy pays on the nail."
      quoteWho="Dan McKay · Director, McKay Mechanical Services"
      seoTitle="For tradespeople — Fixfy"
    />
  )
}
