import React, { useEffect, useRef } from 'react';
import { Tag, Clock, Shield, Package, CreditCard, CheckCircle, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const WhyChooseB2C = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const benefitsRef = useRef(null);
  const statsRef = useRef(null);

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

      // Animate benefit cards with stagger
      const cards = benefitsRef.current ? Array.from(benefitsRef.current.children) : [];
      if (cards && cards.length > 0) {
        gsap.fromTo(cards,
          {
            opacity: 0,
            y: 60,
            scale: 0.95
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
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

        // Add hover animations
        cards.forEach((card) => {
          const icon = card.querySelector('.benefit-icon');
          card.addEventListener('mouseenter', () => {
            gsap.to(card, {
              y: -8,
              boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
              duration: 0.4,
              ease: 'power2.out'
            });
            if (icon) {
              gsap.to(icon, {
                rotation: 5,
                scale: 1.1,
                duration: 0.4,
                ease: 'back.out(1.7)'
              });
            }
          });

          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              y: 0,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              duration: 0.4
            });
            if (icon) {
              gsap.to(icon, {
                rotation: 0,
                scale: 1,
                duration: 0.4
              });
            }
          });
        });
      }

      // Animate stats with counter effect
      const stats = statsRef.current ? Array.from(statsRef.current.children) : [];
      if (stats && stats.length > 0) {
        gsap.fromTo(stats,
          {
            opacity: 0,
            scale: 0.8
          },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: statsRef.current,
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
      icon: <Tag size={28} />,
      title: 'Instant Pricing',
      description: 'See the cost upfront before you book. No hidden fees, no surprises.',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    {
      icon: <Clock size={28} />,
      title: 'Fast & Convenient',
      description: 'Book in minutes, get it done quickly. Same-day service available.',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      icon: <Shield size={28} />,
      title: 'Checked Tradespeople',
      description: 'All professionals are vetted, insured, and background-checked.',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    {
      icon: <Package size={28} />,
      title: 'Bundle Tasks Easily',
      description: 'Add multiple jobs to one booking and save time and money.',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      icon: <CreditCard size={28} />,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with industry-leading encryption.',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    {
      icon: <CheckCircle size={28} />,
      title: 'Backed by Master',
      description: 'Trusted brand with years of experience and thousands of happy customers.',
      color: '#E94A02',
      gradient: 'linear-gradient(135deg, #E94A02 0%, #d13d00 100%)'
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
        backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(233, 74, 2, 0.03) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(32, 1, 175, 0.03) 0%, transparent 50%)'
      }}></div>

      <div className="container" style={{ 
        position: 'relative', 
        zIndex: 1,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
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
            backgroundColor: 'rgba(233, 74, 2, 0.1)',
            color: '#E94A02',
            padding: '0.5rem 1.25rem',
            borderRadius: '50px',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={16} />
            <span>Why choose us</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            marginBottom: '1rem',
            color: '#020034',
            letterSpacing: '-0.02em'
          }}>
            Why homeowners and renters choose Master
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: '#6b7280',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            The Master brand you know & trust, with the ease of booking online.
          </p>
        </div>

        <div 
          ref={benefitsRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            maxWidth: '1400px',
            margin: '0 auto'
          }}
        >
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="benefit-card"
              style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '2.5rem',
                color: '#111827',
                textAlign: 'left',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Accent Line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: benefit.gradient
              }}></div>

              {/* Icon Container */}
              <div 
                className="benefit-icon"
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  background: `${benefit.color}15`,
                  color: benefit.color
                }}
              >
                {benefit.icon}
              </div>

              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                marginBottom: '0.75rem',
                color: '#020034',
                letterSpacing: '-0.01em'
              }}>
                {benefit.title}
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.7',
                fontSize: '1rem'
              }}>
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div 
          ref={statsRef}
          style={{
            marginTop: '5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            maxWidth: '1000px',
            margin: '5rem auto 0',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
          }}
        >
          {[
            { number: '10,000+', label: 'Happy Customers', color: '#3b82f6' },
            { number: '4.9★', label: 'Average Rating', color: '#fbbf24' },
            { number: '24/7', label: 'Support Available', color: '#10b981' },
            { number: '500+', label: 'Vetted Professionals', color: '#E94A02' }
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                textAlign: 'center',
                padding: '1.5rem'
              }}
            >
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: stat.color,
                marginBottom: '0.5rem',
                letterSpacing: '-0.02em'
              }}>
                {stat.number}
              </div>
              <div style={{
                fontSize: '0.95rem',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseB2C;
