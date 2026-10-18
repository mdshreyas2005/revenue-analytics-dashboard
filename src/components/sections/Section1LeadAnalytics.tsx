import React, { useMemo, useState } from 'react'
import {
  Users,
  UserCheck,
  CheckCircle,
  XCircle,
  TrendingUp,
  FileSpreadsheet,
  BadgeDollarSign,
  Receipt,
  Target,
  ArrowRight,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import { KpiCard } from '../common/KpiCard'
import { ChartCard } from '../common/ChartCard'
import { formatCompactINR, formatINR, formatPercent, formatDate } from '../../utils/formatters'
import { format, parseISO, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns'

const SOURCE_COLORS: Record<string, string> = {
  'Google Ads': '#2563EB',
  Website: '#10B981',
  'Just Dial': '#F59E0B',
  Other: '#8B5CF6',
}

export const Section1LeadAnalytics: React.FC = () => {
  const {
    filteredLeads,
    filteredQuotations,
    filteredDeals,
    filteredPayments,
    kpis,
    openDrillDown,
    filters,
  } = useDashboard()

  // Trend toggle visibility state for Daily Lead Trend
  const [lineVisibility, setLineVisibility] = useState({
    New: true,
    Qualified: true,
    Converted: true,
  })

  const toggleLine = (key: 'New' | 'Qualified' | 'Converted') => {
    setLineVisibility((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Lead Funnel counts
  const funnel = useMemo(() => {
    const total = filteredLeads.length
    const newCount = filteredLeads.filter((l) => l.status === 'New').length
    const qualCount = filteredLeads.filter((l) => l.status === 'Qualified').length
    const convCount = filteredLeads.filter((l) => l.status === 'Converted').length
    const unqualCount = filteredLeads.filter((l) => l.status === 'Unqualified').length

    return {
      total,
      newCount,
      newPercent: total > 0 ? (newCount / total) * 100 : 0,
      qualCount,
      qualPercent: total > 0 ? (qualCount / total) * 100 : 0,
      convCount,
      convPercent: total > 0 ? (convCount / total) * 100 : 0,
      unqualCount,
      unqualPercent: total > 0 ? (unqualCount / total) * 100 : 0,
    }
  }, [filteredLeads])

  // Daily Trend Data aggregation (daily time buckets)
  const dailyLeadTrend = useMemo(() => {
    try {
      const start = parseISO(filters.startDate)
      const end = parseISO(filters.endDate)
      const days = eachDayOfInterval({ start, end })

      const map = new Map<
        string,
        { date: string; displayDate: string; New: number; Qualified: number; Converted: number; Unqualified: number; Total: number }
      >()

      days.forEach((day) => {
        const key = format(day, 'yyyy-MM-dd')
        map.set(key, {
          date: key,
          displayDate: format(day, days.length > 14 ? 'dd MMM' : 'EEE, dd MMM'),
          New: 0,
          Qualified: 0,
          Converted: 0,
          Unqualified: 0,
          Total: 0,
        })
      })

      filteredLeads.forEach((l) => {
        const leadDay = format(parseISO(l.createdAt), 'yyyy-MM-dd')
        const entry = map.get(leadDay)
        if (entry) {
          entry[l.status] += 1
          entry.Total += 1
        }
      })

      return Array.from(map.values())
    } catch {
      return []
    }
  }, [filteredLeads, filters.startDate, filters.endDate])

  // Lead Sources aggregation
  const leadSourcesData = useMemo(() => {
    const counts: Record<string, number> = {
      'Google Ads': 0,
      Website: 0,
      'Just Dial': 0,
      Other: 0,
    }

    filteredLeads.forEach((l) => {
      if (counts[l.source] !== undefined) {
        counts[l.source] += 1
      } else {
        counts.Other += 1
      }
    })

    const total = filteredLeads.length
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      percent: total > 0 ? (value / total) * 100 : 0,
      color: SOURCE_COLORS[name] || '#94A3B8',
    }))
  }, [filteredLeads])

  // Mini Target vs Achieved bar chart data
  const targetBarData = useMemo(() => {
    return [
      {
        name: 'Target vs Achieved',
        Target: kpis.targetRevenue,
        Achieved: kpis.targetAchieved,
      },
    ]
  }, [kpis.targetRevenue, kpis.targetAchieved])

  return (
    <section id="leads" className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Section 1: Lead Analytics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inbound acquisition, qualification velocity, and pipeline conversion metrics
            </p>
          </div>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. New Leads */}
        <KpiCard
          title="New Leads"
          value={kpis.newLeads.current}
          comparison={kpis.newLeads}
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
          onClick={() => openDrillDown('filter', undefined, 'New Leads', { statusFilter: 'New' })}
        />

        {/* 2. Qualified Leads */}
        <KpiCard
          title="Qualified Leads"
          value={kpis.qualifiedLeads.current}
          comparison={kpis.qualifiedLeads}
          subBadge={{ text: `${kpis.qualifiedRate.toFixed(1)}% of total`, color: 'blue' }}
          icon={<UserCheck className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
          onClick={() => openDrillDown('filter', undefined, 'Qualified Leads', { statusFilter: 'Qualified' })}
        />

        {/* 3. Converted Leads */}
        <KpiCard
          title="Converted Leads"
          value={kpis.convertedLeads.current}
          comparison={kpis.convertedLeads}
          subBadge={{ text: `${kpis.conversionRate.current.toFixed(1)}% rate`, color: 'green' }}
          icon={<CheckCircle className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
          onClick={() => openDrillDown('filter', undefined, 'Converted Leads', { statusFilter: 'Converted' })}
        />

        {/* 4. Unqualified Leads */}
        <KpiCard
          title="Unqualified Leads"
          value={kpis.unqualifiedLeads.current}
          comparison={kpis.unqualifiedLeads}
          subBadge={{ text: `${kpis.unqualifiedRate.toFixed(1)}% drop`, color: 'orange' }}
          icon={<XCircle className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
          onClick={() => openDrillDown('filter', undefined, 'Unqualified Leads', { statusFilter: 'Unqualified' })}
        />

        {/* 5. Overall Conversion Rate */}
        <KpiCard
          title="Lead Conversion Rate"
          value={formatPercent(kpis.conversionRate.current)}
          comparison={kpis.conversionRate}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
          onClick={() => openDrillDown('filter', undefined, 'Converted Leads', { statusFilter: 'Converted' })}
        />

        {/* 6. Quotations Created */}
        <KpiCard
          title="Quotations Created"
          value={kpis.quotationsCreated.current}
          comparison={kpis.quotationsCreated}
          icon={<FileSpreadsheet className="w-5 h-5" />}
          iconBgColor="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
          onClick={() => openDrillDown('service', undefined, 'All Quotations')}
        />

        {/* 7. Deals Created */}
        <KpiCard
          title="Deals Created"
          value={kpis.dealsCreated.current}
          comparison={kpis.dealsCreated}
          icon={<BadgeDollarSign className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
          onClick={() => openDrillDown('service', undefined, 'All Deals')}
        />

        {/* 8. Invoices / Payments Generated */}
        <KpiCard
          title="Invoices Generated"
          value={kpis.invoicesGenerated.current}
          comparison={kpis.invoicesGenerated}
          icon={<Receipt className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
          onClick={() => openDrillDown('service', undefined, 'All Payments')}
        />
      </div>

      {/* Target Achievement Card + Lead Funnel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target Achievement (1 col) */}
        <ChartCard
          title="Monthly Target Achievement"
          subtitle="Enterprise revenue quota vs closed deals"
          infoTooltip="Target ₹85,00,000 monthly quota based on total deals won within active window."
          className="lg:col-span-1"
        >
          <div className="flex flex-col justify-between h-full space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Monthly Target</span>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatINR(kpis.targetRevenue)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold uppercase">Achieved</span>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCompactINR(kpis.targetAchieved)}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-300">
                  {kpis.targetPercent.toFixed(1)}% of Target Met
                </span>
                <span className="text-slate-400">
                  Remaining: {formatCompactINR(kpis.targetRemaining)}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, kpis.targetPercent)}%` }}
                />
              </div>
            </div>

            {/* Mini Bar Chart */}
            <div className="h-32 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={targetBarData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.6} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip
                    formatter={(val: number) => [formatINR(val), '']}
                    contentStyle={{ borderRadius: '0.5rem', fontSize: '12px' }}
                  />
                  <Bar dataKey="Target" fill="#E2E8F0" radius={[0, 4, 4, 0]} name="Target (₹85L)" />
                  <Bar dataKey="Achieved" fill="#2563EB" radius={[0, 4, 4, 0]} name="Achieved Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        {/* Lead Funnel (2 cols) */}
        <ChartCard
          title="Lead Conversion Funnel"
          subtitle="Sequential progression from New Leads to Converted Deals"
          infoTooltip="Funnel tracks acquisition stages and drop-offs. Click any stage to inspect."
          className="lg:col-span-2"
        >
          <div className="flex flex-col justify-around h-full py-2 space-y-4">
            {/* Funnel Pipeline Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Step 1: New */}
              <div
                onClick={() => openDrillDown('filter', undefined, 'New Leads', { statusFilter: 'New' })}
                className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 hover:border-blue-400 transition-all cursor-pointer relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">
                    1. New Leads
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    100%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {funnel.total}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Inbound intake captured</p>
              </div>

              {/* Step 2: Qualified */}
              <div
                onClick={() => openDrillDown('filter', undefined, 'Qualified Leads', { statusFilter: 'Qualified' })}
                className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 hover:border-indigo-400 transition-all cursor-pointer relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase">
                    2. Qualified
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                    {funnel.qualPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {funnel.qualCount}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Met eligibility criteria</p>
              </div>

              {/* Step 3: Converted */}
              <div
                onClick={() => openDrillDown('filter', undefined, 'Converted Leads', { statusFilter: 'Converted' })}
                className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-400 transition-all cursor-pointer relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                    3. Converted
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    {funnel.convPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {funnel.convCount}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Signed contracts & deals</p>
              </div>
            </div>

            {/* Unqualified Drop Branch */}
            <div
              onClick={() => openDrillDown('filter', undefined, 'Unqualified Leads', { statusFilter: 'Unqualified' })}
              className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20 flex items-center justify-between cursor-pointer hover:bg-rose-50 transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span className="font-semibold text-rose-800 dark:text-rose-300">
                  Unqualified / Drop-off Branch
                </span>
                <span className="text-slate-500">
                  ({funnel.unqualCount} leads, {funnel.unqualPercent.toFixed(1)}% of total)
                </span>
              </div>
              <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                View Dropped Leads <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Daily Lead Trend + Lead Sources Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Lead Trend (2 cols) */}
        <ChartCard
          title="Daily Lead Acquisition Trend"
          subtitle="Daily volume breakdown by status"
          infoTooltip="Shows intake volume over time. Click on legend badges to toggle individual series."
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-2 text-xs">
              {(['New', 'Qualified', 'Converted'] as const).map((key) => {
                const color =
                  key === 'New'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : key === 'Qualified'
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-emerald-500 text-emerald-600 bg-emerald-50'
                const isVis = lineVisibility[key]
                return (
                  <button
                    key={key}
                    onClick={() => toggleLine(key)}
                    className={`px-2 py-0.5 rounded border text-[11px] font-semibold transition-all ${
                      isVis ? color : 'opacity-40 border-slate-300 text-slate-400 bg-transparent'
                    }`}
                  >
                    {key}
                  </button>
                )
              })}
            </div>
          }
        >
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyLeadTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{ borderRadius: '0.5rem', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Legend />
                {lineVisibility.New && (
                  <Line
                    type="monotone"
                    dataKey="New"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="New Leads"
                  />
                )}
                {lineVisibility.Qualified && (
                  <Line
                    type="monotone"
                    dataKey="Qualified"
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Qualified"
                  />
                )}
                {lineVisibility.Converted && (
                  <Line
                    type="monotone"
                    dataKey="Converted"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Converted"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Lead Sources Donut Chart (1 col) */}
        <ChartCard
          title="Lead Sources Distribution"
          subtitle="Acquisition channel contribution"
          infoTooltip="Breakdown of leads by origination channel. Click slice or list item to drill-down."
          className="lg:col-span-1"
        >
          <div className="flex flex-col justify-between h-full space-y-3">
            <div className="h-[180px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourcesData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    onClick={(entry) =>
                      openDrillDown('filter', undefined, `Source: ${entry.name}`, { serviceFilter: entry.name })
                    }
                    cursor="pointer"
                  >
                    {leadSourcesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} leads (${((value / (filteredLeads.length || 1)) * 100).toFixed(1)}%)`,
                      name,
                    ]}
                    contentStyle={{ borderRadius: '0.5rem', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend breakdown list */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {leadSourcesData.map((src) => (
                <div
                  key={src.name}
                  onClick={() =>
                    openDrillDown('filter', undefined, `Source: ${src.name}`)
                  }
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: src.color }}
                  />
                  <div className="truncate flex-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300 block truncate">
                      {src.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {src.value} ({src.percent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Lead Status Trend (Stacked Area Chart) */}
      <ChartCard
        title="Lead Status Distribution Over Time"
        subtitle="Cumulative status mix across the active time window"
        infoTooltip="Stacked area view of how the lead cohort develops day-by-day."
      >
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyLeadTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorQual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorUnqual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
              <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <Tooltip contentStyle={{ borderRadius: '0.5rem', fontSize: '12px' }} />
              <Legend />
              <Area type="monotone" dataKey="New" stackId="1" stroke="#2563EB" fill="url(#colorNew)" name="New" />
              <Area type="monotone" dataKey="Qualified" stackId="1" stroke="#6366F1" fill="url(#colorQual)" name="Qualified" />
              <Area type="monotone" dataKey="Converted" stackId="1" stroke="#10B981" fill="url(#colorConv)" name="Converted" />
              <Area type="monotone" dataKey="Unqualified" stackId="1" stroke="#F43F5E" fill="url(#colorUnqual)" name="Unqualified" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </section>
  )
}
