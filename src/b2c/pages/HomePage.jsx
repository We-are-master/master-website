import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { CalendarDays, Camera, RotateCcw, Sparkles, Tag } from 'lucide-react'
import B2CLayout from '../components/Chrome.jsx'
import QuoteWidget from '../components/QuoteWidget.jsx'
import {
  Areas,
  Audiences,
  CheckoutStandard,
  Eyebrow,
  Faq,
  FinalCta,
  PayAfterPhotos,
  PopularJobs,
  PriceTables,
  ReviewTicker,
  Reviews,
  ServicesTrio,
  StickyCta,
} from '../components/Sections.jsx'
import { PROMISES } from '../content/site.js'
import { usePageMeta } from '../lib/meta.js'

/** Link com âncora vindo de outra página (/#prices): rola depois de montar. */
export function useHashScroll() {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    return () => clearTimeout(t)
  }, [hash])
}

const STRIP = [
  { verb: 'Clean', img: '/b2c/img/svc-clean.webp' },
  { verb: 'Paint', img: '/b2c/img/svc-paint.webp' },
  { verb: 'Fix', img: '/b2c/img/svc-fix.webp' },
]

export default function HomePage() {
  useHashScroll()
  usePageMeta({
    title: 'Fixed-price cleaning, painting and repairs in London | Fixfy',
    description:
      'Home jobs at a fixed price across London: cleaning, painting, repairs and landlord certificates. See the price before you book, pick a day and pay online in two minutes.',
    path: '/',
  })

  return (
    <B2CLayout>
      {/* O que fazemos (fotos), como (linha de 3 passos) e quando (chips). Celular: uma coluna só,
          com os chips depois do orçamento. Desktop: texto e fotos à esquerda, orçamento à direita,
          para quem chega já ver onde começar sem rolar. */}
      <section className="mo-hero mo-hero--simple">
        <div className="mo-wrap">
          <div className="mo-hero__copy">
            <div className="mo-strip" aria-hidden="true">
              {STRIP.map((s) => (
                <figure key={s.verb}>
                  <img src={s.img} alt="" width="1200" height="896" loading="eager" />
                  <figcaption>
                    {s.verb}
                    <i>.</i>
                  </figcaption>
                </figure>
              ))}
            </div>

            <h1 className="mo-display mo-hero__title">
              Home jobs at a fixed price<span className="mo-dot">.</span>
            </h1>
            <p className="mo-hero__sub">
              Cleaning, painting, repairs and landlord certificates across London.
              <b>Booked and paid online in two minutes.</b>
            </p>

            <ol className="mo-flow" aria-label="How it works">
              <li>
                Get a price <span>now</span>
              </li>
              <li>
                Pick a day <span>from tomorrow</span>
              </li>
              <li>
                Book <span>and pay online</span>
              </li>
            </ol>

            <ul className="mo-facts">
              <li>
                <Tag size={16} /> Fixed prices, VAT included
              </li>
              <li>
                <CalendarDays size={16} /> Arrival slots 9am to 6pm
              </li>
              <li>
                <Camera size={16} /> Photo of every room
              </li>
              <li>
                <RotateCcw size={16} /> Free re-clean in {PROMISES.recleanDays.value} days
              </li>
            </ul>
          </div>

          <div className="mo-hero__widget">
            <QuoteWidget />
          </div>
        </div>
        <ReviewTicker />
      </section>

      <section className="mo-section mo-section--tight">
        <div className="mo-wrap">
          <PopularJobs centered />
        </div>
      </section>

      <section className="mo-section mo-section--paper" id="services">
        <div className="mo-wrap">
          <div className="mo-section__head mo-reveal">
            <Eyebrow icon={Sparkles}>What we do</Eyebrow>
            <h2 className="mo-h2">
              Four jobs, one price each<span className="mo-dot">.</span>
            </h2>
            <p className="mo-lede">
              A clean, a fresh coat of paint, repairs or a certificate. Book one or all four, the price on screen is the price you
              pay, and we plan the order.
            </p>
          </div>
          <ServicesTrio />
        </div>
      </section>

      <PayAfterPhotos />
      <CheckoutStandard />
      <Audiences />
      <Reviews />
      <PriceTables />
      <Areas />
      <Faq />
      <FinalCta />
      <StickyCta />
    </B2CLayout>
  )
}
