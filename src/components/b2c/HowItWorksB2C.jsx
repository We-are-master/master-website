import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle, Search, CreditCard, UserCheck } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const HowItWorksB2C = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const stepsRef = useRef(null);
  const bgRef = useRef(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate background pulse
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          opacity: 0.8,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
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
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Animate steps with stagger
      const steps = stepsRef.current ? Array.from(stepsRef.current.children) : [];
      if (steps && steps.length > 0) {
        gsap.fromTo(steps,
          {
            opacity: 0,
            y: 80,
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.2,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: stepsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );

        // Add hover animations to steps
        steps.forEach((step) => {
          const stepNumber = step.querySelector('.step-number');
          step.addEventListener('mouseenter', () => {
            gsap.to(step, {
              y: -12,
              boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
              duration: 0.4,
              ease: 'power2.out'
            });
            if (stepNumber) {
              gsap.to(stepNumber, {
                scale: 1.1,
                rotation: 360,
                duration: 0.6,
                ease: 'back.out(1.7)'
              });
            }
          });

          step.addEventListener('mouseleave', () => {
            gsap.to(step, {
              y: 0,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              duration: 0.4
            });
            if (stepNumber) {
              gsap.to(stepNumber, {
                scale: 1,
                rotation: 0,
                duration: 0.4
              });
            }
          });
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Helper function to get optimized image URL
  const getOptimizedImage = (baseUrl) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const width = isMobile ? 400 : 500;
    const url = new URL(baseUrl);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('h', Math.round(width * 0.75).toString());
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('auto', 'format');
    url.searchParams.set('q', '75');
    return url.toString();
  };

  const steps = [
    {
      number: 1,
      icon: <Search size={32} />,
      title: 'Describe the job',
      description: "Explain what you need and we'll handle the rest.",
      color: '#E94A02',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692'
    },
    {
      number: 2,
      icon: <CreditCard size={32} />,
      title: 'Create your booking',
      description: 'Transparent pricing, clear options, no hidden costs.',
      color: '#E94A02',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d'
    },
    {
      number: 3,
      icon: <UserCheck size={32} />,
      title: 'Get it done!',
      description: 'We will match you internally with a trusted local professional, it will be managed by Master.',
      color: '#E94A02',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      style={{
        padding: '6rem 0',
        background: '#020034',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
      }}
    >
      {/* Animated Background */}
      <div 
        ref={bgRef}
        className="animated-bg"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(233, 74, 2, 0.1) 0%, transparent 50%)',
          opacity: 0.5
        }}
      ></div>

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
            maxWidth: '900px',
            margin: '0 auto',
            textAlign: 'center',
            marginBottom: '4rem'
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            padding: '0.5rem 1.25rem',
            borderRadius: '50px',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
          }}>
            <CheckCircle size={16} />
            <span>Simple & Transparent</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: '800',
            marginBottom: '1.5rem',
            color: 'white',
            letterSpacing: '-0.02em',
            lineHeight: '1.2',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
          }}>
            Know the price. Book with confidence.
          </h2>
          <p style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: '1.7',
            maxWidth: '700px',
            margin: '0 auto',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
          }}>
            We believe property maintenance should be simple. That's why you see the{' '}
            <span style={{
              color: '#FF6B00',
              fontWeight: '700',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              price upfront
            </span>
            {' '}— before you commit.
          </p>
        </div>

        <div 
          ref={stepsRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}
        >
          {steps.map((step, index) => (
            <div
              key={index}
              className="step-card"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '24px',
                padding: '2.5rem',
                color: '#1d1d1f',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer'
              }}
            >
              {/* Number Badge */}
              <div 
                className="step-number"
                style={{
                  position: 'absolute',
                  top: '-1.5rem',
                  left: '2.5rem',
                  width: '56px',
                  height: '56px',
                  background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}dd 100%)`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '1.5rem',
                  boxShadow: `0 8px 20px ${step.color}40`,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
                }}
              >
                {step.number}
              </div>

              {/* Icon */}
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: `${step.color}15`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: step.color,
                marginBottom: '1.5rem',
                marginTop: '1rem'
              }}>
                {step.icon}
              </div>

              {/* Image */}
              <div style={{
                width: '100%',
                height: '180px',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '1.5rem',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: imageErrors[step.number] 
                  ? `linear-gradient(135deg, ${step.color}15 0%, ${step.color}08 100%)`
                  : '#f3f4f6'
              }}>
                {imageErrors[step.number] ? (
                  <div style={{
                    color: step.color,
                    fontSize: '3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {step.icon}
                  </div>
                ) : (
                  <img
                    src={getOptimizedImage(step.image)}
                    alt={step.title}
                    loading="lazy"
                    decoding="async"
                    fetchpriority={step.number === 1 ? "high" : "low"}
                    width="400"
                    height="300"
                    onError={() => {
                      setImageErrors(prev => ({ ...prev, [step.number]: true }));
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                )}
              </div>

              <h3 style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                marginBottom: '1rem',
                color: '#1d1d1f',
                letterSpacing: '-0.01em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                {step.title}
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.7',
                fontSize: '1.05rem',
                marginBottom: '1.5rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                {step.description}
              </p>

              {step.number < 3 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: step.color,
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
                }}>
                  <span>Next step</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksB2C;
