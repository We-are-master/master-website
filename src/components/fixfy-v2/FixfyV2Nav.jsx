import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import FixfyLogo from '../FixfyLogo'
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
                Solutions
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
            <NavLink className={navCls} to="/platform" onClick={closeMenu}>
              Platform
            </NavLink>
            <NavLink className={navCls} to="/about" onClick={closeMenu}>
              About
            </NavLink>
            <NavLink className={navCls} to="/contact" onClick={closeMenu}>
              Contact
            </NavLink>
          </div>
          <div className="v2-nav-cta">
            <a href="/partners" className="v2-nav-link ghost" onClick={closeMenu}>
              Become a partner
            </a>
            <Link to="/login" className="v2-nav-link ghost" onClick={closeMenu}>
              Log in
            </Link>
            <Link to="/contact" className="v2-btn v2-btn-primary" onClick={closeMenu}>
              Talk to us <span className="arr">→</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
