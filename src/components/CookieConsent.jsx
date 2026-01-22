import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield, Settings, Check } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Small delay to show banner after page load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setPreferences(allAccepted);
    setShowBanner(false);
    
    // Enable tracking scripts here if needed
    enableAnalytics();
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setPreferences(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
    setShowSettings(false);
    
    if (preferences.analytics) {
      enableAnalytics();
    }
  };

  const enableAnalytics = () => {
    // Google Analytics, Facebook Pixel, etc. would be enabled here
    // Example: window.gtag && window.gtag('consent', 'update', { analytics_storage: 'granted' });
  };

  const cookieTypes = [
    {
      id: 'necessary',
      name: 'Strictly Necessary',
      description: 'Essential for the website to function. Cannot be disabled.',
      required: true
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      description: 'Enable personalised features and remember your preferences.'
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.'
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used to deliver relevant ads and track campaign performance.'
    }
  ];

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          opacity: showBanner ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
        onClick={() => {}} // Prevent clicking through
      />

      {/* Cookie Banner */}
      <div
        style={{
          position: 'fixed',
          bottom: showSettings ? '50%' : '0',
          left: '50%',
          transform: showSettings ? 'translate(-50%, 50%)' : 'translateX(-50%)',
          width: showSettings ? '90%' : '95%',
          maxWidth: showSettings ? '600px' : '1200px',
          backgroundColor: 'white',
          borderRadius: showSettings ? '20px' : '20px 20px 0 0',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.15)',
          zIndex: 9999,
          overflow: 'hidden',
          animation: 'slideUp 0.5s ease-out'
        }}
      >
        <style>{`
          @keyframes slideUp {
            from {
              transform: ${showSettings ? 'translate(-50%, 60%)' : 'translateX(-50%) translateY(100%)'};
              opacity: 0;
            }
            to {
              transform: ${showSettings ? 'translate(-50%, 50%)' : 'translateX(-50%) translateY(0)'};
              opacity: 1;
            }
          }
        `}</style>

        {!showSettings ? (
          /* Main Banner */
          <div style={{ padding: '1.5rem 2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}>
              {/* Icon & Text */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                flex: 1,
                minWidth: '300px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#f0f9ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Cookie size={24} style={{ color: '#E94A02' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '0.5rem'
                  }}>
                    We value your privacy 🍪
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    We use cookies to enhance your browsing experience, serve personalised ads or content, 
                    and analyse our traffic. By clicking "Accept All", you consent to our use of cookies. 
                    Read our{' '}
                    <a 
                      href="/privacy-policy" 
                      style={{ color: '#E94A02', textDecoration: 'underline' }}
                    >
                      Privacy Policy
                    </a>
                    {' '}and{' '}
                    <a 
                      href="/cookie-policy" 
                      style={{ color: '#E94A02', textDecoration: 'underline' }}
                    >
                      Cookie Policy
                    </a>.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setShowSettings(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    backgroundColor: 'transparent',
                    color: '#374151',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#9ca3af';
                    e.target.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <Settings size={16} />
                  Customise
                </button>
                <button
                  onClick={handleRejectAll}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: 'transparent',
                    color: '#374151',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#9ca3af';
                    e.target.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptAll}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#E94A02',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#d13d00';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#E94A02';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <Check size={16} />
                  Accept All
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Settings Panel */
          <div>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Shield size={24} style={{ color: '#E94A02' }} />
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: '#111827',
                  margin: 0
                }}>
                  Cookie Preferences
                </h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#f3f4f6',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              >
                <X size={18} style={{ color: '#6b7280' }} />
              </button>
            </div>

            {/* Cookie Options */}
            <div style={{
              padding: '1rem 1.5rem',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {cookieTypes.map((cookie) => (
                <div
                  key={cookie.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ flex: 1, marginRight: '1rem' }}>
                    <h4 style={{
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.25rem'
                    }}>
                      {cookie.name}
                      {cookie.required && (
                        <span style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          fontWeight: '400'
                        }}>
                          (Required)
                        </span>
                      )}
                    </h4>
                    <p style={{
                      fontSize: '0.85rem',
                      color: '#6b7280',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      {cookie.description}
                    </p>
                  </div>
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '48px',
                    height: '26px',
                    flexShrink: 0
                  }}>
                    <input
                      type="checkbox"
                      checked={preferences[cookie.id]}
                      disabled={cookie.required}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        [cookie.id]: e.target.checked
                      })}
                      style={{
                        opacity: 0,
                        width: 0,
                        height: 0
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: cookie.required ? 'not-allowed' : 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: preferences[cookie.id] ? '#E94A02' : '#d1d5db',
                      borderRadius: '26px',
                      transition: 'all 0.3s ease',
                      opacity: cookie.required ? 0.7 : 1
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '20px',
                        width: '20px',
                        left: preferences[cookie.id] ? '25px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}></span>
                    </span>
                  </label>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <button
                onClick={handleRejectAll}
                style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: 'transparent',
                  color: '#374151',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#9ca3af';
                  e.target.style.backgroundColor = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Reject All
              </button>
              <button
                onClick={handleSavePreferences}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#E94A02',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#d13d00';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#E94A02';
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CookieConsent;
