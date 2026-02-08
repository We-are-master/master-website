import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SEO } from '../components/SEO';

const PaintingBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
    
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(fontLink);
    };
  }, []);

  // Pricing configuration
  const qualityMultipliers = {
    fresh_coat: 1.0,
    high_standard: 1.35,
    master_gallery: 1.8
  };

  const roomPrices = {
    bedrooms: 250,
    livingRooms: 175,
    ceilings: 65,
    doorsWindows: 55
  };

  // Calculate price
  const calculatePrice = () => {
    let basePrice = 200; // Base visit/assessment fee
    
    // Add room costs
    basePrice += bedrooms * roomPrices.bedrooms;
    basePrice += livingRooms * roomPrices.livingRooms;
    basePrice += ceilings * roomPrices.ceilings;
    basePrice += doorsWindows * roomPrices.doorsWindows;
    
    // Apply quality multiplier
    basePrice *= qualityMultipliers[paintingQuality];
    
    // Property type adjustment
    if (propertyType === 'house') {
      basePrice *= 1.15; // Houses typically have higher ceilings, more prep work
    }
    
    setEstimatedPrice(Math.round(basePrice));
    return Math.round(basePrice);
  };

  useEffect(() => {
    calculatePrice();
  }, [bedrooms, livingRooms, ceilings, doorsWindows, paintingQuality, propertyType]);

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

  const qualityOptions = [
    {
      id: 'fresh_coat',
      icon: 'brush',
      title: 'Fresh Coat',
      description: 'Quick refresh, ideal for rental properties.',
      badge: null
    },
    {
      id: 'high_standard',
      icon: 'format_paint',
      title: 'High Standard',
      description: 'Premium finish with detailed surface preparation.',
      badge: null
    },
    {
      id: 'master_gallery',
      icon: 'shutter_speed',
      title: 'Master Gallery',
      description: 'Flawless execution, multiple coats, and luxury finish.',
      badge: 'Luxury'
    }
  ];

  const roomConfig = [
    { id: 'bedrooms', icon: 'bed', label: 'Bedrooms', price: 250, value: bedrooms, setValue: setBedrooms },
    { id: 'livingRooms', icon: 'chair_alt', label: 'Living Rooms', price: 175, value: livingRooms, setValue: setLivingRooms },
    { id: 'ceilings', icon: 'layers', label: 'Ceilings', price: 65, value: ceilings, setValue: setCeilings },
    { id: 'doorsWindows', icon: 'sensor_door', label: 'Doors/Windows', price: 55, value: doorsWindows, setValue: setDoorsWindows }
  ];

  return (
    <>
      <SEO 
        title="Painting Service - Master Services"
        description="Professional painting services with materials and equipment included. Fresh coat, high standard, and luxury gallery finishes available."
      />
      
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
            paddingBottom: '16px',
            justifyContent: 'space-between',
            maxWidth: '512px',
            margin: '0 auto'
          }}>
            <div 
              onClick={() => navigate(-1)}
              style={{
                color: 'white',
                display: 'flex',
                width: '40px',
                height: '40px',
                flexShrink: 0,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
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
            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 }}></div>
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
          <div style={{ padding: '0 16px', paddingTop: '24px', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(240, 108, 0, 0.1)',
              border: '1px solid rgba(240, 108, 0, 0.2)',
              padding: '8px 16px',
              borderRadius: '9999px'
            }}>
              <span className="material-symbols-outlined" style={{ color: '#f06c00', fontSize: '14px' }}>verified</span>
              <span style={{ color: '#f06c00', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Materials & Equipment included
              </span>
            </div>
          </div>

          {/* Property Type Section */}
          <div style={{ padding: '0 16px', paddingTop: '32px' }}>
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
              {/* Flat Option */}
              <label style={{ flex: 1, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="property_type"
                  value="flat"
                  checked={propertyType === 'flat'}
                  onChange={(e) => setPropertyType(e.target.value)}
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
                  background: propertyType === 'flat' ? 'rgba(237, 75, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${propertyType === 'flat' ? '#ED4B00' : 'transparent'}`,
                  transition: 'all 0.2s'
                }}>
                  <span className="material-symbols-outlined" style={{
                    fontSize: '30px',
                    color: propertyType === 'flat' ? '#ED4B00' : 'rgba(255, 255, 255, 0.6)'
                  }}>apartment</span>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Flat</span>
                </div>
              </label>
              
              {/* House Option */}
              <label style={{ flex: 1, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="property_type"
                  value="house"
                  checked={propertyType === 'house'}
                  onChange={(e) => setPropertyType(e.target.value)}
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
                  background: propertyType === 'house' ? 'rgba(237, 75, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${propertyType === 'house' ? '#ED4B00' : 'transparent'}`,
                  transition: 'all 0.2s'
                }}>
                  <span className="material-symbols-outlined" style={{
                    fontSize: '30px',
                    color: propertyType === 'house' ? '#ED4B00' : 'rgba(255, 255, 255, 0.6)'
                  }}>home</span>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>House</span>
                </div>
              </label>
            </div>
          </div>

          {/* Painting Quality Section */}
          <div style={{ padding: '0 16px', paddingTop: '40px' }}>
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
              {qualityOptions.map((option) => (
                <label key={option.id} style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="painting_quality"
                    value={option.id}
                    checked={paintingQuality === option.id}
                    onChange={(e) => setPaintingQuality(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '20px',
                    borderRadius: '16px',
                    background: paintingQuality === option.id ? 'rgba(237, 75, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                    border: `2px solid ${paintingQuality === option.id ? '#ED4B00' : 'transparent'}`,
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
                      background: paintingQuality === option.id ? 'rgba(237, 75, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{option.icon}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>{option.title}</span>
                        {option.badge && (
                          <span style={{
                            background: '#ED4B00',
                            fontSize: '10px',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.02em'
                          }}>
                            {option.badge}
                          </span>
                        )}
                      </div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', lineHeight: '1.4' }}>
                        {option.description}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Configure Service Section */}
          <div style={{ padding: '0 16px', paddingTop: '40px' }}>
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
              {roomConfig.map((room) => (
                <div key={room.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'background-color 0.2s'
                }}>
                  <div style={{
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    flexShrink: 0,
                    width: '56px',
                    height: '56px'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{room.icon}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <p style={{ color: 'white', fontSize: '16px', fontWeight: 600, lineHeight: '1.5' }}>{room.label}</p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', fontWeight: 500 }}>+£{room.price} each</p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '6px 8px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <button
                      onClick={() => room.setValue(Math.max(0, room.value - 1))}
                      style={{
                        display: 'flex',
                        height: '32px',
                        width: '32px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '20px',
                        fontWeight: 500,
                        color: 'white'
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
                    <span style={{ fontSize: '16px', fontWeight: 700, width: '16px', textAlign: 'center' }}>{room.value}</span>
                    <button
                      onClick={() => room.setValue(room.value + 1)}
                      style={{
                        display: 'flex',
                        height: '32px',
                        width: '32px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '20px',
                        fontWeight: 500,
                        color: 'white'
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
                </div>
              ))}
            </div>
          </div>

          {/* Extra Requests Section */}
          <div style={{ padding: '0 16px', paddingTop: '40px', paddingBottom: '40px' }}>
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
                  transition: 'all 0.2s',
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#ED4B00';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>
          </div>

          {/* AI Market Analysis Card */}
          <div style={{ padding: '0 16px', marginBottom: '24px' }}>
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
                <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px', fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
              </div>
              <p style={{ color: 'white', fontSize: '14px', lineHeight: '1.4', fontWeight: 500 }}>
                <span style={{ fontWeight: 700 }}>AI MARKET ANALYSIS:</span> We have analyzed the local market and secured the best available price for you using Master AI.
              </p>
            </div>
          </div>
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
          paddingBottom: '32px'
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
                textAlign: 'center',
                fontSize: '18px',
                boxShadow: '0 4px 20px rgba(237, 75, 0, 0.3)',
                border: 'none',
                cursor: 'pointer',
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

export default PaintingBooking;
