import * as React from "react"
import { cn } from "@/lib/utils"

export interface NeonSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const NeonSelect = React.forwardRef<HTMLSelectElement, NeonSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-12 w-full rounded-lg border-2 border-border bg-input px-4 py-3 font-poppins text-base transition-all duration-300",
          "focus:outline-none focus:border-primary focus:shadow-glow-blue focus:bg-card",
          "hover:border-primary/50 hover:shadow-glow-blue/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "cursor-pointer",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
NeonSelect.displayName = "NeonSelect"

export { NeonSelect }