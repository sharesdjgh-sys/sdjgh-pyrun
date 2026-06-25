import type { Variants } from "framer-motion";

export const bodyVariants: Variants = {
  idle: {
    y: [0, -4, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
  talking: {
    y: [0, -3, 0],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
  },
  walking: {
    x: [0, 8, 0, -8, 0],
    y: [0, -2, 0, -2, 0],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
  },
  jumping: {
    y: [0, -50, -50, 0],
    scaleY: [1, 1.1, 1.1, 0.9, 1],
    transition: { duration: 0.6, ease: "easeOut" },
  },
  headShake: {
    x: [0, -12, 12, -12, 12, 0],
    transition: { duration: 0.6, ease: "easeInOut" },
  },
  celebrating: {
    rotate: [0, 10, -10, 10, -10, 0],
    scale: [1, 1.1, 1.1, 1.2, 1],
    y: [0, -10, -10, -5, 0],
    transition: { duration: 0.8, repeat: 3, ease: "easeInOut" },
  },
  error: {
    x: [0, -8, 8, -8, 8, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  spinning: {
    rotate: [0, 360],
    transition: { duration: 0.7, ease: "easeInOut" as const },
  },
  shaking: {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export const headVariants: Variants = {
  idle: {
    rotate: [0, 2, 0, -2, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  talking: {
    rotate: [0, 5, -5, 5, 0],
    transition: { duration: 0.4, repeat: Infinity, ease: "easeInOut" },
  },
  walking: {},
  jumping: { rotate: [0, -5, 0], transition: { duration: 0.3 } },
  headShake: {
    rotate: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.6, ease: "easeInOut" },
  },
  celebrating: {
    rotate: [0, 15, -15, 15, 0],
    transition: { duration: 0.4, repeat: 4, ease: "easeInOut" },
  },
  error: { rotate: [-5, 5, -5, 0], transition: { duration: 0.4 } },
  spinning: {},
  shaking: {
    rotate: [0, -8, 8, -8, 8, 0],
    transition: { duration: 0.5 },
  },
};

export const leftArmVariants: Variants = {
  idle: { rotate: [0, 5, 0], transition: { duration: 2, repeat: Infinity } },
  talking: { rotate: [0, 20, 0], transition: { duration: 0.6, repeat: Infinity } },
  walking: {
    rotate: [15, -15, 15],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
  },
  jumping: { rotate: [-40], transition: { duration: 0.3 } },
  headShake: {},
  celebrating: {
    rotate: [0, -60, 0, -60, 0],
    transition: { duration: 0.4, repeat: 3, ease: "easeInOut" },
  },
  error: { rotate: [0, -20, 0], transition: { duration: 0.3 } },
  spinning: {},
  shaking: {},
};

export const rightArmVariants: Variants = {
  idle: { rotate: [0, -5, 0], transition: { duration: 2, repeat: Infinity } },
  talking: { rotate: [0, -20, 0], transition: { duration: 0.6, repeat: Infinity } },
  walking: {
    rotate: [-15, 15, -15],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
  },
  jumping: { rotate: [40], transition: { duration: 0.3 } },
  headShake: {},
  celebrating: {
    rotate: [0, 60, 0, 60, 0],
    transition: { duration: 0.4, repeat: 3, ease: "easeInOut" },
  },
  error: { rotate: [0, 20, 0], transition: { duration: 0.3 } },
  spinning: {},
  shaking: {},
};

export const leftLegVariants: Variants = {
  idle: {},
  talking: {},
  walking: {
    rotate: [-20, 20, -20],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
  },
  jumping: { rotate: [-10], transition: { duration: 0.3 } },
  headShake: {},
  celebrating: {},
  error: {},
  spinning: {},
  shaking: {},
};

export const rightLegVariants: Variants = {
  idle: {},
  talking: {},
  walking: {
    rotate: [20, -20, 20],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
  },
  jumping: { rotate: [10], transition: { duration: 0.3 } },
  headShake: {},
  celebrating: {},
  error: {},
  spinning: {},
  shaking: {},
};
