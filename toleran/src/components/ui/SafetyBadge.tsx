import { cn, safetyConfig, confidenceConfig } from '@/lib/utils'
import type { SafetyLevel, ConfidenceLevel } from '@/types'

interface SafetyBadgeProps {
  level: SafetyLevel
  size?: 'sm' | 'md' | 'lg'
  showConfidence?: ConfidenceLevel
  className?: string
}

export function SafetyBadge({ level, size = 'md', showConfidence, className }: SafetyBadgeProps) {
  const cfg = safetyConfig[level]

  const sizes = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-sm px-2.5 py-1 font-semibold',
    lg: 'text-base px-4 py-2 font-bold',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border',
          cfg.bgClass,
          cfg.textClass,
          cfg.borderClass,
          sizes[size]
        )}
      >
        <span role="img" aria-hidden>
          {cfg.emoji}
        </span>
        {cfg.label}
      </span>
      {showConfidence && (
        <span className={cn('text-xs', confidenceConfig[showConfidence].color)}>
          {confidenceConfig[showConfidence].label}
        </span>
      )}
    </div>
  )
}

// ─── Full safety result card ───────────────────────────────────────────────────

interface SafetyResultCardProps {
  level: SafetyLevel
  confidence: ConfidenceLevel
  reason: string
  riskyItems?: string[]
  className?: string
}

export function SafetyResultCard({
  level,
  confidence,
  reason,
  riskyItems,
  className,
}: SafetyResultCardProps) {
  const cfg = safetyConfig[level]

  const containerColors: Record<SafetyLevel, string> = {
    safe: 'bg-green-50 border-green-200',
    caution: 'bg-amber-50 border-amber-200',
    avoid: 'bg-red-50 border-red-200',
    unknown: 'bg-gray-50 border-gray-200',
  }

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-4',
        containerColors[level],
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <SafetyBadge level={level} size="lg" showConfidence={confidence} />
      </div>
      <p className={cn('text-sm mt-2', cfg.textClass)}>{reason}</p>
      {riskyItems && riskyItems.length > 0 && (
        <ul className="mt-2 space-y-1">
          {riskyItems.map((item, i) => (
            <li key={i} className={cn('text-xs flex items-center gap-1', cfg.textClass)}>
              <span className="w-1 h-1 rounded-full bg-current shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
