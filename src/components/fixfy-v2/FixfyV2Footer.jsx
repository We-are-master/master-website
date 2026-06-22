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
                <Link to="/platform">Portal</Link>
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
            <h5>Trades Solutions</h5>
            <ul>
              <li>
                <a href="https://partners.getfixfy.com/">Fixfy Pro</a>
              </li>
              <li>
                <a href="/growth/index.html">Fixfy Growth</a>
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
          <div>
            <h5>Fixfy</h5>
            <ul>
              <li>
                <a href="https://getfixfy.com">Fixfy</a>
              </li>
              <li>
                <a href="https://getfixfy.com/growth">Fixfy Growth</a>
              </li>
              <li>
                <a href="https://partners.getfixfy.com/">Fixfy Partners</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="v2-footer-bot">
          <span>© {new Date().getFullYear()} Fixfy Ltd · United Kingdom · All rights reserved.</span>
          <span className="v2-mono">website v3</span>
        </div>
      </div>
    </footer>
  )
}
