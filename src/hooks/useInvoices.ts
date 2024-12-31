import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Invoice = Database['public']['Tables']['invoices']['Row']

interface InvoiceWithDetails extends Invoice {
  total_amount: number
  flight_charge_total: number
  additional_charges_total: number
  booking: {
    id: string
    aircraft: {
      registration: string
    } | null
    flight_type: {
      name: string
    } | null
  } | null
  user: {
    name: string
    email: string
  } | null
}

export function useInvoices() {
  return useQuery<InvoiceWithDetails[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          booking:booking_id (
            id,
            aircraft:aircraft_id (registration),
            flight_type:flight_type_id (name)
          ),
          user:user_id (name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      return data?.map(invoice => ({
        ...invoice,
        total_amount: Number(invoice.total_amount) || 0,
        flight_charge_total: Number(invoice.flight_charge_total) || 0,
        additional_charges_total: Number(invoice.additional_charges_total) || 0
      })) as InvoiceWithDetails[]
    },
  })
} 