export type EmployeeDepartment = 'Sales' | 'Operations'

export interface Employee {
  id: string
  name: string
  department: EmployeeDepartment
  role: string
  avatar?: string
}

export type LeadSource = 'Google Ads' | 'Website' | 'Just Dial' | 'Other'
export type LeadStatus = 'New' | 'Qualified' | 'Converted' | 'Unqualified'

export interface Lead {
  id: string
  name: string
  company: string
  source: LeadSource
  status: LeadStatus
  ownerId: string
  createdAt: string
  phone: string
  email: string
  city: string
}

export type ServiceName =
  | 'Private Limited Company'
  | 'LLP Registration'
  | 'GST Registration & Filing'
  | 'Trademark Registration'
  | 'FSSAI License'
  | 'ISO Certification'
  | 'Startup India Registration'
  | 'Annual Compliance'
  | 'Penalty & Late Filing'

export type ServiceCategory =
  | 'Company Formation'
  | 'Tax & Compliance'
  | 'Intellectual Property'
  | 'Licenses & Certifications'

export type QuotationStatus = 'Pending' | 'Accepted' | 'Rejected'

export interface Quotation {
  id: string
  leadId: string
  service: ServiceName
  category: ServiceCategory
  amount: number
  status: QuotationStatus
  createdAt: string
}

export type DealPriority = 'High' | 'Medium' | 'Low'
export type DealStage = 'Prospecting' | 'Negotiation' | 'Won' | 'In Delivery' | 'Closed'

export interface Deal {
  id: string
  leadId: string
  quotationId: string
  service: ServiceName
  category: ServiceCategory
  value: number
  priority: DealPriority
  stage: DealStage
  createdAt: string
}

export type OrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'On Hold'

export interface Order {
  id: string
  dealId: string
  service: ServiceName
  status: OrderStatus
  stagesTotal: number
  stagesCompleted: number
  assignedTo: string
  createdAt: string
  completedAt?: string
}

export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Credit Card' | 'Cheque' | 'Cash'
export type PaymentStatus = 'Collected' | 'Pending'

export interface Payment {
  id: string
  dealId: string
  orderId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  paidAt: string
}

export interface Activity {
  id: string
  timestamp: string
  employeeId: string
  action: string
  recordId: string
  recordType: 'lead' | 'quotation' | 'deal' | 'order' | 'payment'
  details: string
}

export type DatePreset = 'today' | '7days' | '30days' | 'custom'

export interface FilterState {
  preset: DatePreset
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
  userId: string   // 'all' or employeeId
  department: string // 'all' | 'Sales' | 'Operations'
}

export interface ComparisonMetric {
  current: number
  previous: number
  changePercent: number | null // null indicates 'N/A' or 'New'
  isPositive: boolean
  direction: 'up' | 'down' | 'neutral'
  label: string
}

export interface BreadcrumbItem {
  type: 'lead' | 'quotation' | 'deal' | 'order' | 'payment' | 'service' | 'list'
  id?: string
  title: string
  subtitle?: string
}

export interface DrillDownState {
  isOpen: boolean
  targetType: 'lead' | 'quotation' | 'deal' | 'order' | 'payment' | 'service' | 'filter' | null
  targetId?: string
  serviceFilter?: string
  statusFilter?: string
  breadcrumbs: BreadcrumbItem[]
}
