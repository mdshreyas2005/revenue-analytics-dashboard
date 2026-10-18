import React from 'react'
import { FolderSearch, RotateCcw } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

interface EmptyStateProps {
  title?: string
  message?: string
  showReset?: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data found for this range',
  message = 'Try selecting a different date range preset or clearing your user/department filters.',
  showReset = true,
}) => {
  const { resetFilters } = useDashboard()

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-full text-blue-600 dark:text-blue-400 mb-3">
        <FolderSearch className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
        {message}
      </p>
      {showReset && (
        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  )
}
