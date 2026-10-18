import React from 'react'
import { Info } from 'lucide-react'

interface ChartCardProps {
  title: string
  subtitle?: string
  infoTooltip?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  footer?: React.ReactNode
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  infoTooltip,
  action,
  children,
  className = '',
  footer,
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-card p-5 flex flex-col justify-between transition-all duration-200 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h3>
            {infoTooltip && (
              <div className="group relative cursor-help">
                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 bg-slate-900 text-slate-100 text-xs rounded-md shadow-lg z-50 pointer-events-none text-center">
                  {infoTooltip}
                </div>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full min-h-[260px] relative">{children}</div>

      {/* Optional Footer */}
      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  )
}
