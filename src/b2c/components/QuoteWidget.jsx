import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Minus, Plus } from 'lucide-react'
import {
  CERT,
  CLEAN,
  FIX,
  FROM_PRICE,
  PAINT,
  PROPERTY_SIZES,
  SERVICE_ORDER,
  SERVICES,
  certPrice,
  cleanKind,
  cleanPrice,
  formatGBP,
  priceSelection,
} from '../content/pricing.js'
import { bookingHref } from '../lib/store.js'
import { track } from '../lib/track.js'

/** Número que desliza até o valor novo (curto, e parado se o usuário pede). */
export function useTween(value, duration = 280) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    if (value == null) {
      setShown(value)
      return undefined
    }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const start = from.current ?? value
    // Aba escondida não roda requestAnimationFrame: sem isto o total ficava
    // congelado no valor velho quando o cupom entrava fora da tela.
    if (reduce || start === value || document.hidden) {
      from.current = value
      setShown(value)
      return undefined
    }
    let raf
    const t0 = performance.now()
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      // Libras inteiras no caminho; no fim o valor exato (com cupom pode ter pence).
      setShown(p < 1 ? Math.round(start + (value - start) * eased) : value)
      if (p < 1) raf = requestAnimationFrame(step)
      else from.current = value
    }
    raf = requestAnimationFrame(step)
    // Rede: se a animação não rodar (aba em segundo plano, quadro perdido), o
    // número ainda assim termina no valor certo.
    const land = setTimeout(() => {
      from.current = value
      setShown(value)
    }, duration + 80)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(land)
    }
  }, [value, duration])
  return shown
}

export function Stepper({ value, min = 1, max = 8, onChange, label }) {
  return (
    <div className="mo-stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${label}`}>
        <Minus size={16} />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${label}`}>
        <Plus size={16} />
      </button>
    </div>
  )
}

const CTA = { clean: 'Book this clean', paint: 'Book the painter', fix: 'Book repairs', cert: 'Book the certificates' }

/**
 * `preset` (só na home) vem de `quotePreset` em store.js: o cartão abre no
 * serviço, tipo e tamanho do link do anúncio, com o mesmo preço do anúncio.
 */
export default function QuoteWidget({ initial = 'clean', initialKind, lockService = false, preset = null }) {
  const navigate = useNavigate()
  const [service, setService] = useState(preset?.service || initial)
  const [kind, setKind] = useState(() => cleanKind(preset?.kind || initialKind).id)
  const [size, setSize] = useState(preset?.size || '2')
  const [paintOption, setPaintOption] = useState(preset?.paint?.option || 'touchup')
  const [rooms, setRooms] = useState(preset?.paint?.rooms || 1)
  const [materials, setMaterials] = useState(preset?.paint?.materials === true)
  const [fixPackage, setFixPackage] = useState(preset?.fix || 'half')
  const [certItems, setCertItems] = useState(preset?.cert || ['gas'])
  const toggleCert = (id) =>
    setCertItems((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  const selection = useMemo(
    () => ({
      services: [service],
      size,
      clean: { kind, extras: {} },
      paint: { option: paintOption, rooms, materials },
      fix: { package: fixPackage, tasks: [] },
      cert: { items: certItems },
    }),
    [service, kind, size, paintOption, rooms, materials, fixPackage, certItems],
  )
  const { total, needsQuote } = priceSelection(selection)
  const shown = useTween(needsQuote ? null : total)

  const href = bookingHref({
    services: [service],
    kind: service === 'clean' ? kind : undefined,
    size: service === 'clean' || service === 'cert' ? size : undefined,
    paint: service === 'paint' ? { option: paintOption, rooms, materials } : undefined,
    fixPackage: service === 'fix' ? fixPackage : undefined,
    cert: service === 'cert' ? certItems : undefined,
  })

  const go = () => {
    track('price_viewed', { service, ...(service === 'clean' ? { kind } : {}), value: total })
    navigate(href)
  }

  return (
    <div className="mo-quote" id="price">
      {!lockService && (
        <div className="mo-tabs" style={{ '--mo-tabs': SERVICE_ORDER.length }} role="tablist" aria-label="Choose a service">
          {SERVICE_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={service === id}
              className="mo-tab"
              onClick={() => setService(id)}
            >
              <span className="mo-tab__verb">{SERVICES[id].verb}</span>
              <span className="mo-tab__from">from {formatGBP(FROM_PRICE[id])}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mo-quote__body" role="tabpanel">
        {service === 'clean' && (
          <>
            <div>
              <p className="mo-q-label" id="q-kind">
                What kind of clean? <span>{cleanKind(kind).hint}</span>
              </p>
              {/* Mesmo desenho do meia diária / diária do reparo: nome em cima, preço do tamanho embaixo. */}
              <div
                className="mo-chips mo-chips--grid"
                style={{ '--mo-cols': CLEAN.kinds.length }}
                role="radiogroup"
                aria-labelledby="q-kind"
              >
                {CLEAN.kinds.map((k) => {
                  const price = cleanPrice(size, k.id)
                  return (
                    <button
                      key={k.id}
                      type="button"
                      role="radio"
                      aria-checked={kind === k.id}
                      className="mo-chip"
                      onClick={() => setKind(k.id)}
                    >
                      {k.short}
                      <span className="mo-chip__price">{price == null ? 'Ask us' : formatGBP(price)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="mo-q-label" id="q-size">
                How many bedrooms? <span>{cleanKind(kind).name}</span>
              </p>
              <div className="mo-chips mo-chips--sizes" role="radiogroup" aria-labelledby="q-size">
                {PROPERTY_SIZES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={size === s.id}
                    aria-label={s.label}
                    className="mo-chip"
                    onClick={() => setSize(s.id)}
                  >
                    <span className="mo-chip__long">{s.short}</span>
                    <span className="mo-chip__short">{s.tiny}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {service === 'paint' && (
          <div>
            <p className="mo-q-label" id="q-paint">
              What needs doing? <span>Fresh coat</span>
            </p>
            <div className="mo-options mo-options--2" role="radiogroup" aria-labelledby="q-paint">
              {PAINT.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={paintOption === o.id}
                  className="mo-option"
                  onClick={() => setPaintOption(o.id)}
                >
                  <span className="mo-option__top">
                    {o.label}
                    <span className="mo-option__price">
                      {formatGBP(o.price)}
                      {o.unit ? ` a ${o.unit}` : ''}
                    </span>
                  </span>
                  <span className="mo-option__detail">{o.detail}</span>
                </button>
              ))}
            </div>
            {paintOption === 'rooms' && (
              <div className="mo-row" style={{ marginTop: 14 }}>
                <p className="mo-q-label" style={{ margin: 0 }}>
                  Rooms <span>walls, two coats</span>
                </p>
                <Stepper value={rooms} min={1} max={8} onChange={setRooms} label="rooms" />
              </div>
            )}
            <label className="mo-toggle-row">
              <input type="checkbox" checked={materials} onChange={(e) => setMaterials(e.target.checked)} />
              <span>
                <b>Add paint and materials</b>
                <small>{PAINT.materials.detail}</small>
              </span>
              <em>+{formatGBP(PAINT.materials.price)}</em>
            </label>
          </div>
        )}

        {service === 'cert' && (
          <div>
            <p className="mo-q-label" id="q-cert">
              What is due? <span>Signed by a registered engineer</span>
            </p>
            <div role="group" aria-labelledby="q-cert">
              {CERT.items.map((item) => {
                const on = certItems.includes(item.id)
                const price = certPrice(item, size)
                return (
                  <label key={item.id} className="mo-toggle-row" style={{ marginTop: 10 }}>
                    <input type="checkbox" checked={on} onChange={() => toggleCert(item.id)} />
                    <span>
                      <b>{item.label}</b>
                      <small>{item.valid}</small>
                    </span>
                    <em>{price == null ? 'Ask us' : formatGBP(price)}</em>
                  </label>
                )
              })}
            </div>
            {certItems.includes('eicr') && (
              <div style={{ marginTop: 14 }}>
                <p className="mo-q-label" id="q-cert-size">
                  How many bedrooms? <span>The electrical report is priced by size</span>
                </p>
                <div className="mo-chips mo-chips--sizes" role="radiogroup" aria-labelledby="q-cert-size">
                  {PROPERTY_SIZES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={size === s.id}
                      aria-label={s.label}
                      className="mo-chip"
                      onClick={() => setSize(s.id)}
                    >
                      <span className="mo-chip__long">{s.short}</span>
                      <span className="mo-chip__short">{s.tiny}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {service === 'fix' && (
          <div>
            <p className="mo-q-label" id="q-fix">
              How much time? <span>Half day or full day, no call-out fee</span>
            </p>
            <div className="mo-chips mo-chips--grid" style={{ '--mo-cols': FIX.packages.length }} role="radiogroup" aria-labelledby="q-fix">
              {FIX.packages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={fixPackage === p.id}
                  className="mo-chip"
                  onClick={() => setFixPackage(p.id)}
                >
                  {p.label}
                  <span className="mo-chip__price">{formatGBP(p.price)}</span>
                </button>
              ))}
            </div>
            <p className="mo-price__note" style={{ marginTop: 12 }}>
              Not sure how long? Pick your jobs in the booking and we suggest the time.
            </p>
          </div>
        )}
      </div>

      <div className="mo-quote__foot">
        <div className="mo-price" aria-live="polite">
          <span className="mo-price__amount mo-num">
            {needsQuote ? 'Ask us' : formatGBP(shown)}
            {!needsQuote && <small>fixed price</small>}
          </span>
          <span className="mo-price__note">
            {needsQuote ? 'Bigger homes get a quick photo quote' : 'VAT included · secure checkout by Stripe'}
          </span>
        </div>
        <button type="button" className="mo-btn mo-btn--primary mo-btn--lg" onClick={go}>
          {CTA[service]}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
