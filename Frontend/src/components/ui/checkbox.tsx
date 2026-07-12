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
        className={`h-4 w-4 rounded border-slate-350 text-[#4262ff] focus:ring-[#4262ff] focus:ring-offset-2 accent-[#4262ff] cursor-pointer ${className || ""}`}
        {...props}
      />
    )
  }
)
Checkbox.displayName = "Checkbox"
