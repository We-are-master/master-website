import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowUpRight, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

const HeaderB2B = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [jobsCount] = useState(32); // This could be fetched from API

  // Country flags data
  const countries = [
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' }
  ];

  return (
    <>
      <header style={{
        backgroundColor: '#020034',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <div className="container" style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 0',
            gap: '2rem'
          }}>
            {/* Logo */}
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              flexShrink: 0
            }}>
              <img 
                src={logo} 
                alt="Master" 
                style={{
                  height: '40px',
                  width: 'auto',
                  flexShrink: 0
                }}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              flex: 1,
              justifyContent: 'center'
            }} className="hidden md:flex">
              <Link to="/" style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'opacity 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.7'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Home
              </Link>
              
              <Link to="/b2b" style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'opacity 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.7'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Master for Business
              </Link>

              {/* Services Dropdown */}
              <div style={{ position: 'relative' }}
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <button style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: 0,
                  whiteSpace: 'nowrap'
                }}>
                  Services
                  <ChevronDown size={16} style={{ 
                    transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }} />
                </button>
                {servicesOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    padding: '0.75rem 0',
                    minWidth: '200px',
                    zIndex: 1001
                  }}>
                    {['TV Mounting', 'Handyman Services', 'Flatpack Assembly', 'Light Fitting', 'Cleaning Services', 'Plumbing', 'Electrical', 'Carpentry'].map((service, index) => (
                      <Link
                        key={index}
                        to="/booking"
                        state={{ service }}
                        style={{
                          display: 'block',
                          padding: '0.75rem 1.25rem',
                          color: '#111827',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        {service}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Become a Master Partner Dropdown */}
              <div style={{ position: 'relative' }}
                onMouseEnter={() => setPartnerOpen(true)}
                onMouseLeave={() => setPartnerOpen(false)}
              >
                <button style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: 0,
                  whiteSpace: 'nowrap'
                }}>
                  Become a Master Partner
                  <ChevronDown size={16} style={{ 
                    transform: partnerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }} />
                </button>
                {partnerOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    padding: '0.75rem 0',
                    minWidth: '220px',
                    zIndex: 1001
                  }}>
                    {['Join as Pro', 'Benefits', 'Requirements', 'Apply Now'].map((item, index) => (
                      <a
                        key={index}
                        href="#"
                        style={{
                          display: 'block',
                          padding: '0.75rem 1.25rem',
                          color: '#111827',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/about" style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'opacity 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.7'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                About Us
              </Link>

              <Link to="/contact" style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: '500',
                transition: 'opacity 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.7'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Contact Us
              </Link>
            </nav>

            {/* Right Side: Get a Quote Button + Language Flags */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexShrink: 0
            }} className="hidden md:flex">
              <button
                onClick={() => navigate('/booking')}
                style={{
                  backgroundColor: 'white',
                  color: '#020034',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Get a Quote
                <ArrowUpRight size={18} />
              </button>

              {/* Language Flags */}
              <div style={{
                display: 'flex',
                gap: '0.25rem',
                alignItems: 'center'
              }}>
                {countries.map((country, index) => (
                  <button
                    key={index}
                    title={country.name}
                    style={{
                      width: '32px',
                      height: '24px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      padding: 0
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    {country.flag}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div style={{
              padding: '1.5rem 0',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }} className="md:hidden">
              <nav style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
                <Link to="/b2b" style={{ color: 'white', textDecoration: 'none' }}>Master for Business</Link>
                <Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>About Us</Link>
                <Link to="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact Us</Link>
                <button
                  onClick={() => navigate('/booking')}
                  style={{
                    backgroundColor: 'white',
                    color: '#020034',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}
                >
                  Get a Quote
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section Below Header */}
      <div style={{
        backgroundColor: '#020034',
        padding: '3rem 0 4rem',
        width: '100%'
      }}>
        <div className="container" style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            maxWidth: '600px'
          }}>
            {/* Jobs Live Button */}
            <button style={{
              backgroundColor: 'white',
              color: '#020034',
              border: 'none',
              borderRadius: '50px',
              padding: '0.875rem 1.75rem',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            >
              <span style={{ color: '#020034', fontWeight: '700' }}>{jobsCount}</span>
              <span style={{ color: '#020034' }}>Jobs Live Right Now</span>
            </button>

            {/* Descriptive Text */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <p style={{
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: 0,
                lineHeight: '1.4'
              }}>
                Fair prices.
              </p>
              <p style={{
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: 0,
                lineHeight: '1.4'
              }}>
                Trusted pros.
              </p>
              <p style={{
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: '600',
                margin: 0,
                lineHeight: '1.4'
              }}>
                Booked in just 60 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden.md\\:flex {
            display: none !important;
          }
          .md\\:hidden {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .hidden.md\\:flex {
            display: flex !important;
          }
          .md\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default HeaderB2B;
