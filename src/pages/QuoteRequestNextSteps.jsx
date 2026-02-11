import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check,
  ShieldCheck,
  Home,
  Wrench,
  Award,
  Lock,
} from 'lucide-react';
import logo from '../assets/logo.png';
import './QuoteRequestNextSteps.css';

export default function QuoteRequestNextSteps() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref') || '';
  const postcode = searchParams.get('postcode') || '';
  const service = searchParams.get('service') || '';

  const bookingQuery = new URLSearchParams();
  if (postcode) bookingQuery.set('postcode', postcode);
  if (service) bookingQuery.set('service', service);
  const bookingPath = bookingQuery.toString() ? `/booking?${bookingQuery.toString()}` : '/booking';

  return (
    <div className="qrns-root">
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <div className="qrns-wrapper">
        <header className="qrns-header">
          <Link to="/" className="qrns-logo-link" aria-label="Master - Go to home">
            <img src={logo} alt="Master" className="qrns-logo" />
          </Link>
          <Link to="/" className="qrns-home-btn">
            <Home size={18} />
            <span>Home</span>
          </Link>
        </header>

        <div className="qrns-hero">
          <div className="qrns-success-ring">
            <div className="qrns-success-icon">
              <Check strokeWidth={3} />
            </div>
          </div>
          <h1 className="qrns-title">Your free quote is on the way</h1>
          <div className="qrns-badge">
            <ShieldCheck size={14} fill="currentColor" />
            <span className="qrns-badge-text">
              {ref ? `Request #${ref}` : "We're on it"}
            </span>
          </div>
        </div>

        <div className="qrns-main-content">
        <div className="qrns-card-wrap">
          <div className="qrns-card">
            <div className="qrns-card-header">
              <div className="qrns-card-header-icon">
                <Wrench />
              </div>
              <div>
                <h2>We're finding your trusted pro.</h2>
                <p>Cleaning, plumbing, painting, handyman — we've got you covered. You'll get your free quote within minutes.</p>
              </div>
            </div>
            <div className="qrns-steps">
              <div className="qrns-steps-line" aria-hidden />
              <div className="qrns-step">
                <div className="qrns-step-num">1</div>
                <div>
                  <h3>Finding your pro</h3>
                  <p>
                    We're matching you with a trusted local pro for your job{' '}
                    <span className="qrns-step-highlight">(usually 2–5 mins).</span>
                  </p>
                </div>
              </div>
              <div className="qrns-step">
                <div className="qrns-step-num">2</div>
                <div>
                  <h3>Your free quote</h3>
                  <p>
                    You'll receive your quote via{' '}
                    <span className="qrns-whatsapp">WhatsApp</span> or your preferred contact — no obligation.
                  </p>
                </div>
              </div>
              <div className="qrns-step">
                <div className="qrns-step-num">3</div>
                <div>
                  <h3>Book when you're ready</h3>
                  <p>
                    Review the quote and pay securely when you're happy to go ahead. Insured & guaranteed by Master.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="qrns-while">
          <h4 className="qrns-while-title">While you wait</h4>
          <div className="qrns-master-club">
            <div className="qrns-master-club-blur" aria-hidden />
            <div className="qrns-master-club-inner">
              <div className="qrns-master-club-left">
                <div className="qrns-master-club-label">
                  <Award size={18} />
                  <span>Master Club</span>
                </div>
                <h3>Save 27% on<br />this job</h3>
                <button
                  type="button"
                  className="qrns-master-club-cta"
                  onClick={() => navigate(bookingPath)}
                >
                  Join Now
                </button>
              </div>
              <div className="qrns-master-club-badge">
                <span className="qrns-offer-num">27%</span>
                <span className="qrns-offer-label">OFF</span>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="qrns-cta-bar">
          <button
            type="button"
            className="qrns-cta-secondary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
          <div className="qrns-cta-footer">
            <Lock size={12} />
            <p>Free quote. No obligation. Insured & guaranteed by Master.</p>
          </div>
        </div>

        <div className="qrns-home-indicator" aria-hidden />
      </div>
    </div>
  );
}
