import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SEO } from '../components/SEO';

const B2CCleaningBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedService, setSelectedService] = useState('end-of-tenancy');
  const [propertyType, setPropertyType] = useState('flat');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState(new Set(['oven']));
  const [estimatedPrice, setEstimatedPrice] = useState(231);
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
      document.head.removeChild(link);
    };
  }, []);

  const services = [
    { id: 'end-of-tenancy', label: 'End of Tenancy', badge: 'BEST FOR MOVING OUT' },
    { id: 'deep-clean', label: 'Deep Clean' },
    { id: 'after-builders', label: 'After Builders' }
  ];

  const addons = [
    { id: 'oven', icon: 'oven_gen', label: 'Oven Clean', price: 15 },
    { id: 'fridge', icon: 'kitchen', label: 'Inside Fridge', price: 12 },
    { id: 'freezer', icon: 'ac_unit', label: 'Inside Freezer', price: 12 }
  ];

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

  const calculatePrice = () => {
    let basePrice = 200; // Base price
    
    // Adjust base price by service type
    if (selectedService === 'end-of-tenancy') {
      basePrice = 191.67; // Base for end of tenancy
    } else if (selectedService === 'deep-clean') {
      basePrice = 166.67; // Base for deep clean
    } else if (selectedService === 'after-builders') {
      basePrice = 195.00; // Base for after builders
    }
    
    // Property type multiplier
    if (propertyType === 'house') {
      basePrice *= 1.3; // Houses are typically more expensive
    }
    
    // Add bedrooms and bathrooms
    basePrice += bedrooms * 15;
    basePrice += bathrooms * 20;
    
    // Add selected addons
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) {
        basePrice += addon.price;
      }
    });
    
    setEstimatedPrice(Math.round(basePrice));
    return Math.round(basePrice);
  };

  useEffect(() => {
    calculatePrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bedrooms, bathrooms, selectedAddons, selectedService, propertyType]);

  const handleContinue = () => {
    navigate('/checkout', {
      state: {
        service: {
          type: selectedService,
          propertyType,
          bedrooms,
          bathrooms,
          addons: Array.from(selectedAddons),
          price: estimatedPrice
        }
      }
    });
  };

  return (
    <>
      <SEO 
        title="Master Cleaning Pro - Book Your Cleaning Service"
        description="Professional cleaning services with AI-powered pricing. End of tenancy, deep clean, and after builders cleaning available."
      />
      
      {/* Material Symbols CSS */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      <div className="dark" style={{
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
          background: 'rgba(2, 0, 52, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          width: '100%'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: isMobile ? '16px 20px' : '20px 40px', 
            justifyContent: 'space-between',
            maxWidth: isMobile ? '100%' : '1200px',
            margin: '0 auto',
            width: '100%'
          }}>
            <div style={{ display: 'flex', width: '40px', height: '40px', flexShrink: 0, alignItems: 'center', justifyContent: 'flex-start' }}>
              <span 
                className="material-symbols-outlined" 
                style={{ cursor: 'pointer', fontSize: '24px' }}
                onClick={() => navigate(-1)}
                onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                arrow_back_ios
              </span>
            </div>
            <h1 style={{ 
              color: 'white', 
              fontSize: isMobile ? '18px' : '20px', 
              fontWeight: 800, 
              lineHeight: '1.25', 
              letterSpacing: '-0.02em',
              flex: 1, 
              textAlign: 'center',
              fontFamily: "'Manrope', sans-serif"
            }}>
              Master Cleaning Pro
            </h1>
            <div style={{ width: '40px', height: '40px', flexShrink: 0 }}></div>
          </div>
          
          {/* Service Tabs */}
          <div style={{ 
            padding: isMobile ? '0 20px' : '0 40px',
            paddingTop: '32px', 
            paddingBottom: '16px', 
            overflow: 'visible',
            maxWidth: isMobile ? '100%' : '1200px',
            margin: '0 auto'
          }}>
            <div style={{ 
              display: 'flex', 
              overflowX: isMobile ? 'auto' : 'visible',
              justifyContent: isMobile ? 'flex-start' : 'center',
              scrollSnapType: isMobile ? 'x mandatory' : 'none',
              gap: '12px',
              paddingBottom: '8px',
              marginTop: '-16px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }} className="hide-scrollbar">
              {services.map((service) => (
                <div key={service.id} style={{ 
                  scrollSnapAlign: isMobile ? 'center' : 'none', 
                  flexShrink: 0, 
                  width: isMobile ? '140px' : 'auto',
                  minWidth: isMobile ? '140px' : '160px',
                  paddingTop: '16px' 
                }}>
                  <button
                    onClick={() => setSelectedService(service.id)}
                    style={{
                      width: '100%',
                      padding: '12px 8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      position: 'relative',
                      background: selectedService === service.id 
                        ? '#ED4B00' 
                        : 'rgba(255, 255, 255, 0.05)',
                      color: selectedService === service.id ? 'white' : 'rgba(255, 255, 255, 0.6)',
                      border: selectedService === service.id ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxSizing: 'border-box',
                      boxShadow: selectedService === service.id ? '0 10px 15px -3px rgba(237, 75, 0, 0.2)' : 'none',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                  >
                    {service.label}
                    {service.badge && selectedService === service.id && (
                      <span style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'white',
                        color: '#ED4B00',
                        fontSize: '7px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        whiteSpace: 'nowrap',
                        border: 'none',
                        fontWeight: 900,
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        letterSpacing: '0.05em'
                      }}>
                        {service.badge}
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            padding: isMobile ? '0 20px 16px' : '0 40px 16px',
            maxWidth: isMobile ? '100%' : '1200px',
            margin: '0 auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Configuration
              </p>
              <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Step 1 of 3
              </p>
            </div>
            <div style={{ borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.1)', height: '6px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                borderRadius: '9999px', 
                background: '#ED4B00',
                width: '33%',
                transition: 'width 0.3s'
              }}></div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ 
          flex: 1, 
          padding: isMobile ? '24px 20px' : '32px 40px',
          paddingBottom: isMobile ? '320px' : '24px',
          display: 'flex', 
          flexDirection: 'column', 
          gap: isMobile ? '32px' : '40px',
          maxWidth: isMobile ? '100%' : '1200px',
          margin: '0 auto',
          width: '100%',
          position: 'relative'
        }}>
          {/* Premium Equipment Badge */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '8px 20px'
            }}>
              <span className="material-symbols-outlined" style={{ color: '#ED4B00', fontSize: '16px' }}>
                verified_user
              </span>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Premium Equipment Included
              </p>
            </div>
          </div>

          {/* Property Type Section */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
              <h3 style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                1. Property Type
              </h3>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(2, minmax(200px, 1fr))',
              gap: isMobile ? '16px' : '24px',
              maxWidth: isMobile ? '100%' : '600px'
            }}>
              <button
                onClick={() => setPropertyType('flat')}
                style={{
                  background: propertyType === 'flat' 
                    ? 'rgba(237, 75, 0, 0.1)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: propertyType === 'flat' 
                    ? '2px solid #ED4B00' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxSizing: 'border-box',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: propertyType === 'flat' ? '0 20px 25px -5px rgba(237, 75, 0, 0.1)' : 'none',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (propertyType !== 'flat') {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (propertyType !== 'flat') {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                <span className="material-symbols-outlined" style={{ 
                  fontSize: '48px', 
                  color: propertyType === 'flat' ? '#ED4B00' : 'rgba(255, 255, 255, 0.4)'
                }}>
                  apartment
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>
                  Flat
                </span>
              </button>
              
              <button
                onClick={() => setPropertyType('house')}
                style={{
                  background: propertyType === 'house' 
                    ? 'rgba(237, 75, 0, 0.1)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: propertyType === 'house' 
                    ? '2px solid #ED4B00' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxSizing: 'border-box',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: propertyType === 'house' ? '0 20px 25px -5px rgba(237, 75, 0, 0.1)' : 'none',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (propertyType !== 'house') {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (propertyType !== 'house') {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                <span className="material-symbols-outlined" style={{ 
                  fontSize: '48px', 
                  color: propertyType === 'house' ? '#ED4B00' : 'rgba(255, 255, 255, 0.4)'
                }}>
                  home
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>
                  House
                </span>
              </button>
            </div>
          </section>

          {/* Service Details Section */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
              <h3 style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                2. Service Details
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Bedrooms */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <span className="material-symbols-outlined" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '24px' }}>
                      bed
                    </span>
                  </div>
                  <div>
                    <p style={{ color: 'white', fontSize: '16px', fontWeight: 700 }}>Bedrooms</p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '-0.02em' }}>
                      Standard cleaning
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={() => setBedrooms(Math.max(0, bedrooms - 1))}
                    className="stepper-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '44px',
                      minHeight: '44px',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(0.9)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>remove</span>
                  </button>
                  <span style={{ fontSize: '20px', fontWeight: 900, width: '20px', textAlign: 'center' }}>
                    {bedrooms}
                  </span>
                  <button
                    onClick={() => setBedrooms(bedrooms + 1)}
                    className="stepper-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '44px',
                      minHeight: '44px',
                      borderRadius: '9999px',
                      background: '#ED4B00',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(0.9)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                  </button>
                </div>
              </div>

              {/* Bathrooms */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <span className="material-symbols-outlined" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '24px' }}>
                      bathtub
                    </span>
                  </div>
                  <div>
                    <p style={{ color: 'white', fontSize: '16px', fontWeight: 700 }}>Bathrooms</p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '-0.02em' }}>
                      Deep sanitization
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={() => setBathrooms(Math.max(0, bathrooms - 1))}
                    className="stepper-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '44px',
                      minHeight: '44px',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(0.9)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>remove</span>
                  </button>
                  <span style={{ fontSize: '20px', fontWeight: 900, width: '20px', textAlign: 'center' }}>
                    {bathrooms}
                  </span>
                  <button
                    onClick={() => setBathrooms(bathrooms + 1)}
                    className="stepper-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '44px',
                      minHeight: '44px',
                      borderRadius: '9999px',
                      background: '#ED4B00',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(0.9)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Add-ons Section */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
              <h3 style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                3. Enhance Your Visit
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 4px' }}>
                Kitchen Add-ons
              </p>
              <div style={{ 
                display: 'flex', 
                overflowX: isMobile ? 'auto' : 'visible',
                justifyContent: isMobile ? 'flex-start' : 'flex-start',
                flexWrap: isMobile ? 'nowrap' : 'wrap',
                gap: '12px',
                padding: '0 4px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }} className="hide-scrollbar">
                {addons.map((addon) => {
                  const isSelected = selectedAddons.has(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      style={{
                        background: isSelected 
                          ? 'rgba(237, 75, 0, 0.1)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: isSelected 
                          ? '2px solid #ED4B00' 
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        boxSizing: 'border-box',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: isMobile ? '120px' : '140px',
                        flex: isMobile ? '0 0 auto' : '0 0 calc(33.333% - 8px)',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                    >
                      <span 
                        className="material-symbols-outlined" 
                        style={{ 
                          fontSize: '24px', 
                          color: isSelected ? '#ED4B00' : 'rgba(255, 255, 255, 0.4)',
                          fontVariationSettings: isSelected ? '"FILL" 1' : '"FILL" 0'
                        }}
                      >
                        {addon.icon}
                      </span>
                      <p style={{ 
                        fontSize: '12px', 
                        fontWeight: 700, 
                        lineHeight: '1.25',
                        color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.7)'
                      }}>
                        {addon.label.split(' ').map((word, i) => (
                          <React.Fragment key={i}>
                            {word}
                            {i < addon.label.split(' ').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </p>
                      <p style={{ 
                        fontSize: '10px', 
                        fontWeight: 900, 
                        color: isSelected ? '#ED4B00' : 'rgba(255, 255, 255, 0.4)'
                      }}>
                        +£{addon.price}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Guarantee Card */}
          <div style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '9999px',
              background: 'rgba(237, 75, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span className="material-symbols-outlined" style={{ color: '#ED4B00', fontSize: '20px' }}>
                security
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ color: 'white', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                Cleaning Standards Guarantee
              </p>
              <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', lineHeight: '1.5' }}>
                Professional-grade equipment and 48-hour satisfaction guarantee. We ensure you pass your inventory check.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          position: isMobile ? 'fixed' : 'sticky',
          bottom: isMobile ? 0 : 'auto',
          left: 0,
          right: 0,
          background: 'rgba(2, 0, 52, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: isMobile ? '16px 20px' : '24px 40px',
          paddingBottom: isMobile ? `calc(16px + env(safe-area-inset-bottom, 0px))` : '24px',
          zIndex: 60,
          marginTop: isMobile ? 0 : 'auto',
          width: '100%'
        }}>
          <div style={{ 
            maxWidth: isMobile ? '448px' : '1200px', 
            margin: '0 auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '14px',
            width: '100%'
          }}>
            {/* AI Analysis Card */}
            <div style={{
              background: '#020034',
              border: '1px solid rgba(237, 75, 0, 0.4)',
              borderRadius: '16px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                flexShrink: 0,
                background: 'rgba(237, 75, 0, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span className="material-symbols-outlined" style={{ color: '#ED4B00', fontSize: '20px', fontVariationSettings: '"FILL" 1' }}>
                  auto_awesome
                </span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <p style={{ color: 'white', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  AI Market Analysis
                </p>
                <p style={{ color: 'white', fontSize: '11px', lineHeight: '1.3', fontWeight: 500, opacity: 1 }}>
                  We have analyzed the local market and secured the best available price for you using Master AI.
                </p>
              </div>
            </div>

            {/* Price Display */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '0 4px',
              flexWrap: isMobile ? 'nowrap' : 'wrap',
              gap: isMobile ? '0' : '16px',
              width: '100%'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: isMobile ? '9px' : '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Estimated Quote
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <span style={{ fontSize: isMobile ? '30px' : '36px', fontWeight: 900, color: 'white', letterSpacing: '-0.05em' }}>
                    £{estimatedPrice}
                  </span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: isMobile ? '12px' : '14px', fontWeight: 700 }}>.00</span>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: isMobile ? 'flex-end' : 'flex-end',
                gap: '6px',
                flexShrink: 0
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ED4B00',
                  color: 'white',
                  padding: isMobile ? '6px 12px' : '8px 14px',
                  borderRadius: '9999px',
                  boxShadow: '0 10px 15px -3px rgba(237, 75, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  whiteSpace: 'nowrap'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: isMobile ? '12px' : '14px', fontVariationSettings: '"FILL" 1' }}>
                    verified
                  </span>
                  <span style={{ fontSize: isMobile ? '9px' : '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    AI PRICE MATCH
                  </span>
                </div>
                <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: isMobile ? '9px' : '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>
                  VAT Inclusive
                </span>
              </div>
            </div>

            {/* Continue Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleContinue}
                style={{
                  width: '100%',
                  background: '#ED4B00',
                  color: 'white',
                  fontWeight: 800,
                  height: '56px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  boxShadow: '0 20px 25px -5px rgba(237, 75, 0, 0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#ff5a00';
                  e.target.style.transform = 'scale(0.98)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#ED4B00';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <span>Continue to Booking</span>
                <span className="material-symbols-outlined" style={{ fontWeight: 700 }}>arrow_forward</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', opacity: 0.4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>info</span>
                <p style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Cleaning materials not included by default
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .stepper-btn:active {
          transform: scale(0.9);
        }
        
        /* Prevent horizontal scroll */
        html, body {
          overflow-x: hidden;
          max-width: 100vw;
        }
        
        @media (min-width: 768px) {
          /* Desktop adjustments */
          .cleaning-booking-container {
            max-width: 1200px;
            margin: 0 auto;
          }
        }
      `}</style>
    </>
  );
};

export default B2CCleaningBooking;
