import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import FixfyLogo from '../FixfyLogo'
import { initBgToggle } from '../../fixfy-site-v2/v2Effects.js'

function navCls({ isActive }) {
  return `v2-nav-link${isActive ? ' active' : ''}`
}

export default function FixfyV2Nav() {
  useEffect(() => {
    initBgToggle()
  }, [])

  return (
    <nav className="v2-nav">
      <div className="v2-nav-inner">
        <Link to="/" className="v2-nav-brand" aria-label="Fixfy — Home">
          <FixfyLogo variant="onDark" />
        </Link>
        <div className="v2-nav-links" id="nav-links">
          <div className="v2-nav-link-wrap">
            <Link className="v2-nav-link" data-dropdown to="/">
              Solutions
            </Link>
            <div className="v2-dropdown">
              <Link to="/solutions/real-estate" className="v2-dd-item">
                <span className="lbl">Real Estate</span>
                <span className="desc">Portfolios · compliance · multi-asset</span>
              </Link>
              <Link to="/solutions/franchises" className="v2-dd-item">
                <span className="lbl">Franchises</span>
                <span className="desc">Multi-site standards · revenue uptime</span>
              </Link>
              <Link to="/solutions/enterprise-operations" className="v2-dd-item">
                <span className="lbl">Enterprise Operations</span>
                <span className="desc">High-volume · complex compliance</span>
              </Link>
              <Link to="/solutions/service-platforms" className="v2-dd-item">
                <span className="lbl">Service Platforms</span>
                <span className="desc">API + white-label our trade engine</span>
              </Link>
            </div>
          </div>
          <NavLink className={navCls} to="/platform">
            Platform
          </NavLink>
          <NavLink className={navCls} to="/about">
            About
          </NavLink>
          <NavLink className={navCls} to="/contact">
            Contact
          </NavLink>
        </div>
        <div className="v2-nav-cta">
          <Link to="/login" className="v2-nav-link ghost">
            Log in
          </Link>
          <Link to="/contact" className="v2-btn v2-btn-primary">
            Talk to us <span className="arr">→</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
