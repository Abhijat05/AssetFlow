import * as React from "react"

export const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number }
>(({ className, value = 0, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${className || ""}`}
    {...props}
  >
    <div
      className="h-full bg-[#4262ff] transition-all duration-300 rounded-full"
      style={{ width: `${value || 0}%` }}
    />
  </div>
))
Progress.displayName = "Progress"
