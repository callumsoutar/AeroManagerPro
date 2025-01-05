import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  CalendarPlus, 
  Receipt, 
  AlertTriangle,
  Users,
  Plane,
  PlusCircle,
  HelpCircle
} from 'lucide-react'
import { Input } from '../components/ui/input'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useState, useCallback } from 'react'
import { Badge } from '../components/ui/badge'
import { cn } from '../lib/utils'
import { NewBookingModal } from '../components/modals/NewBookingModal'
import { CurrentLocationModal } from '../components/modals/CurrentLocationModal'

// Add interfaces for search results
interface SearchedMember {
  id: string
  first_name: string
  last_name: string
  user_number: string
  email: string
  phone: string
  status: string
}

interface Notice {
  id: string
  message: string
  postedBy: string
  date: string
  priority?: 'low' | 'medium' | 'high'
  category?: 'operations' | 'maintenance' | 'general' | 'safety'
}

export function Home() {
  const navigate = useNavigate()
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [searchInputValue, setSearchInputValue] = useState('')
  const [showNewBookingModal, setShowNewBookingModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [selectedAircraft, setSelectedAircraft] = useState<string>()

  // Query for active flights
  const { data: activeFlights = [] } = useQuery({
    queryKey: ['active-flights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          aircraft:aircraft_id (
            registration,
            type
          ),
          user:user_id (
            first_name,
            last_name
          ),
          instructor:instructor_id (
            first_name,
            last_name
          ),
          checked_out_time,
          eta,
          status
        `)
        .eq('status', 'flying')
        .order('checked_out_time', { ascending: false })

      if (error) throw error
      return data || []
    }
  })

  // Update the member search query
  const { data: searchedMembers = [], isLoading } = useQuery<SearchedMember[]>({
    queryKey: ['members', memberSearchQuery],
    queryFn: async () => {
      console.log('Searching for:', memberSearchQuery)
      
      if (!memberSearchQuery || memberSearchQuery.length < 2) return []
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select(`
            id,
            first_name,
            last_name,
            user_number,
            email,
            phone,
            status
          `)
          .or(
            `first_name.ilike.%${memberSearchQuery}%,` +
            `last_name.ilike.%${memberSearchQuery}%,` +
            `email.ilike.%${memberSearchQuery}%,` +
            `phone.ilike.%${memberSearchQuery}%,` +
            `user_number.ilike.%${memberSearchQuery}%`
          )
          .order('last_name', { ascending: true })
          .limit(5)

        console.log('Raw Supabase response:', { data, error })

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        if (!data) return []

        return data.map((user) => ({
          id: user.id,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          user_number: user.user_number || '',
          email: user.email || '',
          phone: user.phone || '',
          status: user.status || 'inactive'
        }))
      } catch (error) {
        console.error('Search error:', error)
        return []
      }
    },
    enabled: memberSearchQuery.length >= 2
  })

  // Create stable debounced functions using useRef


  // Wrap in useCallback with proper dependencies
  const handleMemberSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    console.log('Search input value:', value)
    setSearchInputValue(value)
    setMemberSearchQuery(value) // Directly set the query instead of using debounce for testing
  }, [])


  const notices: Notice[] = [
    {
      id: '1',
      message: 'Hello everyone, make sure you are flying ZK-ELA and ZK-FLC as much as possible before they go away. Thanks!',
      postedBy: 'Callum Soutar',
      date: new Date().toISOString(),
      priority: 'high',
      category: 'operations'
    },
    {
      id: '2',
      message: 'New maintenance procedures document has been uploaded to the shared drive. Please review before your next shift.',
      postedBy: 'Mike Wilson',
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      category: 'maintenance'
    },
    {
      id: '3',
      message: 'Weather station will be under maintenance this Saturday. Please check METARs directly from MetService.',
      postedBy: 'Sarah Brown',
      date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      category: 'safety'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Quick Actions</h1>

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Create Booking */}
        <button
          onClick={() => setShowNewBookingModal(true)}
          className="w-full text-left"
        >
          <div className="group h-32 rounded-xl bg-blue-50 hover:bg-blue-100/80 transition-all p-6 cursor-pointer">
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <CalendarPlus className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
              <span className="text-lg font-medium text-blue-900">Create Booking</span>
            </div>
          </div>
        </button>

        {/* Create Purchase/Invoice */}
        <div 
          onClick={() => navigate('/invoices/create')}
          className="w-full cursor-pointer"
        >
          <div className="group h-32 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 transition-all p-6">
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Receipt className="h-8 w-8 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
              <span className="text-lg font-medium text-indigo-900">Create Purchase</span>
            </div>
          </div>
        </div>

        {/* Member Search - Moved here */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <label className="font-medium text-gray-900">Member Search</label>
            </div>
            <div className="relative">
              <Input 
                value={searchInputValue}
                placeholder="Search members..."
                className="w-full border-gray-200 focus:border-blue-500 transition-colors"
                onChange={handleMemberSearch}
              />
              
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              )}

              {searchedMembers && searchedMembers.length > 0 && (
                <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-10 overflow-hidden max-h-[300px] overflow-y-auto">
                  {searchedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                      onClick={() => {
                        console.log('Navigating to member:', member.id)
                        navigate(`/members/${member.id}`)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Member #{member.user_number}
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.email} • {member.phone}
                          </div>
                        </div>
                        <Badge 
                          variant={member.status === 'active' ? 'default' : 'secondary'}
                          className={`ml-2 ${
                            member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notices and Report Defect Row */}
      <div className="flex gap-6 mt-8">
        {/* Notices Board - 2/3 width */}
        <div className="w-2/3">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm h-full">
            <div className="border-b border-gray-200 bg-gray-50 p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-blue-500 rounded-full" />
                  <h2 className="text-lg font-semibold text-gray-900">Notices</h2>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                    {notices.length} Active
                  </Badge>
                  <button
                    onClick={() => console.log('Add notice clicked')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Notice
                  </button>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {notices.map((notice) => (
                <div key={notice.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {notice.category && (
                        <Badge 
                          variant="outline"
                          className={cn(
                            "capitalize",
                            notice.category === 'operations' && "text-blue-700 border-blue-200 bg-blue-50",
                            notice.category === 'maintenance' && "text-amber-700 border-amber-200 bg-amber-50",
                            notice.category === 'safety' && "text-red-700 border-red-200 bg-red-50",
                            notice.category === 'general' && "text-gray-700 border-gray-200 bg-gray-50"
                          )}
                        >
                          {notice.category}
                        </Badge>
                      )}
                      {notice.priority === 'high' && (
                        <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                          High Priority
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(notice.date).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <p className="text-gray-900 mb-2">{notice.message}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Posted by:</span>
                    <span>{notice.postedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Defect - 1/3 width */}
        <div className="w-1/3">
          <Link to="/defects/new" className="h-full">
            <div className="group h-full rounded-xl bg-purple-50 hover:bg-purple-100/80 transition-all p-6 cursor-pointer flex flex-col items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-purple-600 group-hover:text-purple-700 transition-colors mb-3" />
              <span className="text-lg font-medium text-purple-900">Report Defect</span>
              <p className="text-sm text-purple-600 mt-2 text-center">
                Report aircraft defects or maintenance issues
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Active Flights Table */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50">
              <Plane className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Active Flights</h2>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {activeFlights.length} Aircraft Flying
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Aircraft</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Member</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Instructor</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Checked Out</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ETA</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeFlights.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No active flights at the moment
                  </td>
                </tr>
              ) : (
                activeFlights.map((flight: any) => (
                  <tr 
                    key={flight.id} 
                    className="border-b border-gray-100 last:border-0 hover:bg-green-50/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-medium text-gray-900">
                          {flight.aircraft?.registration || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {flight.user ? 
                        `${flight.user.first_name} ${flight.user.last_name}` : 
                        '-'
                      }
                    </td>
                    <td className="py-3 px-4">
                      {flight.instructor ? 
                        `${flight.instructor.first_name} ${flight.instructor.last_name}` : 
                        '-'
                      }
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {flight.checked_out_time ? 
                        new Date(flight.checked_out_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        '-'
                      }
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-green-700">
                        {flight.eta ? 
                          new Date(flight.eta).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 
                          '-'
                        }
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/bookings/${flight.id}/flight-details`}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                        >
                          Check In
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedAircraft(flight.aircraft?.registration)
                            setShowLocationModal(true)
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          title="Track Aircraft Position"
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <NewBookingModal 
        open={showNewBookingModal} 
        onClose={() => setShowNewBookingModal(false)}
      />

      <CurrentLocationModal 
        open={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        registration={selectedAircraft}
      />
    </div>
  )
}

export default Home 