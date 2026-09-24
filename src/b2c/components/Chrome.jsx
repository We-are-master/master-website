import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import { COMPANY, whatsappLink } from '../content/site.js'
import ExitOffer from './ExitOffer.jsx'
import { captureAttribution, track } from '../lib/track.js'
import { capturePromoFromUrl } from '../lib/store.js'
import { openCookieSettings } from '../../lib/consent.js'
import '../b2c.css'

/**
 * "Services" agrupa todos os serviços: no computador vira um menu pequeno,
 * no celular vira um link por serviço na lista.
 */
const NAV = [
  { to: '/business', label: 'For Business' },
  {
    label: 'Services',
    items: [
      { to: '/end-of-tenancy-cleaning', label: 'End of tenancy cleaning' },
      { to: '/deep-cleaning', label: 'Deep cleaning' },
      { to: '/after-builders-cleaning', label: 'After builders cleaning' },
      { to: '/painting', label: 'Painting' },
      { to: '/repairs', label: 'Repairs' },
      { to: '/landlord-certificates', label: 'Certificates' },
    ],
  },
]

/**
 * Revela seções ao entrar na tela (só quando o usuário aceita movimento).
 * Também vigia o que monta depois (reviews que chegam em seguida, páginas
 * carregadas sob demanda): antes, isso ficava invisível para sempre.
 */
function useReveal(pathname) {
  useEffect(() => {
    const pending = () => document.querySelectorAll('.mo-reveal:not(.is-in)')
    if (!('IntersectionObserver' in window)) {
      const showAll = () => pending().forEach((el) => el.classList.add('is-in'))
      showAll()
      const mo = new MutationObserver(showAll)
      mo.observe(document.body, { childList: true, subtree: true })
      return () => mo.disconnect()
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    const watched = new WeakSet()
    const scan = () =>
      pending().forEach((el) => {
        if (watched.has(el)) return
        watched.add(el)
        io.observe(el)
      })
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])
}

const HEADER_H = 68

/** Menu de um grupo do cabeçalho: abre no hover (mouse) ou no clique, fecha fora, no Esc e ao trocar de página. */
function NavGroup({ item }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { pathname } = useLocation()
  const active = item.items.some((i) => i.to === pathname)
  const menuId = `mo-nav-${item.label.toLowerCase()}`

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      ref.current?.querySelector('button')?.focus()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={`mo-nav__group${open ? ' is-open' : ''}`} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className={`mo-nav__trigger${active ? ' is-active' : ''}`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        {item.label}
        <ChevronDown size={15} strokeWidth={2.2} aria-hidden="true" />
      </button>
      <div className="mo-nav__menu" id={menuId}>
        {item.items.map((i) => (
          <NavLink key={i.to} to={i.to} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
            {i.label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export function B2CHeader({ minimal = false, right = null }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // Enquanto o hero navy está atrás do header, o header também é navy: a
  // primeira tela é navy inteira. Passou do hero, volta a branco.
  const [overNavy, setOverNavy] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])
  useLayoutEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 8)
      const hero = document.querySelector('.mo-hero')
      setOverNavy(Boolean(hero) && hero.getBoundingClientRect().bottom > HEADER_H)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [pathname])

  return (
    <header className={`mo-header${scrolled ? ' is-scrolled' : ''}${overNavy ? ' mo-header--navy' : ''}`}>
      <div className="mo-wrap mo-header__in">
        <Link to="/" className="mo-brand" aria-label="Fixfy home">
          <img src={overNavy ? '/b2c/fixfy-white.png' : '/b2c/fixfy-navy.png'} alt="Fixfy" width="85" height="30" />
          <span className="mo-brand__tag">
            Home jobs at
            <br />
            a fixed price
          </span>
        </Link>

        {minimal ? (
          <div className="mo-header__cta">{right}</div>
        ) : (
          <>
            <nav className="mo-nav" aria-label="Main">
              {NAV.map((item) =>
                item.items ? (
                  <NavGroup key={item.label} item={item} />
                ) : item.hash ? (
                  <a key={item.to} href={item.to}>
                    {item.label}
                  </a>
                ) : (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
                    {item.label}
                  </NavLink>
                ),
              )}
            </nav>
            <div className="mo-header__cta">
              <Link to="/book" className="mo-btn mo-btn--primary mo-btn--sm">
                Get a price
              </Link>
              <button
                type="button"
                className="mo-menu-btn"
                aria-expanded={open}
                aria-controls="mo-mobile-nav"
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X size={20} /> : <Menu size={20} />}
                <span className="mo-sr">{open ? 'Close menu' : 'Open menu'}</span>
              </button>
            </div>
          </>
        )}
      </div>
      {!minimal && open && (
        <nav id="mo-mobile-nav" className="mo-mobile-nav" aria-label="Mobile">
          {NAV.flatMap((item) => item.items || [item]).map((item) =>
            item.hash ? (
              <a key={item.to} href={item.to} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ) : (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ),
          )}
        </nav>
      )}
    </header>
  )
}

export function B2CFooter() {
  return (
    <footer className="mo-footer">
      <div className="mo-wrap">
        <div className="mo-footer__grid">
          <div className="mo-footer__brand">
            <img src="/b2c/fixfy-navy.png" alt="Fixfy" width="85" height="30" />
            <p>
              Cleaning, painting, repairs and landlord certificates across London. Fixed prices, booked and paid
              online, with a photo of every room when we finish.
            </p>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              <li><Link to="/end-of-tenancy-cleaning">End of tenancy cleaning</Link></li>
              <li><Link to="/deep-cleaning">Deep cleaning</Link></li>
              <li><Link to="/after-builders-cleaning">After builders cleaning</Link></li>
              <li><Link to="/painting">Painting and touch-ups</Link></li>
              <li><Link to="/repairs">Repairs</Link></li>
              <li><Link to="/landlord-certificates">Landlord certificates</Link></li>
              <li><a href="/#prices">Prices</a></li>
            </ul>
          </div>
          <div>
            <h4>Fixfy</h4>
            <ul>
              <li><Link to="/business">For letting agents</Link></li>
              <li><a href="https://partners.getfixfy.com/get-started">Work with us</a></li>
              <li><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
              {COMPANY.phone && <li><a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}>{COMPANY.phone}</a></li>}
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li><Link to="/terms">Terms</Link></li>
              <li><Link to="/guarantee">Guarantee</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
              <li><Link to="/cookies">Cookies</Link></li>
              <li>
                <button type="button" className="mo-footer__link" onClick={openCookieSettings}>
                  Cookie settings
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="mo-footer__legal">
          <span>
            © {new Date().getFullYear()} {COMPANY.legalName} · {COMPANY.address} · Company number {COMPANY.companyNumber} · VAT{' '}
            {COMPANY.vatNumber}
          </span>
          <span>Prices include VAT</span>
        </div>
      </div>
    </footer>
  )
}


/**
 * Botão de WhatsApp fixo no canto inferior direito, em toda página B2C.
 * No celular ele sobe para não cobrir a barra de preço, que é o CTA principal.
 */
function WhatsAppButton() {
  const href = whatsappLink('Hi Fixfy, I have a question')
  if (!href) return null
  return (
    <a
      className="mo-wa"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Message Fixfy on WhatsApp"
      onClick={() => track('whatsapp_click')}
    >
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05s.89 2.38 1.01 2.54c.12.17 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z"
        />
      </svg>
    </a>
  )
}

/** Moldura das páginas B2C: fundo branco, cabeçalho próprio, origem capturada. */
export default function B2CLayout({ children, minimalHeader = false, headerRight = null, footer = true }) {
  const { pathname } = useLocation()

  useEffect(() => {
    document.body.setAttribute('data-site', 'b2c')
    captureAttribution()
    const promo = capturePromoFromUrl(window.location.search)
    if (promo) track('promo_link_opened', { code: promo })
    return () => document.body.removeAttribute('data-site')
  }, [])

  useReveal(pathname)

  return (
    <div className="mo-root">
      <B2CHeader minimal={minimalHeader} right={headerRight} />
      <main>{children}</main>
      {footer && <B2CFooter />}
      <WhatsAppButton />
      {/* Quem já está na reserva não leva pop-up: ele atrapalharia a compra. */}
      {!pathname.startsWith('/book') && <ExitOffer />}
    </div>
  )
}
