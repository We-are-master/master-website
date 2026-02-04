import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

const B2CPaintingBooking = () => {
  const navigate = useNavigate();
  
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

  // Load Material Symbols font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
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

  const serviceItems = [
    { id: 'bedrooms', icon: 'bed', label: 'Bedrooms', price: 250, value: bedrooms, setter: setBedrooms },
    { id: 'livingRooms', icon: 'chair_alt', label: 'Living Rooms', price: 175, value: livingRooms, setter: setLivingRooms },
    { id: 'ceilings', icon: 'layers', label: 'Ceilings', price: 65, value: ceilings, setter: setCeilings },
    { id: 'doorsWindows', icon: 'sensor_door', label: 'Doors/Windows', price: 55, value: doorsWindows, setter: setDoorsWindows }
  ];

  const calculatePrice = () => {
    let basePrice = 200; // Base price
    
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

  const handleBookService = () => {
    navigate('/checkout', {
      state: {
        service: {
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
      
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <div style={{
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #020034 0%, #020030 100%)',
        fontFamily: "'Manrope', sans-serif",
        color: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(2, 0, 52, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '16px', 
            justifyContent: 'space-between',
            maxWidth: '512px',
            margin: '0 auto'
          }}>
            <div 
              style={{ 
                display: 'flex', 
                width: '40px', 
                height: '40px', 
                flexShrink: 0, 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onClick={() => navigate(-1)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                arrow_back_ios_new
              </span>
            </div>
            <h2 style={{ 
              color: 'white', 
              fontSize: '18px', 
              fontWeight: 700, 
              lineHeight: '1.25', 
              letterSpacing: '-0.02em',
              flex: 1, 
              textAlign: 'center'
            }}>
              Painting Service
            </h2>
            <div style={{ width: '40px', height: '40px', flexShrink: 0, opacity: 0 }}></div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ 
          flex: 1, 
          overflowY: 'auto',
          paddingBottom: '128px',
          maxWidth: '512px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Materials Badge */}
          <div style={{ padding: '24px 16px 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(240, 108, 0, 0.1)',
              border: '1px solid rgba(240, 108, 0, 0.2)',
              padding: '8px 16px',
              borderRadius: '9999px'
            }}>
              <span className="material-symbols-outlined" style={{ color: '#f06c00', fontSize: '14px' }}>
                verified
              </span>
              <span style={{ 
                color: '#f06c00', 
                fontSize: '12px', 
                fontWeight: 700, 
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Materials & Equipment included
              </span>
            </div>
          </div>

          {/* Property Type Section */}
          <section style={{ padding: '32px 16px 0' }}>
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
                    <span 
                      className="material-symbols-outlined" 
                      style={{ 
                        fontSize: '30px', 
                        color: propertyType === type.id ? '#ED4B00' : 'rgba(255, 255, 255, 0.6)'
                      }}
                    >
                      {type.icon}
                    </span>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>
                      {type.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Painting Quality Section */}
          <section style={{ padding: '40px 16px 0' }}>
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
                      <span 
                        className="material-symbols-outlined" 
                        style={{ 
                          fontSize: '24px',
                          color: paintingQuality === quality.id ? '#ED4B00' : 'white'
                        }}
                      >
                        {quality.icon}
                      </span>
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
          <section style={{ padding: '40px 16px 0' }}>
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
                    <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'white' }}>
                      {item.icon}
                    </span>
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
          <section style={{ padding: '40px 16px' }}>
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

          {/* AI Analysis Banner */}
          <section style={{ padding: '0 16px 24px' }}>
            <div style={{
              background: '#020030',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{
                display: 'flex',
                width: '40px',
                height: '40px',
                flexShrink: 0,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                background: '#ED4B00'
              }}>
                <span 
                  className="material-symbols-outlined" 
                  style={{ 
                    color: 'white', 
                    fontSize: '20px',
                    fontVariationSettings: '"FILL" 1'
                  }}
                >
                  auto_awesome
                </span>
              </div>
              <p style={{ 
                color: 'white', 
                fontSize: '14px', 
                lineHeight: '1.5', 
                fontWeight: 500 
              }}>
                <span style={{ fontWeight: 700 }}>AI MARKET ANALYSIS:</span> We have analyzed the local market and secured the best available price for you using Master AI.
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(2, 0, 52, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px',
          paddingBottom: isMobile ? `calc(32px + env(safe-area-inset-bottom, 0px))` : '32px'
        }}>
          <div style={{ 
            maxWidth: '512px', 
            margin: '0 auto', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.5)', 
                fontSize: '12px', 
                fontWeight: 500, 
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Estimated Total
              </span>
              <span style={{ 
                color: 'white', 
                fontSize: '24px', 
                fontWeight: 800 
              }}>
                £{estimatedPrice.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleBookService}
              style={{
                flex: 1,
                background: '#ED4B00',
                color: 'white',
                fontWeight: 700,
                padding: '16px 32px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(237, 75, 0, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ff5a00';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ED4B00';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Book Service
            </button>
          </div>
        </footer>
      </div>

      <style>{`
        ::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        
        /* Prevent horizontal scroll */
        html, body {
          overflow-x: hidden;
          max-width: 100vw;
        }
      `}</style>
    </>
  );
};

export default B2CPaintingBooking;
