export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          user_number: string
          photo_url: string | null
          status: string
          join_date: string
          membership_type: string | null
          license_type: string | null
          medical_expiry: string | null
          bfr_expiry: string | null
          last_flight: string | null
          is_member: boolean
          is_staff: boolean
          created_at: string
          gender: 'male' | 'female' | null
          phone: string | null
          address: string | null
          city: string | null
          country: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          dl9_medical_due: string | null
          class2_medical_due: string | null
          caa_client_number: string | null
          prime_ratings: ('Instructor Rating' | 'Instrument Rating' | 'Aerobatics Rating')[] | null
          type_ratings: ('C-152' | 'C-172' | 'Pa-28' | 'Pa-38')[] | null
          endorsements: ('Night' | 'Cross Country')[] | null
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      aircraft: {
        Row: {
          id: string
          registration: string
          type: string
          model: string
          year: string
          engine_hours: number
          last_maintenance: string
          next_service_due: string
          status: 'Active' | 'Maintenance' | 'Inactive'
          photo_url: string | null
          current_tacho: number | null
          current_hobbs: number | null
          record_tacho: boolean
          record_hobbs: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['aircraft']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['aircraft']['Insert']>
      }
      aircraft_rates: {
        Row: {
          id: string
          aircraft_id: string
          flight_type_id: string
          rate: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['aircraft_rates']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['aircraft_rates']['Insert']>
      }
      equipment: {
        Row: {
          id: string
          aircraft_id: string
          type: string
          last_completed: string
          next_due: string
          hours_completed: number
          hours_due: number
          days_remaining: number
          hours_remaining: number
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['equipment']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['equipment']['Insert']>
      }
      defects: {
        Row: {
          id: string
          aircraft_id: string
          name: string
          description: string
          status: 'Open' | 'In Progress' | 'Resolved'
          reported_date: string
          reported_by: string | null
          comments: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['defects']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['defects']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          aircraft_id: string | null
          user_id: string | null
          instructor_id: string | null
          start_time: string
          end_time: string
          status: 'unconfirmed' | 'confirmed' | 'flying' | 'complete'
          checked_out_time: string | null
          eta: string | null
          flight_type_id: string
          description: string | null
          tacho_start: number | null
          tacho_end: number | null
          hobbs_start: number | null
          hobbs_end: number | null
          flight_time: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      flight_types: {
        Row: {
          id: string
          name: booking_type_enum
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['flight_types']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['flight_types']['Insert']>
      }
      invoices: {
        Row: {
          id: string
          booking_id: string
          user_id: string
          amount: number
          status: 'pending' | 'paid' | 'overdue' | 'cancelled'
          due_date: string
          paid_date: string | null
          created_at: string
          updated_at: string
          invoice_number: string
          notes: string | null
          reference?: string | null
        }
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>
      }
    }
  }
}

export interface FlightType {
  id: string
  name: 'Aeroclub Dual' | 'Aeroclub Solo' | 'Charter' | 'Trial Flight' | 'Maintenance' | 'Test Flight'
  description: string | null
  created_at: string
  updated_at: string
}

export interface AircraftRate {
  id: string
  aircraft_id: string
  flight_type_id: string
  rate: number
  created_at: string
  updated_at: string
}

export interface Booking {
  // ... other fields ...
  flight_type_id: string
  // ... other fields ...
}

export type booking_type_enum = 
  | 'Aeroclub Dual'
  | 'Aeroclub Solo'
  | 'Charter' 
  | 'Trial Flight'
  | 'Maintenance'
  | 'Test Flight' 