import { useId } from 'react'
import { GOOGLE_REVIEWS, TRUSTPILOT } from '../content/site.js'

/**
 * Selos de avaliação no topo da home, sobre o navy: no celular acima do título,
 * no desktop embaixo do cartão de orçamento (`where`). Cada selo só aparece com
 * o link do perfil preenchido em site.js, e a nota é a que o perfil mostra.
 */
export default function ReviewBadges({ where }) {
  const google = GOOGLE_REVIEWS.url ? <GoogleBadge /> : null
  const trustpilot = TRUSTPILOT.url ? <TrustpilotBadge /> : null
  if (!google && !trustpilot) return null
  return (
    <div className={`mo-proof mo-proof--${where}`}>
      {google}
      {trustpilot}
    </div>
  )
}

const STAR = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z'

/** Cinco estrelas com a última preenchida só na fração da nota (4,4 = 4 e 40%). */
function Stars({ rating }) {
  // Os dois selos (celular e desktop) estão na página: cada um com o seu recorte.
  const clip = `mo-proof-fill-${useId().replace(/:/g, '')}`
  const fill = Math.max(0, Math.min(5, rating)) / 5
  return (
    <svg className="mo-proof__stars" viewBox="0 0 120 24" aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <rect x="0" y="0" width={120 * fill} height="24" />
        </clipPath>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={`bg${i}`} d={STAR} transform={`translate(${i * 24} 0)`} className="mo-proof__star-empty" />
      ))}
      <g clipPath={`url(#${clip})`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={`fg${i}`} d={STAR} transform={`translate(${i * 24} 0)`} className="mo-proof__star" />
        ))}
      </g>
    </svg>
  )
}

function GoogleBadge() {
  const { url, rating, count } = GOOGLE_REVIEWS
  const shown = rating.toFixed(1)
  return (
    <a
      className="mo-proof__item"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Rated ${shown} out of 5 from ${count} Google reviews. Read them on Google`}
    >
      <svg className="mo-proof__g" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
      </svg>
      <span className="mo-proof__score">{shown}</span>
      <Stars rating={rating} />
      <span className="mo-proof__count">{count} Google reviews</span>
    </a>
  )
}

function TrustpilotBadge() {
  return (
    <a
      className="mo-proof__item mo-proof__item--tp"
      href={TRUSTPILOT.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Rated ${TRUSTPILOT.label} on Trustpilot. Read our reviews`}
    >
      <img src="/b2c/img/trustpilot-light.webp" alt="" width="2120" height="280" decoding="async" />
    </a>
  )
}
