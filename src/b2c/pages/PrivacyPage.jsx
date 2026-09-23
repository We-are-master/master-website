import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import LegalShell from '../components/LegalShell.jsx'
import { COMPANY, TERMS } from '../content/site.js'
import { usePageMeta } from '../lib/meta.js'

const TOC = [
  { id: 'who', label: '1. Who we are' },
  { id: 'collect', label: '2. What we collect' },
  { id: 'use', label: '3. How we use it and why' },
  { id: 'share', label: '4. Who we share it with' },
  { id: 'transfers', label: '5. Outside the UK' },
  { id: 'keep', label: '6. How long we keep it' },
  { id: 'rights', label: '7. Your rights' },
  { id: 'safe', label: '8. Keeping it safe' },
  { id: 'changes', label: '9. Changes to this policy' },
]

// Finalidade → base legal (UK GDPR, art. 6).
const USES = [
  ['Take your booking, plan the job, share it with the professional who does it, call you the day before and send your confirmation and photo report', 'Contract: we need it to do what you booked'],
  ['Take payment and prevent fraud', 'Contract, and our legitimate interest in preventing fraud'],
  ['Handle changes, complaints, re-cleans and damage claims', 'Contract, and our legitimate interest in defending our business'],
  ['Keep accounting and tax records', 'Legal obligation'],
  ['Check the quality of our work and improve our service', 'Our legitimate interest in running and improving our business'],
  ['Help you finish a booking you started, send you offers, and remind you before a certificate we issued expires', 'Our legitimate interest in keeping in touch with customers and with people who started a booking. You can say no when you give us your email, and in every email we send'],
  ['Analytics and advertising cookies, and telling Meta about your booking to measure our ads', 'Consent: only if you said yes in the cookie banner'],
  ['Reply to enquiries and consider applications to work with us', 'Our legitimate interest in replying, or steps you ask for before a contract'],
]

export default function PrivacyPage() {
  usePageMeta({
    title: 'Privacy policy | Fixfy',
    description: 'What Fixfy collects when you book or contact us, why, who we share it with and your rights.',
    path: '/privacy',
  })

  return (
    <LegalShell
      icon={ShieldCheck}
      eyebrow="Privacy policy"
      title="Privacy"
      lede="What we collect when you book or contact us, why we need it, who we share it with and your rights. We never sell your personal information."
      version={`Version of ${TERMS.version}`}
      toc={TOC}
    >
      <section id="who">
        <h2>1. Who we are</h2>
        <p>
          {COMPANY.legalName}, trading as Fixfy (company number {COMPANY.companyNumber}, {COMPANY.address}), is the controller of
          your personal information. For anything about your data, email{' '}
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
        </p>
      </section>

      <section id="collect">
        <h2>2. What we collect</h2>
        <ul>
          <li>
            <b>When you start a booking:</b> your name and email as soon as you give them to us, with the services you picked,
            even if you do not finish. We use them to help you finish, and for offers unless you tick &quot;Don&apos;t email me
            offers&quot;.
          </li>
          <li>
            <b>When you book:</b> your name, email, mobile number, the property address, the services and day you choose, how we
            get in (including key arrangements and the key safe code we ask for the day before), parking and any notes.
          </li>
          <li>
            <b>Payment:</b> Stripe takes your card details, and we never see or store them. We receive confirmation of the payment
            and its amount.
          </li>
          <li>
            <b>Photos of the property:</b> the team photographs every room they worked on for your photo report. We ask our teams
            not to photograph people or personal documents.
          </li>
          <li>
            <b>Messages and calls:</b> emails, WhatsApp messages and notes from calls with you.
          </li>
          <li>
            <b>Our website:</b> with your consent, cookies and similar tools, listed in our <Link to="/cookies">cookie policy</Link>.
            Vercel Web Analytics counts page views without cookies, and our website host processes your IP address to keep the site
            secure. With your consent to analytics, we also keep the page or campaign that brought you with your booking.
          </li>
          <li>
            <b>If you contact us or apply to work with us:</b> the details you send, such as your name, company, contact details,
            trade and documents like insurance or certificates.
          </li>
        </ul>
      </section>

      <section id="use">
        <h2>3. How we use it and why</h2>
        <div className="mo-legal__table">
          <table>
            <thead>
              <tr>
                <th scope="col">What we do</th>
                <th scope="col">Our legal basis</th>
              </tr>
            </thead>
            <tbody>
              {USES.map(([what, basis]) => (
                <tr key={what}>
                  <td>{what}</td>
                  <td>{basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          We do not make decisions about you based only on automated processing that have legal or similarly significant effects.
        </p>
      </section>

      <section id="share">
        <h2>4. Who we share it with</h2>
        <ul>
          <li>
            <b>The professional who does your job:</b> your name, the address, your phone number, how to get in and the job notes.
          </li>
          <li>
            <b>Your letting agent, landlord or concierge,</b> when you ask us to collect keys from them or to send them your report.
          </li>
          <li>
            <b>Service providers who work for us under contract:</b> Stripe (payments), Vercel and Railway (hosting our website and
            booking system), Mapbox (address search while you type), Resend (emails), Zendesk (customer support), Google Workspace
            (email), respond.io and WhatsApp (messages) and OpenAI (tools that help our team read and route messages).
          </li>
          <li>
            <b>Only with your consent:</b> Meta (the Pixel, and your booking value with a scrambled copy of your email and phone
            sent from our server), Google Analytics and Tag Manager, Microsoft Clarity, and Zoho (PageSense and the SalesIQ chat).
          </li>
          <li>
            <b>When the law requires it or to deal with a claim:</b> authorities, insurers, legal advisers or courts. If we sell our
            business, the buyer, under the same protections.
          </li>
        </ul>
      </section>

      <section id="transfers">
        <h2>5. Outside the UK</h2>
        <p>
          Some of these providers store or access data outside the UK, mainly in the United States. When they do, we rely on the
          UK&rsquo;s adequacy regulations, including the UK-US data bridge, or on the International Data Transfer Agreement or
          Addendum approved by the Information Commissioner&rsquo;s Office.
        </p>
      </section>

      <section id="keep">
        <h2>6. How long we keep it</h2>
        <ul>
          <li>
            <b>Bookings, payments, messages and photo reports:</b> 6 years after the job, the time limit for tax records and for
            most legal claims.
          </li>
          <li>
            <b>Marketing:</b> until you unsubscribe. We then keep your email on a do-not-contact list so we never email you offers
            again.
          </li>
          <li>
            <b>Enquiries and bookings you started but did not finish, and applications to work with us that do not go
            ahead:</b> 12 months.
          </li>
          <li>
            <b>Cookies:</b> as listed in our <Link to="/cookies">cookie policy</Link>.
          </li>
        </ul>
      </section>

      <section id="rights">
        <h2>7. Your rights</h2>
        <p>You can ask us to:</p>
        <ul>
          <li>give you a copy of the personal information we hold about you;</li>
          <li>correct it, or delete it;</li>
          <li>restrict or object to how we use it, including stopping marketing at any time;</li>
          <li>send it to you or another provider in a common format;</li>
          <li>and you can withdraw your consent at any time, which does not affect what we did before.</li>
        </ul>
        <p>
          Email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> and we reply within one month. Some rights have limits: for
          example, we have to keep tax records.
        </p>
        <p>
          If you are unhappy with how we handle your data, you can complain to the Information Commissioner&rsquo;s Office at{' '}
          <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noreferrer">
            ico.org.uk
          </a>{' '}
          or on 0303 123 1113. We would appreciate the chance to put it right first.
        </p>
      </section>

      <section id="safe">
        <h2>8. Keeping it safe</h2>
        <p>
          Only the people who need your information to do their job can see it, and it travels encrypted between your browser, our
          systems and our providers. Key safe codes and access details go only to the team doing your job. Our services are for
          adults, and we do not knowingly collect information about children.
        </p>
      </section>

      <section id="changes">
        <h2>9. Changes to this policy</h2>
        <p>
          We update this policy when we change what we do with your information. The version at the top of the page is the latest.
          Bookings are covered by our <Link to="/terms">booking terms</Link>.
        </p>
      </section>
    </LegalShell>
  )
}
