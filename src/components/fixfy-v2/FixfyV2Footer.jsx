import { Link } from 'react-router-dom'
import FixfyLogo from '../FixfyLogo'

export default function FixfyV2Footer() {
  return (
    <footer className="v2-footer">
      <div className="v2-container">
        <div className="v2-footer-grid">
          <div className="v2-footer-brand">
            <Link to="/" className="v2-footer-brand-lockup" aria-label="Fixfy — Home">
              <FixfyLogo variant="onDark" />
            </Link>
            <p>Maintenance infrastructure for British business — and a £49 operating system for every trade.</p>
          </div>
          <div>
            <h5>Solutions</h5>
            <ul>
              <li>
                <Link to="/solutions/real-estate">Real Estate</Link>
              </li>
              <li>
                <Link to="/solutions/franchises">Franchises</Link>
              </li>
              <li>
                <Link to="/solutions/enterprise-operations">Enterprise Operations</Link>
              </li>
              <li>
                <Link to="/solutions/service-platforms">Service Platforms</Link>
              </li>
            </ul>
          </div>
          <div>
            <h5>Company</h5>
            <ul>
              <li>
                <Link to="/platform">Platform</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/careers">Careers</Link>
              </li>
            </ul>
          </div>
          <div>
            <h5>Resources</h5>
            <ul>
              <li>
                <Link to="/contact">Book a demo</Link>
              </li>
              <li>
                <Link to="/contact">Emergency support</Link>
              </li>
              <li>
                <Link to="/contact">Partner inquiries</Link>
              </li>
              <li>
                <Link to="/careers">Careers</Link>
              </li>
            </ul>
          </div>
          <div>
            <h5>Legal</h5>
            <ul>
              <li>
                <Link to="/privacy">Privacy</Link>
              </li>
              <li>
                <Link to="/terms">Terms</Link>
              </li>
              <li>
                <Link to="/security">Security</Link>
              </li>
              <li>
                <Link to="/dpa">DPA</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="v2-footer-bot">
          <span>© {new Date().getFullYear()} Fixfy Ltd · United Kingdom · All rights reserved.</span>
          <span className="v2-mono">website v2</span>
        </div>
      </div>
    </footer>
  )
}
