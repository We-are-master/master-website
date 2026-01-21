import React from 'react';
import { CheckCircle, Star, ArrowRight, Phone, Clock, Shield, Users, Wrench, Droplets, Zap, Sparkles, ArrowDown, ArrowUp, ArrowLeft } from 'lucide-react';
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

      <div className="container mx-auto px-4 relative z-10" style={{overflowX: 'hidden', maxWidth: '100%', padding: '0 2rem'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', maxWidth: '100%', overflowX: 'hidden'}} className="hero-grid">
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
            }} className="hero-badge">
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#E94A02',
                borderRadius: '50%',
                marginRight: '0.5rem',
                animation: 'pulse 2s infinite'
              }}></div>
              +240 Professionals & +23K Jobs Completed
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: '4rem',
              fontWeight: '800',
              color: 'white',
              marginBottom: '1.5rem',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }} className="hero-title">
              The Smarter Way to Manage
              <br />
              <span style={{color: '#E94A02'}}>Maintenance Across Your Business</span>
            </h1>

            {/* Description */}
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '2.5rem',
              fontWeight: '400',
              lineHeight: '1.6'
            }} className="hero-description">
              We manage the people, the services and the technology, you focus on growing your business.
            </p>

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
                Get in Touch Today
                <ArrowRight style={{marginLeft: '0.5rem', width: '20px', height: '20px'}} />
              </a>
              
              <a href="tel:+447983182332" style={{
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
                Call +44 7983 182332
              </a>
            </div>

          </div>

          {/* Right Content - Services with Master Logo Center */}
          <div className="hero-right-content" style={{
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

            {/* Master Logo - Center */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              textAlign: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                animation: 'fadeInUp 1s ease-out'
              }}>
                <img 
                  src={logo} 
                  alt="Master Logo" 
                  style={{
                    width: '250px',
                    height: '250px',
                    marginLeft: '100px',
                    marginTop: '-50px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                  }}
                />
              </div>
            </div>

            {/* Plumbing - Top Right */}
            <div className="hero-service-card" style={{
              position: 'absolute',
              top: '10%',
              right: '15%',
              zIndex: 3,
              animation: 'fadeInUp 0.6s ease-out'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative'
              }}>
                <Droplets style={{color: '#E94A02', width: '24px', height: '24px'}} />
                <span style={{fontWeight: '600', color: '#111827'}}>Plumbing</span>
              </div>
            </div>

            {/* Electrical - Top Left */}
            <div className="hero-service-card" style={{
              position: 'absolute',
              top: '15%',
              left: '10%',
              zIndex: 3,
              animation: 'fadeInUp 0.8s ease-out'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative'
              }}>
                <Zap style={{color: '#2001AF', width: '24px', height: '24px'}} />
                <span style={{fontWeight: '600', color: '#111827'}}>Electrical</span>
              </div>
            </div>

            {/* Maintenance - Bottom Right */}
            <div className="hero-service-card" style={{
              position: 'absolute',
              bottom: '15%',
              right: '20%',
              zIndex: 3,
              animation: 'fadeInUp 1s ease-out'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative'
              }}>
                <Wrench style={{color: '#020135', width: '24px', height: '24px'}} />
                <span style={{fontWeight: '600', color: '#111827'}}>Maintenance</span>
              </div>
            </div>

            {/* Repairs - Bottom Left */}
            <div style={{
              position: 'absolute',
              bottom: '20%',
              left: '15%',
              zIndex: 3,
              animation: 'fadeInUp 1.2s ease-out'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative'
              }}>
                <Wrench style={{color: '#E94A02', width: '24px', height: '24px'}} />
                <span style={{fontWeight: '600', color: '#111827'}}>Repairs</span>
              </div>
            </div>

            {/* Cleaning - Middle Left */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '5%',
              transform: 'translateY(-50%)',
              zIndex: 3,
              animation: 'fadeInUp 1.4s ease-out'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '1rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative'
              }}>
                <Sparkles style={{color: '#E94A02', width: '24px', height: '24px'}} />
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
          padding: 0 2rem;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 0 1rem;
          }
          
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          
          .hero-title {
            font-size: 2rem !important;
            line-height: 1.2 !important;
          }
          
          .hero-description {
            font-size: 1rem !important;
            margin-bottom: 1.5rem !important;
          }
          
          .hero-badge {
            font-size: 0.75rem !important;
            padding: 0.4rem 0.75rem !important;
            margin-bottom: 1rem !important;
          }
          
          /* Hide arrows on mobile */
          .hero-arrow {
            display: none !important;
          }
          
          /* Hide right content on mobile */
          .hero-right-content {
            display: none !important;
          }
          
          /* Adjust service cards for mobile */
          .hero-service-card {
            position: relative !important;
            margin: 0.5rem 0 !important;
            left: auto !important;
            right: auto !important;
            top: auto !important;
            bottom: auto !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Hero;