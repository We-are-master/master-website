import React from 'react'
import { Link } from 'react-router-dom'
import FixfyLogo from '../FixfyLogo'

export default function Footer() {
  return (
    <footer className="fx-footer">
      <div className="fx-container">
        <div className="fx-footer-top">
          <div className="fx-footer-brand">
            <FixfyLogo variant="onDark" />
            <p>Maintenance infrastructure for British business. Free to list — forever.</p>
          </div>

          <div className="fx-footer-col">
            <h5>Platform</h5>
            <ul>
              <li><Link to="/platform">How it works</Link></li>
              <li><Link to="/platform">Jobs &amp; SLAs</Link></li>
              <li><Link to="/platform">Assets</Link></li>
              <li><Link to="/platform">Compliance</Link></li>
            </ul>
          </div>

          <div className="fx-footer-col">
            <h5>Who it&rsquo;s for</h5>
            <ul>
              <li><Link to="/for-fms">Facilities managers</Link></li>
              <li><Link to="/for-owners">Property owners</Link></li>
              <li><Link to="/for-trades">Tradespeople</Link></li>
              <li><Link to="/customers">Enterprise</Link></li>
            </ul>
          </div>

          <div className="fx-footer-col">
            <h5>Company</h5>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/customers">Customers</Link></li>
              <li><Link to="/trust">Trust &amp; security</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="fx-footer-col">
            <h5>Legal</h5>
            <ul>
              <li><a href="/legal/terms">Terms of service</a></li>
              <li><a href="/legal/privacy">Privacy policy</a></li>
              <li><a href="/legal/modern-slavery">Modern slavery statement</a></li>
              <li><a href="/legal/cookies">Cookie policy</a></li>
            </ul>
          </div>
        </div>

        <div className="fx-footer-bottom">
          <span>&copy; Fixfy Ltd 2026 &middot; Bristol &middot; Registered in England &amp; Wales &middot; No. 14829301 &middot; getfixfy.com</span>
          <div className="fx-links">
            <a href="https://status.getfixfy.com" target="_blank" rel="noreferrer">Status &middot; Operational</a>
            <span>United Kingdom (EN)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
