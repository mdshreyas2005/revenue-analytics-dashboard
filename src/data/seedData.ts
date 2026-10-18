import {
  Employee,
  Lead,
  Quotation,
  Deal,
  Order,
  Payment,
  Activity,
  LeadSource,
  LeadStatus,
  ServiceName,
  QuotationStatus,
  DealPriority,
  DealStage,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../types'
import { SERVICES_CONFIG } from './servicesConfig'

// Deterministic Mulberry32 PRNG
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const random = mulberry32(1337)

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(random() * arr.length)]
}

function randInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

// Fixed reference date: 2026-10-18
export const REFERENCE_DATE_STRING = '2026-10-18'

// Aug 1, 2026 to Oct 31, 2026
const START_TIMESTAMP = new Date('2026-08-01T08:00:00Z').getTime()
const END_TIMESTAMP = new Date('2026-10-31T20:00:00Z').getTime()
const CURRENT_ANCHOR_TIMESTAMP = new Date('2026-10-18T18:00:00Z').getTime()

function randomTimestamp(start: number, end: number): string {
  const ts = start + random() * (end - start)
  return new Date(ts).toISOString()
}

export const EMPLOYEES: Employee[] = [
  { id: 'EMP-01', name: 'Rahul Sharma', department: 'Sales', role: 'Sales Lead', avatar: 'RS' },
  { id: 'EMP-02', name: 'Priya Patel', department: 'Sales', role: 'Senior Account Executive', avatar: 'PP' },
  { id: 'EMP-03', name: 'Amit Verma', department: 'Sales', role: 'Business Development Exec', avatar: 'AV' },
  { id: 'EMP-04', name: 'Sneha Kulkarni', department: 'Sales', role: 'Client Acquisition Mgr', avatar: 'SK' },
  { id: 'EMP-05', name: 'Vikram Mehta', department: 'Operations', role: 'Ops & Delivery Lead', avatar: 'VM' },
  { id: 'EMP-06', name: 'Ananya Iyer', department: 'Operations', role: 'Compliance Specialist', avatar: 'AI' },
  { id: 'EMP-07', name: 'Rohan Gupta', department: 'Operations', role: 'Filing & Legal Analyst', avatar: 'RG' },
  { id: 'EMP-08', name: 'Kavita Nair', department: 'Operations', role: 'Client Servicing Exec', avatar: 'KN' },
]

const FIRST_NAMES = [
  'Aarav', 'Vihaan', 'Aditya', 'Rohan', 'Karan', 'Kunal', 'Manish', 'Rajesh', 'Suresh', 'Deepak',
  'Ananya', 'Diya', 'Ishita', 'Pooja', 'Tanvi', 'Meera', 'Ritu', 'Simran', 'Neha', 'Sunita',
  'Arjun', 'Siddharth', 'Nikhil', 'Gaurav', 'Varun', 'Harsh', 'Prateek', 'Sanjay', 'Alok', 'Ashish',
]

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Mehta', 'Joshi', 'Bhat', 'Agarwal',
  'Chopra', 'Malhotra', 'Singhania', 'Banerjee', 'Chatterjee', 'Deshmukh', 'Kulkarni', 'Pillai', 'Rao', 'Dubey',
]

const COMPANY_PREFIXES = [
  'Apex', 'Zenith', 'NextGen', 'BlueSky', 'Kavach', 'Vanguard', 'Bharat', 'Omni', 'Trident', 'Pulse',
  'Nexus', 'Quantum', 'Horizon', 'Synergy', 'Astra', 'Elevate', 'Aura', 'Vector', 'Prime', 'Titan',
]

const COMPANY_SUFFIXES = [
  'Technologies', 'Solutions Pvt Ltd', 'Enterprises', 'Ventures', 'Infotech', 'Logistics LLP',
  'Healthcare', 'Consulting Group', 'Labs', 'Retail Services', 'Digital Studio', 'Industries',
]

const CITIES = ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Ahmedabad', 'Jaipur', 'Kolkata', 'Chandigarh']

const SERVICES_LIST = Object.keys(SERVICES_CONFIG) as ServiceName[]
const LEAD_SOURCES: LeadSource[] = ['Google Ads', 'Website', 'Just Dial', 'Other']

export interface SeedDatabase {
  employees: Employee[]
  leads: Lead[]
  quotations: Quotation[]
  deals: Deal[]
  orders: Order[]
  payments: Payment[]
  activities: Activity[]
}

export function generateSeedData(): SeedDatabase {
  const leads: Lead[] = []
  const quotations: Quotation[] = []
  const deals: Deal[] = []
  const orders: Order[] = []
  const payments: Payment[] = []
  const activities: Activity[] = []

  const salesTeam = EMPLOYEES.filter((e) => e.department === 'Sales')
  const opsTeam = EMPLOYEES.filter((e) => e.department === 'Operations')

  // 1. Generate ~300 Leads
  const TOTAL_LEADS = 310
  for (let i = 1; i <= TOTAL_LEADS; i++) {
    const fName = randChoice(FIRST_NAMES)
    const lName = randChoice(LAST_NAMES)
    const leadName = `${fName} ${lName}`
    const company = `${randChoice(COMPANY_PREFIXES)} ${randChoice(COMPANY_SUFFIXES)}`
    const source = randChoice(LEAD_SOURCES)
    const owner = randChoice(salesTeam)
    const createdAt = randomTimestamp(START_TIMESTAMP, CURRENT_ANCHOR_TIMESTAMP)

    // Status distribution: New (30%), Qualified (35%), Converted (25%), Unqualified (10%)
    const statusRand = random()
    let status: LeadStatus = 'New'
    if (statusRand < 0.25) status = 'New'
    else if (statusRand < 0.60) status = 'Qualified'
    else if (statusRand < 0.88) status = 'Converted'
    else status = 'Unqualified'

    const leadId = `LEAD-${1000 + i}`
    const phone = `+91 ${randInt(90000, 99999)} ${randInt(10000, 99999)}`
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`
    const city = randChoice(CITIES)

    leads.push({
      id: leadId,
      name: leadName,
      company,
      source,
      status,
      ownerId: owner.id,
      createdAt,
      phone,
      email,
      city,
    })

    // CRM activity for lead creation
    activities.push({
      id: `ACT-${activities.length + 1}`,
      timestamp: createdAt,
      employeeId: owner.id,
      action: 'Created Lead',
      recordId: leadId,
      recordType: 'lead',
      details: `${owner.name} added lead ${leadName} from ${source}`,
    })
  }

  // Sort leads chronologically
  leads.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  // 2. Generate ~420 Quotations
  // Leads with status Qualified or Converted must have quotations. Some New leads also have quotations.
  let quotationCounter = 1
  for (const lead of leads) {
    let quoteCount = 0
    if (lead.status === 'Converted') {
      quoteCount = randInt(1, 3) // Converted always has at least 1 quotation
    } else if (lead.status === 'Qualified') {
      quoteCount = random() > 0.3 ? randInt(1, 2) : 1
    } else if (lead.status === 'New') {
      quoteCount = random() > 0.6 ? 1 : 0
    } else {
      // Unqualified
      quoteCount = random() > 0.85 ? 1 : 0
    }

    const leadCreateTs = new Date(lead.createdAt).getTime()

    for (let q = 0; q < quoteCount; q++) {
      const qId = `QT-26-${String(quotationCounter++).padStart(4, '0')}`
      const service = randChoice(SERVICES_LIST)
      const meta = SERVICES_CONFIG[service]
      // Variance in amount +/- 20%
      const amount = Math.round((meta.avgPrice * (0.85 + random() * 0.35)) / 100) * 100

      // Quotation creation time: 1 hour to 5 days after lead creation
      const qTs = Math.min(
        leadCreateTs + randInt(3600 * 1000, 5 * 24 * 3600 * 1000),
        CURRENT_ANCHOR_TIMESTAMP
      )
      const createdAt = new Date(qTs).toISOString()

      // Quotation Status
      let status: QuotationStatus = 'Pending'
      if (lead.status === 'Converted' && q === 0) {
        status = 'Accepted' // First quotation for converted lead is Accepted
      } else if (lead.status === 'Converted') {
        status = random() > 0.5 ? 'Accepted' : 'Pending'
      } else if (lead.status === 'Unqualified') {
        status = 'Rejected'
      } else {
        const r = random()
        if (r < 0.4) status = 'Pending'
        else if (r < 0.65) status = 'Accepted'
        else status = 'Rejected'
      }

      quotations.push({
        id: qId,
        leadId: lead.id,
        service,
        category: meta.category,
        amount,
        status,
        createdAt,
      })

      activities.push({
        id: `ACT-${activities.length + 1}`,
        timestamp: createdAt,
        employeeId: lead.ownerId,
        action: 'Generated Quotation',
        recordId: qId,
        recordType: 'quotation',
        details: `Sent quote for ${service} (₹${amount.toLocaleString('en-IN')}) to ${lead.name}`,
      })
    }
  }

  // 3. Generate ~105 Deals from Accepted Quotations
  let dealCounter = 1
  const acceptedQuotes = quotations.filter((q) => q.status === 'Accepted')

  for (const quote of acceptedQuotes) {
    const lead = leads.find((l) => l.id === quote.leadId)!
    const qTs = new Date(quote.createdAt).getTime()
    const dealTs = Math.min(
      qTs + randInt(3600 * 1000, 3 * 24 * 3600 * 1000),
      CURRENT_ANCHOR_TIMESTAMP
    )
    const createdAt = new Date(dealTs).toISOString()

    const dealId = `DL-26-${String(dealCounter++).padStart(3, '0')}`
    const priority: DealPriority = randChoice(['High', 'Medium', 'Medium', 'Low'])

    // Stage progression
    let stage: DealStage = 'Won'
    const sRand = random()
    if (sRand < 0.15) stage = 'Prospecting'
    else if (sRand < 0.35) stage = 'Negotiation'
    else if (sRand < 0.65) stage = 'Won'
    else if (sRand < 0.88) stage = 'In Delivery'
    else stage = 'Closed'

    deals.push({
      id: dealId,
      leadId: lead.id,
      quotationId: quote.id,
      service: quote.service,
      category: quote.category,
      value: quote.amount,
      priority,
      stage,
      createdAt,
    })

    activities.push({
      id: `ACT-${activities.length + 1}`,
      timestamp: createdAt,
      employeeId: lead.ownerId,
      action: 'Deal Advanced',
      recordId: dealId,
      recordType: 'deal',
      details: `Deal ${dealId} (${quote.service}) moved to stage ${stage}`,
    })
  }

  // 4. Generate ~155 Orders for active/won deals
  let orderCounter = 1
  for (const deal of deals) {
    // Only deals in Won, In Delivery, or Closed stages typically have orders
    if (deal.stage === 'Prospecting' && random() > 0.1) continue

    const dealTs = new Date(deal.createdAt).getTime()
    // Deal might have 1 or 2 orders if multi-stage or addon
    const orderCount = random() > 0.8 ? 2 : 1

    for (let o = 0; o < orderCount; o++) {
      const orderId = `ORD-26-${String(orderCounter++).padStart(4, '0')}`
      const opsAssignee = randChoice(opsTeam)
      const meta = SERVICES_CONFIG[deal.service]
      const stagesTotal = meta.stages

      let status: OrderStatus = 'In Progress'
      let stagesCompleted = randInt(1, stagesTotal - 1)
      let completedAt: string | undefined = undefined

      if (deal.stage === 'Closed') {
        status = 'Completed'
        stagesCompleted = stagesTotal
      } else if (deal.stage === 'In Delivery') {
        status = random() > 0.25 ? 'In Progress' : 'Completed'
        stagesCompleted = status === 'Completed' ? stagesTotal : randInt(2, stagesTotal - 1)
      } else if (deal.stage === 'Won') {
        const r = random()
        if (r < 0.25) {
          status = 'Pending'
          stagesCompleted = 0
        } else if (r < 0.8) {
          status = 'In Progress'
          stagesCompleted = randInt(1, stagesTotal - 1)
        } else {
          status = 'On Hold'
          stagesCompleted = randInt(1, 2)
        }
      } else {
        status = 'Pending'
        stagesCompleted = 0
      }

      const orderTs = Math.min(
        dealTs + randInt(3600 * 1000, 2 * 24 * 3600 * 1000),
        CURRENT_ANCHOR_TIMESTAMP
      )
      const createdAt = new Date(orderTs).toISOString()

      if (status === 'Completed') {
        const compTs = Math.min(
          orderTs + randInt(3 * 24 * 3600 * 1000, 14 * 24 * 3600 * 1000),
          CURRENT_ANCHOR_TIMESTAMP
        )
        completedAt = new Date(compTs).toISOString()
      }

      orders.push({
        id: orderId,
        dealId: deal.id,
        service: deal.service,
        status,
        stagesTotal,
        stagesCompleted,
        assignedTo: opsAssignee.id,
        createdAt,
        completedAt,
      })

      activities.push({
        id: `ACT-${activities.length + 1}`,
        timestamp: createdAt,
        employeeId: opsAssignee.id,
        action: 'Order Processed',
        recordId: orderId,
        recordType: 'order',
        details: `${opsAssignee.name} updated order ${orderId} (${status}, ${stagesCompleted}/${stagesTotal} steps)`,
      })
    }
  }

  // 5. Generate ~260 Payments for Orders/Deals
  let paymentCounter = 1
  const paymentMethods: PaymentMethod[] = ['UPI', 'Bank Transfer', 'Credit Card', 'Cheque', 'Cash']

  for (const order of orders) {
    const deal = deals.find((d) => d.id === order.dealId)!
    const orderTs = new Date(order.createdAt).getTime()

    // Break deal value into 1, 2, or 3 payment installments (e.g. Advance, Milestone, Final)
    const totalOrderCost = deal.value
    const installments = order.status === 'Completed' ? 2 : randInt(1, 2)

    let remainingAmount = totalOrderCost
    for (let p = 0; p < installments; p++) {
      const payId = `PAY-26-${String(paymentCounter++).padStart(4, '0')}`
      let amount: number
      if (p === installments - 1) {
        amount = remainingAmount
      } else {
        amount = Math.round((remainingAmount * 0.5) / 100) * 100
        remainingAmount -= amount
      }

      const method = randChoice(paymentMethods)
      const isAdvance = p === 0
      const payTs = Math.min(
        orderTs + (isAdvance ? 0 : randInt(2 * 24 * 3600 * 1000, 10 * 24 * 3600 * 1000)),
        CURRENT_ANCHOR_TIMESTAMP
      )
      const paidAt = new Date(payTs).toISOString()

      let status: PaymentStatus = 'Collected'
      if (order.status === 'Pending' && !isAdvance) {
        status = 'Pending'
      } else if (order.status === 'On Hold') {
        status = random() > 0.5 ? 'Pending' : 'Collected'
      } else if (!isAdvance && random() > 0.75) {
        status = 'Pending'
      }

      payments.push({
        id: payId,
        dealId: deal.id,
        orderId: order.id,
        amount,
        method,
        status,
        paidAt,
      })

      if (status === 'Collected') {
        activities.push({
          id: `ACT-${activities.length + 1}`,
          timestamp: paidAt,
          employeeId: deal.leadId ? (leads.find((l) => l.id === deal.leadId)?.ownerId || EMPLOYEES[0].id) : EMPLOYEES[0].id,
          action: 'Payment Received',
          recordId: payId,
          recordType: 'payment',
          details: `Collected ₹${amount.toLocaleString('en-IN')} via ${method} for order ${order.id}`,
        })
      }
    }
  }

  // Sort activities chronologically descending (most recent first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return {
    employees: EMPLOYEES,
    leads,
    quotations,
    deals,
    orders,
    payments,
    activities,
  }
}

// Singleton cached seed database
let cachedDb: SeedDatabase | null = null

export function getDatabase(): SeedDatabase {
  if (!cachedDb) {
    cachedDb = generateSeedData()
  }
  return cachedDb
}
