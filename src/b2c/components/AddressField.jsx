import { useEffect, useId, useRef, useState } from 'react'
import { Hash, Loader2, MapPin, Pencil, Search } from 'lucide-react'
import { formatPostcode, looksLikePostcode } from '../content/site.js'
import { MAPBOX_TOKEN, findPostcode, searchPlaces, staticMapUrl, streetsNear } from '../lib/mapbox.js'

/**
 * Endereço do imóvel no primeiro passo da reserva, para o checkout não
 * pedir de novo. Três caminhos:
 *  - digita o endereço ("21 rye la") e escolhe da lista: pronto;
 *  - digita o postcode (o hábito britânico): escolhe a rua sugerida e
 *    digita só o número;
 *  - não acha, ou o Mapbox está fora: preenche à mão.
 * `value` = { line1, line2, postcode }. `onChange` recebe só o que mudou
 * (ex.: { line2 }): o pai junta com o estado mais novo, porque dois campos
 * mudando no mesmo instante com o objeto inteiro apagavam um ao outro.
 */
export default function AddressField({ value, onChange, error }) {
  const listId = useId()
  const hasAddress = Boolean(value.line1 && value.postcode)
  const [phase, setPhase] = useState(() => {
    if (!MAPBOX_TOKEN) return 'manual'
    if (hasAddress) return 'done'
    if (value.postcode) return 'street'
    return 'search'
  })
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [place, setPlace] = useState(null) // { postcode, area, lng, lat }
  const [streets, setStreets] = useState([])
  const [street, setStreet] = useState('')
  const [otherStreet, setOtherStreet] = useState(false)
  const [number, setNumber] = useState('')
  const inputRef = useRef(null)
  const numberRef = useRef(null)

  const emit = (patch) => onChange(patch)

  // Busca com espera curta e cancelamento da anterior.
  useEffect(() => {
    if (phase !== 'search') return undefined
    const q = query.trim()
    if (q.length < 3) {
      setItems([])
      setLoading(false)
      return undefined
    }
    const ctrl = new AbortController()
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const found = await searchPlaces(q, ctrl.signal)
        setItems(found)
        setActive(found.length ? 0 : -1)
        setOpen(true)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setItems([])
          setPhase('manual')
        }
      } finally {
        if (!ctrl.signal.aborted) setLoading(false)
      }
    }, 200)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [query, phase])

  // Postcode escolhido (ou vindo de link): centro e ruas em volta.
  useEffect(() => {
    if (phase !== 'street' || !value.postcode) return undefined
    const ctrl = new AbortController()
    ;(async () => {
      try {
        const base = place?.postcode === value.postcode ? place : await findPostcode(value.postcode, ctrl.signal)
        if (!base) return
        setPlace(base)
        const names = await streetsNear(base, ctrl.signal)
        setStreets(names)
        setStreet((s) => s || names[0] || '')
        setOtherStreet(names.length === 0)
      } catch (err) {
        if (err.name !== 'AbortError') setOtherStreet(true)
      }
    })()
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, value.postcode])

  // Endereço restaurado da sessão: o mapa vem do centro do postcode.
  useEffect(() => {
    if (phase !== 'done' || place || !value.postcode || !MAPBOX_TOKEN) return undefined
    const ctrl = new AbortController()
    findPostcode(value.postcode, ctrl.signal)
      .then((p) => p && setPlace(p))
      .catch(() => {})
    return () => ctrl.abort()
  }, [phase, place, value.postcode])

  // Número + rua viram a linha 1 enquanto o cliente digita.
  useEffect(() => {
    if (phase !== 'street') return
    const line1 = number.trim() && street.trim() ? `${number.trim()} ${street.trim()}` : ''
    if (line1 !== value.line1) emit({ line1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number, street, phase])

  const choose = (item) => {
    setOpen(false)
    setItems([])
    setQuery('')
    setPlace(item)
    if (item.type === 'address' && item.line1 && item.postcode) {
      emit({ line1: item.line1, postcode: item.postcode })
      setPhase('done')
      return
    }
    // Só o postcode: a rua vem sugerida, falta o número.
    setNumber('')
    setStreet('')
    setStreets([])
    emit({ line1: '', postcode: item.postcode })
    setPhase('street')
    setTimeout(() => numberRef.current?.focus(), 60)
  }

  const restart = () => {
    emit({ line1: '', postcode: '' })
    setPlace(null)
    setNumber('')
    setStreet('')
    setStreets([])
    setOtherStreet(false)
    setPhase(MAPBOX_TOKEN ? 'search' : 'manual')
    setTimeout(() => inputRef.current?.focus(), 60)
  }

  const onKeyDown = (e) => {
    if (!open || items.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      choose(items[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const flat = (
    <div className="bk-field bk-addr__flat">
      <label className="bk-label" htmlFor="bk-flat">
        Flat, floor or building
        <span>optional</span>
      </label>
      <input
        id="bk-flat"
        className="mo-input"
        autoComplete="address-line2"
        placeholder="e.g. Flat 3, second floor"
        maxLength={120}
        value={value.line2}
        onChange={(e) => emit({ line2: e.target.value })}
      />
    </div>
  )

  if (phase === 'done') {
    const map = place ? staticMapUrl(place) : null
    return (
      <div className="bk-addr-card">
        {map && <img className="bk-addr-card__map" src={map} alt="" width="640" height="200" />}
        <div className="bk-addr-card__row">
          <MapPin size={20} className="bk-addr-card__pin" />
          <div className="bk-addr-card__text">
            <b>{value.line1}</b>
            <span>{[place?.area, 'London', value.postcode].filter(Boolean).join(', ')}</span>
          </div>
          <button type="button" className="bk-addr-card__change" onClick={restart}>
            <Pencil size={14} /> Change
          </button>
        </div>
        <div className="bk-addr-card__extra">{flat}</div>
      </div>
    )
  }

  if (phase === 'street') {
    return (
      <div className="bk-addr-card">
        <div className="bk-addr-card__row">
          <Hash size={20} className="bk-addr-card__pin" />
          <div className="bk-addr-card__text">
            <b>{value.postcode}</b>
            <span>{[place?.area, 'London'].filter(Boolean).join(', ')}</span>
          </div>
          <button type="button" className="bk-addr-card__change" onClick={restart}>
            <Pencil size={14} /> Change
          </button>
        </div>
        <div className="bk-addr-card__extra">
          <p className="bk-label">Which street?</p>
          <div className="mo-chips" role="radiogroup" aria-label="Street">
            {streets.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={!otherStreet && street === s}
                className="mo-chip"
                onClick={() => {
                  setOtherStreet(false)
                  setStreet(s)
                  numberRef.current?.focus()
                }}
              >
                {s}
              </button>
            ))}
            {streets.length > 0 && (
              <button
                type="button"
                role="radio"
                aria-checked={otherStreet}
                className="mo-chip"
                onClick={() => {
                  setOtherStreet(true)
                  setStreet('')
                }}
              >
                Another street
              </button>
            )}
          </div>
          <div className="bk-grid2 bk-addr__street">
            <div className={`bk-field${error && !number.trim() ? ' has-error' : ''}`}>
              <label className="bk-label" htmlFor="bk-number">
                House or building number
              </label>
              <input
                id="bk-number"
                ref={numberRef}
                className="mo-input"
                inputMode="text"
                autoComplete="off"
                placeholder="e.g. 21"
                maxLength={20}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>
            {otherStreet && (
              <div className={`bk-field${error && !street.trim() ? ' has-error' : ''}`}>
                <label className="bk-label" htmlFor="bk-street">
                  Street
                </label>
                <input
                  id="bk-street"
                  className="mo-input"
                  autoComplete="address-line1"
                  maxLength={100}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>
            )}
          </div>
          {flat}
        </div>
      </div>
    )
  }

  if (phase === 'manual') {
    return (
      <div className="bk-addr-manual">
        <div className={`bk-field${error && !value.line1 ? ' has-error' : ''}`}>
          <label className="bk-label" htmlFor="bk-line1">
            House number and street
          </label>
          <input
            id="bk-line1"
            className="mo-input"
            autoComplete="address-line1"
            placeholder="e.g. 21 Rye Lane"
            maxLength={120}
            value={value.line1}
            onChange={(e) => emit({ line1: e.target.value })}
          />
        </div>
        <div className="bk-grid2">
          <div className={`bk-field${error && !looksLikePostcode(value.postcode) ? ' has-error' : ''}`}>
            <label className="bk-label" htmlFor="bk-pc">
              Postcode
            </label>
            <input
              id="bk-pc"
              className="mo-input mo-input--pc"
              autoComplete="postal-code"
              placeholder="e.g. SE15 4ST"
              maxLength={8}
              value={value.postcode}
              onChange={(e) => emit({ postcode: e.target.value.toUpperCase() })}
              onBlur={(e) => looksLikePostcode(e.target.value) && emit({ postcode: formatPostcode(e.target.value) })}
            />
          </div>
          {flat}
        </div>
        {MAPBOX_TOKEN && (
          <button type="button" className="mo-link bk-addr__switch" onClick={restart}>
            <Search size={15} /> Search for the address instead
          </button>
        )}
      </div>
    )
  }

  // phase === 'search'
  const showEmpty = open && !loading && query.trim().length >= 3 && items.length === 0
  return (
    <div className="bk-addr">
      <div className={`bk-addr__box${error ? ' has-error' : ''}`}>
        <Search size={18} className="bk-addr__icon" aria-hidden="true" />
        <input
          ref={inputRef}
          id="bk-address"
          className="mo-input bk-addr__input"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          aria-label="Property address or postcode"
          autoComplete="off"
          placeholder="Start typing the address or postcode"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => items.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
        />
        {loading && <Loader2 size={18} className="bk-addr__spin bk-spin" aria-hidden="true" />}
      </div>

      {open && (items.length > 0 || showEmpty) && (
        <div className="bk-addr__list">
          <ul id={listId} role="listbox" aria-label="Addresses">
            {items.map((item, i) => (
              <li
                key={item.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className="bk-addr__opt"
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(item)}
              >
                {item.type === 'postcode' ? <Hash size={17} /> : <MapPin size={17} />}
                <span>
                  <b>{item.type === 'postcode' ? item.postcode : item.line1}</b>
                  <small>
                    {item.type === 'postcode'
                      ? `${item.area ? `${item.area} · ` : ''}pick the street next`
                      : [item.area, item.postcode].filter(Boolean).join(', ')}
                  </small>
                </span>
              </li>
            ))}
          </ul>
          {showEmpty && <p className="bk-addr__empty">No London address matches yet. Keep typing, or enter it by hand.</p>}
          <div className="bk-addr__foot">
            <button
              type="button"
              className="mo-link"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setOpen(false)
                setPhase('manual')
                if (looksLikePostcode(query)) emit({ postcode: formatPostcode(query) })
              }}
            >
              Can’t find it? Enter it by hand
            </button>
            <span>Search by Mapbox</span>
          </div>
        </div>
      )}
    </div>
  )
}
