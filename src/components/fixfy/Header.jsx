import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Button from './Button'

const NAV_LINKS = [
  { to: '/platform',   label: 'Platform' },
  { to: '/for-fms',    label: 'For FMs' },
  { to: '/for-owners', label: 'For owners' },
  { to: '/for-trades', label: 'For trades' },
  { to: '/customers',  label: 'Customers' },
  { to: '/trust',      label: 'Trust' },
  { to: '/about',      label: 'About' },
  { to: '/blog',       label: 'Blog' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fx-nav">
      <div className="fx-nav-inner">
        <Link to="/" className="fx-nav-brand" onClick={() => setOpen(false)}>
          <img src="/brand/fixfy-primary-white.png" alt="Fixfy" />
        </Link>

        <div className="fx-nav-links">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
          ))}
        </div>

        <div className="fx-nav-cta">
          <a href="https://portal.getfixfy.com" className="fx-nav-signin">Sign in</a>
          <Button to="/contact" arrow>Book a demo</Button>
          <button
            className="fx-nav-toggle"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '×' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '16px 20px 20px',
          display: 'flex', flexDirection: 'column', gap: 4,
          background: 'rgba(10,10,31,0.96)',
        }}>
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              style={{
                color: 'rgba(255,255,255,0.78)',
                textDecoration: 'none',
                padding: '10px 12px',
                borderRadius: 4,
                fontSize: 15,
              }}
            >
              {l.label}
            </NavLink>
          ))}
          <a href="https://portal.getfixfy.com" onClick={() => setOpen(false)} style={{
            color: 'rgba(255,255,255,0.78)', textDecoration: 'none',
            padding: '10px 12px', borderRadius: 4, fontSize: 15,
          }}>Sign in</a>
        </div>
      )}
    </nav>
  )
}
