import React from 'react'
import {
  Sun,
  Moon,
  BarChart3,
  Calendar,
  Download,
  Building2,
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { exportFilteredDataToCsv } from '../../utils/exportCsv'
import { formatDate } from '../../utils/formatters'
import { REFERENCE_DATE_STRING } from '../../data/seedData'

export const TopNavBar: React.FC = () => {
  const {
    darkMode,
    toggleDarkMode,
    filteredLeads,
    filteredQuotations,
    filteredDeals,
    filteredOrders,
    filteredPayments,
  } = useDashboard()

  const handleGlobalExport = () => {
    exportFilteredDataToCsv(
      filteredLeads,
      filteredQuotations,
      filteredDeals,
      filteredOrders,
      filteredPayments,
      'all'
    )
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 flex-wrap">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Business Performance & Revenue Analytics
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live System
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Enterprise CRM & Financial Analytics Suite</span>
              <span className="hidden md:inline text-slate-300 dark:text-slate-700">•</span>
              <span className="hidden md:inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Current Reference: {formatDate(REFERENCE_DATE_STRING, 'dd MMMM yyyy')}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Export Button */}
          <button
            onClick={handleGlobalExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all"
            title="Download CSV export of currently filtered data"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Export Filtered CSV</span>
            <span className="sm:hidden">Export</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  )
}
