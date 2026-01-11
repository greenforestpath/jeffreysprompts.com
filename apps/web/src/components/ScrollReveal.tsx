"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, type Variants, type Variant } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimationPreset =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "fade-scale"
  | "blur-in"
  | "slide-rotate"
  | "zoom-blur"
  | "flip-up"
  | "bounce-in";

interface ScrollRevealProps {
  children: ReactNode;
  /** Animation preset */
  preset?: AnimationPreset;
  /** Additional className for wrapper */
  className?: string;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Animation duration (seconds) */
  duration?: number;
  /** Whether to trigger animation only once */
  once?: boolean;
  /** Threshold for viewport intersection (0-1) */
  threshold?: number;
  /** Custom spring stiffness */
  stiffness?: number;
  /** Custom spring damping */
  damping?: number;
  /** Use spring physics instead of tween */
  spring?: boolean;
  /** Disable animation (useful for reduced motion) */
  disabled?: boolean;
}

const presetVariants: Record<AnimationPreset, { hidden: Variant; visible: Variant }> = {
  "fade-up": {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-down": {
    hidden: { opacity: 0, y: -40 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-scale": {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  "blur-in": {
    hidden: { opacity: 0, filter: "blur(12px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
  "slide-rotate": {
    hidden: { opacity: 0, x: -60, rotate: -6 },
    visible: { opacity: 1, x: 0, rotate: 0 },
  },
  "zoom-blur": {
    hidden: { opacity: 0, scale: 1.1, filter: "blur(8px)" },
    visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
  },
  "flip-up": {
    hidden: { opacity: 0, rotateX: -20, y: 30, transformPerspective: 1000 },
    visible: { opacity: 1, rotateX: 0, y: 0 },
  },
  "bounce-in": {
    hidden: { opacity: 0, scale: 0.3 },
    visible: { opacity: 1, scale: 1 },
  },
};

/**
 * ScrollReveal - Viewport-triggered reveal animations for any content.
 *
 * Features:
 * - 10 animation presets
 * - Spring or tween animations
 * - Configurable intersection threshold
 * - Stagger support via CSS custom properties
 *
 * @example
 * ```tsx
 * <ScrollReveal preset="fade-up" delay={0.2}>
 *   <Card>Content that animates in</Card>
 * </ScrollReveal>
 *
 * // Staggered list
 * {items.map((item, i) => (
 *   <ScrollReveal key={item.id} preset="fade-up" delay={i * 0.1}>
 *     <ListItem {...item} />
 *   </ScrollReveal>
 * ))}
 * ```
 */
export function ScrollReveal({
  children,
  preset = "fade-up",
  className,
  delay = 0,
  duration = 0.6,
  once = true,
  threshold = 0.2,
  stiffness = 300,
  damping = 30,
  spring = true,
  disabled = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  const { hidden, visible } = presetVariants[preset];

  const variants: Variants = {
    hidden,
    visible: {
      ...visible,
      transition: spring
        ? {
            type: "spring",
            stiffness,
            damping,
            delay,
          }
        : {
            duration,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay,
          },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={cn("will-change-transform", className)}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollRevealGroup - Container for staggered ScrollReveal children.
 * Sets CSS custom property --stagger-index for each child.
 */
interface ScrollRevealGroupProps {
  children: ReactNode;
  className?: string;
  /** Base delay between items (seconds) */
  staggerDelay?: number;
}

export function ScrollRevealGroup({
  children,
  className,
  staggerDelay = 0.1,
}: ScrollRevealGroupProps) {
  return (
    <div
      className={className}
      style={{ "--stagger-delay": `${staggerDelay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export default ScrollReveal;
