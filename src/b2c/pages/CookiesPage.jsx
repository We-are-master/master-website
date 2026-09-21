import { useEffect, useState } from 'react'
import { Cookie, SlidersHorizontal } from 'lucide-react'
import B2CLayout from '../components/Chrome.jsx'
import { Eyebrow } from '../components/Sections.jsx'
import { COMPANY } from '../content/site.js'
import { CONSENT_EVENT, openCookieSettings, readConsent } from '../../lib/consent.js'
import { usePageMeta } from '../lib/meta.js'

// O que cada categoria do banner liga (o carregador mora no index.html).
const GROUPS = [
  {
    id: 'necessary',
    title: 'Strictly necessary',
    text: 'The site cannot take a booking without these. They are never used for advertising.',
    rows: [
      ['cookieConsent', 'Fixfy', 'Remembers your cookie choice.', 'Until you change it'],
      ['fx_b2c_booking_v1', 'Fixfy', 'Keeps your booking if the page reloads before you pay.', 'Until you close the tab'],
      ['__stripe_mid, __stripe_sid', 'Stripe', 'Fraud prevention on the card payment form.', '1 year and 30 minutes'],
      ['_vcrcs', 'Vercel', 'Checks that visitors are people, not bots.', 'Short-lived'],
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    text: 'How visitors use the site, so we can fix what gets in the way. Page views are also counted by Vercel Web Analytics, which stores nothing on your device and runs for everyone.',
    rows: [
      ['fx_b2c_attr', 'Fixfy', 'The page or campaign (UTM tags) that brought you, kept with your booking so we know which channels bring bookings.', 'Until you close the tab'],
      ['_ga, _ga_*', 'Google Analytics', 'Counts visits and the pages people view.', 'Up to 2 years'],
      ['_clck, _clsk, CLID', 'Microsoft Clarity', 'Heatmaps and recordings of how pages are used.', 'Up to 1 year'],
      ['zab*, zps-*, zft-*, zsc*', 'Zoho PageSense', 'Heatmaps and page tests.', 'Session to 1 year'],
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing',
    text: 'Measures our Facebook and Instagram ads and helps show them to people who are likely to need us.',
    rows: [
      ['_fbp, _fbc', 'Meta Pixel', 'Measures visits and bookings that come from our ads.', 'Up to 90 days'],
      ['Booking sent to Meta', 'Fixfy and Meta', 'When you book, our server sends Meta the booking value and a scrambled (hashed) copy of your email and phone, so the booking is counted once.', 'Kept by Meta under its own terms'],
      ['Google Tag Manager', 'Google', 'Loads the tags above. Runs only with Analytics and Marketing both on.', 'No cookie of its own'],
    ],
  },
  {
    id: 'functional',
    title: 'Functional',
    text: 'Extras you do not need to book.',
    rows: [['Zoho SalesIQ', 'Zoho', 'The live chat window and your chat history.', 'Session to 1 year']],
  },
]

const STATE = { on: 'On', off: 'Off', always: 'Always on' }

function stateOf(id, choice) {
  if (id === 'necessary') return STATE.always
  if (!choice) return 'Off until you choose'
  return choice[id] ? STATE.on : STATE.off
}

export default function CookiesPage() {
  usePageMeta({
    title: 'Cookies | Fixfy',
    description: 'The cookies on getfixfy.com, what each one does and how to change your choice.',
    path: '/cookies',
  })

  const [choice, setChoice] = useState(null)
  useEffect(() => {
    setChoice(readConsent())
    const update = (e) => setChoice(e.detail || readConsent())
    window.addEventListener(CONSENT_EVENT, update)
    return () => window.removeEventListener(CONSENT_EVENT, update)
  }, [])

  return (
    <B2CLayout>
      <section className="mo-section">
        <div className="mo-wrap">
          <div className="mo-section__head">
            <Eyebrow icon={Cookie}>Cookie policy</Eyebrow>
            <h1 className="mo-h2">
              Cookies<span className="mo-dot">.</span>
            </h1>
            <p className="mo-lede">
              Nothing that tracks you runs until you choose. The strictly necessary ones keep your booking working; everything
              else waits for a yes in the cookie banner, and you can change your mind at any time.
            </p>
            <button type="button" className="mo-btn mo-btn--dark mo-legal__cta" onClick={openCookieSettings}>
              <SlidersHorizontal size={18} strokeWidth={2.2} aria-hidden="true" /> Change cookie settings
            </button>
          </div>

          <div className="mo-legal">
            {GROUPS.map((g) => (
              <section key={g.id} className="mo-legal__group" aria-labelledby={`ck-${g.id}`}>
                <h2 id={`ck-${g.id}`}>
                  {g.title}
                  <span className={`mo-legal__state${choice?.[g.id] || g.id === 'necessary' ? ' is-on' : ''}`}>
                    {stateOf(g.id, choice)}
                  </span>
                </h2>
                <p>{g.text}</p>
                <div className="mo-legal__table">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Set by</th>
                        <th scope="col">What it does</th>
                        <th scope="col">How long</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.rows.map(([name, by, what, time]) => (
                        <tr key={name}>
                          <td>
                            <code>{name}</code>
                          </td>
                          <td>{by}</td>
                          <td>{what}</td>
                          <td>{time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}

            <div className="mo-legal__foot">
              <p>
                Turning a category off deletes its cookies from this browser and reloads the page. You can also use{' '}
                <b>Cookie settings</b> at the bottom of any page. Questions go to{' '}
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
              </p>
              <p>Last updated 21 September 2026.</p>
            </div>
          </div>
        </div>
      </section>
    </B2CLayout>
  )
}
