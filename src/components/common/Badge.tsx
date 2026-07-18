import { cn } from '@/utils/cn'
import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'sm', ...props }, ref) => {
    const variants = {
      primary: 'bg-primary-500 bg-opacity-10 text-primary-500',
      secondary: 'bg-secondary-500 bg-opacity-10 text-secondary-500',
      success: 'bg-success bg-opacity-10 text-success',
      warning: 'bg-warning bg-opacity-10 text-warning',
      error: 'bg-error bg-opacity-10 text-error',
      info: 'bg-info bg-opacity-10 text-info',
    }

    const sizes = {
      sm: 'px-2.5 py-1 text-xs font-semibold rounded',
      md: 'px-3 py-1.5 text-sm font-semibold rounded-md',
    }

    return (
      <span
        ref={ref}
        className={cn('inline-block transition-colors duration-fast', variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'
