import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CalendarDays, Camera, CreditCard, RotateCcw, Sparkles, Tag } from 'lucide-react'
import B2CLayout from '../components/Chrome.jsx'
import QuoteWidget from '../components/QuoteWidget.jsx'
import ReviewBadges from '../components/ReviewBadges.jsx'
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
  Reviews,
  ServicesTrio,
  StickyCta,
} from '../components/Sections.jsx'
import { PROMISES } from '../content/site.js'
import { usePageMeta } from '../lib/meta.js'
import { quotePreset } from '../lib/store.js'

/** Link com âncora vindo de outra página (/#prices): rola depois de montar. */
export function useHashScroll() {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    return () => clearTimeout(t)
  }, [hash])
}

/**
 * Altura do cabeçalho só se ele de fato gruda no topo. No celular o #root
 * vira contêiner de rolagem (overflow-x hidden) e o sticky não gruda: aí
 * descontar a altura dele deixaria um buraco em cima do cartão.
 */
function stuckHeaderHeight() {
  const header = document.querySelector('.mo-header')
  if (!header || getComputedStyle(header).position !== 'sticky') return 0
  for (let el = header.parentElement; el && el !== document.documentElement; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el)
    if (overflowY !== 'visible' && overflowY !== 'clip') {
      return el.scrollHeight > el.clientHeight + 1 ? header.getBoundingClientRect().height : 0
    }
  }
  return header.getBoundingClientRect().height
}

/**
 * Chegou de um anúncio com o preço escolhido (/?s=clean&size=3): se o cartão
 * de preço não cabe inteiro na tela (celular, ou com o banner de cookies por
 * cima), ele sobe até o topo. O cliente vê de cara o mesmo tamanho e o mesmo
 * preço que clicou. Espera o scroll para o topo do App.
 */
function useQuoteScroll(preset) {
  useEffect(() => {
    if (!preset) return undefined
    const t = setTimeout(() => {
      const body = document.querySelector('#price .mo-quote__body')
      const foot = document.querySelector('#price .mo-quote__foot')
      if (!body || !foot) return
      if (foot.getBoundingClientRect().bottom <= window.innerHeight - 16) return
      const top = body.getBoundingClientRect().top + window.scrollY - stuckHeaderHeight() - 12
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' })
    }, 350)
    return () => clearTimeout(t)
  }, [preset])
}

const STRIP = [
  { verb: 'Clean', img: '/b2c/img/svc-clean.webp' },
  { verb: 'Paint', img: '/b2c/img/svc-paint.webp' },
  { verb: 'Fix', img: '/b2c/img/svc-fix.webp' },
  { verb: 'Certify', img: '/b2c/img/svc-cert.webp' },
]
const STRIP_FRAMES = 3
const STRIP_MS = 3000

/**
 * As três molduras do topo passeiam pelos quatro serviços, de 3 em 3
 * segundos, para nenhum ficar de fora. As quatro fotos ficam empilhadas em
 * cada moldura e só trocam de opacidade: nada recarrega na troca. Quem pede
 * menos animação (prefers-reduced-motion) fica com as três primeiras.
 */
function ServiceStrip() {
  const [shift, setShift] = useState(0)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    const t = setInterval(() => setShift((n) => (n + 1) % STRIP.length), STRIP_MS)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="mo-strip" aria-hidden="true">
      {Array.from({ length: STRIP_FRAMES }, (_, frame) => {
        const active = (frame + shift) % STRIP.length
        return (
          <figure key={frame}>
            {STRIP.map((s, i) => (
              <img
                key={s.verb}
                className={i === active ? 'is-on' : undefined}
                src={s.img}
                alt=""
                width="1200"
                height="896"
                loading="eager"
              />
            ))}
            <figcaption key={STRIP[active].verb}>
              {STRIP[active].verb}
              <i>.</i>
            </figcaption>
          </figure>
        )
      })}
    </div>
  )
}

export default function HomePage() {
  useHashScroll()
  const { search } = useLocation()
  // Lido uma vez, na chegada: o link escolhe o preço, depois quem escolhe é o cliente.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const preset = useMemo(() => quotePreset(search), [])
  const [service, setService] = useState(preset?.service || 'clean')
  useQuoteScroll(preset)
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
            <ServiceStrip />

            <ReviewBadges where="mobile" />

            <h1 className="mo-display mo-hero__title">
              Home jobs at a fixed price<span className="mo-dot">.</span>
            </h1>
            <p className="mo-hero__sub">Cleaning, Painting, Repairs &amp; Certificates.</p>

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
              {service === 'clean' ? (
                <>
                  <li>
                    <Camera size={16} /> Photo of every room
                  </li>
                  <li>
                    <RotateCcw size={16} /> Free re-clean in {PROMISES.recleanDays.value} days
                  </li>
                </>
              ) : service === 'cert' ? (
                <>
                  <li>
                    <RotateCcw size={16} /> Free cancellation up to {PROMISES.freeCancellationHours}h
                  </li>
                  <li>
                    <CreditCard size={16} /> Pay by card or Klarna
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Camera size={16} /> Photo report when we finish
                  </li>
                  <li>
                    <RotateCcw size={16} /> Put right free within {PROMISES.recleanDays.value} days
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="mo-hero__widget">
            <QuoteWidget preset={preset} onServiceChange={setService} />
            <ReviewBadges where="desktop" />
          </div>
        </div>
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
