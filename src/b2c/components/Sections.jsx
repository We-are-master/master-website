import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Camera,
  Check,
  CheckCircle2,
  ClipboardCheck,
  HelpCircle,
  ListChecks,
  MapPin,
  Plus,
  RotateCcw,
  Send,
  Share2,
  Star,
  Tag,
  Users,
} from 'lucide-react'
import { CERT, CLEAN, FIX, FROM_PRICE, PAINT, PROPERTY_SIZES, certPrice, cleanPrice, formatGBP, priceSelection } from '../content/pricing.js'
import { AREA_GROUPS, OUTER_BOROUGHS, PROMISES, formatPostcode, isCovered, looksLikePostcode, postcodeArea } from '../content/site.js'
import { CHECKLIST, CHECKLIST_COUNT, FAQS, REVIEWS, REVIEW_SOURCES } from '../content/copy.js'
import { bookingHref } from '../lib/store.js'
import ReportCard from './ReportCard.jsx'

const RECLEAN = PROMISES.recleanDays.value

/** Rótulo de seção: Inter semibold, só a primeira maiúscula, ícone laranja do assunto. */
export function Eyebrow({ icon: Icon, children }) {
  return (
    <span className="mo-eyebrow">
      {Icon && <Icon size={16} strokeWidth={2.2} aria-hidden="true" />}
      {children}
    </span>
  )
}

/** `reclean={false}` na página do deep clean: o re-clean grátis é promessa do end of tenancy. */
export function Promises({ className = '', reclean = true }) {
  return (
    <ul className={`mo-promises ${className}`}>
      <li>
        <Tag size={17} /> Fixed prices, VAT included
      </li>
      <li>
        <Camera size={17} /> Photo of every room
      </li>
      {reclean ? (
        <li>
          <RotateCcw size={17} /> Free re-clean within {RECLEAN} days
        </li>
      ) : (
        <li>
          <CalendarCheck size={17} /> Free changes up to {PROMISES.freeCancellationHours} hours before
        </li>
      )}
    </ul>
  )
}

/* ---------- Jobs populares ---------- */

const POPULAR = [
  { label: 'Studio move-out clean', preset: { services: ['clean'], size: 'studio' } },
  { label: '1 bed move-out clean', preset: { services: ['clean'], size: '1' } },
  { label: '2 bed move-out clean', preset: { services: ['clean'], size: '2' } },
  { label: '2 bed move-out clean with carpets', preset: { services: ['clean'], size: '2', extras: { carpet: 3 } } },
  { label: '1 bed deep clean', preset: { services: ['clean'], kind: 'deep', size: '1' } },
  { label: '2 bed deep clean', preset: { services: ['clean'], kind: 'deep', size: '2' } },
  { label: 'Touch-up painting', preset: { services: ['paint'], paint: { option: 'touchup' } } },
  { label: 'Repaint a room', preset: { services: ['paint'], paint: { option: 'rooms', rooms: 1 } } },
  { label: 'Reseal a bath', preset: { services: ['fix'], fixPackage: 'half', fixTasks: ['silicone'] } },
  { label: 'Fill holes, take shelves down', preset: { services: ['fix'], fixPackage: 'half', fixTasks: ['holes', 'brackets'] } },
  { label: 'Gas safety certificate', preset: { services: ['cert'], cert: ['gas'] } },
  { label: 'Electrical report, 2 bed', preset: { services: ['cert'], cert: ['eicr'], size: '2' } },
]

function presetPrice(preset) {
  return priceSelection({
    services: preset.services,
    size: preset.size,
    bathrooms: 1,
    clean: { kind: preset.kind, extras: preset.extras || {} },
    paint: preset.paint || { option: 'touchup', rooms: 1 },
    fix: { package: preset.fixPackage || null, tasks: preset.fixTasks || [] },
    cert: { items: preset.cert || [], boiler: preset.boiler === true },
  }).total
}

export function PopularJobs({ centered = false }) {
  return (
    <div className={`mo-popwrap mo-reveal${centered ? ' mo-popwrap--center' : ''}`}>
      {centered ? (
        <h2 className="mo-h2">
          Popular jobs<span className="mo-dot">.</span>
        </h2>
      ) : (
        <p className="mo-pop-label">Popular jobs</p>
      )}
      <div className="mo-popular">
        {POPULAR.map((p) => (
          <Link key={p.label} to={bookingHref(p.preset)} className="mo-pop">
            {p.label}
            <b>{formatGBP(presetPrice(p.preset))}</b>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ---------- Os três serviços ---------- */

const SERVICE_CARDS = [
  {
    id: 'clean',
    verb: 'Clean',
    name: 'End of tenancy or deep clean',
    img: '/b2c/img/svc-clean.webp',
    alt: 'Cleaner in orange gloves cleaning an oven door',
    to: '/end-of-tenancy-cleaning',
    points: [
      'Every room done to our room-by-room checklist',
      'Oven deep clean included. Carpets and fridge as add-ons, priced up front',
      'Photos of every room when we finish',
    ],
  },
  {
    id: 'paint',
    verb: 'Paint',
    name: 'Fresh coat',
    img: '/b2c/img/svc-paint.webp',
    alt: 'Painter rolling white paint on a bedroom wall',
    to: '/painting',
    points: [
      'Holes filled, marks and scuffs touched up',
      'Full repaints priced per room',
      'Done before the clean, so no dust is left behind',
    ],
  },
  {
    id: 'fix',
    verb: 'Fix',
    name: 'Move-out repairs',
    img: '/b2c/img/svc-fix.webp',
    alt: 'Handyman filling nail holes in a hallway wall',
    to: '/repairs',
    points: [
      'Handles, hinges, rails, sealant and the rest of the list',
      'A half day or a full day, no call-out fee',
      'Parts listed in your photo report',
    ],
  },
  {
    id: 'cert',
    verb: 'Certify',
    name: 'Landlord certificates',
    img: '/b2c/img/svc-cert.webp',
    alt: 'Gas engineer checking a boiler in a London flat kitchen',
    to: '/landlord-certificates',
    points: [
      'Gas safety, electrical safety and appliance testing',
      'Signed by registered engineers, certificate the same day',
      'Expiry date kept on file for the next renewal',
    ],
  },
]

export function ServicesTrio() {
  return (
    <>
      <div className="mo-services">
        {SERVICE_CARDS.map((s) => (
          <Link key={s.id} to={s.to} className="mo-svc mo-reveal">
            <div className="mo-svc__img">
              <img src={s.img} alt={s.alt} loading="lazy" width="1200" height="896" />
            </div>
            <div className="mo-svc__body">
              <div className="mo-svc__verb">
                {s.verb}
                <span className="mo-dot">.</span>
              </div>
              <div className="mo-svc__name">{s.name}</div>
              <ul className="mo-svc__list">
                {s.points.map((p) => (
                  <li key={p}>
                    <Check size={16} strokeWidth={2.6} />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mo-svc__foot">
                <span className="mo-from">
                  from<b>{formatGBP(FROM_PRICE[s.id])}</b>
                </span>
                <span className="mo-link">
                  Prices <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mo-day mo-reveal">
        <div>
          <div className="mo-day__title">Book two or three together and we plan the order.</div>
          <p className="mo-day__text">The order matters on a move-out, so you do not have to think about it.</p>
        </div>
        <ol className="mo-day__steps">
          <li>
            <time>First</time>
            <b>Repairs</b>
            <span>Holes filled, shelves down</span>
          </li>
          <li>
            <time>Then</time>
            <b>Fresh coat</b>
            <span>Paint goes on clean filler</span>
          </li>
          <li>
            <time>Last</time>
            <b>The clean</b>
            <span>So no dust is left behind</span>
          </li>
          <li>
            <time>Same day</time>
            <b>Photo report</b>
            <span>Every room, on your phone</span>
          </li>
        </ol>
      </div>
    </>
  )
}

/* ---------- Pague depois das fotos ---------- */

/** `kind="deep"`: sem o re-clean e sem o "encaminhe ao agente", que são do end of tenancy. */
export function PayAfterPhotos({ kind = 'eot' }) {
  return (
    <section className="mo-section mo-section--navy" id="how-it-works">
      <div className="mo-wrap mo-pay">
        <div className="mo-reveal">
          <Eyebrow icon={ListChecks}>How it works</Eyebrow>
          <h2 className="mo-h2">
            Priced now. Booked online. Done from tomorrow<span className="mo-dot">.</span>
          </h2>
          <p className="mo-lede">
            The price is fixed before you book and paid by card at checkout, so there is nothing to sort out on the day.
            The team photographs every room as they finish it.
          </p>
          <ol className="mo-steps">
            <li>
              <div>
                <b>Today: get your fixed price and book</b>
                <p>
                  Pick the jobs and the size of the place, choose a day, pay by card through Stripe. Your receipt and the
                  booking confirmation arrive straight away.
                </p>
              </div>
            </li>
            <li>
              <div>
                <b>Pick a day, from tomorrow</b>
                <p>
                  Monday to Saturday, in a three-hour slot between 9am and 6pm, or any time that day. Book before 2pm
                  for a next-day slot. We call the day before to confirm the team and how we get in.
                </p>
              </div>
            </li>
            <li>
              <div>
                <b>On the day: the work, then the photos</b>
                {kind === 'deep' ? (
                  <p>
                    Repairs first, then paint, then the clean. A 2 bed clean takes 4 to 6 hours. The photo report lands on
                    your phone the same day.
                  </p>
                ) : (
                  <p>
                    Repairs first, then paint, then the clean. A 2 bed clean takes 4 to 6 hours. The photo report lands on
                    your phone the same day, ready to forward to your agent. Something on the checklist missed? Tell us
                    within {RECLEAN} days and we come back free.
                  </p>
                )}
              </div>
            </li>
          </ol>
        </div>
        <div className="mo-phone mo-reveal" aria-hidden="true">
          <div className="mo-phone__screen">
            <div className="mo-phone__bar">
              <span>16:20</span>
              <span>Fixfy</span>
            </div>
            <ReportCard animate={false} />
            <div className="mo-phone__actions">
              <span>
                <Share2 size={15} /> Share
              </span>
              <span>
                <Send size={15} /> Send to agent
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- O padrão, cômodo a cômodo ---------- */

/** Mesma lista nos dois tipos; o deep clean troca o texto de check-out e fica sem o re-clean. */
export function CheckoutStandard({ kind = 'eot' }) {
  const [tab, setTab] = useState(CHECKLIST[0].id)
  const room = CHECKLIST.find((r) => r.id === tab)
  const deep = kind === 'deep'
  return (
    <section className="mo-section" id="standard">
      <div className="mo-wrap mo-standard">
        <div className="mo-reveal">
          <Eyebrow icon={ClipboardCheck}>{deep ? 'Room by room' : 'The check-out standard'}</Eyebrow>
          <h2 className="mo-h2">
            {deep ? 'Every room, top to bottom' : 'Cleaned for check-out day, not just cleaned'}
            <span className="mo-dot">.</span>
          </h2>
          {deep ? (
            <p className="mo-lede">
              Our room-by-room checklist, done in the home you live in. We work around your furniture and belongings, and
              clean inside the cupboards and wardrobes you empty for us.
            </p>
          ) : (
            <p className="mo-lede">
              Inventory clerks do not check whether a flat looks clean. They check the oven door, the grout and the top of
              the skirting boards. So that is what our checklist covers, room by room, on every clean.
            </p>
          )}
          <div className="mo-stat-row">
            <div className="mo-stat">
              <b className="mo-num">{CHECKLIST_COUNT}</b>
              <span>checks on every clean</span>
            </div>
            {!deep && (
              <div className="mo-stat">
                <b className="mo-num">{RECLEAN} days</b>
                <span>to ask for a free re-clean</span>
              </div>
            )}
          </div>
        </div>
        <div className="mo-checklist mo-reveal">
          <div className="mo-checklist__tabs" role="tablist" aria-label="Rooms">
            {CHECKLIST.map((r) => (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={tab === r.id}
                className="mo-checklist__tab"
                onClick={() => setTab(r.id)}
              >
                {r.room}
              </button>
            ))}
          </div>
          <ul className="mo-checklist__list" role="tabpanel" aria-label={room.room}>
            {room.items.map((item) => (
              <li key={item}>
                <span className="mo-tick" aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          {room.addOns.length > 0 && (
            <div className="mo-checklist__addons">
              Add-ons for this room:
              {room.addOns.map((a) => (
                <span key={a} className="mo-addon">
                  <Plus size={12} strokeWidth={3} />
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- Para quem ---------- */

export function Audiences() {
  return (
    <section className="mo-section mo-section--paper">
      <div className="mo-wrap">
        <div className="mo-section__head mo-reveal">
          <Eyebrow icon={Users}>Who we work for</Eyebrow>
          <h2 className="mo-h2">
            Moving out, re-letting or managing the keys<span className="mo-dot">.</span>
          </h2>
        </div>
        <div className="mo-aud">
          <article className="mo-aud__card mo-reveal">
            <div className="mo-aud__img">
              <img src="/b2c/img/tenant.webp" alt="Tenant carrying a moving box out of an empty flat" loading="lazy" />
            </div>
            <div className="mo-aud__body">
              <span className="mo-aud__who">Tenants moving out</span>
              <h3 className="mo-aud__title">Hand back the keys with proof in your pocket.</h3>
              <p className="mo-aud__text">
                The clean, the touch-ups and the little fixes in one booking, and a photo report you can forward to your
                agent before check-out.
              </p>
            </div>
          </article>
          <article className="mo-aud__card mo-reveal">
            <div className="mo-aud__img">
              <img src="/b2c/img/keys.webp" alt="Keys being left on a clean kitchen worktop" loading="lazy" />
            </div>
            <div className="mo-aud__body">
              <span className="mo-aud__who">Landlords between tenants</span>
              <h3 className="mo-aud__title">Re-let ready without going round to look.</h3>
              <p className="mo-aud__text">
                Clean, fresh coat and repairs on the same booking, with a photo of every room so you can list it the same
                evening.
              </p>
            </div>
          </article>
          <article className="mo-aud__card mo-aud__card--navy mo-reveal">
            <div className="mo-aud__body">
              <div style={{ display: 'grid', gap: 10 }}>
                <span className="mo-aud__who">Letting agents</span>
                <h3 className="mo-aud__title">One number for every check-out.</h3>
                <p className="mo-aud__text">Send us the address and the check-out date. We handle the rest and send the photos.</p>
              </div>
              <ul className="mo-aud__list">
                <li>
                  <Check size={16} strokeWidth={2.6} /> Account prices for regular check-outs
                </li>
                <li>
                  <Check size={16} strokeWidth={2.6} /> Book by email, no forms for your tenants
                </li>
                <li>
                  <Check size={16} strokeWidth={2.6} /> A photo report on every job
                </li>
              </ul>
              <Link to="/contact" className="mo-btn mo-btn--primary">
                Open an agent account <ArrowRight size={18} />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

/* ---------- Reviews (só reais; em dev, amostra marcada para ver o layout) ---------- */

/**
 * Nota na frente das estrelas, como no Google: "4.8 ★★★★★". A nota é a da
 * review; com decimal (média por quesito), a última estrela enche em parte.
 */
function Stars({ n = 5 }) {
  const v = Math.max(0, Math.min(5, Number(n) || 0))
  return (
    <span className="mo-stars" role="img" aria-label={`${v.toFixed(1)} out of 5 stars`}>
      <b className="mo-stars__score">{v.toFixed(1)}</b>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, v - i))
        return (
          <span key={i} className="mo-star">
            <Star size={16} fill="none" strokeWidth={1.8} />
            {fill > 0 && (
              <span className="mo-star__fill" style={{ width: `${fill * 100}%` }}>
                <Star size={16} fill="currentColor" strokeWidth={1.8} />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

const SERVICE_LABEL = { clean: 'End of tenancy clean', paint: 'Fresh coat', fix: 'Repairs' }
const SERVICE_SHORT = { clean: 'Clean', paint: 'Paint', fix: 'Repairs' }

/** "End of tenancy clean" sozinho; "Clean + paint" quando a review cobre mais de um. */
function serviceLabel(service) {
  const list = [].concat(service || [])
  if (list.length < 2) return SERVICE_LABEL[list[0]] || ''
  const names = list.map((s, i) => (i ? SERVICE_SHORT[s].toLowerCase() : SERVICE_SHORT[s]))
  return `${names.slice(0, -1).join(', ')} + ${names.at(-1)}`
}

/** Um cartão de review. */
function ReviewCard({ r }) {
  return (
    <article className="mo-review">
      <div className="mo-review__top">
        <Stars n={r.rating} />
        <span className="mo-price__note">{serviceLabel(r.service)}</span>
      </div>
      <p className="mo-review__text">{r.text}</p>
      {r.photos?.length > 0 && (
        <div className="mo-review__photos">
          {r.photos.slice(0, 3).map((p) => (
            <img key={p} src={p} alt="" loading="lazy" />
          ))}
        </div>
      )}
      <div className="mo-review__by">
        {r.avatar ? (
          <img className="mo-avatar mo-avatar--photo" src={r.avatar} alt="" loading="lazy" width="44" height="44" />
        ) : (
          <span className="mo-avatar" aria-hidden="true">
            {r.name.slice(0, 1)}
          </span>
        )}
        <div className="mo-review__who">
          <b>{r.name}</b>
          <span>
            {r.area} · {r.dateLabel}
          </span>
        </div>
        <span className="mo-verified">
          <BadgeCheck size={15} /> {r.source === 'google' ? 'Google' : r.source === 'trustpilot' ? 'Trustpilot' : 'Booked job'}
        </span>
      </div>
    </article>
  )
}

/**
 * Duas filas girando em sentidos opostos, sem fim. Cada fila leva os cartões
 * duas vezes e anda metade da largura: o fim encosta no começo sem salto.
 * Com pouca review (menos de 6) vira grade parada, que carrossel de dois
 * cartões parece vazio.
 */
function ReviewRow({ items, reverse, seconds }) {
  return (
    <div className={`mo-marquee${reverse ? ' mo-marquee--reverse' : ''}`} style={{ '--mo-marquee-dur': `${seconds}s` }}>
      <div className="mo-marquee__track">
        {[...items, ...items].map((r, i) => (
          <div key={`${r.id}-${i}`} className="mo-marquee__item" aria-hidden={i >= items.length ? 'true' : undefined}>
            <ReviewCard r={r} />
          </div>
        ))}
      </div>
    </div>
  )
}

/** As reviews reais; em dev, sem nenhuma real, os placeholders (nunca entram no build). */
function useReviewList() {
  const [samples, setSamples] = useState([])
  useEffect(() => {
    if (import.meta.env.DEV && REVIEWS.length === 0) {
      import('../content/reviews.sample.js').then((m) => setSamples(m.SAMPLE_REVIEWS))
    }
  }, [])
  return REVIEWS.length ? REVIEWS : samples
}

/** Destaca `hl` (um trecho do próprio texto), como a frase verde do site Growth. */
function withHighlight(text, hl) {
  const i = hl ? text.indexOf(hl) : -1
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark>{hl}</mark>
      {text.slice(i + hl.length)}
    </>
  )
}

/**
 * Faixa de reviews passando no pé do hero, no molde da faixa do site Growth:
 * cartão curto, estrelas, a frase que importa em destaque, rosto e nome.
 * É vitrine: as mesmas reviews estão inteiras na seção Reviews, por isso fica
 * fora do leitor de tela. Sem review, não aparece.
 */
export function ReviewTicker() {
  const list = useReviewList()
  const short = list.filter((r) => r.quote)
  const items = (short.length >= 4 ? short : list).slice(0, 12)
  if (items.length < 4) return null
  return (
    <div className="mo-ticker" aria-hidden="true">
      <div className="mo-ticker__track" style={{ '--mo-ticker-dur': `${items.length * 8}s` }}>
        {[...items, ...items].map((r, i) => (
          <figure key={`${r.id}-${i}`} className="mo-tq">
            <Stars n={r.rating} />
            <blockquote>“{withHighlight(r.quote || r.text, r.hl)}”</blockquote>
            <figcaption>
              {r.avatar ? (
                <img src={r.avatar} alt="" width="38" height="38" loading="lazy" />
              ) : (
                <span className="mo-avatar">{r.name.slice(0, 1)}</span>
              )}
              <span>
                <b>{r.name}</b>
                <small>
                  {r.area} · {serviceLabel(r.service)}
                </small>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

export function Reviews() {
  const list = useReviewList()
  const sources = REVIEW_SOURCES.filter((s) => s.url && s.rating && s.count)
  if (list.length === 0) return null
  const rows = [list.filter((_, i) => i % 2 === 0), list.filter((_, i) => i % 2 === 1)]

  return (
    <section className="mo-section mo-section--paper mo-section--reviews" id="reviews">
      <div className="mo-wrap">
        <div className="mo-reviews__head mo-reveal">
          <div className="mo-section__head">
            <Eyebrow icon={Star}>Reviews</Eyebrow>
            <h2 className="mo-h2">
              Real rooms, real reviews<span className="mo-dot">.</span>
            </h2>
            <p className="mo-lede">Every review comes from a booked job, with the photos from its report when the customer shares them.</p>
          </div>
          {sources.length > 0 && (
            <div className="mo-sources">
              {sources.map((s) => (
                <a key={s.id} className="mo-source" href={s.url} target="_blank" rel="noreferrer">
                  <b>{s.rating}</b> {s.label} · {s.count} reviews
                </a>
              ))}
            </div>
          )}
        </div>
        {list.length < 6 && (
          <div className="mo-reviews">
            {list.map((r) => (
              <ReviewCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </div>
      {list.length >= 6 && (
        <div className="mo-marquees" aria-label="Customer reviews">
          <ReviewRow items={rows[0]} seconds={Math.max(40, rows[0].length * 7)} />
          <ReviewRow items={rows[1]} seconds={Math.max(40, rows[1].length * 7)} reverse />
        </div>
      )}
    </section>
  )
}

/* ---------- Preços ---------- */

export function PriceTables() {
  return (
    <section className="mo-section mo-section--paper" id="prices">
      <div className="mo-wrap">
        <div className="mo-section__head mo-reveal">
          <Eyebrow icon={Tag}>Prices</Eyebrow>
          <h2 className="mo-h2">
            Every price, before you ask<span className="mo-dot">.</span>
          </h2>
          <p className="mo-lede">No quotes to chase for a normal move-out. What you see here is what goes on the booking.</p>
        </div>
        <div className="mo-prices">
          <div className="mo-pricecard mo-reveal">
            <div className="mo-pricecard__head">
              <span className="mo-pricecard__verb">
                Clean<span className="mo-dot">.</span>
              </span>
              <span className="mo-pricecard__name">End of tenancy or deep clean</span>
            </div>
            {/* Os dois tipos lado a lado; o preço de cada um sai do pricing.js (deep = 90% arredondado para baixo). */}
            <table className="mo-pricetable">
              <caption className="mo-sr">Cleaning prices by size, VAT included</caption>
              <thead>
                <tr>
                  <th scope="col">
                    <span className="mo-sr">Size</span>
                  </th>
                  {CLEAN.kinds.map((k) => (
                    <th key={k.id} scope="col">
                      {k.tiny}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROPERTY_SIZES.map((s) => (
                  <tr key={s.id}>
                    <th scope="row">{s.label}</th>
                    {CLEAN.prices[s.id] == null ? (
                      <td colSpan={CLEAN.kinds.length}>Photo quote</td>
                    ) : (
                      CLEAN.kinds.map((k) => <td key={k.id}>{formatGBP(cleanPrice(s.id, k.id))}</td>)
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <Link to={bookingHref({ services: ['clean'], size: '2' })} className="mo-btn mo-btn--dark">
              Book a clean <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mo-pricecard mo-reveal">
            <div className="mo-pricecard__head">
              <span className="mo-pricecard__verb">
                Paint<span className="mo-dot">.</span>
              </span>
              <span className="mo-pricecard__name">Fresh coat</span>
            </div>
            <ul className="mo-pricelist">
              {PAINT.options.map((o) => (
                <li key={o.id}>
                  <span>
                    {o.label}
                    <small>{o.detail}</small>
                  </span>
                  <b>
                    {formatGBP(o.price)}
                    {o.unit ? ` a ${o.unit}` : ''}
                  </b>
                </li>
              ))}
            </ul>
            <Link to={bookingHref({ services: ['paint'], paint: { option: 'touchup' } })} className="mo-btn mo-btn--dark">
              Book the painter <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mo-pricecard mo-reveal">
            <div className="mo-pricecard__head">
              <span className="mo-pricecard__verb">
                Fix<span className="mo-dot">.</span>
              </span>
              <span className="mo-pricecard__name">Repairs</span>
            </div>
            <ul className="mo-pricelist">
              {FIX.packages.map((p) => (
                <li key={p.id}>
                  <span>
                    {p.label}
                    {p.detail && <small>{p.detail}</small>}
                  </span>
                  <b>{formatGBP(p.price)}</b>
                </li>
              ))}
            </ul>
            <p className="mo-price__note">No call-out fee. Parts are billed at the end and listed in your photo report.</p>
            <Link to={bookingHref({ services: ['fix'], fixPackage: 'half' })} className="mo-btn mo-btn--dark">
              Book repairs <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mo-pricecard mo-reveal">
            <div className="mo-pricecard__head">
              <span className="mo-pricecard__verb">
                Certify<span className="mo-dot">.</span>
              </span>
              <span className="mo-pricecard__name">Landlord certificates</span>
            </div>
            <ul className="mo-pricelist">
              {CERT.items.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.short}
                    <small>{item.valid}</small>
                  </span>
                  <b>{item.prices ? `from ${formatGBP(certPrice(item, 'studio'))}` : formatGBP(item.price)}</b>
                </li>
              ))}
              <li>
                <span>
                  {CERT.items[0].addOn.label.replace('Add a full ', 'Full ')}
                  <small>{CERT.items[0].addOn.detail}</small>
                </span>
                <b>+{formatGBP(CERT.items[0].addOn.price)}</b>
              </li>
            </ul>
            <p className="mo-price__note">Signed by Gas Safe and NICEIC or NAPIT registered engineers. Certificate and photo report the same day.</p>
            <Link to={bookingHref({ services: ['cert'], cert: ['gas'] })} className="mo-btn mo-btn--dark">
              Book certificates <ArrowRight size={18} />
            </Link>
          </div>
        </div>
        <div className="mo-fineprint">
          <span>
            <CheckCircle2 size={16} /> All prices include VAT
          </span>
          <span>
            <CheckCircle2 size={16} /> Secure card payment by Stripe at checkout
          </span>
          <span>
            <CheckCircle2 size={16} /> Free changes up to {PROMISES.freeCancellationHours} hours before, full refund
          </span>
        </div>
      </div>
    </section>
  )
}

/* ---------- Áreas ---------- */

export function usePostcodeCheck(postcode) {
  const [state, setState] = useState({ status: 'idle' })
  useEffect(() => {
    const pc = postcode.trim()
    if (!looksLikePostcode(pc)) {
      setState({ status: pc.length >= 5 ? 'invalid' : 'idle' })
      return undefined
    }
    let cancelled = false
    setState({ status: 'checking' })
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(pc)}`)
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (res.status === 404 || !data?.result) {
          setState({ status: 'unknown' })
          return
        }
        const r = data.result
        setState({
          status: isCovered(r.postcode) ? 'covered' : 'outside',
          postcode: r.postcode,
          place: r.admin_ward || r.parish || '',
          district: r.admin_district || '',
        })
      } catch {
        if (cancelled) return
        // Sem internet para o postcodes.io: decide pelo prefixo.
        setState({ status: isCovered(pc) ? 'covered' : 'outside', postcode: formatPostcode(pc), place: '', district: '' })
      }
    }, 350)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [postcode])
  return state
}

export function PostcodeResult({ check }) {
  if (check.status === 'checking') return <p className="mo-pc-result">Checking…</p>
  if (check.status === 'invalid') return <p className="mo-pc-result is-no">That does not look like a full UK postcode yet.</p>
  if (check.status === 'unknown') return <p className="mo-pc-result is-no">We could not find that postcode. Check it and try again.</p>
  if (check.status === 'covered') {
    const where = [check.place, check.district].filter(Boolean).join(', ')
    return (
      <p className="mo-pc-result is-yes">
        <CheckCircle2 size={18} /> We cover {check.postcode}
        {where ? ` · ${where}` : ''}
      </p>
    )
  }
  if (check.status === 'outside') {
    return (
      <p className="mo-pc-result is-no">
        <MapPin size={18} /> {check.postcode} is outside London for now. We only book London postcodes.
      </p>
    )
  }
  return null
}

export function Areas() {
  const [pc, setPc] = useState('')
  const check = usePostcodeCheck(pc)
  const area = postcodeArea(pc)
  const bookLink = useMemo(() => `/book${check.status === 'covered' ? `?pc=${encodeURIComponent(check.postcode)}` : ''}`, [check])

  return (
    <section className="mo-section" id="areas">
      <div className="mo-wrap mo-areas">
        <div className="mo-reveal">
          <Eyebrow icon={MapPin}>Where we work</Eyebrow>
          <h2 className="mo-h2">
            All of London, Monday to Saturday<span className="mo-dot">.</span>
          </h2>
          <p className="mo-lede">Every London postcode, from the centre to the outer boroughs. Type yours to check the day you want is free.</p>
          <label className="mo-sr" htmlFor="mo-pc">
            Your postcode
          </label>
          <div className="mo-pc">
            <input
              id="mo-pc"
              className="mo-input mo-input--pc"
              placeholder="e.g. SE15 4ST"
              autoComplete="postal-code"
              value={pc}
              maxLength={8}
              onChange={(e) => setPc(e.target.value.toUpperCase())}
            />
            <Link to={bookLink} className="mo-btn mo-btn--primary">
              Book
            </Link>
          </div>
          <PostcodeResult check={check} />
          {area && check.status === 'idle' && <p className="mo-areanote">Keep typing the full postcode.</p>}
        </div>
        <div className="mo-areagroups mo-reveal">
          {AREA_GROUPS.map((g) => (
            <div key={g.code} className="mo-areagroup">
              <div className="mo-areagroup__head">
                <b>{g.area}</b>
                <span>{g.code} postcodes</span>
              </div>
              <div className="mo-places">
                {g.places.map((p) => (
                  <span key={p} className="mo-place">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <p className="mo-areanote">And the outer boroughs: {OUTER_BOROUGHS.join(', ')} and more.</p>
        </div>
      </div>
    </section>
  )
}

/* ---------- FAQ ---------- */

export function Faq({ items = FAQS, title = 'Questions people ask before they book' }) {
  return (
    <section className="mo-section" id="faq">
      <div className="mo-wrap mo-faq-wrap">
        <div className="mo-reveal">
          <Eyebrow icon={HelpCircle}>FAQ</Eyebrow>
          <h2 className="mo-h2">
            {title}
            <span className="mo-dot">.</span>
          </h2>
        </div>
        <div className="mo-faq mo-reveal">
          {items.map((f) => (
            <details key={f.q}>
              <summary>
                {f.q}
                <Plus size={20} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Fecho ---------- */

export function FinalCta({ title = 'Know your price before you book.', to = '/book', reclean = true }) {
  return (
    <section className="mo-section mo-section--navy">
      <div className="mo-wrap mo-final mo-reveal">
        <Eyebrow icon={CalendarCheck}>One booking</Eyebrow>
        <h2 className="mo-h2">
          {title}
        </h2>
        <p className="mo-lede">Get a fixed price in under a minute and book online. Photos of every room when we finish.</p>
        <div className="mo-final__actions">
          <Link to={to} className="mo-btn mo-btn--primary mo-btn--lg">
            Get my price <ArrowRight size={18} />
          </Link>
          <a href="/#prices" className="mo-btn mo-btn--on-navy mo-btn--lg">
            See all prices
          </a>
        </div>
        <Promises reclean={reclean} />
      </div>
    </section>
  )
}

/* ---------- CTA fixo no celular ---------- */

export function StickyCta({ label = 'Fixed prices from', amount = FROM_PRICE.clean, to = '/book', after = 560 }) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY > document.body.scrollHeight - 700
      setOn(window.scrollY > after && !nearBottom)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [after])
  return (
    <div className={`mo-sticky${on ? ' is-on' : ''}`} aria-hidden={!on}>
      <div className="mo-sticky__text">
        {label}
        <b>{formatGBP(amount)} · book online</b>
      </div>
      <Link to={to} className="mo-btn mo-btn--primary" tabIndex={on ? 0 : -1}>
        Get my price
      </Link>
    </div>
  )
}
