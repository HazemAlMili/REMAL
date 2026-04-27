import { differenceInDays, format, parseISO, isValid } from 'date-fns'

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—'
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} EGP`
}

export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return '—'
  const date = typeof input === 'string' ? parseISO(input) : input
  if (!isValid(date)) return '—'
  return format(date, 'd MMM yyyy')
}

export function formatDateLong(input: string | Date | null | undefined): string {
  if (!input) return '—'
  const date = typeof input === 'string' ? parseISO(input) : input
  if (!isValid(date)) return '—'
  return format(date, 'EEEE, d MMMM yyyy')
}

export function formatDateRange(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined
): string {
  if (!start || !end) return '—'
  const startDate = typeof start === 'string' ? parseISO(start) : start
  const endDate = typeof end === 'string' ? parseISO(end) : end
  if (!isValid(startDate) || !isValid(endDate)) return '—'
  return `${formatDate(startDate)} → ${formatDate(endDate)}`
}

export function getNights(
  checkIn: string | Date | null | undefined,
  checkOut: string | Date | null | undefined
): number {
  if (!checkIn || !checkOut) return 0
  const a = typeof checkIn === 'string' ? parseISO(checkIn) : checkIn
  const b = typeof checkOut === 'string' ? parseISO(checkOut) : checkOut
  if (!isValid(a) || !isValid(b)) return 0
  return Math.max(0, differenceInDays(b, a))
}

export function formatRelativeTime(input: string | Date | null | undefined): string {
  if (!input) return '—'
  const date = typeof input === 'string' ? parseISO(input) : input
  if (!isValid(date)) return '—'
  const now = new Date()
  const diffDays = differenceInDays(now, date)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7 && diffDays > 0) return `${diffDays} days ago`
  return formatDate(date)
}
