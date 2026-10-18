import React from 'react'

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded ${className}`}
    />
  )
}

export const KpiCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-card">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-2 w-2/3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-28" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>
  )
}
