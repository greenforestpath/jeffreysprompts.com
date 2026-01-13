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
    "bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm",
    "transition-all duration-200 ease-out",
  ],
  {
    variants: {
      hover: {
        none: "",
        lift: [
          "hover:shadow-lg hover:-translate-y-1",
          "hover:border-primary/30",
          "dark:hover:shadow-primary/5",
          "touch-manipulation active:scale-[0.98] active:shadow-md",
        ],
        glow: [
          "hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]",
          "hover:border-primary/40",
          "dark:hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]",
          "touch-manipulation active:scale-[0.98]",
        ],
        scale: [
          "hover:scale-[1.02] hover:shadow-md",
          "hover:border-border/80",
          "touch-manipulation active:scale-[0.98]",
        ],
        subtle: [
          "hover:shadow-md hover:-translate-y-0.5",
          "hover:bg-card/80",
          "touch-manipulation active:scale-[0.99]",
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
