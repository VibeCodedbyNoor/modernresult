import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const neonButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-orbitron font-bold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-glow-blue hover:shadow-glow-cyan border border-primary hover:scale-105",
        purple: "bg-secondary text-secondary-foreground shadow-glow-purple hover:shadow-glow-pink border border-secondary hover:scale-105",
        pink: "bg-accent text-accent-foreground shadow-glow-pink hover:shadow-glow-purple border border-accent hover:scale-105",
        outline: "border-2 border-primary bg-transparent text-primary shadow-glow-blue hover:bg-primary/10 hover:shadow-glow-cyan",
      },
      size: {
        default: "h-12 px-8 py-3 text-base",
        sm: "h-9 px-6 text-sm",
        lg: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface NeonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neonButtonVariants> {
  asChild?: boolean
}

const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(neonButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
NeonButton.displayName = "NeonButton"

export { NeonButton, neonButtonVariants }