import { cn } from '@/utils/cn'
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center font-semibold transition-all duration-fast rounded-lg',
      'disabled:opacity-50 disabled:cursor-not-allowed'
    )

    const variants = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-700 active:bg-primary-800 shadow-md hover:shadow-lg',
      secondary:
        'bg-secondary-500 text-white hover:bg-secondary-700 active:bg-secondary-800 shadow-md hover:shadow-lg',
      ghost: 'text-primary-500 hover:bg-primary-500 hover:bg-opacity-10 active:bg-opacity-20',
      outline:
        'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:bg-opacity-5 active:bg-opacity-10',
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
