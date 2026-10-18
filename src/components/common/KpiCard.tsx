import React from 'react'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react'
import { ComparisonMetric } from '../../types'

interface KpiCardProps {
  title: string
  value: string | number
  comparison?: ComparisonMetric
  secondaryText?: string
  icon?: React.ReactNode
  iconBgColor?: string
  onClick?: () => void
  subBadge?: {
    text: string
    color?: 'blue' | 'green' | 'orange' | 'purple'
  }
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  comparison,
  secondaryText,
  icon,
  iconBgColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
  onClick,
  subBadge,
}) => {
  const isClickable = Boolean(onClick)

  // Badge styling based on comparison
  let badgeColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  let IconComponent = Minus

  if (comparison) {
    if (comparison.direction === 'up') {
      badgeColor = comparison.isPositive
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40'
        : 'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800/40'
      IconComponent = TrendingUp
    } else if (comparison.direction === 'down') {
      badgeColor = comparison.isPositive
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/40'
        : 'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800/40'
      IconComponent = TrendingDown
    }
  }

  const badgeBadgeColors = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    orange: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
  }

  return (
    <div
      onClick={onClick}
      className={`relative group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between ${
        isClickable ? 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-600' : ''
      }`}
    >
      {/* Top row: Title and Icon */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </span>
            {subBadge && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  badgeBadgeColors[subBadge.color || 'blue']
                }`}
              >
                {subBadge.text}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {icon && (
            <div className={`p-2.5 rounded-xl ${iconBgColor} shrink-0`}>
              {icon}
            </div>
          )}
          {isClickable && (
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
          )}
        </div>
      </div>

      {/* Bottom row: Comparison & Context */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        {comparison && (
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-xs ${badgeColor}`}>
            <IconComponent className="w-3.5 h-3.5 shrink-0" />
            <span>
              {comparison.changePercent === null
                ? 'New'
                : `${comparison.changePercent >= 0 ? '+' : ''}${comparison.changePercent.toFixed(1)}%`}
            </span>
          </div>
        )}

        <span className="text-slate-500 dark:text-slate-400 truncate">
          {comparison ? comparison.label : secondaryText || ''}
        </span>
      </div>
    </div>
  )
}
