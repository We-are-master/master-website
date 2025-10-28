import React from 'react';
import { CheckCircle, Star, ArrowRight, Phone, Clock, Shield, Users } from 'lucide-react';
import logo from '../assets/logo.png';

const Hero = () => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #020135 0%, #2001AF 100%)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '60%',
        height: '100%',
        background: 'linear-gradient(45deg, rgba(233, 74, 2, 0.1) 0%, rgba(32, 1, 175, 0.1) 100%)',
        clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)',
        zIndex: 1
      }}></div>
      
      {/* Floating Elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: '200px',
        height: '200px',
        background: 'rgba(233, 74, 2, 0.2)',
        borderRadius: '50%',
        zIndex: 2,
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '30%',
        right: '20%',
        width: '150px',
        height: '150px',
        background: 'rgba(32, 1, 175, 0.2)',
        borderRadius: '50%',
        zIndex: 2,
        animation: 'float 8s ease-in-out infinite reverse'
      }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center'}}>
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#E94A02',
                borderRadius: '50%',
                marginRight: '0.5rem',
                animation: 'pulse 2s infinite'
              }}></div>
              29 Jobs Live Right Now
            </div>

            {/* Tagline */}
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '2rem',
              fontWeight: '500'
            }}>
              Fair prices. Trusted pros. Booked in just 60 seconds.
            </p>

            {/* Main Headline */}
            <h1 style={{
              fontSize: '4rem',
              fontWeight: '800',
              color: 'white',
              marginBottom: '2rem',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}>
              The Easiest Way to Book
              <br />
              <span style={{color: '#E94A02'}}>Property Maintenance</span>
              <br />
              <span style={{fontSize: '2.5rem', color: 'rgba(255, 255, 255, 0.8)'}}>for Your Business</span>
            </h1>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '3rem',
              flexWrap: 'wrap'
            }}>
              <a href="/contact" style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#E94A02',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontSize: '1.125rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(233, 74, 2, 0.3)',
                border: 'none',
                cursor: 'pointer'
              }}>
                Get an Instant Quote & Book Today
                <ArrowRight style={{marginLeft: '0.5rem', width: '20px', height: '20px'}} />
              </a>
              
              <a href="tel:02033376168" style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '1rem 2rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontSize: '1.125rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}>
                <Phone style={{marginRight: '0.5rem', width: '20px', height: '20px'}} />
                Call 020 3337 6168
              </a>
            </div>

            {/* Trust Indicators */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              flexWrap: 'wrap'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <div style={{display: 'flex', color: '#E94A02'}}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{fontSize: '1rem'}}>★</span>
                  ))}
                </div>
                <span style={{color: 'white', fontSize: '0.875rem', fontWeight: '500'}}>4.8 Rating</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Users style={{color: '#E94A02', width: '16px', height: '16px'}} />
                <span style={{color: 'white', fontSize: '0.875rem', fontWeight: '500'}}>500+ Businesses</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Shield style={{color: '#E94A02', width: '16px', height: '16px'}} />
                <span style={{color: 'white', fontSize: '0.875rem', fontWeight: '500'}}>Fully Insured</span>
              </div>
            </div>
          </div>

          {/* Right Content - Visual Elements */}
          <div style={{
            position: 'relative',
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Background Shapes */}
            <div style={{
              position: 'absolute',
              top: '20%',
              right: '10%',
              width: '300px',
              height: '300px',
              background: 'linear-gradient(135deg, #E94A02 0%, #FF6B35 100%)',
              borderRadius: '50%',
              opacity: '0.8',
              zIndex: 1,
              animation: 'float 6s ease-in-out infinite'
            }}></div>
            
            <div style={{
              position: 'absolute',
              bottom: '20%',
              right: '30%',
              width: '200px',
              height: '200px',
              background: 'linear-gradient(135deg, #2001AF 0%, #020135 100%)',
              borderRadius: '50%',
              opacity: '0.6',
              zIndex: 2,
              animation: 'float 8s ease-in-out infinite reverse'
            }}></div>

            {/* Service Icons - Right Side */}
            <div style={{
              position: 'absolute',
              top: '15%',
              right: '5%',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'fadeInUp 0.6s ease-out'
              }}>
                <div style={{color: '#E94A02', fontSize: '1.5rem'}}>🔧</div>
                <span style={{fontWeight: '600', color: '#111827'}}>Plumbing</span>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'fadeInUp 0.8s ease-out'
              }}>
                <div style={{color: '#E94A02', fontSize: '1.5rem'}}>⚡</div>
                <span style={{fontWeight: '600', color: '#111827'}}>Electrical</span>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'fadeInUp 1s ease-out'
              }}>
                <div style={{color: '#E94A02', fontSize: '1.5rem'}}>🏠</div>
                <span style={{fontWeight: '600', color: '#111827'}}>Maintenance</span>
              </div>
            </div>

            {/* Service Icons - Left Side */}
            <div style={{
              position: 'absolute',
              bottom: '15%',
              left: '5%',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'fadeInUp 1.2s ease-out'
              }}>
                <div style={{color: '#E94A02', fontSize: '1.5rem'}}>🔨</div>
                <span style={{fontWeight: '600', color: '#111827'}}>Repairs</span>
              </div>
              <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'fadeInUp 1.4s ease-out'
              }}>
                <div style={{color: '#E94A02', fontSize: '1.5rem'}}>🧹</div>
                <span style={{fontWeight: '600', color: '#111827'}}>Cleaning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Hero;