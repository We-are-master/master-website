import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import LegalShell from '../components/LegalShell.jsx'
import { COMPANY, GUARANTEE, PROMISES, TERMS } from '../content/site.js'
import { usePageMeta } from '../lib/meta.js'

const DAYS = GUARANTEE.standardDays
const RECLEAN = PROMISES.recleanDays.value
const months = (n) => `${n} ${n === 1 ? 'month' : 'months'}`

const TOC = [
  { id: 'how-long', label: '1. Who gives it and how long it lasts' },
  { id: 'covers', label: '2. What it covers' },
  { id: 'cannot', label: '3. If your Professional cannot put it right' },
  { id: 'certificates', label: '4. Certificates' },
  { id: 'not-covered', label: '5. What it does not cover' },
  { id: 'claim', label: '6. How to claim' },
  { id: 'rights', label: '7. Your legal rights' },
]

/**
 * Página da garantia no modelo de agente (dono, 06/10/2026): dada pelo
 * profissional que faz o trabalho e organizada pela Fixfy. 7 dias como regra,
 * prazos maiores de pintura e obra em GUARANTEE (site.js). Texto do documento
 * 03-guarantee, sem mudar uma vírgula. Os termos da reserva (seção 8) apontam
 * para cá.
 */
export default function GuaranteePage() {
  usePageMeta({
    title: 'The 7-day guarantee | Fixfy',
    description: `Every job booked on Fixfy comes with a guarantee from the independent professional who does it: ${DAYS} days as standard, up to ${months(6)} for some painting and building work, on top of your legal rights.`,
    path: '/guarantee',
  })

  return (
    <LegalShell
      icon={ShieldCheck}
      eyebrow="Our guarantee"
      title={`The ${DAYS}-day guarantee`}
      lede={`Every job booked on Fixfy comes with a guarantee from the independent professional who does it: ${DAYS} days as standard, and up to ${months(6)} for some painting and building work. If something is not right, tell us within ${DAYS} days and we arrange for them to come back and put it right at no extra cost. This is on top of your legal rights, not instead of them.`}
      version={`Version of ${TERMS.version}`}
      toc={TOC}
    >
      <p>
        This guarantee applies to bookings made from {TERMS.version}. Bookings made before then keep the guarantee that applied
        when they were booked.
      </p>

      <section id="how-long">
        <h2>1. Who gives it and how long it lasts</h2>
        <p>
          <b>1.1</b> The guarantee is given by your Professional, the independent professional who did the work. Fixfy arranges it
          for them: you deal with us, and we organise the return visit.
        </p>
        <p>
          <b>1.2</b> It lasts {DAYS} days from the day the work is completed for cleaning, repairs and certificates. For
          longer-lasting work your Professional gives a longer guarantee: painting and decorating 3 months, tiling 3 months, wall
          treatments 6 months, and woodwork or structural work 6 months.
        </p>
        <div className="mo-legal__table">
          <table>
            <thead>
              <tr>
                <th scope="col">Work</th>
                <th scope="col">Guarantee from your Professional</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cleaning, repairs and certificates</td>
                <td>{DAYS} days</td>
              </tr>
              {GUARANTEE.longer.map((item) => (
                <tr key={item.id}>
                  <td>{item.label}</td>
                  <td>{months(item.months)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <b>1.3</b> For an end of tenancy clean, the guarantee includes the free re-clean. If your letting agent or landlord flags
          anything on the Fixfy checklist within {RECLEAN} days of the clean, we arrange for your cleaner to come back and put it
          right. The property needs to be empty and unchanged since the clean.
        </p>
      </section>

      <section id="covers">
        <h2>2. What it covers</h2>
        <p>
          <b>2.1</b> Faults in the work your Professional carried out: work that was not done with reasonable care and skill, or
          that fails because of how it was done.
        </p>
        <p>
          <b>2.2</b> Your Professional comes back and puts it right at no extra cost to you, including the labour and any
          materials they supplied.
        </p>
      </section>

      <section id="cannot">
        <h2>3. If your Professional cannot put it right</h2>
        <p>
          <b>3.1</b> If your Professional cannot come back, or cannot put the problem right, we may arrange another vetted
          professional to do it, at no cost to you.
        </p>
        <p>
          <b>3.2</b> If that is not possible, or would take too long or cause you real inconvenience, we refund the part of the
          price for the work that was not right. We process the refund on the Professional&rsquo;s behalf.
        </p>
      </section>

      <section id="certificates">
        <h2>4. Certificates</h2>
        <p>
          <b>4.1</b> Certificates are issued by the qualified engineer or assessor in their own name and registration.
        </p>
        <p>
          <b>4.2</b> The guarantee covers the check being carried out properly and the certificate being correct. If there is a
          mistake on the certificate, the engineer or assessor corrects it and issues it again.
        </p>
        <p>
          <b>4.3</b> It does not cover repairs or improvement works found during the check. You get those as a separate fixed
          price, and nothing is done until you say yes.
        </p>
      </section>

      <section id="not-covered">
        <h2>5. What it does not cover</h2>
        <ul>
          <li>Normal wear and tear, and damage from accidents, misuse or other people after the work is finished.</li>
          <li>Work that someone else has changed, repaired or added to since your Professional finished.</li>
          <li>
            Problems with the building that your Professional was not booked to fix, such as a leak or damp behind a wall they
            painted. If they spot something like this during the job, we tell you.
          </li>
          <li>
            Materials you supplied yourself. Your Professional&rsquo;s work to fit or use them is still covered; faults in the
            materials go to their seller or maker.
          </li>
          <li>Marks or mess that appear after a clean, for example from moving furniture or new occupants.</li>
        </ul>
      </section>

      <section id="claim">
        <h2>6. How to claim</h2>
        <p>
          <b>6.1</b> Email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>, or message us on WhatsApp, within the
          guarantee period ({DAYS} days, or the longer period in 1.2), counted from the day the work was completed. Send your
          booking reference and photos of the problem.
        </p>
        <p>
          <b>6.2</b> We acknowledge your claim within {TERMS.replyWorkingDays} working days, contact your Professional and arrange
          the visit. The visit and the fix are free.
        </p>
      </section>

      <section id="rights">
        <h2>7. Your legal rights</h2>
        <p>
          <b>7.1</b> This guarantee is on top of your rights under the Consumer Rights Act 2015, not instead of them. Those rights
          are against your Professional, as the trader who did the work. By law, the work must be done with reasonable care and
          skill, and a problem that shows up after the guarantee period may still be covered. Fixfy will help you use your
          rights.{' '}
          <a href="https://www.citizensadvice.org.uk/consumer/" target="_blank" rel="noreferrer">
            Citizens Advice
          </a>{' '}
          can tell you more.
        </p>
        <p>
          <b>7.2</b> Business customers get the same guarantee unless their account agreement says otherwise. The rest of our
          terms are in the booking terms at <Link to="/terms">getfixfy.com/terms</Link>.
        </p>
      </section>
    </LegalShell>
  )
}
