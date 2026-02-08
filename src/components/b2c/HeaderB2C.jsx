import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Package } from 'lucide-react';
import logo from '../../assets/logo.png';

const HeaderB2C = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header 
      className="header-b2c"
      style={{
        backgroundColor: 'rgba(2, 0, 52, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: 'white',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 0 rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        width: '100%',
        margin: 0,
        display: 'block'
      }}
    >
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
        gap: '2rem'
      }}>
        {/* Logo */}
        <Link 
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            flexShrink: 0
          }}
        >
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
            color: 'rgba(255, 255, 255, 0.8)',
            textDecoration: 'none',
            fontSize: '0.9375rem',
            fontWeight: '400',
            transition: 'color 0.2s ease',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em'
          }}
          onMouseEnter={(e) => e.target.style.color = 'white'}
          onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
          >
            Home
          </Link>

          {/* Services Dropdown */}
          <div style={{ position: 'relative' }}
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.9375rem',
              fontWeight: '400',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: 0,
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = 'white'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
            >
              Services
              <ChevronDown size={14} style={{ 
                transform: servicesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </button>
            {servicesOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '0.5rem',
                backgroundColor: 'rgba(2, 0, 52, 0.98)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.5rem 0',
                minWidth: '200px',
                zIndex: 1001
              }}>
                {['Plumbing', 'Electrical', 'Cleaning', 'Handyman', 'Carpentry', 'TV Mounting', 'Flatpack Assembly'].map((service, index) => {
                  // New configurator layouts for these (grid page disabled)
                  const toPath = service === 'Cleaning' ? '/cleaning-booking' : service === 'Handyman' ? '/handyman-booking' : service === 'Carpentry' ? '/carpentry-booking' : service === 'Painting' ? '/painting-booking' : '/booking';
                  const state = toPath === '/booking' ? { service } : {};
                  return (
                    <Link
                      key={index}
                      to={toPath}
                      state={state}
                      style={{
                        display: 'block',
                        padding: '0.75rem 1.25rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease',
                        letterSpacing: '-0.01em'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                      }}
                    >
                      {service}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link to="/about" style={{
            color: 'rgba(255, 255, 255, 0.8)',
            textDecoration: 'none',
            fontSize: '0.9375rem',
            fontWeight: '400',
            transition: 'color 0.2s ease',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em'
          }}
          onMouseEnter={(e) => e.target.style.color = 'white'}
          onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
          >
            About Us
          </Link>

          <Link to="/contact" style={{
            color: 'rgba(255, 255, 255, 0.8)',
            textDecoration: 'none',
            fontSize: '0.9375rem',
            fontWeight: '400',
            transition: 'color 0.2s ease',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em'
          }}
          onMouseEnter={(e) => e.target.style.color = 'white'}
          onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.8)'}
          >
            Contact Us
          </Link>
        </nav>

        {/* Right Side: My Account */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexShrink: 0
        }} className="hidden md:flex">
          <button
            onClick={() => navigate('/customer-login')}
            style={{
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '0.625rem 1.125rem',
              fontSize: '0.875rem',
              fontWeight: '400',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.08)';
              e.target.style.borderColor = 'rgba(255,255,255,0.25)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = 'rgba(255,255,255,0.15)';
              e.target.style.color = 'rgba(255, 255, 255, 0.8)';
            }}
          >
            <Package size={14} />
            My Account
          </button>
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
            gap: '1rem',
            padding: '0 2rem'
          }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/booking" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Services</Link>
            <Link to="/about" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>About Us</Link>
            <Link to="/contact" style={{ color: 'white', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
            <button
              onClick={() => {
                navigate('/customer-login');
                setIsMenuOpen(false);
              }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Package size={18} />
              My Account
            </button>
          </nav>
        </div>
      )}
      <style>{`
        .header-b2c {
          background-color: rgba(2, 0, 52, 0.95) !important;
          background: rgba(2, 0, 52, 0.95) !important;
        }
        .header-b2c * {
          background-color: transparent !important;
        }
        .header-b2c .container {
          background-color: transparent !important;
        }
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
    </header>
  );
};

export default HeaderB2C;
