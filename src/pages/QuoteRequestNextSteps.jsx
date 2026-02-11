import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check,
  ShieldCheck,
  Wifi,
  Signal,
  Battery,
  Wrench,
  Award,
  Lock,
} from 'lucide-react';
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
        <div className="qrns-status-bar">
          <span>9:41</span>
          <div className="qrns-status-icons">
            <Signal size={12} />
            <Wifi size={12} />
            <Battery size={12} className="rotate-90" />
          </div>
        </div>

        <div className="qrns-hero">
          <div className="qrns-success-ring">
            <div className="qrns-success-icon">
              <Check strokeWidth={3} />
            </div>
          </div>
          <h1 className="qrns-title">Request Received!</h1>
          <div className="qrns-badge">
            <ShieldCheck size={14} fill="currentColor" />
            <span className="qrns-badge-text">
              {ref ? `Master Managed Job #${ref}` : 'Master Managed'}
            </span>
          </div>
        </div>

        <div className="qrns-card-wrap">
          <div className="qrns-card">
            <div className="qrns-card-header">
              <div className="qrns-card-header-icon">
                <Wrench />
              </div>
              <div>
                <h2>Your Master Project Manager is on it.</h2>
                <p>We've started coordinating your request.</p>
              </div>
            </div>
            <div className="qrns-steps">
              <div className="qrns-steps-line" aria-hidden />
              <div className="qrns-step">
                <div className="qrns-step-num">1</div>
                <div>
                  <h3>AI Analysis</h3>
                  <p>
                    We're matching your job with the best local pro{' '}
                    <span className="qrns-step-highlight">(2-5 mins).</span>
                  </p>
                </div>
              </div>
              <div className="qrns-step">
                <div className="qrns-step-num">2</div>
                <div>
                  <h3>Direct Contact</h3>
                  <p>
                    You'll receive a message via{' '}
                    <span className="qrns-whatsapp">WhatsApp</span>.
                  </p>
                </div>
              </div>
              <div className="qrns-step">
                <div className="qrns-step-num">3</div>
                <div>
                  <h3>Instant Booking</h3>
                  <p>
                    Confirm your time and pay securely via the Master dashboard.
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

        <div className="qrns-cta-bar">
          <button
            type="button"
            className="qrns-cta-primary"
            onClick={() => navigate(bookingPath)}
          >
            View request status
          </button>
          <button
            type="button"
            className="qrns-cta-secondary"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
          <div className="qrns-cta-footer">
            <Lock size={12} />
            <p>Secure managed booking by Master</p>
          </div>
        </div>

        <div className="qrns-home-indicator" aria-hidden />
      </div>
    </div>
  );
}
