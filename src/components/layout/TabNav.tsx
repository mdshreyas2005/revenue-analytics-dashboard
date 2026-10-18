import React from 'react'
import {
  Users,
  FileSpreadsheet,
  BadgeDollarSign,
  PackageCheck,
  UserCheck,
  LayoutGrid,
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

export const TabNav: React.FC = () => {
  const { activeTab, setActiveTab } = useDashboard()

  const tabs = [
    { id: 'all', label: 'All Analytics', icon: LayoutGrid },
    { id: 'leads', label: '1. Lead Analytics', icon: Users },
    { id: 'quotations', label: '2. Quotation Analytics', icon: FileSpreadsheet },
    { id: 'deals', label: '3. Deals & Revenue', icon: BadgeDollarSign },
    { id: 'orders', label: '4. Orders & Payments', icon: PackageCheck },
    { id: 'team', label: '5. Team Activity', icon: UserCheck },
  ]

  const handleTabClick = (id: string) => {
    setActiveTab(id)
    if (id !== 'all') {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <div className="bg-slate-100/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
