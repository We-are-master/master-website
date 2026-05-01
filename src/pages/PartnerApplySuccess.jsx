import React from 'react';
import { Link } from 'react-router-dom';
import { Home, CheckCircle } from 'lucide-react';
import FixfyLogo from '../components/FixfyLogo';
import './PartnerApplySuccess.css';

export default function PartnerApplySuccess() {
  return (
    <div className="pas-root">
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <header className="pas-header">
        <Link to="/" className="pas-logo">
          <FixfyLogo variant="onDark" alt="Fixfy" />
        </Link>
        <Link to="/" className="pas-home">
          <Home size={18} />
          Home
        </Link>
      </header>

      <div className="pas-container">
        <div className="pas-card">
          <div className="pas-icon-wrap">
            <CheckCircle className="pas-icon" aria-hidden />
          </div>
          <h1>Application received</h1>
          <p className="pas-lead">
            Thank you for applying to become a Fixfy Partner. We have received your application and documents.
          </p>
          <p className="pas-contact">
            We will be in touch soon. If you have any questions in the meantime, email us at{' '}
            <a href="mailto:hello@getfixfy.com">hello@getfixfy.com</a>.
          </p>
          <Link to="/" className="pas-btn">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
