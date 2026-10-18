import React from 'react'
import { DashboardProvider, useDashboard } from './context/DashboardContext'
import { TopNavBar } from './components/layout/TopNavBar'
import { FilterBar } from './components/layout/FilterBar'
import { TabNav } from './components/layout/TabNav'
import { DrillDownModal } from './components/drilldown/DrillDownModal'
import { EmptyState } from './components/common/EmptyState'

import { Section1LeadAnalytics } from './components/sections/Section1LeadAnalytics'
import { Section2QuotationAnalytics } from './components/sections/Section2QuotationAnalytics'
import { Section3DealsRevenue } from './components/sections/Section3DealsRevenue'
import { Section4OrdersPayments } from './components/sections/Section4OrdersPayments'
import { Section5TeamActivity } from './components/sections/Section5TeamActivity'

const DashboardContent: React.FC = () => {
  const {
    activeTab,
    filteredLeads,
    filteredQuotations,
    filteredDeals,
    filteredOrders,
    filteredPayments,
  } = useDashboard()

  const hasAnyData =
    filteredLeads.length > 0 ||
    filteredQuotations.length > 0 ||
    filteredDeals.length > 0 ||
    filteredOrders.length > 0 ||
    filteredPayments.length > 0

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* 1. Header */}
      <TopNavBar />

      {/* 2. Sticky Global Filter Bar */}
      <FilterBar />

      {/* 3. Section Navigation Tabs */}
      <TabNav />

      {/* 4. Main Analytics Dashboard Body */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {!hasAnyData ? (
          <EmptyState />
        ) : (
          <>
            {/* Section 1: Lead Analytics */}
            {(activeTab === 'all' || activeTab === 'leads') && (
              <Section1LeadAnalytics />
            )}

            {/* Section 2: Quotation Analytics */}
            {(activeTab === 'all' || activeTab === 'quotations') && (
              <Section2QuotationAnalytics />
            )}

            {/* Section 3: Deals & Revenue */}
            {(activeTab === 'all' || activeTab === 'deals') && (
              <Section3DealsRevenue />
            )}

            {/* Section 4: Orders & Payments */}
            {(activeTab === 'all' || activeTab === 'orders') && (
              <Section4OrdersPayments />
            )}

            {/* Section 5: Team Activity */}
            {(activeTab === 'all' || activeTab === 'team') && (
              <Section5TeamActivity />
            )}
          </>
        )}
      </main>

      {/* 5. Deep Relational Drill-Down Modal / Slide-Over */}
      <DrillDownModal />

      {/* 6. Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400 mt-12 transition-colors">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Business Performance & Revenue Analytics
            </span>{' '}
            • Production Dashboard Build
          </div>
          <div>
            Designed with Tailwind CSS, Recharts & TypeScript. Static SPA ready for Vercel/Netlify.
          </div>
        </div>
      </footer>
    </div>
  )
}

export function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}

export default App
