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
      style={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #020034 0%, #2001AF 50%, #E94A02 100%)',
        width: '100%'
      }}
    >
      {/* Animated Background Elements */}
      <div 
        ref={bgCircle1Ref}
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(233, 74, 2, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 1
        }}
      ></div>
      
      <div 
        ref={bgCircle2Ref}
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-5%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(32, 1, 175, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 1
        }}
      ></div>

      {/* Background Image Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.15,
        zIndex: 1
      }}></div>

      {/* Gradient Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(2,0,52,0.8) 0%, rgba(32,1,175,0.6) 50%, rgba(233,74,2,0.7) 100%)',
        zIndex: 2
      }}></div>

      <div className="container" style={{ 
        position: 'relative', 
        zIndex: 3,
        padding: '4rem 0',
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
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '50px',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Sparkles size={16} />
            <span>Trusted by 10,000+ homeowners across London</span>
          </div>

          {/* Main Headline */}
          <h1 
            ref={titleRef}
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: '900',
              color: 'white',
              marginBottom: '1.5rem',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            <span style={{
              color: 'white'
            }}>
              Trusted local professionals.
            </span>
            <br />
            <span style={{
              color: 'white'
            }}>
              Booked the right way for{' '}
            </span>
            <span
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block'
              }}
            >
              {services[currentServiceIndex]}
            </span>
            <span style={{
              color: 'white'
            }}>
              .
            </span>
          </h1>

          {/* Subheadline */}
          <p 
            ref={subtitleRef}
            style={{
              fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
              color: 'rgba(255,255,255,0.95)',
              marginBottom: '3rem',
              fontWeight: '400',
              lineHeight: '1.6',
              maxWidth: '700px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            Professional tradespeople at your doorstep. Book in minutes, get instant pricing, and enjoy peace of mind. All in one platform.
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
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '0.5rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
              maxWidth: '700px',
              margin: '0 auto',
              transition: 'all 0.3s ease',
              gap: '0.5rem'
            }}
            className="hero-search-container"
            onFocus={(e) => {
              gsap.to(e.currentTarget, {
                boxShadow: '0 25px 70px rgba(0,0,0,0.4), 0 0 0 4px rgba(233, 74, 2, 0.2)',
                scale: 1.02,
                duration: 0.3
              });
            }}
            onBlur={(e) => {
              gsap.to(e.currentTarget, {
                boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
                scale: 1,
                duration: 0.3
              });
            }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 1.25rem',
                color: '#6b7280'
              }}>
                <Search size={22} />
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
                    color: '#111827',
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
                      color: '#9ca3af',
                      fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap'
                    }}>
                      Try "
                    </span>
                    <span style={{
                      color: '#6366f1',
                      fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                      fontFamily: 'inherit',
                      fontWeight: '500',
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      whiteSpace: 'nowrap'
                    }}>
                      {displayedText}
                    </span>
                    <span style={{
                      width: '2px',
                      height: 'clamp(1rem, 4vw, 1.25rem)',
                      backgroundColor: '#6366f1',
                      animation: 'blink 1s infinite',
                      opacity: isTyping ? 1 : 0,
                      flexShrink: 0
                    }}></span>
                    <span style={{
                      color: '#9ca3af',
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
                  borderRadius: '12px',
                  padding: 'clamp(1rem, 3vw, 1.25rem) clamp(1rem, 4vw, 2.5rem)',
                  fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    backgroundColor: '#d13d00',
                    scale: 1.05,
                    duration: 0.3
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
                <ArrowRight size={20} />
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
              gap: '1.5rem',
              flexWrap: 'wrap',
              marginTop: '3rem'
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
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}
              >
                <span style={{ 
                  color: '#10b981',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>✔</span>
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
          width: '30px',
          height: '50px',
          border: '2px solid rgba(255,255,255,0.5)',
          borderRadius: '25px',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '10px',
          cursor: 'pointer'
        }}
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }}
        >
          <div style={{
            width: '6px',
            height: '10px',
            backgroundColor: 'rgba(255,255,255,0.7)',
            borderRadius: '3px'
          }}></div>
        </div>
      </div>

    </div>
  );
};

export default HeroB2C;
