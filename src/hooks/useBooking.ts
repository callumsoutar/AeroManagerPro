import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface BookingDetails {
  id: string
  aircraft_id: string
  user_id: string
  instructor_id: string
  start_time: string
  end_time: string
  status: string
  checked_out_time: string | null
  eta: string | null
  flight_type_id: string
  description: string | null
  route: string | null
  instructor_comment?: string | null
  flight_time?: number | null
  lesson_id?: string | null
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
    user_number: string
  } | null
  aircraft: {
    id: string
    registration: string
    type: string
    model: string
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
  lesson: {
    name: string
  } | null
}

export function useBooking(id: string) {
  return useQuery<BookingDetails>({
    queryKey: ['booking', id],
    queryFn: async () => {
      const { data, error } = await supabase
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
            model
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

      if (error) throw error
      if (!data) throw new Error('Booking not found')

      return data as BookingDetails
    }
  })
} 