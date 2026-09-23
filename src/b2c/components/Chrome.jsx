import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import { COMPANY } from '../content/site.js'
import ExitOffer from './ExitOffer.jsx'
import { captureAttribution } from '../lib/track.js'
import { openCookieSettings } from '../../lib/consent.js'
import '../b2c.css'

/**
 * "Cleaning" agrupa os dois tipos de limpeza: no computador vira um menu
 * pequeno (um sétimo item não cabe a partir de 1000px), no celular vira dois
 * links na lista.
 */
const NAV = [
  {
    label: 'Cleaning',
    items: [
      { to: '/end-of-tenancy-cleaning', label: 'End of tenancy cleaning' },
      { to: '/deep-cleaning', label: 'Deep cleaning' },
      { to: '/after-builders-cleaning', label: 'After builders cleaning' },
    ],
  },
  { to: '/painting', label: 'Painting' },
  { to: '/repairs', label: 'Repairs' },
  { to: '/landlord-certificates', label: 'Certificates' },
  { to: '/#prices', label: 'Prices', hash: true },
  { to: '/business', label: 'For agents' },
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
      const hero = document.querySelector('.mo-hero, .mo-shero')
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

/** Moldura das páginas B2C: fundo branco, cabeçalho próprio, origem capturada. */
export default function B2CLayout({ children, minimalHeader = false, headerRight = null, footer = true }) {
  const { pathname } = useLocation()

  useEffect(() => {
    document.body.setAttribute('data-site', 'b2c')
    captureAttribution()
    return () => document.body.removeAttribute('data-site')
  }, [])

  useReveal(pathname)

  return (
    <div className="mo-root">
      <B2CHeader minimal={minimalHeader} right={headerRight} />
      <main>{children}</main>
      {footer && <B2CFooter />}
      {/* Quem já está na reserva não leva pop-up: ele atrapalharia a compra. */}
      {!pathname.startsWith('/book') && <ExitOffer />}
    </div>
  )
}
