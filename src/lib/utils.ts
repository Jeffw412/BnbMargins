import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (start.getFullYear() === end.getFullYear()) {
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`
    }
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export type AirbnbFeeModel = 'split' | 'host-only'

export function calculateAirbnbServiceFee(
  bookingAmount: number,
  cleaningFeeAmount: number,
  feeModel: AirbnbFeeModel = 'split'
): number {
  const totalBookingValue = bookingAmount + cleaningFeeAmount

  if (feeModel === 'split') {
    // Split fee model: 3% of booking + cleaning fees
    return totalBookingValue * 0.03
  } else {
    // Host-only fee model: 14% of booking + cleaning fees
    return totalBookingValue * 0.14
  }
}

export function getAirbnbFeeRate(feeModel: AirbnbFeeModel = 'split'): number {
  return feeModel === 'split' ? 0.03 : 0.14
}

export function getAirbnbFeeDescription(feeModel: AirbnbFeeModel = 'split'): string {
  return feeModel === 'split'
    ? 'Split Fee Model (3%)'
    : 'Host-Only Fee Model (14%)'
}
