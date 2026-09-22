import { useState } from 'react'
import { Loader2, Tag, X } from 'lucide-react'
import { checkPromo } from '../lib/api.js'

/**
 * "Have a promo code?" no checkout. O servidor confere o código na Stripe e
 * devolve só os termos (percentOff ou amountOff); o desconto do resumo sai de
 * `applyPromo`, e a cobrança revalida o código antes de nascer.
 */
export default function PromoField({ promo, selection, onChange }) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const apply = async () => {
    const value = code.trim()
    if (!value) {
      setError('Enter the code.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await checkPromo({ code: value, selection })
      onChange(res.promo)
      setCode('')
      setOpen(false)
    } catch (err) {
      setError(err.message || 'We could not check the code. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (promo) {
    return (
      <div className="bk-promo bk-promo--on" role="status">
        <Tag size={16} />
        <span>
          <b>{promo.code}</b> applied{promo.percentOff ? `, ${promo.percentOff}% off` : ''}
        </span>
        <button type="button" className="mo-link" onClick={() => onChange(null)}>
          Remove
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button type="button" className="mo-link bk-promo__open" onClick={() => setOpen(true)}>
        <Tag size={15} /> Have a promo code?
      </button>
    )
  }

  return (
    <div className={`bk-promo${error ? ' has-error' : ''}`}>
      <label className="bk-label" htmlFor="bk-promo">
        Promo code
      </label>
      <div className="bk-promo__row">
        <input
          id="bk-promo"
          className="mo-input"
          value={code}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={40}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
          onKeyDown={(e) => {
            // Enter aqui aplica o código; sem isso o formulário seguiria para o pagamento.
            if (e.key === 'Enter') {
              e.preventDefault()
              apply()
            }
          }}
          aria-describedby={error ? 'bk-promo-error' : undefined}
        />
        <button type="button" className="mo-btn mo-btn--ghost" onClick={apply} disabled={busy}>
          {busy ? <Loader2 size={16} className="bk-spin" /> : 'Apply'}
        </button>
        <button
          type="button"
          className="bk-promo__close"
          aria-label="Close"
          onClick={() => {
            setOpen(false)
            setError('')
          }}
        >
          <X size={16} />
        </button>
      </div>
      {error && (
        <p className="bk-error" id="bk-promo-error">
          {error}
        </p>
      )}
    </div>
  )
}
