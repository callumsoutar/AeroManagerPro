import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

export interface Alert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  severity: 1 | 2 | 3
}

export function useBookingAlerts(bookingId: string) {
  return useQuery({
    queryKey: ['booking-alerts', bookingId],
    queryFn: async () => {
      const alerts: Alert[] = []

      // Get booking with user details
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          user:user_id (
            id,
            first_name,
            last_name,
            bfr_expiry
          )
        `)
        .eq('id', bookingId)
        .single()

      if (bookingError) throw bookingError
      if (!booking?.user) return alerts

      // Check BFR expiry
      const bfrExpiry = booking.user.bfr_expiry
      if (bfrExpiry) {
        const expiryDate = new Date(bfrExpiry)
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Reset time part for accurate date comparison

        if (expiryDate <= today) {
          alerts.push({
            id: 'bfr-expired',
            type: 'error',
            severity: 1,
            message: `BFR is overdue for ${booking.user.first_name} ${booking.user.last_name}. Expiry date on record is: ${format(expiryDate, 'dd MMM yyyy')}`
          })
        }
      }

      return alerts
    },
    enabled: !!bookingId
  })
} 