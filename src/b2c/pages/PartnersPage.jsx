import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BellRing,
  Building2,
  Camera,
  ClipboardCheck,
  FileText,
  Headphones,
  Smartphone,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react'
import B2CLayout, { PARTNER_JOIN } from '../components/Chrome.jsx'
import { Eyebrow, Faq } from '../components/Sections.jsx'
import { usePageMeta } from '../lib/meta.js'
import '../business.css'
import '../partners.css'

/*
 * /network (For Trades) no design system do B2C, no molde do /business.
 * Substitui a página estática public/network/index.html, que tinha
 * contadores sorteados no navegador ("£18,426 Live Opportunities",
 * "16 Partner Applications Remaining"), parceiros inventados com números e
 * uma média de £4k a £8k por mês que o payday não sustenta. Aqui só entra
 * o que é verdade: self-bill quinzenal, call-out de £25, documentos do /join,
 * entrada grátis (sem plano, decisão do dono em 24/09/2026). Todo "Join" vai para o cadastro no portal do parceiro.
 */

const IMG = (path) => `/${path}.webp`

const TRADES = [
  { name: 'Handyman', img: 'business/img/hero-handyman', text: 'Repairs, snagging, doors, shelves and small works between tenancies.' },
  { name: 'Plumbing', img: 'business/img/offer-trades', text: 'Leaks, taps, toilets, bathrooms and planned plumbing work.' },
  { name: 'Electrical', img: 'business/img/offer-certified', text: 'EICRs, fault finding, testing and electrical works.' },
  { name: 'Gas and heating', img: 'business/img/hero-engineer', text: 'Gas safety certificates, boiler services and repairs.' },
  { name: 'Painting', img: 'partners/img/p-painter', text: 'Fresh coats, touch-ups and full redecoration for landlords.' },
  { name: 'Cleaning', img: 'partners/img/p-cleaner', text: 'End of tenancy, deep cleans and after builders cleaning.' },
  { name: 'Carpentry', img: 'partners/img/p-carpenter', text: 'Skirting, doors, flooring repairs and fitted joinery.' },
]

const STEPS = [
  {
    title: 'Apply in minutes',
    text: 'Pick your trades and the areas you cover, then upload your ID, insurance, proof of address and right to work.',
  },
  {
    title: 'Get jobs on your phone',
    text: 'Pre-booked jobs arrive in the Fixfy app with the address, the scope and your fee. Bigger work comes as a quote request.',
  },
  {
    title: 'Do the job, get paid',
    text: 'Send the photo report from the app. We invoice the client and pay you by self-bill every two weeks.',
  },
]

const REASONS = [
  { icon: BellRing, title: 'Work that comes to you', text: 'Letting agents, property managers and businesses send us the jobs. You do not chase clients or leads.' },
  { icon: Banknote, title: 'Paid every two weeks', text: 'We raise the self-bill for you. No invoices to write, no clients to chase for payment.' },
  { icon: FileText, title: 'Your fee up front', text: 'The fee is on the job before you accept it. Materials are agreed and paid back.' },
  { icon: Headphones, title: 'A real ops team', text: 'We handle the client, the access and the rescheduling, so you can focus on the work.' },
  { icon: Smartphone, title: 'App and portal', text: 'Jobs, photo reports and self-bills on your phone, and on the desktop portal.' },
  { icon: Users, title: 'Bring your team', text: 'Run a company with your own handymen or cleaners? Manage the whole team from the portal.' },
]

const REQUIREMENTS = [
  { title: 'A UK business', text: 'Limited company or sole trader.' },
  { title: 'Experience in your trade', text: 'A track record in the work you take on.' },
  { title: '£1M public liability', text: 'Valid cover for work on client sites.' },
  { title: 'Certified where needed', text: 'Gas Safe, NICEIC, NAPIT, OFTEC or equivalent.' },
  { title: 'Right to work in the UK', text: 'Plus photo ID and proof of address.' },
  { title: 'Reliable and presentable', text: 'On time, clear with clients, tidy on site.' },
]

const FAQS = [
  {
    q: 'How and when do I get paid?',
    a: 'We raise a self-bill for you every two weeks, with every job approved in that period, and pay it by bank transfer. You never write an invoice.',
  },
  {
    q: 'What does it cost to join?',
    a: 'Nothing. Joining Fixfy is free, with no subscription and no fee to see or accept jobs.',
  },
  {
    q: 'What do I need to apply?',
    a: 'Photo ID, public liability insurance of at least £1M, proof of address and right to work in the UK. For gas and electrical work, your Gas Safe or NICEIC, NAPIT or equivalent registration.',
  },
  {
    q: 'What if the client cancels at the last minute?',
    a: 'If the client cancels within 24 hours of the job, or you cannot get in, you are paid a £25 call-out.',
  },
  {
    q: 'Can my company join with a team?',
    a: 'Yes. Run jobs, photo reports and self-bills for your whole team from the partner portal on your desktop.',
  },
  {
    q: 'Which areas do you cover?',
    a: 'London. When you apply, you choose the areas you want to work in.',
  },
]

function Photo({ src, alt, className = '', eager = false, w = 1600, h = 1067 }) {
  return <img className={className} src={IMG(src)} alt={alt} width={w} height={h} loading={eager ? 'eager' : 'lazy'} decoding="async" />
}

export default function PartnersPage() {
  usePageMeta({
    title: 'Join Fixfy: jobs for tradespeople in London, paid every two weeks | Fixfy',
    description:
      'Pre-booked jobs and quote requests from letting agents, property managers and businesses across London. Your fee up front, photo reports in the app, self-billing every two weeks. Free to join.',
    path: '/network',
  })

  return (
    <B2CLayout trades>
      <section className="mo-hero bz-hero">
        <div className="mo-wrap bz-hero__grid">
          <div className="bz-hero__copy">
            <Eyebrow icon={Wrench}>For tradespeople and maintenance companies</Eyebrow>
            <h1 className="mo-display bz-hero__title">
              More jobs. Less admin. Paid on time<span className="mo-dot">.</span>
            </h1>
            <p className="bz-hero__sub">Jobs from letting agents, property managers and businesses across London, straight to your phone.</p>
            <div className="bz-hero__actions">
              <a href={PARTNER_JOIN} className="mo-btn mo-btn--primary mo-btn--lg">
                Join now <ArrowRight size={18} />
              </a>
              <a href="#how" className="mo-btn mo-btn--on-navy mo-btn--lg">
                How it works
              </a>
            </div>
          </div>

          <div className="bz-hero__photos">
            <Photo className="bz-hero__main" src="partners/img/p-van" alt="Fixfy tradesman arriving at a job in a Fixfy van" eager />
            <Photo className="bz-hero__side" src="business/img/ondemand" alt="Fixfy engineer arriving at a London mansion block" eager />
            <Photo className="bz-hero__side" src="business/img/hero-cleaner" alt="Fixfy cleaner in a London office" eager />
          </div>

          <ul className="bz-hero__facts">
            <li>
              <Sparkles size={16} /> <span className="bz-long">Free to join</span>
              <span className="bz-short">Free to join</span>
            </li>
            <li>
              <Banknote size={16} /> <span className="bz-long">Paid every two weeks</span>
              <span className="bz-short">Paid fortnightly</span>
            </li>
            <li>
              <Smartphone size={16} /> <span className="bz-long">Jobs in the Fixfy app</span>
              <span className="bz-short">Fixfy app</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mo-section mo-section--paper" id="trades">
        <div className="mo-wrap">
          <div className="mo-section__head mo-reveal">
            <Eyebrow icon={Building2}>The work we send</Eyebrow>
            <h2 className="mo-h2">
              Jobs in your trade, near you<span className="mo-dot">.</span>
            </h2>
            <p className="mo-lede">Homes between tenancies, managed blocks and offices across London. Reactive jobs, planned work and certificates.</p>
          </div>
          <div className="pt-trades">
            {TRADES.map((t) => (
              <article key={t.name} className="pt-trade mo-reveal">
                <div className="pt-trade__img">
                  <Photo src={t.img} alt={`Fixfy ${t.name.toLowerCase()} partner at work`} />
                </div>
                <div className="pt-trade__body">
                  <h3>
                    {t.name}
                    <span className="mo-dot">.</span>
                  </h3>
                  <p>{t.text}</p>
                </div>
              </article>
            ))}
            <a className="pt-trade pt-trade--cta mo-reveal" href={PARTNER_JOIN}>
              <div className="pt-trade__body">
                <h3>Another trade?</h3>
                <p>Apply anyway. We add trades as our clients need them.</p>
                <span className="pt-trade__link">
                  Apply now <ArrowRight size={16} />
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="mo-section" id="how">
        <div className="mo-wrap bz-how pt-how">
          <div className="mo-reveal">
            <Eyebrow icon={ClipboardCheck}>How it works</Eyebrow>
            <h2 className="mo-h2">
              From sign-up to paid in three steps<span className="mo-dot">.</span>
            </h2>
            <ol className="bz-steps pt-steps">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className="bz-steps__num">{i + 1}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <figure className="bz-how__photo mo-reveal">
            <img src={IMG('partners/img/p-phone')} alt="Fixfy partner getting a new job on his phone in his van" width="1024" height="1024" loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="mo-section mo-section--navy" id="why">
        <div className="mo-wrap">
          <div className="mo-section__head mo-reveal">
            <Eyebrow icon={BadgeCheck}>Why partners work with us</Eyebrow>
            <h2 className="mo-h2">
              You do the work. We do the rest<span className="mo-dot">.</span>
            </h2>
            <p className="mo-lede">Our goal is simple: be the best company in the UK for tradespeople to work with.</p>
          </div>
          <div className="pt-reasons">
            {REASONS.map((r) => (
              <div key={r.title} className="pt-reason mo-reveal">
                <span className="pt-reason__icon">
                  <r.icon size={20} />
                </span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mo-section" id="report">
        <div className="mo-wrap pt-split">
          <figure className="pt-split__photo mo-reveal">
            <Photo src="business/img/team" alt="Fixfy partners walking to a job in London" />
          </figure>
          <div className="mo-reveal">
            <Eyebrow icon={Camera}>Proof, not paperwork</Eyebrow>
            <h2 className="mo-h2">
              Photos in the app. Invoice done for you<span className="mo-dot">.</span>
            </h2>
            <p className="mo-lede">
              When you finish, you take the photos in the Fixfy app and you are done. The client gets the report, we send the invoice, and
              the job lands on your next self-bill.
            </p>
          </div>
        </div>
      </section>

      <section className="mo-section mo-section--paper" id="requirements">
        <div className="mo-wrap">
          <div className="mo-section__head mo-reveal">
            <Eyebrow icon={BadgeCheck}>Who we look for</Eyebrow>
            <h2 className="mo-h2">
              Serious trades, checked once<span className="mo-dot">.</span>
            </h2>
            <p className="mo-lede">Our clients trust us because we check every partner before the first job. To join you need:</p>
          </div>
          <div className="pt-reqs mo-reveal">
            {REQUIREMENTS.map((r) => (
              <div key={r.title} className="pt-req">
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Faq items={FAQS} title="Questions from tradespeople" />

      <section className="mo-section mo-section--navy pt-final">
        <div className="mo-wrap pt-final__grid">
          <div className="mo-reveal">
            <Eyebrow icon={Wrench}>Join the network</Eyebrow>
            <h2 className="mo-h2">Built to be the best company in the UK to work with.</h2>
            <p className="mo-lede">Free to join. Once your documents are checked, jobs start landing in your app.</p>
            <div className="mo-final__actions pt-final__actions">
              <a href={PARTNER_JOIN} className="mo-btn mo-btn--primary mo-btn--lg">
                Join now, it&rsquo;s free <ArrowRight size={18} />
              </a>
            </div>
          </div>
          <figure className="pt-final__photo mo-reveal">
            <Photo src="partners/img/p-portrait" alt="Fixfy tradeswoman on a London street" w={1024} h={1536} />
          </figure>
        </div>
      </section>
    </B2CLayout>
  )
}
