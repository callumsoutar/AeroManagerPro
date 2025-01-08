import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getBookingTypeStyle = (type: string | undefined) => {
  if (!type) return 'bg-gray-100 text-gray-800'
  
  switch (type) {
    case 'Aeroclub Dual':
      return 'bg-blue-100 text-blue-800'
    case 'Trial Flight':
      return 'bg-yellow-100 text-yellow-800'
    case 'Maintenance':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getFullName(first: string, last: string): string {
  return `${first} ${last}`.trim()
}

export function generateTimeOptions() {
  const times = []
  for (let hour = 7; hour <= 22; hour++) {
    const hourStr = hour.toString().padStart(2, '0')
    times.push(`${hourStr}:00`)
    times.push(`${hourStr}:30`)
  }
  return times
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2
  }).format(amount)
}
