import { CalendarDays, Camera, MapPin, RotateCcw, Tag } from 'lucide-react'
import { PROPERTY_SIZES, cleanKind, formatGBP } from '../content/pricing.js'
import { PROMISES, formatPostcode } from '../content/site.js'
import { findWindow, formatLongDate } from '../lib/slots.js'
import { useTween } from './QuoteWidget.jsx'

/**
 * "Your check-out plan": o resumo da reserva no mesmo desenho do relatório,
 * para o cliente ver desde o primeiro clique o que vai receber no fim.
 */
export default function PlanSummary({ booking, priced, sizeChosen }) {
  const total = useTween(priced.needsQuote ? null : priced.total)
  const size = PROPERTY_SIZES.find((s) => s.id === booking.selection.size)
  const hasClean = booking.selection.services.includes('clean')
  // O re-clean grátis é do end of tenancy (o FAQ fala em agente e imóvel vazio); o deep clean não tem.
  const hasReclean = hasClean && cleanKind(booking.selection.clean?.kind).id === 'eot'
  const win = findWindow(booking.window)
  const meta = [hasClean && sizeChosen ? size?.label : null, booking.postcode ? formatPostcode(booking.postcode) : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="bk-plan">
      <div className="bk-plan__head">
        <div>
          <div className="mo-report__title">Your booking</div>
          <div className="bk-plan__meta">{meta || 'Pick what you need'}</div>
        </div>
      </div>

      {priced.lines.length === 0 ? (
        <p className="bk-plan__empty">Choose a clean, a fresh coat, repairs or a certificate to see your fixed price.</p>
      ) : (
        <ul className="bk-plan__lines">
          {priced.lines.map((l) => (
            <li key={l.id} className={l.service === 'promo' ? 'is-promo' : undefined}>
              <span>
                {l.label}
                {l.detail && <small>{l.detail}</small>}
              </span>
              <b>{l.amount == null ? 'Quote' : formatGBP(l.amount)}</b>
            </li>
          ))}
        </ul>
      )}

      {(booking.date || booking.postcode) && (
        <ul className="bk-plan__facts">
          {booking.date && (
            <li>
              <CalendarDays size={16} />
              <span>
                {formatLongDate(booking.date)}
                {win ? `, arriving ${win.phrase}` : ''}
              </span>
            </li>
          )}
          {booking.postcode && (
            <li>
              <MapPin size={16} />
              <span>
                {[booking.address?.line2, booking.address?.line1, formatPostcode(booking.postcode)].filter(Boolean).join(', ')}
              </span>
            </li>
          )}
        </ul>
      )}

      <div className="bk-plan__total">
        <div>
          <span>Total to pay now, VAT included</span>
          <b className="mo-num">{priced.needsQuote ? 'Photo quote' : formatGBP(total)}</b>
        </div>
      </div>

      <ul className="bk-plan__promises">
        <li>
          <Tag size={15} /> Fixed price, secure checkout by Stripe
        </li>
        <li>
          <Camera size={15} /> {hasClean ? 'Photo of every room when we finish' : 'Photo report when we finish'}
        </li>
        <li>
          <RotateCcw size={15} />{' '}
          {hasReclean ? `Free re-clean within ${PROMISES.recleanDays.value} days · free changes up to ` : 'Free changes up to '}
          {PROMISES.freeCancellationHours}h before, full refund
        </li>
      </ul>
    </div>
  )
}
