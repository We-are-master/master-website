import { Briefcase } from 'lucide-react'
import LegalShell from '../components/LegalShell.jsx'
import { BUSINESS_TERMS as T, COMPANY } from '../content/site.js'
import { usePageMeta } from '../lib/meta.js'

const gbp = (n) => `£${n.toLocaleString('en-GB')}`

/**
 * Termos de conta empresa (B2B), 27/11/2026. Os termos da reserva (/terms) são
 * só de consumidor e dizem na 1.8 que empresa tem acordo próprio: é este.
 * Pedido do dono depois do caso Kvadrat (52336): versão completa, cobrindo
 * depósito e prazo de 3 meses, variações, acesso, aceite da obra, garantia só
 * como remedial visit, pagamento sem retenção, limite de responsabilidade e
 * não aliciamento de parceiro. Números em BUSINESS_TERMS (site.js).
 */
const SECTIONS = [
  {
    id: 'who',
    title: 'Who these terms apply to',
    clauses: [
      `These terms apply when a business accepts a quote from ${COMPANY.legalName} (company number ${COMPANY.companyNumber}, "Fixfy", "we", "us") or pays one of our invoices. A business ("you") includes letting agents, property managers, block managers, landlords who let property through a company or as a trade, and any other company or organisation.`,
      'People booking for themselves, and not for a business, are covered by our booking terms at getfixfy.com/terms instead. The consumer rights in those terms do not apply under these terms.',
      'If you instruct us on behalf of someone else, such as a landlord or a freeholder, you confirm you have their authority. You and they are both responsible for paying us, unless we agree in writing before the works start to invoice them alone.',
      'Anyone at your business who asks us for a quote, approves one, gives us access or asks for extra work is treated as authorised to do so for you, unless you tell us in writing who may and may not instruct us.',
    ],
  },
  {
    id: 'agreement',
    title: 'Our agreement',
    clauses: [
      'Our agreement is made up of your quote and these terms. If your quote says something different from these terms, the quote applies.',
      'Your own terms, purchase order terms or supplier terms do not apply, even if you send them to us or refer to them, unless a director of Fixfy signs to accept them. A purchase order number is only a reference for your invoice.',
      'These terms apply to every quote you accept and every job we do for you from the date you first accept them, unless we agree other terms in writing.',
    ],
  },
  {
    id: 'quotes',
    title: 'Quotes',
    clauses: [
      `A quote is valid for ${T.quoteValidWorkingDays} working days from the date on it, unless it says otherwise.`,
      'A quote is based on the information, photos and measurements you or your tenant give us and on what can be seen without opening up walls, floors, ceilings or fittings. It covers only the work listed in it.',
      'Anything not listed in the quote is not included. This includes, unless the quote lists it: making good beyond the area of the works, redecoration, moving or protecting large furniture, waste removal, parking and congestion charges, permits, out-of-hours work and materials not named.',
      'If the works turn out to be different from what the quote was based on, for example because of hidden damage, damp, rot, asbestos, structural problems or wrong measurements, we tell you before going further and the price may change (section 6).',
    ],
  },
  {
    id: 'acceptance',
    title: 'Accepting a quote',
    clauses: [
      'You accept a quote when you do any of these: confirm it in writing (including by email, WhatsApp or our online link), pay the deposit or any part of the price, send a purchase order for it, or let us start the works.',
      'Accepting a quote means you accept these terms and agree to go ahead and pay for the works.',
    ],
  },
  {
    id: 'deposits',
    title: 'Deposits and scheduling',
    clauses: [
      'Your quote says if a deposit is needed and how much it is. The deposit secures your Professional\'s time and pays for the planning of your works: scheduling, site visits, materials planning and administration. It is taken off your final invoice.',
      `Once you pay the deposit, we offer you start dates. The works need to start within ${T.depositSchedulingMonths} months of the day we receive the deposit.`,
      `If the works have not started within ${T.depositSchedulingMonths} months of the deposit for reasons on your side, the deposit is non-refundable and we keep it in full. Reasons on your side include not confirming one of the dates we offer, moving or postponing a confirmed date, not giving us access and not being ready for the works. The deposit covers the time your Professional kept for you and the scheduling, planning and administration costs already incurred. The quote then ends, and any new dates need a new quote.`,
      'Once a start date is confirmed, the deposit is non-refundable if you cancel the works.',
      `If you cancel before any start date is confirmed and within ${T.depositSchedulingMonths} months of the deposit, we keep the costs already incurred for your works (such as site visits, materials ordered and your Professional's reserved time) and refund the rest of the deposit.`,
      `If we cannot offer you a start date within ${T.depositSchedulingMonths} months of the deposit, or we cancel the works ourselves, we refund the deposit in full.`,
      `Moving a date does not restart the ${T.depositSchedulingMonths}-month period. It still counts from the day we received the deposit.`,
    ],
  },
  {
    id: 'changes',
    title: 'Extra work and changes',
    clauses: [
      'If you ask for anything not in the quote, or the works need more than the quote covers, we tell you what it is and what it costs before doing it. We only do it once you approve it. An approval by email, WhatsApp, our online link or on site by an authorised person counts.',
      'If something must be done straight away to make the property safe or to stop further damage, and we cannot reach you, we may do the minimum needed and charge it at our standard rates. We tell you as soon as we can.',
      'Materials and parts not in the quote are charged at the price agreed with you. We keep the receipt and list them in your report.',
      'Time-based work (by the hour, half day or day) is charged for the time actually spent on site, with the minimum shown in your quote.',
    ],
  },
  {
    id: 'your-side',
    title: 'What you need to do',
    clauses: [
      'Give us safe access to the property at the agreed time, with keys, codes and parking details where needed, and tell your tenant or occupier about the visit with enough notice.',
      'Make sure there is working electricity, water and lighting, and that the work area is clear of furniture, belongings and pets, unless the quote includes clearing it.',
      'Tell us before the works about anything that affects them or our safety: asbestos (and give us the asbestos register if there is one), known defects, damp, hazards, alarms, building rules, working-hours limits and parking restrictions.',
      'Get any permission the works need from the landlord, freeholder, managing agent, building control or planning, unless the quote says we will.',
      'Parking, congestion and permit charges needed for the works are paid by you, at cost, unless the quote includes them.',
    ],
  },
  {
    id: 'access',
    title: 'Missed visits and late cancellations',
    clauses: [
      `If our Professional arrives in the agreed window and cannot get in or start within ${T.noAccessMinutes} minutes (for example no keys, no answer, the tenant refuses entry, or the area is not ready), the visit counts as a failed visit and a call-out charge of ${T.failedVisitHours} hour at the standard hourly rate on your price list is due.`,
      `You can move or cancel a confirmed visit for free up to ${T.freeChangeHours} hours before the start of the arrival window. Later than that, ${T.lateCancellationPercent}% of the price of that visit is due, for the time your Professional kept for you.`,
      'If you cancel works after they have started, you pay for the work done so far, the materials bought for your works and any costs we cannot get back.',
    ],
  },
  {
    id: 'works',
    title: 'Carrying out the works',
    clauses: [
      'Your works are carried out by vetted, independent tradespeople we arrange ("Professionals"). We stay responsible to you for the works under these terms. Professionals have no authority to change these terms or agree prices on our behalf.',
      'We carry out the works with reasonable skill and care, using materials of satisfactory quality.',
      'Start dates and durations are our best estimate. We work to meet them, but delays caused by weather, access, extra work, hidden conditions, supplier delays or anything outside our control do not make us liable for any loss.',
      'Our Professionals may stop or refuse any task they reasonably believe is unsafe, such as work at height without the right equipment, suspected asbestos or live hazards. The time spent until then is charged.',
      'Waste from the works is only removed when the quote includes it. Hazardous waste, such as asbestos, chemicals or clinical waste, is never included.',
      'We take photos before, during and after the works for your report and our records. We may use photos that show no people, addresses or personal details to show our work.',
    ],
  },
  {
    id: 'completion',
    title: 'Completion and sign-off',
    clauses: [
      'When the works are done, we send you a photo report. The report is evidence of the works carried out.',
      `If you think anything in the works is not complete or not right, tell us in writing within ${T.signOffWorkingDays} working days of the report, with photos. After that, or once the property is let, occupied or handed over, the works are treated as accepted, without affecting your guarantee in section 11.`,
    ],
  },
  {
    id: 'guarantee',
    title: 'Our guarantee',
    clauses: [
      `If our workmanship is not right, tell us in writing with photos within ${T.guaranteeCleaningDays} days of completion for cleaning, and within ${T.guaranteeWorksDays} days for repairs, painting and all other works, unless your quote gives a longer period.`,
      'We put it right with a remedial visit at no extra cost. A remedial visit is the remedy under this guarantee: it is not a refund, discount or credit.',
      'You must give us the chance to put it right. If you ask another contractor to redo or change the works before we have had that chance, we are not responsible for that cost or for the works.',
      'The guarantee does not cover: normal wear and tear; damage by tenants, occupiers or others after completion; misuse or lack of maintenance; defects that were there before the works or are outside the area of the works; materials you supplied; and the cause of a problem that the quote did not include fixing, such as the source of a leak, damp or a structural issue.',
    ],
  },
  {
    id: 'payment',
    title: 'Prices and payment',
    clauses: [
      'Prices are in pounds sterling. Your quote says whether VAT is included or added.',
      `Unless your quote or business account says otherwise, the balance is due ${T.paymentDays} days after the works are completed. Where we hold a card for you, we may charge it when the works are completed.`,
      'You must pay each invoice in full by its due date. You may not hold back, reduce or set off any amount against an invoice, including for a complaint or a claim, except for the specific amount you dispute in writing under section 12.4.',
      `If you dispute an invoice, tell us in writing within ${T.invoiceDisputeDays} days of the invoice date, saying which items you dispute and why. Pay the rest by the due date. After ${T.invoiceDisputeDays} days the invoice is treated as accepted.`,
      'Please pay by bank transfer quoting the invoice number. Where a payment does not clearly match one invoice, we may apply it to your oldest unpaid invoices first. Any overpayment stays on your account as a credit for future works, or is refunded if you ask.',
      'If you pay late, we may charge interest and fixed compensation under the Late Payment of Commercial Debts (Interest) Act 1998, and the reasonable costs of recovering the debt.',
      'If any invoice is overdue, we may pause works in progress and future bookings until it is paid, and ask for payment before further works.',
      'Materials we supply stay ours until the works they are part of are paid for in full.',
    ],
  },
  {
    id: 'liability',
    title: 'Responsibility for loss or damage',
    clauses: [
      `We hold public liability insurance of ${gbp(T.publicLiability)}. If we or a Professional damage your property while carrying out the works, tell us in writing within ${T.damageReportDays} days with photos. We either repair the damage or pay a fair amount for the repair.`,
      'We are not responsible for: loss of rent, loss of income or profit, claims from tenants or occupiers, loss of a tenancy deposit, costs of alternative accommodation, or any indirect or consequential loss.',
      'We are not responsible for damage or loss caused by defects that were there before the works, by hidden conditions we could not reasonably see, by the information you gave us being wrong, or by you not doing what section 7 asks.',
      'Our total responsibility for any one job, whether in contract, negligence or otherwise, is limited to the price of that job as set out in the quote.',
      'If keys you give us are lost while we hold them, our responsibility is limited to the reasonable cost of replacement keys and, where needed, replacing the affected locks.',
      'Nothing in these terms limits responsibility for death or personal injury caused by negligence, for fraud, or for anything else the law does not allow to be limited.',
    ],
  },
  {
    id: 'professionals',
    title: 'Our Professionals',
    clauses: [
      `The Professionals we arrange are introduced to you through Fixfy. During our agreement and for ${T.nonSolicitMonths} months after their last job for you, you agree not to engage, directly or through anyone else, any Professional who has worked on your property through us, without our written agreement.`,
      `If you do, you agree to pay us an introduction fee of ${gbp(T.introductionFee)} for each Professional, or ${T.introductionPercent}% of the value of the work they do for you in the ${T.nonSolicitMonths} months after their first direct job, whichever is greater. This is a genuine estimate of what the introduction is worth to us.`,
      'Please arrange all works, changes and payments for jobs we introduced through us, not with the Professional directly.',
    ],
  },
  {
    id: 'ending',
    title: 'Pausing or ending works',
    clauses: [
      'We may pause or end the works by telling you in writing if an invoice is overdue, if the site is unsafe, if access keeps failing, or if anyone at the property is abusive or threatening to our Professionals or our team. You then pay for the work done, the materials bought and costs we cannot get back.',
      'We are not responsible for delays or failure caused by events outside our reasonable control, such as extreme weather, illness, supplier failures, strikes, utility failures or restrictions by public authorities. If such an event lasts more than 30 days, either of us may cancel the works not yet started, and you pay for the work already done.',
    ],
  },
  {
    id: 'data',
    title: 'Information and confidentiality',
    clauses: [
      'We use the personal information you share with us, including your tenants\' names and contact details, only to arrange and carry out the works, to report on them and to bill you, in line with UK data protection law and our privacy policy at getfixfy.com/privacy.',
      'You confirm you are allowed to share your tenants\' and occupiers\' details with us for that purpose.',
      'Each of us keeps the other\'s prices, terms and business information confidential, except where the law requires otherwise.',
    ],
  },
  {
    id: 'other',
    title: 'Other terms',
    clauses: [
      'We may update these terms. The version that applies to a job is the one on our website when you accepted its quote, and we can send it to you on request.',
      `Notices under these terms can be sent by email: to us at ${COMPANY.email}, and to you at the email address on your account or the one you use with us.`,
      'Our agreement is the whole agreement between us about the works. You have not relied on anything not written in the quote or these terms.',
      'If any part of these terms is found not to be valid, the rest stays in force. If we do not enforce a right straight away, we can still enforce it later.',
      'We may transfer our rights under our agreement. You may only transfer yours with our written agreement. Nobody else has rights under it under the Contracts (Rights of Third Parties) Act 1999.',
      'These terms are governed by the law of England and Wales, and the courts of England and Wales deal with any dispute.',
    ],
  },
]

export default function BusinessTermsPage() {
  usePageMeta({
    title: 'Business terms | Fixfy',
    description: 'The terms for business customers who accept a Fixfy quote: quotes, deposits, scheduling, extra work, guarantee, payment and liability.',
    path: '/business-terms',
  })

  return (
    <LegalShell
      icon={Briefcase}
      eyebrow="Business terms"
      title="Business terms"
      lede="The terms for letting agents, property managers, landlords trading as a business and other companies who accept a Fixfy quote."
      version={`Version of ${T.version}`}
      toc={SECTIONS.map((s, i) => ({ id: s.id, label: `${i + 1}. ${s.title}` }))}
    >
      <div className="mo-doc-box">
        <p>
          <b>In short</b>
        </p>
        <ul>
          <li>Paying the deposit, approving the quote or letting us start means you accept the quote and these terms.</li>
          <li>
            The works need to start within {T.depositSchedulingMonths} months of the deposit. If they do not, for reasons on your
            side, the deposit is kept.
          </li>
          <li>Extra work is only done once you approve its price.</li>
          <li>Invoices are paid in full by the due date. Only the specific amount disputed in writing can be held back.</li>
          <li>If something is not right, we come back and put it right with a remedial visit.</li>
          <li>Professionals we introduce are booked through us, not directly.</li>
        </ul>
      </div>

      {SECTIONS.map((s, i) => (
        <section id={s.id} key={s.id}>
          <h2>
            {i + 1}. {s.title}
          </h2>
          {s.clauses.map((c, j) => (
            <p key={j}>
              <b>
                {i + 1}.{j + 1}
              </b>{' '}
              {c}
            </p>
          ))}
        </section>
      ))}
    </LegalShell>
  )
}
