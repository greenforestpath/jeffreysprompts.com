"use client";

/**
 * GestureHint - Generic overlay for teaching mobile gesture interactions.
 *
 * Extends the SwipeHint pattern to support multiple gesture types:
 * - Swipe (left/right actions)
 * - Double-tap (quick save)
 * - Long-press (context menu)
 */

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  ShoppingBag,
  Heart,
  Hand,
  MousePointerClick,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type GestureType = "swipe" | "double-tap" | "long-press" | "all";

interface GestureHintProps {
  /** Which gesture type to show (or "all" for combined hint) */
  type: GestureType;
  /** Callback when user dismisses the hint */
  onDismiss: () => void;
  /** Optional additional className */
  className?: string;
}

interface GestureInfo {
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  animation?: {
    x?: number[];
    y?: number[];
    scale?: number[];
  };
}

const gestureInfo: Record<Exclude<GestureType, "all">, GestureInfo> = {
  swipe: {
    icon: ArrowLeft,
    label: "Swipe",
    description: "Swipe left to copy, right to basket",
    color: "text-sky-400",
    animation: { x: [-5, 0, -5] },
  },
  "double-tap": {
    icon: MousePointerClick,
    label: "Double-tap",
    description: "Tap twice quickly to save",
    color: "text-pink-400",
    animation: { scale: [1, 0.9, 1] },
  },
  "long-press": {
    icon: Hand,
    label: "Long-press",
    description: "Hold for quick actions menu",
    color: "text-indigo-400",
    animation: { scale: [1, 1.05, 1] },
  },
};

/**
 * SingleGestureHint - Display for a single gesture type.
 */
function SingleGestureHint({ type, onDismiss, className }: Omit<GestureHintProps, "type"> & { type: Exclude<GestureType, "all"> }) {
  const info = gestureInfo[type];
  const Icon = info.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "absolute inset-0 z-20 flex items-center justify-center",
        "bg-black/70 rounded-xl backdrop-blur-sm",
        className
      )}
    >
      <div className="text-center text-white px-6 py-4">
        <motion.div
          className={cn("flex items-center justify-center gap-3 mb-4", info.color)}
          animate={info.animation}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon className="w-8 h-8" />
        </motion.div>

        <p className="text-sm font-medium mb-1">{info.label}</p>
        <p className="text-xs text-white/80 mb-4">{info.description}</p>

        <Button
          size="sm"
          variant="secondary"
          onClick={onDismiss}
          className="text-xs px-4 py-2 min-h-[44px] touch-manipulation"
        >
          Got it
        </Button>
      </div>
    </motion.div>
  );
}

/**
 * AllGesturesHint - Combined hint showing all available gestures.
 */
function AllGesturesHint({ onDismiss, className }: Omit<GestureHintProps, "type">) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "absolute inset-0 z-20 flex items-center justify-center",
        "bg-black/70 rounded-xl backdrop-blur-sm",
        className
      )}
    >
      <div className="text-center text-white px-4 py-4 max-w-[300px]">
        <h3 className="text-sm font-semibold mb-4">Card Gestures</h3>

        <div className="space-y-4 mb-5">
          {/* Swipe gestures */}
          <div className="flex items-center justify-between gap-4">
            <motion.div
              className="flex items-center gap-2"
              animate={{ x: [-3, 0, -3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowLeft className="w-4 h-4 text-sky-400" />
              <div className="flex flex-col items-start">
                <Copy className="w-4 h-4 text-sky-400" />
                <span className="text-[10px]">Copy</span>
              </div>
            </motion.div>

            <div className="w-px h-8 bg-white/30" />

            <motion.div
              className="flex items-center gap-2"
              animate={{ x: [3, 0, 3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex flex-col items-end">
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px]">Basket</span>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-400" />
            </motion.div>
          </div>

          {/* Double-tap */}
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ scale: [1, 0.9, 1, 0.9, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <MousePointerClick className="w-5 h-5 text-pink-400" />
            </motion.div>
            <div className="text-left">
              <p className="text-xs font-medium">Double-tap</p>
              <p className="text-[10px] text-white/70">Quick save</p>
            </div>
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
          </div>

          {/* Long-press */}
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Hand className="w-5 h-5 text-indigo-400" />
            </motion.div>
            <div className="text-left">
              <p className="text-xs font-medium">Long-press</p>
              <p className="text-[10px] text-white/70">Quick actions menu</p>
            </div>
          </div>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={onDismiss}
          className="text-xs px-4 py-2 min-h-[44px] touch-manipulation"
        >
          Got it
        </Button>
      </div>
    </motion.div>
  );
}

/**
 * GestureHint - Overlay that teaches users about available gestures.
 *
 * @example
 * ```tsx
 * <AnimatePresence>
 *   {showGestureHint && (
 *     <GestureHint
 *       type="all"
 *       onDismiss={() => dismissHint("gesture-hints")}
 *     />
 *   )}
 * </AnimatePresence>
 * ```
 */
export function GestureHint({ type, onDismiss, className }: GestureHintProps) {
  if (type === "all") {
    return <AllGesturesHint onDismiss={onDismiss} className={className} />;
  }

  return <SingleGestureHint type={type} onDismiss={onDismiss} className={className} />;
}

export default GestureHint;
