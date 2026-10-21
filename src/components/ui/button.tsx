import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const base = "inline-flex items-center justify-center whitespace-nowrap text-xs font-semibold ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
    
    const variants = {
      default: "bg-[#003D5C] text-white hover:bg-[#002d44] shadow-xs",
      destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-xs",
      outline: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      ghost: "hover:bg-slate-100 text-slate-700 hover:text-slate-900",
      link: "text-[#003D5C] underline-offset-4 hover:underline",
    }

    const sizes = {
      default: "h-9 px-4 py-2 rounded-xl",
      sm: "h-8 rounded-lg px-3",
      lg: "h-11 rounded-xl px-8 text-sm",
      icon: "h-9 w-9 rounded-xl",
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"