import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, Wrench, Package, Lightbulb, Sparkles, Droplets, Zap, Hammer, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const PopularServicesB2C = () => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);

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

      // Animate cards with stagger
      const cards = cardsRef.current ? Array.from(cardsRef.current.children) : [];
      if (cards && cards.length > 0) {
        gsap.fromTo(cards,
          {
            opacity: 0,
            y: 60,
            scale: 0.9
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
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

  // Helper function to get optimized image URL for mobile/desktop
  const getOptimizedImage = (baseUrl) => {
    // For mobile, use smaller images (400px width), for desktop use 600px
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const width = isMobile ? 400 : 600;
    // Remove existing width/height params and add optimized ones
    const url = new URL(baseUrl);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('h', Math.round(width * 0.67).toString());
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('auto', 'format');
    url.searchParams.set('q', '75'); // Quality 75% for better compression
    return url.toString();
  };

  const popularServices = [
    {
      icon: <Tv size={32} />,
      title: 'TV mounting',
      description: 'Professional TV installation and mounting service',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1',
      color: '#3b82f6'
    },
    {
      icon: <Wrench size={32} />,
      title: 'Odd jobs',
      description: 'General handyman services for your home',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
      color: '#f59e0b'
    },
    {
      icon: <Package size={32} />,
      title: 'Flatpack assembly',
      description: 'Furniture assembly and installation',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
      color: '#10b981'
    },
    {
      icon: <Lightbulb size={32} />,
      title: 'Light fitting replacement',
      description: 'Professional light installation and replacement',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0',
      color: '#fbbf24'
    },
    {
      icon: <Sparkles size={32} />,
      title: 'Cleaning services',
      description: 'Deep clean, end of tenancy, and more',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
      color: '#8b5cf6'
    },
    {
      icon: <Droplets size={32} />,
      title: 'Plumbing',
      description: 'Emergency repairs and installations',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4',
      color: '#06b6d4'
    },
    {
      icon: <Zap size={32} />,
      title: 'Electrical',
      description: 'Safe and certified electrical work',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e',
      color: '#f59e0b'
    },
    {
      icon: <Hammer size={32} />,
      title: 'Carpentry',
      description: 'Custom woodwork and repairs',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c',
      color: '#dc2626'
    }
  ];

  const handleServiceClick = (service, e) => {
    // Animate card click
    gsap.to(e.currentTarget, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        // Cleaning services should go directly to cleaning booking form
        const isCleaning = service.title.toLowerCase().includes('cleaning') || service.title.toLowerCase().includes('clean');
        if (isCleaning) {
          navigate('/cleaning-booking');
        } else {
          navigate('/booking', { state: { service: service.title } });
        }
      }
    });
  };

  return (
    <section 
      ref={sectionRef}
      style={{ 
        padding: '8rem 0',
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw'
      }}
      >
      {/* Subtle Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.01) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        opacity: 0.5
      }}></div>

      <div className="container" style={{ 
        position: 'relative', 
        zIndex: 1,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <div ref={titleRef} style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: '600',
            color: '#1d1d1f',
            marginBottom: '1.5rem',
            letterSpacing: '-0.04em',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
          }}>
            Popular services
          </h2>
          <p style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
            color: '#86868b',
            maxWidth: '640px',
            margin: '0 auto',
            lineHeight: '1.5',
            letterSpacing: '-0.01em',
            fontWeight: '400'
          }}>
            From quick fixes to major installations, we've got you covered
          </p>
        </div>

        <div 
          ref={cardsRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            maxWidth: '1400px',
            margin: '0 auto'
          }}
        >
          {popularServices.map((service, index) => (
            <div
              key={index}
              className="service-card"
              onClick={(e) => handleServiceClick(service, e)}
              onMouseEnter={(e) => {
                setHoveredIndex(index);
                gsap.to(e.currentTarget, {
                  y: -4,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
                  duration: 0.3,
                  ease: 'cubic-bezier(0.4, 0, 0.2, 1)'
                });
                const icon = e.currentTarget.querySelector('.service-icon');
                const image = e.currentTarget.querySelector('.service-image');
                if (icon) {
                  gsap.to(icon, {
                    rotation: 5,
                    scale: 1.1,
                    duration: 0.4,
                    ease: 'back.out(1.7)'
                  });
                }
                if (image) {
                  gsap.to(image, {
                    scale: 1.1,
                    duration: 0.6,
                    ease: 'power2.out'
                  });
                }
              }}
              onMouseLeave={(e) => {
                setHoveredIndex(null);
                gsap.to(e.currentTarget, {
                  y: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                  duration: 0.3
                });
                const icon = e.currentTarget.querySelector('.service-icon');
                const image = e.currentTarget.querySelector('.service-image');
                if (icon) {
                  gsap.to(icon, {
                    rotation: 0,
                    scale: 1,
                    duration: 0.4
                  });
                }
                if (image) {
                  gsap.to(image, {
                    scale: 1,
                    duration: 0.6
                  });
                }
              }}
              style={{
                cursor: 'pointer',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.06)',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Image Container */}
              <div style={{
                width: '100%',
                height: '200px',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#f3f4f6'
              }}>
                <img
                  src={getOptimizedImage(service.image)}
                  alt={service.title}
                  className="service-image"
                  loading="lazy"
                  decoding="async"
                  fetchpriority={index < 4 ? "high" : "low"}
                  width="400"
                  height="267"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                {/* Gradient Overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${service.color}40 0%, transparent 100%)`
                }}></div>
                {/* Icon Badge */}
                <div 
                  className="service-icon"
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    color: service.color
                  }}
                >
                  {service.icon}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1d1d1f',
                  marginBottom: '0.5rem',
                  letterSpacing: '-0.01em'
                }}>
                  {service.title}
                </h3>
                <p style={{
                  color: '#86868b',
                  fontSize: '0.9375rem',
                  lineHeight: '1.5',
                  marginBottom: '1rem',
                  fontWeight: '400'
                }}>
                  {service.description}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: service.color,
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  letterSpacing: '-0.01em'
                }}>
                  <span>Book now</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default PopularServicesB2C;
