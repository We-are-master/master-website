import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Search, CreditCard, UserCheck } from 'lucide-react';
import { fadeInUp, fadeInUpStrong, fadeInScaleBack, staggerContainerSlow, defaultTransition, springTransition } from '../../hooks/useMotion';

const HowItWorksB2C = () => {
  const steps = [
    { number: 1, icon: <Search size={40} />, title: 'Describe the job', description: "Explain what you need and we'll handle the rest.", color: '#E94A02' },
    { number: 2, icon: <CreditCard size={40} />, title: 'Create your booking', description: 'Transparent pricing, clear options, no hidden costs.', color: '#E94A02' },
    { number: 3, icon: <UserCheck size={40} />, title: 'Get it done!', description: 'We will match you internally with a trusted local professional, it will be managed by Master.', color: '#E94A02' }
  ];

  return (
    <section
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
      <motion.div
        className="animated-bg"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(233, 74, 2, 0.1) 0%, transparent 50%)'
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUpStrong}
          transition={defaultTransition}
          style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', marginBottom: '4rem' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', color: 'white',
            padding: '0.5rem 1.25rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: '600',
            marginBottom: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.2)', fontFamily: 'inherit'
          }}>
            <CheckCircle size={16} />
            <span>Simple & Transparent</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: '800', marginBottom: '1.5rem', color: 'white',
            letterSpacing: '-0.02em', lineHeight: '1.2', fontFamily: 'inherit'
          }}>
            Know the price. Book with confidence.
          </h2>
          <p style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', color: 'rgba(255,255,255,0.9)', lineHeight: '1.7',
            maxWidth: '700px', margin: '0 auto', fontFamily: 'inherit'
          }}>
            We believe property maintenance should be simple. That's why you see the{' '}
            <span style={{ color: '#E94A02', fontWeight: '700', fontFamily: 'inherit' }}>price upfront</span>
            {' '}— before you commit.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInScaleBack}
              transition={springTransition}
              whileHover={{ y: -12, boxShadow: '0 30px 80px rgba(0,0,0,0.4)' }}
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
              <motion.div
                className="step-number"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={springTransition}
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
                  fontFamily: 'inherit'
                }}
              >
                {step.number}
              </motion.div>

              <div style={{
                width: '100px', height: '100px', backgroundColor: `${step.color}15`, borderRadius: '24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.color,
                marginBottom: '1.5rem', marginTop: '1rem'
              }}>
                {step.icon}
              </div>

              <h3 style={{
                fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem', color: '#1d1d1f',
                letterSpacing: '-0.01em', fontFamily: 'inherit'
              }}>
                {step.title}
              </h3>
              <p style={{
                color: '#6b7280', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1.5rem', fontFamily: 'inherit'
              }}>
                {step.description}
              </p>

              {step.number < 3 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', color: step.color,
                  fontWeight: '700', fontSize: '0.95rem', fontFamily: 'inherit'
                }}>
                  <span>Next step</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksB2C;
