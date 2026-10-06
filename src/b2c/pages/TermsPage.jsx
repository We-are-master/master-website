import { Link } from 'react-router-dom'
import { ScrollText } from 'lucide-react'
import LegalShell from '../components/LegalShell.jsx'
import { COMPANY, COVERED_AREAS, GUARANTEE, PROMISES, TERMS } from '../content/site.js'
import { FIX, PAINT, formatGBP } from '../content/pricing.js'
import { usePageMeta } from '../lib/meta.js'

const CANCEL = PROMISES.freeCancellationHours
const RECLEAN = PROMISES.recleanDays.value
const DAYS = GUARANTEE.standardDays
const HALF_DAY = FIX.packages.find((p) => p.id === 'half')
const FULL_DAY = FIX.packages.find((p) => p.id === 'day')
const AREAS = `${COVERED_AREAS.slice(0, -1).join(', ')} and ${COVERED_AREAS[COVERED_AREAS.length - 1]}`
const OFFICE = '124 City Road, London EC1V 2NX'

const TOC = [
  { id: 'who', label: '1. Who we are and how Fixfy works' },
  { id: 'responsibilities', label: '2. Who is responsible for what' },
  { id: 'professional', label: '3. Your Professional' },
  { id: 'booking', label: '4. Your booking' },
  { id: 'price', label: '5. Prices and payment' },
  { id: 'day', label: '6. On the day' },
  { id: 'services', label: '7. The services' },
  { id: 'not-right', label: '8. If something is not right' },
  { id: 'changes', label: '9. Changing or cancelling' },
  { id: 'right-to-cancel', label: '10. Your legal right to cancel' },
  { id: 'our-changes', label: '11. If your Professional or Fixfy needs to change' },
  { id: 'liability', label: '12. Loss or damage' },
  { id: 'complaints', label: '13. Complaints' },
  { id: 'data', label: '14. Your information' },
  { id: 'other', label: '15. Other terms' },
]

/**
 * Termos da reserva no modelo de agente (06/10/2026): o contrato do serviço é
 * entre o cliente e o profissional independente; a Fixfy é agente declarada
 * dele e recebe o pagamento em nome dele. Texto do documento 01-customer-terms
 * (pasta "Fixfy - documentos agente 2026-10-06"), sem mudar uma vírgula: os
 * números saem de site.js e pricing.js quando dão o mesmo texto.
 */
export default function TermsPage() {
  usePageMeta({
    title: 'Booking terms | Fixfy',
    description: 'The terms for jobs booked on getfixfy.com and carried out by independent professionals, with Fixfy as their agent.',
    path: '/terms',
  })

  return (
    <LegalShell
      icon={ScrollText}
      eyebrow="Booking terms"
      title="Booking terms"
      lede="The terms for jobs you book on getfixfy.com, in plain English. They do not affect your legal rights as a consumer."
      version={`Version of ${TERMS.version}`}
      toc={TOC}
    >
      <p>
        These terms replace the terms dated {TERMS.replaces} for bookings made from {TERMS.version}. Bookings made before{' '}
        {TERMS.version} stay under the terms accepted at the time.
      </p>
      <div className="mo-doc-box">
        <p>
          <b>In short</b>
        </p>
        <ul>
          <li>Fixfy runs an online platform. We do not carry out the services ourselves, and we do not buy or resell them.</li>
          <li>Your job is done by an independent, vetted professional. Your contract for the work is with them.</li>
          <li>We arrange the booking and take your payment as the professional&rsquo;s agent. Paying us counts as paying them.</li>
          <li>
            We tell you who your professional is, and that they are a trader, in your booking confirmation and on your receipt,
            before the visit.
          </li>
          <li>
            Your consumer rights for the work are against the professional. If anything goes wrong, contact us first and we help
            put it right.
          </li>
        </ul>
      </div>

      <section id="who">
        <h2>1. Who we are and how Fixfy works</h2>
        <p>
          <b>1.1</b> We are {COMPANY.legalName}, trading as Fixfy, a company registered in England and Wales with company number{' '}
          {COMPANY.companyNumber}. Our registered office is {OFFICE}, and our VAT number is {COMPANY.vatNumber}. In these terms,
          &quot;Fixfy&quot;, &quot;we&quot;, &quot;us&quot; and &quot;our&quot; mean {COMPANY.legalName}.
        </p>
        <p>
          <b>1.2</b> You can reach us at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. We reply within{' '}
          {TERMS.replyWorkingDays} working days.
        </p>
        <p>
          <b>1.3</b> Fixfy runs an online platform: the website getfixfy.com and the phone, email and WhatsApp channels that go
          with it. Through it you can book cleaning, painting, repairs and landlord certificates. We do not carry out these
          services ourselves.
        </p>
        <p>
          <b>1.4</b> Every service is carried out by an independent, vetted professional (the &quot;Professional&quot;). A
          Professional is a self-employed person or a business, together with anyone who works for them on your job.
          Professionals are not employed by Fixfy.
        </p>
        <p>
          <b>1.5</b> For every booking, the contract for the service is between you and the Professional. Fixfy acts as the
          Professional&rsquo;s disclosed agent to arrange the booking, and as their limited payment collection agent. When you
          pay Fixfy, your obligation to pay the Professional for that amount is discharged.
        </p>
        <p>
          <b>1.6</b> Fixfy arranges the service for the Professional. We do not trade on our own account: we do not buy the
          service from the Professional or resell it to you, and we do not change the nature or the value of the
          Professional&rsquo;s service. The price is the Professional&rsquo;s price.
        </p>
        <p>
          <b>1.7</b> You also have a contract with Fixfy for our platform service: taking your booking, finding and confirming
          your Professional, handling your payment and refunds, passing messages between you and the Professional, and helping if
          something goes wrong. You pay nothing for it (section 5.3).
        </p>
        <p>
          <b>1.8</b> These terms set out both the terms of your contract with the Professional, which we agree on their behalf,
          and the terms of our platform service. Where a part applies only to consumers, meaning people booking for themselves
          and not for a business, we say so. Letting agents and other businesses can also ask us for a business account, which
          has its own agreement.
        </p>
      </section>

      <section id="responsibilities">
        <h2>2. Who is responsible for what</h2>
        <p>
          <b>2.1 Your Professional is responsible for:</b>
        </p>
        <ul>
          <li>doing the work with reasonable care and skill, as described in your booking;</li>
          <li>the price of the service, which they agree to when they accept your booking;</li>
          <li>putting things right, including the {DAYS}-day guarantee (section 8);</li>
          <li>any damage they cause while doing the work, backed by their public liability insurance (section 12);</li>
          <li>certificates, which the engineer or assessor issues in their own name and registration.</li>
        </ul>
        <p>
          <b>2.2 Fixfy is responsible for:</b>
        </p>
        <ul>
          <li>our website and booking system, and the information we give you about how booking works;</li>
          <li>taking your booking, confirming your Professional and sending your confirmation and reminders;</li>
          <li>collecting your payment and processing refunds, on the Professional&rsquo;s behalf;</li>
          <li>passing messages between you and your Professional;</li>
          <li>being your first point of contact for complaints, and arranging guarantee visits.</li>
        </ul>
        <p>
          <b>2.3 Your statutory rights.</b> Your Professional has declared to us that they are a trader, meaning they offer their
          services as a business. Your rights under the Consumer Rights Act 2015 for the service, including the right to have it
          done with reasonable care and skill, are against the Professional as the trader. They are not against Fixfy, which is
          the online platform that arranged the booking. Fixfy is responsible for its own platform service (section 12.5), and we
          will help you resolve any problem with the work.
        </p>
      </section>

      <section id="professional">
        <h2>3. Your Professional</h2>
        <p>
          <b>3.1</b> Before a Professional can take bookings on Fixfy, we check their identity and their public liability
          insurance, which must be at least £1 million. For gas, electrical and energy work we also check their registration or
          accreditation.
        </p>
        <p>
          <b>3.2</b> We offer your booking to Professionals who do that kind of work in your area and are free on your day. Among
          them, we take into account their skills, their ratings and their reliability.
        </p>
        <p>
          <b>3.3</b> We tell you your Professional&rsquo;s name or trading name and their business address, and confirm that they
          are a trader, in your booking confirmation and on your receipt, before the visit. If they are VAT registered, your
          receipt also shows their VAT number.
        </p>
        <p>
          <b>3.4</b> You can contact your Professional through our channels: reply to any of our emails, message us on WhatsApp or
          call us, and we pass it on. Your Professional, or we on their behalf, may also call or message you about the visit.
        </p>
        <p>
          <b>3.5</b> If your Professional cannot do the job, for example because of illness, we may arrange another vetted
          Professional at the same price and on the same terms. We tell you their name before the visit. Your contract for the
          service is then with the new Professional. If you do not want the change, you can cancel and we refund you in full.
        </p>
        <p>
          <b>3.6</b> Gas safety checks are done by Gas Safe registered engineers, electrical reports by NICEIC or NAPIT registered
          electricians, and energy performance certificates by accredited assessors. Certificates are issued by the qualified
          engineer or assessor in their own name and registration number.
        </p>
        <p>
          <b>3.7</b> You pay for your booking only through Fixfy (section 5). Your Professional should never ask you to pay them
          directly or in cash. If they do, please tell us.
        </p>
      </section>

      <section id="booking">
        <h2>4. Your booking</h2>
        <p>
          <b>4.1</b> You choose the services, the size of the property, the day and the arrival window. You pay in full or, where
          we offer it, a 50% deposit (section 5.7).
        </p>
        <p>
          <b>4.2</b> When your payment goes through, we email you to say we have your booking, and we offer it to Professionals.
        </p>
        <p>
          <b>4.3</b> Your contract for the service is made when a Professional accepts your booking and we send you your booking
          confirmation naming them. If we cannot confirm a Professional for your day, we offer you another day. If none suits
          you, we refund you in full.
        </p>
        <p>
          <b>4.4</b> Your Professional does what your booking summary shows: the services, extras and sizes you picked. Check it
          before you pay, and keep your confirmation. It has your booking reference, your Professional&rsquo;s name and a link to
          these terms.
        </p>
        <p>
          <b>4.5</b> Prices depend on the number of bedrooms and bathrooms and on what you pick. If the property is bigger than
          booked, or there is more work than booked, your Professional tells you before starting and you choose: pay the
          difference at the prices on our website, or they do what your booking covers.
        </p>
        <p>
          <b>4.6</b> You can book across London, in the {AREAS} postcode areas, Monday to Saturday. If a booking cannot go ahead,
          for example because the address is outside these areas, we refund you in full.
        </p>
      </section>

      <section id="price">
        <h2>5. Prices and payment</h2>
        <p>
          <b>5.1</b> Fixfy publishes the price list and gives quotes on behalf of the Professionals. A Professional who accepts
          your booking agrees to do the work at that price. The prices you see are the Professional&rsquo;s prices, and they are
          fixed. Fixfy does not add anything to them.
        </p>
        <p>
          <b>5.2</b> No VAT is added to the Professional&rsquo;s price unless the Professional is VAT registered. If they are,
          their VAT is already included in the price you see at checkout, and your receipt shows the VAT amount and their VAT
          number. If they are not, your receipt says that no VAT is charged. Either way, the price at checkout is the total you
          pay, whichever Professional is confirmed.
        </p>
        <p>
          <b>5.3</b> Fixfy&rsquo;s income is a commission that the Professional pays us. You pay no Fixfy fee, and our commission
          never appears as a charge to you. If we offer you a discount or a promotion code, Fixfy pays that amount to the
          Professional on your behalf. The Professional&rsquo;s price stays the same, and your receipt shows the promotion as a
          separate line.
        </p>
        <p>
          <b>5.4</b> How to pay. You can pay:
        </p>
        <ul>
          <li>
            by card, or another method shown at checkout, through Stripe. We never see your card details. If you pay with Klarna,
            Klarna&rsquo;s own terms apply to that credit;
          </li>
          <li>
            by bank transfer to {COMPANY.legalName}, where we offer it. We send you the account details and a reference. We hold
            your slot for 24 hours, and your booking goes ahead when the payment reaches us.
          </li>
        </ul>
        <p>
          <b>5.5</b> However you pay, Fixfy receives the payment as the Professional&rsquo;s limited payment collection agent.
          Paying Fixfy discharges your obligation to pay the Professional for that amount. We pay the Professional after the job,
          less the commission they owe us.
        </p>
        <p>
          <b>5.6</b> Until a Professional accepts your booking, we hold your payment for the Professional who will do the job. If
          no Professional is confirmed, we refund you in full.
        </p>
        <p>
          <b>5.7</b> Deposits. Where we offer it, you can pay a 50% deposit when you book. The balance is due when the work is
          done: we send you a secure payment link with your photo report.
        </p>
        <p>
          <b>5.8</b> Parts and materials. Anything your booking includes, such as the paint and materials pack, is supplied by
          your Professional as part of their service, at the listed price. If a job needs anything else, such as a replacement
          part for a repair, your Professional tells you what it is and what it costs before buying it. It is only supplied with
          your approval, at the price agreed with you. We list it in your photo report and send you a secure payment link.
        </p>
        <p>
          <b>5.9</b> If a price on our website is obviously wrong, we tell you, and you can go ahead at the right price or cancel
          for a full refund.
        </p>
        <p>
          <b>5.10</b> Refunds are processed by Fixfy on the Professional&rsquo;s behalf. They go back to the way you paid, within
          14 days of the refund being agreed.
        </p>
        <p>
          <b>5.11</b> Your receipt is issued in your Professional&rsquo;s name, by {COMPANY.legalName} (Fixfy) as their agent. It
          shows their name and business address, the services at their price, any Fixfy promotion as a separate line, and that we
          received your payment as their agent. It shows VAT only if your Professional is VAT registered. It never shows Fixfy
          VAT.
        </p>
      </section>

      <section id="day">
        <h2>6. On the day</h2>
        <p>
          <b>6.1</b> Your Professional arrives within the arrival window you picked. We call or message you the day before to
          confirm your Professional and how they get in. If they are running late, we or they tell you as soon as we know.
        </p>
        <p>
          <b>6.2</b> You choose how your Professional gets in: you or someone you trust is there; keys with your letting agent (you
          authorise your Professional, and us on their behalf, to collect and return them); a key safe (we ask for the code the
          day before and pass it only to your Professional); or a concierge or porter.
        </p>
        <p>
          <b>6.3</b> Your Professional needs the electricity and hot water on (and the gas, for a gas safety check), access to
          every room and appliance in your booking, and a safe place to work. For an end of tenancy clean, the property should be
          empty. Tell us in the booking notes about anything they should know, such as parking, alarms or pets.
        </p>
        <p>
          <b>6.4</b> If your Professional cannot get in within {TERMS.noAccessMinutes} minutes of the start of your arrival window
          and we cannot reach you, the visit counts as a late cancellation (section 9.3).
        </p>
        <p>
          <b>6.5</b> If the property needs much more than the service booked, for example heavy mould, hoarding or rubbish to
          clear, your Professional tells you before starting, and the price or the scope is agreed with you through us. Rubbish
          removal is not included unless you add it.
        </p>
        <p>
          <b>6.6</b> Your Professional can stop work if the property is unsafe, for example because of exposed wiring, hazardous
          waste or an aggressive animal. We explain why and agree the next step with you. If the work could not be finished
          because of something you did not know about, we refund the part that could not be done.
        </p>
      </section>

      <section id="services">
        <h2>7. The services</h2>
        <p>
          <b>7.1 End of tenancy clean.</b> An empty property cleaned to the Fixfy room-by-room checklist, oven included. Extras
          you add, such as carpets, the fridge freezer, outside windows or a balcony, are done as described when you book.
        </p>
        <p>
          <b>7.2 Deep clean.</b> The same checklist for a home you live in: your cleaner works around your furniture and
          belongings. Clear the worktops and surfaces you want cleaned, and empty any cupboards you want done inside.
        </p>
        <p>
          <b>7.3 Painting.</b> Touch-ups, or a full repaint of walls in two coats, priced per room. Paint and materials are
          included only if you add the paint and materials pack ({formatGBP(PAINT.materials.price)}), which your Professional
          supplies. Or you can leave paint on site for them to use. Fresh paint needs a few days to cure, so avoid marking the
          walls straight away.
        </p>
        <p>
          <b>7.4 Repairs.</b> A half day ({HALF_DAY.detail.toLowerCase()}) or a full day ({FULL_DAY.detail.toLowerCase()}) of a
          handyman&rsquo;s time for the tasks you list. If the tasks take longer than the time booked, your Professional tells
          you, and you can add time or leave the rest.
        </p>
        <p>
          <b>7.5 Certificates.</b> Gas safety record (CP12), electrical installation condition report (EICR) and energy
          performance certificate (EPC). The price covers the check or the assessment, not repairs or improvement works. If
          something fails, you get the reason and a fixed price to put it right. Nothing is done until you say yes, and you are
          free to use someone else.
        </p>
        <p>
          <b>7.6 Photo report.</b> When the work is done, your Professional photographs every room they worked on, and we send you
          the report the same day. It is yours to keep and to share.
        </p>
      </section>

      <section id="not-right">
        <h2>8. If something is not right</h2>
        <p>
          <b>8.1</b> Your Professional must do the work with reasonable care and skill. If something is not right, tell us as soon
          as you can, with photos. We arrange for your Professional to come back and put it right at no cost. If that is not
          possible, or would take too long or cause you real inconvenience, you are entitled to a price reduction or a refund for
          the part that was not right, which we process on the Professional&rsquo;s behalf.
        </p>
        <p>
          <b>8.2 The guarantee.</b> Every job comes with a guarantee from your Professional for {DAYS} days from the day the work
          is completed. For longer-lasting work the guarantee is longer: painting and decorating 3 months, tiling 3 months, wall
          treatments 6 months, and woodwork or structural work 6 months. If you report a problem with the work within the
          guarantee period, they come back and put it right at no extra cost, and we arrange the visit. If they cannot, we may
          arrange another vetted professional, or refund you on their behalf. What it covers and how to claim are on our
          guarantee page at <Link to="/guarantee">getfixfy.com/guarantee</Link>.
        </p>
        <p>
          <b>8.3 Free re-clean (end of tenancy clean only).</b> If your letting agent or landlord flags anything on the Fixfy
          checklist within {RECLEAN} days of the clean, send us their note or a photo and we arrange for your cleaner to come back
          and put it right at no cost. The property needs to be empty and unchanged since the clean.
        </p>
        <p>
          <b>8.4</b> Decisions on deposits sit with your landlord, your letting agent and the deposit scheme. Nobody can guarantee
          you get your deposit back, but the photo report is yours to use as evidence.
        </p>
        <p>
          <b>8.5</b> Nothing in these terms affects your legal rights.{' '}
          <a href="https://www.citizensadvice.org.uk/consumer/" target="_blank" rel="noreferrer">
            Citizens Advice
          </a>{' '}
          can tell you more about them.
        </p>
      </section>

      <section id="changes">
        <h2>9. Changing or cancelling your booking</h2>
        <p>
          <b>9.1</b> You can change the day or the arrival window, or cancel, for free up to {CANCEL} hours before the start of
          your arrival window. If you cancel, we refund you in full.
        </p>
        <p>
          <b>9.2</b> If no Professional has been confirmed for your booking when you cancel, cancelling is free whatever the
          timing, and we refund you in full.
        </p>
        <p>
          <b>9.3</b> If you cancel less than {CANCEL} hours before the start of your arrival window, or your Professional cannot
          get in (section 6.4), a cancellation charge of {TERMS.lateCancellationPercent}% of the price of the services cancelled
          is due to your Professional. It is a call-out for the time they kept for you. The whole charge goes to your
          Professional: Fixfy collects it on their behalf from what you paid, keeps none of it, and refunds you the rest. This
          charge does not apply while you are still within your legal cancellation period and the work has not started (section
          10): then you get a full refund.
        </p>
        <p>
          <b>9.4</b> Within {CANCEL} hours we still try to move your booking. If we cannot find a time that suits you and your
          Professional, you can keep your booking or cancel under section 9.3.
        </p>
        <p>
          <b>9.5</b> To change or cancel, email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> with your booking
          reference, or reply to your confirmation email. We handle changes and cancellations on your Professional&rsquo;s
          behalf.
        </p>
      </section>

      <section id="right-to-cancel">
        <h2>10. Your legal right to cancel (consumers)</h2>
        <p>
          <b>10.1</b> As a consumer, you can cancel your contract for the service within 14 days of the day it is made (section
          4.3), without giving a reason. Fixfy receives cancellations and processes refunds on the Professional&rsquo;s behalf.
        </p>
        <p>
          <b>10.2</b> Most jobs happen inside those 14 days. When you tick the box at checkout, you ask for the work to be done on
          the day you picked, even if it falls within the 14 days. Then:
        </p>
        <ul>
          <li>if you cancel before the work starts, you get a full refund;</li>
          <li>if you cancel after the work has started, you pay for the part done up to when you told us, and we refund the rest;</li>
          <li>once the work is fully done, you can no longer cancel it under this right. Your rights in section 8 still apply.</li>
        </ul>
        <p>
          <b>10.3</b> To cancel, tell us clearly: email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>, reply to your
          confirmation email, or send the form below. You meet the deadline if you send it before the 14 days end. We refund you
          within 14 days of hearing from you, the same way you paid.
        </p>
        <div className="mo-doc-box">
          <p>
            <b>Model cancellation form</b>
          </p>
          <p>
            To: [your Professional, as named in your booking confirmation], care of {COMPANY.legalName} (Fixfy) as their agent,{' '}
            {OFFICE}, {COMPANY.email}
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
        <h2>11. If your Professional or Fixfy needs to change or cancel</h2>
        <p>
          <b>11.1</b> A booking may need to move because of something outside your Professional&rsquo;s control or ours, such as
          illness, severe weather or transport disruption. We tell you as soon as we can and offer another date, or another
          vetted Professional (section 3.5). If neither suits you, we refund you in full.
        </p>
        <p>
          <b>11.2</b> We or your Professional may cancel a booking if the work cannot be done safely or legally, or if we
          reasonably believe the booking is fraudulent. We refund you in full for any work not done.
        </p>
      </section>

      <section id="liability">
        <h2>12. Responsibility for loss or damage</h2>
        <p>
          <b>12.1</b> Your Professional is responsible for the work, and for any loss or damage that they, or anyone working for
          them, cause you as a foreseeable result of breaking these terms or of failing to use reasonable care and skill. They are
          not responsible for loss or damage that is not foreseeable.
        </p>
        <p>
          <b>12.2</b> Every Professional holds public liability insurance of at least £1 million.
        </p>
        <p>
          <b>12.3</b> If your property is damaged during the work, tell us as soon as you can, with photos. We pass your claim to
          your Professional and keep you updated. Your Professional repairs the damage or pays a fair amount for the repair,
          directly or through their insurer.
        </p>
        <p>
          <b>12.4</b> Your Professional is not responsible for damage that was there before they started, normal wear and tear,
          fittings or appliances that fail during normal careful work because they were already worn or faulty, or loss caused by
          something you knew about and did not tell us, such as a hidden pipe.
        </p>
        <p>
          <b>12.5</b> Fixfy is responsible for its own platform service: taking your booking, handling your payment and refunds,
          and passing on communications. We provide it with reasonable care and skill. If we break these terms, we are
          responsible for loss or damage you suffer that is a foreseeable result of our breach. We are not responsible for the
          way your Professional does the work, but we will help you resolve any problem with it (section 13).
        </p>
        <p>
          <b>12.6</b> Nothing in these terms excludes or limits the liability of your Professional or of Fixfy for death or
          personal injury caused by negligence, for fraud, or for anything else the law does not allow to be excluded, including
          your rights as a consumer.
        </p>
      </section>

      <section id="complaints">
        <h2>13. Complaints</h2>
        <p>
          <b>13.1</b> Fixfy is your first point of contact for any complaint, whether it is about the work or about us. Email{' '}
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> with your booking reference, or reply to any of our emails.
        </p>
        <p>
          <b>13.2</b> We acknowledge your complaint within {TERMS.replyWorkingDays} working days. We then work with your
          Professional to fix it, and aim to resolve it within {TERMS.resolveDays} days.
        </p>
        <p>
          <b>13.3</b> If you are still not happy,{' '}
          <a href="https://www.citizensadvice.org.uk/consumer/" target="_blank" rel="noreferrer">
            Citizens Advice
          </a>{' '}
          can tell you about your options.
        </p>
      </section>

      <section id="data">
        <h2>14. Your information</h2>
        <p>
          We use your personal information as our privacy notice at <Link to="/privacy">getfixfy.com/privacy</Link> explains. We
          share the details needed to do your job with your Professional, who uses them as an independent controller. Calls to
          and from our phone lines may be recorded. Our <Link to="/cookies">cookie policy</Link> covers cookies on our website.
        </p>
      </section>

      <section id="other">
        <h2>15. Other terms</h2>
        <p>
          <b>15.1</b> We may update these terms. The version that applies to your booking is the one on our website when you
          booked, and we can send it to you on request. This version applies to bookings made from {TERMS.version} and replaces
          the terms dated {TERMS.replaces}. Bookings made before {TERMS.version} stay under the terms accepted at the time.
        </p>
        <p>
          <b>15.2</b> We may transfer our rights and obligations under these terms to another organisation without affecting your
          rights. Your booking can move to another Professional only as described in section 3.5. You can transfer your rights
          only with our agreement.
        </p>
        <p>
          <b>15.3</b> Your Professional can enforce the terms of their contract with you, and Fixfy can enforce them on their
          behalf as their agent. Nobody else has rights under these terms.
        </p>
        <p>
          <b>15.4</b> If a court finds part of these terms unlawful, the rest stays in force.
        </p>
        <p>
          <b>15.5</b> These terms are governed by the law of England and Wales. If you live in Scotland or Northern Ireland, you
          can also bring proceedings in your local courts.
        </p>
      </section>
    </LegalShell>
  )
}
