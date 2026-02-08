import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Send, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { SEO } from '../components/SEO'

const fadeInUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }
const transition = { type: 'tween', ease: [0.25, 0.46, 0.45, 0.94], duration: 0.6 }

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    businessEmail: '',
    phoneNumber: '',
    companyName: '',
    businessType: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
  }

  const contactInfo = [
    {
      icon: <Phone size={24} />,
      title: "Phone",
      details: ["+44 7983 182332"],
      description: "Call us for immediate assistance",
      color: '#3b82f6'
    },
    {
      icon: <Mail size={24} />,
      title: "Email",
      details: ["hello@wearemaster.com"],
      description: "Send us an email anytime",
      color: '#E94A02'
    },
    {
      icon: <MapPin size={24} />,
      title: "Address",
      details: ["124 City Rd, London", "EC1V 2NX", "United Kingdom"],
      description: "Visit our London office",
      color: '#10b981'
    },
    {
      icon: <Clock size={24} />,
      title: "Support Hours",
      details: ["Monday-Friday: 08:00-18:00", "Weekends: 08:00-17:00"],
      description: "Available seven days a week",
      color: '#8b5cf6'
    }
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    mainEntity: {
      '@type': 'Organization',
      name: 'Master Services',
      url: 'https://wearemaster.com',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+447983182332',
          contactType: 'Customer Service',
          areaServed: 'GB',
          availableLanguage: 'English'
        },
        {
          '@type': 'ContactPoint',
          email: 'hello@wearemaster.com',
          contactType: 'Customer Service',
          areaServed: 'GB',
          availableLanguage: 'English'
        }
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: '124 City Rd',
        addressLocality: 'London',
        postalCode: 'EC1V 2NX',
        addressCountry: 'GB'
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '18:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Saturday', 'Sunday'],
          opens: '08:00',
          closes: '17:00'
        }
      ]
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
        variants={stagger}
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
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <motion.h1 variants={fadeInUp} transition={transition} style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '600',
              color: 'white',
              marginBottom: '1.5rem',
              letterSpacing: '-0.04em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
              lineHeight: '1.1'
            }}>
              Get in Touch Today
            </motion.h1>
            <motion.p variants={fadeInUp} transition={transition} style={{
              fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: '1.5',
              marginBottom: '2.5rem',
              letterSpacing: '-0.01em',
              fontWeight: '400'
            }}>
              Ready to streamline your property maintenance? Contact our team to discuss 
              how Master can help your business.
            </motion.p>
            <motion.div variants={fadeInUp} transition={transition} style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <motion.a
                href="tel:+447983182332"
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
                <Phone size={18} />
                <span>Call Now</span>
              </motion.a>
              <motion.a
                href="mailto:hello@wearemaster.com"
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.5)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
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
                <Mail size={18} />
                <span>Email Us</span>
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Contact Form & Info */}
      <section style={{ 
        padding: '6rem 0', 
        backgroundColor: '#fbfbfd',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '3rem',
            alignItems: 'start'
          }}>
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={transition}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.06)'
              }}
            >
              <h2 style={{
                fontSize: 'clamp(1.75rem, 3vw, 2rem)',
                fontWeight: '600',
                color: '#1d1d1f',
                marginBottom: '2rem',
                letterSpacing: '-0.02em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
              }}>
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#1d1d1f',
                      marginBottom: '0.5rem',
                      letterSpacing: '-0.01em'
                    }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: '1px solid rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#E94A02'
                        e.target.style.boxShadow = '0 0 0 3px rgba(233, 74, 2, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0,0,0,0.2)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#1d1d1f',
                      marginBottom: '0.5rem',
                      letterSpacing: '-0.01em'
                    }}>
                      Business Email *
                    </label>
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: '1px solid rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#E94A02'
                        e.target.style.boxShadow = '0 0 0 3px rgba(233, 74, 2, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0,0,0,0.2)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#1d1d1f',
                      marginBottom: '0.5rem',
                      letterSpacing: '-0.01em'
                    }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: '1px solid rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#E94A02'
                        e.target.style.boxShadow = '0 0 0 3px rgba(233, 74, 2, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0,0,0,0.2)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#1d1d1f',
                      marginBottom: '0.5rem',
                      letterSpacing: '-0.01em'
                    }}>
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: '1px solid rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#E94A02'
                        e.target.style.boxShadow = '0 0 0 3px rgba(233, 74, 2, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0,0,0,0.2)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#1d1d1f',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Type of Business *
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '1px solid rgba(0,0,0,0.2)',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      fontFamily: 'inherit',
                      backgroundColor: 'white',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#E94A02'
                      e.target.style.boxShadow = '0 0 0 3px rgba(233, 74, 2, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0,0,0,0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <option value="">Select Business Type</option>
                    <option value="property-management">Property Management</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="facilities">Facilities</option>
                    <option value="construction">Construction</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="retail">Retail</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#1d1d1f',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '1px solid rgba(0,0,0,0.2)',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    placeholder="Tell us about your maintenance needs..."
                    onFocus={(e) => {
                      e.target.style.borderColor = '#E94A02'
                      e.target.style.boxShadow = '0 0 0 3px rgba(233, 74, 2, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0,0,0,0.2)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ backgroundColor: '#d13d00', scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    backgroundColor: '#E94A02',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    letterSpacing: '-0.01em'
                  }}
                >
                  <Send size={18} />
                  <span>Send Message</span>
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={stagger}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    transition={transition}
                    whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)' }}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      marginBottom: '1.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <motion.div
                        className="contact-icon"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '10px',
                          backgroundColor: `${info.color}12`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: info.color,
                          flexShrink: 0
                        }}
                      >
                        {info.icon}
                      </motion.div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          color: '#1d1d1f',
                          marginBottom: '0.5rem',
                          letterSpacing: '-0.01em'
                        }}>
                          {info.title}
                        </h3>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#86868b',
                          marginBottom: '0.75rem',
                          fontWeight: '400'
                        }}>
                          {info.description}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {info.details.map((detail, idx) => (
                            <p key={idx} style={{
                              fontSize: '0.9375rem',
                              color: '#1d1d1f',
                              fontWeight: '500',
                              margin: 0
                            }}>
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Quick Response Promise */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: 'tween', ease: [0.34, 1.56, 0.64, 1], duration: 0.5 }}
                style={{
                  backgroundColor: '#020034',
                  borderRadius: '12px',
                  padding: '2rem',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Background Pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                  zIndex: 1
                }}></div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '1.5rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Quick Response Promise
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      'Response within 2 hours',
                      'Quote within same day',
                      'Job completion tracking'
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CheckCircle size={20} style={{ color: '#E94A02', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.9375rem', fontWeight: '400' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}

export default Contact
