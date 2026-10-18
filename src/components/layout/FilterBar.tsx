import React, { useState } from 'react'
import {
  Calendar,
  Users,
  Building,
  RotateCcw,
  ChevronDown,
  Filter,
  Check,
  Download,
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { DatePreset } from '../../types'
import { formatDate } from '../../utils/formatters'
import { exportFilteredDataToCsv } from '../../utils/exportCsv'

export const FilterBar: React.FC = () => {
  const {
    filters,
    setPreset,
    setCustomRange,
    setUserId,
    setDepartment,
    resetFilters,
    employees,
    durationDays,
    previousRangeLabel,
    filteredLeads,
    filteredQuotations,
    filteredDeals,
    filteredOrders,
    filteredPayments,
  } = useDashboard()

  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customStart, setCustomStart] = useState(filters.startDate)
  const [customEnd, setCustomEnd] = useState(filters.endDate)

  // Filter employees available based on selected department
  const filteredEmployees = employees.filter((e) => {
    if (filters.department === 'all') return true
    return e.department === filters.department
  })

  const presets: { id: DatePreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: 'custom', label: 'Custom Range' },
  ]

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (customStart && customEnd) {
      if (new Date(customStart) > new Date(customEnd)) {
        alert('Start date cannot be after end date.')
        return
      }
      setCustomRange(customStart, customEnd)
      setShowCustomModal(false)
    }
  }

  const handleExport = () => {
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
    <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-soft transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Date Presets */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            {presets.map((p) => {
              const isActive = filters.preset === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    if (p.id === 'custom') {
                      setShowCustomModal(true)
                    } else {
                      setPreset(p.id)
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>

          {/* Middle: Department & User Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Department Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Dept:</span>
              <select
                value={filters.department}
                onChange={(e) => setDepartment(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="dark:bg-slate-800">All Departments</option>
                <option value="Sales" className="dark:bg-slate-800">Sales</option>
                <option value="Operations" className="dark:bg-slate-800">Operations</option>
              </select>
            </div>

            {/* Users Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">User:</span>
              <select
                value={filters.userId}
                onChange={(e) => setUserId(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer max-w-[150px] truncate"
              >
                <option value="all" className="dark:bg-slate-800">All Users</option>
                {filteredEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id} className="dark:bg-slate-800">
                    {emp.name} ({emp.department[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            {(filters.preset !== '30days' ||
              filters.department !== 'all' ||
              filters.userId !== 'all') && (
              <button
                onClick={resetFilters}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Reset all filters to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Export CSV button */}
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Right: Active Date Range Info & Previous Comparison indicator */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 rounded-lg text-blue-700 dark:text-blue-300">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="font-semibold">
                {formatDate(filters.startDate, 'dd MMM')} - {formatDate(filters.endDate, 'dd MMM yyyy')}
              </span>
              <span className="text-[11px] text-blue-500 dark:text-blue-400 font-medium">
                ({durationDays} {durationDays === 1 ? 'day' : 'days'})
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
              <span>Comp:</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {previousRangeLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Date Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Select Custom Date Range
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleApplyCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  min="2026-08-01"
                  max="2026-10-31"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  min="2026-08-01"
                  max="2026-10-31"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                Data is populated between <strong>01 Aug 2026</strong> and <strong>31 Oct 2026</strong>. Current system reference is <strong>18 Oct 2026</strong>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  Apply Range
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
