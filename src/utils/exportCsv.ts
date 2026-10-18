import { Lead, Quotation, Deal, Order, Payment } from '../types'
import { format } from 'date-fns'

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""'
  const str = String(val).replace(/"/g, '""')
  return `"${str}"`
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csvContent = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportFilteredDataToCsv(
  leads: Lead[],
  quotations: Quotation[],
  deals: Deal[],
  orders: Order[],
  payments: Payment[],
  activeSection = 'all'
) {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm')

  if (activeSection === 'leads' || activeSection === 'all') {
    const leadHeaders = ['Lead ID', 'Name', 'Company', 'Source', 'Status', 'Phone', 'Email', 'City', 'Owner ID', 'Created At']
    const leadRows = leads.map((l) => [
      l.id,
      l.name,
      l.company,
      l.source,
      l.status,
      l.phone,
      l.email,
      l.city,
      l.ownerId,
      l.createdAt,
    ])
    downloadCsv(`Leads_Export_${timestamp}.csv`, [leadHeaders, ...leadRows])
  }

  if (activeSection === 'quotations' || activeSection === 'all') {
    const qHeaders = ['Quote ID', 'Lead ID', 'Service', 'Category', 'Amount (INR)', 'Status', 'Created At']
    const qRows = quotations.map((q) => [
      q.id,
      q.leadId,
      q.service,
      q.category,
      q.amount,
      q.status,
      q.createdAt,
    ])
    downloadCsv(`Quotations_Export_${timestamp}.csv`, [qHeaders, ...qRows])
  }

  if (activeSection === 'deals' || activeSection === 'all') {
    const dealHeaders = ['Deal ID', 'Lead ID', 'Quote ID', 'Service', 'Category', 'Value (INR)', 'Priority', 'Stage', 'Created At']
    const dealRows = deals.map((d) => [
      d.id,
      d.leadId,
      d.quotationId,
      d.service,
      d.category,
      d.value,
      d.priority,
      d.stage,
      d.createdAt,
    ])
    downloadCsv(`Deals_Export_${timestamp}.csv`, [dealHeaders, ...dealRows])
  }

  if (activeSection === 'orders' || activeSection === 'all') {
    const orderHeaders = ['Order ID', 'Deal ID', 'Service', 'Status', 'Stages Completed', 'Total Stages', 'Assigned To', 'Created At', 'Completed At']
    const orderRows = orders.map((o) => [
      o.id,
      o.dealId,
      o.service,
      o.status,
      o.stagesCompleted,
      o.stagesTotal,
      o.assignedTo,
      o.createdAt,
      o.completedAt || 'N/A',
    ])
    downloadCsv(`Orders_Export_${timestamp}.csv`, [orderHeaders, ...orderRows])
  }

  if (activeSection === 'payments' || activeSection === 'all') {
    const payHeaders = ['Payment ID', 'Deal ID', 'Order ID', 'Amount (INR)', 'Method', 'Status', 'Paid At']
    const payRows = payments.map((p) => [
      p.id,
      p.dealId,
      p.orderId,
      p.amount,
      p.method,
      p.status,
      p.paidAt,
    ])
    downloadCsv(`Payments_Export_${timestamp}.csv`, [payHeaders, ...payRows])
  }
}
