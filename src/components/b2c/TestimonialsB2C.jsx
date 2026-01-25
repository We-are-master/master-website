import React, { useEffect, useRef } from 'react';
import { Star, Quote, MessageCircle, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const TestimonialsB2C = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate title section
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

      // Animate testimonial cards with stagger
      const cards = cardsRef.current ? Array.from(cardsRef.current.children) : [];
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
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const testimonials = [
    {
      name: 'Sarah M.',
      id: '5412',
      rating: 5,
      content: 'The platform is easy to use, described the job I needed doing and was able to choose 3 time slots. My job was booked in less than 24 hours! The tradesperson was able to fix an extended curtain rail under 3 hours and he even vacuumed after he was done. Top job!',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      location: 'Hornsey, London'
    },
    {
      name: 'James T.',
      id: '3287',
      rating: 5,
      content: 'Excellent service from start to finish. The TV mounting was done perfectly and the tradesperson was professional and tidy. Would definitely use again!',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      location: 'Islington, London'
    },
    {
      name: 'Emma L.',
      id: '4521',
      rating: 5,
      content: 'Quick response time and great quality work. The flatpack assembly was completed faster than I expected and everything looks perfect. Highly recommend!',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      location: 'Camden, London'
    },
    {
      name: 'Michael R.',
      id: '3892',
      rating: 5,
      content: 'The pricing was clear upfront, no surprises. The handyman arrived on time and completed all the odd jobs I had listed. Very satisfied with the service.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      location: 'Westminster, London'
    },
    {
      name: 'Lisa K.',
      id: '5123',
      rating: 5,
      content: 'Professional service and great value for money. The light fitting replacement was done quickly and safely. Will definitely book again for future jobs.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      location: 'Kensington, London'
    },
    {
      name: 'David P.',
      id: '6234',
      rating: 5,
      content: 'Outstanding cleaning service! The end of tenancy clean was thorough and the team was punctual. My landlord was very impressed. Worth every penny!',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      location: 'Hackney, London'
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
      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(233, 74, 2, 0.05) 0%, transparent 70%)',
        borderRadius: '50%'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        left: '-150px',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(32, 1, 175, 0.05) 0%, transparent 70%)',
        borderRadius: '50%'
      }}></div>

      <div className="container" style={{ 
        position: 'relative', 
        zIndex: 1,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <div ref={titleRef} style={{ textAlign: 'center', marginBottom: '4rem' }}>
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
            <Star size={16} style={{ fill: 'currentColor' }} />
            <span>Trusted by thousands</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '800',
            color: '#020034',
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
          }}>
            Hear from people who've used Master
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Real reviews from real customers across London.
          </p>
        </div>

        <div 
          ref={cardsRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
                position: 'relative',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  y: -8,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  duration: 0.4,
                  ease: 'power2.out'
                });
                gsap.to(e.currentTarget.querySelector('.quote-icon'), {
                  rotation: 5,
                  scale: 1.1,
                  duration: 0.4,
                  ease: 'back.out(1.7)'
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  y: 0,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  duration: 0.4
                });
                gsap.to(e.currentTarget.querySelector('.quote-icon'), {
                  rotation: 0,
                  scale: 1,
                  duration: 0.4
                });
              }}
            >
              {/* Message Bubble with Number */}
              <div 
                className="quote-icon"
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#E94A02',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(233, 74, 2, 0.3)'
                }}
              >
                90
              </div>

              {/* Rating */}
              <div style={{
                display: 'flex',
                gap: '0.25rem',
                marginBottom: '1.25rem',
                color: '#fbbf24'
              }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={20} style={{ fill: 'currentColor' }} />
                ))}
              </div>

              {/* Content */}
              <p style={{
                color: '#374151',
                lineHeight: '1.7',
                marginBottom: '1.5rem',
                fontSize: '1rem',
                fontStyle: 'italic'
              }}>
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #f3f4f6'
              }}>
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  loading="lazy"
                  decoding="async"
                  width="56"
                  height="56"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #f3f4f6'
                  }}
                />
                <div>
                  <p style={{
                    fontWeight: '700',
                    color: '#020034',
                    margin: 0,
                    fontSize: '1rem'
                  }}>
                    {testimonial.name}
                  </p>
                  <p style={{
                    color: '#6b7280',
                    margin: '0.25rem 0 0 0',
                    fontSize: '0.875rem'
                  }}>
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div style={{
          textAlign: 'center',
          marginTop: '4rem'
        }}>
          <button
            onClick={() => {
              // Handle CTA action - can navigate to booking or scroll to search
              const heroSection = document.querySelector('.hero-search-container');
              if (heroSection) {
                heroSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            style={{
              backgroundColor: '#E94A02',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '1.5rem 4rem',
              fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 30px rgba(233, 74, 2, 0.3)'
            }}
            onMouseEnter={(e) => {
              gsap.to(e.target, {
                backgroundColor: '#d13d00',
                scale: 1.05,
                boxShadow: '0 12px 40px rgba(233, 74, 2, 0.4)',
                duration: 0.3
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.target, {
                backgroundColor: '#E94A02',
                scale: 1,
                boxShadow: '0 8px 30px rgba(233, 74, 2, 0.3)',
                duration: 0.3
              });
            }}
          >
            <span>Let's Book a Job Now</span>
            <ArrowRight size={24} />
          </button>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsB2C;
