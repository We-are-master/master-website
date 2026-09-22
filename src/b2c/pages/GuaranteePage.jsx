import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import LegalShell from '../components/LegalShell.jsx'
import { COMPANY, GUARANTEE, PROMISES, TERMS } from '../content/site.js'
import { usePageMeta } from '../lib/meta.js'

const DAYS = GUARANTEE.standardDays
const RECLEAN = PROMISES.recleanDays.value
const months = (n) => `${n} ${n === 1 ? 'month' : 'months'}`

const TOC = [
  { id: 'how-long', label: '1. How long it lasts' },
  { id: 'covers', label: '2. What it covers' },
  { id: 'not-covered', label: '3. What it does not cover' },
  { id: 'claim', label: '4. How to claim' },
  { id: 'rights', label: '5. Your legal rights' },
]

/**
 * Página da garantia (dono, 22/09/2026): prazo padrão para todo serviço e
 * prazos maiores por tipo de trabalho, tudo em GUARANTEE (site.js). Os
 * termos da reserva (seção 7) apontam para cá.
 */
export default function GuaranteePage() {
  usePageMeta({
    title: 'Our guarantee | Fixfy',
    description: `Every Fixfy job is guaranteed: ${DAYS} days as standard, up to ${months(6)} for wall treatments, woodwork and structural work. On top of your legal rights.`,
    path: '/guarantee',
  })

  return (
    <LegalShell
      icon={ShieldCheck}
      eyebrow="Our guarantee"
      title="Our guarantee"
      lede="Every job we do is guaranteed. If our work is not right within the period below, we come back and put it right at no cost. This is on top of your legal rights, not instead of them."
      toc={TOC}
    >
      <section id="how-long">
        <h2>1. How long the guarantee lasts</h2>
        <div className="mo-legal__table">
          <table>
            <thead>
              <tr>
                <th scope="col">Work</th>
                <th scope="col">Guarantee</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Every service, including cleaning, repairs and certificates</td>
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
          Each period starts on the day the work is completed. When a job mixes different kinds of work, each part keeps its own
          period: in a job with repairs and painting, the painting is guaranteed for {months(3)}.
        </p>
        <p>
          For an end of tenancy clean, the guarantee is our free re-clean. If your letting agent or landlord flags anything on our
          checklist within {RECLEAN} days of the clean, we come back and put it right. The property needs to be empty and unchanged
          since we cleaned it.
        </p>
      </section>

      <section id="covers">
        <h2>2. What it covers</h2>
        <p>
          Faults in the work we carried out: work that was not done with reasonable care and skill, or that fails because of how we
          did it. We come back and put it right at no cost to you, including the labour and any materials we supplied.
        </p>
        <p>
          If we cannot put it right, or it would take too long or cause you real inconvenience, we refund the part of the price for
          the work that was not right.
        </p>
      </section>

      <section id="not-covered">
        <h2>3. What it does not cover</h2>
        <ul>
          <li>Normal wear and tear, and damage from accidents, misuse or other people after we finish.</li>
          <li>Work that someone else has changed, repaired or added to since we finished.</li>
          <li>
            Problems with the building that we were not booked to fix, such as a leak or damp behind a wall we painted. If we spot
            something like this during the job, we tell you.
          </li>
          <li>
            Materials you supplied yourself. Our work to fit or use them is still covered; faults in the materials go to their
            seller or maker.
          </li>
          <li>Marks or mess that appear after a clean, for example from moving furniture or new occupants.</li>
        </ul>
      </section>

      <section id="claim">
        <h2>4. How to claim</h2>
        <p>
          Email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> within the guarantee period with your booking reference and
          photos of the problem. We reply within {TERMS.replyWorkingDays} working days and arrange a visit. The visit and the fix are
          free.
        </p>
      </section>

      <section id="rights">
        <h2>5. Your legal rights</h2>
        <p>
          This guarantee is on top of your rights under the Consumer Rights Act 2015, not instead of them. By law, our work must be
          done with reasonable care and skill, and a problem that shows up after the guarantee period may still be covered.{' '}
          <a href="https://www.citizensadvice.org.uk/consumer/" target="_blank" rel="noreferrer">
            Citizens Advice
          </a>{' '}
          can tell you more.
        </p>
        <p>
          Business customers get the same guarantee unless their account agreement says otherwise. The rest of our terms are in the{' '}
          <Link to="/terms">booking terms</Link>.
        </p>
      </section>
    </LegalShell>
  )
}
