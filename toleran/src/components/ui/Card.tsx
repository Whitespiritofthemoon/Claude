import { cn } from '@/lib/utils'
import { type HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat' | 'bordered'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const base = 'rounded-2xl bg-white'

    const variants = {
      default: 'shadow-card',
      elevated: 'shadow-card-hover',
      flat: '',
      bordered: 'border border-gray-100',
    }

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    }

    return (
      <div
        ref={ref}
        className={cn(
          base,
          variants[variant],
          paddings[padding],
          hoverable && 'transition-shadow duration-200 hover:shadow-card-hover cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// ─── Card sub-components ──────────────────────────────────────────────────────

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

function CardHeader({ title, subtitle, icon, action, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 mb-3', className)} {...props}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="shrink-0 w-9 h-9 rounded-xl bg-toleran-sage-50 flex items-center justify-center text-toleran-sage-600">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-toleran-text text-sm truncate">{title}</h3>
          {subtitle && (
            <p className="text-xs text-toleran-muted mt-0.5 leading-snug">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export { Card, CardHeader }
export type { CardProps }
