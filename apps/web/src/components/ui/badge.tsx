import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium",
    "w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none overflow-hidden",
    // Transitions and interactions
    "transition-all duration-150 ease-out",
    "[a&]:touch-manipulation [button&]:touch-manipulation",
    "[a&]:active:scale-[0.97] [button&]:active:scale-[0.97]",
    // Focus styles
    "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // New variants for enhanced UI
        success:
          "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 [a&]:hover:bg-emerald-500/25",
        warning:
          "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400 [a&]:hover:bg-amber-500/25",
        info:
          "border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400 [a&]:hover:bg-blue-500/25",
        // Glow variant for featured/promoted items
        glow: [
          "border-primary/50 bg-primary/10 text-primary",
          "shadow-[0_0_10px_rgba(var(--primary-rgb,139,92,246),0.3)]",
          "hover:shadow-[0_0_15px_rgba(var(--primary-rgb,139,92,246),0.5)]",
          "hover:bg-primary/20 hover:border-primary/70",
          "dark:shadow-[0_0_12px_rgba(var(--primary-rgb,139,92,246),0.4)]",
          "dark:hover:shadow-[0_0_20px_rgba(var(--primary-rgb,139,92,246),0.6)]",
        ].join(" "),
        // Premium/gold variant
        premium: [
          "border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-700",
          "dark:text-amber-400 dark:border-amber-500/40",
          "shadow-[0_0_10px_rgba(251,191,36,0.2)]",
          "hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]",
          "hover:from-amber-500/30 hover:to-yellow-500/30",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
