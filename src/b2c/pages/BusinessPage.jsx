import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  Home,
  KeyRound,
  Plug,
  Store,
  BadgeCheck,
  Building2,
  CalendarRange,
  Camera,
  ClipboardCheck,
  FileText,
  GitFork,
  Layers,
  Mail,
  Quote,
  ShieldCheck,
  Sparkles,
  Timer,
  Wrench,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import B2CLayout from '../components/Chrome.jsx'
import { Eyebrow, Faq } from '../components/Sections.jsx'
import GetInTouchModal from '../../components/fixfy-v2/GetInTouchModal.jsx'
import { COMPANY } from '../content/site.js'
import { usePageMeta } from '../lib/meta.js'
import '../business.css'

/*
 * /business no design system do B2C: página clara, faixas navy, fotos da
 * equipe com o uniforme da Fixfy, nada de animação além do reveal padrão.
 * Tom B2B (ver memória b2b-tom-profissional): frases curtas, três frentes,
 * quote em 24 h para trabalho maior, chamada para o time de partnerships.
 * Todo link para /contact abre o formulário (GetInTouchModal intercepta).
 */

// Nome solto = foto do /business; com barra = caminho a partir de /public.
const IMG = (name) => (name.includes('/') ? `/${name}.webp` : `/business/img/${name}.webp`)

const FRONTS = [
  {
    verb: 'Tradespeople',
    img: 'offer-trades',
    alt: 'Fixfy plumber fitting a basin waste in a London flat',
    sub: 'Repairs and small works',
    list: ['Handyman, plumbing and electrical', 'Painting and decorating', 'Carpentry, doors and flooring'],
  },
  {
    verb: 'Certified engineers',
    img: 'offer-certified',
    alt: 'Fixfy electrician testing a consumer unit during an EICR',
    sub: 'Safety and compliance',
    list: ['Gas safety certificates and boiler services', 'EICR and electrical works', 'PAT testing'],
  },
  {
    verb: 'Professional cleaning',
    img: 'partners/img/p-cleaner',
    alt: 'Fixfy cleaner deep cleaning an oven in a London flat',
    sub: 'Homes, blocks and offices',
    list: ['End of tenancy and deep cleans', 'Communal areas and receptions', 'After builders cleaning'],
  },
]

const STEPS = [
  {
    icon: Mail,
    title: 'You raise it',
    text: 'By email, phone or the client portal. One line is enough, we come back with the questions.',
  },
  {
    icon: BadgeCheck,
    title: 'We send the right person',
    text: 'Vetted, insured and certified for the job. Standard work at an agreed rate, bigger work quoted in writing within 24 hours.',
  },
  {
    icon: Camera,
    title: 'You get the proof',
    text: 'Photos of the finished work, the certificate when there is one and the invoice, on the same job.',
  },
]

const REASONS = [
  { icon: Layers, title: 'One supplier', text: 'Trades, engineers and cleaning under one account and one invoice.' },
  { icon: ShieldCheck, title: 'Checked people', text: 'ID, insurance and trade certification checked before the first job.' },
  { icon: Timer, title: 'Quotes in 24 hours', text: 'Bigger work comes back as a written quote within one working day.' },
  { icon: FileText, title: 'Records you can show', text: 'Photo reports and certificates kept on file for every property.' },
]

const FAQS = [
  {
    q: 'Do we have to sign a contract?',
    a: 'No. You can raise jobs on demand and pay per job. An annual contract makes sense when you have a portfolio to keep compliant and want agreed rates for the year.',
  },
  {
    q: 'What does an annual contract include?',
    a: 'A maintenance and compliance calendar for your properties, agreed rates for the year, priority booking, one account manager and one monthly invoice. We build it around your portfolio after a short call.',
  },
  {
    q: 'How does pricing work on demand?',
    a: 'Standard jobs have a set price. Bigger work gets a written quote within 24 hours, and nothing starts until you approve it.',
  },
  {
    q: 'Can Fixfy handle our compliance?',
    a: 'Yes. Gas safety, EICR and PAT are booked before they expire, and every certificate is kept on file per property.',
  },
  {
    q: 'Which areas do you cover?',
    a: 'All of London. Tell us where your properties are and we will confirm the rest.',
  },
  {
    q: 'I am a tradesperson. Can I work with Fixfy?',
    a: 'Yes. Visit our partner page to apply and get access to jobs from letting agents, property managers and businesses.',
  },
]


/* Soluções por tipo de cliente (o site antigo tinha em abas, com números sem
   fonte; aqui só o que a operação faz de verdade). */
const SOLUTIONS = [
  {
    id: 'agents',
    icon: KeyRound,
    name: 'Letting agents',
    line: 'Check-outs, re-lets and landlord compliance.',
    img: 'sol-agent',
    alt: 'Fixfy engineer handing keys and the job report back at a letting agency',
    text: 'One number for every property you manage. Send the address and the date, we handle the clean, the touch-ups, the repairs and the certificates, and you get a photo report to forward to the landlord.',
    points: ['Check-out cleans, paint and repairs in one booking', 'Gas safety, EICR and PAT booked before they expire', 'Photo report on every job, ready for the landlord'],
  },
  {
    id: 'landlords',
    icon: Home,
    name: 'Landlords and portfolio owners',
    line: 'Voids turned around and every certificate on file.',
    img: 'partners/img/p-painter',
    alt: 'Fixfy painter getting an empty London flat ready to let',
    text: 'From one flat to a full portfolio. We get empty properties ready to let, keep your compliance up to date and fix what tenants report, with the price agreed before we start.',
    points: ['Void works: clean, paint and repairs between tenants', 'Compliance calendar per property', 'Tenant repairs handled end to end'],
  },
  {
    id: 'blocks',
    icon: Building2,
    name: 'Property and block managers',
    line: 'Communal areas, reactive repairs and planned work.',
    img: 'offer-cleaning',
    alt: 'Fixfy cleaners looking after the lobby of a London residential building',
    text: 'Keep buildings clean, safe and in good order without chasing contractors. Regular communal cleaning, reactive repairs and planned maintenance, with a record kept for every building.',
    points: ['Communal and reception cleaning on a schedule', 'Reactive repairs with photos of the finished work', 'Planned maintenance and a record per building'],
  },
  {
    id: 'platforms',
    icon: Plug,
    name: 'Service platforms',
    line: 'We deliver the jobs you sell across London.',
    img: 'partners/img/p-van',
    alt: 'Fixfy tradesman arriving at a job in a Fixfy van',
    text: 'Sell cleaning, repairs or certificates to your customers and let us deliver them. Send jobs by email, through our portal or by API, and get the photo report back on every job.',
    points: ['Checked, insured and certified people on every job', 'Jobs in by email, portal or API', 'Photo report and status back on every job'],
  },
  {
    id: 'business',
    icon: Store,
    name: 'Businesses and offices',
    line: 'Offices, shops and sites kept running.',
    img: 'sol-office',
    alt: 'Fixfy technician replacing a ceiling light in a London office',
    text: 'Repairs, cleaning and certificates for offices, shops and multi-site businesses. One account and one monthly invoice, on demand or on an annual contract.',
    points: ['Reactive repairs and planned maintenance', 'Office and commercial cleaning', 'One account and one monthly invoice'],
  },
]

/** Accordion: um aberto por vez; a foto do aberto aparece ao lado no computador e dentro do item no celular. */
function Solutions() {
  const [open, setOpen] = useState(SOLUTIONS[0].id)
  const current = SOLUTIONS.find((s) => s.id === open) || SOLUTIONS[0]
  return (
    <section className="mo-section" id="solutions">
      <div className="mo-wrap">
        <div className="mo-section__head mo-reveal">
          <Eyebrow icon={Briefcase}>Who we work with</Eyebrow>
          <h2 className="mo-h2">
            Built around how you work<span className="mo-dot">.</span>
          </h2>
          <p className="mo-lede">Pick what describes you best. Same team and the same standard, set up for the way you run your properties.</p>
        </div>
        <div className="bz-sol mo-reveal">
          <div className="bz-sol__list">
            {SOLUTIONS.map((s) => {
              const isOpen = s.id === open
              return (
                <div key={s.id} className={`bz-sol__item${isOpen ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="bz-sol__head"
                    aria-expanded={isOpen}
                    aria-controls={`sol-${s.id}`}
                    onClick={() => setOpen(isOpen ? '' : s.id)}
                  >
                    <span className="bz-sol__icon">
                      <s.icon size={20} />
                    </span>
                    <span className="bz-sol__title">
                      <b>{s.name}</b>
                      <span>{s.line}</span>
                    </span>
                    <ChevronDown className="bz-sol__chev" size={20} aria-hidden="true" />
                  </button>
                  <div className="bz-sol__panel" id={`sol-${s.id}`} role="region" aria-label={s.name}>
                    <div className="bz-sol__inner">
                      <img className="bz-sol__img-m" src={IMG(s.img)} alt={s.alt} width="1600" height="1067" loading="lazy" />
                      <p>{s.text}</p>
                      <ul className="bz-list">
                        {s.points.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                      <a href="/contact" className="mo-link bz-sol__cta">
                        Talk to us about this <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <figure className="bz-sol__photo" aria-hidden="true">
            <img key={current.id} src={IMG(current.img)} alt="" width="1600" height="1067" loading="lazy" />
          </figure>
        </div>
      </div>
    </section>
  )
}

function Photo({ name, alt, className = '', eager = false }) {
  return (
    <img
      className={className}
      src={IMG(name)}
      alt={alt}
      width="1600"
      height="1067"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}

export default function BusinessPage() {
  usePageMeta({
    title: 'Property maintenance for letting agents and businesses in London | Fixfy',
    description:
      'Tradespeople, certified engineers and professional cleaning across London. On demand or on an annual contract, with a written quote within 24 hours for bigger work.',
    path: '/business',
  })

  return (
    <B2CLayout business>
      <section className="mo-hero bz-hero">
        <div className="mo-wrap bz-hero__grid">
          <div className="bz-hero__copy">
            <Eyebrow icon={Building2}>For letting agents, property managers and businesses</Eyebrow>
            <h1 className="mo-display bz-hero__title">
              Property maintenance, handled<span className="mo-dot">.</span>
            </h1>
            <p className="bz-hero__sub">
              Tradespeople, certified engineers and professional cleaning across London.
            </p>
            <div className="bz-hero__actions">
              <a href="/contact" className="mo-btn mo-btn--primary mo-btn--lg">
                <span className="bz-long">Talk to our team</span>
                <span className="bz-short">Talk to us</span> <ArrowRight size={18} />
              </a>
              <a href="#ways" className="mo-btn mo-btn--on-navy mo-btn--lg">
                Learn more
              </a>
            </div>
          </div>

          <div className="bz-hero__photos">
            <Photo className="bz-hero__main" name="hero-engineer" alt="Fixfy gas engineer servicing a boiler" eager />
            <Photo className="bz-hero__side" name="hero-cleaner" alt="Fixfy cleaner in a London office" eager />
            <Photo className="bz-hero__side" name="hero-handyman" alt="Fixfy tradesman rehanging a door" eager />
          </div>

          {/* No celular vem depois das fotos, numa linha só e com o texto curto. */}
          <ul className="bz-hero__facts">
            <li>
              <Timer size={16} /> <span className="bz-long">Written quote within 24 hours</span>
              <span className="bz-short">Quote in 24h</span>
            </li>
            <li>
              <ShieldCheck size={16} /> <span className="bz-long">Vetted, insured, certified</span>
              <span className="bz-short">Vetted &amp; insured</span>
            </li>
            <li>
              <Camera size={16} /> <span className="bz-long">Photo report on every job</span>
              <span className="bz-short">Photo report</span>
            </li>
          </ul>
        </div>
      </section>

      <Solutions />

      <section className="mo-section mo-section--paper" id="services">
        <div className="mo-wrap">
          <div className="mo-section__head mo-reveal">
            <Eyebrow icon={Sparkles}>What we do</Eyebrow>
            <h2 className="mo-h2">
              Any job, made easy<span className="mo-dot">.</span>
            </h2>
            <p className="mo-lede">Three teams under one account. You raise the job, we send the right people and close it with proof.</p>
          </div>
          <div className="bz-fronts">
            {FRONTS.map((f) => (
              <article key={f.verb} className="bz-front mo-reveal">
                <div className="bz-front__img">
                  <Photo name={f.img} alt={f.alt} />
                </div>
                <div className="bz-front__body">
                  <h3 className="bz-front__name">
                    {f.verb}
                    <span className="mo-dot">.</span>
                  </h3>
                  <p className="bz-front__sub">{f.sub}</p>
                  <ul className="bz-list">
                    {f.list.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mo-section" id="ways">
        <div className="mo-wrap">
          <div className="mo-section__head mo-reveal">
            <Eyebrow icon={GitFork}>Two ways to work with us</Eyebrow>
            <h2 className="mo-h2">
              On demand, or a plan for the year<span className="mo-dot">.</span>
            </h2>
            <p className="mo-lede">Start with one job. Move to a contract when it makes sense for your portfolio.</p>
          </div>

          <div className="bz-ways">
            <article className="bz-way mo-reveal">
              <div className="bz-way__img">
                <Photo name="ondemand" alt="Fixfy engineer arriving at a London mansion block" />
              </div>
              <div className="bz-way__body">
                <span className="bz-way__tag">
                  <Zap size={15} /> On demand
                </span>
                <h3 className="bz-way__title">Raise a job when you need one.</h3>
                <p className="bz-way__text">No commitment and no platform fee. Pay per job.</p>
                <ul className="bz-list">
                  <li>Set prices for standard jobs</li>
                  <li>Written quote within 24 hours for bigger work</li>
                  <li>Nothing starts until you approve it</li>
                  <li>Photo report and invoice on every job</li>
                </ul>
                <a href="/contact" className="mo-btn mo-btn--dark">
                  Open an account <ArrowRight size={17} />
                </a>
              </div>
            </article>

            <article className="bz-way bz-way--navy mo-reveal" id="contracts">
              <div className="bz-way__img">
                <Photo name="contract" alt="Fixfy site supervisor walking a property manager through a plant room" />
              </div>
              <div className="bz-way__body">
                <span className="bz-way__tag">
                  <CalendarRange size={15} /> Annual contract
                </span>
                <h3 className="bz-way__title">One plan for the whole year.</h3>
                <p className="bz-way__text">For portfolios that need to stay maintained and compliant without anyone chasing.</p>
                <ul className="bz-list">
                  <li>Maintenance and compliance calendar per property</li>
                  <li>Certificates booked before they expire</li>
                  <li>Agreed rates for the year and priority booking</li>
                  <li>One account manager and one monthly invoice</li>
                </ul>
                <a href="/contact" className="mo-btn mo-btn--primary">
                  Ask for a proposal <ArrowRight size={17} />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="mo-section mo-section--navy" id="how">
        <div className="mo-wrap bz-how">
          <div className="mo-reveal">
            <Eyebrow icon={ClipboardCheck}>How it works</Eyebrow>
            <h2 className="mo-h2">
              You raise it. We handle the rest<span className="mo-dot">.</span>
            </h2>
            <ol className="bz-steps">
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
            <img src={IMG('report')} alt="Fixfy engineer photographing a finished repair for the report" width="900" height="900" loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="mo-section" id="why">
        <div className="mo-wrap">
          <div className="bz-team mo-reveal">
            <Photo name="team" alt="Fixfy team walking to a job in London" />
          </div>
          <div className="bz-reasons">
            {REASONS.map((r) => (
              <div key={r.title} className="bz-reason mo-reveal">
                <span className="bz-reason__icon">
                  <r.icon size={20} />
                </span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mo-section mo-section--paper" id="customers">
        <div className="mo-wrap bz-case mo-reveal">
          <div>
            <Eyebrow icon={Quote}>Customer · Li &amp; Fung</Eyebrow>
            <h2 className="mo-h2">
              Teams that run Britain&rsquo;s estates trust Fixfy to deliver<span className="mo-dot">.</span>
            </h2>
          </div>
          <figure className="bz-quote">
            <blockquote>
              A backlog of critical jobs was resolved in weeks. Fixfy quoted, planned and delivered everything, with trades fully
              managed and no chasing required.
            </blockquote>
            <div className="bz-quote__stats">
              <div>
                <b>3 wks</b>
                <span>backlog cleared</span>
              </div>
              <div>
                <b>17h</b>
                <span>avg P1 resolution</span>
              </div>
            </div>
            <figcaption>
              <span className="bz-quote__ava">SB</span>
              <span>
                <b>Sabrina Braz</b>
                <span>Facilities Manager · Li &amp; Fung</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <Faq items={FAQS} title="Questions from agents and businesses" />

      <section className="mo-section mo-section--navy">
        <div className="mo-wrap mo-final mo-reveal">
          <Eyebrow icon={Wrench}>Partnerships</Eyebrow>
          <h2 className="mo-h2">Speak to our team today. Start tomorrow.</h2>
          <p className="mo-lede">Tell us about your properties and we will set up your account, on demand or on a contract.</p>
          <div className="mo-final__actions">
            <a href="/contact" className="mo-btn mo-btn--primary mo-btn--lg">
              Talk to our team <ArrowRight size={18} />
            </a>
            <a href={`mailto:${COMPANY.email}`} className="mo-btn mo-btn--on-navy mo-btn--lg">
              {COMPANY.email}
            </a>
          </div>
        </div>
      </section>

      <GetInTouchModal />
    </B2CLayout>
  )
}
