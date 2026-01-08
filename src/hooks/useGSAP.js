import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hook for GSAP animations with ScrollTrigger
 * @param {Function} animationFunction - Function that receives gsap and element ref
 * @param {Object} dependencies - Dependencies array for useEffect
 */
export const useGSAP = (animationFunction, dependencies = []) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current && animationFunction) {
      const ctx = gsap.context(() => {
        animationFunction(gsap, elementRef.current);
      }, elementRef);

      return () => ctx.revert();
    }
  }, dependencies);

  return elementRef;
};

/**
 * Hook for fade in animation on scroll
 */
export const useFadeIn = (delay = 0) => {
  return useGSAP((gsap, el) => {
    gsap.fromTo(
      el,
      {
        opacity: 0,
        y: 50
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
};

/**
 * Hook for slide in from left
 */
export const useSlideInLeft = (delay = 0) => {
  return useGSAP((gsap, el) => {
    gsap.fromTo(
      el,
      {
        opacity: 0,
        x: -100
      },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
};

/**
 * Hook for slide in from right
 */
export const useSlideInRight = (delay = 0) => {
  return useGSAP((gsap, el) => {
    gsap.fromTo(
      el,
      {
        opacity: 0,
        x: 100
      },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
};

/**
 * Hook for scale in animation
 */
export const useScaleIn = (delay = 0) => {
  return useGSAP((gsap, el) => {
    gsap.fromTo(
      el,
      {
        opacity: 0,
        scale: 0.8
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
};

/**
 * Hook for stagger animation (for lists/grids)
 */
export const useStagger = (selector, delay = 0, staggerDelay = 0.1) => {
  return useGSAP((gsap, el) => {
    const items = el.querySelectorAll(selector);
    
    gsap.fromTo(
      items,
      {
        opacity: 0,
        y: 50,
        scale: 0.9
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        delay,
        stagger: staggerDelay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });
};

/**
 * Hook for parallax effect
 */
export const useParallax = (speed = 0.5) => {
  return useGSAP((gsap, el) => {
    gsap.to(el, {
      yPercent: -50 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
};
