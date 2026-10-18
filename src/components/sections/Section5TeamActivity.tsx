import React, { useMemo } from 'react'
import {
  UserCheck,
  Briefcase,
  Layers,
  Clock,
  ExternalLink,
  Activity as ActivityIcon,
  CheckCircle2,
  AlertTriangle,
  Award,
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { ChartCard } from '../common/ChartCard'
import { DataTable, Column } from '../common/DataTable'
import { formatINR, formatCompactINR, formatDateTime, formatPercent } from '../../utils/formatters'
import { Employee, Activity } from '../../types'

export const Section5TeamActivity: React.FC = () => {
  const {
    employees,
    filteredLeads,
    filteredQuotations,
    filteredDeals,
    filteredOrders,
    filteredPayments,
    filteredActivities,
    openDrillDown,
    setUserId,
  } = useDashboard()

  // 1. Sales Team Activity Table Data
  const salesTeamActivity = useMemo(() => {
    const salesEmps = employees.filter((e) => e.department === 'Sales')

    return salesEmps.map((emp) => {
      const leads = filteredLeads.filter((l) => l.ownerId === emp.id)
      const qualified = leads.filter((l) => l.status === 'Qualified').length
      const converted = leads.filter((l) => l.status === 'Converted').length
      const convRate = leads.length > 0 ? (converted / leads.length) * 100 : 0

      const leadIds = new Set(leads.map((l) => l.id))
      const quotes = filteredQuotations.filter((q) => leadIds.has(q.leadId))
      const deals = filteredDeals.filter((d) => leadIds.has(d.leadId))
      const dealValue = deals.reduce((sum, d) => sum + d.value, 0)

      const dealIds = new Set(deals.map((d) => d.id))
      const revenue = filteredPayments
        .filter((p) => dealIds.has(p.dealId) && p.status === 'Collected')
        .reduce((sum, p) => sum + p.amount, 0)

      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        avatar: emp.avatar,
        leadsHandled: leads.length,
        qualified,
        converted,
        convRate,
        quotations: quotes.length,
        dealsCount: deals.length,
        dealValue,
        revenue,
      }
    })
  }, [employees, filteredLeads, filteredQuotations, filteredDeals, filteredPayments])

  // 2. Operations Team Activity Table Data
  const opsTeamActivity = useMemo(() => {
    const opsEmps = employees.filter((e) => e.department === 'Operations')

    return opsEmps.map((emp) => {
      const orders = filteredOrders.filter((o) => o.assignedTo === emp.id)
      const stagesCompleted = orders.reduce((sum, o) => sum + o.stagesCompleted, 0)
      const totalStages = orders.reduce((sum, o) => sum + o.stagesTotal, 0)
      const pendingStages = Math.max(0, totalStages - stagesCompleted)
      const overdueOrders = orders.filter((o) => o.status === 'On Hold').length
      const completedOrders = orders.filter((o) => o.status === 'Completed').length

      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        avatar: emp.avatar,
        ordersUpdated: orders.length,
        stagesCompleted,
        pendingStages,
        completedOrders,
        overdueOrders,
      }
    })
  }, [employees, filteredOrders])

  // 3. Top performers highlight
  const topSales = useMemo(() => {
    return [...salesTeamActivity].sort((a, b) => b.revenue - a.revenue)[0]
  }, [salesTeamActivity])

  const topOps = useMemo(() => {
    return [...opsTeamActivity].sort((a, b) => b.stagesCompleted - a.stagesCompleted)[0]
  }, [opsTeamActivity])

  return (
    <section id="team" className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Section 5: Team Performance & CRM Activity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Departmental productivity quotas, operational turnaround, and live CRM event audit trail
            </p>
          </div>
        </div>
      </div>

      {/* Performer Spotlight Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Sales Performer */}
        {topSales && (
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/30 dark:to-indigo-950/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
                {topSales.avatar}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    Top Sales Closer
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {topSales.name}
                </h4>
                <p className="text-xs text-slate-500">{topSales.role}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-semibold">Realized Revenue</span>
              <div className="text-lg font-extrabold text-blue-700 dark:text-blue-400">
                {formatINR(topSales.revenue)}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {topSales.dealsCount} deals • {topSales.convRate.toFixed(1)}% conversion
              </span>
            </div>
          </div>
        )}

        {/* Top Operations Specialist */}
        {topOps && (
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-50/70 to-teal-50/70 dark:from-emerald-950/30 dark:to-teal-950/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-emerald-500/20">
                {topOps.avatar}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    Ops Delivery Leader
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {topOps.name}
                </h4>
                <p className="text-xs text-slate-500">{topOps.role}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 uppercase font-semibold">Stages Delivered</span>
              <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                {topOps.stagesCompleted} stages
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {topOps.completedOrders} completed orders
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sales Team Activity Table */}
      <ChartCard
        title="Sales Team Productivity & Revenue Performance"
        subtitle="Individual conversion metrics, pipeline generation, and realized revenue per account executive"
        infoTooltip="Click any rep row to filter dashboard to their specific portfolio or view drill-down."
      >
        <DataTable
          columns={[
            {
              key: 'name',
              title: 'Sales Representative',
              sortable: true,
              render: (row) => (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {row.avatar}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {row.name}
                    </span>
                    <span className="text-[11px] text-slate-400">{row.role}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'leadsHandled',
              title: 'Leads',
              align: 'center',
              sortable: true,
              render: (row) => <span className="font-semibold">{row.leadsHandled}</span>,
            },
            {
              key: 'qualified',
              title: 'Qualified',
              align: 'center',
              sortable: true,
              render: (row) => (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                  {row.qualified}
                </span>
              ),
            },
            {
              key: 'converted',
              title: 'Converted',
              align: 'center',
              sortable: true,
              render: (row) => (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                  {row.converted}
                </span>
              ),
            },
            {
              key: 'convRate',
              title: 'Conversion %',
              align: 'right',
              sortable: true,
              render: (row) => (
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {row.convRate.toFixed(1)}%
                </span>
              ),
            },
            {
              key: 'quotations',
              title: 'Quotes Sent',
              align: 'center',
              sortable: true,
            },
            {
              key: 'dealsCount',
              title: 'Deals Won',
              align: 'center',
              sortable: true,
              render: (row) => (
                <span className="font-bold text-blue-600 dark:text-blue-400">{row.dealsCount}</span>
              ),
            },
            {
              key: 'dealValue',
              title: 'Deal Value',
              align: 'right',
              sortable: true,
              render: (row) => <span className="font-semibold">{formatINR(row.dealValue)}</span>,
            },
            {
              key: 'revenue',
              title: 'Realized Revenue',
              align: 'right',
              sortable: true,
              render: (row) => (
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatINR(row.revenue)}
                </span>
              ),
            },
          ]}
          data={salesTeamActivity}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => setUserId(row.id)}
          searchPlaceholder="Search sales reps..."
          exportFileName="Sales_Team_Activity"
        />
      </ChartCard>

      {/* Operations Team Activity Table */}
      <ChartCard
        title="Operations Team Turnaround & Fulfillment"
        subtitle="Operational throughput, stage completion velocity, and pending bottleneck monitoring"
        infoTooltip="Click any ops officer row to filter view."
      >
        <DataTable
          columns={[
            {
              key: 'name',
              title: 'Operations Specialist',
              sortable: true,
              render: (row) => (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {row.avatar}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {row.name}
                    </span>
                    <span className="text-[11px] text-slate-400">{row.role}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'ordersUpdated',
              title: 'Assigned Orders',
              align: 'center',
              sortable: true,
              render: (row) => <span className="font-semibold">{row.ordersUpdated}</span>,
            },
            {
              key: 'stagesCompleted',
              title: 'Stages Completed',
              align: 'center',
              sortable: true,
              render: (row) => (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  {row.stagesCompleted}
                </span>
              ),
            },
            {
              key: 'pendingStages',
              title: 'Pending Stages',
              align: 'center',
              sortable: true,
              render: (row) => (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  {row.pendingStages}
                </span>
              ),
            },
            {
              key: 'completedOrders',
              title: 'Completed Deliveries',
              align: 'center',
              sortable: true,
              render: (row) => (
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {row.completedOrders}
                </span>
              ),
            },
            {
              key: 'overdueOrders',
              title: 'On-Hold / At-Risk',
              align: 'center',
              sortable: true,
              render: (row) => (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    row.overdueOrders > 0
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {row.overdueOrders}
                </span>
              ),
            },
          ]}
          data={opsTeamActivity}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => setUserId(row.id)}
          searchPlaceholder="Search ops specialists..."
          exportFileName="Operations_Team_Activity"
        />
      </ChartCard>

      {/* Recent CRM Activity Feed */}
      <ChartCard
        title="Recent CRM Activity Log"
        subtitle="Chronological feed of user events, lead creations, quote transmissions, and collections"
        infoTooltip="Real-time audit log. Click any record link to open relational drill-down."
      >
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Employee</th>
                <th className="py-2.5 px-4">Action Type</th>
                <th className="py-2.5 px-4">Linked Record</th>
                <th className="py-2.5 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredActivities.slice(0, 20).map((act) => {
                const emp = employees.find((e) => e.id === act.employeeId)
                return (
                  <tr
                    key={act.id}
                    onClick={() => {
                      if (act.recordType === 'lead') {
                        openDrillDown('lead', act.recordId, act.recordId)
                      } else if (act.recordType === 'quotation') {
                        openDrillDown('quotation', act.recordId, act.recordId)
                      } else if (act.recordType === 'deal') {
                        openDrillDown('deal', act.recordId, act.recordId)
                      } else if (act.recordType === 'order') {
                        openDrillDown('order', act.recordId, act.recordId)
                      }
                    }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatDateTime(act.timestamp)}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {emp?.name || act.employeeId}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold text-[11px]">
                        {act.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      <div className="flex items-center gap-1">
                        <span>{act.recordId}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 max-w-md truncate">
                      {act.details}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </section>
  )
}
