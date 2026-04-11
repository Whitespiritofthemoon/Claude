import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'sage' | 'coral' | 'success' | 'warning' | 'danger' | 'info' | 'outline'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
  dot?: boolean
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  sage: 'bg-toleran-sage-100 text-toleran-sage-700',
  coral: 'bg-toleran-coral-100 text-toleran-coral-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  outline: 'bg-white border border-gray-200 text-gray-600',
}

export function Badge({ children, variant = 'default', size = 'sm', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
        variants[variant],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
      {children}
    </span>
  )
}

// ─── Condition type badge ─────────────────────────────────────────────────────

import type { ConditionType } from '@/types'
import { CONDITION_TYPE_LABELS } from '@/types'

const conditionVariants: Record<ConditionType, BadgeVariant> = {
  allergy: 'danger',
  intolerance: 'warning',
  celiac: 'danger',
  sensitivity: 'warning',
  fodmap: 'info',
  preference: 'default',
}

interface ConditionBadgeProps {
  type: ConditionType
  className?: string
}

export function ConditionBadge({ type, className }: ConditionBadgeProps) {
  return (
    <Badge variant={conditionVariants[type]} className={className}>
      {CONDITION_TYPE_LABELS[type]}
    </Badge>
  )
}

// ─── Data source badge ────────────────────────────────────────────────────────

import type { DataSource } from '@/types'
import { DATA_SOURCE_LABELS } from '@/types'

export function DataSourceBadge({ source }: { source: DataSource }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-toleran-muted bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
      <span className="w-1 h-1 rounded-full bg-toleran-sage-400 shrink-0" />
      {DATA_SOURCE_LABELS[source]}
    </span>
  )
}
