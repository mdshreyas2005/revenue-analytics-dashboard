import React, { useMemo } from 'react'
import {
  BadgeDollarSign,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import { KpiCard } from '../common/KpiCard'
import { ChartCard } from '../common/ChartCard'
import { formatCompactINR, formatINR, formatPercent, formatDate } from '../../utils/formatters'
import { SERVICES_CONFIG, SERVICE_CATEGORIES } from '../../data/servicesConfig'
import { DealStage, DealPriority, ServiceName } from '../../types'
import { format, parseISO, eachDayOfInterval } from 'date-fns'

const STAGE_ORDER: DealStage[] = ['Prospecting', 'Negotiation', 'Won', 'In Delivery', 'Closed']

export const Section3DealsRevenue: React.FC = () => {
  const {
    filteredDeals,
    filteredPayments,
    kpis,
    openDrillDown,
    filters,
  } = useDashboard()

  // 1. Dual-Axis Bar Chart: Deals Created vs Deal Revenue by Service
  const dealsAndRevenueByService = useMemo(() => {
    const map = new Map<ServiceName, { service: string; dealsCount: number; revenue: number }>()

    Object.keys(SERVICES_CONFIG).forEach((s) => {
      const sName = s as ServiceName
      map.set(sName, { service: sName, dealsCount: 0, revenue: 0 })
    })

    filteredDeals.forEach((d) => {
      const entry = map.get(d.service)
      if (entry) {
        entry.dealsCount += 1
        entry.revenue += d.value
      }
    })

    return Array.from(map.values())
      .filter((d) => d.dealsCount > 0 || true)
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredDeals])

  // 2. Revenue by Service Category (Progress Bars with ₹ and %)
  const categoryRevenue = useMemo(() => {
    const totalRev = filteredDeals.reduce((sum, d) => sum + d.value, 0)
    const catMap = new Map<string, { category: string; revenue: number; count: number }>()

    SERVICE_CATEGORIES.forEach((cat) => {
      catMap.set(cat, { category: cat, revenue: 0, count: 0 })
    })

    filteredDeals.forEach((d) => {
      const entry = catMap.get(d.category)
      if (entry) {
        entry.revenue += d.value
        entry.count += 1
      }
    })

    return Array.from(catMap.values()).map((c) => ({
      ...c,
      percent: totalRev > 0 ? (c.revenue / totalRev) * 100 : 0,
    }))
  }, [filteredDeals])

  // 3. Priority Breakdown Table (High, Medium, Low)
  const priorityBreakdown = useMemo(() => {
    const totalRev = filteredDeals.reduce((sum, d) => sum + d.value, 0)
    const priorities: DealPriority[] = ['High', 'Medium', 'Low']

    return priorities.map((p) => {
      const matching = filteredDeals.filter((d) => d.priority === p)
      const dealsCount = matching.length
      const revenue = matching.reduce((sum, d) => sum + d.value, 0)
      const percent = totalRev > 0 ? (revenue / totalRev) * 100 : 0

      return {
        priority: p,
        dealsCount,
        revenue,
        percent,
      }
    })
  }, [filteredDeals])

  // 4. Daily Revenue Trend: Revenue vs Collected
  const dailyRevenueTrend = useMemo(() => {
    try {
      const start = parseISO(filters.startDate)
      const end = parseISO(filters.endDate)
      const days = eachDayOfInterval({ start, end })

      const map = new Map<string, { date: string; displayDate: string; Revenue: number; Collected: number }>()

      days.forEach((day) => {
        const key = format(day, 'yyyy-MM-dd')
        map.set(key, {
          date: key,
          displayDate: format(day, days.length > 14 ? 'dd MMM' : 'EEE, dd MMM'),
          Revenue: 0,
          Collected: 0,
        })
      })

      filteredDeals.forEach((d) => {
        const dDay = format(parseISO(d.createdAt), 'yyyy-MM-dd')
        const entry = map.get(dDay)
        if (entry) {
          entry.Revenue += d.value
        }
      })

      filteredPayments.forEach((p) => {
        if (p.status === 'Collected') {
          const pDay = format(parseISO(p.paidAt), 'yyyy-MM-dd')
          const entry = map.get(pDay)
          if (entry) {
            entry.Collected += p.amount
          }
        }
      })

      return Array.from(map.values())
    } catch {
      return []
    }
  }, [filteredDeals, filteredPayments, filters.startDate, filters.endDate])

  // 5. Deal Progress Pipeline stages
  const stagePipeline = useMemo(() => {
    const totalRev = filteredDeals.reduce((sum, d) => sum + d.value, 0)

    return STAGE_ORDER.map((stage) => {
      const matching = filteredDeals.filter((d) => d.stage === stage)
      const count = matching.length
      const value = matching.reduce((sum, d) => sum + d.value, 0)
      const percent = totalRev > 0 ? (value / totalRev) * 100 : 0

      return {
        stage,
        count,
        value,
        percent,
      }
    })
  }, [filteredDeals])

  return (
    <section id="deals" className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 rounded-lg">
            <BadgeDollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Section 3: Deals & Revenue Analytics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Commercial deal stages, booked revenue vs collected cash flow, and priority segmentation
            </p>
          </div>
        </div>
      </div>

      {/* 3 Core Revenue KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Booked Revenue */}
        <KpiCard
          title="Total Deal Revenue"
          value={formatINR(kpis.totalRevenue.current)}
          comparison={kpis.totalRevenue}
          icon={<BadgeDollarSign className="w-6 h-6" />}
          iconBgColor="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
          onClick={() => openDrillDown('service', undefined, 'All Deals')}
        />

        {/* Collected Revenue */}
        <KpiCard
          title="Collected Revenue"
          value={formatINR(kpis.collectedRevenue.current)}
          comparison={kpis.collectedRevenue}
          subBadge={{ text: `${kpis.collectionPercentage.toFixed(1)}% realized`, color: 'green' }}
          icon={<CreditCard className="w-6 h-6" />}
          iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
          onClick={() => openDrillDown('service', undefined, 'Collected Payments')}
        />

        {/* Outstanding Revenue Card */}
        <div
          onClick={() => openDrillDown('service', undefined, 'Pending Receivables')}
          className="relative group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between cursor-pointer hover:border-amber-400"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Outstanding Receivables
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  {(100 - kpis.collectionPercentage).toFixed(1)}% pending
                </span>
              </div>
              <div className="mt-1">
                <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                  {formatINR(kpis.outstandingRevenue)}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Collection rate: {kpis.collectionPercentage.toFixed(1)}%</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatCompactINR(kpis.collectedRevenue.current)} of {formatCompactINR(kpis.totalRevenue.current)}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, kpis.collectionPercentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Deal Pipeline Progression Card */}
      <ChartCard
        title="Deal Pipeline Progression"
        subtitle="Stage-wise funnel of contracts from initial prospecting to closed delivery"
        infoTooltip="Click any pipeline stage to view deals in that stage."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 py-2">
          {stagePipeline.map((s, idx) => (
            <div
              key={s.stage}
              onClick={() =>
                openDrillDown('filter', undefined, `Deals: ${s.stage}`, { statusFilter: s.stage })
              }
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Stage 0{idx + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {s.percent.toFixed(1)}%
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {s.stage}
                </h4>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  {formatCompactINR(s.value)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {s.count} {s.count === 1 ? 'deal' : 'deals'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Dual-Axis Bar Chart: Deals Created vs Deal Revenue by Service */}
      <ChartCard
        title="Deals Created vs Deal Revenue by Service"
        subtitle="Dual-axis visualization comparing contract counts (left axis) with total revenue (right axis)"
        infoTooltip="Left bar = Deals Count. Right line = Total Value (₹)."
      >
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dealsAndRevenueByService}
              margin={{ top: 10, right: 30, left: 10, bottom: 45 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
              <XAxis
                dataKey="service"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-25}
                textAnchor="end"
                stroke="#94A3B8"
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                allowDecimals={false}
                stroke="#2563EB"
                tick={{ fontSize: 11 }}
                name="Deals"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10B981"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => formatCompactINR(val)}
                name="Revenue"
              />
              <Tooltip
                formatter={(val: number, name: string) => [
                  name === 'Revenue' ? formatINR(val) : `${val} deals`,
                  name,
                ]}
                contentStyle={{ borderRadius: '0.5rem', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar
                yAxisId="left"
                dataKey="dealsCount"
                fill="#2563EB"
                name="Deals Count"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(entry) =>
                  openDrillDown('service', undefined, entry.service, { serviceFilter: entry.service })
                }
              />
              <Bar
                yAxisId="right"
                dataKey="revenue"
                fill="#10B981"
                name="Revenue (₹)"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(entry) =>
                  openDrillDown('service', undefined, entry.service, { serviceFilter: entry.service })
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Two Columns: Revenue by Service Category + Priority Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Service Category (Progress Bars) */}
        <ChartCard
          title="Revenue by Service Category"
          subtitle="Monetary contribution by operational practice area"
          infoTooltip="Distribution across corporate formation, tax, IP, and licensing."
        >
          <div className="space-y-4 py-2">
            {categoryRevenue.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cat.category}
                    </span>
                    <span className="text-slate-400 ml-2">({cat.count} deals)</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{formatINR(cat.revenue)}</span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({cat.percent.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Priority Breakdown Table */}
        <ChartCard
          title="Deal Priority Segmentation"
          subtitle="Revenue distribution by high, medium, and low deal priority"
          infoTooltip="High priority deals require immediate account executive engagement."
        >
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 mt-2">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Priority Tier</th>
                  <th className="py-3 px-4 text-center">Deals</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-right">% Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {priorityBreakdown.map((row) => (
                  <tr
                    key={row.priority}
                    onClick={() =>
                      openDrillDown('filter', undefined, `${row.priority} Priority Deals`, {
                        statusFilter: row.priority,
                      })
                    }
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          row.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200/60'
                            : row.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200/60'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200'
                        }`}
                      >
                        {row.priority} Priority
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                      {row.dealsCount}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatINR(row.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-blue-600 dark:text-blue-400">
                      {row.percent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* Daily Revenue Trend (Revenue vs Collected) */}
      <ChartCard
        title="Daily Revenue Trend: Invoiced Deals vs Collected Cash Flow"
        subtitle="Comparing booked deal values against actual payments realized day-by-day"
        infoTooltip="Green line = Cash Collected. Blue line = Deals Booked."
      >
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyRevenueTrend} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
              <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <YAxis
                tickFormatter={(v) => formatCompactINR(v)}
                tick={{ fontSize: 11 }}
                stroke="#94A3B8"
              />
              <Tooltip
                formatter={(val: number, name: string) => [formatINR(val), name]}
                contentStyle={{ borderRadius: '0.5rem', fontSize: '12px' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Revenue"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                name="Booked Revenue"
              />
              <Line
                type="monotone"
                dataKey="Collected"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                name="Cash Collected"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </section>
  )
}
