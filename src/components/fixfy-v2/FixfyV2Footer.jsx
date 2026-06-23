import { Link } from 'react-router-dom'

export default function FixfyV2Footer() {
  return (
    <footer className="fx-foot">
      <div className="fx-foot-in">
        <div className="fx-foot-top">
          <div className="fx-foot-brand">
            <Link to="/" aria-label="Fixfy — Home">
              <img src="/network/fixfy-white.png" alt="fixfy" width="120" height="24" />
            </Link>
            <p>
              The operating system behind modern maintenance in the UK. Recurring work,
              commercial clients and real operational infrastructure — built for trades.
            </p>
          </div>
          <div className="fx-foot-cta">
            <span className="fx-foot-price">
              From <b>£99</b>/mo · <b>£499</b>/yr
            </span>
            <a className="fx-foot-btn" href="/network/start">
              Join now <span className="arr">→</span>
            </a>
          </div>
        </div>
        <div className="fx-foot-bot">
          <span>© 2026 Fixfy Ltd · United Kingdom · All rights reserved.</span>
          <span className="fx-foot-mono">Fixfy Partners · partner.getfixfy.com</span>
        </div>
      </div>
    </footer>
  )
}
