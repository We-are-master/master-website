import { useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  FileSignature,
  Gavel,
  Inbox,
  LayoutDashboard,
  MapPin,
  Receipt,
  Settings,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { Eyebrow } from './Sections.jsx'
import { PARTNER_JOIN } from './Chrome.jsx'

/*
 * O portal do parceiro (partners.getfixfy.com) desenhado em HTML: as quatro
 * coisas que ele faz de verdade viram abas, e a janela troca de tela. Os
 * nomes do menu são os do portal (components/shell/sidebar.tsx do
 * master-trade-portal): Dashboard, Available Jobs, Available Quotes, Active
 * Jobs, Schedule, Settings. Os jobs e valores da janela são ilustração
 * (a legenda diz isso). NÃO prometer gestão de equipe nem PDF da self-bill:
 * não existem no portal (24/09/2026).
 */

const MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jobs', label: 'Available Jobs', icon: Inbox },
  { id: 'quotes', label: 'Available Quotes', icon: Gavel },
  { id: 'active', label: 'Active Jobs', icon: Wrench },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const FEATURES = [
  {
    id: 'jobs',
    menu: 'jobs',
    icon: Inbox,
    title: 'Accept jobs',
    text: 'Pre-booked jobs with the address, the scope, the slot and your fee. Accept the ones you want, pass on the rest.',
  },
  {
    id: 'quotes',
    menu: 'quotes',
    icon: Gavel,
    title: 'Submit quotes',
    text: 'Price bigger work from the scope and photos, and follow every quote from submitted to won.',
  },
  {
    id: 'report',
    menu: 'active',
    icon: Camera,
    title: 'Report with photos',
    text: 'Start the job, add photos of the finished work and submit the report. That closes the job for the client.',
  },
  {
    id: 'pay',
    menu: 'dashboard',
    icon: Receipt,
    title: 'See what you earn',
    text: 'What you earned this pay period, what is pending, and every self-bill with its status.',
  },
]

const EXTRAS = [
  { icon: CalendarDays, text: 'Schedule' },
  { icon: CheckCircle2, text: 'Availability' },
  { icon: MapPin, text: 'Service area' },
  { icon: ShieldCheck, text: 'Documents' },
  { icon: FileSignature, text: 'Agreements' },
]

function JobsScreen() {
  const jobs = [
    { t: 'End of tenancy clean · 2 bed', where: 'Peckham, SE15', when: 'Tue 30 Sep · 9am to 12pm', fee: '£150' },
    { t: 'Gas safety certificate', where: 'Clapham, SW4', when: 'Wed 1 Oct · 12pm to 3pm', fee: '£55' },
    { t: 'Handyman · half day', where: 'Islington, N1', when: 'Thu 2 Oct · 9am to 12pm', fee: '£130' },
  ]
  return (
    <>
      <div className="ps-screen__head">
        <b>Available Jobs</b>
        <span>First to accept wins</span>
      </div>
      <div className="ps-jobs">
        {jobs.map((j, i) => (
          <div key={j.t} className={`ps-job${i === 0 ? ' is-hot' : ''}`}>
            <div>
              <b>{j.t}</b>
              <span>
                {j.where} · {j.when}
              </span>
            </div>
            <div className="ps-job__side">
              <em>{j.fee}</em>
              <span className="ps-btn ps-btn--primary">Accept job</span>
              <span className="ps-btn">Pass</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function QuotesScreen() {
  return (
    <>
      <div className="ps-screen__head">
        <b>Available Quotes</b>
      </div>
      <div className="ps-seg">
        <span className="is-on">To quote</span>
        <span>Submitted</span>
        <span>Won</span>
        <span>Lost</span>
      </div>
      <div className="ps-quote">
        <b>Bathroom refit, first floor flat</b>
        <span>Clapham, SW4 · scope and 6 photos from the client</span>
        <ul>
          <li>Remove old suite and tiles</li>
          <li>New bath, basin, WC and shower screen</li>
          <li>Tile walls and floor</li>
        </ul>
        <label>
          Your price
          <span className="ps-input">£ 3,400</span>
        </label>
        <span className="ps-btn ps-btn--primary ps-btn--wide">Submit quote</span>
      </div>
    </>
  )
}

function ReportScreen() {
  const photos = ['partners/img/p-painter', 'partners/img/p-cleaner', 'partners/img/p-carpenter']
  return (
    <>
      <div className="ps-screen__head">
        <b>Active Jobs</b>
        <span className="ps-pill">In progress</span>
      </div>
      <div className="ps-quote">
        <b>End of tenancy clean · 2 bed</b>
        <span>Peckham, SE15 · started 9:04am</span>
        <div className="ps-photos">
          {photos.map((p) => (
            <img key={p} src={`/${p}.webp`} alt="" width="1600" height="1067" loading="lazy" />
          ))}
          <span className="ps-photos__add">+ Add photo</span>
        </div>
        <span className="ps-btn ps-btn--primary ps-btn--wide">Submit report</span>
      </div>
    </>
  )
}

function PayScreen() {
  const bills = [
    { period: '31 Aug to 13 Sep', jobs: 9, net: '£1,245.00' },
    { period: '17 Aug to 30 Aug', jobs: 7, net: '£980.00' },
  ]
  return (
    <>
      <div className="ps-screen__head">
        <b>Dashboard</b>
      </div>
      <div className="ps-stats">
        <div>
          <span>Earned this pay period</span>
          <b>£1,380</b>
        </div>
        <div>
          <span>Pending payout</span>
          <b>£1,245</b>
        </div>
      </div>
      <div className="ps-table">
        <div className="ps-table__row ps-table__row--head">
          <span>Period</span>
          <span>Jobs</span>
          <span>Net</span>
          <span>Status</span>
        </div>
        {bills.map((b, i) => (
          <div key={b.period} className="ps-table__row">
            <span>{b.period}</span>
            <span>{b.jobs}</span>
            <span>{b.net}</span>
            <span className={`ps-pill${i === 0 ? '' : ' ps-pill--paid'}`}>{i === 0 ? 'Awaiting payment' : 'Paid'}</span>
          </div>
        ))}
      </div>
    </>
  )
}

const SCREENS = { jobs: JobsScreen, quotes: QuotesScreen, report: ReportScreen, pay: PayScreen }

export default function PortalShowcase() {
  const [tab, setTab] = useState('jobs')
  const feature = FEATURES.find((f) => f.id === tab)
  const Screen = SCREENS[tab]

  return (
    <section className="mo-section" id="portal">
      <div className="mo-wrap">
        <div className="mo-section__head mo-reveal">
          <Eyebrow icon={LayoutDashboard}>The Fixfy Trade Portal</Eyebrow>
          <h2 className="mo-h2">
            Jobs, quotes and pay in one place<span className="mo-dot">.</span>
          </h2>
          <p className="mo-lede">Accept jobs, send quotes, report with photos and see what you earn. On the desktop portal and in the Fixfy app.</p>
        </div>

        <div className="ps mo-reveal">
          <div className="ps-tabs" role="tablist" aria-label="What you can do in the portal">
            {FEATURES.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                id={`ps-tab-${f.id}`}
                aria-selected={tab === f.id}
                aria-controls="ps-window"
                className={`ps-tab${tab === f.id ? ' is-on' : ''}`}
                onClick={() => setTab(f.id)}
              >
                <span className="ps-tab__icon">
                  <f.icon size={20} />
                </span>
                <span className="ps-tab__text">
                  <b>{f.title}</b>
                  <span>{f.text}</span>
                </span>
              </button>
            ))}
            <p className="ps-desc" aria-live="polite">
              {feature.text}
            </p>
            <ul className="ps-extras" aria-label="Also in the portal">
              {EXTRAS.map((e) => (
                <li key={e.text}>
                  <e.icon size={15} /> {e.text}
                </li>
              ))}
            </ul>
          </div>

          <figure className="ps-window" id="ps-window" role="tabpanel" aria-labelledby={`ps-tab-${tab}`}>
            <div className="ps-bar">
              <i />
              <i />
              <i />
              <span>partners.getfixfy.com</span>
            </div>
            <div className="ps-app">
              <nav className="ps-side" aria-hidden="true">
                <img src="/b2c/fixfy-navy.png" alt="" width="85" height="30" />
                {MENU.map((m) => (
                  <span key={m.id} className={m.id === feature.menu ? 'is-on' : undefined}>
                    <m.icon size={15} /> {m.label}
                  </span>
                ))}
              </nav>
              <div className="ps-screen" key={tab}>
                <Screen />
              </div>
            </div>
            <figcaption>Simplified illustration of the portal. Jobs and amounts are examples.</figcaption>
          </figure>
        </div>

        <div className="ps-cta mo-reveal">
          <a href={PARTNER_JOIN} className="mo-btn mo-btn--primary">
            Join and open your portal <ArrowRight size={17} />
          </a>
        </div>
      </div>
    </section>
  )
}
