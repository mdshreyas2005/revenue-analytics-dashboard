import { format, parseISO, isValid } from 'date-fns'

/**
 * Format number into standard Indian Rupee format (e.g. ₹1,02,928)
 */
export function formatINR(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '₹0'
  return '₹' + Math.round(val).toLocaleString('en-IN')
}

/**
 * Compact Indian format:
 * >= 1,00,00,000 -> ₹X.XX Cr
 * >= 1,00,000    -> ₹X.X L
 * >= 1,000       -> ₹X.X K
 */
export function formatCompactINR(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '₹0'
  const abs = Math.abs(val)
  const sign = val < 0 ? '-' : ''

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)} L`
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)} K`
  }
  return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`
}

/**
 * Format Indian number without currency symbol
 */
export function formatIndianNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '0'
  return Math.round(val).toLocaleString('en-IN')
}

/**
 * Format percentage
 */
export function formatPercent(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || isNaN(val)) return '0%'
  return `${val.toFixed(decimals)}%`
}

/**
 * Format date nicely
 */
export function formatDate(dateStr: string | Date | null | undefined, formatStr = 'dd MMM yyyy'): string {
  if (!dateStr) return '-'
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    if (!isValid(d)) return '-'
    return format(d, formatStr)
  } catch {
    return '-'
  }
}

/**
 * Format date and time
 */
export function formatDateTime(dateStr: string | Date | null | undefined): string {
  return formatDate(dateStr, 'dd MMM yyyy, hh:mm a')
}
