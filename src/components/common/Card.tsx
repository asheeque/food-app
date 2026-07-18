import { cn } from '@/utils/cn'
import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline'
  hoverable?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, ...props }, ref) => {
    const variants = {
      default: 'bg-surface border border-neutral-200',
      elevated: 'bg-white shadow-md',
      outline: 'bg-transparent border-2 border-primary-500',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl p-4 transition-all duration-fast',
          variants[variant],
          hoverable && 'hover:shadow-lg cursor-pointer',
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'
