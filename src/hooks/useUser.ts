import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { PrimeRatingType, TypeRatingType, EndorsementType } from '../types/ratings'

export interface Membership {
  id: string
  user_id: string
  membership_type_id: string
  membership_type: {
    id: string
    name: string
    yearly_fee: number
  }
  start_date: string
  end_date: string
  is_active: boolean
  yearly_fee: number
  payment_status: string
  payment_date: string | null
  created_at: string
}

export interface Booking {
  id: string
  start_time: string
  end_time: string
  status: string
  type: string
  flight_time?: number
  description?: string
  aircraft?: {
    registration: string
    type: string
    model: string
  }
  instructor?: {
    id: string
    name: string
  }
}

export interface UserDetails {
  id: string
  first_name: string
  last_name: string
  email: string
  user_number: string
  status: 'Active' | 'Inactive'
  join_date: Date
  birth_date: Date | null
  phone: string | null
  gender: string | null
  address: string | null
  city: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  photo_url: string | null
  license_type: string | null
  caa_client_number: string | null
  bfr_expiry: string | null
  dl9_medical_due: string | null
  class2_medical_due: string | null
  last_flight: Date | null
  prime_ratings: PrimeRatingType[]
  type_ratings: TypeRatingType[]
  endorsements: EndorsementType[]
  currentMembership: Membership | null
  previousMemberships: Membership[]
  recentBookings: Booking[]
  completedFlights: Booking[]
}

export function useUser(id: string) {
  return useQuery<UserDetails>({
    queryKey: ['user', id],
    queryFn: async () => {
      const [userResponse, membershipsResponse, completedFlightsResponse, activeBookingsResponse] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single(),
        
        supabase
          .from('memberships')
          .select(`
            *,
            membership_type:membership_types (
              id,
              name,
              yearly_fee
            )
          `)
          .eq('user_id', id)
          .order('created_at', { ascending: false }),

        supabase
          .from('bookings')
          .select(`
            id,
            start_time,
            end_time,
            type,
            description,
            flight_time,
            aircraft:aircraft_id (
              registration,
              type,
              model
            ),
            instructor:instructor_id (
              id,
              name
            )
          `)
          .eq('user_id', id)
          .eq('status', 'complete')
          .order('start_time', { ascending: false }),

        supabase
          .from('bookings')
          .select(`
            id,
            start_time,
            end_time,
            type,
            status,
            aircraft:aircraft_id (
              registration,
              type,
              model
            )
          `)
          .eq('user_id', id)
          .neq('status', 'complete')
          .order('start_time', { ascending: false })
      ])

      if (userResponse.error) throw userResponse.error
      if (!userResponse.data) throw new Error('User not found')

      const currentMembership = membershipsResponse.data?.find(m => m.is_active) || null
      const previousMemberships = membershipsResponse.data?.filter(m => !m.is_active) || []

      console.log('Current Membership:', currentMembership)
      console.log('Previous Memberships:', previousMemberships)

      return {
        ...userResponse.data,
        currentMembership,
        previousMemberships,
        recentBookings: activeBookingsResponse.data || [],
        completedFlights: completedFlightsResponse.data || []
      }
    },
    enabled: !!id
  })
} 