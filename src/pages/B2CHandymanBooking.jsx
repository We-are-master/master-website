import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, HelpCircle, Minus, Plus, Star, TrendingDown, Info, Sparkles, ArrowRight, BadgeCheck, ShieldCheck, X } from 'lucide-react';
import { SEO } from '../components/SEO';
import '../styles/booking-premium.css';

// Pricing from master_trades CSV
const HOURLY_RATE = 60;       // Handyman £60/hr
const HALF_DAY_PRICE = 145;   // Handyman 3–4h fixed
const FULL_DAY_PRICE = 190;   // Handyman day rate
const HALF_DAY_HOURS = 4;
const FULL_DAY_HOURS = 8;

const PLUMBING_HOURLY = 72;   // £72/hr; Half Day £150, Day £275
const PLUMBING_SERVICES = [
  { id: 'tap-leak', label: 'Tap / leak repair', description: 'Fix dripping taps, small leaks', price: 85 },
  { id: 'boiler-service', label: 'Boiler service', description: 'Annual service & safety check', price: 120 },
  { id: 'blocked-drain', label: 'Blocked drain', description: 'Unblock sink, toilet or drain', price: 95 },
  { id: 'toilet', label: 'Toilet repair / install', description: 'Fix or fit toilet', price: 110 },
  { id: 'radiator', label: 'Radiator install / repair', description: 'Fit or fix radiators', price: 130 },
  { id: 'emergency', label: 'Emergency call-out', description: 'Urgent plumbing (1h minimum)', price: 150 },
  { id: 'hourly', label: 'Hourly rate', description: 'Other jobs • £72/hr', price: null, hourly: true }
];

const ELECTRICIAN_HOURLY = 72; // £72/hr; Half Day £150, Day £275
const ELECTRICIAN_SERVICES = [
  { id: 'lighting', label: 'Light fitting', description: 'Install or repair lights', price: 65 },
  { id: 'sockets', label: 'Sockets & switches', description: 'Add or replace sockets/switches', price: 55 },
  { id: 'fuse-board', label: 'Fuse board check', description: 'Inspection & small fixes', price: 95 },
  { id: 'outdoor', label: 'Outdoor / security lights', description: 'External lighting', price: 85 },
  { id: 'extraction', label: 'Extractor fan', description: 'Fit bathroom/kitchen fan', price: 75 },
  { id: 'eic', label: 'EICR (safety certificate)', description: 'Electrical installation condition', price: 150 },
  { id: 'hourly', label: 'Hourly rate', description: 'Other jobs • £72/hr', price: null, hourly: true }
];

const B2CHandymanBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const postcode = location.state?.postcode || '';
  const email = location.state?.email || '';
  const [trade, setTrade] = useState('Handyman');
  const [selectedPlan, setSelectedPlan] = useState('hourly');
  const [hours, setHours] = useState(4);
  const [totalPrice, setTotalPrice] = useState(HOURLY_RATE * 4);
  const [selectedPlumbingId, setSelectedPlumbingId] = useState(null);
  const [selectedElectricianId, setSelectedElectricianId] = useState(null);
  const [plumbingHours, setPlumbingHours] = useState(2);
  const [electricianHours, setElectricianHours] = useState(2);
  const [jobDescription, setJobDescription] = useState('');
  const [jobDescriptionError, setJobDescriptionError] = useState('');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // When switching trade, reset selection and price
  useEffect(() => {
    if (trade === 'Handyman') {
      setSelectedPlan('hourly');
      setHours(4);
      setTotalPrice(HOURLY_RATE * 4);
    } else if (trade === 'Plumbing') {
      setSelectedPlumbingId(PLUMBING_SERVICES[0].id);
      setPlumbingHours(2);
      const s = PLUMBING_SERVICES[0];
      setTotalPrice(s.hourly ? PLUMBING_HOURLY * 2 : s.price);
    } else if (trade === 'Electrician') {
      setSelectedElectricianId(ELECTRICIAN_SERVICES[0].id);
      setElectricianHours(2);
      const s = ELECTRICIAN_SERVICES[0];
      setTotalPrice(s.hourly ? ELECTRICIAN_HOURLY * 2 : s.price);
    }
  }, [trade]);

  // Handyman price
  useEffect(() => {
    if (trade !== 'Handyman') return;
    if (selectedPlan === 'hourly') setTotalPrice(hours * HOURLY_RATE);
    else if (selectedPlan === 'halfday') setTotalPrice(HALF_DAY_PRICE);
    else setTotalPrice(FULL_DAY_PRICE);
  }, [trade, selectedPlan, hours]);

  // Plumbing price
  useEffect(() => {
    if (trade !== 'Plumbing') return;
    const s = PLUMBING_SERVICES.find((x) => x.id === selectedPlumbingId);
    if (!s) return;
    if (s.hourly) setTotalPrice(plumbingHours * PLUMBING_HOURLY);
    else setTotalPrice(s.price);
  }, [trade, selectedPlumbingId, plumbingHours]);

  // Electrician price
  useEffect(() => {
    if (trade !== 'Electrician') return;
    const s = ELECTRICIAN_SERVICES.find((x) => x.id === selectedElectricianId);
    if (!s) return;
    if (s.hourly) setTotalPrice(electricianHours * ELECTRICIAN_HOURLY);
    else setTotalPrice(s.price);
  }, [trade, selectedElectricianId, electricianHours]);

  const getServiceLabel = () => {
    if (trade === 'Handyman') {
      if (selectedPlan === 'hourly') return `Handyman • Hourly (${hours}h)`;
      if (selectedPlan === 'halfday') return 'Handyman • Half Day (4h)';
      return 'Handyman • Full Day (8h)';
    }
    if (trade === 'Plumbing') {
      const s = PLUMBING_SERVICES.find((x) => x.id === selectedPlumbingId);
      if (!s) return 'Plumbing';
      return s.hourly ? `Plumbing • Hourly (${plumbingHours}h)` : `Plumbing • ${s.label}`;
    }
    const s = ELECTRICIAN_SERVICES.find((x) => x.id === selectedElectricianId);
    if (!s) return 'Electrician';
    return s.hourly ? `Electrician • Hourly (${electricianHours}h)` : `Electrician • ${s.label}`;
  };

  const getServiceHours = () => {
    if (trade === 'Handyman') return selectedPlan === 'hourly' ? hours : selectedPlan === 'halfday' ? HALF_DAY_HOURS : FULL_DAY_HOURS;
    if (trade === 'Plumbing') {
      const s = PLUMBING_SERVICES.find((x) => x.id === selectedPlumbingId);
      return s?.hourly ? plumbingHours : 1;
    }
    const s = ELECTRICIAN_SERVICES.find((x) => x.id === selectedElectricianId);
    return s?.hourly ? electricianHours : 1;
  };

  const getCategory = () => {
    if (trade === 'Handyman') return 'handyman';
    if (trade === 'Plumbing') return 'plumbing';
    return 'electrician';
  };

  const handleContinue = () => {
    if (trade === 'Handyman') {
      if (!jobDescription.trim()) {
        setJobDescriptionError('Please describe what you need done');
        return;
      }
      setJobDescriptionError('');
    }
    navigate('/checkout', {
      state: {
        postcode,
        email,
        jobDescription: trade === 'Handyman' ? jobDescription.trim() : undefined,
        service: {
          id: trade.toLowerCase(),
          title: getServiceLabel(),
          trade,
          plan: trade === 'Handyman' ? selectedPlan : (trade === 'Plumbing' ? selectedPlumbingId : selectedElectricianId),
          hours: getServiceHours(),
          price: totalPrice,
          category: getCategory()
        }
      }
    });
  };

  return (
    <>
      <SEO
        title="Master Handyman - Configure Your Service"
        description="Book a handyman by the hour or choose a half-day or full-day session. Flexible pricing with AI-powered market analysis."
      />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="bkp bkp-dark">
        <header className="bkp-header">
          <div className="bkp-header-inner">
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0', justifyContent: 'space-between', width: '100%' }}>
              <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="bkp-btn-icon" style={{ color: 'var(--bkp-text)' }}>
                <ChevronLeft size={24} aria-hidden />
              </button>
              <h1 className="bkp-title-page" style={{ flex: 1, textAlign: 'center', margin: 0 }}>{trade === 'Handyman' ? 'Handyman Service' : trade === 'Plumbing' ? 'Plumbing' : 'Electrician'}</h1>
              <button type="button" onClick={() => setShowHelpModal(true)} aria-label="Help" className="bkp-btn-icon" style={{ color: 'var(--bkp-text)' }}>
                <HelpCircle size={24} aria-hidden />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 0 16px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="bkp-label">Duration & plan</span>
                <span className="bkp-label">Step 1 of 1</span>
              </div>
              <div className="bkp-progress-track">
                <div className="bkp-progress-fill" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </header>

        <main className="bkp-main">
          {/* Trust line — Uber vibe */}
          <section style={{ padding: '0 0 24px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              color: 'var(--bkp-text-secondary)',
              fontSize: 'var(--bkp-text-sm)',
              fontWeight: 600
            }}>
              <ShieldCheck size={16} color="var(--bkp-primary)" aria-hidden />
              <span>Vetted professionals</span>
              <span style={{ color: 'var(--bkp-border-subtle)' }}>•</span>
              <span>Same-day available</span>
              <span style={{ color: 'var(--bkp-border-subtle)' }}>•</span>
              <span>Fixed or hourly</span>
            </div>
          </section>

          {/* Trade selection */}
          <section style={{ padding: '0 0 8px' }}>
            <div style={{
              display: 'flex',
              height: '48px',
              minHeight: '48px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--bkp-radius-md)',
              background: 'var(--bkp-bg-surface)',
              padding: '4px',
              border: '1px solid var(--bkp-border-subtle)'
            }}>
              {['Handyman', 'Plumbing', 'Electrician'].map((t) => (
                <label
                  key={t}
                  style={{
                    flex: 1,
                    cursor: 'pointer',
                    display: 'flex',
                    height: '100%',
                    minHeight: '44px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    background: trade === t ? 'var(--bkp-primary)' : 'transparent',
                    color: trade === t ? 'white' : 'var(--bkp-text-secondary)',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="trade-selection"
                    value={t}
                    checked={trade === t}
                    onChange={() => setTrade(t)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Handyman: Duration & plan */}
          {trade === 'Handyman' && (
            <>
              <section style={{ padding: '32px 0 16px' }}>
                <h2 style={{ color: 'var(--bkp-text)', fontSize: '20px', fontWeight: 700, lineHeight: '1.25', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                  Choose your plan
                </h2>
                <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-sm)', margin: 0 }}>
                  Pay by the hour or lock in a half or full day — you're in control.
                </p>
              </section>
              <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Hourly Rate */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPlan('hourly')}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan('hourly')}
              className={selectedPlan === 'hourly' ? 'bkp-card bkp-card-selected' : 'bkp-card'}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minHeight: '120px'
              }}
            >
              <div style={{ flex: '2 2 0', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <p style={{ color: 'var(--bkp-text)', fontSize: '18px', fontWeight: 700, lineHeight: '1.25', margin: 0 }}>Hourly rate</p>
                    <span className="bkp-pill bkp-pill-highlight" style={{ padding: '4px 10px', fontSize: '11px' }}>Flexible</span>
                  </div>
                  <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-sm)', margin: 0 }}>£{HOURLY_RATE}/hr • Pay as you go</p>
                </div>
                <div style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'var(--bkp-bg-surface)',
                  width: 'fit-content',
                  borderRadius: 'var(--bkp-radius-full)',
                  padding: '6px 8px',
                  border: '1px solid var(--bkp-border-subtle)'
                }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setHours((h) => Math.max(1, h - 1)); }}
                    aria-label="Decrease hours"
                    style={{
                      display: 'flex',
                      width: '44px',
                      height: '44px',
                      minWidth: '44px',
                      minHeight: '44px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--bkp-radius-full)',
                      background: 'var(--bkp-bg-surface-hover)',
                      border: 'none',
                      color: 'var(--bkp-text)',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <Minus size={20} />
                  </button>
                  <span style={{ color: 'var(--bkp-text)', fontWeight: 700, fontSize: '18px', minWidth: '28px', textAlign: 'center' }}>{hours}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setHours((h) => h + 1); }}
                    aria-label="Increase hours"
                    style={{
                      display: 'flex',
                      width: '44px',
                      height: '44px',
                      minWidth: '44px',
                      minHeight: '44px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--bkp-radius-full)',
                      background: 'var(--bkp-primary)',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
              <div style={{
                width: '100%',
                maxWidth: '120px',
                aspectRatio: '1',
                borderRadius: 'var(--bkp-radius-md)',
                border: '1px solid var(--bkp-border-subtle)',
                background: 'var(--bkp-bg-surface)',
                flexShrink: 0
              }} aria-hidden />
            </div>

            {/* Half Day */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPlan('halfday')}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan('halfday')}
              className={selectedPlan === 'halfday' ? 'bkp-card bkp-card-selected' : 'bkp-card'}
              style={{ position: 'relative', display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', gap: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', minHeight: '120px' }}
            >
              <div style={{ position: 'absolute', top: '-10px', right: '16px', background: 'var(--bkp-primary)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--bkp-radius-full)', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: 'var(--bkp-shadow-primary)' }}>
                <Star size={12} fill="currentColor" strokeWidth={1.5} aria-hidden /> Best value
              </div>
              <div style={{ flex: '2 2 0', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ color: 'var(--bkp-text-tertiary)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>Save 15%</p>
                  <p style={{ color: 'var(--bkp-text)', fontSize: '18px', fontWeight: 700, lineHeight: '1.25', margin: 0 }}>Half day</p>
                  <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-sm)', margin: 0 }}>4 hours • £{HALF_DAY_PRICE} fixed</p>
                </div>
                <p style={{ color: 'var(--bkp-primary)', fontSize: 'var(--bkp-text-sm)', fontWeight: 600, marginTop: '8px', marginBottom: 0 }}>Recommended for mid-size jobs</p>
              </div>
              <div style={{ width: '100%', maxWidth: '120px', aspectRatio: '1', borderRadius: 'var(--bkp-radius-md)', border: '1px solid var(--bkp-border-subtle)', background: 'var(--bkp-bg-surface)', flexShrink: 0 }} aria-hidden />
            </div>

            {/* Full Day */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPlan('fullday')}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan('fullday')}
              className={selectedPlan === 'fullday' ? 'bkp-card bkp-card-selected' : 'bkp-card'}
              style={{ position: 'relative', display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', gap: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', minHeight: '120px' }}
            >
              <div style={{ position: 'absolute', top: '-10px', right: '16px', background: 'var(--bkp-primary)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--bkp-radius-full)', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: 'var(--bkp-shadow-primary)' }}>
                <TrendingDown size={12} aria-hidden /> Lowest hourly
              </div>
              <div style={{ flex: '2 2 0', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ color: 'var(--bkp-text-tertiary)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>Save 25%</p>
                  <p style={{ color: 'var(--bkp-text)', fontSize: '18px', fontWeight: 700, lineHeight: '1.25', margin: 0 }}>Full day</p>
                  <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-sm)', margin: 0 }}>8 hours • £{FULL_DAY_PRICE} fixed</p>
                </div>
                <p style={{ color: 'var(--bkp-primary)', fontSize: 'var(--bkp-text-sm)', fontWeight: 600, marginTop: '8px', marginBottom: 0 }}>Perfect for bigger projects</p>
              </div>
              <div style={{ width: '100%', maxWidth: '120px', aspectRatio: '1', borderRadius: 'var(--bkp-radius-md)', border: '1px solid var(--bkp-border-subtle)', background: 'var(--bkp-bg-surface)', flexShrink: 0 }} aria-hidden />
            </div>
              </section>

              {/* Job description — handyman only */}
              <section style={{ padding: '24px 0 0' }}>
                <label htmlFor="handyman-job-desc" style={{ display: 'block', marginBottom: '8px' }}>
                  <span className="bkp-label" style={{ color: 'var(--bkp-text)', fontWeight: 700 }}>What do you need done?</span>
                  <span style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-sm)', marginLeft: '6px' }}>(required)</span>
                </label>
                <textarea
                  id="handyman-job-desc"
                  value={jobDescription}
                  onChange={(e) => { setJobDescription(e.target.value); if (jobDescriptionError) setJobDescriptionError(''); }}
                  placeholder="e.g. Mount TV, assemble furniture, fix loose door, small repairs..."
                  rows={3}
                  maxLength={500}
                  required
                  aria-required="true"
                  aria-invalid={!!jobDescriptionError}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 'var(--bkp-radius-md)',
                    border: jobDescriptionError ? '2px solid #ef4444' : '1px solid var(--bkp-border-subtle)',
                    background: 'var(--bkp-bg-surface)',
                    color: 'var(--bkp-text)',
                    fontSize: 'var(--bkp-text-base)',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '80px',
                    boxSizing: 'border-box'
                  }}
                />
                {jobDescriptionError && <p style={{ color: '#ef4444', fontSize: 'var(--bkp-text-sm)', marginTop: '6px', marginBottom: 0 }}>{jobDescriptionError}</p>}
                <p style={{ color: 'var(--bkp-text-tertiary)', fontSize: 'var(--bkp-text-xs)', marginTop: '6px', marginBottom: 0 }}>{jobDescription.length}/500</p>
              </section>
            </>
          )}

          {/* Plumbing: services */}
          {trade === 'Plumbing' && (
            <>
              <section style={{ padding: '32px 0 16px' }}>
                <h2 style={{ color: 'var(--bkp-text)', fontSize: '20px', fontWeight: 700, lineHeight: '1.25', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                  Choose your service
                </h2>
                <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-sm)', margin: 0 }}>
                  Fixed price for common jobs or hourly for anything else.
                </p>
              </section>
              <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {PLUMBING_SERVICES.map((s) => {
                  const selected = selectedPlumbingId === s.id;
                  const isHourly = s.hourly;
                  return (
                    <div
                      key={s.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPlumbingId(s.id)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedPlumbingId(s.id)}
                      className={selected ? 'bkp-card bkp-card-selected' : 'bkp-card'}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s', minHeight: '56px' }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: 'var(--bkp-text)', fontSize: '16px', fontWeight: 700, margin: 0 }}>{s.label}</p>
                        <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-xs)', margin: '2px 0 0' }}>{s.description}</p>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        {isHourly ? (
                          <span style={{ color: 'var(--bkp-primary)', fontSize: '14px', fontWeight: 700 }}>£{PLUMBING_HOURLY}/hr</span>
                        ) : (
                          <span style={{ color: 'var(--bkp-text)', fontSize: '18px', fontWeight: 700 }}>£{s.price}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {selectedPlumbingId === 'hourly' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', padding: '12px 16px', background: 'var(--bkp-bg-surface)', borderRadius: 'var(--bkp-radius-md)', border: '1px solid var(--bkp-border-subtle)' }}>
                    <span style={{ color: 'var(--bkp-text)', fontSize: 'var(--bkp-text-sm)', fontWeight: 600 }}>Hours:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bkp-bg-deep)', padding: '4px 8px', borderRadius: 'var(--bkp-radius-full)' }}>
                      <button type="button" onClick={() => setPlumbingHours((h) => Math.max(1, h - 1))} aria-label="Decrease hours" style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--bkp-bg-surface-hover)', color: 'var(--bkp-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={18} /></button>
                      <span style={{ color: 'var(--bkp-text)', fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{plumbingHours}</span>
                      <button type="button" onClick={() => setPlumbingHours((h) => h + 1)} aria-label="Increase hours" style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--bkp-primary)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={18} /></button>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {/* Electrician: services */}
          {trade === 'Electrician' && (
            <>
              <section style={{ padding: '32px 0 16px' }}>
                <h2 style={{ color: 'var(--bkp-text)', fontSize: '20px', fontWeight: 700, lineHeight: '1.25', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                  Choose your service
                </h2>
                <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-sm)', margin: 0 }}>
                  Fixed price for common jobs or hourly for anything else.
                </p>
              </section>
              <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ELECTRICIAN_SERVICES.map((s) => {
                  const selected = selectedElectricianId === s.id;
                  const isHourly = s.hourly;
                  return (
                    <div
                      key={s.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedElectricianId(s.id)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedElectricianId(s.id)}
                      className={selected ? 'bkp-card bkp-card-selected' : 'bkp-card'}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s', minHeight: '56px' }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: 'var(--bkp-text)', fontSize: '16px', fontWeight: 700, margin: 0 }}>{s.label}</p>
                        <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-xs)', margin: '2px 0 0' }}>{s.description}</p>
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        {isHourly ? (
                          <span style={{ color: 'var(--bkp-primary)', fontSize: '14px', fontWeight: 700 }}>£{ELECTRICIAN_HOURLY}/hr</span>
                        ) : (
                          <span style={{ color: 'var(--bkp-text)', fontSize: '18px', fontWeight: 700 }}>£{s.price}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {selectedElectricianId === 'hourly' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', padding: '12px 16px', background: 'var(--bkp-bg-surface)', borderRadius: 'var(--bkp-radius-md)', border: '1px solid var(--bkp-border-subtle)' }}>
                    <span style={{ color: 'var(--bkp-text)', fontSize: 'var(--bkp-text-sm)', fontWeight: 600 }}>Hours:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bkp-bg-deep)', padding: '4px 8px', borderRadius: 'var(--bkp-radius-full)' }}>
                      <button type="button" onClick={() => setElectricianHours((h) => Math.max(1, h - 1))} aria-label="Decrease hours" style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--bkp-bg-surface-hover)', color: 'var(--bkp-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={18} /></button>
                      <span style={{ color: 'var(--bkp-text)', fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{electricianHours}</span>
                      <button type="button" onClick={() => setElectricianHours((h) => h + 1)} aria-label="Increase hours" style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--bkp-primary)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={18} /></button>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {/* Materials note */}
          <section style={{ padding: '32px 0 0' }}>
            <div className="bkp-card" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderColor: 'var(--bkp-border-subtle)', background: 'var(--bkp-bg-surface)' }}>
              <Info size={20} color="var(--bkp-text-tertiary)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
              <div>
                <p style={{ color: 'var(--bkp-text)', fontSize: 'var(--bkp-text-sm)', fontWeight: 700, margin: '0 0 4px' }}>Materials not included</p>
                <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-xs)', lineHeight: 1.45, margin: 0 }}>
                  Your pro will quote separately for any parts or materials needed. Labour is covered in this price.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="bkp-footer" style={{ background: 'var(--bkp-bg-deep)', borderTop: '1px solid var(--bkp-border-subtle)', padding: isMobile ? '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))' : '32px 24px 40px', width: '100%' }}>
          <div className="bkp-footer-inner">
            <div className="bkp-card bkp-ai-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(233, 74, 2, 0.35)' }}>
              <div className="bkp-ai-card-icon" style={{ width: 36, height: 36, flexShrink: 0, background: 'var(--bkp-primary-muted)', borderRadius: 'var(--bkp-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} color="var(--bkp-primary)" strokeWidth={2} aria-hidden />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="bkp-label" style={{ margin: 0, color: 'var(--bkp-text)' }}>AI market analysis</p>
                <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-xs)', lineHeight: 1.35, margin: '2px 0 0' }}>We've analysed the local market and secured the best price for you.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <span className="bkp-label">Estimated quote</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginTop: 4 }}>
                  <span className="bkp-price">£{totalPrice.toFixed(0)}</span>
                  <span style={{ color: 'var(--bkp-text-quaternary)', fontSize: 'var(--bkp-text-sm)', fontWeight: 700 }}>.00</span>
                </div>
              </div>
              <div className="bkp-pill bkp-pill-highlight" style={{ padding: '8px 14px' }}>
                <BadgeCheck size={14} strokeWidth={2.5} aria-hidden />
                <span>AI price match</span>
              </div>
            </div>
            <button type="button" onClick={handleContinue} className="bkp-btn-primary" aria-label="Continue to booking with your quote">
              Continue to booking
              <ArrowRight size={20} strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </footer>
      </div>

      {/* Help modal — wrapped in .bkp so card and button styles apply; header flex keeps X inside card */}
      {showHelpModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-modal-title"
          className="bkp bkp-dark"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="bkp-card"
            style={{
              position: 'relative',
              maxWidth: 400,
              width: '100%',
              padding: 24,
              background: 'var(--bkp-bg-deep)',
              border: '1px solid var(--bkp-border-strong)',
              boxShadow: 'var(--bkp-shadow-lg)',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 16,
                minWidth: 0
              }}
            >
              <h2 id="help-modal-title" style={{ margin: 0, fontSize: 'var(--bkp-text-lg)', fontWeight: 700, color: 'var(--bkp-text)', flex: '1 1 auto', minWidth: 0 }}>Need help?</h2>
              <button type="button" onClick={() => setShowHelpModal(false)} aria-label="Close" className="bkp-btn-icon" style={{ color: 'var(--bkp-text)', flexShrink: 0 }}>
                <X size={22} aria-hidden />
              </button>
            </div>
            <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-sm)', lineHeight: 1.5, margin: '0 0 12px' }}>
              Choose your trade (Handyman, Plumbing or Electrician), then pick a plan or service. The price updates automatically. Tap <strong>Continue to booking</strong> to select dates and pay.
            </p>
            <p style={{ color: 'var(--bkp-text-tertiary)', fontSize: 'var(--bkp-text-xs)', lineHeight: 1.5, margin: 0 }}>
              Materials and parts are quoted separately by your pro. Questions? Contact us via the chat or email on the website.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default B2CHandymanBooking;
