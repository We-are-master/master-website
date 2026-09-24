import { TRUSTPILOT } from '../content/site.js'

/**
 * Selo do Trustpilot com link para o perfil. Desligado enquanto `TRUSTPILOT.url`
 * estiver vazio (ver site.js). `where` escolhe o lugar: no celular fica acima
 * do título, no desktop embaixo do cartão de orçamento; os dois sobre o navy.
 */
export default function TrustpilotBadge({ where }) {
  if (!TRUSTPILOT.url) return null
  return (
    <a
      className={`mo-tp mo-tp--${where}`}
      href={TRUSTPILOT.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Rated ${TRUSTPILOT.label} on Trustpilot. Read our reviews`}
    >
      <img src="/b2c/img/trustpilot-light.webp" alt="" width="2120" height="280" decoding="async" />
    </a>
  )
}
