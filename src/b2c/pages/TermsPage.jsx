import { Link } from 'react-router-dom'
import { ScrollText } from 'lucide-react'
import LegalShell from '../components/LegalShell.jsx'
import { COMPANY, COVERED_AREAS, PROMISES, TERMS } from '../content/site.js'
import { FIX, PAINT, formatGBP } from '../content/pricing.js'
import { usePageMeta } from '../lib/meta.js'

const CANCEL = PROMISES.freeCancellationHours
const RECLEAN = PROMISES.recleanDays.value
const HALF_DAY = FIX.packages.find((p) => p.id === 'half')
const FULL_DAY = FIX.packages.find((p) => p.id === 'day')
const AREAS = `${COVERED_AREAS.slice(0, -1).join(', ')} and ${COVERED_AREAS[COVERED_AREAS.length - 1]}`

const TOC = [
  { id: 'who', label: '1. Who we are' },
  { id: 'booking', label: '2. Your booking' },
  { id: 'price', label: '3. Prices and payment' },
  { id: 'team', label: '4. Who does the work' },
  { id: 'day', label: '5. On the day' },
  { id: 'services', label: '6. The services' },
  { id: 'not-right', label: '7. If something is not right' },
  { id: 'changes', label: '8. Changing or cancelling' },
  { id: 'right-to-cancel', label: '9. Your legal right to cancel' },
  { id: 'our-changes', label: '10. If we need to change' },
  { id: 'liability', label: '11. Loss or damage' },
  { id: 'complaints', label: '12. Complaints' },
  { id: 'data', label: '13. Your information' },
  { id: 'other', label: '14. Other terms' },
]

export default function TermsPage() {
  usePageMeta({
    title: 'Booking terms | Fixfy',
    description: 'The terms for cleaning, painting, repairs and certificates booked and paid for on getfixfy.com.',
    path: '/terms',
  })

  return (
    <LegalShell
      icon={ScrollText}
      eyebrow="Booking terms"
      title="Booking terms"
      lede="The terms for jobs you book and pay for on getfixfy.com, in plain English. They do not affect your legal rights as a consumer."
      version={`Version of ${TERMS.version}`}
      toc={TOC}
    >
      <section id="who">
        <h2>1. Who we are</h2>
        <p>
          We are {COMPANY.legalName}, trading as Fixfy, a company registered in England and Wales with company number{' '}
          {COMPANY.companyNumber}. Our registered office is {COMPANY.address}, and our VAT number is {COMPANY.vatNumber}.
        </p>
        <p>
          You can reach us at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. We reply within {TERMS.replyWorkingDays}{' '}
          working days.
        </p>
        <p>
          These terms apply to everyone who books on getfixfy.com. Where a part applies only to consumers, meaning people booking
          for themselves and not for a business, we say so. Letting agents and other businesses can also ask us for a business
          account, which has its own agreement.
        </p>
      </section>

      <section id="booking">
        <h2>2. Your booking</h2>
        <p>
          <b>2.1</b> You choose the services, the size of the property, the day and the arrival window, and pay in full. Our contract
          starts when your payment goes through and we email your booking confirmation.
        </p>
        <p>
          <b>2.2</b> We do what your booking summary shows: the services, extras and sizes you picked. Check it before you pay, and
          keep the confirmation email. It has your booking reference and a link to these terms.
        </p>
        <p>
          <b>2.3</b> Our prices depend on the number of bedrooms and bathrooms and on what you pick. If the property is bigger than
          booked, or there is more work than booked, the team tells you before starting and you choose: pay the difference at the
          prices on our website, or we do what your booking covers.
        </p>
        <p>
          <b>2.4</b> We work across London, in the {AREAS} postcode areas, Monday to Saturday. If we cannot take a booking, for
          example because the address is outside our area, we refund you in full.
        </p>
      </section>

      <section id="price">
        <h2>3. Prices and payment</h2>
        <p>
          <b>3.1</b> Our prices are fixed and include VAT. You pay the full price when you book, by card or another method shown at
          checkout. Payments are handled by Stripe, and we never see your card details. If you pay with Klarna, Klarna&rsquo;s own
          terms apply to that credit.
        </p>
        <p>
          <b>3.2</b> Parts and materials are not included unless your booking says so, for example the paint and materials pack. If
          a job needs anything else, such as a replacement part for a repair, the team tells you what it is and what it costs before
          buying it. You only pay for what you approve, at the price we paid plus {TERMS.partsMarkupPercent}% for sourcing it. We list
          it in your photo report and send you a secure payment link.
        </p>
        <p>
          <b>3.3</b> If a price on our website is obviously wrong, we will tell you, and you can go ahead at the right price or
          cancel for a full refund.
        </p>
        <p>
          <b>3.4</b> Refunds go back to the way you paid, within 14 days of us agreeing the refund.
        </p>
      </section>

      <section id="team">
        <h2>4. Who does the work</h2>
        <p>
          <b>4.1</b> Your job is done by vetted independent professionals who work with Fixfy: cleaning teams, painters, handymen and
          registered engineers. Your contract is with {COMPANY.legalName}, and we are responsible for the work under these terms.
        </p>
        <p>
          <b>4.2</b> Gas safety checks are done by Gas Safe registered engineers, and electrical reports by NICEIC or NAPIT registered
          electricians. Certificates are issued in the engineer&rsquo;s name and registration number.
        </p>
      </section>

      <section id="day">
        <h2>5. On the day</h2>
        <p>
          <b>5.1</b> The team arrives within the arrival window you picked. We call or message you the day before to confirm the team
          and how we get in. If we are running late, we tell you as soon as we know.
        </p>
        <p>
          <b>5.2</b> You choose how we get in: you or someone you trust is there, keys with your letting agent (you authorise us to
          collect and return them), a key safe (we ask for the code the day before), or a concierge or porter.
        </p>
        <p>
          <b>5.3</b> We need the electricity and hot water on (and the gas, for a gas safety check), access to every room and
          appliance in your booking, and a safe place to work. For an end of tenancy clean, the property should be empty. Tell us in
          the booking notes about anything we should know, such as parking, alarms or pets.
        </p>
        <p>
          <b>5.4</b> If the team cannot get in within {TERMS.noAccessMinutes} minutes of the start of your arrival window and we
          cannot reach you, the visit counts as a late cancellation (section 8.2).
        </p>
        <p>
          <b>5.5</b> If the property needs much more than the service booked, for example heavy mould, hoarding or rubbish to clear,
          the team tells you before starting and we agree the price or the scope with you. Rubbish removal is not included unless you
          add it.
        </p>
        <p>
          <b>5.6</b> Our teams can stop work if a property is unsafe, for example exposed wiring, hazardous waste or an aggressive
          animal. We explain why and agree the next step with you. If we could not finish because of something you did not know
          about, we refund the part we could not do.
        </p>
      </section>

      <section id="services">
        <h2>6. The services</h2>
        <p>
          <b>6.1 End of tenancy clean.</b> An empty property cleaned to our room-by-room checklist, oven included. Extras you add,
          such as carpets, the fridge freezer, outside windows or a balcony, are done as described when you book.
        </p>
        <p>
          <b>6.2 Deep clean.</b> The same checklist for a home you live in: we work around your furniture and belongings. Clear the
          worktops and surfaces you want cleaned, and empty any cupboards you want done inside.
        </p>
        <p>
          <b>6.3 Painting.</b> Touch-ups, or a full repaint of walls in two coats, priced per room. Paint and materials are included
          only if you add the materials pack ({formatGBP(PAINT.materials.price)}), or you can leave paint on site for us to use.
          Fresh paint needs a few days to cure, so avoid marking the walls straight away.
        </p>
        <p>
          <b>6.4 Repairs.</b> A half day ({HALF_DAY.detail.toLowerCase()}) or a full day ({FULL_DAY.detail.toLowerCase()}) of a
          handyman&rsquo;s time for the tasks you list. If they take longer than the time booked, we tell you, and you can add time
          or leave the rest.
        </p>
        <p>
          <b>6.5 Certificates.</b> Gas safety record (CP12), electrical installation condition report (EICR) and portable appliance
          testing (PAT). The price covers the check, not repairs. If something fails, you get the reason and a fixed price to put it
          right. Nothing is done until you say yes, and you are free to use someone else.
        </p>
        <p>
          <b>6.6 Photo report.</b> When the work is done, the team photographs every room they worked on, and we send you the report
          the same day. It is yours to keep and to share.
        </p>
      </section>

      <section id="not-right">
        <h2>7. If something is not right</h2>
        <p>
          <b>7.1</b> We do the work with reasonable care and skill. If something is not right, tell us as soon as you can, with
          photos, and we come back to put it right at no cost. If that is not possible, or would take too long or cause you real
          inconvenience, you are entitled to a price reduction or a refund for the part that was not right.
        </p>
        <p>
          <b>7.2 Free re-clean (end of tenancy clean only).</b> If your letting agent or landlord flags anything on our checklist
          within {RECLEAN} days of the clean, send us their note or a photo and we come back to put it right at no cost. The property
          needs to be empty and unchanged since we cleaned it.
        </p>
        <p>
          <b>7.3</b> Decisions on deposits sit with your landlord, your letting agent and the deposit scheme. We cannot guarantee you
          get your deposit back, but the photo report is yours to use as evidence.
        </p>
        <p>
          <b>7.4</b> Nothing in these terms affects your legal rights. Citizens Advice can tell you more about them.
        </p>
      </section>

      <section id="changes">
        <h2>8. Changing or cancelling your booking</h2>
        <p>
          <b>8.1</b> You can change the day or the arrival window, or cancel, for free up to {CANCEL} hours before the start of your
          arrival window. If you cancel, we refund you in full.
        </p>
        <p>
          <b>8.2</b> If you cancel less than {CANCEL} hours before the start of your arrival window, or we cannot get in (section
          5.4), we keep {TERMS.lateCancellationPercent}% of the price of the services cancelled, to cover the team we had booked for
          you. This does not apply while you are still within your legal cancellation period and the work has not started (section
          9): then you get a full refund.
        </p>
        <p>
          <b>8.3</b> Within {CANCEL} hours we still try to move your booking. If we cannot find a time that suits you, you can keep
          your booking or cancel under section 8.2.
        </p>
        <p>
          <b>8.4</b> To change or cancel, email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> with your booking reference,
          or reply to your confirmation email.
        </p>
      </section>

      <section id="right-to-cancel">
        <h2>9. Your legal right to cancel (consumers)</h2>
        <p>
          <b>9.1</b> As a consumer, you can cancel your booking within 14 days of the day we confirm it, without giving a reason.
        </p>
        <p>
          <b>9.2</b> Most jobs happen inside those 14 days. When you tick the box at checkout, you ask us to do the work on the day
          you picked, even if it falls within the 14 days. Then:
        </p>
        <ul>
          <li>if you cancel before the work starts, we refund you in full;</li>
          <li>if you cancel after the work has started, you pay for the part we did up to when you told us, and we refund the rest;</li>
          <li>once the work is fully done, you can no longer cancel it under this right. Your rights in section 7 still apply.</li>
        </ul>
        <p>
          <b>9.3</b> To cancel, tell us clearly: email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>, reply to your
          confirmation email, or send the form below. You meet the deadline if you send it before the 14 days end. We refund you
          within 14 days of hearing from you, the same way you paid.
        </p>
        <div className="mo-doc-box">
          <p>
            <b>Model cancellation form</b>
          </p>
          <p>
            To: {COMPANY.legalName}, {COMPANY.address}, {COMPANY.email}
          </p>
          <p>I hereby give notice that I cancel my contract for the supply of the following service:</p>
          <p>Booking reference and service: ________________</p>
          <p>Booked on: ________________</p>
          <p>Name: ________________</p>
          <p>Address: ________________</p>
          <p>Signature (only if you send this on paper): ________________</p>
          <p>Date: ________________</p>
        </div>
      </section>

      <section id="our-changes">
        <h2>10. If we need to change or cancel</h2>
        <p>
          <b>10.1</b> We may need to move a booking because of something outside our control, such as illness, severe weather or
          transport disruption. We tell you as soon as we can and offer another date. If none suits you, we refund you in full.
        </p>
        <p>
          <b>10.2</b> We may cancel a booking if we cannot do the work safely or legally, or if we reasonably believe it is
          fraudulent. We refund you in full for any work not done.
        </p>
      </section>

      <section id="liability">
        <h2>11. Our responsibility for loss or damage</h2>
        <p>
          <b>11.1</b> If we break these terms, we are responsible for loss or damage you suffer that is a foreseeable result of our
          breach or of our failure to use reasonable care and skill. We are not responsible for loss or damage that is not
          foreseeable.
        </p>
        <p>
          <b>11.2</b> If we damage your property while doing the work, tell us as soon as you can, with photos. We repair it or pay a
          fair amount for the repair.
        </p>
        <p>
          <b>11.3</b> We are not responsible for damage that was there before we started, normal wear and tear, fittings or
          appliances that fail during normal careful work because they were already worn or faulty, or loss caused by something you
          knew about and did not tell us, such as a hidden pipe.
        </p>
        <p>
          <b>11.4</b> We do not exclude or limit our liability for death or personal injury caused by our negligence, for fraud, or
          for anything else the law does not allow us to exclude, including your rights as a consumer.
        </p>
      </section>

      <section id="complaints">
        <h2>12. Complaints</h2>
        <p>
          If you are not happy, email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> with your booking reference. We reply
          within {TERMS.replyWorkingDays} working days and aim to resolve it within {TERMS.resolveDays} days.
        </p>
      </section>

      <section id="data">
        <h2>13. Your information</h2>
        <p>
          We use your personal information as our <Link to="/privacy">privacy policy</Link> explains. Our{' '}
          <Link to="/cookies">cookie policy</Link> covers cookies on our website.
        </p>
      </section>

      <section id="other">
        <h2>14. Other terms</h2>
        <p>
          <b>14.1</b> We may update these terms. The version that applies to your booking is the one on our website when you booked,
          and we can send it to you on request.
        </p>
        <p>
          <b>14.2</b> We may transfer our rights and obligations under these terms to another organisation without affecting your
          rights. You can transfer yours only with our agreement.
        </p>
        <p>
          <b>14.3</b> Nobody else has rights under this contract.
        </p>
        <p>
          <b>14.4</b> If a court finds part of these terms unlawful, the rest stays in force.
        </p>
        <p>
          <b>14.5</b> These terms are governed by the law of England and Wales. If you live in Scotland or Northern Ireland, you can
          also bring proceedings in your local courts.
        </p>
      </section>
    </LegalShell>
  )
}
