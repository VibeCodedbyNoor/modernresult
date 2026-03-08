import * as React from "react"
import { cn } from "@/lib/utils"

export interface NeonInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const NeonInput = React.forwardRef<HTMLInputElement, NeonInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border-2 border-border bg-input px-4 py-3 font-poppins text-base transition-all duration-300",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:border-primary focus:shadow-glow-blue focus:bg-card",
          "hover:border-primary/50 hover:shadow-glow-blue/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
NeonInput.displayName = "NeonInput"

export { NeonInput }