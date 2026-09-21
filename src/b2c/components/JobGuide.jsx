import {
  AlertTriangle,
  Check,
  DoorOpen,
  KeyRound,
  Layers,
  ListChecks,
  Minus,
  Package,
  Paintbrush,
  Scale,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Eyebrow } from './Sections.jsx'
import { GUIDES, guideExtras } from '../content/guides.js'

const ICONS = {
  box: Package,
  zap: Zap,
  key: KeyRound,
  door: DoorOpen,
  brush: Paintbrush,
  layers: Layers,
  list: ListChecks,
  shield: ShieldCheck,
  alert: AlertTriangle,
}

function Cell({ value }) {
  if (value === true)
    return (
      <span className="mo-compare__yes">
        <Check size={15} strokeWidth={3} aria-hidden="true" />
        <span className="mo-sr">Included</span>
      </span>
    )
  if (value === false)
    return (
      <span className="mo-compare__no">
        <Minus size={15} aria-hidden="true" />
        <span className="mo-sr">Not included</span>
      </span>
    )
  return value
}

/**
 * Guia do serviço, no molde da Housekeep: o que cada opção inclui lado a lado,
 * o que preparar antes da visita e os extras da mesma visita. `guide` é a
 * chave de GUIDES; `active` destaca a coluna da página (ex.: 'deep').
 */
export default function JobGuide({ guide, active }) {
  const g = GUIDES[guide]
  const extras = g.extras ? guideExtras(g.extras) : []
  const cols = g.columns.length

  return (
    <section className="mo-section" id="guide">
      <div className="mo-wrap">
        <div className="mo-section__head mo-reveal">
          <Eyebrow icon={Scale}>Compare</Eyebrow>
          <h2 className="mo-h2">
            {g.title}
            <span className="mo-dot">{g.end || '?'}</span>
          </h2>
          <p className="mo-lede">{g.lede}</p>
        </div>

        <div className="mo-compare mo-reveal" role="table" aria-label={g.title} style={{ '--mo-compare-cols': cols }}>
          <div className="mo-compare__row mo-compare__row--head" role="row">
            <span className="mo-compare__label" role="columnheader">
              <span className="mo-sr">Option</span>
            </span>
            {g.columns.map((c) => (
              <span key={c.id} role="columnheader" className={`mo-compare__col${c.id === active ? ' is-active' : ''}`}>
                <b>{c.name}</b>
                <small>{c.price}</small>
              </span>
            ))}
          </div>
          {g.rows.map((r) => (
            <div key={r.label} className="mo-compare__row" role="row">
              <span className="mo-compare__label" role="rowheader">
                {r.label}
              </span>
              {r.cells.map((v, i) => (
                <span key={g.columns[i].id} role="cell" className={`mo-compare__cell${g.columns[i].id === active ? ' is-active' : ''}`}>
                  <Cell value={v} />
                </span>
              ))}
            </div>
          ))}
        </div>

        <div className={`mo-guide${extras.length ? '' : ' mo-guide--solo'}`}>
          <div className="mo-reveal">
            <h3 className="mo-guide__title">Before we arrive</h3>
            <ul className="mo-prep">
              {g.prep.map((p) => {
                const Icon = ICONS[p.icon]
                return (
                  <li key={p.title}>
                    <span className="mo-prep__icon" aria-hidden="true">
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <div>
                      <b>{p.title}</b>
                      <p>{p.text}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
          {extras.length > 0 && (
            <div className="mo-reveal">
              <h3 className="mo-guide__title">Add to the same visit</h3>
              <ul className="mo-extras">
                {extras.map((x) => (
                  <li key={x.id}>
                    <div>
                      <b>{x.label}</b>
                      <p>{x.detail}</p>
                    </div>
                    <span className="mo-extras__price">{x.price}</span>
                  </li>
                ))}
              </ul>
              <p className="mo-guide__note">Added in the booking, priced before you pay.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
