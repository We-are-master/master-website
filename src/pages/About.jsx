import React from 'react'
import { motion } from 'framer-motion'
import { Users, Shield, Star, Award, CheckCircle, Target, Zap, ArrowRight, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'

const MotionLink = motion(Link)

const fadeInUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }
const fadeInUpStrong = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }
const fadeInScale = { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } }
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }
const staggerSlow = { visible: { transition: { staggerChildren: 0.12 } } }
const transition = { type: 'tween', ease: [0.25, 0.46, 0.45, 0.94], duration: 0.6 }
const spring = { type: 'spring', stiffness: 260, damping: 24 }

const About = () => {
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

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    mainEntity: {
      '@type': 'Organization',
      name: 'Master Services',
      url: 'https://wearemaster.com',
      logo: 'https://wearemaster.com/favicon.png',
      description: 'London\'s leading property maintenance platform, serving over 500 businesses with 240+ vetted professionals.',
      foundingDate: '2020',
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        value: '240+'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '500'
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: '124 City Rd',
        addressLocality: 'London',
        postalCode: 'EC1V 2NX',
        addressCountry: 'GB'
      }
    }
  };

  return (
    <>
      <SEO structuredData={structuredData} />
      <div style={{ 
        backgroundColor: '#ffffff', 
        minHeight: '100vh',
        overflowX: 'hidden',
        width: '100%',
        maxWidth: '100vw'
      }}>
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerSlow}
        style={{
          padding: '8rem 0 6rem',
          background: '#020034',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100vw'
        }}
      >
        {/* Subtle animated gradient orbs */}
        <motion.div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '50%',
            height: '60%',
            background: 'radial-gradient(ellipse, rgba(233, 74, 2, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            zIndex: 1
          }}
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(233, 74, 2, 0.12) 0%, transparent 50%)',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <motion.h1
              variants={fadeInUpStrong}
              transition={transition}
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: '600',
                color: 'white',
                marginBottom: '1.5rem',
                letterSpacing: '-0.04em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
                lineHeight: '1.1'
              }}
            >
              About Master Services
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              transition={transition}
              style={{
                fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: '1.5',
                maxWidth: '720px',
                margin: '0 auto',
                letterSpacing: '-0.01em',
                fontWeight: '400'
              }}
            >
              We're revolutionising property maintenance for businesses across London. 
              Our mission is to make property management simple, efficient, and reliable 
              through technology and exceptional service.
            </motion.p>

            {/* Stats */}
            <motion.div
              variants={stagger}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '2rem',
                maxWidth: '800px',
                margin: '4rem auto 0'
              }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={fadeInScale}
                  transition={spring}
                  whileHover={{ scale: 1.05, y: -2 }}
                  style={{
                    textAlign: 'center',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <motion.div
                    style={{
                      fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                      fontWeight: '600',
                      color: '#E94A02',
                      marginBottom: '0.5rem',
                      letterSpacing: '-0.03em',
                      fontFamily: 'inherit'
                    }}
                  >
                    {stat.number}
                  </motion.div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: '400',
                    letterSpacing: '-0.01em'
                  }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Our Story */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerSlow}
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
            <motion.div variants={fadeInUp} transition={transition}>
              <motion.h2
                variants={fadeInUp}
                transition={transition}
                style={{
                  fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                  fontWeight: '600',
                  color: '#1d1d1f',
                  marginBottom: '2rem',
                  letterSpacing: '-0.03em',
                  fontFamily: 'inherit'
                }}
              >
                Our Story
              </motion.h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  "Master Services was founded with a simple vision: to transform how businesses manage their property maintenance needs. We recognised that traditional maintenance services were fragmented, unreliable, and lacked transparency.",
                  "Starting with a small team of trusted professionals, we've grown to become London's leading property maintenance platform, serving over 500 businesses and completing more than 23,000 jobs with exceptional results.",
                  "Today, we combine cutting-edge technology with a network of 240+ vetted professionals to deliver seamless, reliable, and transparent property maintenance services that businesses can trust."
                ].map((text, i) => (
                  <motion.p
                    key={i}
                    variants={fadeInUp}
                    transition={transition}
                    style={{
                      fontSize: '1.0625rem',
                      color: '#86868b',
                      lineHeight: '1.6',
                      fontWeight: '400'
                    }}
                  >
                    {text}
                  </motion.p>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="mission-card"
              variants={{ hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } }}
              transition={spring}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(233, 74, 2, 0.1)' }}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.06)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #E94A02, #2001AF)',
                opacity: 0.9
              }} />
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
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Our Values */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
        style={{ 
          padding: '6rem 0', 
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100vw',
          position: 'relative'
        }}
      >
        <div className="container" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
          <motion.div variants={fadeInUp} transition={transition} style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '600',
              color: '#1d1d1f',
              marginBottom: '1rem',
              letterSpacing: '-0.03em',
              fontFamily: 'inherit'
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
          </motion.div>

          <motion.div
            variants={stagger}
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
              <motion.div
                key={index}
                variants={fadeInUp}
                transition={transition}
                whileHover={{ 
                  y: -6, 
                  boxShadow: '0 12px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)', 
                  zIndex: 10,
                  borderColor: `${value.color}30`
                }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '2rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  overflow: 'visible',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <motion.div
                  className="value-icon"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={spring}
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
                </motion.div>
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Certifications & Awards */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
        style={{ 
          padding: '6rem 0', 
          background: '#020034', 
          position: 'relative', 
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100vw'
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <motion.div variants={fadeInUp} transition={transition} style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: '600',
              color: 'white',
              marginBottom: '1rem',
              letterSpacing: '-0.03em',
              fontFamily: 'inherit'
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
          </motion.div>

          <motion.div
            variants={stagger}
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
              <motion.div
                key={index}
                variants={fadeInScale}
                transition={spring}
                whileHover={{ 
                  y: -6, 
                  scale: 1.02,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(233, 74, 2, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)'
                }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'default'
                }}
              >
                <motion.div 
                  whileHover={{ scale: 1.15, rotate: 5 }} 
                  transition={spring}
                  style={{ color: '#E94A02', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}
                >
                  {cert.icon}
                </motion.div>
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section style={{ 
        padding: '6rem 0', 
        backgroundColor: '#fbfbfd',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw'
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ ...transition, duration: 0.7 }}
            whileHover={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(233, 74, 2, 0.08)' }}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
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
              <MotionLink
                to="/contact"
                whileHover={{ backgroundColor: '#d13d00', scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                  letterSpacing: '-0.01em'
                }}
              >
                <span>Get Started Today</span>
                <ArrowRight size={18} />
              </MotionLink>
              <motion.a
                href="tel:+447983182332"
                whileHover={{ backgroundColor: '#f5f5f7', borderColor: 'rgba(0,0,0,0.3)' }}
                whileTap={{ scale: 0.98 }}
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
                  letterSpacing: '-0.01em'
                }}
              >
                <Phone size={18} />
                <span>Call +44 7983 182332</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  )
}

export default About
