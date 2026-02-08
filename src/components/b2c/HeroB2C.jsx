import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Sparkles, MapPin, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fadeInUp, staggerContainer, defaultTransition, springTransition } from '../../hooks/useMotion';
import { saveHeroLead } from '../../lib/email';

const isValidUKPostcode = (value) => {
  const trimmed = (value || '').trim().toUpperCase().replace(/\s+/g, ' ');
  const match = trimmed.match(/[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}/i);
  return match && match[0].length >= 5;
};

const isValidEmail = (value) => {
  const trimmed = (value || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

const HeroB2C = () => {
  const navigate = useNavigate();
  const [heroStep, setHeroStep] = useState('service');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [confirmedPostcode, setConfirmedPostcode] = useState('');
  const [postcodeError, setPostcodeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const services = [
    'Painting',
    'Handyman',
    'Cleaning',
    'Plumber',
    'Electricians'
  ];

  useEffect(() => {
    const currentService = services[currentServiceIndex];
    let charIndex = 0;
    let typingTimeout;
    let deleteTimeout;

    setDisplayedText('');
    setIsTyping(true);

    const typeChar = () => {
      if (charIndex <= currentService.length) {
        setDisplayedText(currentService.slice(0, charIndex));
        charIndex++;
        typingTimeout = setTimeout(typeChar, 80);
      } else {
        setIsTyping(false);
        deleteTimeout = setTimeout(() => deleteChars(currentService.length), 2000);
      }
    };

    const deleteChars = (length) => {
      if (length >= 0) {
        setDisplayedText(currentService.slice(0, length));
        setIsTyping(true);
        deleteTimeout = setTimeout(() => deleteChars(length - 1), 40);
      } else {
        setCurrentServiceIndex((prev) => (prev + 1) % services.length);
      }
    };

    typingTimeout = setTimeout(typeChar, 500);
    return () => {
      clearTimeout(typingTimeout);
      clearTimeout(deleteTimeout);
    };
  }, [currentServiceIndex]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (heroStep === 'service') {
      if (searchTerm.trim()) {
        setSelectedService(searchTerm.trim());
        setSearchTerm('');
        setHeroStep('postcode');
        setPostcodeError('');
      }
      return;
    }
    if (heroStep === 'postcode') {
      const postcodeRaw = searchTerm.trim();
      if (!postcodeRaw) return;
      const postcodeMatch = postcodeRaw.toUpperCase().replace(/\s+/g, ' ').match(/[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}/i);
      const postcode = postcodeMatch ? postcodeMatch[0].trim() : postcodeRaw.toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim();
      if (!isValidUKPostcode(postcode)) {
        setPostcodeError('Please enter a valid UK postcode (e.g. SW1A 1AA, M1 1AA)');
        return;
      }
      setPostcodeError('');
      setConfirmedPostcode(postcode);
      setSearchTerm('');
      setHeroStep('email');
      setEmailError('');
      return;
    }
    // Step: email
    const emailRaw = searchTerm.trim();
    if (!emailRaw) return;
    if (!isValidEmail(emailRaw)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    const postcode = confirmedPostcode;
    const email = emailRaw;
    // Save for remarketing (fire-and-forget; don't block navigation)
    saveHeroLead({ email, service: selectedService, postcode }).catch(() => {});
    const searchLower = selectedService.toLowerCase().trim();
    const isCleaning = searchLower.includes('cleaning') || searchLower.includes('clean') ||
      searchLower.includes('deep clean') || searchLower.includes('end of tenancy') ||
      searchLower.includes('upholstery');
    const isHandyman = searchLower.includes('handyman') || searchLower.includes('odd job');
    const isPainter = searchLower.includes('painter') || searchLower.includes('painting') || searchLower.includes('paint');
    const isCarpenter = searchLower.includes('carpenter') || searchLower.includes('carpentry');
    const state = { jobDescription: selectedService, postcode, email };
    if (isCleaning) {
      navigate('/cleaning-booking', { state });
    } else if (isHandyman) {
      navigate('/handyman-booking', { state });
    } else if (isPainter) {
      navigate('/painting-booking', { state });
    } else if (isCarpenter) {
      navigate('/carpentry-booking', { state });
    } else {
      navigate('/booking', { state: { service: selectedService, postcode, email } });
    }
  };

  const trustItems = [
    'Fully vetted & insured professionals',
    'Clear scopes and pricing',
    'Dedicated operations team',
    'Built for homes, landlords & businesses'
  ];

  return (
    <motion.div
      className="hero-b2c"
      initial={false}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        overflow: 'hidden',
        background: '#020034',
        width: '100%',
        paddingTop: 'clamp(1rem, 4vw, 2rem)',
        paddingBottom: 'clamp(1rem, 2vw, 1.5rem)'
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(233, 74, 2, 0.12) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 20% 100%, rgba(32, 1, 175, 0.15) 0%, transparent 50%)',
        zIndex: 1
      }} />
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        zIndex: 1
      }} />

      {/* Decorative circles — continuous rotation with Framer Motion */}
      <motion.div
        style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)',
          zIndex: 2
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '0%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.05)',
          zIndex: 2
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />

      <div className="container hero-b2c-inner" style={{
        position: 'relative',
        zIndex: 3,
        padding: 'clamp(1rem, 3vw, 2rem) 0 clamp(1.25rem, 2.5vw, 2.5rem)',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <div className="hero-b2c-content" style={{ maxWidth: 'min(1120px, 94vw)', margin: '0 auto', textAlign: 'center', paddingLeft: 'clamp(0.5rem, 2vw, 1rem)', paddingRight: 'clamp(0.5rem, 2vw, 1rem)' }}>
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...springTransition, delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              color: 'rgba(255, 255, 255, 0.8)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: '500',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              letterSpacing: '0.01em'
            }}
          >
            <Sparkles size={12} style={{ opacity: 0.7 }} />
            <span>Trusted by 10,000+ homeowners across the UK</span>
          </motion.div>

          <motion.h1
            key={`hero-headline-${heroStep}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...defaultTransition, delay: heroStep === 'postcode' || heroStep === 'email' ? 0.1 : 0.35 }}
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.75rem)',
              fontWeight: '600',
              color: 'white',
              marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
              lineHeight: '1.1',
              letterSpacing: '-0.03em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}
          >
            {heroStep === 'postcode' ? (
              <>
                <span style={{ color: 'white', display: 'block', marginBottom: '0.25rem' }}>
                  Enter your postcode
                </span>
                <span style={{ color: '#E94A02', fontWeight: '600', display: 'inline-block' }}>
                  to see pros near you
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>.</span>
              </>
            ) : heroStep === 'email' ? (
              <>
                <span style={{ color: 'white', display: 'block', marginBottom: '0.25rem' }}>
                  Almost there —
                </span>
                <span style={{ color: '#E94A02', fontWeight: '600', display: 'inline-block' }}>
                  enter your email
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>.</span>
              </>
            ) : (
              <>
                <span style={{ color: 'white', display: 'block', marginBottom: '0.25rem' }}>
                  The right way to book local professionals.
                </span>
                <span style={{ color: '#E94A02', fontWeight: '600', display: 'inline-block' }}>
                  {services[currentServiceIndex]}
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>.</span>
              </>
            )}
          </motion.h1>

          <motion.p
            key={`hero-desc-${heroStep}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...defaultTransition, delay: heroStep === 'postcode' || heroStep === 'email' ? 0.2 : 0.5 }}
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.375rem)',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
              fontWeight: '400',
              lineHeight: '1.55',
              maxWidth: '42em',
              marginLeft: 'auto',
              marginRight: 'auto',
              letterSpacing: '-0.01em'
            }}
          >
            {heroStep === 'postcode'
              ? 'We\'ll show you available professionals and instant pricing for your area. Use your full UK postcode (e.g. SW1A 1AA, M1 1AA).'
              : heroStep === 'email'
                ? 'We\'ll send you your quote and next steps. No spam, just your booking details.'
                : 'Professional tradespeople at your doorstep. Book in minutes, get instant pricing, and enjoy peace of mind.'}
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...defaultTransition, delay: 0.65 }}
            onSubmit={handleSearch}
            style={{ marginBottom: '2rem' }}
          >
            <motion.div
              className="hero-search-container"
              style={{
                display: 'flex',
                flexDirection: 'row',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                padding: '0.5rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
                maxWidth: 'min(720px, 100%)',
                width: '100%',
                margin: '0 auto',
                gap: '0.5rem'
              }}
              transition={{ duration: 0.25 }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 1.25rem',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>
                {heroStep === 'service' && <Search size={20} />}
                {heroStep === 'postcode' && <MapPin size={20} />}
                {heroStep === 'email' && <Mail size={20} />}
              </div>
              <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                minWidth: 0,
                flexShrink: 1,
                overflow: 'hidden'
              }}>
                <input
                  type={heroStep === 'email' ? 'email' : 'text'}
                  inputMode={heroStep === 'email' ? 'email' : 'text'}
                  autoComplete={heroStep === 'email' ? 'email' : 'off'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={heroStep === 'postcode' ? 'e.g. SW1A 1AA, M1 1AA' : heroStep === 'email' ? 'your@email.com' : ''}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                    padding: '1.25rem 0.5rem',
                    color: 'white',
                    fontFamily: 'inherit',
                    background: 'transparent',
                    position: 'relative',
                    zIndex: 2,
                    minWidth: 0
                  }}
                />
                {heroStep === 'service' && !searchTerm && (
                  <div
                    className="hero-placeholder"
                    style={{
                      position: 'absolute',
                      left: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      pointerEvents: 'none',
                      zIndex: 1,
                      maxWidth: 'calc(100% - 1rem)',
                      minWidth: 0,
                      overflow: 'hidden'
                    }}
                  >
                    <span className="hero-placeholder-try" style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 'clamp(1rem, 4vw, 1.125rem)', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>Try "</span>
                    <span className="hero-placeholder-service" style={{ color: '#E94A02', fontSize: 'clamp(1rem, 4vw, 1.125rem)', fontFamily: 'inherit', fontWeight: '500', whiteSpace: 'nowrap' }}>{displayedText}</span>
                    <span style={{
                      width: '2px',
                      height: 'clamp(1rem, 4vw, 1.25rem)',
                      backgroundColor: '#E94A02',
                      animation: 'blink 1s infinite',
                      opacity: isTyping ? 1 : 0,
                      flexShrink: 0
                    }} />
                    <span className="hero-placeholder-end" style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 'clamp(1rem, 4vw, 1.125rem)', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>"</span>
                  </div>
                )}
                <style>{`
                  @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
                  .hero-search-container:focus-within { box-shadow: 0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(233, 74, 2, 0.3); background-color: rgba(255, 255, 255, 0.12); }
                  @media (min-width: 769px) {
                    .hero-b2c { min-height: 88vh !important; }
                  }
                  @media (max-width: 768px) {
                    .hero-b2c { align-items: flex-start !important; padding-top: 1.25rem !important; padding-bottom: 2rem !important; min-height: auto !important; }
                    .hero-b2c-inner { padding-top: 0.5rem !important; padding-bottom: 1.5rem !important; }
                    .hero-b2c-content { max-width: 100% !important; padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
                    .hero-scroll-indicator { display: none !important; }
                  }
                  @media (max-width: 480px) {
                    .hero-b2c-content { padding-left: 1rem !important; padding-right: 1rem !important; }
                  }
                  @media (max-width: 640px) {
                    .hero-search-container { padding: 0.75rem !important; gap: 0.5rem !important; }
                    .hero-search-container > div:first-child { padding: 0 0.5rem !important; flex-shrink: 0; }
                    .hero-search-container > div:first-child svg { width: 18px !important; height: 18px !important; }
                    .hero-search-container input { padding: 0.875rem 0.25rem !important; font-size: 0.9375rem !important; }
                    .hero-search-container button { padding: 0.875rem 1.25rem !important; font-size: 0.875rem !important; gap: 0.375rem !important; }
                    .hero-search-container button svg { width: 16px !important; height: 16px !important; }
                    .hero-placeholder { max-width: calc(100% - 88px) !important; }
                    .hero-placeholder-try, .hero-placeholder-service, .hero-placeholder-end { font-size: 0.9375rem !important; }
                  }
                  @media (max-width: 480px) {
                    .hero-search-container { padding: 0.5rem !important; gap: 0.375rem !important; }
                    .hero-search-container button span { display: none; }
                    .hero-search-container button { padding: 0.875rem 0.75rem !important; min-width: auto; }
                    .hero-placeholder { left: 0.25rem !important; max-width: calc(100% - 64px) !important; gap: 0.25rem !important; }
                    .hero-placeholder-try, .hero-placeholder-service, .hero-placeholder-end { font-size: 0.8125rem !important; }
                  }
                `}</style>
              </div>
              <motion.button
                type="submit"
                whileHover={{ backgroundColor: '#d13d00', scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                style={{
                  backgroundColor: '#E94A02',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: 'clamp(1rem, 3vw, 1.25rem) clamp(1.5rem, 4vw, 2.5rem)',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  letterSpacing: '-0.01em'
                }}
              >
                <span>{heroStep === 'email' ? 'Get instant price' : 'Continue'}</span>
                <ArrowRight size={18} />
              </motion.button>
            </motion.div>
            {(postcodeError || emailError) && (
              <p style={{ color: '#f87171', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: 0 }}>{postcodeError || emailError}</p>
            )}
          </motion.form>

          {(heroStep === 'postcode' || heroStep === 'email') && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginTop: '-1rem',
              marginBottom: '1rem'
            }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                Service: <strong style={{ color: '#E94A02' }}>{selectedService}</strong>
              </span>
              <button
                type="button"
                onClick={() => { setHeroStep('service'); setSearchTerm(''); setSelectedService(''); setPostcodeError(''); setEmailError(''); setConfirmedPostcode(''); }}
                style={{
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.875rem', textDecoration: 'underline', cursor: 'pointer', padding: 0
                }}
              >
                Change service
              </button>
              {heroStep === 'email' && (
                <>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    Postcode: <strong style={{ color: '#E94A02' }}>{confirmedPostcode}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => { setHeroStep('postcode'); setSearchTerm(confirmedPostcode); setEmailError(''); }}
                    style={{
                      background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.875rem', textDecoration: 'underline', cursor: 'pointer', padding: 0
                    }}
                  >
                    Change postcode
                  </button>
                </>
              )}
            </div>
          )}

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginTop: '2rem'
            }}
          >
            {trustItems.map((text, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                transition={{ ...defaultTransition }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.8125rem',
                  fontWeight: '400',
                  letterSpacing: '0.01em'
                }}
              >
                <span style={{ color: '#E94A02', fontSize: '0.875rem', fontWeight: '600' }}>✓</span>
                <span>{text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div
        className="hero-scroll-indicator"
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3
        }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
      >
        <div style={{
          width: '24px',
          height: '40px',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ width: '4px', height: '8px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HeroB2C;
