import { cn } from '@/utils/cn'
import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-on-surface mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border-2 border-neutral-200',
            'font-sans text-base text-on-surface placeholder-neutral-400',
            'transition-all duration-fast',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20',
            'hover:border-neutral-300',
            error && 'border-error focus:border-error focus:ring-error focus:ring-opacity-20',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-error mt-1">{error}</p>}
        {helper && !error && <p className="text-sm text-neutral-500 mt-1">{helper}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
