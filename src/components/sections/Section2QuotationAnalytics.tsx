import React, { useMemo } from 'react'
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Percent,
  Search,
  ExternalLink,
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
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import { ChartCard } from '../common/ChartCard'
import { DataTable, Column } from '../common/DataTable'
import { formatCompactINR, formatINR, formatPercent, formatDate } from '../../utils/formatters'
import { SERVICES_CONFIG, SERVICE_CATEGORIES } from '../../data/servicesConfig'
import { ServiceName, Quotation } from '../../types'

const STATUS_COLORS = {
  Accepted: '#10B981', // Emerald
  Pending: '#F59E0B',  // Amber
  Rejected: '#EF4444', // Red
}

export const Section2QuotationAnalytics: React.FC = () => {
  const {
    filteredQuotations,
    filteredDeals,
    filteredLeads,
    openDrillDown,
    kpis,
  } = useDashboard()

  // 1. Quotations by Service / Category (Bar Chart data)
  const serviceVolumeData = useMemo(() => {
    const map = new Map<ServiceName, { service: string; category: string; count: number; accepted: number; pending: number; rejected: number; totalAmount: number }>()

    Object.keys(SERVICES_CONFIG).forEach((s) => {
      const sName = s as ServiceName
      map.set(sName, {
        service: sName,
        category: SERVICES_CONFIG[sName].category,
        count: 0,
        accepted: 0,
        pending: 0,
        rejected: 0,
        totalAmount: 0,
      })
    })

    filteredQuotations.forEach((q) => {
      const entry = map.get(q.service)
      if (entry) {
        entry.count += 1
        entry.totalAmount += q.amount
        if (q.status === 'Accepted') entry.accepted += 1
        else if (q.status === 'Pending') entry.pending += 1
        else if (q.status === 'Rejected') entry.rejected += 1
      }
    })

    return Array.from(map.values())
      .filter((d) => d.count > 0 || true)
      .sort((a, b) => b.count - a.count)
  }, [filteredQuotations])

  // 2. Quotation Value by Service (Horizontal Bar data with ₹ and % share)
  const serviceValueData = useMemo(() => {
    const totalQuotedValue = filteredQuotations.reduce((sum, q) => sum + q.amount, 0)

    return serviceVolumeData
      .map((d) => ({
        service: d.service,
        value: d.totalAmount,
        percent: totalQuotedValue > 0 ? (d.totalAmount / totalQuotedValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
  }, [serviceVolumeData, filteredQuotations])

  // 3. Service-wise Quotation Details Table Data
  const serviceTableData = useMemo(() => {
    return serviceVolumeData.map((d) => {
      const convRate = d.count > 0 ? (d.accepted / d.count) * 100 : 0
      return {
        service: d.service,
        category: d.category,
        quotations: d.count,
        quotedAmount: d.totalAmount,
        accepted: d.accepted,
        pending: d.pending,
        rejected: d.rejected,
        convRate,
      }
    })
  }, [serviceVolumeData])

  // 4. Quotation Status Breakdown (Donut Chart)
  const statusBreakdownData = useMemo(() => {
    const total = filteredQuotations.length
    const accepted = filteredQuotations.filter((q) => q.status === 'Accepted').length
    const pending = filteredQuotations.filter((q) => q.status === 'Pending').length
    const rejected = filteredQuotations.filter((q) => q.status === 'Rejected').length

    return [
      { name: 'Accepted', value: accepted, percent: total > 0 ? (accepted / total) * 100 : 0, color: STATUS_COLORS.Accepted },
      { name: 'Pending', value: pending, percent: total > 0 ? (pending / total) * 100 : 0, color: STATUS_COLORS.Pending },
      { name: 'Rejected', value: rejected, percent: total > 0 ? (rejected / total) * 100 : 0, color: STATUS_COLORS.Rejected },
    ]
  }, [filteredQuotations])

  // 5. Lead-wise Quotation History
  const leadQuoteHistoryData = useMemo(() => {
    return filteredQuotations.map((q) => {
      const lead = filteredLeads.find((l) => l.id === q.leadId)
      return {
        id: q.id,
        leadId: q.leadId,
        leadName: lead?.name || 'Unknown Client',
        company: lead?.company || 'N/A',
        service: q.service,
        category: q.category,
        amount: q.amount,
        status: q.status,
        createdAt: q.createdAt,
      }
    })
  }, [filteredQuotations, filteredLeads])

  // 6. Radial gauge data for Quote-to-Deal Conversion Rate
  const radialData = useMemo(() => {
    const rate = Math.min(100, Math.round(kpis.quoteToDealRate))
    return [
      {
        name: 'Quote to Deal',
        value: rate,
        fill: '#2563EB',
      },
    ]
  }, [kpis.quoteToDealRate])

  // Table columns definition for Service-wise table
  const serviceTableColumns: Column<typeof serviceTableData[0]>[] = [
    {
      key: 'service',
      title: 'Service Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block">
            {row.service}
          </span>
          <span className="text-[11px] text-slate-400">{row.category}</span>
        </div>
      ),
    },
    {
      key: 'quotations',
      title: 'Quotations',
      align: 'center',
      sortable: true,
      render: (row) => <span className="font-semibold">{row.quotations}</span>,
    },
    {
      key: 'quotedAmount',
      title: 'Quoted Amount',
      align: 'right',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-900 dark:text-white">{formatINR(row.quotedAmount)}</span>,
    },
    {
      key: 'accepted',
      title: 'Accepted',
      align: 'center',
      sortable: true,
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          {row.accepted}
        </span>
      ),
    },
    {
      key: 'pending',
      title: 'Pending',
      align: 'center',
      sortable: true,
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
          {row.pending}
        </span>
      ),
    },
    {
      key: 'rejected',
      title: 'Rejected',
      align: 'center',
      sortable: true,
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
          {row.rejected}
        </span>
      ),
    },
    {
      key: 'convRate',
      title: 'Conv. Rate',
      align: 'right',
      sortable: true,
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5 font-bold text-slate-900 dark:text-white">
          <span>{row.convRate.toFixed(1)}%</span>
        </div>
      ),
    },
  ]

  return (
    <section id="quotations" className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 rounded-lg">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Section 2: Quotation Analytics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proposals pipeline, service pricing performance, acceptance velocity & deal conversion
            </p>
          </div>
        </div>
      </div>

      {/* Top Row: Quotations by Service & Quotation Value by Service */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quotations Count by Service Bar Chart */}
        <ChartCard
          title="Quotations by Service & Acceptance"
          subtitle="Proposals generated with acceptance breakdown"
          infoTooltip="Volume of quotes generated per commercial service offering."
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={serviceVolumeData}
                margin={{ top: 10, right: 10, left: -10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                <XAxis
                  dataKey="service"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  stroke="#94A3B8"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{ borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  dataKey="accepted"
                  fill="#10B981"
                  name="Accepted"
                  stackId="a"
                  cursor="pointer"
                  onClick={(data) =>
                    openDrillDown('service', undefined, data.service, {
                      serviceFilter: data.service,
                      statusFilter: 'Accepted',
                    })
                  }
                />
                <Bar
                  dataKey="pending"
                  fill="#F59E0B"
                  name="Pending"
                  stackId="a"
                  cursor="pointer"
                  onClick={(data) =>
                    openDrillDown('service', undefined, data.service, {
                      serviceFilter: data.service,
                      statusFilter: 'Pending',
                    })
                  }
                />
                <Bar
                  dataKey="rejected"
                  fill="#EF4444"
                  name="Rejected"
                  stackId="a"
                  cursor="pointer"
                  onClick={(data) =>
                    openDrillDown('service', undefined, data.service, {
                      serviceFilter: data.service,
                      statusFilter: 'Rejected',
                    })
                  }
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Quotation Value by Service (Horizontal Bar with ₹ and %) */}
        <ChartCard
          title="Quotation Value by Service"
          subtitle="Cumulative monetary value and share of quotes"
          infoTooltip="Total monetary proposals submitted. Shows financial pipeline weight."
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={serviceValueData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis
                  type="number"
                  tickFormatter={(val) => formatCompactINR(val)}
                  tick={{ fontSize: 11 }}
                  stroke="#94A3B8"
                />
                <YAxis
                  type="category"
                  dataKey="service"
                  tick={{ fontSize: 10 }}
                  width={110}
                  stroke="#94A3B8"
                />
                <Tooltip
                  formatter={(val: number, _name: string, item: any) => [
                    `${formatINR(val)} (${item.payload.percent.toFixed(1)}% of total)`,
                    'Quoted Value',
                  ]}
                  contentStyle={{ borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Bar
                  dataKey="value"
                  fill="#8B5CF6"
                  radius={[0, 4, 4, 0]}
                  name="Quoted Value"
                  cursor="pointer"
                  onClick={(data) =>
                    openDrillDown('service', undefined, data.service, { serviceFilter: data.service })
                  }
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Middle Row: Quotation Status Breakdown + Quote-to-Deal Radial Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown (1 col) */}
        <ChartCard
          title="Quotation Status Breakdown"
          subtitle="Accepted vs Pending vs Rejected quotes"
          infoTooltip="Click any status slice to view matching quotes in drill-down."
          className="lg:col-span-1"
        >
          <div className="flex flex-col justify-between h-full space-y-3">
            <div className="h-[180px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdownData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    onClick={(entry) =>
                      openDrillDown('filter', undefined, `Quotations: ${entry.name}`, { statusFilter: entry.name })
                    }
                    cursor="pointer"
                  >
                    {statusBreakdownData.map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number, name: string) => [
                      `${val} quotations (${((val / (filteredQuotations.length || 1)) * 100).toFixed(1)}%)`,
                      name,
                    ]}
                    contentStyle={{ borderRadius: '0.5rem', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {statusBreakdownData.map((item) => (
                <div
                  key={item.name}
                  onClick={() =>
                    openDrillDown('filter', undefined, `Quotations: ${item.name}`, { statusFilter: item.name })
                  }
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.value} ({item.percent.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Quote-to-Deal Conversion Rate (Radial Gauge) (2 cols) */}
        <ChartCard
          title="Quote-to-Deal Conversion Efficiency"
          subtitle="Conversion velocity from issued proposals into active closed deals"
          infoTooltip="Calculated as (Deals Created / Quotations Created) * 100"
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 items-center h-full gap-4 py-2">
            {/* Left: Big Radial Gauge */}
            <div className="h-[210px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="95%"
                  barSize={16}
                  data={radialData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 block">
                  {kpis.quoteToDealRate.toFixed(1)}%
                </span>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Conversion Rate
                </span>
              </div>
            </div>

            {/* Right: Key Stats */}
            <div className="space-y-4 pr-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Quote-to-Deal Ratio
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {filteredDeals.length} Deals / {filteredQuotations.length} Quotations
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Ratio of generated quotes that resulted in signed deals within the active filter window.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Total Quoted Value</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {formatCompactINR(filteredQuotations.reduce((s, q) => s + q.amount, 0))}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Won Deal Value</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCompactINR(filteredDeals.reduce((s, d) => s + d.value, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Service-wise Quotation Details Table */}
      <ChartCard
        title="Service-wise Quotation Performance"
        subtitle="Detailed breakdown of quotations, quoted volume, acceptance, and conversion rate"
        infoTooltip="Sort by clicking column headers. Click any row to view associated quotations in drill-down."
      >
        <DataTable
          columns={serviceTableColumns}
          data={serviceTableData}
          keyExtractor={(row) => row.service}
          onRowClick={(row) =>
            openDrillDown('service', undefined, row.service, { serviceFilter: row.service })
          }
          initialSortKey="quotations"
          initialSortDirection="desc"
          exportFileName="Service_Wise_Quotations"
        />
      </ChartCard>

      {/* Lead-wise Quotation History Searchable Table */}
      <ChartCard
        title="Lead-wise Quotation History"
        subtitle="Searchable log of all quotations with instant drill-down into client record"
        infoTooltip="Click any row to open the complete relational drill-down for that lead!"
      >
        <DataTable
          columns={[
            { key: 'id', title: 'Quote ID', sortable: true },
            {
              key: 'leadName',
              title: 'Lead / Client',
              sortable: true,
              render: (row) => (
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{row.leadName}</span>
                    <ExternalLink className="w-3 h-3 text-blue-500 opacity-70" />
                  </div>
                  <div className="text-[11px] text-slate-400">{row.company}</div>
                </div>
              ),
            },
            { key: 'service', title: 'Service', sortable: true },
            {
              key: 'amount',
              title: 'Amount',
              align: 'right',
              sortable: true,
              render: (row) => <span className="font-bold">{formatINR(row.amount)}</span>,
            },
            {
              key: 'status',
              title: 'Status',
              align: 'center',
              sortable: true,
              render: (row) => (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    row.status === 'Accepted'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : row.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                  }`}
                >
                  {row.status}
                </span>
              ),
            },
            {
              key: 'createdAt',
              title: 'Date Created',
              sortable: true,
              render: (row) => formatDate(row.createdAt),
            },
          ]}
          data={leadQuoteHistoryData}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => {
            const lead = filteredLeads.find((l) => l.id === row.leadId)
            if (lead) {
              openDrillDown('lead', lead.id, lead.name)
            } else {
              openDrillDown('quotation', row.id, row.id)
            }
          }}
          searchableKeys={['id', 'leadName', 'company', 'service', 'status']}
          searchPlaceholder="Search by lead name, company, quote ID..."
          exportFileName="Lead_Quotation_History"
        />
      </ChartCard>
    </section>
  )
}
