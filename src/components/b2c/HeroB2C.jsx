import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const HeroB2C = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const heroRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const searchRef = useRef(null);
  const trustRef = useRef(null);
  const bgCircle1Ref = useRef(null);
  const bgCircle2Ref = useRef(null);

  const services = [
    'Painting',
    'Handyman',
    'Cleaning',
    'Plumber',
    'Electricians'
  ];

  // Typing effect for placeholder
  useEffect(() => {
    const currentService = services[currentServiceIndex];
    let charIndex = 0;
    let typingTimeout;
    let deleteTimeout;
    
    // Reset displayed text when service changes
    setDisplayedText('');
    setIsTyping(true);
    
    // Type characters one by one
    const typeChar = () => {
      if (charIndex <= currentService.length) {
        setDisplayedText(currentService.slice(0, charIndex));
        charIndex++;
        typingTimeout = setTimeout(typeChar, 80); // Typing speed
      } else {
        // Wait before deleting
        setIsTyping(false);
        deleteTimeout = setTimeout(() => {
          deleteChars(currentService.length);
        }, 2000); // Wait 2 seconds before deleting
      }
    };
    
    // Delete characters one by one
    const deleteChars = (length) => {
      if (length >= 0) {
        setDisplayedText(currentService.slice(0, length));
        setIsTyping(true);
        deleteTimeout = setTimeout(() => deleteChars(length - 1), 40); // Delete speed (faster)
      } else {
        // Move to next service
        setCurrentServiceIndex((prev) => (prev + 1) % services.length);
      }
    };
    
    // Start typing
    typingTimeout = setTimeout(typeChar, 500);
    
    return () => {
      clearTimeout(typingTimeout);
      clearTimeout(deleteTimeout);
    };
  }, [currentServiceIndex]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate background circles
      if (bgCircle1Ref.current) {
        gsap.to(bgCircle1Ref.current, {
          rotation: 360,
          duration: 20,
          repeat: -1,
          ease: 'none'
        });
      }

      if (bgCircle2Ref.current) {
        gsap.to(bgCircle2Ref.current, {
          rotation: -360,
          duration: 25,
          repeat: -1,
          ease: 'none'
        });
      }

      // Animate badge
      if (badgeRef.current) {
        gsap.fromTo(badgeRef.current, 
          {
            opacity: 0,
            y: -30,
            scale: 0.8
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.7)',
            delay: 0.2
          }
        );
      }

      // Animate title
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          {
            opacity: 0,
            y: 50
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            delay: 0.4
          }
        );
      }

      // Animate subtitle
      if (subtitleRef.current) {
        gsap.fromTo(subtitleRef.current,
          {
            opacity: 0,
            y: 30
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            delay: 0.6
          }
        );
      }

      // Animate search bar
      if (searchRef.current) {
        gsap.fromTo(searchRef.current,
          {
            opacity: 0,
            y: 40,
            scale: 0.95
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            delay: 0.8
          }
        );
      }

      // Animate trust indicators
      if (trustRef.current && trustRef.current.children) {
        gsap.fromTo(trustRef.current.children,
          {
            opacity: 0,
            y: 30,
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            delay: 1.2
          }
        );
      }

      // Removed parallax effect to prevent scroll issues
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Animate button click
      gsap.to(e.target, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          // Check if search term is cleaning-related
          const searchLower = searchTerm.toLowerCase();
          const isCleaning = searchLower.includes('cleaning') || searchLower.includes('clean') || 
                            searchLower.includes('deep clean') || searchLower.includes('end of tenancy') ||
                            searchLower.includes('upholstery');
          if (isCleaning) {
            navigate('/cleaning-booking', { state: { jobDescription: searchTerm } });
          } else {
            navigate('/booking', { state: { service: searchTerm } });
          }
        }
      });
    }
  };

  return (
    <div 
      ref={heroRef}
      className="hero-b2c"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#020034',
        width: '100%',
        paddingTop: '2rem',
        paddingBottom: '2rem'
      }}
    >
      {/* Subtle Background Gradient with Brand Colors */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(233, 74, 2, 0.12) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 20% 100%, rgba(32, 1, 175, 0.15) 0%, transparent 50%)',
        zIndex: 1
      }}></div>
      
      {/* Minimal Grid Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        zIndex: 1
      }}></div>

      <div className="container hero-b2c-inner" style={{ 
        position: 'relative', 
        zIndex: 3,
        padding: '2rem 0',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto',
          textAlign: 'center'
        }}>
          {/* Badge */}
          <div 
            ref={badgeRef}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              color: 'rgba(255, 255, 255, 0.8)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: '500',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              letterSpacing: '0.01em'
            }}
          >
            <Sparkles size={12} style={{ opacity: 0.7 }} />
            <span>Trusted by 10,000+ homeowners across London</span>
          </div>

          {/* Main Headline */}
          <h1 
            ref={titleRef}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: '600',
              color: 'white',
              marginBottom: '1.25rem',
              lineHeight: '1.1',
              letterSpacing: '-0.03em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}
          >
            <span style={{
              color: 'white',
              display: 'block',
              marginBottom: '0.25rem'
            }}>
              The right way to book local professionals.
            </span>
            <span style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: '400'
            }}>
              For{' '}
            </span>
            <span
              style={{
                color: '#E94A02',
                fontWeight: '600',
                display: 'inline-block'
              }}
            >
              {services[currentServiceIndex]}
            </span>
            <span style={{
              color: 'rgba(255, 255, 255, 0.6)'
            }}>
              .
            </span>
          </h1>

          {/* Subheadline */}
          <p 
            ref={subtitleRef}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '2rem',
              fontWeight: '400',
              lineHeight: '1.5',
              maxWidth: '640px',
              marginLeft: 'auto',
              marginRight: 'auto',
              letterSpacing: '-0.01em'
            }}
          >
            Professional tradespeople at your doorstep. Book in minutes, get instant pricing, and enjoy peace of mind.
          </p>

          {/* Search Bar */}
          <form 
            ref={searchRef}
            onSubmit={handleSearch}
            style={{ 
              marginBottom: '2rem'
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '0.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
              maxWidth: '720px',
              margin: '0 auto',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              gap: '0.5rem'
            }}
            className="hero-search-container"
            onFocus={(e) => {
              gsap.to(e.currentTarget, {
                boxShadow: '0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(233, 74, 2, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                duration: 0.3,
                ease: 'power2.out'
              });
            }}
            onBlur={(e) => {
              gsap.to(e.currentTarget, {
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                duration: 0.3
              });
            }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 1.25rem',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>
                <Search size={20} />
              </div>
              <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                minWidth: 0,
                flexShrink: 1,
                overflow: 'hidden'
              }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder=""
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                    padding: '1.25rem 0.5rem',
                    color: 'white',
                    fontFamily: 'inherit',
                    background: 'transparent',
                    position: 'relative',
                    zIndex: 2,
                    minWidth: 0
                  }}
                />
                {/* AI Typing Placeholder */}
                {!searchTerm && (
                  <div style={{
                    position: 'absolute',
                    left: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    pointerEvents: 'none',
                    zIndex: 1,
                    maxWidth: 'calc(100% - 1rem)',
                    overflow: 'hidden'
                  }}
                  className="hero-placeholder"
                  >
                    <span style={{
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap'
                    }}>
                      Try "
                    </span>
                    <span style={{
                      color: '#E94A02',
                      fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                      fontFamily: 'inherit',
                      fontWeight: '500',
                      whiteSpace: 'nowrap'
                    }}>
                      {displayedText}
                    </span>
                    <span style={{
                      width: '2px',
                      height: 'clamp(1rem, 4vw, 1.25rem)',
                      backgroundColor: '#E94A02',
                      animation: 'blink 1s infinite',
                      opacity: isTyping ? 1 : 0,
                      flexShrink: 0
                    }}></span>
                    <span style={{
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap'
                    }}>
                      "
                    </span>
                  </div>
                )}
                <style>{`
                  @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                  }
                  
                  @media (max-width: 768px) {
                    .hero-b2c {
                      align-items: flex-start !important;
                      padding-top: 50px !important;
                      padding-bottom: 2rem !important;
                      min-height: auto !important;
                    }
                    .hero-b2c-inner {
                      padding-top: 0.5rem !important;
                      padding-bottom: 1.5rem !important;
                    }
                  }
                  
                  @media (max-width: 640px) {
                    .hero-search-container {
                      padding: 0.75rem !important;
                      gap: 0.5rem !important;
                    }
                    
                    .hero-search-container > div:first-child {
                      padding: 0 0.5rem !important;
                      flex-shrink: 0;
                    }
                    
                    .hero-search-container > div:first-child svg {
                      width: 18px !important;
                      height: 18px !important;
                    }
                    
                    .hero-search-container input {
                      padding: 0.875rem 0.25rem !important;
                      font-size: 0.9375rem !important;
                    }
                    
                    .hero-search-container button {
                      padding: 0.875rem 1.25rem !important;
                      font-size: 0.875rem !important;
                      gap: 0.375rem !important;
                    }
                    
                    .hero-search-container button svg {
                      width: 16px !important;
                      height: 16px !important;
                    }
                  }
                  
                  @media (max-width: 480px) {
                    .hero-search-container {
                      padding: 0.5rem !important;
                      gap: 0.375rem !important;
                    }
                    
                    .hero-search-container button span {
                      display: none;
                    }
                    
                    .hero-search-container button {
                      padding: 0.875rem 1rem !important;
                      min-width: auto;
                    }
                    
                    .hero-placeholder {
                      left: 0.25rem !important;
                      max-width: calc(100% - 120px) !important;
                    }
                    
                    .hero-placeholder span {
                      font-size: 0.875rem !important;
                    }
                  }
                `}</style>
              </div>
              <button
                type="submit"
                style={{
                  backgroundColor: '#E94A02',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: 'clamp(1rem, 3vw, 1.25rem) clamp(1.5rem, 4vw, 2.5rem)',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  letterSpacing: '-0.01em'
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    backgroundColor: '#d13d00',
                    scale: 1.02,
                    duration: 0.3,
                    ease: 'power2.out'
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    backgroundColor: '#E94A02',
                    scale: 1,
                    duration: 0.3
                  });
                }}
              >
                <span>Get instant price</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>

          {/* Trust Indicators */}
          <div 
            ref={trustRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginTop: '2rem'
            }}
          >
            {[
              'Fully vetted & insured professionals',
              'Clear scopes and pricing',
              'Dedicated operations team',
              'Built for homes, landlords & businesses'
            ].map((text, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.8125rem',
                  fontWeight: '400',
                  letterSpacing: '0.01em'
                }}
              >
                <span style={{ 
                  color: '#E94A02',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>✓</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3
      }}>
        <div style={{
          width: '24px',
          height: '40px',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
        }}
        >
          <div style={{
            width: '4px',
            height: '8px',
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderRadius: '2px'
          }}></div>
        </div>
      </div>

    </div>
  );
};

export default HeroB2C;
