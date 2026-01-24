import React, { useEffect, useRef } from 'react'
import { Users, Shield, Star, Award, CheckCircle, Target, Zap, ArrowRight, Phone } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const About = () => {
  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const storyRef = useRef(null)
  const valuesRef = useRef(null)
  const certsRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate hero
      if (heroRef.current) {
        gsap.fromTo(heroRef.current.querySelector('h1'),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        )
        gsap.fromTo(heroRef.current.querySelector('p'),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' }
        )
      }

      // Animate stats
      if (statsRef.current) {
        const stats = Array.from(statsRef.current.children)
        gsap.fromTo(stats,
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%'
            }
          }
        )
      }

      // Animate story section
      if (storyRef.current) {
        const elements = storyRef.current.querySelectorAll('h2, p, .mission-card')
        gsap.fromTo(elements,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: storyRef.current,
              start: 'top 75%'
            }
          }
        )
      }

      // Animate values
      if (valuesRef.current) {
        const cards = Array.from(valuesRef.current.children)
        gsap.fromTo(cards,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: valuesRef.current,
              start: 'top 75%'
            }
          }
        )

        // Add hover animations
        cards.forEach((card) => {
          const icon = card.querySelector('.value-icon')
          card.addEventListener('mouseenter', () => {
            gsap.to(card, {
              y: -4,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
              duration: 0.3,
              ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 10
            })
            if (icon) {
              gsap.to(icon, {
                scale: 1.1,
                rotation: 5,
                duration: 0.3
              })
            }
          })
          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              y: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
              duration: 0.3,
              zIndex: 1
            })
            if (icon) {
              gsap.to(icon, {
                scale: 1,
                rotation: 0,
                duration: 0.3
              })
            }
          })
        })
      }

      // Animate certifications
      if (certsRef.current) {
        const certs = Array.from(certsRef.current.children)
        gsap.fromTo(certs,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: certsRef.current,
              start: 'top 80%'
            }
          }
        )
      }

      // Animate CTA
      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 80%'
            }
          }
        )
      }
    })

    return () => ctx.revert()
  }, [])

  const stats = [
    { number: "240+", label: "Vetted Professionals" },
    { number: "23K+", label: "Jobs Completed" },
    { number: "500+", label: "Business Clients" },
    { number: "4.8", label: "Star Rating" }
  ]

  const values = [
    {
      icon: <Shield size={28} />,
      title: "Trust & Safety",
      description: "Every professional undergoes thorough DBS checks and background verification. We're fully insured with £5M coverage for complete peace of mind.",
      color: '#3b82f6'
    },
    {
      icon: <Zap size={28} />,
      title: "Efficiency & Speed",
      description: "Our streamlined process ensures quick quotes and same-day service whenever possible. Technology-driven matching for optimal results.",
      color: '#f59e0b'
    },
    {
      icon: <Star size={28} />,
      title: "Quality Excellence",
      description: "We maintain exceptional service standards with experienced professionals dedicated to delivering consistent, top-rated results.",
      color: '#E94A02'
    },
    {
      icon: <Users size={28} />,
      title: "Partnership Approach",
      description: "We work as an extension of your team, understanding your business needs and providing tailored solutions for long-term success.",
      color: '#10b981'
    }
  ]

  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      minHeight: '100vh',
      overflowX: 'hidden',
      width: '100%',
      maxWidth: '100vw'
    }}>
      {/* Hero Section */}
      <section 
        ref={heroRef}
        style={{
          padding: '8rem 0 6rem',
          background: '#020034',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100vw'
        }}
      >
        {/* Subtle Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(233, 74, 2, 0.12) 0%, transparent 50%)',
          zIndex: 1
        }}></div>
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

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '600',
              color: 'white',
              marginBottom: '1.5rem',
              letterSpacing: '-0.04em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
              lineHeight: '1.1'
            }}>
              About Master Services
            </h1>
            <p style={{
              fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: '1.5',
              maxWidth: '720px',
              margin: '0 auto',
              letterSpacing: '-0.01em',
              fontWeight: '400'
            }}>
              We're revolutionising property maintenance for businesses across London. 
              Our mission is to make property management simple, efficient, and reliable 
              through technology and exceptional service.
            </p>

            {/* Stats */}
            <div 
              ref={statsRef}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '2rem',
                maxWidth: '800px',
                margin: '4rem auto 0'
              }}
            >
              {stats.map((stat, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                    fontWeight: '600',
                    color: '#E94A02',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.03em',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: '400',
                    letterSpacing: '-0.01em'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section 
        ref={storyRef}
        style={{ 
          padding: '6rem 0', 
          backgroundColor: '#fbfbfd',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100vw'
        }}
      >
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem',
            alignItems: 'start'
          }}>
            <div>
              <h2 style={{
                fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                fontWeight: '600',
                color: '#1d1d1f',
                marginBottom: '2rem',
                letterSpacing: '-0.03em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                Our Story
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <p style={{
                  fontSize: '1.0625rem',
                  color: '#86868b',
                  lineHeight: '1.6',
                  fontWeight: '400'
                }}>
                  Master Services was founded with a simple vision: to transform how businesses 
                  manage their property maintenance needs. We recognised that traditional 
                  maintenance services were fragmented, unreliable, and lacked transparency.
                </p>
                <p style={{
                  fontSize: '1.0625rem',
                  color: '#86868b',
                  lineHeight: '1.6',
                  fontWeight: '400'
                }}>
                  Starting with a small team of trusted professionals, we've grown to become 
                  London's leading property maintenance platform, serving over 500 businesses 
                  and completing more than 23,000 jobs with exceptional results.
                </p>
                <p style={{
                  fontSize: '1.0625rem',
                  color: '#86868b',
                  lineHeight: '1.6',
                  fontWeight: '400'
                }}>
                  Today, we combine cutting-edge technology with a network of 240+ vetted 
                  professionals to deliver seamless, reliable, and transparent property 
                  maintenance services that businesses can trust.
                </p>
              </div>
            </div>
            <div 
              className="mission-card"
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.06)'
              }}
            >
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1d1d1f',
                marginBottom: '1rem',
                letterSpacing: '-0.02em'
              }}>
                Our Mission
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#86868b',
                lineHeight: '1.6',
                marginBottom: '2rem',
                fontWeight: '400'
              }}>
                To provide businesses with a smarter, more efficient way to manage 
                property maintenance through technology, quality service, and trusted partnerships.
              </p>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1d1d1f',
                marginBottom: '1rem',
                letterSpacing: '-0.02em'
              }}>
                Our Vision
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#86868b',
                lineHeight: '1.6',
                fontWeight: '400'
              }}>
                To be the UK's most trusted property maintenance platform, 
                empowering businesses to focus on growth while we handle the rest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section style={{ 
        padding: '6rem 0', 
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw',
        position: 'relative'
      }}>
        <div className="container" style={{ 
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '600',
              color: '#1d1d1f',
              marginBottom: '1rem',
              letterSpacing: '-0.03em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              Our Values
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: '#86868b',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.5',
              fontWeight: '400'
            }}>
              The principles that guide everything we do
            </p>
          </div>

          <div 
            ref={valuesRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              maxWidth: '1200px',
              margin: '0 auto',
              width: '100%',
              overflow: 'visible'
            }}
          >
            {values.map((value, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '2rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  overflow: 'visible',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <div 
                  className="value-icon"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    backgroundColor: `${value.color}12`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: value.color,
                    marginBottom: '1.5rem'
                  }}
                >
                  {value.icon}
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1d1d1f',
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.02em'
                }}>
                  {value.title}
                </h3>
                <p style={{
                  fontSize: '0.9375rem',
                  color: '#86868b',
                  lineHeight: '1.6',
                  fontWeight: '400'
                }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Awards */}
      <section style={{ 
        padding: '6rem 0', 
        background: '#020034', 
        position: 'relative', 
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw'
      }}>
        {/* Background Pattern */}
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

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '600',
              color: 'white',
              marginBottom: '1rem',
              letterSpacing: '-0.03em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              Certifications & Recognition
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'rgba(255,255,255,0.7)',
              fontWeight: '400'
            }}>
              Trusted by industry leaders and recognised for excellence
            </p>
          </div>

          <div 
            ref={certsRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              maxWidth: '1000px',
              margin: '0 auto'
            }}
          >
            {[
              { icon: <Award size={32} />, title: 'DBS Certified', desc: 'All professionals background checked' },
              { icon: <Shield size={32} />, title: '£5M Insured', desc: 'Comprehensive coverage' },
              { icon: <Star size={32} />, title: '4.8 Star Rating', desc: 'Verified by Trustindex' },
              { icon: <Target size={32} />, title: 'ISO Certified', desc: 'Quality management systems' }
            ].map((cert, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ color: '#E94A02', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                  {cert.icon}
                </div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.01em'
                }}>
                  {cert.title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: '400'
                }}>
                  {cert.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '6rem 0', 
        backgroundColor: '#fbfbfd',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw'
      }}>
        <div className="container">
          <div 
            ref={ctaRef}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '4rem 2rem',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.06)',
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '600',
              color: '#1d1d1f',
              marginBottom: '1rem',
              letterSpacing: '-0.03em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}>
              Ready to Partner with Us?
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: '#86868b',
              marginBottom: '2.5rem',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.5',
              fontWeight: '400'
            }}>
              Join hundreds of businesses who trust Master for their property maintenance needs. 
              Let's discuss how we can help streamline your operations.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link
                to="/contact"
                style={{
                  backgroundColor: '#E94A02',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '-0.01em'
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    backgroundColor: '#d13d00',
                    scale: 1.02,
                    duration: 0.3
                  })
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    backgroundColor: '#E94A02',
                    scale: 1,
                    duration: 0.3
                  })
                }}
              >
                <span>Get Started Today</span>
                <ArrowRight size={18} />
              </Link>
              <a
                href="tel:+447983182332"
                style={{
                  backgroundColor: 'transparent',
                  color: '#1d1d1f',
                  border: '1px solid rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '-0.01em'
                }}
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    backgroundColor: '#f5f5f7',
                    borderColor: 'rgba(0,0,0,0.3)',
                    duration: 0.3
                  })
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(0,0,0,0.2)',
                    duration: 0.3
                  })
                }}
              >
                <Phone size={18} />
                <span>Call +44 7983 182332</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
