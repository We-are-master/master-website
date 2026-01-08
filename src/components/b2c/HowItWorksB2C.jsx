import React, { useEffect, useRef } from 'react';
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
              boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
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
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
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

  const steps = [
    {
      number: 1,
      icon: <Search size={32} />,
      title: 'Describe the job',
      description: 'Tell us what you need, we\'ll get you an instant price.',
      color: '#3b82f6',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop'
    },
    {
      number: 2,
      icon: <CreditCard size={32} />,
      title: 'Create your booking',
      description: 'See the price upfront, choose your time slot, and confirm.',
      color: '#10b981',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop'
    },
    {
      number: 3,
      icon: <UserCheck size={32} />,
      title: 'Get it done!',
      description: 'We\'ll match you with a vetted local tradesperson to get the job done.',
      color: '#E94A02',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f026213?w=400&h=300&fit=crop'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      style={{
        padding: '6rem 0',
        background: 'linear-gradient(135deg, #020034 0%, #2001AF 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw'
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
            border: '1px solid rgba(255, 255, 255, 0.2)'
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
            lineHeight: '1.2'
          }}>
            We can all agree that life's easier when you know what you're paying.
          </h2>
          <p style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: '1.7',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            With Master, you'll see the{' '}
            <span style={{
              color: '#FFD700',
              fontWeight: '700',
              textShadow: '0 2px 10px rgba(255, 215, 0, 0.3)'
            }}>
              cost upfront
            </span>
            {' '}before you book. So you can get the job sorted without the guesswork.
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
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '2.5rem',
                color: '#111827',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
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
                  boxShadow: `0 8px 20px ${step.color}40`
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
                backgroundColor: '#f3f4f6'
              }}>
                <img
                  src={step.image}
                  alt={step.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              <h3 style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                marginBottom: '1rem',
                color: '#020034',
                letterSpacing: '-0.01em'
              }}>
                {step.title}
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.7',
                fontSize: '1.05rem',
                marginBottom: '1.5rem'
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
                  fontSize: '0.95rem'
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
