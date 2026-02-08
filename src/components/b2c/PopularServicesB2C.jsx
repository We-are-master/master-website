import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tv, Wrench, Package, Lightbulb, Sparkles, Droplets, Zap, Hammer, ArrowRight } from 'lucide-react';
import { fadeInUpStrong, fadeInScale, staggerContainer, defaultTransition, springTransition } from '../../hooks/useMotion';

const PopularServicesB2C = () => {
  const navigate = useNavigate();

  const getOptimizedImage = (baseUrl) => {
    try {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const width = isMobile ? 400 : 600;
      const url = new URL(baseUrl);
      url.searchParams.set('w', width.toString());
      url.searchParams.set('h', Math.round(width * 0.67).toString());
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('auto', 'format');
      url.searchParams.set('q', '75');
      return url.toString();
    } catch {
      return baseUrl;
    }
  };

  const popularServices = [
    { icon: <Tv size={32} />, title: 'TV mounting', description: 'Professional TV installation and mounting service', image: '/Tv Mount.png', color: '#E94A02' },
    { icon: <Wrench size={32} />, title: 'Odd jobs', description: 'General handyman services for your home', image: '/Odd Jobs.png', color: '#E94A02' },
    { icon: <Package size={32} />, title: 'Flatpack assembly', description: 'Furniture assembly and installation', image: '/Flat Assemble.png', color: '#E94A02' },
    { icon: <Lightbulb size={32} />, title: 'Light fitting replacement', description: 'Professional light installation and replacement', image: '/Light Fitting.png', color: '#E94A02' },
    { icon: <Sparkles size={32} />, title: 'Cleaning services', description: 'Deep clean, end of tenancy, and more', image: '/Cleaning.png', color: '#E94A02' },
    { icon: <Droplets size={32} />, title: 'Plumbing', description: 'Emergency repairs and installations', image: '/Plumber.png', color: '#E94A02' },
    { icon: <Zap size={32} />, title: 'Electrical', description: 'Safe and certified electrical work', image: '/electrician.png', color: '#E94A02' },
    { icon: <Hammer size={32} />, title: 'Carpentry', description: 'Custom woodwork and repairs', image: '/7.png', color: '#E94A02' }
  ];

  const handleServiceClick = (service) => {
    const t = service.title.toLowerCase();
    if (t.includes('cleaning') || t.includes('clean')) navigate('/cleaning-booking');
    else if (t.includes('odd job') || t.includes('handyman')) navigate('/handyman-booking');
    else if (t.includes('carpentry') || t.includes('carpenter')) navigate('/carpentry-booking');
    else if (t.includes('painting') || t.includes('painter')) navigate('/painting-booking');
    else navigate('/booking', { state: { service: service.title } });
  };

  return (
    <section
      style={{
        padding: '8rem 0',
        backgroundColor: '#020034',
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
          style={{ textAlign: 'center', marginBottom: '5rem' }}
        >
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '600', color: 'white', marginBottom: '1.5rem',
            letterSpacing: '-0.04em', fontFamily: 'inherit'
          }}>
            Popular services
          </h2>
          <p style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.375rem)', color: 'rgba(255,255,255,0.7)', maxWidth: '640px',
            margin: '0 auto', lineHeight: '1.5', letterSpacing: '-0.01em', fontWeight: '400', fontFamily: 'inherit'
          }}>
            From quick fixes to major installations, we've got you covered
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            maxWidth: '1400px',
            margin: '0 auto'
          }}
        >
          {popularServices.map((service, index) => (
            <motion.div
              key={index}
              variants={fadeInScale}
              transition={defaultTransition}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleServiceClick(service)}
              style={{
                cursor: 'pointer',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                position: 'relative'
              }}
            >
              <div style={{
                width: '100%', height: '200px', position: 'relative', overflow: 'hidden', backgroundColor: '#f3f4f6'
              }}>
                <motion.img
                  src={service.image.startsWith('/') ? service.image : getOptimizedImage(service.image)}
                  alt={service.title}
                  className="service-image"
                  loading="lazy"
                  decoding="async"
                  fetchPriority={index < 4 ? 'high' : 'low'}
                  width="400"
                  height="267"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.4 }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(135deg, rgba(233, 74, 2, 0.15) 0%, transparent 100%)'
                }} />
                <motion.div
                  className="service-icon"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={springTransition}
                  style={{
                    position: 'absolute', top: '1rem', right: '1rem', width: '48px', height: '48px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', color: service.color
                  }}
                >
                  {service.icon}
                </motion.div>
              </div>

              <div style={{ padding: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.125rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.5rem',
                  letterSpacing: '-0.01em', fontFamily: 'inherit'
                }}>
                  {service.title}
                </h3>
                <p style={{
                  color: '#6b7280', fontSize: '0.9375rem', lineHeight: '1.5', marginBottom: '1rem',
                  fontWeight: '400', fontFamily: 'inherit'
                }}>
                  {service.description}
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', color: service.color,
                  fontWeight: '500', fontSize: '0.875rem', letterSpacing: '-0.01em', fontFamily: 'inherit'
                }}>
                  <span>Book now</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PopularServicesB2C;
