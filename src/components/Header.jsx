import React, { useState } from 'react'
import { Menu, X, Phone, Mail } from 'lucide-react'
import logo from '../assets/logo.png'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header style={{
      backgroundColor: '#020135',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 0'
        }}>
          {/* Logo */}
          <div style={{display: 'flex', alignItems: 'center'}}>
            <img 
              src={logo} 
              alt="Master" 
              style={{
                height: '40px',
                width: 'auto',
                marginRight: '0.75rem'
              }}
            />
            <div style={{
              fontSize: '0.875rem',
              color: '#E94A02',
              fontWeight: '500'
            }}>
              for Business
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }} className="hidden md:flex">
            <a href="#services" style={{
              color: 'white',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Services
            </a>
            <a href="#features" style={{
              color: 'white',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Features
            </a>
            <a href="#process" style={{
              color: 'white',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              How it Works
            </a>
            <a href="#faq" style={{
              color: 'white',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              FAQ
            </a>
            <a href="/contact" style={{
              color: 'white',
              textDecoration: 'none',
              transition: 'color 0.3s ease',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Contact
            </a>
          </nav>

          {/* Contact Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            fontSize: '0.875rem',
            color: 'rgba(255, 255, 255, 0.8)'
          }} className="hidden lg:flex">
            <div style={{display: 'flex', alignItems: 'center'}}>
              <Phone style={{width: '16px', height: '16px', marginRight: '0.25rem', color: '#E94A02'}} />
              <span>020 3337 6168</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <Mail style={{width: '16px', height: '16px', marginRight: '0.25rem', color: '#E94A02'}} />
              <span>hello@wearemaster.com</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a href="/contact" style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#E94A02',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(233, 74, 2, 0.3)'
            }}>
              Get a Quote
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            style={{
              display: 'none',
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X style={{width: '24px', height: '24px'}} /> : <Menu style={{width: '24px', height: '24px'}} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div style={{
            padding: '1rem 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <a href="#services" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Services
              </a>
              <a href="#features" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Features
              </a>
              <a href="#process" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                How it Works
              </a>
              <a href="#faq" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                FAQ
              </a>
              <a href="/contact" style={{
                color: 'white',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Contact
              </a>
              <div style={{
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <Phone style={{width: '16px', height: '16px', marginRight: '0.5rem', color: '#E94A02'}} />
                  <span>020 3337 6168</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <Mail style={{width: '16px', height: '16px', marginRight: '0.5rem', color: '#E94A02'}} />
                  <span>hello@wearemaster.com</span>
                </div>
                <a href="/contact" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#E94A02',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(233, 74, 2, 0.3)',
                  width: '100%'
                }}>
                  Get a Quote
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
