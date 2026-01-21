import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Card hover variants for different interaction styles
 * - none: No hover effects (default)
 * - lift: Lifts up with enhanced shadow
 * - glow: Adds a colored glow effect
 * - scale: Subtle scale increase
 * - subtle: Very subtle lift without border change
 */
const cardVariants = cva(
  [
    "bg-card text-card-foreground flex flex-col rounded-xl border",
    // Base shadow with subtle depth
    "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]",
    // Buttery smooth transition with custom cubic-bezier
    "transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
    // Dark mode shadow adjustment
    "dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.15)]",
  ],
  {
    variants: {
      hover: {
        none: "",
        lift: [
          // Smooth lift with enhanced shadow progression
          "hover:-translate-y-1.5",
          "hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.04)]",
          "hover:border-border/60",
          // Subtle background shift for depth perception
          "hover:bg-card/95",
          "dark:hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4),0_8px_10px_-6px_rgba(0,0,0,0.2)]",
          "dark:hover:border-border/40",
          // Touch feedback with spring-like return
          "touch-manipulation active:scale-[0.98] active:shadow-[0_2px_4px_rgba(0,0,0,0.08)] active:translate-y-0",
          "active:transition-all active:duration-100",
        ],
        glow: [
          // Elegant glow with color shift
          "hover:shadow-[0_0_0_1px_var(--primary)/10,0_4px_16px_var(--primary)/12,0_8px_24px_var(--primary)/8]",
          "hover:border-primary/30",
          "dark:hover:shadow-[0_0_0_1px_var(--primary)/15,0_4px_20px_var(--primary)/20,0_12px_32px_var(--primary)/12]",
          "dark:hover:border-primary/40",
          "touch-manipulation active:scale-[0.98] active:shadow-[0_0_0_1px_var(--primary)/20,0_2px_8px_var(--primary)/10]",
        ],
        scale: [
          // Refined scale with subtle shadow enhancement
          "hover:scale-[1.015] hover:-translate-y-0.5",
          "hover:shadow-[0_8px_20px_-5px_rgba(0,0,0,0.08),0_4px_8px_-4px_rgba(0,0,0,0.04)]",
          "hover:border-border/50",
          "touch-manipulation active:scale-[0.98] active:translate-y-0",
        ],
        subtle: [
          // Whisper-quiet lift for understated elegance
          "hover:-translate-y-0.5",
          "hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.06),0_2px_4px_-2px_rgba(0,0,0,0.04)]",
          "hover:bg-card/98",
          "dark:hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3),0_2px_4px_-2px_rgba(0,0,0,0.2)]",
          "touch-manipulation active:scale-[0.995] active:translate-y-0",
        ],
      },
    },
    defaultVariants: {
      hover: "none",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={cn(cardVariants({ hover }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        className
      )}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      data-slot="card-title"
      className={cn(
        "text-xl font-semibold leading-tight tracking-tight",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-action"
      className={cn(
        "ml-auto flex items-center gap-2",
        className
      )}
      {...props}
    />
  )
)
CardAction.displayName = "CardAction"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

// Feature card variant with enhanced hover effects
const FeatureCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="feature-card"
      className={cn(
        "feature-card group cursor-pointer touch-manipulation active:scale-[0.98]",
        className
      )}
      {...props}
    />
  )
)
FeatureCard.displayName = "FeatureCard"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  FeatureCard,
  cardVariants,
}
