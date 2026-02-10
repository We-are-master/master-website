import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ArrowRight,
  BadgeCheck,
  DoorOpen,
  LayoutGrid,
  Ruler,
  Sparkles,
  MoreVertical,
  CheckCircle,
  Minus,
  Plus,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import '../styles/booking-premium.css';

// Pricing from master_carpenter CSV
const TAB_DOOR = 'door';
const TAB_FLOORING = 'flooring';
const TAB_SKIRTING = 'skirting';
const TAB_CARPET = 'carpet';

const DOOR_ITEMS = [
  { id: 'internal', label: 'Standard Internal Doors', pricePerUnit: 175, key: 'internalDoors' },
  { id: 'external', label: 'External Doors', pricePerUnit: 280, key: 'externalDoors' },
  { id: 'fire', label: 'Fire Doors', pricePerUnit: 199, key: 'fireDoors' },
  { id: 'frame', label: 'Frame Replacements', pricePerUnit: 80, key: 'frameReplacements' },
];

const FLOORING_PRICE_PER_M2 = 30;   // Flooring Fitting £30/m²
const SKIRTING_PRICE_PER_M2 = 22;   // Skirting Boards £22/m²
const CARPET_REMOVAL_PRICE_PER_M2 = 7; // Carpet Removal £7/m²

const B2CCarpentryBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const postcode = location.state?.postcode || '';
  const email = location.state?.email || '';
  const [activeTab, setActiveTab] = useState(TAB_DOOR);
  const [extraRequests, setExtraRequests] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Door quantities
  const [internalDoors, setInternalDoors] = useState(2);
  const [externalDoors, setExternalDoors] = useState(0);
  const [fireDoors, setFireDoors] = useState(0);
  const [frameReplacements, setFrameReplacements] = useState(0);

  // Flooring (m²) – CSV: £30/m²
  const [flooringM2, setFlooringM2] = useState(0);

  // Skirting (m²) – CSV: £22/m²
  const [skirtingM2, setSkirtingM2] = useState(0);

  // Carpet Removal (m²) – CSV: £7/m²
  const [carpetRemovalM2, setCarpetRemovalM2] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDoorTotal = () =>
    internalDoors * 175 + externalDoors * 280 + fireDoors * 199 + frameReplacements * 80;
  const getFlooringTotal = () => flooringM2 * FLOORING_PRICE_PER_M2;
  const getSkirtingTotal = () => skirtingM2 * SKIRTING_PRICE_PER_M2;
  const getCarpetTotal = () => carpetRemovalM2 * CARPET_REMOVAL_PRICE_PER_M2;

  const estimatedPrice =
    activeTab === TAB_DOOR
      ? getDoorTotal()
      : activeTab === TAB_FLOORING
        ? getFlooringTotal()
        : activeTab === TAB_SKIRTING
          ? getSkirtingTotal()
          : getCarpetTotal();

  const getTabLabel = () => {
    if (activeTab === TAB_DOOR) return 'Door Installation';
    if (activeTab === TAB_FLOORING) return 'Flooring Fitting';
    if (activeTab === TAB_SKIRTING) return 'Skirting Boards';
    return 'Carpet Removal';
  };

  const handleContinue = () => {
    navigate('/checkout', {
      state: {
        postcode,
        email,
        service: {
          id: 'carpentry',
          title: `Carpentry - ${getTabLabel()}`,
          category: 'carpentry',
          type: 'carpentry',
          subType: activeTab,
          items:
            activeTab === TAB_DOOR
              ? { internalDoors, externalDoors, fireDoors, frameReplacements }
              : activeTab === TAB_FLOORING
                ? { flooringM2 }
                : activeTab === TAB_SKIRTING
                  ? { skirtingM2 }
                  : { carpetRemovalM2 },
          extraRequests,
          price: estimatedPrice,
        },
      },
    });
  };

  const LineItem = ({ label, pricePerUnit, value, setValue, unit = 'unit' }) => (
    <div
      className="bkp-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'nowrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="bkp-card-title" style={{ margin: 0 }}>{label}</p>
        <p className="bkp-card-subtitle" style={{ margin: '2px 0 0' }}>
          £{pricePerUnit}/{unit}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => setValue(Math.max(0, value - 1))}
          className="bkp-btn-stepper"
          style={{ background: 'var(--bkp-bg-surface-hover)', color: 'var(--bkp-text)' }}
          aria-label={`Decrease ${label}`}
        >
          <Minus size={20} aria-hidden />
        </button>
        <span style={{ fontSize: 'var(--bkp-text-xl)', fontWeight: 800, minWidth: 24, textAlign: 'center', color: 'var(--bkp-text)' }}>
          {value}
        </span>
        <button
          type="button"
          onClick={() => setValue(value + 1)}
          className="bkp-btn-stepper"
          style={{ background: 'var(--bkp-primary)', color: '#fff' }}
          aria-label={`Increase ${label}`}
        >
          <Plus size={20} aria-hidden />
        </button>
      </div>
    </div>
  );

  const doorSetters = { internalDoors: setInternalDoors, externalDoors: setExternalDoors, fireDoors: setFireDoors, frameReplacements: setFrameReplacements };
  const doorValues = { internalDoors, externalDoors, fireDoors, frameReplacements };

  return (
    <>
      <SEO
        title="Master Carpentry - Project Configuration"
        description="Door installation, flooring fitting, and skirting boards. Labour only – materials on site. Professional carpentry with AI-powered pricing."
      />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="bkp bkp-dark" style={{ background: 'linear-gradient(180deg, #0c0c1a 0%, #080814 100%)' }}>
        <header className="bkp-header">
          <div className="bkp-header-inner" style={{ maxWidth: isMobile ? 560 : 'var(--bkp-desktop-content, 600px)', margin: '0 auto', width: '100%', padding: isMobile ? '0 20px' : '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: isMobile ? '16px 0' : '20px 0', justifyContent: 'space-between', width: '100%' }}>
              <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="bkp-btn-icon" style={{ color: 'var(--bkp-text)' }}>
                <ChevronLeft size={24} aria-hidden />
              </button>
              <h1 className="bkp-title-page" style={{ flex: 1, textAlign: 'center', margin: 0 }}>
                Project Configuration
              </h1>
              <button type="button" aria-label="Menu" className="bkp-btn-icon" style={{ color: 'var(--bkp-text)' }}>
                <MoreVertical size={24} aria-hidden />
              </button>
            </div>
            {/* Tabs: Door Installation | Flooring Fitting | Skirting Boards */}
            <div style={{ padding: '0 0 16px', width: '100%' }}>
            <div
              style={{
                display: 'flex',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                padding: 4,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {[
                { id: TAB_DOOR, label: 'Doors' },
                { id: TAB_FLOORING, label: 'Flooring' },
                { id: TAB_SKIRTING, label: 'Skirting' },
                { id: TAB_CARPET, label: 'Carpet' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeTab === tab.id ? '#ED4B00' : 'transparent',
                    color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.6)',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            </div>
          </div>
        </header>

        <main className="bkp-main">
          {activeTab === TAB_DOOR && (
            <>
              <section className="bkp-section">
                <div className="bkp-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: 'rgba(237, 75, 0, 0.3)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--bkp-radius-md)', background: 'var(--bkp-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <DoorOpen size={24} color="var(--bkp-primary)" aria-hidden />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="bkp-card-title" style={{ margin: 0, fontSize: 'var(--bkp-text-sm)' }}>Door Installation PRO</p>
                    <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-xs)', margin: '4px 0 0' }}>
                      Labour only. Please ensure materials are on site.
                    </p>
                  </div>
                </div>
              </section>
              <section className="bkp-section">
                <h2 className="bkp-label" style={{ margin: 0 }}>Items</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {DOOR_ITEMS.map((item) => (
                    <LineItem
                      key={item.id}
                      label={item.label}
                      pricePerUnit={item.pricePerUnit}
                      value={doorValues[item.key]}
                      setValue={doorSetters[item.key]}
                      unit="unit"
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === TAB_FLOORING && (
            <>
              <section className="bkp-section">
                <div className="bkp-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: 'rgba(237, 75, 0, 0.3)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--bkp-radius-md)', background: 'var(--bkp-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <LayoutGrid size={24} color="var(--bkp-primary)" aria-hidden />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="bkp-card-title" style={{ margin: 0, fontSize: 'var(--bkp-text-sm)' }}>Flooring Fitting</p>
                    <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-xs)', margin: '4px 0 0' }}>
                      £30/m². Materials quoted separately.
                    </p>
                  </div>
                </div>
              </section>
              <section className="bkp-section">
                <h2 className="bkp-label" style={{ margin: 0 }}>Area (m²)</h2>
                <LineItem label="Flooring Fitting" pricePerUnit={FLOORING_PRICE_PER_M2} value={flooringM2} setValue={setFlooringM2} unit="m²" />
              </section>
            </>
          )}

          {activeTab === TAB_SKIRTING && (
            <>
              <section className="bkp-section">
                <div className="bkp-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: 'rgba(237, 75, 0, 0.3)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--bkp-radius-md)', background: 'var(--bkp-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Ruler size={24} color="var(--bkp-primary)" aria-hidden />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="bkp-card-title" style={{ margin: 0, fontSize: 'var(--bkp-text-sm)' }}>Skirting Boards</p>
                    <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-xs)', margin: '4px 0 0' }}>
                      £22/m². Supply and fit.
                    </p>
                  </div>
                </div>
              </section>
              <section className="bkp-section">
                <h2 className="bkp-label" style={{ margin: 0 }}>Area (m²)</h2>
                <LineItem label="Skirting Boards" pricePerUnit={SKIRTING_PRICE_PER_M2} value={skirtingM2} setValue={setSkirtingM2} unit="m²" />
              </section>
            </>
          )}

          {activeTab === TAB_CARPET && (
            <>
              <section className="bkp-section">
                <div className="bkp-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: 'rgba(237, 75, 0, 0.3)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--bkp-radius-md)', background: 'var(--bkp-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <LayoutGrid size={24} color="var(--bkp-primary)" aria-hidden />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="bkp-card-title" style={{ margin: 0, fontSize: 'var(--bkp-text-sm)' }}>Carpet Removal</p>
                    <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-xs)', margin: '4px 0 0' }}>
                      £7/m². Labour only.
                    </p>
                  </div>
                </div>
              </section>
              <section className="bkp-section">
                <h2 className="bkp-label" style={{ margin: 0 }}>Area (m²)</h2>
                <LineItem label="Carpet Removal" pricePerUnit={CARPET_REMOVAL_PRICE_PER_M2} value={carpetRemovalM2} setValue={setCarpetRemovalM2} unit="m²" />
              </section>
            </>
          )}

          <section className="bkp-section">
            <h2 className="bkp-label" style={{ margin: 0 }}>Extra requests</h2>
            <textarea
              value={extraRequests}
              onChange={(e) => setExtraRequests(e.target.value)}
              placeholder="Any specific requirements or project nuances..."
              style={{
                width: '100%',
                minHeight: 100,
                resize: 'vertical',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--bkp-radius-md)',
                color: 'var(--bkp-text)',
                fontFamily: 'var(--bkp-font)',
                fontSize: 'var(--bkp-text-sm)',
                outline: 'none',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--bkp-primary)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </section>

          <div className="bkp-card" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--bkp-radius-full)', background: 'var(--bkp-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle size={20} color="var(--bkp-primary)" aria-hidden />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="bkp-card-title" style={{ margin: 0, fontSize: 'var(--bkp-text-sm)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Premium satisfaction guarantee</p>
              <p style={{ color: 'var(--bkp-text-secondary)', fontSize: 'var(--bkp-text-xs)', lineHeight: 1.5, margin: '4px 0 0' }}>
                All works carry our premium satisfaction guarantee.
              </p>
            </div>
          </div>
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
                  <span className="bkp-price">£{estimatedPrice}</span>
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
    </>
  );
};

export default B2CCarpentryBooking;
