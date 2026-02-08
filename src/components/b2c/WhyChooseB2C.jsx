import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Clock, Shield, Package, CreditCard, CheckCircle, Sparkles, Award } from 'lucide-react';
import { fadeInUpStrong, fadeInScale, fadeInUp, staggerContainer, staggerContainerSlow, defaultTransition, springTransition } from '../../hooks/useMotion';

const WhyChooseB2C = () => {
  const benefits = [
    { icon: <Tag size={28} />, title: 'Instant Pricing', description: 'See the cost upfront before you book. No hidden fees, no surprises.', color: '#E94A02', gradient: 'linear-gradient(135deg, #E94A02 0%, #d13d00 100%)' },
    { icon: <Clock size={28} />, title: 'Fast & Convenient', description: 'Book in minutes, get it done quickly. Same-day service available.', color: '#E94A02', gradient: 'linear-gradient(135deg, #E94A02 0%, #d13d00 100%)' },
    { icon: <Shield size={28} />, title: 'Checked Tradespeople', description: 'All professionals are vetted, insured, and background-checked.', color: '#E94A02', gradient: 'linear-gradient(135deg, #E94A02 0%, #d13d00 100%)' },
    { icon: <Package size={28} />, title: 'Bundle Tasks Easily', description: 'Add multiple jobs to one booking and save time and money.', color: '#E94A02', gradient: 'linear-gradient(135deg, #E94A02 0%, #d13d00 100%)' },
    { icon: <CreditCard size={28} />, title: 'Secure Payments', description: 'Safe and secure payment processing with industry-leading encryption.', color: '#E94A02', gradient: 'linear-gradient(135deg, #E94A02 0%, #d13d00 100%)' },
    { icon: <CheckCircle size={28} />, title: 'Backed by Master', description: 'Trusted brand with years of experience and thousands of happy customers.', color: '#E94A02', gradient: 'linear-gradient(135deg, #E94A02 0%, #d13d00 100%)' },
    { icon: <Shield size={28} />, title: '£5M Insurance', description: 'Comprehensive insurance coverage for complete peace of mind on every job.', color: '#E94A02', gradient: 'linear-gradient(135deg, #E94A02 0%, #d13d00 100%)' },
    { icon: <Award size={28} />, title: 'Master Club', description: 'Exclusive membership benefits, priority booking, and special discounts.', color: '#E94A02', gradient: 'linear-gradient(135deg, #E94A02 0%, #d13d00 100%)' }
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Customers', color: '#E94A02' },
    { number: '4.9★', label: 'Average Rating', color: '#E94A02' },
    { number: '24/7', label: 'Support Available', color: '#E94A02' },
    { number: '500+', label: 'Vetted Professionals', color: '#E94A02' }
  ];

  return (
    <section
      style={{
        padding: '8rem 0',
        background: '#020034',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px', opacity: 0.5
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUpStrong}
          transition={defaultTransition}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'rgba(233, 74, 2, 0.1)', color: '#E94A02', padding: '0.5rem 1.25rem',
            borderRadius: '50px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem', fontFamily: 'inherit'
          }}>
            <Sparkles size={16} />
            <span>Why choose us</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '600', marginBottom: '1.5rem', color: 'white',
            letterSpacing: '-0.04em', fontFamily: 'inherit'
          }}>
            Why homeowners and renters choose Master
          </h2>
          <p style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.375rem)', color: 'rgba(255,255,255,0.7)', maxWidth: '700px',
            margin: '0 auto', lineHeight: '1.5', letterSpacing: '-0.01em', fontWeight: '400', fontFamily: 'inherit'
          }}>
            The Master brand you know & trust, with the ease of booking online.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            maxWidth: '1400px',
            margin: '0 auto'
          }}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={fadeInScale}
              transition={defaultTransition}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(233, 74, 2, 0.3)' }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                padding: '2rem',
                color: 'white',
                textAlign: 'left',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: benefit.gradient }} />
              <motion.div
                className="benefit-icon"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={springTransition}
                style={{
                  width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem', background: `${benefit.color}12`, color: benefit.color
                }}
              >
                {benefit.icon}
              </motion.div>
              <h3 style={{
                fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: 'white',
                letterSpacing: '-0.02em', fontFamily: 'inherit'
              }}>
                {benefit.title}
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', fontSize: '0.9375rem', fontWeight: '400', fontFamily: 'inherit'
              }}>
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={staggerContainerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          style={{
            marginTop: '5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            maxWidth: '1000px',
            margin: '5rem auto 0',
            padding: '3rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              transition={springTransition}
              style={{ textAlign: 'center', padding: '1.5rem' }}
            >
              <div style={{
                fontSize: '2.25rem', fontWeight: '600', color: stat.color, marginBottom: '0.5rem',
                letterSpacing: '-0.03em', fontFamily: 'inherit'
              }}>
                {stat.number}
              </div>
              <div style={{
                fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', fontWeight: '400',
                letterSpacing: '-0.01em', fontFamily: 'inherit'
              }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseB2C;
