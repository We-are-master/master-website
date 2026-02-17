import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  Building2,
  Home,
  Bed,
  Bath,
  Minus,
  Plus,
  Flame,
  Refrigerator,
  Snowflake,
  Armchair,
  LayoutGrid,
  ShieldCheck,
  Shield,
} from 'lucide-react';
import BookingQuoteUnlock from '../components/BookingQuoteUnlock';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';
import '../styles/booking-premium.css';

const isValidUKPostcode = (value) => {
  const trimmed = (value || '').trim().toUpperCase().replace(/\s+/g, ' ');
  const match = trimmed.match(/[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}/i);
  return match && match[0].length >= 5;
};
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());

const ADDON_ICONS = {
  oven_gen: Flame,
  kitchen: Refrigerator,
  ac_unit: Snowflake,
  chair: Armchair,
  carpet: LayoutGrid,
};

const B2CCleaningBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedService, setSelectedService] = useState('end-of-tenancy');
  const [propertyType, setPropertyType] = useState('flat');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [furnished, setFurnished] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState(new Set(['oven']));
  const [estimatedPrice, setEstimatedPrice] = useState(216); // EoT 1 bed base + 1 extra bed
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  const [postcode, setPostcode] = useState(location.state?.postcode || '');
  const [email, setEmail] = useState(location.state?.email || '');
  const [postcodeError, setPostcodeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const leadNotifiedRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const services = [
    { id: 'end-of-tenancy', label: 'End of Tenancy', badge: 'BEST FOR MOVING OUT' },
    { id: 'deep-clean', label: 'Deep Clean' },
    { id: 'after-builders', label: 'After Builders' }
  ];

  const addons = [
    { id: 'oven', icon: 'oven_gen', label: 'Oven Clean', price: 15, group: 'kitchen' },
    { id: 'fridge', icon: 'kitchen', label: 'Inside Fridge', price: 12, group: 'kitchen' },
    { id: 'freezer', icon: 'ac_unit', label: 'Inside Freezer', price: 12, group: 'kitchen' },
    { id: 'steam_sofa', icon: 'chair', label: 'Steam - Sofa', price: 25, group: 'steam' },
    { id: 'steam_carpet', icon: 'carpet', label: 'Steam - Carpet', price: 25, group: 'steam' }
  ];
  const kitchenAddons = addons.filter(a => a.group === 'kitchen');
  const steamAddons = addons.filter(a => a.group === 'steam');

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(addonId)) {
        newSet.delete(addonId);
      } else {
        newSet.add(addonId);
      }
      return newSet;
    });
  };

  // Pricing from master_cleaning CSV: 1-bed base, extra bedroom/bathroom, steam +£25, furnished +£20
  const calculatePrice = () => {
    const bases = { 'end-of-tenancy': 191, 'deep-clean': 166, 'after-builders': 195 };
    const extraBedPer = { 'end-of-tenancy': 25, 'deep-clean': 26, 'after-builders': 27 };
    const extraBathPer = 25;
    const steamCleanAdd = 25;
    const furnishedAdd = 20;

    let price = bases[selectedService] ?? 191;
    const effectiveBedrooms = Math.max(1, bedrooms);
    const effectiveBathrooms = Math.max(1, bathrooms);
    price += (effectiveBedrooms - 1) * (extraBedPer[selectedService] ?? 25);
    price += (effectiveBathrooms - 1) * extraBathPer;
    if (furnished) price += furnishedAdd;
    if (selectedAddons.has('steam_carpet')) price += steamCleanAdd;

    selectedAddons.forEach(addonId => {
      if (addonId === 'steam_carpet') return; // already added above
      const addon = addons.find(a => a.id === addonId);
      if (addon) price += addon.price;
    });

    const rounded = Math.round(price);
    setEstimatedPrice(rounded);
    return rounded;
  };

  useEffect(() => {
    calculatePrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bedrooms, bathrooms, selectedAddons, selectedService, propertyType, furnished]);

  const getServiceLabel = () => services.find(s => s.id === selectedService)?.label || 'Cleaning';

  const normalizedPostcode = (postcode || '').trim().toUpperCase().replace(/\s+/g, ' ');
  const canShowPrice = normalizedPostcode && isValidUKPostcode(normalizedPostcode) && email && isValidEmail(email.trim());
  const handlePostcodeBlur = () => {
    if (postcode.trim() && !isValidUKPostcode(normalizedPostcode)) setPostcodeError('Please enter a valid UK postcode (e.g. SW1A 1AA)');
    else setPostcodeError('');
  };
  const handleEmailBlur = () => {
    if (email && !isValidEmail(email)) setEmailError('Please enter a valid email');
    else setEmailError('');
  };

  const handleContinue = () => {
    navigate('/checkout', {
      state: {
        postcode: normalizedPostcode,
        email: email.trim().toLowerCase(),
        service: {
          id: 'cleaning',
          title: `Cleaning · ${getServiceLabel()}`,
          category: 'cleaning',
          type: selectedService,
          propertyType,
          bedrooms,
          bathrooms,
          furnished,
          addons: Array.from(selectedAddons),
          price: estimatedPrice
        }
      }
    });
  };

  // Notify team when user fills postcode + email (once per session)
  useEffect(() => {
    if (!canShowPrice || leadNotifiedRef.current) return;
    leadNotifiedRef.current = true;
    const serviceLabel = `Cleaning · ${getServiceLabel()}`;
    supabase.functions.invoke('notify-booking-lead', {
      body: { email: email.trim().toLowerCase(), postcode: normalizedPostcode, service: serviceLabel },
    }).catch(() => { /* fire-and-forget */ });
  }, [canShowPrice, email, normalizedPostcode]);

  return (
    <>
      <SEO
        title="Cleaning — Master"
        description="Professional cleaning: end of tenancy, deep clean, after builders. Transparent pricing, premium equipment."
      />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="bkp bkp-dark">
        <header className="bkp-header">
          <div className="bkp-header-inner">
            <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0', justifyContent: 'space-between', width: '100%' }}>
              <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="bkp-btn-icon" style={{ color: 'var(--bkp-text)' }}>
                <ChevronLeft size={24} aria-hidden />
              </button>
              <h1 className="bkp-title-page" style={{ flex: 1, textAlign: 'center', margin: 0 }}>Cleaning</h1>
              <div style={{ width: 44, height: 44 }} aria-hidden />
            </div>
            {/* Service type — segment control */}
            <div style={{ display: 'flex', gap: 8, padding: '4px', background: 'var(--bkp-bg-surface)', borderRadius: 'var(--bkp-radius-md)', border: '1px solid var(--bkp-border-subtle)', marginBottom: 16 }}>
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedService(service.id)}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    padding: '10px 12px',
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedService === service.id ? 'var(--bkp-primary)' : 'transparent',
                    color: selectedService === service.id ? '#fff' : 'var(--bkp-text-secondary)',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                >
                  {service.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 0 16px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="bkp-label">Configuration</span>
                <span className="bkp-label">Step 1 of 2</span>
              </div>
              <div className="bkp-progress-track">
                <div className="bkp-progress-fill" style={{ width: '50%' }} />
              </div>
            </div>
          </div>
        </header>

        <main className="bkp-main">
          <section style={{ padding: '0 0 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center', color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-sm)', fontWeight: 600 }}>
              <ShieldCheck size={18} color="var(--bkp-primary)" aria-hidden />
              <span>Premium equipment</span>
              <span style={{ color: 'var(--bkp-border-subtle)' }}>·</span>
              <span>48h guarantee</span>
              <span style={{ color: 'var(--bkp-border-subtle)' }}>·</span>
              <span>Transparent price</span>
            </div>
          </section>

          <section className="bkp-section" style={{ padding: '0' }} aria-labelledby="property-heading">
            <h2 id="property-heading" className="bkp-label" style={{ marginBottom: 12 }}>Property type</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                type="button"
                onClick={() => setPropertyType('flat')}
                className={`bkp-card ${propertyType === 'flat' ? 'bkp-card-selected' : ''}`}
                style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: isMobile ? 20 : 24, cursor: 'pointer', border: 'none', outline: 'none', font: 'inherit', color: 'inherit', minHeight: 100 }}
              >
                <Building2 size={40} color={propertyType === 'flat' ? 'var(--bkp-primary)' : 'var(--bkp-text-tertiary)'} aria-hidden />
                <span className="bkp-card-title" style={{ fontSize: 'var(--bkp-text-base)' }}>Flat</span>
              </button>
              <button
                type="button"
                onClick={() => setPropertyType('house')}
                className={`bkp-card ${propertyType === 'house' ? 'bkp-card-selected' : ''}`}
                style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: isMobile ? 20 : 24, cursor: 'pointer', border: 'none', outline: 'none', font: 'inherit', color: 'inherit', minHeight: 100 }}
              >
                <Home size={40} color={propertyType === 'house' ? 'var(--bkp-primary)' : 'var(--bkp-text-tertiary)'} aria-hidden />
                <span className="bkp-card-title" style={{ fontSize: 'var(--bkp-text-base)' }}>House</span>
              </button>
            </div>
          </section>

          <section className="bkp-section" style={{ padding: '0' }} aria-labelledby="details-heading">
            <h2 id="details-heading" className="bkp-label" style={{ marginBottom: 12 }}>Rooms</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="bkp-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                  <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 'var(--bkp-radius-md)', background: 'var(--bkp-bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bed size={24} color="var(--bkp-text-secondary)" aria-hidden />
                  </div>
                  <div>
                    <p className="bkp-card-title" style={{ margin: 0, fontSize: 'var(--bkp-text-base)' }}>Bedrooms</p>
                    <p className="bkp-card-subtitle" style={{ margin: '2px 0 0' }}>All rooms cleaned</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <button type="button" onClick={() => setBedrooms(Math.max(0, bedrooms - 1))} className="bkp-btn-stepper" style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, background: 'var(--bkp-bg-surface-hover)', color: 'var(--bkp-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Fewer bedrooms">
                    <Minus size={20} aria-hidden />
                  </button>
                  <span style={{ fontSize: 'var(--bkp-text-xl)', fontWeight: 800, minWidth: 28, textAlign: 'center', color: 'var(--bkp-text)' }}>{bedrooms}</span>
                  <button type="button" onClick={() => setBedrooms(bedrooms + 1)} className="bkp-btn-stepper" style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, background: 'var(--bkp-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="More bedrooms">
                    <Plus size={20} aria-hidden />
                  </button>
                </div>
              </div>
              <div className="bkp-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                  <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 'var(--bkp-radius-md)', background: 'var(--bkp-bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bath size={24} color="var(--bkp-text-secondary)" aria-hidden />
                  </div>
                  <div>
                    <p className="bkp-card-title" style={{ margin: 0, fontSize: 'var(--bkp-text-base)' }}>Bathrooms</p>
                    <p className="bkp-card-subtitle" style={{ margin: '2px 0 0' }}>Deep sanitisation</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <button type="button" onClick={() => setBathrooms(Math.max(0, bathrooms - 1))} className="bkp-btn-stepper" style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, background: 'var(--bkp-bg-surface-hover)', color: 'var(--bkp-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Fewer bathrooms">
                    <Minus size={20} aria-hidden />
                  </button>
                  <span style={{ fontSize: 'var(--bkp-text-xl)', fontWeight: 800, minWidth: 28, textAlign: 'center', color: 'var(--bkp-text)' }}>{bathrooms}</span>
                  <button type="button" onClick={() => setBathrooms(bathrooms + 1)} className="bkp-btn-stepper" style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, background: 'var(--bkp-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="More bathrooms">
                    <Plus size={20} aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="bkp-section" style={{ padding: '0' }} aria-labelledby="furnished-heading">
            <h2 id="furnished-heading" className="bkp-label" style={{ marginBottom: 12 }}>Is the property furnished?</h2>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setFurnished(false)}
                className={`bkp-card ${!furnished ? 'bkp-card-selected' : ''}`}
                style={{ flex: 1, padding: 16, cursor: 'pointer', border: 'none', outline: 'none', font: 'inherit', color: 'inherit', textAlign: 'center' }}
              >
                <span className="bkp-card-title" style={{ fontSize: 'var(--bkp-text-base)' }}>No</span>
                <span className="bkp-card-subtitle" style={{ marginTop: 4, display: 'block' }}>Unfurnished +£0</span>
              </button>
              <button
                type="button"
                onClick={() => setFurnished(true)}
                className={`bkp-card ${furnished ? 'bkp-card-selected' : ''}`}
                style={{ flex: 1, padding: 16, cursor: 'pointer', border: 'none', outline: 'none', font: 'inherit', color: 'inherit', textAlign: 'center' }}
              >
                <span className="bkp-card-title" style={{ fontSize: 'var(--bkp-text-base)' }}>Yes</span>
                <span className="bkp-card-subtitle" style={{ marginTop: 4, display: 'block' }}>Furnished +£20</span>
              </button>
            </div>
          </section>

          <section className="bkp-section" style={{ padding: '0' }} aria-labelledby="addons-heading">
            <h2 id="addons-heading" className="bkp-label" style={{ marginBottom: 8 }}>Add-ons</h2>
            <p className="bkp-card-subtitle" style={{ marginBottom: 12, marginTop: 0 }}>Kitchen & steam</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: 10
            }}>
              {addons.map((addon) => {
                const isSelected = selectedAddons.has(addon.id);
                const IconComp = ADDON_ICONS[addon.icon] || LayoutGrid;
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`bkp-card ${isSelected ? 'bkp-card-selected' : ''}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: 14,
                      cursor: 'pointer',
                      border: 'none',
                      outline: 'none',
                      font: 'inherit',
                      color: 'inherit',
                      minHeight: 100,
                      textAlign: 'center'
                    }}
                    aria-pressed={isSelected}
                    aria-label={`${addon.label}, +£${addon.price}`}
                  >
                    <IconComp size={26} color={isSelected ? 'var(--bkp-primary)' : 'var(--bkp-text-tertiary)'} strokeWidth={isSelected ? 2.5 : 1.5} aria-hidden />
                    <span style={{ fontSize: 'var(--bkp-text-xs)', fontWeight: 700, lineHeight: 1.2, color: 'var(--bkp-text)' }}>{addon.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--bkp-primary)' }}>+£{addon.price}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section style={{ padding: '24px 0 0' }}>
            <div className="bkp-card" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 18, borderColor: 'var(--bkp-border-subtle)', background: 'var(--bkp-bg-surface)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--bkp-radius-full)', background: 'var(--bkp-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={22} color="var(--bkp-primary)" aria-hidden />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 'var(--bkp-text-sm)', fontWeight: 700, color: 'var(--bkp-text)' }}>Satisfaction guarantee</p>
                <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-xs)', lineHeight: 1.45, margin: '4px 0 0' }}>Professional equipment and 48-hour guarantee. We make sure you pass your check.</p>
              </div>
            </div>
          </section>
        </main>

        <BookingQuoteUnlock
          postcode={postcode}
          onPostcodeChange={(e) => { setPostcode(e.target.value.toUpperCase()); setPostcodeError(''); }}
          email={email}
          onEmailChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
          postcodeError={postcodeError}
          emailError={emailError}
          onPostcodeBlur={handlePostcodeBlur}
          onEmailBlur={handleEmailBlur}
          canShowPrice={canShowPrice}
          estimatedPrice={estimatedPrice}
          onContinue={handleContinue}
          discountPercent={27}
          isMobile={isMobile}
        />
      </div>
    </>
  );
};

export default B2CCleaningBooking;
