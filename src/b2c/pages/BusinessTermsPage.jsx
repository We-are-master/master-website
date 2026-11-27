import { Link } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import LegalShell from '../components/LegalShell.jsx'
import { BUSINESS_TERMS, COMPANY } from '../content/site.js'
import { usePageMeta } from '../lib/meta.js'

const MONTHS = BUSINESS_TERMS.depositSchedulingMonths

const TOC = [
  { id: 'who', label: '1. Who these terms apply to' },
  { id: 'quotes', label: '2. Quotes and acceptance' },
  { id: 'deposits', label: '3. Deposits and scheduling' },
  { id: 'dates', label: '4. Changing a confirmed date' },
  { id: 'payment', label: '5. Payment' },
  { id: 'other', label: '6. Other terms' },
]

/**
 * Termos de conta empresa (B2B), 27/11/2026. Os termos da reserva (/terms) são
 * só de consumidor e dizem na 1.8 que empresa tem acordo próprio: é este.
 * Pedido do dono depois do caso Kvadrat (52336): depósito pago e obra não
 * marcada em 3 meses, por motivo do cliente, fica com a Fixfy.
 */
export default function BusinessTermsPage() {
  usePageMeta({
    title: 'Business terms | Fixfy',
    description: 'The terms for business customers who accept a Fixfy quote: quotes, deposits, scheduling and payment.',
    path: '/business-terms',
  })

  return (
    <LegalShell
      icon={Briefcase}
      eyebrow="Business terms"
      title="Business terms"
      lede="The terms for letting agents, property managers, landlords trading as a business and other companies who accept a Fixfy quote."
      version={`Version of ${BUSINESS_TERMS.version}`}
      toc={TOC}
    >
      <div className="mo-doc-box">
        <p>
          <b>In short</b>
        </p>
        <ul>
          <li>Paying the deposit or accepting the quote in writing means you accept the quote and these terms.</li>
          <li>The deposit secures your Professional&rsquo;s time and the planning of your works.</li>
          <li>
            The works need to start within {MONTHS} months of the deposit. If they do not, for reasons on your side, the deposit
            is kept.
          </li>
          <li>If we cannot offer you a date in that time, you get the deposit back in full.</li>
        </ul>
      </div>

      <section id="who">
        <h2>1. Who these terms apply to</h2>
        <p>
          <b>1.1</b> These terms apply when a business accepts a quote from {COMPANY.legalName} (&ldquo;Fixfy&rdquo;, &ldquo;we&rdquo;)
          or pays one of our invoices. A business includes letting agents, property managers, landlords who let property through
          a company or as a trade, and any other company or organisation.
        </p>
        <p>
          <b>1.2</b> People booking for themselves are covered by our <Link to="/terms">booking terms</Link> instead. The
          consumer rights in those terms do not apply under these terms.
        </p>
        <p>
          <b>1.3</b> Your quote and these terms together form our agreement. If your quote says something different from these
          terms, the quote applies.
        </p>
      </section>

      <section id="quotes">
        <h2>2. Quotes and acceptance</h2>
        <p>
          <b>2.1</b> A quote is valid for {BUSINESS_TERMS.quoteValidWorkingDays} working days from the date on it, unless it says
          otherwise.
        </p>
        <p>
          <b>2.2</b> You accept a quote by confirming it in writing or by paying the deposit. Either one means you accept the
          quote and these terms, and agree to go ahead.
        </p>
      </section>

      <section id="deposits">
        <h2>3. Deposits and scheduling</h2>
        <p>
          <b>3.1</b> Your quote says if a deposit is needed and how much it is. The deposit secures your Professional&rsquo;s
          time and pays for the planning of your works: scheduling, site visits, materials planning and administration. It is
          taken off your final invoice.
        </p>
        <p>
          <b>3.2</b> Once you pay the deposit, we offer you start dates. The works need to start within {MONTHS} months of the day
          we receive the deposit.
        </p>
        <p>
          <b>3.3</b> If the works have not started within {MONTHS} months of the deposit for reasons on your side, the deposit is
          non-refundable and we keep it in full. Reasons on your side include not confirming one of the dates we offer, moving or
          postponing a confirmed date, and not giving us access. The deposit covers the time your Professional kept for you and
          the scheduling, planning and administration costs already incurred. The quote then ends, and any new dates need a new
          quote.
        </p>
        <p>
          <b>3.4</b> Once a start date is confirmed, the deposit is non-refundable if you cancel the works.
        </p>
        <p>
          <b>3.5</b> If you cancel before any start date is confirmed and within {MONTHS} months of the deposit, we keep the costs
          already incurred for your works (such as site visits, materials ordered and your Professional&rsquo;s reserved time)
          and refund the rest of the deposit.
        </p>
        <p>
          <b>3.6</b> If we cannot offer you a start date within {MONTHS} months of the deposit, or we cancel the works, we refund
          the deposit in full.
        </p>
      </section>

      <section id="dates">
        <h2>4. Changing a confirmed date</h2>
        <p>
          <b>4.1</b> You can ask to move a confirmed date by emailing <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. We
          try to find a new date that suits you and your Professional.
        </p>
        <p>
          <b>4.2</b> Moving a date does not restart the {MONTHS}-month period in section 3.2. It still counts from the day we
          received the deposit.
        </p>
      </section>

      <section id="payment">
        <h2>5. Payment</h2>
        <p>
          <b>5.1</b> The balance is due when the works are done, within the payment terms on your invoice or your business
          account.
        </p>
        <p>
          <b>5.2</b> If an invoice is paid late, we may charge interest and compensation under the Late Payment of Commercial
          Debts (Interest) Act 1998.
        </p>
      </section>

      <section id="other">
        <h2>6. Other terms</h2>
        <p>
          <b>6.1</b> We may update these terms. The version that applies to your works is the one on our website when you
          accepted the quote, and we can send it to you on request.
        </p>
        <p>
          <b>6.2</b> These terms are governed by the law of England and Wales.
        </p>
      </section>
    </LegalShell>
  )
}
