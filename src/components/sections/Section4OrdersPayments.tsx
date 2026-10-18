import React, { useMemo } from 'react'
import {
  PackageCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  TrendingUp,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useDashboard } from '../../context/DashboardContext'
import { ChartCard } from '../common/ChartCard'
import { DataTable, Column } from '../common/DataTable'
import { formatCompactINR, formatINR, formatDate, formatPercent } from '../../utils/formatters'
import { OrderStatus, ServiceName, Payment, Order } from '../../types'
import { SERVICES_CONFIG } from '../../data/servicesConfig'
import { format, parseISO, eachDayOfInterval } from 'date-fns'

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  Completed: '#10B981',   // Emerald
  'In Progress': '#3B82F6', // Blue
  Pending: '#F59E0B',     // Amber
  'On Hold': '#EC4899',   // Pink
}

export const Section4OrdersPayments: React.FC = () => {
  const {
    filteredOrders,
    filteredPayments,
    filteredDeals,
    filteredLeads,
    employees,
    openDrillDown,
    filters,
  } = useDashboard()

  // 1. Order Status breakdown cards / donut data
  const orderStatusBreakdown = useMemo(() => {
    const total = filteredOrders.length
    const statuses: OrderStatus[] = ['In Progress', 'Completed', 'Pending', 'On Hold']

    return statuses.map((status) => {
      const count = filteredOrders.filter((o) => o.status === status).length
      const percent = total > 0 ? (count / total) * 100 : 0
      return {
        name: status,
        value: count,
        percent,
        color: ORDER_STATUS_COLORS[status],
      }
    })
  }, [filteredOrders])

  // 2. Orders & Stage Progress: per-service stacked progress bars
  const serviceStageProgress = useMemo(() => {
    const map = new Map<ServiceName, { service: string; ordersCount: number; completedStages: number; totalStages: number }>()

    Object.keys(SERVICES_CONFIG).forEach((s) => {
      const sName = s as ServiceName
      map.set(sName, { service: sName, ordersCount: 0, completedStages: 0, totalStages: 0 })
    })

    filteredOrders.forEach((o) => {
      const entry = map.get(o.service)
      if (entry) {
        entry.ordersCount += 1
        entry.completedStages += o.stagesCompleted
        entry.totalStages += o.stagesTotal
      }
    })

    return Array.from(map.values())
      .filter((d) => d.ordersCount > 0)
      .map((d) => ({
        ...d,
        percent: d.totalStages > 0 ? Math.round((d.completedStages / d.totalStages) * 100) : 0,
      }))
      .sort((a, b) => b.ordersCount - a.ordersCount)
  }, [filteredOrders])

  // 3. Completed Orders list/table
  const completedOrdersList = useMemo(() => {
    return filteredOrders
      .filter((o) => o.status === 'Completed')
      .map((o) => {
        const deal = filteredDeals.find((d) => d.id === o.dealId)
        const lead = deal ? filteredLeads.find((l) => l.id === deal.leadId) : null
        const assignee = employees.find((e) => e.id === o.assignedTo)

        return {
          id: o.id,
          dealId: o.dealId,
          service: o.service,
          leadName: lead?.name || 'Client',
          company: lead?.company || 'N/A',
          stagesCompleted: o.stagesCompleted,
          stagesTotal: o.stagesTotal,
          assignedToName: assignee?.name || o.assignedTo,
          completedAt: o.completedAt || o.createdAt,
        }
      })
  }, [filteredOrders, filteredDeals, filteredLeads, employees])

  // 4. Payment History Table Data
  const paymentHistoryData = useMemo(() => {
    return filteredPayments.map((p) => {
      const deal = filteredDeals.find((d) => d.id === p.dealId)
      const lead = deal ? filteredLeads.find((l) => l.id === deal.leadId) : null

      return {
        id: p.id,
        dealId: p.dealId,
        orderId: p.orderId,
        leadName: lead?.name || 'Client',
        service: deal?.service || 'Service',
        amount: p.amount,
        method: p.method,
        status: p.status,
        paidAt: p.paidAt,
      }
    })
  }, [filteredPayments, filteredDeals, filteredLeads])

  // 5. Collection Trend: Area Chart over time
  const collectionTrendData = useMemo(() => {
    try {
      const start = parseISO(filters.startDate)
      const end = parseISO(filters.endDate)
      const days = eachDayOfInterval({ start, end })

      const map = new Map<string, { date: string; displayDate: string; Collected: number; Pending: number }>()

      days.forEach((day) => {
        const key = format(day, 'yyyy-MM-dd')
        map.set(key, {
          date: key,
          displayDate: format(day, days.length > 14 ? 'dd MMM' : 'EEE, dd MMM'),
          Collected: 0,
          Pending: 0,
        })
      })

      filteredPayments.forEach((p) => {
        const pDay = format(parseISO(p.paidAt), 'yyyy-MM-dd')
        const entry = map.get(pDay)
        if (entry) {
          if (p.status === 'Collected') entry.Collected += p.amount
          else entry.Pending += p.amount
        }
      })

      return Array.from(map.values())
    } catch {
      return []
    }
  }, [filteredPayments, filters.startDate, filters.endDate])

  return (
    <section id="orders" className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 rounded-lg">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Section 4: Orders & Payments Analytics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Operations fulfillment velocity, stage completion milestones, and payment collection audit
            </p>
          </div>
        </div>
      </div>

      {/* 4 Order Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {orderStatusBreakdown.map((item) => {
          let IconComp = Clock
          if (item.name === 'Completed') IconComp = CheckCircle2
          else if (item.name === 'In Progress') IconComp = PackageCheck
          else if (item.name === 'On Hold') IconComp = PauseCircle

          return (
            <div
              key={item.name}
              onClick={() =>
                openDrillDown('filter', undefined, `Orders: ${item.name}`, { statusFilter: item.name })
              }
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {item.name} Orders
                </span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {item.value}
                </div>
                <span className="text-[11px] font-medium text-slate-500 mt-1 block">
                  {item.percent.toFixed(1)}% of all orders
                </span>
              </div>

              <div
                className="p-3 rounded-xl shrink-0"
                style={{ backgroundColor: `${item.color}15`, color: item.color }}
              >
                <IconComp className="w-6 h-6" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Orders Stage Progress & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Stage Progress Bars (2 cols) */}
        <ChartCard
          title="Orders & Operational Stage Progress"
          subtitle="Cumulative fulfillment completion percentage per service offering"
          infoTooltip="Shows how many sub-milestones have been completed by operations staff."
          className="lg:col-span-2"
        >
          <div className="space-y-4 py-2">
            {serviceStageProgress.map((item) => (
              <div
                key={item.service}
                onClick={() =>
                  openDrillDown('service', undefined, item.service, { serviceFilter: item.service })
                }
                className="p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.service}
                    </span>
                    <span className="text-slate-400 ml-2">({item.ordersCount} orders)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">
                      {item.completedStages}/{item.totalStages} stages
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {item.percent}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.percent === 100
                        ? 'bg-emerald-500'
                        : item.percent > 50
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Order Status Donut Chart (1 col) */}
        <ChartCard
          title="Order Status Mix"
          subtitle="Proportion of orders by execution state"
          infoTooltip="Click any status slice to view matching orders in drill-down."
          className="lg:col-span-1"
        >
          <div className="flex flex-col justify-between h-full space-y-3">
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    onClick={(entry) =>
                      openDrillDown('filter', undefined, `Orders: ${entry.name}`, { statusFilter: entry.name })
                    }
                    cursor="pointer"
                  >
                    {orderStatusBreakdown.map((entry, index) => (
                      <Cell key={`order-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number, name: string) => [
                      `${val} orders (${((val / (filteredOrders.length || 1)) * 100).toFixed(1)}%)`,
                      name,
                    ]}
                    contentStyle={{ borderRadius: '0.5rem', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {orderStatusBreakdown.map((item) => (
                <div
                  key={item.name}
                  onClick={() =>
                    openDrillDown('filter', undefined, `Orders: ${item.name}`, { statusFilter: item.name })
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
      </div>

      {/* Completed Orders List/Table */}
      <ChartCard
        title="Completed Orders Delivery Roster"
        subtitle="Services fully fulfilled with all operational stages signed off"
        infoTooltip="Click any completed order to drill down into the client record and financials."
      >
        <DataTable
          columns={[
            { key: 'id', title: 'Order ID', sortable: true },
            {
              key: 'service',
              title: 'Service Name',
              sortable: true,
              render: (row) => <span className="font-semibold">{row.service}</span>,
            },
            {
              key: 'leadName',
              title: 'Client / Company',
              sortable: true,
              render: (row) => (
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{row.leadName}</div>
                  <div className="text-[11px] text-slate-400">{row.company}</div>
                </div>
              ),
            },
            {
              key: 'stagesCompleted',
              title: 'Stages',
              align: 'center',
              render: (row) => (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                  {row.stagesCompleted}/{row.stagesTotal} (100%)
                </span>
              ),
            },
            {
              key: 'assignedToName',
              title: 'Ops Officer',
              sortable: true,
              render: (row) => <span>{row.assignedToName}</span>,
            },
            {
              key: 'completedAt',
              title: 'Completion Date',
              sortable: true,
              render: (row) => formatDate(row.completedAt),
            },
          ]}
          data={completedOrdersList}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => openDrillDown('order', row.id, row.id)}
          searchPlaceholder="Search completed orders..."
          exportFileName="Completed_Orders"
        />
      </ChartCard>

      {/* Payment History Table & Collection Trend */}
      <div className="space-y-6">
        {/* Collection Trend Area Chart */}
        <ChartCard
          title="Daily Payment Collections & Receivables Realization"
          subtitle="Cash flow realized over time within active date filters"
          infoTooltip="Green area = Collected payments. Amber area = Pending collections."
        >
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={collectionTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="Collected"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#colorCollected)"
                  name="Collected Payments (₹)"
                />
                <Area
                  type="monotone"
                  dataKey="Pending"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fill="url(#colorPending)"
                  name="Pending Invoices (₹)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Payment History Table */}
        <ChartCard
          title="Payment History & Audit Trail"
          subtitle="Ledger of all collected and pending client remittances with search & pagination"
          infoTooltip="Full audit ledger with payment method and settlement status."
        >
          <DataTable
            columns={[
              { key: 'id', title: 'Payment ID', sortable: true },
              {
                key: 'leadName',
                title: 'Client / Service',
                sortable: true,
                render: (row) => (
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{row.leadName}</div>
                    <div className="text-[11px] text-slate-400">{row.service}</div>
                  </div>
                ),
              },
              {
                key: 'dealId',
                title: 'Deal ID',
                sortable: true,
                render: (row) => (
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{row.dealId}</span>
                ),
              },
              {
                key: 'amount',
                title: 'Amount',
                align: 'right',
                sortable: true,
                render: (row) => <span className="font-bold text-slate-900 dark:text-white">{formatINR(row.amount)}</span>,
              },
              {
                key: 'method',
                title: 'Method',
                align: 'center',
                sortable: true,
                render: (row) => (
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                    {row.method}
                  </span>
                ),
              },
              {
                key: 'status',
                title: 'Status',
                align: 'center',
                sortable: true,
                render: (row) => (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      row.status === 'Collected'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    }`}
                  >
                    {row.status}
                  </span>
                ),
              },
              {
                key: 'paidAt',
                title: 'Date',
                sortable: true,
                render: (row) => formatDate(row.paidAt),
              },
            ]}
            data={paymentHistoryData}
            keyExtractor={(row) => row.id}
            onRowClick={(row) => openDrillDown('deal', row.dealId, row.dealId)}
            searchableKeys={['id', 'dealId', 'leadName', 'service', 'method', 'status']}
            searchPlaceholder="Search payments by ID, client, method..."
            exportFileName="Payment_History"
          />
        </ChartCard>
      </div>
    </section>
  )
}
