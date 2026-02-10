import React, { useState, useEffect } from 'react';
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
  Sparkles,
  BadgeCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import '../styles/booking-premium.css';

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

  const postcode = location.state?.postcode || '';
  const email = location.state?.email || '';

  const handleContinue = () => {
    navigate('/checkout', {
      state: {
        postcode,
        email,
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

        <footer className="bkp-footer" style={{ background: 'var(--bkp-bg-deep)', borderTop: '1px solid var(--bkp-border-subtle)', padding: isMobile ? '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))' : '32px 24px 40px', width: '100%' }}>
          <div className="bkp-footer-inner">
            <div className="bkp-card bkp-ai-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(233, 74, 2, 0.35)' }}>
              <div className="bkp-ai-card-icon" style={{ width: 36, height: 36, flexShrink: 0, background: 'var(--bkp-primary-muted)', borderRadius: 'var(--bkp-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={20} color="var(--bkp-primary)" strokeWidth={2} aria-hidden />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="bkp-label" style={{ margin: 0, color: 'var(--bkp-text)' }}>AI market analysis</p>
                <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-xs)', lineHeight: 1.35, margin: '2px 0 0' }}>We’ve analysed the local market and secured the best price for you.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <span className="bkp-label">Estimated quote</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginTop: 4 }}>
                  <span className="bkp-price">£{estimatedPrice}</span>
                  <span style={{ color: 'var(--bkp-text-quaternary)', fontSize: 'var(--bkp-text-sm)', fontWeight: 700 }}>.00</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <div className="bkp-pill bkp-pill-highlight" style={{ padding: '8px 14px' }}>
                  <BadgeCheck size={14} strokeWidth={2.5} aria-hidden />
                  <span>AI price match</span>
                </div>
                <span className="bkp-label" style={{ fontSize: '0.625rem' }}>VAT inclusive</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button type="button" onClick={handleContinue} className="bkp-btn-primary" aria-label="Continue to booking with your quote">
                Continue to booking
                <ArrowRight size={20} strokeWidth={2.5} aria-hidden />
              </button>
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--bkp-text-quaternary)', fontSize: 'var(--bkp-text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                <Info size={12} aria-hidden />
                Materials and equipment included
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default B2CCleaningBooking;
