import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  CheckCircle,
  Phone,
  MessageCircle,
  Mail,
  Star,
  Shield,
  Wifi,
  Signal,
  Battery,
} from 'lucide-react';
import { saveHeroLead } from '../lib/email';
import './LP.css';

const UK_FLAG_SRC = 'https://flagcdn.com/w40/gb.png';

const isValidUKPostcode = (value) => {
  const trimmed = (value || '').trim().toUpperCase().replace(/\s+/g, ' ');
  const match = trimmed.match(/[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}/i);
  return match && match[0].length >= 5;
};

const formatPostcode = (value) => {
  const trimmed = (value || '').trim().toUpperCase().replace(/\s+/g, ' ');
  const match = trimmed.match(/[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}/i);
  return match ? match[0] : trimmed;
};

const isValidEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
};

const PREFERRED_CONTACT = { CALL: 'call', WHATSAPP: 'whatsapp', EMAIL: 'email' };

export default function LP() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [postcode, setPostcode] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [serviceDetails, setServiceDetails] = useState('');
  const [preferredContact, setPreferredContact] = useState(PREFERRED_CONTACT.CALL);

  const [postcodeError, setPostcodeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Optional: pre-fill postcode from URL ?postcode=SW1A+1AA
  useEffect(() => {
    const fromUrl = searchParams.get('postcode');
    if (fromUrl && !postcode) setPostcode(fromUrl.trim().toUpperCase().replace(/\s+/g, ' '));
  }, [searchParams]);

  const postcodeValid = postcode && isValidUKPostcode(postcode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPostcodeError('');
    setEmailError('');

    const rawPostcode = postcode.trim();
    if (!rawPostcode) {
      setPostcodeError('Please enter your postcode');
      return;
    }
    if (!isValidUKPostcode(rawPostcode)) {
      setPostcodeError('Please enter a valid UK postcode (e.g. SW1A 1AA)');
      return;
    }

    const rawEmail = email.trim();
    if (!rawEmail) {
      setEmailError('Please enter your email');
      return;
    }
    if (!isValidEmail(rawEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    const normalizedPostcode = formatPostcode(rawPostcode);

    const phoneValue = mobile.trim() ? `+44${mobile.replace(/\D/g, '')}` : undefined;
    const result = await saveHeroLead({
      email: rawEmail.toLowerCase(),
      postcode: normalizedPostcode,
      service: serviceDetails.trim() || null,
      source: 'lp',
      phone: phoneValue,
      preferred_contact: preferredContact,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success('Thanks! We’ll be in touch soon.');
      const params = new URLSearchParams();
      params.set('postcode', normalizedPostcode);
      if (serviceDetails.trim()) params.set('service', serviceDetails.trim());
      navigate(`/request-received?${params.toString()}`);
    } else {
      toast.error(result.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="lp-root">
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <div className="lp-wrapper">
        {/* Status bar */}
        <div className="lp-status-bar">
          <span>9:41</span>
          <div className="lp-status-icons">
            <Signal size={12} />
            <Wifi size={12} />
            <Battery size={12} className="rotate-90" />
          </div>
        </div>

        <div className="lp-hero">
          <div className="lp-badge">
            <CheckCircle size={10} />
            <span className="lp-badge-text">We own the job</span>
          </div>
          <h1 className="lp-title">
            Book a Top Pro in Seconds.{' '}
            <span className="lp-title-accent">We handle the rest.</span>
          </h1>
          <p className="lp-subtitle">
            No searching. No chasing. No stress. From professional cleaning to expert trades, Master manages your entire job from start to finish.
          </p>
          <p className="lp-disclaimer">
            Fully managed, insured, and guaranteed by Master.
          </p>
        </div>

        <form id="lp-form" className="lp-form" onSubmit={handleSubmit} noValidate>
          <div className="lp-field">
            <label>Postcode</label>
            <div className="lp-input-wrap">
              <input
                type="text"
                className={`lp-input ${postcodeValid ? '' : postcodeError ? 'lp-input-error' : ''}`}
                value={postcode}
                onChange={(e) => {
                  setPostcode(e.target.value.toUpperCase());
                  setPostcodeError('');
                }}
                placeholder="e.g. SW1A 1AA"
                autoComplete="postal-code"
              />
              {postcodeValid && (
                <span className="lp-input-ok" aria-hidden>
                  <CheckCircle size={14} />
                </span>
              )}
            </div>
            {postcodeError && <p className="lp-field-error">{postcodeError}</p>}
          </div>

          <div className="lp-field">
            <label>Mobile Number</label>
            <div className="lp-phone-row">
              <div className="lp-phone-prefix">
                <img src={UK_FLAG_SRC} alt="UK" />
                <span>+44</span>
              </div>
              <input
                type="tel"
                className="lp-input lp-phone-input"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="7123 456789"
                autoComplete="tel-national"
              />
            </div>
          </div>

          <div className="lp-field">
            <label>Email Address</label>
            <input
              type="email"
              className={`lp-input ${emailError ? 'lp-input-error' : ''}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              placeholder="your@email.com"
              autoComplete="email"
            />
            {emailError && <p className="lp-field-error">{emailError}</p>}
          </div>

          <div className="lp-field">
            <label>Service Details</label>
            <textarea
              className="lp-textarea"
              value={serviceDetails}
              onChange={(e) => setServiceDetails(e.target.value)}
              placeholder="What can we manage for you? (e.g. end of tenancy clean, electrical repair...)"
              rows={4}
            />
          </div>

          <div className="lp-field">
            <label>Preferred Contact</label>
            <div className="lp-contact-options">
              <button
                type="button"
                className={`lp-contact-btn ${preferredContact === PREFERRED_CONTACT.CALL ? 'lp-contact-active' : ''}`}
                onClick={() => setPreferredContact(PREFERRED_CONTACT.CALL)}
              >
                <Phone size={18} className="lp-contact-icon" />
                Call Me
              </button>
              <button
                type="button"
                className={`lp-contact-btn ${preferredContact === PREFERRED_CONTACT.WHATSAPP ? 'lp-contact-active' : ''}`}
                onClick={() => setPreferredContact(PREFERRED_CONTACT.WHATSAPP)}
              >
                <MessageCircle size={18} className="lp-contact-icon" />
                WhatsApp
              </button>
              <button
                type="button"
                className={`lp-contact-btn ${preferredContact === PREFERRED_CONTACT.EMAIL ? 'lp-contact-active' : ''}`}
                onClick={() => setPreferredContact(PREFERRED_CONTACT.EMAIL)}
              >
                <Mail size={18} className="lp-contact-icon" />
                Email
              </button>
            </div>
          </div>
        </form>

        {/* Testimonials */}
        <section className="lp-testimonials">
          <div className="lp-testimonials-header">
            <h3 className="lp-testimonials-title">Real Results</h3>
            <div className="lp-testimonials-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="lp-testimonials-scroll">
            <div className="lp-testimonial-card">
              <div className="lp-testimonial-stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="lp-testimonial-text">
                "Master took over everything. I didn't have to chase anyone. The pro was great, but the management was the real winner."
              </p>
              <div className="lp-testimonial-author">
                <div className="lp-testimonial-avatar">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtdaj6s7X3-1Jr51wq2XKRj8qv3QpGphGObe-ObAkVuZUvA1dnEPIkij81dyLDvzFM0Eau-PGC_HGbM9mrwcWh6yhmcVUbiDz5ht7GTyvMXeCRq59n1IXF1YxjHCO-gRd4GWlAd_xXcfVwXkTlb7JVcdWVs5zgsAKdwg1FeFFHpErRMxvH0_izu1fI5o2pHTX8PVUfQ0CmY_SmsgneWUbr9xY9aYrukAGv-MmB_XIg3q_tIiu-3BqTo3aR_JIRA219k2JHDfyzHow"
                    alt="James P."
                  />
                </div>
                <span className="lp-testimonial-name">
                  James P. • <span className="lp-testimonial-location">London</span>
                </span>
              </div>
            </div>
            <div className="lp-testimonial-card">
              <div className="lp-testimonial-stars">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="lp-testimonial-text">
                "The best managed service I've used. Professional, transparent and Master guarantees the quality themselves."
              </p>
              <div className="lp-testimonial-author">
                <div className="lp-testimonial-avatar">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZgiXZAq3xlibzgkLym3ySEnJ5lH9eIXpiqOhDMqxKRW1FAtI7XiBQLOuhS9zp51JIK6rC39bzN9BZhjNC9ic3CohRSKxgvpBcgkS0PFbnB4NX90u5O5RHs13dom_zeXKL7QhR62dxGWVpZgpBD1LBB_nGshnH-segwati0sIYolRy7dKbiQX3UMwr2Ho7cXWwQf-oD5dzwVN9fFxvCJAZvi_4CsKJnhkgPMUsQFtNBDghxuSDytjV5uu7Ar2rk2A_ZamDg6HLY-c"
                    alt="Sarah L."
                  />
                </div>
                <span className="lp-testimonial-name">
                  Sarah L. • <span className="lp-testimonial-location">Manchester</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <div className="lp-trust">
          <div className="lp-trust-card">
            <Shield className="lp-trust-icon" />
            <div>
              <div className="lp-trust-title">£5M Insurance</div>
              <div className="lp-trust-sub">Fully Covered by Master</div>
            </div>
          </div>
          <div className="lp-trust-card">
            <Shield className="lp-trust-icon" />
            <div>
              <div className="lp-trust-title">Full Guarantee</div>
              <div className="lp-trust-sub">Master Certified</div>
            </div>
          </div>
        </div>

        {/* CTA bar */}
        <div className="lp-cta-bar">
          <div className="lp-cta-status">
            <div className="lp-cta-status-dot" />
            <span className="lp-cta-status-text">Project managers active near you</span>
          </div>
          <button
            type="submit"
            form="lp-form"
            className="lp-cta-btn"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Sending…' : 'Get an instant quote →'}
          </button>
          <p className="lp-cta-footer">
            Directly managed by Master. Insured & Guaranteed.
          </p>
        </div>
      </div>
    </div>
  );
}
