import { Check } from 'lucide-react'
import { FIX, PAINT, cleanPrice, formatGBP } from '../content/pricing.js'

/**
 * O relatório de check-out: a peça que a página inteira repete.
 * Os dados aqui são um EXEMPLO (marcado na tela), e o total sai da própria
 * tabela de preços: end of tenancy de 2 quartos (forno incluso), retoque de
 * pintura e meia diária de reparo. Antes era número digitado e ficou velho
 * (£653 de uma tabela que não existe mais); assim acompanha o preço.
 */
export const EXAMPLE_REPORT = {
  title: 'Check-out report',
  meta: '2 bed flat · SE15',
  rows: [
    { room: 'Living room', work: 'Repairs · 4 jobs done', time: '10:18', img: '/b2c/img/rep-living.webp' },
    { room: 'Bedroom', work: 'Fresh coat · touch-ups', time: '12:04', img: '/b2c/img/rep-bedroom.webp' },
    { room: 'Kitchen', work: 'Clean · oven included', time: '15:32', img: '/b2c/img/rep-kitchen.webp' },
    { room: 'Bathroom', work: 'Clean · limescale off', time: '16:07', img: '/b2c/img/rep-bathroom.webp' },
  ],
  total:
    cleanPrice('2', 'eot') +
    PAINT.options.find((o) => o.id === 'touchup').price +
    FIX.packages.find((p) => p.id === 'half').price,
}

export default function ReportCard({ report = EXAMPLE_REPORT, cover = null, animate = true, className = '' }) {
  return (
    <article className={`mo-report ${className}`} aria-label="Example check-out report">
      {cover && (
        <div className="mo-report__cover">
          <img src={cover} alt="A Fixfy cleaner wiping down a kitchen worktop in an empty flat" loading="eager" />
          <span className="mo-report__cover-tag">
            <span className="mo-live-dot" aria-hidden="true" />
            Team on site · photos as they finish
          </span>
        </div>
      )}
      <header className="mo-report__head">
        <div>
          <div className="mo-report__title">{report.title}</div>
          <div className="mo-report__meta">{report.meta}</div>
        </div>
        <span className="mo-sample">Example</span>
      </header>
      <ol className="mo-report__rows">
        {report.rows.map((row, i) => (
          <li key={row.room} className="mo-report__row" style={animate ? { '--i': i } : undefined}>
            <img src={row.img} alt="" width="52" height="52" loading="lazy" />
            <div className="mo-report__room">
              <b>{row.room}</b>
              <span>{row.work}</span>
            </div>
            <time className="mo-report__time">{row.time}</time>
            <span className="mo-tick" aria-label="Done">
              <Check size={15} strokeWidth={3} />
            </span>
          </li>
        ))}
      </ol>
      <footer className="mo-report__foot">
        <div>
          <span>Paid at booking, VAT included</span>
          <b className="mo-report__total">{formatGBP(report.total)}</b>
        </div>
        <div className="is-today">
          <span>Left to pay</span>
          <b>£0.00</b>
        </div>
      </footer>
    </article>
  )
}
