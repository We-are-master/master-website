import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SEO } from '../components/SEO';

const B2CCarpentryBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [propertyType, setPropertyType] = useState('flat');
  const [carpentryQuality, setCarpentryQuality] = useState('standard');
  const [shelves, setShelves] = useState(0);
  const [wardrobes, setWardrobes] = useState(0);
  const [doors, setDoors] = useState(0);
  const [customFurniture, setCustomFurniture] = useState(0);
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

  // Pricing configuration
  const qualityMultipliers = {
    basic: 1.0,
    standard: 1.3,
    premium: 1.6
  };

  const itemPrices = {
    shelves: 85,
    wardrobes: 350,
    doors: 120,
    customFurniture: 450
  };

  const calculatePrice = () => {
    let basePrice = 150; // Base service fee
    
    // Add items
    basePrice += shelves * itemPrices.shelves;
    basePrice += wardrobes * itemPrices.wardrobes;
    basePrice += doors * itemPrices.doors;
    basePrice += customFurniture * itemPrices.customFurniture;
    
    // Apply quality multiplier
    basePrice *= qualityMultipliers[carpentryQuality];
    
    // Property type adjustment
    if (propertyType === 'house') {
      basePrice *= 1.1; // 10% more for houses
    }
    
    setEstimatedPrice(Math.round(basePrice));
    return Math.round(basePrice);
  };

  useEffect(() => {
    calculatePrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyType, carpentryQuality, shelves, wardrobes, doors, customFurniture]);

  const handleContinue = () => {
    navigate('/checkout', {
      state: {
        service: {
          type: 'carpentry',
          propertyType,
          quality: carpentryQuality,
          items: {
            shelves,
            wardrobes,
            doors,
            customFurniture
          },
          extraRequests,
          price: estimatedPrice
        }
      }
    });
  };

  const ServiceCounter = ({ icon, label, sublabel, price, value, setValue }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '16px',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        flexShrink: 0,
        width: '56px',
        height: '56px'
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'white' }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{ color: 'white', fontSize: '16px', fontWeight: 600, lineHeight: '1.5' }}>{label}</p>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', fontWeight: 500 }}>+£{price} each</p>
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
          onClick={() => setValue(Math.max(0, value - 1))}
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
            color: 'white',
            fontSize: '20px',
            fontWeight: 500,
            transition: 'all 0.2s'
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
        <span style={{ fontSize: '16px', fontWeight: 700, width: '16px', textAlign: 'center' }}>{value}</span>
        <button
          onClick={() => setValue(value + 1)}
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
            color: 'white',
            fontSize: '20px',
            fontWeight: 500,
            transition: 'all 0.2s'
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
  );

  return (
    <>
      <SEO 
        title="Master Carpentry - Book Your Carpentry Service"
        description="Professional carpentry services with AI-powered pricing. Custom furniture, wardrobes, shelves, and door installations available."
      />
      
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      
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
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
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
              Carpentry Service
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
              <span className="material-symbols-outlined" style={{ color: '#f06c00', fontSize: '14px' }}>verified</span>
              <span style={{ color: '#f06c00', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Materials & Equipment included
              </span>
            </div>
          </div>

          {/* Property Type */}
          <div style={{ padding: '32px 16px 0' }}>
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
                  border: propertyType === 'flat' ? '2px solid #ED4B00' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}>
                  <span className="material-symbols-outlined" style={{
                    fontSize: '36px',
                    color: propertyType === 'flat' ? '#ED4B00' : 'rgba(255, 255, 255, 0.6)'
                  }}>apartment</span>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Flat</span>
                </div>
              </label>
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
                  border: propertyType === 'house' ? '2px solid #ED4B00' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}>
                  <span className="material-symbols-outlined" style={{
                    fontSize: '36px',
                    color: propertyType === 'house' ? '#ED4B00' : 'rgba(255, 255, 255, 0.6)'
                  }}>home</span>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>House</span>
                </div>
              </label>
            </div>
          </div>

          {/* Carpentry Quality */}
          <div style={{ padding: '40px 16px 0' }}>
            <h3 style={{
              color: 'white',
              fontSize: '20px',
              fontWeight: 700,
              lineHeight: '1.25',
              letterSpacing: '-0.02em',
              marginBottom: '16px'
            }}>
              Carpentry Quality
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Basic */}
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="carpentry_quality"
                  value="basic"
                  checked={carpentryQuality === 'basic'}
                  onChange={(e) => setCarpentryQuality(e.target.value)}
                  style={{ display: 'none' }}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '16px',
                  background: carpentryQuality === 'basic' ? 'rgba(237, 75, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                  border: carpentryQuality === 'basic' ? '2px solid #ED4B00' : '2px solid transparent',
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
                    background: carpentryQuality === 'basic' ? 'rgba(237, 75, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>handyman</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>Basic Build</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', lineHeight: '1.4' }}>
                      Functional assembly, ideal for basic installations.
                    </span>
                  </div>
                </div>
              </label>

              {/* Standard */}
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="carpentry_quality"
                  value="standard"
                  checked={carpentryQuality === 'standard'}
                  onChange={(e) => setCarpentryQuality(e.target.value)}
                  style={{ display: 'none' }}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '16px',
                  background: carpentryQuality === 'standard' ? 'rgba(237, 75, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                  border: carpentryQuality === 'standard' ? '2px solid #ED4B00' : '2px solid transparent',
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
                    background: carpentryQuality === 'standard' ? 'rgba(237, 75, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>construction</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>High Standard</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', lineHeight: '1.4' }}>
                      Quality craftsmanship with attention to detail and finish.
                    </span>
                  </div>
                </div>
              </label>

              {/* Premium */}
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="carpentry_quality"
                  value="premium"
                  checked={carpentryQuality === 'premium'}
                  onChange={(e) => setCarpentryQuality(e.target.value)}
                  style={{ display: 'none' }}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '16px',
                  background: carpentryQuality === 'premium' ? 'rgba(237, 75, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                  border: carpentryQuality === 'premium' ? '2px solid #ED4B00' : '2px solid transparent',
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
                    background: carpentryQuality === 'premium' ? 'rgba(237, 75, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>workspace_premium</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '18px' }}>Master Craftsman</span>
                      <span style={{
                        background: '#ED4B00',
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em'
                      }}>Luxury</span>
                    </div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', lineHeight: '1.4' }}>
                      Bespoke craftsmanship, premium materials, and flawless execution.
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Configure Service */}
          <div style={{ padding: '40px 16px 0' }}>
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
              <ServiceCounter
                icon="shelves"
                label="Shelves"
                price={itemPrices.shelves}
                value={shelves}
                setValue={setShelves}
              />
              <ServiceCounter
                icon="dresser"
                label="Wardrobes / Cupboards"
                price={itemPrices.wardrobes}
                value={wardrobes}
                setValue={setWardrobes}
              />
              <ServiceCounter
                icon="door_front"
                label="Doors Installation"
                price={itemPrices.doors}
                value={doors}
                setValue={setDoors}
              />
              <ServiceCounter
                icon="table_restaurant"
                label="Custom Furniture"
                price={itemPrices.customFurniture}
                value={customFurniture}
                setValue={setCustomFurniture}
              />
            </div>
          </div>

          {/* Extra Requests */}
          <div style={{ padding: '40px 16px' }}>
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
                placeholder="Specific wood types, dimensions, special finishes, or time constraints..."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                  color: 'white',
                  minHeight: '120px',
                  transition: 'all 0.2s',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: '14px'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ED4B00'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
          </div>

          {/* AI Market Analysis Card */}
          <div style={{ padding: '0 16px 24px' }}>
            <div style={{
              background: '#020034',
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
                <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '20px', fontVariationSettings: '"FILL" 1' }}>
                  auto_awesome
                </span>
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
                fontSize: '28px',
                fontWeight: 800
              }}>
                £{estimatedPrice.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleContinue}
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
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ED4B00';
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
        
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        
        html, body {
          overflow-x: hidden;
          max-width: 100vw;
        }
      `}</style>
    </>
  );
};

export default B2CCarpentryBooking;
