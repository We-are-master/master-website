import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUpStrong, fadeInUp, staggerContainerSlow, defaultTransition } from '../../hooks/useMotion';

const paragraphStyle = {
  fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
  color: 'rgba(255,255,255,0.9)',
  lineHeight: '1.8',
  marginBottom: '0.75rem',
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
};

const WhyMasterExistsB2C = () => {
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
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(233, 74, 2, 0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 1
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(32, 1, 175, 0.15) 0%, transparent 70%)', borderRadius: '50%', zIndex: 1
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUpStrong}
            transition={defaultTransition}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', marginBottom: '3rem', color: 'white',
              letterSpacing: '-0.02em', lineHeight: '1.2', fontFamily: 'inherit'
            }}
          >
            Stop chasing trades. Start getting jobs done properly.
          </motion.h2>

          <motion.div
            variants={staggerContainerSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}
          >
            <motion.p variants={fadeInUp} transition={defaultTransition} style={{ ...paragraphStyle, fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', color: 'rgba(255,255,255,0.95)', fontWeight: '500', marginBottom: '1.5rem' }}>
              Finding reliable trades shouldn't feel like a gamble.
            </motion.p>
            <motion.p variants={fadeInUp} transition={defaultTransition} style={{ ...paragraphStyle, marginBottom: '1.5rem' }}>
              Most platforms simply pass you a contact and step away.
            </motion.p>
            <div style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
              {['No clear scope.', 'No real accountability.', 'Prices change.', 'Quality varies.', "And when something goes wrong, you're left chasing answers."].map((text, i) => (
                <motion.p key={i} variants={fadeInUp} transition={defaultTransition} style={{ ...paragraphStyle, marginBottom: i < 4 ? '0.75rem' : '1.5rem' }}>{text}</motion.p>
              ))}
            </div>
            <motion.p variants={fadeInUp} transition={defaultTransition} style={{ ...paragraphStyle, fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', color: 'rgba(255,255,255,0.95)', fontWeight: '600', marginBottom: '2rem' }}>
              Master exists to change that.
            </motion.p>
            <motion.p variants={fadeInUp} transition={defaultTransition} style={{ ...paragraphStyle, marginBottom: '1.5rem' }}>
              We don't just connect you to a tradesperson — we manage the job properly.
            </motion.p>
            <motion.p variants={fadeInUp} transition={defaultTransition} style={{ ...paragraphStyle, marginBottom: '2rem' }}>
              From the moment you book to the final checks, Master stays accountable for delivery, quality, and communication.
            </motion.p>
            <div style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
              {['Every job follows a clear process.', 'Every professional is vetted and insured.', 'Every booking has defined scope and pricing.'].map((text, i) => (
                <motion.p key={i} variants={fadeInUp} transition={defaultTransition} style={paragraphStyle}>{text}</motion.p>
              ))}
            </div>
            <div style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
              {['No guesswork.', 'No disappearing contractors.', 'No chaos.'].map((text, i) => (
                <motion.p key={i} variants={fadeInUp} transition={defaultTransition} style={{ ...paragraphStyle, fontWeight: '600', marginBottom: i < 2 ? '0.75rem' : '1.5rem' }}>{text}</motion.p>
              ))}
            </div>
            <motion.p
              variants={fadeInUp}
              transition={defaultTransition}
              style={{
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', color: '#FFD700', lineHeight: '1.8', fontWeight: '700',
                textAlign: 'center', marginTop: '2rem', textShadow: '0 2px 10px rgba(255, 215, 0, 0.3)', fontFamily: 'inherit'
              }}
            >
              Just property services, done the right way.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyMasterExistsB2C;
