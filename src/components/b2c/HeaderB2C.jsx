import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Menu, X, ChevronDown } from 'lucide-react';
import logo from '../../assets/logo.png';

const HeaderB2C = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <header 
      className="header-b2c"
      style={{
        backgroundColor: '#020034',
        background: '#020034',
        color: 'white',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
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
                {['Plumbing', 'Electrical', 'Cleaning', 'Handyman', 'Carpentry', 'TV Mounting', 'Flatpack Assembly'].map((service, index) => {
                  // Cleaning services should go directly to cleaning booking form
                  const isCleaning = service === 'Cleaning';
                  return (
                    <Link
                      key={index}
                      to={isCleaning ? "/cleaning-booking" : "/booking"}
                      state={isCleaning ? {} : { service }}
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
                  );
                })}
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

        {/* Right Side: Login Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexShrink: 0
        }} className="hidden md:flex">
          <button
            onClick={() => navigate('/login')}
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
            <LogIn size={18} />
            Login
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
                navigate('/login');
                setIsMenuOpen(false);
              }}
              style={{
                backgroundColor: 'white',
                color: '#020034',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <LogIn size={18} />
              Login
            </button>
          </nav>
        </div>
      )}
      <style>{`
        .header-b2c {
          background-color: #020034 !important;
          background: #020034 !important;
        }
        .header-b2c * {
          background-color: transparent !important;
        }
        .header-b2c .container {
          background-color: transparent !important;
        }
        .header-b2c nav a,
        .header-b2c nav button {
          color: white !important;
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
