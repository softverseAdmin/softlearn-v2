import type { Variants } from 'framer-motion'

// Page transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

// Container stagger animation
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

// Item animation for containers
export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
}

// Card hover animation
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  hover: {
    y: -4,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
}

// Sidebar animations
export const sidebarVariants: Variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    x: '-100%',
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
}

// Backdrop animation
export const backdropVariants: Variants = {
  open: {
    opacity: 0.5,
    transition: { duration: 0.2 },
  },
  closed: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

// Modal animation
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
}

// Badge/Tag animation
export const badgeVariants: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    scale: 0,
    transition: { duration: 0.1 },
  },
}

// Progress animation
export const progressVariants: Variants = {
  initial: { width: '0%' },
  animate: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
}

// Skeleton loading animation
export const skeletonVariants: Variants = {
  loading: {
    backgroundPosition: ['0% 0%', '100% 0%'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Tab animation
export const tabVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

// List animation
export const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
}

// Fade animation
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

// Slide animation
export const slideVariants: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  exit: { x: 20, opacity: 0, transition: { duration: 0.2 } },
}

// Transition presets for global use
export const transitionPresets = {
  fast: { duration: 0.15 },
  normal: { duration: 0.3 },
  slow: { duration: 0.5 },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  smoothSpring: { type: 'spring', stiffness: 100, damping: 20 },
}
