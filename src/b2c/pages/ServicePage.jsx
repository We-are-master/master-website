import { Link } from 'react-router-dom'
import { ArrowRight, Check, Paintbrush, ShieldCheck, Sparkles, Tag, Wrench } from 'lucide-react'
import B2CLayout from '../components/Chrome.jsx'
import QuoteWidget from '../components/QuoteWidget.jsx'
import { Areas, CheckoutStandard, Eyebrow, Faq, FinalCta, PayAfterPhotos, Promises, Reviews, StickyCta } from '../components/Sections.jsx'

const SERVICE_ICON = { clean: Sparkles, paint: Paintbrush, fix: Wrench, cert: ShieldCheck }
import { CERT, CLEAN, FIX, FROM_PRICE, PAINT, PROPERTY_SIZES, certPrice, cleanPrice, formatGBP } from '../content/pricing.js'
import { DEEP_FAQS, FAQS } from '../content/copy.js'
import { PROMISES } from '../content/site.js'
import { bookingHref } from '../lib/store.js'
import { usePageMeta } from '../lib/meta.js'
import { useHashScroll } from './HomePage.jsx'

const PAGES = {
  clean: {
    path: '/end-of-tenancy-cleaning',
    eyebrow: 'End of tenancy cleaning · London',
    title: 'End of tenancy cleaning',
    lede: 'Cleaned to the check-out checklist and photographed room by room. Fixed price, booked online in two minutes.',
    img: '/b2c/img/svc-clean.webp',
    alt: 'Cleaner in orange gloves cleaning the inside of an oven door',
    meta: {
      title: 'End of tenancy cleaning in London, fixed prices from £149 | Fixfy',
      description: 'End of tenancy cleaning in London from £149, VAT included. Room-by-room checklist, photo report of every room, free re-clean within 7 days. Book online in two minutes.',
    },
    points: [
      `Fixed price by property size, from ${formatGBP(CLEAN.prices.studio)}`,
      'Oven deep clean included. Carpets, fridge and outside windows as priced add-ons',
      'A photo of every room when we finish, to forward to your agent',
      `Free re-clean within ${PROMISES.recleanDays.value} days if the check-out flags something on our list`,
    ],
    faqs: FAQS.filter((f) => !/painting|paint and materials|certificate|safety check/i.test(f.q)),
    otherA: { id: 'paint', label: 'Add a fresh coat', to: '/painting' },
    otherB: { id: 'fix', label: 'Add repairs', to: '/repairs' },
    sticky: cleanPrice('studio', 'eot'),
  },
  // Deep clean: o mesmo serviço `clean`, preço do end of tenancy × 90% (pricing.js), para casa ocupada.
  deep: {
    path: '/deep-cleaning',
    kind: 'deep',
    eyebrow: 'Deep cleaning · London',
    title: 'Deep cleaning',
    lede: 'For the home you live in: moving in, a spring clean, or just overdue. Every room top to bottom at a fixed price, booked online in two minutes.',
    img: '/b2c/img/svc-clean.webp',
    alt: 'Cleaner in orange gloves cleaning the inside of an oven door',
    meta: {
      title: `Deep cleaning in London, fixed prices from ${formatGBP(cleanPrice('studio', 'deep'))} | Fixfy`,
      description: `Deep cleaning in London from ${formatGBP(cleanPrice('studio', 'deep'))}, VAT included. For moving in, a spring clean or a home that is just overdue. Oven included, photo of every room. Book online in two minutes.`,
    },
    points: [
      `Fixed price by property size, from ${formatGBP(cleanPrice('studio', 'deep'))}`,
      'Oven deep clean included. Carpets, fridge and outside windows as priced add-ons',
      'Done around your furniture and belongings, room by room',
      'A photo of every room when we finish',
    ],
    faqs: [...DEEP_FAQS, ...FAQS.filter((f) => /how do i pay|get in|how long|change or cancel|areas/i.test(f.q))],
    otherA: { id: 'paint', label: 'Add a fresh coat', to: '/painting' },
    otherB: { id: 'fix', label: 'Add repairs', to: '/repairs' },
    sticky: cleanPrice('studio', 'deep'),
  },
  paint: {
    path: '/painting',
    eyebrow: 'Painting for check-out · London',
    title: 'A fresh coat before you hand back the keys',
    lede: 'Filled, touched up or fully repainted, priced up front. Done before the clean, so nothing is left behind.',
    img: '/b2c/img/svc-paint.webp',
    alt: 'Painter rolling white emulsion onto a bedroom wall',
    meta: {
      title: 'End of tenancy painting and touch-ups in London | Fixfy',
      description: 'Touch-ups from £215 and full repaints from £450 a room, VAT included. Booked with your end of tenancy clean or on its own. Photo report included.',
    },
    points: [
      `Touch-ups across the property from ${formatGBP(PAINT.options[0].price)}`,
      `Full repaint, walls in two coats, ${formatGBP(PAINT.options[1].price)} a room`,
      `Paint and materials pack for ${formatGBP(PAINT.materials.price)}, or use the landlord’s paint`,
      'Booked with the clean, we do the paint first and the clean last',
    ],
    faqs: FAQS.filter((f) => /paint|how do i pay|photo report|change or cancel|areas|empty|get in|how long/i.test(f.q)),
    otherA: { id: 'clean', label: 'Add the clean', to: '/end-of-tenancy-cleaning' },
    otherB: { id: 'fix', label: 'Add repairs', to: '/repairs' },
    sticky: FROM_PRICE.paint,
  },
  fix: {
    path: '/repairs',
    eyebrow: 'Move-out repairs · London',
    title: 'The little jobs on the inventory',
    lede: 'Holes, handles, rails, sealant, sticking doors. Booked as a half day or a full day, no call-out fee, and photographed when done.',
    img: '/b2c/img/svc-fix.webp',
    alt: 'Handyman filling nail holes in a hallway wall',
    meta: {
      title: 'Move-out repairs and handyman in London, half day £189 | Fixfy',
      description: 'Move-out repairs in London: half day £189, full day £299, no call-out fee. Fill holes, reseal baths, refit rails and handles. Booked with your end of tenancy clean or on its own.',
    },
    points: [
      `Half day ${formatGBP(FIX.packages[0].price)} or full day ${formatGBP(FIX.packages[1].price)}, no call-out fee`,
      'Tick the jobs on your list and we suggest half or full day',
      'Parts billed at the end and listed in your report',
      'Booked with the clean, repairs go first so the dust is cleaned away',
    ],
    faqs: FAQS.filter((f) => /paint and materials|how do i pay|photo report|change or cancel|areas|get in|how long|book painting/i.test(f.q)),
    otherA: { id: 'clean', label: 'Add the clean', to: '/end-of-tenancy-cleaning' },
    otherB: { id: 'paint', label: 'Add a fresh coat', to: '/painting' },
    sticky: FROM_PRICE.fix,
  },
  cert: {
    path: '/landlord-certificates',
    eyebrow: 'Landlord certificates · London',
    title: 'The certificates before the next tenant',
    lede: 'Gas, electrics and appliances checked and signed by registered engineers. Fixed price, booked online, certificate and photo report on the same day.',
    img: '/b2c/img/svc-cert.webp',
    alt: 'Gas engineer checking a boiler in a London flat kitchen',
    meta: {
      title: 'Landlord certificates in London: gas safety £79, EICR from £149 | Fixfy',
      description: 'Gas safety certificate (CP12) £79, electrical safety report (EICR) from £149 and appliance testing £69 in London, VAT included. Registered engineers, certificate the same day.',
    },
    points: [
      `Gas safety certificate (CP12) ${formatGBP(CERT.items[0].price)}, by a Gas Safe registered engineer`,
      `Electrical safety report (EICR) from ${formatGBP(certPrice(CERT.items[1], 'studio'))}, by a NICEIC or NAPIT registered electrician`,
      `Appliance testing ${formatGBP(CERT.items[2].price)}, or add a full boiler service for ${formatGBP(CERT.items[0].addOn.price)}`,
      'If something fails, you get the list and a fixed price before any work starts',
    ],
    faqs: FAQS.filter((f) => /certificate|safety check|how do i pay|photo report|change or cancel|areas|get in/i.test(f.q)),
    otherA: { id: 'clean', label: 'Add the clean', to: '/end-of-tenancy-cleaning' },
    otherB: { id: 'fix', label: 'Add repairs', to: '/repairs' },
    sticky: FROM_PRICE.cert,
  },
}

/** `kind="deep"` com `service="clean"` é a página do deep clean (/deep-cleaning). */
export default function ServicePage({ service, kind }) {
  const deep = service === 'clean' && kind === 'deep'
  const page = PAGES[deep ? 'deep' : service]
  useHashScroll()
  usePageMeta({ ...page.meta, path: page.path, image: page.img })

  return (
    <B2CLayout>
      <section className="mo-shero">
        <div className="mo-wrap">
          <div className="mo-shero__grid">
            <div className="mo-shero__copy">
              <Eyebrow icon={SERVICE_ICON[service]}>{page.eyebrow}</Eyebrow>
              <h1 className="mo-display mo-shero__title">
                {page.title}
                <span className="mo-dot">.</span>
              </h1>
              <p className="mo-hero__sub">{page.lede}</p>
              <ul className="mo-svc__list mo-shero__points">
                {page.points.map((p) => (
                  <li key={p}>
                    <Check size={16} strokeWidth={2.6} />
                    {p}
                  </li>
                ))}
              </ul>
              <Promises className="mo-hero__promises" reclean={!deep} />
            </div>
            <div className="mo-shero__photo">
              <img src={page.img} alt={page.alt} width="1200" height="896" />
            </div>
          </div>
        </div>
      </section>

      <section className="mo-section mo-section--after-hero" id="price">
        <div className="mo-wrap mo-shero__quote">
          <div className="mo-section__head mo-reveal">
            <Eyebrow icon={Tag}>Your price</Eyebrow>
            <h2 className="mo-h2">
              Fixed before you book<span className="mo-dot">.</span>
            </h2>
          </div>
          <div className="mo-reveal" style={{ marginTop: 28 }}>
            {/* key: trocar de página de serviço remonta o widget com o serviço e o tipo da página nova. */}
            <QuoteWidget key={page.path} initial={service} initialKind={page.kind} lockService />
          </div>
          <div className="mo-day mo-reveal">
            <div>
              <div className="mo-day__title">Need more than this?</div>
              <p className="mo-day__text">Add it in the same booking and we plan the order.</p>
            </div>
            <div className="mo-chips">
              <Link className="mo-pop" to={bookingHref({ services: [service, page.otherA.id].sort(), kind: page.kind })}>
                {page.otherA.label} <b>from {formatGBP(FROM_PRICE[page.otherA.id])}</b>
              </Link>
              <Link className="mo-pop" to={bookingHref({ services: [service, page.otherB.id].sort(), kind: page.kind })}>
                {page.otherB.label} <b>from {formatGBP(FROM_PRICE[page.otherB.id])}</b>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {service === 'clean' && <CheckoutStandard kind={page.kind} />}
      <PayAfterPhotos kind={page.kind} />
      {service !== 'clean' && (
        <section className="mo-section">
          <div className="mo-wrap mo-standard">
            <div className="mo-reveal">
              <Eyebrow icon={SERVICE_ICON[service]}>
                {service === 'paint' ? 'What we paint' : service === 'cert' ? 'What we certify' : 'What we fix'}
              </Eyebrow>
              <h2 className="mo-h2">
                {service === 'paint'
                  ? 'What a fresh coat covers'
                  : service === 'cert'
                    ? 'What a landlord has to have'
                    : 'What is usually on the list'}
                <span className="mo-dot">.</span>
              </h2>
              <p className="mo-lede">
                {service === 'paint'
                  ? 'Touch-ups are for a property that just needs the marks of living gone. A full repaint is for walls that need a proper finish, priced per room so you can choose which ones.'
                  : service === 'cert'
                    ? 'Book the ones that are due. The engineer signs the certificate, we send it with the photo report and keep the expiry date on file for the next one.'
                    : 'Most check-out lists are small jobs that add up. Tick them in the booking and we suggest how long the team needs.'}
              </p>
            </div>
            <div className="mo-checklist mo-reveal">
              <ul className="mo-checklist__list">
                {(service === 'cert'
                  ? [
                      'Gas safety certificate (CP12), renewed every 12 months',
                      'Electrical safety report (EICR), renewed every 5 years',
                      'Appliance testing (PAT) for a furnished let',
                      'Boiler service in the same visit as the gas check',
                      'Certificate PDF and photo report the same day',
                      'A fixed price to put right anything that fails',
                    ]
                  : service === 'paint'
                  ? [
                      'Nail and screw holes filled and sanded',
                      'Scuffs, marks and picture-hook shadows touched up',
                      'Colour matched to the existing wall where possible',
                      'Full rooms: walls in two coats, edges cut in cleanly',
                      'Skirting and woodwork on request',
                      'Dust sheets down, tidy when we leave',
                    ]
                  : FIX.tasks.filter((t) => t.id !== 'other').map((t) => t.label)
                ).map((item) => (
                  <li key={item}>
                    <span className="mo-tick" aria-hidden="true">
                      <Check size={14} strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
      <Reviews />
      {service === 'clean' && (
        <section className="mo-section mo-section--paper" id="prices">
          <div className="mo-wrap">
            <div className="mo-section__head mo-reveal">
              <Eyebrow icon={Tag}>Prices</Eyebrow>
              <h2 className="mo-h2">
                By the size of the place<span className="mo-dot">.</span>
              </h2>
              <p className="mo-lede">One bathroom is included. Bigger homes, more bathrooms and the add-ons are priced on the booking before you confirm.</p>
            </div>
            <div className="mo-prices">
              <div className="mo-pricecard mo-reveal">
                <div className="mo-pricecard__head">
                  <span className="mo-pricecard__verb">
                    Clean<span className="mo-dot">.</span>
                  </span>
                  <span className="mo-pricecard__name">{deep ? 'Deep clean' : 'End of tenancy'}</span>
                </div>
                <ul className="mo-pricelist">
                  {PROPERTY_SIZES.map((s) => (
                    <li key={s.id}>
                      <span>{s.label}</span>
                      <b>{cleanPrice(s.id, page.kind) == null ? 'Photo quote' : formatGBP(cleanPrice(s.id, page.kind))}</b>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mo-pricecard mo-reveal">
                <div className="mo-pricecard__head">
                  <span className="mo-pricecard__verb">Add-ons</span>
                </div>
                <ul className="mo-pricelist">
                  <li>
                    <span>Extra bathroom</span>
                    <b>{formatGBP(CLEAN.extraBathroom)}</b>
                  </li>
                  {CLEAN.extras.map((x) => (
                    <li key={x.id}>
                      <span>
                        {x.label}
                        <small>{x.detail}</small>
                      </span>
                      <b>
                        {formatGBP(x.price)}
                        {x.unit ? ` a ${x.unit}` : ''}
                      </b>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mo-pricecard mo-reveal" style={{ background: 'var(--mo-navy)', color: '#fff', borderColor: 'var(--mo-navy)' }}>
                <div className="mo-pricecard__head">
                  <span className="mo-pricecard__verb">Included</span>
                </div>
                <ul className="mo-svc__list" style={{ color: 'rgba(255,255,255,.8)' }}>
                  {(deep
                    ? ['Room-by-room checklist', 'Oven deep clean', 'All products and equipment', 'Photo of every room', 'VAT']
                    : ['Room-by-room checklist', 'All products and equipment', 'Photo of every room', `Free re-clean within ${PROMISES.recleanDays.value} days`, 'VAT']
                  ).map((i) => (
                    <li key={i} style={{ color: 'inherit' }}>
                      <Check size={16} strokeWidth={2.6} style={{ color: 'var(--mo-orange)' }} />
                      {i}
                    </li>
                  ))}
                </ul>
                <Link to={bookingHref({ services: ['clean'], size: '2', kind: page.kind })} className="mo-btn mo-btn--primary">
                  Book a clean <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
      <Areas />
      <Faq items={page.faqs} />
      <FinalCta
        title={
          deep
            ? 'Time for a deep clean?'
            : service === 'clean'
              ? 'Check-out coming up?'
              : service === 'cert'
                ? 'Certificates due?'
                : 'Handing back the keys soon?'
        }
        to={bookingHref({ services: [service], kind: page.kind })}
        reclean={!deep}
      />
      <StickyCta amount={page.sticky} to={bookingHref({ services: [service], kind: page.kind })} />
    </B2CLayout>
  )
}
