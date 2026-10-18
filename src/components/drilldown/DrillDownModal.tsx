import React, { useMemo } from 'react'
import {
  X,
  ChevronRight,
  ArrowRight,
  FileText,
  BadgeDollarSign,
  Package,
  CreditCard,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import {
  Lead,
  Quotation,
  Deal,
  Order,
  Payment,
  BreadcrumbItem,
} from '../../types'
import { formatINR, formatDate, formatPercent } from '../../utils/formatters'
import { DataTable, Column } from '../common/DataTable'

export const DrillDownModal: React.FC = () => {
  const {
    drillDown,
    closeDrillDown,
    popBreadcrumb,
    pushBreadcrumb,
    allLeads,
    allQuotations,
    allDeals,
    allOrders,
    allPayments,
    employees,
    filteredLeads,
    filteredQuotations,
    filteredDeals,
    filteredOrders,
    filteredPayments,
  } = useDashboard()

  if (!drillDown.isOpen) return null

  // Current entity lookups
  const currentLead = useMemo(() => {
    if (drillDown.targetType === 'lead' && drillDown.targetId) {
      return allLeads.find((l) => l.id === drillDown.targetId)
    }
    return null
  }, [drillDown.targetType, drillDown.targetId, allLeads])

  const currentQuotation = useMemo(() => {
    if (drillDown.targetType === 'quotation' && drillDown.targetId) {
      return allQuotations.find((q) => q.id === drillDown.targetId)
    }
    return null
  }, [drillDown.targetType, drillDown.targetId, allQuotations])

  const currentDeal = useMemo(() => {
    if (drillDown.targetType === 'deal' && drillDown.targetId) {
      return allDeals.find((d) => d.id === drillDown.targetId)
    }
    return null
  }, [drillDown.targetType, drillDown.targetId, allDeals])

  const currentOrder = useMemo(() => {
    if (drillDown.targetType === 'order' && drillDown.targetId) {
      return allOrders.find((o) => o.id === drillDown.targetId)
    }
    return null
  }, [drillDown.targetType, drillDown.targetId, allOrders])

  // Contextual related records for the active entity
  const relatedLead = useMemo(() => {
    if (currentLead) return currentLead
    if (currentQuotation) return allLeads.find((l) => l.id === currentQuotation.leadId)
    if (currentDeal) return allLeads.find((l) => l.id === currentDeal.leadId)
    return null
  }, [currentLead, currentQuotation, currentDeal, allLeads])

  const relatedQuotations = useMemo(() => {
    if (relatedLead) {
      return allQuotations.filter((q) => q.leadId === relatedLead.id)
    }
    return []
  }, [relatedLead, allQuotations])

  const relatedDeals = useMemo(() => {
    if (relatedLead) {
      return allDeals.filter((d) => d.leadId === relatedLead.id)
    }
    return []
  }, [relatedLead, allDeals])

  const relatedDealIds = useMemo(() => new Set(relatedDeals.map((d) => d.id)), [relatedDeals])

  const relatedOrders = useMemo(() => {
    if (currentDeal) {
      return allOrders.filter((o) => o.dealId === currentDeal.id)
    }
    if (relatedDealIds.size > 0) {
      return allOrders.filter((o) => relatedDealIds.has(o.dealId))
    }
    return []
  }, [currentDeal, relatedDealIds, allOrders])

  const relatedOrderIds = useMemo(() => new Set(relatedOrders.map((o) => o.id)), [relatedOrders])

  const relatedPayments = useMemo(() => {
    if (currentDeal) {
      return allPayments.filter((p) => p.dealId === currentDeal.id)
    }
    if (relatedDealIds.size > 0) {
      return allPayments.filter((p) => relatedDealIds.has(p.dealId))
    }
    return []
  }, [currentDeal, relatedDealIds, allPayments])

  // Get employee name helper
  const getEmployeeName = (empId: string) => {
    return employees.find((e) => e.id === empId)?.name || empId
  }

  // Drilldown navigators
  const drillIntoLead = (lead: Lead) => {
    pushBreadcrumb({
      type: 'lead',
      id: lead.id,
      title: lead.name,
      subtitle: lead.company,
    })
  }

  const drillIntoQuotation = (q: Quotation) => {
    pushBreadcrumb({
      type: 'quotation',
      id: q.id,
      title: q.id,
      subtitle: q.service,
    })
  }

  const drillIntoDeal = (deal: Deal) => {
    pushBreadcrumb({
      type: 'deal',
      id: deal.id,
      title: deal.id,
      subtitle: deal.service,
    })
  }

  // Service filtered list view (e.g. clicked from chart)
  const isFilteredList = drillDown.targetType === 'filter' || drillDown.targetType === 'service'
  const filterService = drillDown.serviceFilter
  const filterStatus = drillDown.statusFilter

  const listQuotations = useMemo(() => {
    return filteredQuotations.filter((q) => {
      if (filterService && q.service !== filterService) return false
      if (filterStatus && q.status !== filterStatus) return false
      return true
    })
  }, [filteredQuotations, filterService, filterStatus])

  const listDeals = useMemo(() => {
    return filteredDeals.filter((d) => {
      if (filterService && d.service !== filterService) return false
      if (filterStatus && d.stage !== filterStatus) return false
      return true
    })
  }, [filteredDeals, filterService, filterStatus])

  const listLeads = useMemo(() => {
    return filteredLeads.filter((l) => {
      if (filterStatus && l.status !== filterStatus) return false
      return true
    })
  }, [filteredLeads, filterStatus])

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-4">
          <div className="flex-1">
            {/* Breadcrumbs Navigation Chain */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              {drillDown.breadcrumbs.map((crumb, idx) => {
                const isLast = idx === drillDown.breadcrumbs.length - 1
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    <button
                      onClick={() => popBreadcrumb(idx)}
                      disabled={isLast}
                      className={`font-semibold transition-colors flex items-center gap-1 ${
                        isLast
                          ? 'text-blue-600 dark:text-blue-400 cursor-default'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:underline'
                      }`}
                    >
                      <span>{crumb.title}</span>
                      {crumb.subtitle && (
                        <span className="text-[10px] font-normal text-slate-400">
                          ({crumb.subtitle})
                        </span>
                      )}
                    </button>
                  </React.Fragment>
                )
              })}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Deep Relational Drill-Down: Lead → Quotations → Deals → Orders → Payments
            </p>
          </div>

          <button
            onClick={closeDrillDown}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. FILTERED LIST VIEW */}
          {isFilteredList && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 rounded-xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                    Filtered Dataset: {filterService || filterStatus || 'All Items'}
                  </h3>
                </div>
                <p className="text-xs text-blue-700/80 dark:text-blue-300 mt-1">
                  Showing records matching active global date filters. Click any row to drill into full relationships.
                </p>
              </div>

              {listQuotations.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Associated Quotations ({listQuotations.length})
                  </h4>
                  <DataTable
                    data={listQuotations}
                    keyExtractor={(q) => q.id}
                    onRowClick={drillIntoQuotation}
                    columns={[
                      { key: 'id', title: 'Quote ID', sortable: true },
                      {
                        key: 'leadId',
                        title: 'Lead / Client',
                        sortable: true,
                        render: (q) => {
                          const l = allLeads.find((x) => x.id === q.leadId)
                          return (
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">{l?.name || q.leadId}</div>
                              <div className="text-[11px] text-slate-400">{l?.company}</div>
                            </div>
                          )
                        },
                      },
                      { key: 'service', title: 'Service', sortable: true },
                      {
                        key: 'amount',
                        title: 'Amount',
                        align: 'right',
                        sortable: true,
                        render: (q) => <span className="font-semibold">{formatINR(q.amount)}</span>,
                      },
                      {
                        key: 'status',
                        title: 'Status',
                        align: 'center',
                        render: (q) => (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              q.status === 'Accepted'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : q.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            }`}
                          >
                            {q.status}
                          </span>
                        ),
                      },
                      {
                        key: 'createdAt',
                        title: 'Date',
                        sortable: true,
                        render: (q) => formatDate(q.createdAt),
                      },
                    ]}
                  />
                </div>
              )}

              {listDeals.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Deals ({listDeals.length})
                  </h4>
                  <DataTable
                    data={listDeals}
                    keyExtractor={(d) => d.id}
                    onRowClick={drillIntoDeal}
                    columns={[
                      { key: 'id', title: 'Deal ID', sortable: true },
                      { key: 'service', title: 'Service', sortable: true },
                      {
                        key: 'value',
                        title: 'Value',
                        align: 'right',
                        sortable: true,
                        render: (d) => <span className="font-semibold">{formatINR(d.value)}</span>,
                      },
                      {
                        key: 'stage',
                        title: 'Stage',
                        render: (d) => (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {d.stage}
                          </span>
                        ),
                      },
                      {
                        key: 'priority',
                        title: 'Priority',
                        render: (d) => (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              d.priority === 'High'
                                ? 'bg-rose-50 text-rose-700'
                                : d.priority === 'Medium'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {d.priority}
                          </span>
                        ),
                      },
                    ]}
                  />
                </div>
              )}
            </div>
          )}

          {/* 2. SPECIFIC ENTITY DRILL-DOWN (Lead, Quotation, Deal) */}
          {relatedLead && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      LEAD
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {relatedLead.name}
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-slate-400" />
                    {relatedLead.company}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      relatedLead.status === 'Converted'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                        : relatedLead.status === 'Qualified'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                        : relatedLead.status === 'New'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
                    }`}
                  >
                    {relatedLead.status}
                  </span>
                </div>
              </div>

              {/* Lead metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-200/80 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Source</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {relatedLead.source}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Owner</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {getEmployeeName(relatedLead.ownerId)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">City</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {relatedLead.city}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Created</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {formatDate(relatedLead.createdAt)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate block">
                    {relatedLead.email}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Phone</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {relatedLead.phone}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* QUOTATIONS SECTION */}
          {relatedQuotations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Quotations ({relatedQuotations.length})
                </h4>
              </div>

              <div className="space-y-2">
                {relatedQuotations.map((q) => {
                  const isCurrent = currentQuotation?.id === q.id
                  return (
                    <div
                      key={q.id}
                      onClick={() => drillIntoQuotation(q)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {q.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                q.status === 'Accepted'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : q.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {q.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {q.service} • {formatDate(q.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white block">
                            {formatINR(q.amount)}
                          </span>
                          <span className="text-[10px] text-slate-400">Quoted Amount</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* DEALS SECTION */}
          {relatedDeals.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <BadgeDollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  Deals ({relatedDeals.length})
                </h4>
              </div>

              <div className="space-y-2">
                {relatedDeals.map((deal) => {
                  const isCurrent = currentDeal?.id === deal.id
                  return (
                    <div
                      key={deal.id}
                      onClick={() => drillIntoDeal(deal)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                          <BadgeDollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {deal.id}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {deal.stage}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                deal.priority === 'High'
                                  ? 'bg-rose-50 text-rose-700'
                                  : deal.priority === 'Medium'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {deal.priority}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {deal.service} • {formatDate(deal.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block">
                            {formatINR(deal.value)}
                          </span>
                          <span className="text-[10px] text-slate-400">Deal Value</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ORDERS & STAGE PROGRESS SECTION */}
          {relatedOrders.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-indigo-500" />
                  Orders & Operations Stage Progress ({relatedOrders.length})
                </h4>
              </div>

              <div className="space-y-3">
                {relatedOrders.map((ord) => {
                  const percent = Math.round((ord.stagesCompleted / ord.stagesTotal) * 100)
                  return (
                    <div
                      key={ord.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {ord.id}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">({ord.service})</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            ord.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : ord.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700'
                              : ord.status === 'On Hold'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>
                            Progress: {ord.stagesCompleted} of {ord.stagesTotal} stages completed
                          </span>
                          <span className="font-semibold">{percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              ord.status === 'Completed'
                                ? 'bg-emerald-500'
                                : ord.status === 'On Hold'
                                ? 'bg-amber-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>Assigned to: <strong>{getEmployeeName(ord.assignedTo)}</strong></span>
                        <span>Created: {formatDate(ord.createdAt)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* PAYMENTS SECTION */}
          {relatedPayments.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  Payments & Collections ({relatedPayments.length})
                </h4>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Payment ID</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {relatedPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {p.id}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          {formatINR(p.amount)}
                        </td>
                        <td className="py-2.5 px-3">{p.method}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              p.status === 'Collected'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{formatDate(p.paidAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
