import { differenceInCalendarDays, subDays, format, parseISO } from 'date-fns'
import { ComparisonMetric } from '../types'

export interface PeriodWindows {
  currentStart: Date
  currentEnd: Date
  previousStart: Date
  previousEnd: Date
  durationDays: number
  previousLabel: string
}

export function computePeriodWindows(startDateStr: string, endDateStr: string): PeriodWindows {
  const currentStart = parseISO(startDateStr)
  // Ensure currentEnd includes full day (up to 23:59:59)
  const currentEnd = parseISO(endDateStr)

  const durationDays = Math.max(1, differenceInCalendarDays(currentEnd, currentStart) + 1)
  const previousEnd = subDays(currentStart, 1)
  const previousStart = subDays(previousEnd, durationDays - 1)

  const previousLabel =
    durationDays === 1
      ? 'vs. previous day'
      : `vs. previous ${durationDays} days`

  return {
    currentStart,
    currentEnd,
    previousStart,
    previousEnd,
    durationDays,
    previousLabel,
  }
}

/**
 * Compare two numeric values and return formatted comparison metric
 */
export function calculateComparison(
  current: number,
  previous: number,
  periodLabel = 'vs. previous period',
  invertColor = false // e.g. for unqualified leads or penalty amounts where down is good
): ComparisonMetric {
  if (previous === 0 && current === 0) {
    return {
      current,
      previous,
      changePercent: 0,
      isPositive: true,
      direction: 'neutral',
      label: periodLabel,
    }
  }

  if (previous === 0 && current > 0) {
    return {
      current,
      previous,
      changePercent: null, // Display as "New"
      isPositive: !invertColor,
      direction: 'up',
      label: periodLabel,
    }
  }

  if (previous === 0 && current < 0) {
    return {
      current,
      previous,
      changePercent: null,
      isPositive: invertColor,
      direction: 'down',
      label: periodLabel,
    }
  }

  const changePercent = ((current - previous) / previous) * 100
  const isUp = changePercent > 0
  const isDown = changePercent < 0

  return {
    current,
    previous,
    changePercent,
    isPositive: invertColor ? isDown : isUp,
    direction: isUp ? 'up' : isDown ? 'down' : 'neutral',
    label: periodLabel,
  }
}
