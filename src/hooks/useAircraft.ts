import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type AircraftRow = Database['public']['Tables']['aircraft']['Row']
type EquipmentRow = Database['public']['Tables']['equipment']['Row']
type DefectRow = Database['public']['Tables']['defects']['Row']
type RateRow = Database['public']['Tables']['aircraft_rates']['Row']
type BookingRow = Database['public']['Tables']['bookings']['Row']

// Add new types for the joined data
interface RateWithFlightType extends RateRow {
  flight_type: {
    name: string
    description: string | null
  } | null
}

interface BookingWithDetails extends BookingRow {
  user: { name: string } | null
  instructor: { name: string } | null
  flight_type: { name: string } | null
}

export function useAircraft() {
  return useQuery({
    queryKey: ['aircraft'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aircraft')
        .select('*')
        .order('registration')

      if (error) throw error
      return data as AircraftRow[]
    },
  })
}

export function useAircraftDetail(id: string) {
  return useQuery({
    queryKey: ['aircraft', id],
    queryFn: async () => {
      try {
        const [aircraftResponse, equipmentResponse, defectsResponse, ratesResponse, flightHistoryResponse] = await Promise.all([
          // Get aircraft details
          supabase
            .from('aircraft')
            .select('*')
            .eq('id', id)
            .single(),
          
          // Get equipment
          supabase
            .from('equipment')
            .select('*')
            .eq('aircraft_id', id),
          
          // Get defects with comments and user info
          supabase
            .from('defects')
            .select(`
              *,
              reported_by_user:reported_by(name)
            `)
            .eq('aircraft_id', id)
            .order('reported_date', { ascending: false }),
          
          // Get charge rates
          supabase
            .from('aircraft_rates')
            .select(`
              *,
              flight_type:flight_type_id(name, description)
            `)
            .eq('aircraft_id', id),
          
          // Get completed flights for this aircraft
          supabase
            .from('bookings')
            .select(`
              *,
              user:user_id(name),
              instructor:instructor_id(name),
              flight_type:flight_type_id(name)
            `)
            .eq('aircraft_id', id)
            .eq('status', 'complete')
            .order('start_time', { ascending: false })
        ])

        if (aircraftResponse.error) throw aircraftResponse.error
        if (!aircraftResponse.data) throw new Error('Aircraft not found')

        // Add error checking for other responses
        if (equipmentResponse.error) throw equipmentResponse.error
        if (defectsResponse.error) throw defectsResponse.error
        if (ratesResponse.error) throw ratesResponse.error
        if (flightHistoryResponse.error) throw flightHistoryResponse.error

        return {
          aircraft: aircraftResponse.data as AircraftRow,
          equipment: (equipmentResponse.data || []) as EquipmentRow[],
          defects: (defectsResponse.data || []) as (DefectRow & {
            reported_by_user: { name: string } | null
          })[],
          rates: (ratesResponse.data || []) as RateWithFlightType[],
          flightHistory: (flightHistoryResponse.data || []) as BookingWithDetails[]
        }
      } catch (error) {
        console.error('Error fetching aircraft details:', error)
        throw error
      }
    },
    enabled: !!id
  })
} 