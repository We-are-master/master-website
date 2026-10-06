import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import LegalShell from '../components/LegalShell.jsx'
import { COMPANY, TERMS } from '../content/site.js'
import { usePageMeta } from '../lib/meta.js'

const OFFICE = '124 City Road, London EC1V 2NX'

const TOC = [
  { id: 'who', label: '1. Who we are' },
  { id: 'collect', label: '2. What we collect' },
  { id: 'use', label: '3. How we use it and why' },
  { id: 'share', label: '4. Who we share it with' },
  { id: 'professional', label: '5. Your Professional' },
  { id: 'calls', label: '6. Call recording' },
  { id: 'transfers', label: '7. Outside the UK' },
  { id: 'keep', label: '8. How long we keep it' },
  { id: 'rights', label: '9. Your rights' },
  { id: 'safe', label: '10. Keeping it safe' },
  { id: 'changes', label: '11. Changes to this notice' },
]

// Finalidade → base legal (UK GDPR, art. 6).
const USES = [
  [
    'Take your booking, offer it to Professionals and confirm one, share the job with your Professional, call you the day before, and send your confirmation, receipt and photo report',
    'Contract: we need it to provide our platform service and arrange what you booked',
  ],
  [
    'Collect your payment as your Professional’s payment collection agent, pass it to them, process refunds on their behalf, and prevent fraud',
    'Contract, and our legitimate interest in preventing fraud',
  ],
  [
    'Handle changes, complaints, guarantee claims, re-cleans and damage claims, working with your Professional',
    'Contract, and our legitimate interest in resolving problems and defending claims',
  ],
  [
    'Record calls on our phone lines and listen back to them',
    'Our legitimate interest in keeping an accurate record of what was agreed, training our team and resolving complaints',
  ],
  ['Keep accounting and tax records', 'Legal obligation'],
  [
    'Check the quality of the work and of our service, including Professionals’ ratings and reliability, and improve them',
    'Our legitimate interest in running and improving our platform',
  ],
  [
    'Help you finish a booking you started, send you offers, and remind you before a certificate from a booking expires',
    'Our legitimate interest in keeping in touch with customers and with people who started a booking. You can say no when you give us your email, and in every email we send',
  ],
  ['Analytics and advertising cookies, and telling Meta about your booking to measure our ads', 'Consent: only if you said yes in the cookie banner'],
  ['Reply to enquiries and consider applications to work with us', 'Our legitimate interest in replying, or steps you ask for before a contract'],
]

/**
 * Privacidade no modelo de agente (06/10/2026): Fixfy e profissional como
 * controladores independentes, gravação de ligações por 12 meses. Texto do
 * documento 02-privacy-notice, sem mudar uma vírgula.
 */
export default function PrivacyPage() {
  usePageMeta({
    title: 'Privacy notice | Fixfy',
    description: 'What Fixfy collects when you book or contact us, why, who we share it with, including your professional, and your rights.',
    path: '/privacy',
  })

  return (
    <LegalShell
      icon={ShieldCheck}
      eyebrow="Privacy notice"
      title="Privacy notice"
      lede="What we collect when you book or contact us, why we need it, who we share it with and your rights. We never sell your personal information."
      version={`Version of ${TERMS.version}`}
      toc={TOC}
    >
      <section id="who">
        <h2>1. Who we are</h2>
        <p>
          <b>1.1</b> {COMPANY.legalName}, trading as Fixfy (company number {COMPANY.companyNumber}, registered office {OFFICE}),
          runs the online platform at getfixfy.com. For anything about your data, email{' '}
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
        </p>
        <p>
          <b>1.2</b> Your job is carried out by an independent, vetted professional (your &quot;Professional&quot;), who has the
          contract with you for the service. Fixfy arranges the booking and collects payment as their agent. Our{' '}
          <Link to="/terms">booking terms</Link> explain how this works.
        </p>
        <p>
          <b>1.3 Fixfy is the controller</b> for platform and booking data: your booking and contact details, payments and
          refunds, your messages and calls with us, the photo reports and certificates held in our system, and our website and
          marketing data.
        </p>
        <p>
          <b>1.4 Your Professional is an independent controller</b> for the information they need to do your job. Section 5
          explains what they receive and how they may use it.
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
            <b>When you book:</b> your name, email, mobile number, the property address, the services and day you choose, how
            your Professional gets in (including key arrangements and the key safe code we ask for the day before), parking and
            any notes.
          </li>
          <li>
            <b>Payment:</b> Stripe takes your card details, and we never see or store them. We receive confirmation of the payment
            and its amount. If you pay by bank transfer, we receive the name on the account, the amount and the reference from our
            bank.
          </li>
          <li>
            <b>Photos of the property:</b> your Professional photographs every room they worked on, in our app, for your photo
            report. We ask Professionals not to photograph people or personal documents.
          </li>
          <li>
            <b>What your Professional tells us about your job:</b> notes from the visit, any parts or extra work they propose,
            certificates and their results, and anything that went wrong on the day.
          </li>
          <li>
            <b>Messages and calls:</b> emails, WhatsApp messages, notes from calls with you, and recordings of calls on our phone
            lines (section 6).
          </li>
          <li>
            <b>Our website:</b> with your consent, cookies and similar tools, listed in our <Link to="/cookies">cookie policy</Link>.
            Vercel Web Analytics counts page views without cookies, and our website host processes your IP address to keep the site
            secure. If you arrived from one of our ads, the campaign name in that link (its UTM tags) goes with your booking, so we
            know which ads bring bookings; nothing is stored on your device for this. With your consent to analytics, we also keep
            the page that brought you and the site that referred you.
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
          Some messages on WhatsApp and email are first answered by an AI assistant that works for our team. A person can take
          over at any time: just ask.
        </p>
      </section>

      <section id="share">
        <h2>4. Who we share it with</h2>
        <ul>
          <li>
            <b>Your Professional:</b> the details they need to do your job (section 5). If your Professional changes, the new
            Professional receives the same details.
          </li>
          <li>
            <b>Your letting agent, landlord or concierge,</b> when you ask us to collect keys from them or to send them your report.
          </li>
          <li>
            <b>Service providers who work for us under contract:</b> Stripe (card payments), our bank (bank transfers), Vercel and
            Railway (hosting our website and booking system), Mapbox (address search while you type), Resend (emails), Zendesk
            (customer support and our phone lines, including call recordings), Google Workspace (email), respond.io and WhatsApp
            (messages) and OpenAI (tools that help our team read, route and answer messages).
          </li>
          <li>
            <b>Only with your consent:</b> Meta (the Pixel, and your booking value with a scrambled copy of your email and phone
            sent from our server), Google Analytics and Tag Manager, Microsoft Clarity, and Zoho (PageSense and the SalesIQ chat).
          </li>
          <li>
            <b>When the law requires it or to deal with a claim:</b> authorities, insurers (including your Professional&rsquo;s
            insurer, if you make a damage claim), legal advisers or courts. If we sell our business, the buyer, under the same
            protections.
          </li>
        </ul>
      </section>

      <section id="professional">
        <h2>5. Your Professional</h2>
        <p>
          <b>5.1</b> We give your Professional your name, the property address, your phone number, how to get in and the job
          notes. We pass on a key safe code or other access details only to the Professional doing your job, shortly before the
          visit.
        </p>
        <p>
          <b>5.2</b> Your Professional uses this information as an independent controller. They may use it only to do your job,
          to contact you about it, to deal with guarantee visits or damage claims, and to meet their own legal duties. For
          example, a gas engineer keeps a record of the gas safety check, and an energy assessor lodges the EPC on the national
          register.
        </p>
        <p>
          <b>5.3</b> Our agreement with every Professional requires them to keep your information safe, to use it only for these
          purposes and not to use it to market to you.
        </p>
        <p>
          <b>5.4</b> If you have a question about how your Professional uses your information, contact them through us at{' '}
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> and we pass it on.
        </p>
      </section>

      <section id="calls">
        <h2>6. Call recording</h2>
        <p>
          <b>6.1</b> Calls to and from Fixfy&rsquo;s phone lines are recorded. We tell you at the start of the call.
        </p>
        <p>
          <b>6.2</b> We use recordings to keep an accurate record of bookings and what was agreed, to train our team, and to
          resolve complaints and claims. Zendesk stores them for us.
        </p>
        <p>
          <b>6.3</b> If you prefer not to be recorded, email us or message us on WhatsApp instead.
        </p>
      </section>

      <section id="transfers">
        <h2>7. Outside the UK</h2>
        <p>
          Some of our providers store or access data outside the UK, mainly in the United States. When they do, we rely on the
          UK&rsquo;s adequacy regulations, including the UK-US data bridge, or on the International Data Transfer Agreement or
          Addendum approved by the Information Commissioner&rsquo;s Office.
        </p>
      </section>

      <section id="keep">
        <h2>8. How long we keep it</h2>
        <ul>
          <li>
            <b>Bookings, payments, messages and photo reports:</b> 6 years after the job, the time limit for tax records and for
            most legal claims.
          </li>
          <li>
            <b>Call recordings:</b> 12 months, unless we need a recording for a complaint or a claim. Then we keep it until that
            is resolved.
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
        <p>
          Your Professional keeps the information they receive for as long as they need it for your job and for their own legal
          duties, such as tax and certificate records.
        </p>
      </section>

      <section id="rights">
        <h2>9. Your rights</h2>
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
          example, we have to keep tax records. If your request is about information your Professional holds, we pass it to them,
          or you can contact them through us.
        </p>
        <p>
          If you are unhappy with how we handle your data, you can complain to the Information Commissioner&rsquo;s Office at{' '}
          <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noreferrer">
            ico.org.uk/make-a-complaint
          </a>{' '}
          or on 0303 123 1113. We would appreciate the chance to put it right first.
        </p>
      </section>

      <section id="safe">
        <h2>10. Keeping it safe</h2>
        <p>
          Only the people who need your information to do their job can see it, and it travels encrypted between your browser, our
          systems and our providers. Key safe codes and access details go only to the Professional doing your job. Our services
          are for adults, and we do not knowingly collect information about children.
        </p>
      </section>

      <section id="changes">
        <h2>11. Changes to this notice</h2>
        <p>
          We update this notice when we change what we do with your information. The version at the top of the page is the latest.
          Bookings are covered by our booking terms at <Link to="/terms">getfixfy.com/terms</Link>.
        </p>
      </section>
    </LegalShell>
  )
}
