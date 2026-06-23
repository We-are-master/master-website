import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import FixfyLogo from '../FixfyLogo'
import {
  PARTNERS_LANDING_URL,
  CUSTOMER_LOGIN_URL,
  PARTNERS_LOGIN_URL,
  TRADES_SOLUTIONS,
} from '../../lib/partnerUrls'
import { initBgToggle } from '../../fixfy-site-v2/v2Effects.js'

function navCls({ isActive }) {
  return `v2-nav-link${isActive ? ' active' : ''}`
}

export default function FixfyV2Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    initBgToggle()
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.classList.toggle('v2-nav-menu-open', menuOpen)
    return () => document.body.classList.remove('v2-nav-menu-open')
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className={`v2-nav${menuOpen ? ' is-open' : ''}`}>
      <div className="v2-nav-inner">
        <Link to="/" className="v2-nav-brand" aria-label="Fixfy — Home" onClick={closeMenu}>
          <FixfyLogo variant="onDark" />
        </Link>

        <button
          type="button"
          className="v2-nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="v2-nav-panel"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="v2-nav-toggle-icon" aria-hidden="true" />
        </button>

        <div className="v2-nav-panel" id="v2-nav-panel">
          <div className="v2-nav-links" id="nav-links">
            <div className="v2-nav-link-wrap">
              <Link className="v2-nav-link" data-dropdown to="/" onClick={closeMenu}>
                Business Solutions
              </Link>
              <div className="v2-dropdown">
                <Link to="/solutions/real-estate" className="v2-dd-item" onClick={closeMenu}>
                  <span className="lbl">Real Estate</span>
                  <span className="desc">Portfolios · compliance · multi-asset</span>
                </Link>
                <Link to="/solutions/franchises" className="v2-dd-item" onClick={closeMenu}>
                  <span className="lbl">Franchises</span>
                  <span className="desc">Multi-site standards · revenue uptime</span>
                </Link>
                <Link to="/solutions/enterprise-operations" className="v2-dd-item" onClick={closeMenu}>
                  <span className="lbl">Enterprise Operations</span>
                  <span className="desc">High-volume · complex compliance</span>
                </Link>
                <Link to="/solutions/service-platforms" className="v2-dd-item" onClick={closeMenu}>
                  <span className="lbl">Service Platforms</span>
                  <span className="desc">API + white-label our trade engine</span>
                </Link>
              </div>
            </div>
            <div className="v2-nav-link-wrap">
              <span className="v2-nav-link" data-dropdown role="button" tabIndex={0}>
                Trades Solutions
              </span>
              <div className="v2-dropdown">
                {TRADES_SOLUTIONS.map((item) => {
                  const isExternal = item.href.startsWith('http')
                  const className = 'v2-dd-item'
                  const inner = (
                    <>
                      <span className="lbl">{item.label}</span>
                      <span className="desc">{item.desc}</span>
                    </>
                  )
                  return isExternal ? (
                    <a key={item.label} href={item.href} className={className} onClick={closeMenu}>
                      {inner}
                    </a>
                  ) : (
                    <Link key={item.label} to={item.href} className={className} onClick={closeMenu}>
                      {inner}
                    </Link>
                  )
                })}
              </div>
            </div>
            <NavLink className={navCls} to="/platform" onClick={closeMenu}>
              Portal
            </NavLink>
            <NavLink className={navCls} to="/about" onClick={closeMenu}>
              About
            </NavLink>
            <NavLink className={navCls} to="/contact" onClick={closeMenu}>
              Contact
            </NavLink>
          </div>
          <div className="v2-nav-cta">
            <a href={PARTNERS_LANDING_URL} className="v2-nav-link ghost" onClick={closeMenu}>
              Become a partner
            </a>
            <div className="v2-nav-link-wrap v2-nav-link-wrap--login">
              <span className="v2-nav-link ghost" data-dropdown role="button" tabIndex={0}>
                Log in
              </span>
              <div className="v2-dropdown">
                <a href={CUSTOMER_LOGIN_URL} className="v2-dd-item" onClick={closeMenu}>
                  <span className="lbl">Customer Login</span>
                  <span className="desc">Property &amp; facilities portal</span>
                </a>
                <a href={PARTNERS_LOGIN_URL} className="v2-dd-item" onClick={closeMenu}>
                  <span className="lbl">Partner Login</span>
                  <span className="desc">Trades · quotes · jobs</span>
                </a>
              </div>
            </div>
            <Link to="/contact" className="v2-btn v2-btn-primary" onClick={closeMenu}>
              Talk to us <span className="arr">→</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
