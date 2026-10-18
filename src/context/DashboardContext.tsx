import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react'
import {
  DatePreset,
  FilterState,
  Lead,
  Quotation,
  Deal,
  Order,
  Payment,
  Activity,
  Employee,
  ComparisonMetric,
  DrillDownState,
  BreadcrumbItem,
} from '../types'
import { getDatabase, REFERENCE_DATE_STRING } from '../data/seedData'
import { computePeriodWindows, calculateComparison } from '../utils/comparisons'
import { subDays, format, parseISO } from 'date-fns'

interface DashboardContextType {
  // Database
  employees: Employee[]
  allLeads: Lead[]
  allQuotations: Quotation[]
  allDeals: Deal[]
  allOrders: Order[]
  allPayments: Payment[]
  allActivities: Activity[]

  // Filters
  filters: FilterState
  setPreset: (preset: DatePreset) => void
  setCustomRange: (startDate: string, endDate: string) => void
  setUserId: (userId: string) => void
  setDepartment: (dept: string) => void
  resetFilters: () => void

  // Filtered Data (Current Period)
  filteredLeads: Lead[]
  filteredQuotations: Quotation[]
  filteredDeals: Deal[]
  filteredOrders: Order[]
  filteredPayments: Payment[]
  filteredActivities: Activity[]

  // Previous Period Data
  previousLeads: Lead[]
  previousQuotations: Quotation[]
  previousDeals: Deal[]
  previousOrders: Order[]
  previousPayments: Payment[]

  // Time Window Info
  periodLabel: string
  durationDays: number
  previousRangeLabel: string

  // Calculated KPI Metrics
  kpis: {
    newLeads: ComparisonMetric
    qualifiedLeads: ComparisonMetric
    qualifiedRate: number
    convertedLeads: ComparisonMetric
    conversionRate: ComparisonMetric
    unqualifiedLeads: ComparisonMetric
    unqualifiedRate: number
    quotationsCreated: ComparisonMetric
    dealsCreated: ComparisonMetric
    invoicesGenerated: ComparisonMetric
    totalRevenue: ComparisonMetric
    collectedRevenue: ComparisonMetric
    outstandingRevenue: number
    collectionPercentage: number
    quoteToDealRate: number
    targetRevenue: number
    targetAchieved: number
    targetRemaining: number
    targetPercent: number
  }

  // Drilldown
  drillDown: DrillDownState
  openDrillDown: (
    targetType: DrillDownState['targetType'],
    targetId?: string,
    title?: string,
    meta?: { serviceFilter?: string; statusFilter?: string }
  ) => void
  pushBreadcrumb: (item: BreadcrumbItem) => void
  popBreadcrumb: (index: number) => void
  closeDrillDown: () => void

  // Dark Mode
  darkMode: boolean
  toggleDarkMode: () => void

  // Active section for navigation
  activeTab: string
  setActiveTab: (tab: string) => void
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const db = useMemo(() => getDatabase(), [])

  // Read URL query params on initial load
  const initialFilters = useMemo<FilterState>(() => {
    const params = new URLSearchParams(window.location.search)
    const preset = (params.get('preset') as DatePreset) || '30days'
    const user = params.get('user') || 'all'
    const dept = params.get('dept') || 'all'

    // Compute dates based on preset or custom
    const refDate = parseISO(REFERENCE_DATE_STRING)
    let start = format(subDays(refDate, 29), 'yyyy-MM-dd')
    let end = REFERENCE_DATE_STRING

    if (preset === 'today') {
      start = REFERENCE_DATE_STRING
      end = REFERENCE_DATE_STRING
    } else if (preset === '7days') {
      start = format(subDays(refDate, 6), 'yyyy-MM-dd')
      end = REFERENCE_DATE_STRING
    } else if (preset === 'custom') {
      start = params.get('start') || format(subDays(refDate, 29), 'yyyy-MM-dd')
      end = params.get('end') || REFERENCE_DATE_STRING
    }

    return {
      preset,
      startDate: start,
      endDate: end,
      userId: user,
      department: dept,
    }
  }, [])

  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [activeTab, setActiveTab] = useState<string>('all')

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [])

  // Sync filters to URL query string without reloading
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('preset', filters.preset)
    if (filters.preset === 'custom') {
      params.set('start', filters.startDate)
      params.set('end', filters.endDate)
    }
    if (filters.userId !== 'all') params.set('user', filters.userId)
    if (filters.department !== 'all') params.set('dept', filters.department)

    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }, [filters])

  // Filter setters
  const setPreset = useCallback((preset: DatePreset) => {
    const refDate = parseISO(REFERENCE_DATE_STRING)
    let start = REFERENCE_DATE_STRING
    const end = REFERENCE_DATE_STRING

    if (preset === 'today') {
      start = REFERENCE_DATE_STRING
    } else if (preset === '7days') {
      start = format(subDays(refDate, 6), 'yyyy-MM-dd')
    } else if (preset === '30days') {
      start = format(subDays(refDate, 29), 'yyyy-MM-dd')
    }

    setFilters((prev) => ({
      ...prev,
      preset,
      startDate: start,
      endDate: end,
    }))
  }, [])

  const setCustomRange = useCallback((startDate: string, endDate: string) => {
    setFilters((prev) => ({
      ...prev,
      preset: 'custom',
      startDate,
      endDate,
    }))
  }, [])

  const setUserId = useCallback((userId: string) => {
    setFilters((prev) => ({ ...prev, userId }))
  }, [])

  const setDepartment = useCallback((department: string) => {
    setFilters((prev) => ({ ...prev, department, userId: 'all' }))
  }, [])

  const resetFilters = useCallback(() => {
    const refDate = parseISO(REFERENCE_DATE_STRING)
    setFilters({
      preset: '30days',
      startDate: format(subDays(refDate, 29), 'yyyy-MM-dd'),
      endDate: REFERENCE_DATE_STRING,
      userId: 'all',
      department: 'all',
    })
  }, [])

  // Period windows
  const periodWindows = useMemo(() => {
    return computePeriodWindows(filters.startDate, filters.endDate)
  }, [filters.startDate, filters.endDate])

  // User and Department filters mapping
  const activeEmployeeIds = useMemo(() => {
    let emps = db.employees
    if (filters.department !== 'all') {
      emps = emps.filter((e) => e.department === filters.department)
    }
    if (filters.userId !== 'all') {
      emps = emps.filter((e) => e.id === filters.userId)
    }
    return new Set(emps.map((e) => e.id))
  }, [db.employees, filters.department, filters.userId])

  // Helper date checker
  const isDateIn = (dateStr: string, start: Date, end: Date) => {
    const t = new Date(dateStr).getTime()
    // Compare up to end of day
    const endOfDay = new Date(end)
    endOfDay.setHours(23, 59, 59, 999)
    const startOfDay = new Date(start)
    startOfDay.setHours(0, 0, 0, 0)
    return t >= startOfDay.getTime() && t <= endOfDay.getTime()
  }

  // Filtered Datasets: Current Period
  const filteredLeads = useMemo(() => {
    return db.leads.filter((l) => {
      const inDate = isDateIn(l.createdAt, periodWindows.currentStart, periodWindows.currentEnd)
      if (!inDate) return false
      if (filters.userId !== 'all' || filters.department !== 'all') {
        return activeEmployeeIds.has(l.ownerId)
      }
      return true
    })
  }, [db.leads, periodWindows, filters.userId, filters.department, activeEmployeeIds])

  const filteredLeadIdSet = useMemo(() => new Set(filteredLeads.map((l) => l.id)), [filteredLeads])

  const filteredQuotations = useMemo(() => {
    return db.quotations.filter((q) => {
      const inDate = isDateIn(q.createdAt, periodWindows.currentStart, periodWindows.currentEnd)
      if (!inDate) return false
      // Filter by lead ownership or lead match
      if (filters.userId !== 'all' || filters.department !== 'all') {
        const lead = db.leads.find((l) => l.id === q.leadId)
        return lead && activeEmployeeIds.has(lead.ownerId)
      }
      return true
    })
  }, [db.quotations, db.leads, periodWindows, filters.userId, filters.department, activeEmployeeIds])

  const filteredDeals = useMemo(() => {
    return db.deals.filter((d) => {
      const inDate = isDateIn(d.createdAt, periodWindows.currentStart, periodWindows.currentEnd)
      if (!inDate) return false
      if (filters.userId !== 'all' || filters.department !== 'all') {
        const lead = db.leads.find((l) => l.id === d.leadId)
        return lead && activeEmployeeIds.has(lead.ownerId)
      }
      return true
    })
  }, [db.deals, db.leads, periodWindows, filters.userId, filters.department, activeEmployeeIds])

  const filteredDealIdSet = useMemo(() => new Set(filteredDeals.map((d) => d.id)), [filteredDeals])

  const filteredOrders = useMemo(() => {
    return db.orders.filter((o) => {
      const inDate = isDateIn(o.createdAt, periodWindows.currentStart, periodWindows.currentEnd)
      if (!inDate) return false
      if (filters.userId !== 'all' || filters.department !== 'all') {
        // If operations employee is selected, check assignedTo
        if (activeEmployeeIds.has(o.assignedTo)) return true
        // If sales employee is selected, check deal owner
        const deal = db.deals.find((d) => d.id === o.dealId)
        const lead = deal ? db.leads.find((l) => l.id === deal.leadId) : null
        return lead ? activeEmployeeIds.has(lead.ownerId) : false
      }
      return true
    })
  }, [db.orders, db.deals, db.leads, periodWindows, filters.userId, filters.department, activeEmployeeIds])

  const filteredOrderIdSet = useMemo(() => new Set(filteredOrders.map((o) => o.id)), [filteredOrders])

  const filteredPayments = useMemo(() => {
    return db.payments.filter((p) => {
      const inDate = isDateIn(p.paidAt, periodWindows.currentStart, periodWindows.currentEnd)
      if (!inDate) return false
      if (filters.userId !== 'all' || filters.department !== 'all') {
        return filteredDealIdSet.has(p.dealId) || filteredOrderIdSet.has(p.orderId)
      }
      return true
    })
  }, [db.payments, periodWindows, filters.userId, filters.department, filteredDealIdSet, filteredOrderIdSet])

  const filteredActivities = useMemo(() => {
    return db.activities.filter((a) => {
      const inDate = isDateIn(a.timestamp, periodWindows.currentStart, periodWindows.currentEnd)
      if (!inDate) return false
      if (filters.userId !== 'all' || filters.department !== 'all') {
        return activeEmployeeIds.has(a.employeeId)
      }
      return true
    })
  }, [db.activities, periodWindows, filters.userId, filters.department, activeEmployeeIds])

  // Previous Period Data
  const previousLeads = useMemo(() => {
    return db.leads.filter((l) => {
      const inDate = isDateIn(l.createdAt, periodWindows.previousStart, periodWindows.previousEnd)
      if (!inDate) return false
      if (filters.userId !== 'all' || filters.department !== 'all') {
        return activeEmployeeIds.has(l.ownerId)
      }
      return true
    })
  }, [db.leads, periodWindows, filters.userId, filters.department, activeEmployeeIds])

  const previousQuotations = useMemo(() => {
    return db.quotations.filter((q) => {
      const inDate = isDateIn(q.createdAt, periodWindows.previousStart, periodWindows.previousEnd)
      if (!inDate) return false
      if (filters.userId !== 'all' || filters.department !== 'all') {
        const lead = db.leads.find((l) => l.id === q.leadId)
        return lead && activeEmployeeIds.has(lead.ownerId)
      }
      return true
    })
  }, [db.quotations, db.leads, periodWindows, filters.userId, filters.department, activeEmployeeIds])

  const previousDeals = useMemo(() => {
    return db.deals.filter((d) => {
      const inDate = isDateIn(d.createdAt, periodWindows.previousStart, periodWindows.previousEnd)
      if (!inDate) return false
      if (filters.userId !== 'all' || filters.department !== 'all') {
        const lead = db.leads.find((l) => l.id === d.leadId)
        return lead && activeEmployeeIds.has(lead.ownerId)
      }
      return true
    })
  }, [db.deals, db.leads, periodWindows, filters.userId, filters.department, activeEmployeeIds])

  const previousOrders = useMemo(() => {
    return db.orders.filter((o) => {
      const inDate = isDateIn(o.createdAt, periodWindows.previousStart, periodWindows.previousEnd)
      if (!inDate) return false
      if (filters.userId !== 'all' || filters.department !== 'all') {
        if (activeEmployeeIds.has(o.assignedTo)) return true
        const deal = db.deals.find((d) => d.id === o.dealId)
        const lead = deal ? db.leads.find((l) => l.id === deal.leadId) : null
        return lead ? activeEmployeeIds.has(lead.ownerId) : false
      }
      return true
    })
  }, [db.orders, db.deals, db.leads, periodWindows, filters.userId, filters.department, activeEmployeeIds])

  const previousPayments = useMemo(() => {
    return db.payments.filter((p) => {
      const inDate = isDateIn(p.paidAt, periodWindows.previousStart, periodWindows.previousEnd)
      if (!inDate) return false
      if (filters.userId !== 'all' || filters.department !== 'all') {
        const deal = db.deals.find((d) => d.id === p.dealId)
        const lead = deal ? db.leads.find((l) => l.id === deal.leadId) : null
        return lead ? activeEmployeeIds.has(lead.ownerId) : false
      }
      return true
    })
  }, [db.payments, db.deals, db.leads, periodWindows, filters.userId, filters.department, activeEmployeeIds])

  // Memoized KPI calculations with previous period comparisons
  const kpis = useMemo(() => {
    const prevLbl = periodWindows.previousLabel

    // Leads count by status
    const currentNew = filteredLeads.filter((l) => l.status === 'New').length
    const prevNew = previousLeads.filter((l) => l.status === 'New').length
    const newLeads = calculateComparison(currentNew, prevNew, prevLbl)

    const currentQual = filteredLeads.filter((l) => l.status === 'Qualified').length
    const prevQual = previousLeads.filter((l) => l.status === 'Qualified').length
    const qualifiedLeads = calculateComparison(currentQual, prevQual, prevLbl)

    const currentConv = filteredLeads.filter((l) => l.status === 'Converted').length
    const prevConv = previousLeads.filter((l) => l.status === 'Converted').length
    const convertedLeads = calculateComparison(currentConv, prevConv, prevLbl)

    const currentUnqual = filteredLeads.filter((l) => l.status === 'Unqualified').length
    const prevUnqual = previousLeads.filter((l) => l.status === 'Unqualified').length
    // Invert color for unqualified leads: fewer unqualified is better
    const unqualifiedLeads = calculateComparison(currentUnqual, prevUnqual, prevLbl, true)

    // Rates
    const totalLeadsCur = filteredLeads.length
    const totalLeadsPrev = previousLeads.length

    const qualifiedRate = totalLeadsCur > 0 ? (currentQual / totalLeadsCur) * 100 : 0
    const unqualifiedRate = totalLeadsCur > 0 ? (currentUnqual / totalLeadsCur) * 100 : 0

    const curConvRate = totalLeadsCur > 0 ? (currentConv / totalLeadsCur) * 100 : 0
    const prevConvRate = totalLeadsPrev > 0 ? (prevConv / totalLeadsPrev) * 100 : 0
    const conversionRate = calculateComparison(curConvRate, prevConvRate, prevLbl)

    // Quotations & Deals
    const quotationsCreated = calculateComparison(
      filteredQuotations.length,
      previousQuotations.length,
      prevLbl
    )
    const dealsCreated = calculateComparison(
      filteredDeals.length,
      previousDeals.length,
      prevLbl
    )
    const invoicesGenerated = calculateComparison(
      filteredPayments.length,
      previousPayments.length,
      prevLbl
    )

    // Revenue
    const curRevenue = filteredDeals.reduce((sum, d) => sum + d.value, 0)
    const prevRevenue = previousDeals.reduce((sum, d) => sum + d.value, 0)
    const totalRevenue = calculateComparison(curRevenue, prevRevenue, prevLbl)

    const curCollected = filteredPayments
      .filter((p) => p.status === 'Collected')
      .reduce((sum, p) => sum + p.amount, 0)
    const prevCollected = previousPayments
      .filter((p) => p.status === 'Collected')
      .reduce((sum, p) => sum + p.amount, 0)
    const collectedRevenue = calculateComparison(curCollected, prevCollected, prevLbl)

    const outstandingRevenue = Math.max(0, curRevenue - curCollected)
    const collectionPercentage = curRevenue > 0 ? Math.min(100, (curCollected / curRevenue) * 100) : 0

    const quoteToDealRate =
      filteredQuotations.length > 0
        ? (filteredDeals.length / filteredQuotations.length) * 100
        : 0

    // Monthly Target: ₹85,00,000 (prorated or overall for month)
    const targetRevenue = 8500000
    const targetAchieved = curRevenue
    const targetRemaining = Math.max(0, targetRevenue - targetAchieved)
    const targetPercent = Math.min(100, (targetAchieved / targetRevenue) * 100)

    return {
      newLeads,
      qualifiedLeads,
      qualifiedRate,
      convertedLeads,
      conversionRate,
      unqualifiedLeads,
      unqualifiedRate,
      quotationsCreated,
      dealsCreated,
      invoicesGenerated,
      totalRevenue,
      collectedRevenue,
      outstandingRevenue,
      collectionPercentage,
      quoteToDealRate,
      targetRevenue,
      targetAchieved,
      targetRemaining,
      targetPercent,
    }
  }, [
    filteredLeads,
    previousLeads,
    filteredQuotations,
    previousQuotations,
    filteredDeals,
    previousDeals,
    filteredPayments,
    previousPayments,
    periodWindows.previousLabel,
  ])

  // Drilldown Modal / Drawer state
  const [drillDown, setDrillDown] = useState<DrillDownState>({
    isOpen: false,
    targetType: null,
    targetId: undefined,
    serviceFilter: undefined,
    statusFilter: undefined,
    breadcrumbs: [],
  })

  const openDrillDown = useCallback(
    (
      targetType: DrillDownState['targetType'],
      targetId?: string,
      title?: string,
      meta?: { serviceFilter?: string; statusFilter?: string }
    ) => {
      const initialBreadcrumb: BreadcrumbItem = {
        type: (targetType as BreadcrumbItem['type']) || 'list',
        id: targetId,
        title: title || `${targetType ? targetType.toUpperCase() : 'Details'} Details`,
      }
      setDrillDown({
        isOpen: true,
        targetType,
        targetId,
        serviceFilter: meta?.serviceFilter,
        statusFilter: meta?.statusFilter,
        breadcrumbs: [initialBreadcrumb],
      })
    },
    []
  )

  const pushBreadcrumb = useCallback((item: BreadcrumbItem) => {
    setDrillDown((prev) => ({
      ...prev,
      targetType: (item.type as DrillDownState['targetType']) || prev.targetType,
      targetId: item.id,
      breadcrumbs: [...prev.breadcrumbs, item],
    }))
  }, [])

  const popBreadcrumb = useCallback((index: number) => {
    setDrillDown((prev) => {
      const nextBreadcrumbs = prev.breadcrumbs.slice(0, index + 1)
      const current = nextBreadcrumbs[nextBreadcrumbs.length - 1]
      return {
        ...prev,
        targetType: (current.type as DrillDownState['targetType']) || prev.targetType,
        targetId: current.id,
        breadcrumbs: nextBreadcrumbs,
      }
    })
  }, [])

  const closeDrillDown = useCallback(() => {
    setDrillDown({
      isOpen: false,
      targetType: null,
      targetId: undefined,
      serviceFilter: undefined,
      statusFilter: undefined,
      breadcrumbs: [],
    })
  }, [])

  const previousRangeLabel = `${format(periodWindows.previousStart, 'dd MMM')} - ${format(
    periodWindows.previousEnd,
    'dd MMM yyyy'
  )}`

  return (
    <DashboardContext.Provider
      value={{
        employees: db.employees,
        allLeads: db.leads,
        allQuotations: db.quotations,
        allDeals: db.deals,
        allOrders: db.orders,
        allPayments: db.payments,
        allActivities: db.activities,
        filters,
        setPreset,
        setCustomRange,
        setUserId,
        setDepartment,
        resetFilters,
        filteredLeads,
        filteredQuotations,
        filteredDeals,
        filteredOrders,
        filteredPayments,
        filteredActivities,
        previousLeads,
        previousQuotations,
        previousDeals,
        previousOrders,
        previousPayments,
        periodLabel: periodWindows.previousLabel,
        durationDays: periodWindows.durationDays,
        previousRangeLabel,
        kpis,
        drillDown,
        openDrillDown,
        pushBreadcrumb,
        popBreadcrumb,
        closeDrillDown,
        darkMode,
        toggleDarkMode,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
