/**
 * Framer Motion variants and helpers for consistent enterprise-grade animations.
 * Used across B2C components for scroll-in, stagger, and hover effects.
 */
import { useInView } from 'framer-motion';

// Reusable variants — Brex/Uber style: subtle, confident, no flashy motion
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 }
};

export const fadeInUpStrong = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 }
};

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 }
};

export const fadeInScaleBack = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

export const staggerContainerSlow = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

// Default transition for most scroll-in animations
export const defaultTransition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94],
  duration: 0.6
};

export const springTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 20
};

/** Hook: ref for scroll-triggered animation (use with motion with whileInView) */
export function useScrollTrigger(options = {}) {
  return useInView({
    once: true,
    amount: 0.2,
    margin: '0px 0px -80px 0px',
    ...options
  });
}

export default {
  fadeInUp,
  fadeInUpStrong,
  fadeInScale,
  fadeInScaleBack,
  staggerContainer,
  staggerContainerSlow,
  defaultTransition,
  springTransition,
  useScrollTrigger
};
