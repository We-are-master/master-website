import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Home,
  Paintbrush,
  Palette,
  Sparkles,
  Bed,
  Armchair,
  Layers,
  DoorOpen,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import '../styles/booking-premium.css';

const PAINTING_PROPERTY_ICONS = { apartment: Building2, home: Home };
const PAINTING_QUALITY_ICONS = { brush: Paintbrush, format_paint: Palette, shutter_speed: Sparkles };
const PAINTING_ITEM_ICONS = { bed: Bed, chair_alt: Armchair, layers: Layers, sensor_door: DoorOpen };

const B2CPaintingBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const postcode = location.state?.postcode || '';
  const email = location.state?.email || '';
  const [propertyType, setPropertyType] = useState('flat');
  const [paintingQuality, setPaintingQuality] = useState('high_standard');
  const [bedrooms, setBedrooms] = useState(0);
  const [livingRooms, setLivingRooms] = useState(0);
  const [ceilings, setCeilings] = useState(0);
  const [doorsWindows, setDoorsWindows] = useState(0);
  const [extraRequests, setExtraRequests] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState(200);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect screen size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const paintingQualities = [
    { 
      id: 'fresh_coat', 
      icon: 'brush', 
      label: 'Fresh Coat', 
      description: 'Quick refresh, ideal for rental properties.',
      multiplier: 1.0
    },
    { 
      id: 'high_standard', 
      icon: 'format_paint', 
      label: 'High Standard', 
      description: 'Premium finish with detailed surface preparation.',
      multiplier: 1.3
    },
    { 
      id: 'master_gallery', 
      icon: 'shutter_speed', 
      label: 'Master Gallery', 
      description: 'Flawless execution, multiple coats, and luxury finish.',
      badge: 'Luxury',
      multiplier: 1.8
    }
  ];

  // Pricing from master_painter CSV: Base £200 + Bedroom £250 ea, Living room £175 ea, Ceiling £65 ea, Door/Window £55 ea
  const serviceItems = [
    { id: 'bedrooms', icon: 'bed', label: 'Bedrooms', price: 250, value: bedrooms, setter: setBedrooms },
    { id: 'livingRooms', icon: 'chair_alt', label: 'Living Rooms', price: 175, value: livingRooms, setter: setLivingRooms },
    { id: 'ceilings', icon: 'layers', label: 'Ceilings', price: 65, value: ceilings, setter: setCeilings },
    { id: 'doorsWindows', icon: 'sensor_door', label: 'Doors/Windows', price: 55, value: doorsWindows, setter: setDoorsWindows }
  ];

  const calculatePrice = () => {
    const basePrice = 200; // House or Flat Paint base (master_painter CSV)
    
    // Find selected quality multiplier
    const selectedQuality = paintingQualities.find(q => q.id === paintingQuality);
    const qualityMultiplier = selectedQuality?.multiplier || 1.0;
    
    // Property type multiplier
    const propertyMultiplier = propertyType === 'house' ? 1.2 : 1.0;
    
    // Add service items
    let serviceTotal = 0;
    serviceTotal += bedrooms * 250;
    serviceTotal += livingRooms * 175;
    serviceTotal += ceilings * 65;
    serviceTotal += doorsWindows * 55;
    
    // Calculate final price
    const finalPrice = (basePrice + serviceTotal) * qualityMultiplier * propertyMultiplier;
    
    setEstimatedPrice(Math.round(finalPrice * 100) / 100);
    return Math.round(finalPrice * 100) / 100;
  };

  useEffect(() => {
    calculatePrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyType, paintingQuality, bedrooms, livingRooms, ceilings, doorsWindows]);

  const getQualityLabel = () => paintingQualities.find(q => q.id === paintingQuality)?.label || 'High Standard';

  const handleBookService = () => {
    navigate('/checkout', {
      state: {
        postcode,
        email,
        service: {
          id: 'painting',
          title: `Painting - ${getQualityLabel()}`,
          category: 'painting',
          type: 'painting',
          propertyType,
          paintingQuality,
          bedrooms,
          livingRooms,
          ceilings,
          doorsWindows,
          extraRequests,
          price: estimatedPrice
        }
      }
    });
  };

  const StepperControl = ({ value, onDecrement, onIncrement }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '6px 8px',
      borderRadius: '9999px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <button
        onClick={onDecrement}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s',
          color: 'white',
          fontSize: '20px',
          fontWeight: 500
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(237, 75, 0, 0.2)';
          e.currentTarget.style.color = '#ED4B00';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = 'white';
        }}
      >
        -
      </button>
      <span style={{ 
        fontSize: '16px', 
        fontWeight: 700, 
        width: '16px', 
        textAlign: 'center',
        color: 'white'
      }}>
        {value}
      </span>
      <button
        onClick={onIncrement}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s',
          color: 'white',
          fontSize: '20px',
          fontWeight: 500
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(237, 75, 0, 0.2)';
          e.currentTarget.style.color = '#ED4B00';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = 'white';
        }}
      >
        +
      </button>
    </div>
  );

  return (
    <>
      <SEO 
        title="Master Painting Service - Professional Interior Painting"
        description="Professional painting services with AI-powered pricing. Fresh coat, high standard, and luxury finishes available. Materials and equipment included."
      />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div className="bkp bkp-dark" style={{ background: 'linear-gradient(180deg, #0c0c1a 0%, #080814 100%)' }}>
        <header className="bkp-header">
          <div className="bkp-header-inner" style={{ display: 'flex', flexDirection: 'column', width: '100%', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: isMobile ? '16px 0' : '20px 0', justifyContent: 'space-between', width: '100%' }}>
              <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="bkp-btn-icon" style={{ color: 'var(--bkp-text)' }}>
                <ChevronLeft size={24} aria-hidden />
              </button>
              <h1 className="bkp-title-page" style={{ flex: 1, textAlign: 'center', margin: 0 }}>Painting Service</h1>
              <div style={{ width: 44, height: 44 }} aria-hidden />
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
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="bkp-pill bkp-pill-highlight" style={{ gap: 8 }}>
              <BadgeCheck size={16} color="var(--bkp-primary)" aria-hidden />
              <span>Materials & equipment included</span>
            </div>
          </div>

          {/* Property Type Section */}
          <section className="bkp-section" style={{ padding: 0 }}>
            <h3 style={{ 
              color: 'white', 
              fontSize: '20px', 
              fontWeight: 700, 
              lineHeight: '1.25',
              letterSpacing: '-0.02em',
              marginBottom: '16px'
            }}>
              Property Type
            </h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[
                { id: 'flat', icon: 'apartment', label: 'Flat' },
                { id: 'house', icon: 'home', label: 'House' }
              ].map((type) => (
                <label key={type.id} style={{ flex: 1, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="property_type"
                    value={type.id}
                    checked={propertyType === type.id}
                    onChange={() => setPropertyType(type.id)}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    height: '128px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    borderRadius: '16px',
                    background: propertyType === type.id ? 'rgba(237, 75, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                    border: propertyType === type.id ? '2px solid #ED4B00' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}>
                    {(() => {
                      const IconComp = PAINTING_PROPERTY_ICONS[type.icon] || Building2;
                      return <IconComp size={30} color={propertyType === type.id ? '#ED4B00' : 'rgba(255, 255, 255, 0.6)'} />;
                    })()}
                    <span style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>
                      {type.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Painting Quality Section */}
          <section style={{ padding: '40px 0 0' }}>
            <h3 style={{ 
              color: 'white', 
              fontSize: '20px', 
              fontWeight: 700, 
              lineHeight: '1.25',
              letterSpacing: '-0.02em',
              marginBottom: '16px'
            }}>
              Painting Quality
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {paintingQualities.map((quality) => (
                <label key={quality.id} style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="painting_quality"
                    value={quality.id}
                    checked={paintingQuality === quality.id}
                    onChange={() => setPaintingQuality(quality.id)}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '20px',
                    borderRadius: '16px',
                    background: paintingQuality === quality.id ? 'rgba(237, 75, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                    border: paintingQuality === quality.id ? '2px solid #ED4B00' : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{
                      display: 'flex',
                      width: '48px',
                      height: '48px',
                      flexShrink: 0,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      background: paintingQuality === quality.id ? 'rgba(237, 75, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                    }}>
                      {(() => {
                        const IconComp = PAINTING_QUALITY_ICONS[quality.icon] || Paintbrush;
                        return <IconComp size={24} color={paintingQuality === quality.id ? '#ED4B00' : 'white'} />;
                      })()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>
                          {quality.label}
                        </span>
                        {quality.badge && (
                          <span style={{
                            background: '#ED4B00',
                            color: 'white',
                            fontSize: '10px',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.02em'
                          }}>
                            {quality.badge}
                          </span>
                        )}
                      </div>
                      <span style={{ 
                        color: 'rgba(255, 255, 255, 0.6)', 
                        fontSize: '14px', 
                        lineHeight: '1.4'
                      }}>
                        {quality.description}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Configure Service Section */}
          <section style={{ padding: '40px 0 0' }}>
            <h3 style={{ 
              color: 'white', 
              fontSize: '20px', 
              fontWeight: 700, 
              lineHeight: '1.25',
              letterSpacing: '-0.02em',
              marginBottom: '16px'
            }}>
              Configure your service
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {serviceItems.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '16px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                >
                  <div style={{
                    display: 'flex',
                    width: '56px',
                    height: '56px',
                    flexShrink: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)'
                  }}>
                    {(() => {
                      const IconComp = PAINTING_ITEM_ICONS[item.icon] || Layers;
                      return <IconComp size={24} color="white" />;
                    })()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <p style={{ color: 'white', fontSize: '16px', fontWeight: 600, lineHeight: '1.5' }}>
                      {item.label}
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', fontWeight: 500 }}>
                      +£{item.price} each
                    </p>
                  </div>
                  <StepperControl
                    value={item.value}
                    onDecrement={() => item.setter(Math.max(0, item.value - 1))}
                    onIncrement={() => item.setter(item.value + 1)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Extra Requests Section */}
          <section style={{ padding: '40px 0' }}>
            <h3 style={{ 
              color: 'white', 
              fontSize: '20px', 
              fontWeight: 700, 
              lineHeight: '1.25',
              letterSpacing: '-0.02em',
              marginBottom: '16px'
            }}>
              Extra requests?
            </h3>
            <div style={{ position: 'relative' }}>
              <textarea
                value={extraRequests}
                onChange={(e) => setExtraRequests(e.target.value)}
                placeholder="Specific wall textures, special coatings, or time constraints..."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  color: 'white',
                  minHeight: '120px',
                  resize: 'vertical',
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '14px',
                  transition: 'border-color 0.2s',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ED4B00'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
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
                  <span className="bkp-price">£{estimatedPrice}</span>
                  <span style={{ color: 'var(--bkp-text-quaternary)', fontSize: 'var(--bkp-text-sm)', fontWeight: 700 }}>.00</span>
                </div>
              </div>
              <div className="bkp-pill bkp-pill-highlight" style={{ padding: '8px 14px' }}>
                <BadgeCheck size={14} strokeWidth={2.5} aria-hidden />
                <span>AI price match</span>
              </div>
            </div>
            <button type="button" onClick={handleBookService} className="bkp-btn-primary" aria-label="Continue to booking with your quote">
              Continue to booking
              <ArrowRight size={20} strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </footer>
      </div>
    </>
  );
};

export default B2CPaintingBooking;
