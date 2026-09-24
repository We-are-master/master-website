import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, X } from 'lucide-react'
import { EXIT_OFFER } from '../content/site.js'
import { loadBooking, saveBooking } from '../lib/store.js'
import { track } from '../lib/track.js'

const SEEN = 'fx_exit_offer'
// No celular não existe "sair pela aba": o gatilho é o tempo na página.
const MOBILE_AFTER_MS = 45000

function alreadySeen() {
  try {
    return window.sessionStorage.getItem(SEEN) === '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    window.sessionStorage.setItem(SEEN, '1')
  } catch {
    /* sessão sem storage: a oferta pode aparecer de novo, e tudo bem */
  }
}

/**
 * Quem está indo embora leva 10% para voltar. No desktop o gatilho é o mouse
 * saindo por cima (fechar a aba, trocar de site); no celular, tempo na
 * página. Uma vez por sessão, e nunca antes da resposta do banner de cookies,
 * para não empilhar duas caixas na cara de quem chegou agora.
 */
export default function ExitOffer() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const closeRef = useRef(null)

  const show = useCallback(() => {
    if (alreadySeen()) return
    // Quem chegou com código de campanha já tem desconto: o pop-up trocaria
    // o código dele pelo nosso sem ele perceber.
    const current = loadBooking()
    if (current.promoCode || current.promo) return
    try {
      if (!window.localStorage.getItem('cookieConsent')) return
    } catch {
      /* sem storage: segue e mostra */
    }
    markSeen()
    setOpen(true)
    track('exit_offer_shown', { code: EXIT_OFFER.code })
  }, [])

  useEffect(() => {
    if (alreadySeen()) return undefined
    const onOut = (e) => {
      if (e.clientY <= 0 && !e.relatedTarget) show()
    }
    document.addEventListener('mouseout', onOut)
    const coarse = window.matchMedia?.('(pointer: coarse)').matches
    const timer = coarse ? setTimeout(show, MOBILE_AFTER_MS) : null
    return () => {
      document.removeEventListener('mouseout', onOut)
      if (timer) clearTimeout(timer)
    }
  }, [show])

  useEffect(() => {
    if (!open) return undefined
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  // O código fica guardado na reserva e o checkout aplica sozinho, já com o
  // serviço escolhido (é ele que decide o desconto).
  const take = () => {
    saveBooking({ ...loadBooking(), promoCode: EXIT_OFFER.code })
    track('exit_offer_taken', { code: EXIT_OFFER.code })
    setOpen(false)
    navigate('/book')
  }

  return (
    <div className="mo-exit" role="dialog" aria-modal="true" aria-labelledby="mo-exit-title">
      <button type="button" className="mo-exit__scrim" aria-label="Close" onClick={() => setOpen(false)} />
      <div className="mo-exit__panel">
        <button type="button" className="mo-exit__close" ref={closeRef} aria-label="Close" onClick={() => setOpen(false)}>
          <X size={18} />
        </button>
        <p className="mo-exit__eyebrow">
          <Tag size={15} /> {EXIT_OFFER.percentOff}% off your booking
        </p>
        <h2 className="mo-display" id="mo-exit-title">
          Before you go<span className="mo-dot">.</span>
        </h2>
        <p className="mo-exit__sub">
          Take {EXIT_OFFER.percentOff}% off today. We add the code for you at checkout, and the price you see is the price you
          pay.
        </p>
        <button type="button" className="mo-btn mo-btn--primary mo-btn--lg" onClick={take}>
          Get {EXIT_OFFER.percentOff}% off
        </button>
        <button type="button" className="mo-link mo-exit__no" onClick={() => setOpen(false)}>
          No thanks
        </button>
      </div>
    </div>
  )
}
