import type { Variants } from "framer-motion";

// Repeating bob/walk keyframes must not also repeat a return from a previous
// rotation or squash. Reset scalar pose values once, independently of the loop.
export function withRestingPose(variants: Variants, rest: Record<string, number>): Variants {
  return Object.fromEntries(Object.entries(variants).map(([name, target]) => {
    if (typeof target === "function") return [name, target];
    const pose = { ...rest, ...target };
    const resets = Object.fromEntries(Object.keys(rest)
      .filter(key => !Array.isArray((pose as Record<string, unknown>)[key]))
      .map(key => [key, { duration: .18, ease: "easeOut", repeat: 0 }]));
    return [name, { ...pose, transition: { ...target.transition, ...resets } }];
  }));
}

export const restingBodyPose = { x: 0, y: 0, rotate: 0, scale: 1, scaleX: 1, scaleY: 1 };
