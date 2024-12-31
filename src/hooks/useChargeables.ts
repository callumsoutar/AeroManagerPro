import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Chargeable } from '../data/chargeables'

export function useChargeables() {
  return useQuery<Chargeable[]>({
    queryKey: ['chargeables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chargeables')
        .select('*')

      if (error) throw error
      if (!data) return []

      return data as Chargeable[]
    }
  })
} 