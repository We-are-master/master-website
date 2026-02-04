import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

const HOURLY_RATE = 60;
const HALF_DAY_PRICE = 210;
const FULL_DAY_PRICE = 400;
const HALF_DAY_HOURS = 4;
const FULL_DAY_HOURS = 8;

const B2CHandymanBooking = () => {
  const navigate = useNavigate();
  const [trade, setTrade] = useState('Handyman');
  const [selectedPlan, setSelectedPlan] = useState('hourly'); // 'hourly' | 'halfday' | 'fullday'
  const [hours, setHours] = useState(4);
  const [totalPrice, setTotalPrice] = useState(HOURLY_RATE * 4);

  // Load Material Symbols font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (selectedPlan === 'hourly') {
      setTotalPrice(hours * HOURLY_RATE);
    } else if (selectedPlan === 'halfday') {
      setTotalPrice(HALF_DAY_PRICE);
    } else {
      setTotalPrice(FULL_DAY_PRICE);
    }
  }, [selectedPlan, hours]);

  const getServiceLabel = () => {
    if (selectedPlan === 'hourly') return `Handyman • Hourly (${hours}h)`;
    if (selectedPlan === 'halfday') return 'Handyman • Half Day (4h)';
    return 'Handyman • Full Day (8h)';
  };

  const handleContinue = () => {
    navigate('/checkout', {
      state: {
        service: {
          type: 'handyman',
          title: getServiceLabel(),
          trade,
          plan: selectedPlan,
          hours: selectedPlan === 'hourly' ? hours : selectedPlan === 'halfday' ? HALF_DAY_HOURS : FULL_DAY_HOURS,
          price: totalPrice,
          category: 'handyman'
        }
      }
    });
  };

  const hourlyPrice = hours * HOURLY_RATE;

  return (
    <>
      <SEO
        title="Master Handyman - Configure Your Service"
        description="Book a handyman by the hour or choose a half-day or full-day session. Flexible pricing with AI-powered market analysis."
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
            justifyContent: 'space-between',
            maxWidth: '512px',
            margin: '0 auto'
          }}>
            <div
              onClick={() => navigate(-1)}
              style={{
                color: 'white',
                display: 'flex',
                width: '48px',
                height: '48px',
                flexShrink: 0,
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span className="material-symbols-outlined">arrow_back_ios</span>
            </div>
            <h2 style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: 700,
              lineHeight: '1.25',
              letterSpacing: '-0.015em',
              flex: 1,
              textAlign: 'center'
            }}>
              Configure Service
            </h2>
            <button
              type="button"
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined">help</span>
            </button>
          </div>
        </header>

        {/* Trade selection */}
        <div style={{ padding: '12px 16px' }}>
          <div style={{
            display: 'flex',
            height: '48px',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            background: '#110f44',
            padding: '4px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {['Handyman', 'Plumbing', 'Electrician'].map((t) => (
              <label
                key={t}
                style={{
                  flex: 1,
                  cursor: t === 'Handyman' ? 'pointer' : 'default',
                  display: 'flex',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  background: trade === t ? '#ED4B00' : 'transparent',
                  color: trade === t ? 'white' : 'rgba(156, 163, 175, 1)',
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
                  onChange={() => t === 'Handyman' && setTrade(t)}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Select Duration */}
        <div style={{ padding: '16px 16px 0' }}>
          <h3 style={{
            color: 'white',
            fontSize: '20px',
            fontWeight: 700,
            lineHeight: '1.25',
            letterSpacing: '-0.015em'
          }}>
            Select Duration
          </h3>
          <p style={{ color: 'rgba(156, 163, 175, 1)', fontSize: '14px', marginTop: '4px' }}>
            Choose the plan that fits your project size
          </p>
        </div>

        <main style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '140px',
          maxWidth: '512px',
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
            {/* Hourly Rate - selected by default */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPlan('hourly')}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan('hourly')}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'space-between',
                gap: '16px',
                borderRadius: '12px',
                background: '#110f44',
                padding: '20px',
                border: selectedPlan === 'hourly' ? '2px solid #ED4B00' : '2px solid transparent',
                boxShadow: selectedPlan === 'hourly' ? '0 0 0 1px #ED4B00' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ flex: '2 2 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ color: 'white', fontSize: '18px', fontWeight: 700, lineHeight: '1.25' }}>Hourly Rate</p>
                    <span style={{
                      background: 'rgba(237, 75, 0, 0.2)',
                      color: '#ED4B00',
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '9999px'
                    }}>
                      Flexible
                    </span>
                  </div>
                  <p style={{ color: 'rgba(156, 163, 175, 1)', fontSize: '14px' }}>£{HOURLY_RATE} per hour • Pay as you go</p>
                </div>
                <div style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  width: 'fit-content',
                  borderRadius: '8px',
                  padding: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setHours((h) => Math.max(1, h - 1)); }}
                    style={{
                      display: 'flex',
                      width: '40px',
                      height: '40px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>remove</span>
                  </button>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '18px', width: '24px', textAlign: 'center' }}>{hours}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setHours((h) => h + 1); }}
                    style={{
                      display: 'flex',
                      width: '40px',
                      height: '40px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      background: '#ED4B00',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                  </button>
                </div>
              </div>
              <div style={{
                width: '128px',
                height: '128px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBV1EkSpFqLcJBK3_2QrjxwSlf8GJybjmu6nD3aL5C26mHxnQ-7CgeHwmLp_zx6lR07xQp2QuqKchq7v2CMxjEkfmyWrYF5-ZNL2L3QwRe9iwWGRWu4O9Dq5bDHh85DMERUxar7lHrg05fqFm2xZT-lOgY93GFZWbe2lgf0g-rXoOHrpKC11iAK03NfRtJf6FOj2Y2XsbYHFsgiRUQaTyfq6zYALboiMFhkeQk5A_AMfcHceaWuR9ZZsY7HHHdgIhsXywmhKrC3hpk") center/cover no-repeat'
              }} />
            </div>

            {/* Half Day */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPlan('halfday')}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan('halfday')}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'space-between',
                gap: '16px',
                borderRadius: '12px',
                background: '#110f44',
                padding: '20px',
                border: selectedPlan === 'halfday' ? '2px solid #ED4B00' : '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '16px',
                background: '#ED4B00',
                color: 'white',
                fontSize: '10px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '9999px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px', fontVariationSettings: '"FILL" 1' }}>star</span>
                BEST VALUE
              </div>
              <div style={{ flex: '2 2 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ color: 'rgba(156, 163, 175, 1)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Save 15%</p>
                  <p style={{ color: 'white', fontSize: '18px', fontWeight: 700, lineHeight: '1.25' }}>Half Day Session</p>
                  <p style={{ color: 'rgba(156, 163, 175, 1)', fontSize: '14px' }}>4 Hours • £{HALF_DAY_PRICE} Fixed Price</p>
                </div>
                <p style={{ color: '#ED4B00', fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>Recommended for mid-size jobs</p>
              </div>
              <div style={{
                width: '128px',
                height: '128px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDrKQYHp8V8moYdPV6lomtpMPyLKv1mnewmxx48LTqt8UwE2gOS9huK4Oexl_hs28n6IeV3yMk4lCtNCCt5lNTihTjXbMmEY9KCmAIvZr6CDQIhhpYa26h-I5pfdeD3HsYDGtn2dkYGVBu8mC_imoKpe6xoWLMKo8sgdkH8M0uzCrYtPoTFhSXk32jdr_2XJv6iUUojjkgVEevUXj-jN8I1U_TICAyzpKW6_J8G9AF4UCn0L57fQpN60N6EB7WmTGxvUL1rejmMMeQ") center/cover no-repeat'
              }} />
            </div>

            {/* Full Day */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPlan('fullday')}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan('fullday')}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'space-between',
                gap: '16px',
                borderRadius: '12px',
                background: '#110f44',
                padding: '20px',
                border: selectedPlan === 'fullday' ? '2px solid #ED4B00' : '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '16px',
                background: '#ED4B00',
                color: 'white',
                fontSize: '10px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '9999px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>trending_down</span>
                LOWEST HOURLY
              </div>
              <div style={{ flex: '2 2 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ color: 'rgba(156, 163, 175, 1)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Save 25%</p>
                  <p style={{ color: 'white', fontSize: '18px', fontWeight: 700, lineHeight: '1.25' }}>Full Day Session</p>
                  <p style={{ color: 'rgba(156, 163, 175, 1)', fontSize: '14px' }}>8 Hours • £{FULL_DAY_PRICE} Fixed Price</p>
                </div>
                <p style={{ color: '#ED4B00', fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>Perfect for complete rooms</p>
              </div>
              <div style={{
                width: '128px',
                height: '128px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                background: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCYtbPTn-YEfbnRDucViC2MaiS87O6ZYhgSIRL1XEpwAVAVLp2NHfb-9ON5OL0d43OX7LW4V_Aiedlv6AnIkPnBROneLykpF5m_cleXuLepAgkIp1W0acFsCyqdrmsGOxzA5SUyGDnPhlu1TVDppPhCVLmcJPgBQr_1_V43pmSVqbQEaCRlKCNarEqh0Tu4cCCTGmzg66uA1NoeO1hsff1w9MQK-mi7FCs0ba1B2KRkvsw3ZsX8RqhDSNnJ34oE4G6YJ5_XoDWhO8A") center/cover no-repeat'
              }} />
            </div>
          </div>

          {/* Materials not included */}
          <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(107, 114, 128, 1)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
              <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Materials not included</p>
            </div>
            <p style={{ color: 'rgba(75, 85, 99, 1)', fontSize: '10px', textAlign: 'center', maxWidth: '280px' }}>
              Your technician will provide a separate quote for any required hardware or materials used during the service.
            </p>
          </div>

          {/* AI Market Analysis */}
          <div style={{ padding: '0 16px 24px' }}>
            <div style={{
              background: 'linear-gradient(180deg, #020034 0%, #020030 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                background: 'rgba(237, 75, 0, 0.1)',
                padding: '8px',
                borderRadius: '8px',
                flexShrink: 0
              }}>
                <span className="material-symbols-outlined" style={{ color: '#ED4B00', fontSize: '20px', fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <p style={{ color: 'white', fontSize: '14px', fontWeight: 700, lineHeight: '1.25' }}>AI MARKET ANALYSIS</p>
                <p style={{ color: 'rgba(209, 213, 219, 1)', fontSize: '12px', lineHeight: '1.5' }}>
                  We have analyzed the local market and secured the best available price for you using Master AI.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Fixed bottom CTA */}
        <footer style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(2, 0, 52, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '20px 20px 32px'
        }}>
          <div style={{ maxWidth: '512px', margin: '0 auto' }}>
            <button
              type="button"
              onClick={handleContinue}
              style={{
                width: '100%',
                height: '56px',
                background: '#ED4B00',
                color: 'white',
                fontWeight: 700,
                fontSize: '18px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(237, 75, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(237, 75, 0, 0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ED4B00'}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Continue • £{totalPrice.toFixed(2)}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </footer>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 0; background: transparent; }
        html, body { overflow-x: hidden; max-width: 100vw; }
      `}</style>
    </>
  );
};

export default B2CHandymanBooking;
