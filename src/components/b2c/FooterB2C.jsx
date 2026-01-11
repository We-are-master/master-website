import React, { useEffect, useRef } from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Apple, Play, Shield, Award, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const FooterB2C = () => {
  const footerRef = useRef(null);

  // Add responsive styles
  useEffect(() => {
    const footerStyles = `
      @media (max-width: 1024px) {
        .footer-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 2rem !important;
        }
      }
      
      @media (max-width: 768px) {
        .footer-grid {
          grid-template-columns: 1fr !important;
          gap: 2rem !important;
        }
        
        .footer-stat {
          flex-direction: column !important;
          text-align: center !important;
        }
      }
      
      @media (max-width: 640px) {
        .container {
          padding: 0 1rem !important;
        }
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'footer-responsive-styles';
    styleSheet.textContent = footerStyles;
    document.head.appendChild(styleSheet);
    
    return () => {
      const existingStyle = document.getElementById('footer-responsive-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Add GSAP animations if available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gsap) {
      const gsap = window.gsap;
      const ScrollTrigger = window.gsap?.plugins?.scrollTrigger;
      
      if (ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        
        const ctx = gsap.context(() => {
          const columns = footerRef.current?.querySelectorAll('.footer-column');
          const stats = footerRef.current?.querySelectorAll('.footer-stat');
          
          if (columns && columns.length > 0) {
            gsap.fromTo(Array.from(columns),
              { opacity: 0, y: 40 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: footerRef.current,
                  start: 'top 85%',
                  toggleActions: 'play none none reverse'
                }
              }
            );
          }
          
          if (stats && stats.length > 0) {
            gsap.fromTo(Array.from(stats),
              { opacity: 0, scale: 0.8 },
              {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                  trigger: footerRef.current,
                  start: 'top 85%',
                  toggleActions: 'play none none reverse'
                }
              }
            );
          }
        }, footerRef);
        
        return () => ctx?.revert();
      }
    }
  }, []);

  return (
    <footer 
      ref={footerRef}
      style={{
        backgroundColor: '#020034',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw'
      }}
    >
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        opacity: 0.3
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', width: '100%', boxSizing: 'border-box' }}>
        {/* Main Footer Content */}
        <div style={{ padding: '5rem 0 3rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '3rem',
            marginBottom: '4rem',
            width: '100%',
            boxSizing: 'border-box'
          }}
          className="footer-grid"
          >
            {/* Company Info */}
            <div className="footer-column" style={{ maxWidth: '350px' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <img 
                    src={logo} 
                    alt="Master" 
                    style={{
                      height: '50px',
                      width: 'auto'
                    }}
                  />
                </div>
                <p style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  marginBottom: '2rem'
                }}>
                  Your trusted partner for home maintenance. Professional tradespeople, instant pricing, and peace of mind.
                </p>
              </div>

              {/* Trust Badges */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {[
                  { icon: <Shield size={20} />, text: 'Fully Insured & Vetted', color: '#10b981' },
                  { icon: <Award size={20} />, text: '4.9★ Average Rating', color: '#fbbf24' },
                  { icon: <Users size={20} />, text: '10,000+ Happy Customers', color: '#3b82f6' }
                ].map((badge, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    }}
                  >
                    <div style={{ color: badge.color }}>
                      {badge.icon}
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{badge.text}</span>
                  </div>
                ))}
              </div>

              {/* App Store Links */}
              <div style={{ marginBottom: '2rem' }}>
                <p style={{
                  color: 'white',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  fontSize: '0.95rem'
                }}>
                  Download Our App
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                  {[
                    { icon: <Apple size={20} />, text1: 'Download on the', text2: 'App Store' },
                    { icon: <Play size={20} />, text1: 'Get it on', text2: 'Google Play' }
                  ].map((app, index) => (
                    <a
                      key={index}
                      href="#"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        padding: '0.875rem 1.25rem',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ marginRight: '0.75rem' }}>{app.icon}</div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{app.text1}</div>
                        <div style={{ fontSize: '1rem', fontWeight: '700' }}>{app.text2}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                {[
                  { icon: Facebook, href: '#', label: 'Facebook' },
                  { icon: Twitter, href: '#', label: 'Twitter' },
                  { icon: Instagram, href: '#', label: 'Instagram' },
                  { icon: Linkedin, href: '#', label: 'LinkedIn' }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    style={{
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E94A02';
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.1)';
                      e.currentTarget.style.borderColor = '#E94A02';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    }}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="footer-column">
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                marginBottom: '1.5rem',
                color: 'white'
              }}>
                Services
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'TV Mounting',
                  'Handyman Services',
                  'Flatpack Assembly',
                  'Light Fitting',
                  'Cleaning Services',
                  'Plumbing',
                  'Electrical',
                  'Carpentry',
                  'Painting'
                ].map((service, index) => (
                  <li key={index}>
                    <Link
                      to="/booking"
                      state={{ service }}
                      style={{
                        color: 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        display: 'inline-block',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#E94A02';
                        e.target.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'rgba(255,255,255,0.7)';
                        e.target.style.transform = 'translateX(0)';
                      }}
                    >
                      {service}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="footer-column">
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                marginBottom: '1.5rem',
                color: 'white'
              }}>
                Company
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { text: 'About Us', href: '/about' },
                  { text: 'How It Works', href: '#how-it-works' },
                  { text: 'Become a Pro', href: '#' },
                  { text: 'Careers', href: '#' },
                  { text: 'Blog', href: '#' },
                  { text: 'Press Kit', href: '#' }
                ].map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      style={{
                        color: 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        display: 'inline-block',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#E94A02';
                        e.target.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'rgba(255,255,255,0.7)';
                        e.target.style.transform = 'translateX(0)';
                      }}
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Legal */}
            <div className="footer-column">
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                marginBottom: '1.5rem',
                color: 'white'
              }}>
                Support
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {[
                  { text: 'Help Center', href: '#' },
                  { text: 'Contact Us', href: '/contact' },
                  { text: 'FAQs', href: '#faq' },
                  { text: 'Safety', href: '#' },
                  { text: 'Terms of Service', href: '#' },
                  { text: 'Privacy Policy', href: '#' }
                ].map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      style={{
                        color: 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        display: 'inline-block',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#E94A02';
                        e.target.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'rgba(255,255,255,0.7)';
                        e.target.style.transform = 'translateX(0)';
                      }}
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Contact Info */}
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h4 style={{
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  color: 'white'
                }}>
                  Get in Touch
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    { icon: Phone, text: '020 3337 6168', subtext: 'Mon-Sun, 8am-8pm', color: '#E94A02' },
                    { icon: Mail, text: 'hello@wearemaster.com', subtext: null, color: '#E94A02' },
                    { icon: MapPin, text: 'London, UK', subtext: 'Serving Greater London', color: '#E94A02' }
                  ].map((contact, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <contact.icon size={18} style={{ color: contact.color, marginTop: '0.25rem', flexShrink: 0 }} />
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: '600' }}>
                          {contact.text}
                        </div>
                        {contact.subtext && (
                          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {contact.subtext}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          padding: '2rem 0',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          {/* Trust Indicators - Left Side */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <div className="footer-stat" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', color: '#fbbf24' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ fontSize: '1.125rem' }}>★</span>
                ))}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', marginLeft: '0.5rem' }}>
                <strong>4.9</strong> / 5.0
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginLeft: '0.5rem' }}>
                Trustpilot
              </div>
            </div>
            <div className="footer-stat" style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Clock size={16} />
              <span>Same-day service available</span>
            </div>
          </div>

          {/* Copyright - Right Side */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '0.75rem',
            textAlign: 'right'
          }}>
            <div style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.875rem'
            }}>
              © {new Date().getFullYear()} Master Services Trades Ltd. All rights reserved.
            </div>
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              fontSize: '0.875rem',
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}>
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy'].map((link, index) => (
                <a 
                  key={index}
                  href="#" 
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#E94A02';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'rgba(255,255,255,0.6)';
                  }}
                >
                  {link}
                </a>
              ))}
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.75rem'
            }}>
              MASTER SERVICES TRADES LTD<br />
              Company number: 15406523
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterB2C;
