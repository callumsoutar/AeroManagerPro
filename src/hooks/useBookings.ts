import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Booking = Database['public']['Tables']['bookings']['Row']

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          aircraft:aircraft_id(registration),
          user:user_id(name),
          instructor:instructor_id(name),
          flight_type:flight_type_id(name)
        `)
        .order('start_time', { ascending: false })

      if (error) throw error
      return data as (Booking & {
        aircraft: { registration: string } | null
        user: { name: string } | null
        instructor: { name: string } | null
        flight_type: { name: string } | null
      })[]
    },
  })
} 