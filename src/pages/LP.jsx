import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  CheckCircle,
  Phone,
  MessageCircle,
  Mail,
  Star,
  Shield,
  Home,
  Sparkles,
  Wrench,
  Hammer,
  HardHat,
  Droplets,
} from 'lucide-react';
import { saveHeroLead } from '../lib/email';
import logo from '../assets/logo.png';
import './LP.css';

const UK_FLAG_SRC = 'https://flagcdn.com/w40/gb.png';

const TESTIMONIALS = [
  { name: 'James P.', location: 'London', text: 'Master took over everything. I didn\'t have to chase anyone. The pro was great, but the management was the real winner.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtdaj6s7X3-1Jr51wq2XKRj8qv3QpGphGObe-ObAkVuZUvA1dnEPIkij81dyLDvzFM0Eau-PGC_HGbM9mrwcWh6yhmcVUbiDz5ht7GTyvMXeCRq59n1IXF1YxjHCO-gRd4GWlAd_xXcfVwXkTlb7JVcdWVs5zgsAKdwg1FeFFHpErRMxvH0_izu1fI5o2pHTX8PVUfQ0CmY_SmsgneWUbr9xY9aYrukAGv-MmB_XIg3q_tIiu-3BqTo3aR_JIRA219k2JHDfyzHow' },
  { name: 'Sarah L.', location: 'London', text: 'The best managed service I\'ve used. Professional, transparent and Master guarantees the quality themselves.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZgiXZAq3xlibzgkLym3ySEnJ5lH9eIXpiqOhDMqxKRW1FAtI7XiBQLOuhS9zp51JIK6rC39bzN9BZhjNC9ic3CohRSKxgvpBcgkS0PFbnB4NX90u5O5RHs13dom_zeXKL7QhR62dxGWVpZgpBD1LBB_nGshnH-segwati0sIYolRy7dKbiQX3UMwr2Ho7cXWwQf-oD5dzwVN9fFxvCJAZvi_4CsKJnhkgPMUsQFtNBDghxuSDytjV5uu7Ar2rk2A_ZamDg6HLY-c' },
  { name: 'David M.', location: 'London', text: 'End of tenancy clean was flawless. One point of contact, clear quote, and the team left the flat spotless. Would use again.', avatar: 'https://ui-avatars.com/api/?name=David+M&background=eb4a00&color=fff&size=80' },
  { name: 'Emma R.', location: 'London', text: 'Finally a service that does what it says. Booked a painter through Master — he turned up on time and the finish was excellent.', avatar: 'https://ui-avatars.com/api/?name=Emma+R&background=eb4a00&color=fff&size=80' },
  { name: 'Michael T.', location: 'London', text: 'I used to waste hours finding trades. With Master I sent one message and they sorted everything. Game changer.', avatar: 'https://ui-avatars.com/api/?name=Michael+T&background=eb4a00&color=fff&size=80' },
  { name: 'Sophie K.', location: 'London', text: 'Professional cleaning and they managed the whole thing. No chasing, no stress. Highly recommend.', avatar: 'https://ui-avatars.com/api/?name=Sophie+K&background=eb4a00&color=fff&size=80' },
  { name: 'Chris W.', location: 'London', text: 'Had an electrical job that needed doing. Master matched me with a certified pro and guaranteed the work. Brilliant.', avatar: 'https://ui-avatars.com/api/?name=Chris+W&background=eb4a00&color=fff&size=80' },
  { name: 'Rachel H.', location: 'London', text: 'The guarantee gives real peace of mind. Something went wrong and Master sorted it the same day. Top service.', avatar: 'https://ui-avatars.com/api/?name=Rachel+H&background=eb4a00&color=fff&size=80' },
  { name: 'Tom B.', location: 'London', text: 'Booked a handyman for odd jobs. One quote, one point of contact, job done properly. Will use for all future work.', avatar: 'https://ui-avatars.com/api/?name=Tom+B&background=eb4a00&color=fff&size=80' },
  { name: 'Laura F.', location: 'London', text: 'Deep clean before a party — they managed the booking and the team was fantastic. House looked brand new.', avatar: 'https://ui-avatars.com/api/?name=Laura+F&background=eb4a00&color=fff&size=80' },
  { name: 'James N.', location: 'London', text: 'Transparent pricing and no hidden fees. Master handled the plumber visit and I didn\'t have to do a thing.', avatar: 'https://ui-avatars.com/api/?name=James+N&background=eb4a00&color=fff&size=80' },
  { name: 'Olivia S.', location: 'London', text: 'Best decision was using Master for our painting. Quality work, insured, and they coordinate everything.', avatar: 'https://ui-avatars.com/api/?name=Olivia+S&background=eb4a00&color=fff&size=80' },
  { name: 'Daniel P.', location: 'London', text: 'From quote to completion they were on it. No chasing contractors — Master does that for you. 10/10.', avatar: 'https://ui-avatars.com/api/?name=Daniel+P&background=eb4a00&color=fff&size=80' },
  { name: 'Hannah C.', location: 'London', text: 'Used them for a full house clean. Professional, reliable, and the guarantee means you\'re covered. Love it.', avatar: 'https://ui-avatars.com/api/?name=Hannah+C&background=eb4a00&color=fff&size=80' },
  { name: 'Andrew G.', location: 'London', text: 'I was sceptical but they delivered. One message, one quote, job done. This is how it should work.', avatar: 'https://ui-avatars.com/api/?name=Andrew+G&background=eb4a00&color=fff&size=80' },
  { name: 'Jessica L.', location: 'London', text: 'Master managed our refurb. Cleaning, painting, small fixes — all through one team. So much easier.', avatar: 'https://ui-avatars.com/api/?name=Jessica+L&background=eb4a00&color=fff&size=80' },
  { name: 'Mark D.', location: 'London', text: 'No more Googling and calling random trades. Master finds the right person and stands behind the work.', avatar: 'https://ui-avatars.com/api/?name=Mark+D&background=eb4a00&color=fff&size=80' },
  { name: 'Charlotte A.', location: 'London', text: 'Quick, clear communication and the job was done to a high standard. Will definitely book again.', avatar: 'https://ui-avatars.com/api/?name=Charlotte+A&background=eb4a00&color=fff&size=80' },
];

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

const SERVICE_TYPES = [
  { id: 'cleaning', label: 'Cleaning', icon: Sparkles },
  { id: 'handyman', label: 'Handyman', icon: Wrench },
  { id: 'carpenter', label: 'Carpenter', icon: Hammer },
  { id: 'builder', label: 'Builder', icon: HardHat },
  { id: 'plumber', label: 'Plumber', icon: Droplets },
];

export default function LP() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('');
  const [postcode, setPostcode] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [serviceType, setServiceType] = useState('cleaning');
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
    const serviceText = serviceDetails.trim()
      ? `${serviceType}: ${serviceDetails.trim()}`
      : serviceType;
    const result = await saveHeroLead({
      email: rawEmail.toLowerCase(),
      postcode: normalizedPostcode,
      service: serviceText,
      service_type: serviceType,
      source: 'lp',
      name: name.trim() || undefined,
      phone: phoneValue,
      preferred_contact: preferredContact,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success('Thanks! We’ll be in touch soon.');
      const params = new URLSearchParams();
      params.set('postcode', normalizedPostcode);
      if (serviceDetails.trim()) params.set('service', serviceDetails.trim());
      params.set('serviceType', serviceType);
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
        {/* Header: logo + Home */}
        <header className="lp-header">
          <Link to="/" className="lp-logo-link" aria-label="Master - Go to home">
            <img src={logo} alt="Master" className="lp-logo" />
          </Link>
          <Link to="/" className="lp-home-btn">
            <Home size={18} />
            <span>Home</span>
          </Link>
        </header>

        <div className="lp-main">
        <div className="lp-hero">
          <div className="lp-badge">
            <CheckCircle size={10} />
            <span className="lp-badge-text">Free quote in 30 seconds</span>
          </div>
          <h1 className="lp-title">
            Need a trusted pro?{' '}
            <span className="lp-title-accent">Get a free quote in 30 seconds.</span>
          </h1>
          <p className="lp-subtitle">
            Cleaning • Plumbing • Painting • Handyman — We've got London covered.
          </p>
          <p className="lp-disclaimer">
            Trusted pros. Insured & guaranteed by Master.
          </p>
        </div>

        <form id="lp-form" className="lp-form" onSubmit={handleSubmit} noValidate>
          <div className="lp-field">
            <label>Name</label>
            <input
              type="text"
              className="lp-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

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
            <label>Service Type</label>
            <div className="lp-contact-options lp-service-type-options">
              {SERVICE_TYPES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`lp-contact-btn ${serviceType === id ? 'lp-contact-active' : ''}`}
                  onClick={() => setServiceType(id)}
                >
                  <Icon size={18} className="lp-contact-icon" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="lp-field">
            <label>Service Details</label>
            <textarea
              className="lp-textarea"
              value={serviceDetails}
              onChange={(e) => setServiceDetails(e.target.value)}
              placeholder="e.g. end of tenancy clean, tap repair, interior painting, odd jobs..."
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

        {/* Testimonials - Real Results */}
        <section className="lp-testimonials">
          <div className="lp-testimonials-header">
            <h3 className="lp-testimonials-title">Real Results</h3>
            <p className="lp-testimonials-sub">Trusted by customers in London</p>
          </div>
          <div className="lp-testimonials-scroll">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="lp-testimonial-card">
                <div className="lp-testimonial-stars">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Star key={j} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="lp-testimonial-text">"{t.text}"</p>
                <div className="lp-testimonial-author">
                  <div className="lp-testimonial-avatar">
                    <img src={t.avatar} alt={t.name} />
                  </div>
                  <span className="lp-testimonial-name">
                    {t.name} • <span className="lp-testimonial-location">{t.location}</span>
                  </span>
                </div>
              </div>
            ))}
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
        </div>

        {/* CTA bar */}
        <div className="lp-cta-bar">
          <div className="lp-cta-status">
            <div className="lp-cta-status-dot" />
            <span className="lp-cta-status-text">Trusted pros available in your area</span>
          </div>
          <button
            type="submit"
            form="lp-form"
            className="lp-cta-btn"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Sending…' : 'Get my free quote →'}
          </button>
          <p className="lp-cta-footer">
            Free quote. No obligation. Insured & guaranteed by Master.
          </p>
        </div>
      </div>
    </div>
  );
}
