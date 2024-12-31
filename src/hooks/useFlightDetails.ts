import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type BookingRow = Database['public']['Tables']['bookings']['Row']

interface BookingDetails extends BookingRow {
  aircraft: {
    id: string
    registration: string
    type: string
    model: string
    current_tacho: number | null
    current_hobbs: number | null
    record_hobbs: boolean
  } | null
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
    user_number: string
  } | null
  instructor: {
    id: string
    name: string
    email: string
    user_number: string
  } | null
  flight_type: {
    name: string
    description: string | null
  } | null
  aircraft_rates: {
    id: string
    rate: number
    flight_type: {
      id: string
      name: string
      description: string | null
    } | null
  }[]
}

export function useFlightDetails(id: string) {
  return useQuery<BookingDetails>({
    queryKey: ['booking', id],
    queryFn: async () => {
      // First get the booking details
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          user:user_id (
            id,
            first_name,
            last_name,
            email,
            user_number
          ),
          aircraft:aircraft_id (
            id,
            registration,
            type,
            model,
            current_tacho,
            current_hobbs,
            record_hobbs
          ),
          instructor:instructor_id (
            id,
            name,
            email,
            user_number
          ),
          flight_type:flight_type_id (
            name,
            description
          ),
          lesson:lesson_id (
            name
          )
        `)
        .eq('id', id)
        .single()

      console.log('Raw booking data:', booking)

      if (bookingError) throw bookingError
      if (!booking) throw new Error('Booking not found')

      // Then get the aircraft rates
      const { data: rates, error: ratesError } = await supabase
        .from('aircraft_rates')
        .select(`
          id,
          rate,
          flight_type:flight_type_id(
            id,
            name,
            description
          )
        `)
        .eq('aircraft_id', booking.aircraft_id)

      if (ratesError) throw ratesError

      // Return combined data
      return {
        ...booking,
        aircraft_rates: rates || []
      } as BookingDetails
    }
  })
} 