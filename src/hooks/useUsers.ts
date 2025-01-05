import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  user_number: string
  photo_url: string | null
  status: string
  join_date: string
  last_flight: string | null
  phone: string | null
  address: string | null
  city: string | null
  // ... other fields
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('last_name', { ascending: true })

      if (error) throw error
      return data
    }
  })
} 