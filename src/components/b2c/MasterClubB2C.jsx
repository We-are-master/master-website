import React, { useEffect, useRef } from 'react';
import { CheckCircle, Crown, Clock, Shield, Infinity, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const MasterClubB2C = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const benefitsRef = useRef(null);
  const pricingRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Animate benefits
      const benefits = benefitsRef.current ? Array.from(benefitsRef.current.children) : [];
      if (benefits && benefits.length > 0) {
        gsap.fromTo(benefits,
          {
            opacity: 0,
            x: -30
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: benefitsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Animate pricing section
      if (pricingRef.current) {
        gsap.fromTo(pricingRef.current,
          {
            opacity: 0,
            scale: 0.95
          },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: pricingRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const benefits = [
    {
      icon: <Crown size={24} />,
      title: 'Private member rates up to 50% OFF on every book',
      description: 'Fixed prices reserved exclusively for members.',
      color: '#fbbf24'
    },
    {
      icon: <Clock size={24} />,
      title: 'Priority booking',
      description: 'Jump the queue for standard and urgent jobs.',
      color: '#3b82f6'
    },
    {
      icon: <Shield size={24} />,
      title: 'Reduced emergency fees',
      description: 'Lower call-out fees when timing really matters.',
      color: '#10b981'
    },
    {
      icon: <CheckCircle size={24} />,
      title: 'Insurance included',
      description: 'Fully vetted, insured professionals on every job.',
      color: '#8b5cf6'
    },
    {
      icon: <Infinity size={24} />,
      title: 'Unlimited use',
      description: 'Use your member benefits as often as you need. Fair use applies.',
      color: '#E94A02'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      style={{
        padding: '6rem 0',
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw'
      }}
    >
      {/* Decorative Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(233, 74, 2, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(251, 191, 36, 0.05) 0%, transparent 50%)'
      }}></div>

      <div className="container" style={{ 
        position: 'relative', 
        zIndex: 1,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Header Section */}
          <div 
            ref={titleRef}
            style={{
              textAlign: 'center',
              marginBottom: '4rem'
            }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              color: '#f59e0b',
              padding: '0.5rem 1.25rem',
              borderRadius: '50px',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '1.5rem'
            }}>
              <Crown size={16} />
              <span>Master Club</span>
            </div>
            
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '800',
              marginBottom: '1.5rem',
              color: '#020034',
              letterSpacing: '-0.02em',
              lineHeight: '1.3',
              maxWidth: '900px',
              margin: '0 auto 1.5rem'
            }}>
              The Master Club gives you access to private member rates that are not available to the public.
            </h2>
            
            <p style={{
              fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
              color: '#6b7280',
              lineHeight: '1.7',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              No vouchers.<br />
              No fake discounts.<br />
              Just better pricing, priority booking and full coverage, every time you need us.
            </p>
          </div>

          {/* Benefits Section */}
          <div style={{
            marginBottom: '4rem'
          }}>
            <h3 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: '700',
              color: '#020034',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              What members get
            </h3>

            <div 
              ref={benefitsRef}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                maxWidth: '1000px',
                margin: '0 auto'
              }}
            >
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '2rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'flex-start',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, {
                      y: -4,
                      boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                      duration: 0.3
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, {
                      y: 0,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      duration: 0.3
                    });
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: `${benefit.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: benefit.color,
                    flexShrink: 0
                  }}>
                    {benefit.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: '#020034',
                      marginBottom: '0.5rem',
                      lineHeight: '1.4'
                    }}>
                      {benefit.title}
                    </h4>
                    <p style={{
                      fontSize: '0.95rem',
                      color: '#6b7280',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & CTA Section */}
          <div 
            ref={pricingRef}
            style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '3rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              border: '2px solid rgba(233, 74, 2, 0.1)',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            <div style={{
              marginBottom: '2rem'
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '600',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Pricing
              </div>
              <div style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: '900',
                color: '#020034',
                marginBottom: '0.5rem',
                lineHeight: '1.2'
              }}>
                From £9.99 <span style={{
                  fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                  fontWeight: '600',
                  color: '#6b7280'
                }}>/ month</span>
              </div>
              <p style={{
                fontSize: '1rem',
                color: '#6b7280',
                margin: 0
              }}>
                Cancel anytime. No long-term commitment.
              </p>
            </div>

            <button
              onClick={() => {
                // Handle join action - can navigate to signup or open modal
                console.log('Join Master Club clicked');
              }}
              style={{
                backgroundColor: '#E94A02',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                padding: '1.25rem 3rem',
                fontSize: '1.125rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(233, 74, 2, 0.3)'
              }}
              onMouseEnter={(e) => {
                gsap.to(e.target, {
                  backgroundColor: '#d13d00',
                  scale: 1.05,
                  boxShadow: '0 6px 30px rgba(233, 74, 2, 0.4)',
                  duration: 0.3
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.target, {
                  backgroundColor: '#E94A02',
                  scale: 1,
                  boxShadow: '0 4px 20px rgba(233, 74, 2, 0.3)',
                  duration: 0.3
                });
              }}
            >
              <span>Join the Master Club</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MasterClubB2C;
