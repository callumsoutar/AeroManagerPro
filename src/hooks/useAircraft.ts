import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface Equipment {
  id: string
  type: string
  last_completed: string
  next_due: string
  days_remaining: number
  hours_remaining: number
}

export interface Defect {
  id: string
  name: string
  description: string
  status: string
  reported_date: string
  reported_by: string
  reported_by_user: {
    first_name: string
    last_name: string
  }
  comments: Array<{
    text: string
    user: string
    timestamp: string
  }>
  aircraft_id: string
}

export interface Rate {
  id: string
  flight_type: {
    name: string
  }
  rate: number
}

export interface Booking {
  id: string
  start_time: string
  end_time: string
  user: {
    first_name: string
    last_name: string
  }
  instructor: {
    name: string
  } | null
  flight_type: {
    name: string
  }
  flight_time: number
  tacho_start: number
  tacho_end: number
  hobbs_start: number
  hobbs_end: number
}

export interface Aircraft {
  id: string
  registration: string
  type: string
  model: string
  year: number
  engine_hours: number
  last_maintenance: string
  next_service_due: string
  status: string
  photo_url: string | null
  equipment: Equipment[]
  defects: Defect[]
  rates: Rate[]
  bookings: Booking[]
}

// Add interface for the raw data structure from Supabase
interface AircraftRate {
  id: string
  rate: number
  flight_types: {
    id: string
    name: string
  }
}

// Add interface for raw booking data from Supabase
interface RawBooking {
  id: string
  start_time: string
  end_time: string
  user: {
    first_name: string
    last_name: string
  }
  instructor: {
    first_name: string
    last_name: string
  } | null
  flight_types: {
    name: string
  }
  flight_time: number
  tacho_start: number
  tacho_end: number
  hobbs_start: number
  hobbs_end: number
}

// Add more specific error handling
class AircraftError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AircraftError'
  }
}


// Hook for fetching a list of aircraft
export function useAircraftList() {
  return useQuery({
    queryKey: ['aircraft-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aircraft')
        .select('*')
        .order('registration')

      if (error) throw error
      return data as Aircraft[]
    }
  })
}

// Hook for fetching a single aircraft with details
export function useAircraft(id: string) {
  return useQuery({
    queryKey: ['aircraft', id],
    queryFn: async () => {
      if (!id) {
        throw new AircraftError('Aircraft ID is required')
      }

      try {
        const { data, error } = await supabase
          .from('aircraft')
          .select(`
            *,
            equipment (
              id,
              type,
              last_completed,
              next_due,
              days_remaining,
              hours_remaining
            ),
            defects (
              id,
              name,
              description,
              status,
              reported_date,
              reported_by,
              comments,
              reported_by_user:users!defects_reported_by_fkey (
                first_name,
                last_name
              )
            ),
            aircraft_rates (
              id,
              rate,
              flight_types (
                id,
                name
              )
            ),
            bookings (
              id,
              start_time,
              end_time,
              user:users!bookings_user_id_fkey (
                first_name,
                last_name
              ),
              instructor:users!bookings_instructor_id_fkey (
                first_name,
                last_name
              ),
              flight_types (
                name
              ),
              flight_time,
              tacho_start,
              tacho_end,
              hobbs_start,
              hobbs_end
            )
          `)
          .eq('id', id)
          .single()

        if (error) {
          throw new AircraftError(error.message, error.code)
        }

        if (!data) {
          throw new AircraftError('Aircraft not found')
        }

        // Add validation for required fields
        if (!data.registration || !data.type) {
          throw new AircraftError('Invalid aircraft data')
        }

        const transformedData = {
          ...data,
          rates: data.aircraft_rates?.map((rate: AircraftRate) => ({
            id: rate.id,
            rate: rate.rate,
            flight_type: {
              name: rate.flight_types?.name || 'Unknown'
            }
          })) || [],
          bookings: data.bookings?.map((booking: RawBooking) => ({
            id: booking.id,
            start_time: booking.start_time,
            end_time: booking.end_time,
            user: booking.user || { first_name: 'Unknown', last_name: 'User' },
            instructor: booking.instructor ? {
              name: `${booking.instructor.first_name} ${booking.instructor.last_name}`.trim() || 'Unknown'
            } : null,
            flight_type: {
              name: booking.flight_types?.name || 'Unknown'
            },
            flight_time: booking.flight_time || 0,
            tacho_start: booking.tacho_start || 0,
            tacho_end: booking.tacho_end || 0,
            hobbs_start: booking.hobbs_start || 0,
            hobbs_end: booking.hobbs_end || 0
          })) || []
        }

        // Add debug logging
        console.log('Fetched defects with comments:', data?.defects)

        return transformedData as Aircraft
      } catch (error) {
        console.error('Aircraft fetch error:', error)
        throw error
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      // Only retry network errors, not data validation errors
      if (error instanceof AircraftError) {
        return false
      }
      return failureCount < 3
    }
  })
} 