import * as React from "react"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={`h-4 w-4 rounded border-slate-350 text-brand-blue focus:ring-brand-blue focus:ring-offset-2 accent-brand-blue cursor-pointer ${className || ""}`}
        {...props}
      />
    )
  }
)
Checkbox.displayName = "Checkbox"
