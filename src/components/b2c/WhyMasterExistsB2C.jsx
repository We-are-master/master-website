import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const WhyMasterExistsB2C = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const contentRef = useRef(null);

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

      // Animate content paragraphs with stagger
      if (contentRef.current) {
        const paragraphs = contentRef.current.querySelectorAll('p');
        gsap.fromTo(paragraphs,
          {
            opacity: 0,
            y: 30
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

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
      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(233, 74, 2, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 1
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(32, 1, 175, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: 1
      }}></div>

      <div className="container" style={{ 
        position: 'relative', 
        zIndex: 2,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          {/* Headline */}
          <h2 
            ref={titleRef}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: '900',
              marginBottom: '3rem',
              color: 'white',
              letterSpacing: '-0.02em',
              lineHeight: '1.2',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}
          >
            Stop chasing trades. Start getting jobs done properly.
          </h2>

          {/* Body Copy */}
          <div 
            ref={contentRef}
            style={{
              textAlign: 'left',
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            <p style={{
              fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
              color: 'rgba(255,255,255,0.95)',
              lineHeight: '1.8',
              marginBottom: '1.5rem',
              fontWeight: '500',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              Finding reliable trades shouldn't feel like a gamble.
            </p>

            <p style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              color: 'rgba(255,255,255,0.9)',
              lineHeight: '1.8',
              marginBottom: '1.5rem',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              Most platforms simply pass you a contact and step away.
            </p>

            <div style={{
              marginBottom: '2rem',
              paddingLeft: '1.5rem'
            }}>
              <p style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.8',
                marginBottom: '0.75rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                No clear scope.
              </p>
              <p style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.8',
                marginBottom: '0.75rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                No real accountability.
              </p>
              <p style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.8',
                marginBottom: '0.75rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                Prices change.
              </p>
              <p style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.8',
                marginBottom: '0.75rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                Quality varies.
              </p>
              <p style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.8',
                marginBottom: '1.5rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                And when something goes wrong, you're left chasing answers.
              </p>
            </div>

            <p style={{
              fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
              color: 'rgba(255,255,255,0.95)',
              lineHeight: '1.8',
              marginBottom: '2rem',
              fontWeight: '600',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              Master exists to change that.
            </p>

            <p style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              color: 'rgba(255,255,255,0.9)',
              lineHeight: '1.8',
              marginBottom: '1.5rem',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              We don't just connect you to a tradesperson — we manage the job properly.
            </p>

            <p style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
              color: 'rgba(255,255,255,0.9)',
              lineHeight: '1.8',
              marginBottom: '2rem',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              From the moment you book to the final checks, Master stays accountable for delivery,
              quality, and communication.
            </p>

            <div style={{
              marginBottom: '2rem',
              paddingLeft: '1.5rem'
            }}>
              <p style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.8',
                marginBottom: '0.75rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                Every job follows a clear process.
              </p>
              <p style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.8',
                marginBottom: '0.75rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                Every professional is vetted and insured.
              </p>
              <p style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.8',
                marginBottom: '0.75rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                Every booking has defined scope and pricing.
              </p>
            </div>

            <div style={{
              marginBottom: '2rem',
              paddingLeft: '1.5rem'
            }}>
              <p style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.8',
                marginBottom: '0.75rem',
                fontWeight: '600',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                No guesswork.
              </p>
              <p style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.8',
                marginBottom: '0.75rem',
                fontWeight: '600',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                No disappearing contractors.
              </p>
              <p style={{
                fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.8',
                marginBottom: '1.5rem',
                fontWeight: '600',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                No chaos.
              </p>
            </div>

            <p style={{
              fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
              color: '#FFD700',
              lineHeight: '1.8',
              fontWeight: '700',
              textAlign: 'center',
              marginTop: '2rem',
              textShadow: '0 2px 10px rgba(255, 215, 0, 0.3)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              Just property services, done the right way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyMasterExistsB2C;
