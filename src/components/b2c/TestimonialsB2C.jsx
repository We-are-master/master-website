import React from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { fadeInUpStrong, fadeInScale, staggerContainer, defaultTransition, springTransition } from '../../hooks/useMotion';

const testimonials = [
  { name: 'Sarah M.', id: '5412', rating: 5, content: "The platform is easy to use, described the job I needed doing and was able to choose 3 time slots. My job was booked in less than 24 hours! The tradesperson was able to fix an extended curtain rail under 3 hours and he even vacuumed after he was done. Top job!", avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', location: 'Hornsey, London' },
  { name: 'James T.', id: '3287', rating: 5, content: 'Excellent service from start to finish. The TV mounting was done perfectly and the tradesperson was professional and tidy. Would definitely use again!', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', location: 'Islington, London' },
  { name: 'Emma L.', id: '4521', rating: 5, content: 'Quick response time and great quality work. The flatpack assembly was completed faster than I expected and everything looks perfect. Highly recommend!', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', location: 'Camden, London' },
  { name: 'Michael R.', id: '3892', rating: 5, content: 'The pricing was clear upfront, no surprises. The handyman arrived on time and completed all the odd jobs I had listed. Very satisfied with the service.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', location: 'Westminster, London' },
  { name: 'Lisa K.', id: '5123', rating: 5, content: 'Professional service and great value for money. The light fitting replacement was done quickly and safely. Will definitely book again for future jobs.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', location: 'Kensington, London' },
  { name: 'David P.', id: '6234', rating: 5, content: 'Outstanding cleaning service! The end of tenancy clean was thorough and the team was punctual. My landlord was very impressed. Worth every penny!', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', location: 'Hackney, London' }
];

const TestimonialsB2C = () => {
  const scrollToSearch = () => {
    const heroSection = document.querySelector('.hero-search-container');
    if (heroSection) heroSection.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      style={{
        padding: '6rem 0',
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
            backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', color: 'rgba(255, 255, 255, 0.8)',
            padding: '0.5rem 1.25rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: '600',
            marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'inherit'
          }}>
            <Star size={16} style={{ fill: 'currentColor' }} />
            <span>Trusted by thousands</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', color: 'white', marginBottom: '1rem',
            letterSpacing: '-0.02em', fontFamily: 'inherit'
          }}>
            Hear from people who've used Master
          </h2>
          <p style={{
            fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto', fontFamily: 'inherit'
          }}>
            Real reviews from real customers across the UK.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
          }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={fadeInScale}
              transition={defaultTransition}
              whileHover={{ y: -8, boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(233, 74, 2, 0.3)' }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <motion.div
                className="quote-icon"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={springTransition}
                style={{
                  position: 'absolute', top: '1.5rem', right: '1.5rem', width: '48px', height: '48px',
                  backgroundColor: '#E94A02', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 12px rgba(233, 74, 2, 0.3)'
                }}
              >
                90
              </motion.div>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', color: '#fbbf24' }}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={20} style={{ fill: 'currentColor' }} />
                ))}
              </div>
              <p style={{
                color: 'rgba(255,255,255,0.9)', lineHeight: '1.7', marginBottom: '1.5rem', fontSize: '1rem',
                fontStyle: 'italic', fontFamily: 'inherit'
              }}>
                "{testimonial.content}"
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  loading="lazy"
                  decoding="async"
                  width="56"
                  height="56"
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.1)' }}
                />
                <div>
                  <p style={{ fontWeight: '700', color: 'white', margin: 0, fontSize: '1rem', fontFamily: 'inherit' }}>{testimonial.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0.25rem 0 0 0', fontSize: '0.875rem', fontFamily: 'inherit' }}>{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <motion.button
            onClick={scrollToSearch}
            whileHover={{ backgroundColor: '#d13d00', scale: 1.05, boxShadow: '0 12px 40px rgba(233, 74, 2, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
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
              boxShadow: '0 8px 30px rgba(233, 74, 2, 0.3)',
              fontFamily: 'inherit'
            }}
          >
            <span>Let's Book a Job Now</span>
            <ArrowRight size={24} />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsB2C;
