import React, { useState } from 'react'
import { Badge } from "../components/ui/badge"
import { Link } from 'react-router-dom'
import { Cloud, Wind, Thermometer, Droplets, Gauge, Plane, Calendar, AlertTriangle, Clock } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { DefectModal } from '../components/modals/DefectModal'

// First, define types for the nested objects
interface Aircraft {
  registration: string
  type: string
}

interface User {
  first_name: string
  last_name: string
}

interface Instructor {
  first_name: string
  last_name: string
}

// Update the ActiveFlight interface
interface ActiveFlight {
  id: string
  aircraft_id: string
  aircraft: Aircraft | null
  user_id: string
  user: User | null
  instructor_id: string | null
  instructor: Instructor | null
  checked_out_time: string | null
  eta: string | null
  status: string
}

// Add a new interface for today's bookings
interface TodayBooking {
  id: string
  aircraft_id: string
  aircraft: Aircraft | null
  user_id: string
  user: User | null
  instructor_id: string | null
  instructor: Instructor | null
  description: string | null
  start_time: string | null
  end_time: string | null
  status: string
}

// First, define the DefectComment interface
interface DefectComment {
  text: string
  user: string
  timestamp: string
}

// Simplify the Defect interface to match actual database structure
interface Defect {
  id: string
  aircraft_id: string
  aircraft: {
    registration: string
    type: string
  } | null
  description: string
  status: string
  reported_date: string
  name: string
  reported_by: string
  reported_by_user: {
    first_name: string
    last_name: string
  }
  comments: DefectComment[]
}

const WeatherCard = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-8 border border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 bg-blue-500 rounded-full" />
          <h2 className="text-xl font-semibold text-gray-800">NZPP Weather</h2>
        </div>
        <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
          Updated 5 mins ago
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left column with main weather icon */}
        <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-sm">
          <Cloud className="h-14 w-14 text-blue-500 mb-3" strokeWidth={1.5} />
          <span className="text-sm font-medium text-gray-700">
            Scattered 2400ft
          </span>
        </div>

        {/* Right column with temperature */}
        <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-sm">
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-orange-500">17</span>
            <span className="text-2xl text-orange-400 ml-1">°C</span>
          </div>
          <div className="flex items-center mt-2">
            <Thermometer className="h-4 w-4 text-orange-400 mr-1" />
            <span className="text-sm text-gray-600">Temperature</span>
          </div>
        </div>
      </div>

      {/* Bottom row with additional metrics */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {/* QNH */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm flex flex-col items-center">
          <div className="flex items-center mb-2">
            <Gauge className="h-5 w-5 text-emerald-500 mr-1" strokeWidth={1.5} />
            <span className="text-xs font-medium text-gray-600">QNH</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">1013</span>
          <span className="text-xs text-gray-500">hPa</span>
        </div>

        {/* Wind */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm flex flex-col items-center">
          <div className="flex items-center mb-2">
            <Wind className="h-5 w-5 text-blue-500 mr-1" strokeWidth={1.5} />
            <span className="text-xs font-medium text-gray-600">Wind</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">340°</span>
          <span className="text-xs text-gray-500">11kt</span>
        </div>

        {/* Dew Point */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm flex flex-col items-center">
          <div className="flex items-center mb-2">
            <Droplets className="h-5 w-5 text-purple-500 mr-1" strokeWidth={1.5} />
            <span className="text-xs font-medium text-gray-600">Dew Point</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">6°</span>
          <span className="text-xs text-gray-500">Celsius</span>
        </div>
      </div>
    </div>
  )
}

const AdminDashboard = () => {
  const queryClient = useQueryClient()

  const stats = [
    { 
      label: 'Flights This Week', 
      value: 23,
      trend: 'up',
      percentage: 12
    },
    { 
      label: 'Flying Hours This Week', 
      value: 50,
      trend: 'up',
      percentage: 8
    },
    { 
      label: 'Active Members', 
      value: 270,
      trend: 'down',
      percentage: 2
    },
    { 
      label: 'Active Aircraft', 
      value: 8,
      trend: 'up',
      percentage: 1
    }
  ]

  const { data: defects = [] } = useQuery<Defect[]>({
    queryKey: ['defects'],
    queryFn: async () => {
      console.log('Fetching defects...')

      const { data, error } = await supabase
        .from('defects')
        .select(`
          id,
          name,
          aircraft_id,
          aircraft:aircraft_id (
            registration,
            type
          ),
          description,
          status,
          reported_date,
          reported_by,
          reported_by_user:reported_by (
            first_name,
            last_name
          ),
          comments
        `)
        .order('reported_date', { ascending: false })

      console.log('Defects raw response:', { data, error })

      if (error) {
        console.error('Error fetching defects:', error)
        throw error
      }

      const transformedData = (data || []).map((defect: any) => ({
        id: defect.id,
        name: defect.name || `Defect Report`,
        aircraft_id: defect.aircraft_id,
        aircraft: defect.aircraft,
        description: defect.description,
        status: defect.status,
        reported_date: defect.reported_date,
        reported_by: defect.reported_by,
        reported_by_user: defect.reported_by_user || {
          first_name: 'Unknown',
          last_name: 'User'
        },
        comments: Array.isArray(defect.comments) ? defect.comments : []
      }))

      console.log('Transformed defects:', transformedData)
      return transformedData
    }
  })

  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null)
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false)

  const handleDefectClick = (defect: Defect) => {
    setSelectedDefect(defect)
    setIsDefectModalOpen(true)
  }

  const { data: activeFlights = [] } = useQuery<ActiveFlight[]>({
    queryKey: ['active-flights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          aircraft_id,
          aircraft:aircraft_id (
            registration,
            type
          ),
          user_id,
          user:user_id (
            first_name,
            last_name
          ),
          instructor_id,
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

      // Add console.log to debug the raw response
      console.log('Raw Supabase response:', data)
      
      // Transform the data correctly - Supabase returns nested objects directly
      const transformedData: ActiveFlight[] = (data || []).map((booking: any) => ({
        id: booking.id,
        aircraft_id: booking.aircraft_id,
        aircraft: booking.aircraft || null, // Remove the [0] index access
        user_id: booking.user_id,
        user: booking.user || null, // Remove the [0] index access
        instructor_id: booking.instructor_id,
        instructor: booking.instructor || null, // Remove the [0] index access
        checked_out_time: booking.checked_out_time,
        eta: booking.eta,
        status: booking.status
      }))

      // Add console.log to debug the transformed data
      console.log('Transformed data:', transformedData)

      return transformedData
    }
  })

  const { data: todaysBookings = [] } = useQuery<TodayBooking[]>({
    queryKey: ['todays-bookings'],
    queryFn: async () => {
      // Get today's date in local timezone
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

      // Add console.log to debug date ranges
      console.log('Querying bookings between:', {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString()
      })

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          aircraft_id,
          aircraft:aircraft_id (
            registration,
            type
          ),
          user_id,
          user:user_id (
            first_name,
            last_name
          ),
          instructor_id,
          instructor:instructor_id (
            first_name,
            last_name
          ),
          description,
          start_time,
          end_time,
          status
        `)
        .gte('start_time', startOfDay.toISOString())
        .lt('start_time', endOfDay.toISOString())
        .not('status', 'eq', 'flying')
        .order('start_time', { ascending: true })

      if (error) {
        console.error('Error fetching today\'s bookings:', error)
        throw error
      }

      // Debug the raw response
      console.log('Raw bookings data:', data)

      const transformedData: TodayBooking[] = (data || []).map((booking: any) => ({
        id: booking.id,
        aircraft_id: booking.aircraft_id,
        aircraft: booking.aircraft || null,
        user_id: booking.user_id,
        user: booking.user || null,
        instructor_id: booking.instructor_id,
        instructor: booking.instructor || null,
        description: booking.description,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status
      }))

      // Debug the transformed data
      console.log('Transformed bookings data:', transformedData)

      return transformedData
    },
    // Add refetch interval to keep the data fresh
    refetchInterval: 30000 // Refetch every 30 seconds
  })

  // Add a new query for unconfirmed bookings
  const { data: unconfirmedBookings = [] } = useQuery<TodayBooking[]>({
    queryKey: ['unconfirmed-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          aircraft_id,
          aircraft:aircraft_id (
            registration,
            type
          ),
          user_id,
          user:user_id (
            first_name,
            last_name
          ),
          instructor_id,
          instructor:instructor_id (
            first_name,
            last_name
          ),
          description,
          start_time,
          end_time,
          status
        `)
        .eq('status', 'unconfirmed')
        .order('start_time', { ascending: true })

      if (error) throw error
      
      return (data || []).map((booking: any) => ({
        id: booking.id,
        aircraft_id: booking.aircraft_id,
        aircraft: booking.aircraft,
        user_id: booking.user_id,
        user: booking.user,
        instructor_id: booking.instructor_id,
        instructor: booking.instructor,
        description: booking.description,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status
      }))
    }
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`rounded-lg shadow p-4 ${
              index === 0 ? 'bg-blue-50' :
              index === 1 ? 'bg-indigo-50' :
              index === 2 ? 'bg-purple-50' :
              'bg-violet-50'
            }`}
          >
            <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              {stat.trend && (
                <span className={`text-sm flex items-center ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? '↑' : '↓'} {stat.percentage}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main two-column layout */}
      <div className="flex gap-6">
        {/* Left column - 2/3 width */}
        <div className="w-2/3 space-y-6">
          {/* Active Flights Table */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <Plane className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Active Flights</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">Aircraft</th>
                  <th className="pb-2">Member</th>
                  <th className="pb-2">Instructor</th>
                  <th className="pb-2">Checked Out</th>
                  <th className="pb-2">ETA</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeFlights.map((flight: ActiveFlight) => (
                  <tr key={flight.id} className="border-t">
                    <td className="py-2">
                      {flight.aircraft?.registration || '-'}
                    </td>
                    <td className="py-2">
                      {flight.user ? 
                        `${flight.user.first_name} ${flight.user.last_name}` : 
                        '-'
                      }
                    </td>
                    <td className="py-2">
                      {flight.instructor ? 
                        `${flight.instructor.first_name} ${flight.instructor.last_name}` : 
                        '-'
                      }
                    </td>
                    <td className="py-2">
                      {flight.checked_out_time ? 
                        new Date(flight.checked_out_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        '-'
                      }
                    </td>
                    <td className="py-2">
                      {flight.eta ? 
                        new Date(flight.eta).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        '-'
                      }
                    </td>
                    <td className="py-2">
                      <div className="space-x-2">
                        <Link 
                          to={`/bookings/${flight.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </Link>
                        <Link 
                          to={`/bookings/${flight.id}/flight-details`}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          Check In
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Today's Bookings Table */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold">Today's Bookings</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">Aircraft</th>
                  <th className="pb-2">Member</th>
                  <th className="pb-2">Instructor</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Times</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {todaysBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
                      No bookings scheduled for today
                    </td>
                  </tr>
                ) : (
                  todaysBookings.map((booking: TodayBooking) => (
                    <tr key={booking.id} className="border-t">
                      <td className="py-2">
                        {booking.aircraft?.registration || '-'}
                      </td>
                      <td className="py-2">
                        {booking.user ? 
                          `${booking.user.first_name} ${booking.user.last_name}` : 
                          '-'
                        }
                      </td>
                      <td className="py-2">
                        {booking.instructor ? 
                          `${booking.instructor.first_name} ${booking.instructor.last_name}` : 
                          '-'
                        }
                      </td>
                      <td className="py-2">
                        {booking.description || '-'}
                      </td>
                      <td className="py-2">
                        {booking.start_time ? 
                          `${new Date(booking.start_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - ${new Date(booking.end_time || '').toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}` : 
                          '-'
                        }
                      </td>
                      <td className="py-2">
                        <div className="space-x-2">
                          <Link 
                            to={`/bookings/${booking.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </Link>
                          <Link 
                            to={`/bookings/${booking.id}/checkout`}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Check Out
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add Requested Bookings Table */}
          <div className="bg-white rounded-lg shadow p-4 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold">Requested Bookings</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">Aircraft</th>
                  <th className="pb-2">Member</th>
                  <th className="pb-2">Instructor</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Times</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {unconfirmedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-gray-500">
                      No unconfirmed bookings
                    </td>
                  </tr>
                ) : (
                  unconfirmedBookings.map((booking) => (
                    <tr key={booking.id} className="border-t">
                      <td className="py-2">
                        {booking.aircraft?.registration || '-'}
                      </td>
                      <td className="py-2">
                        {booking.user ? 
                          `${booking.user.first_name} ${booking.user.last_name}` : 
                          '-'
                        }
                      </td>
                      <td className="py-2">
                        {booking.instructor ? 
                          `${booking.instructor.first_name} ${booking.instructor.last_name}` : 
                          '-'
                        }
                      </td>
                      <td className="py-2">
                        {booking.description || '-'}
                      </td>
                      <td className="py-2">
                        {booking.start_time ? 
                          `${new Date(booking.start_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - ${new Date(booking.end_time || '').toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}` : 
                          '-'
                        }
                      </td>
                      <td className="py-2">
                        <Link
                          to={`/bookings/${booking.id}`}
                          className="inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors duration-200"
                        >
                          Confirm
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column - 1/3 width */}
        <div className="w-1/3">
          {/* Weather Card */}
          <WeatherCard />

          {/* Aircraft Defects */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold">Aircraft Defects</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">Aircraft</th>
                  <th className="pb-2">Issue</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Reported</th>
                </tr>
              </thead>
              <tbody>
                {defects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">
                      No defects reported
                    </td>
                  </tr>
                ) : (
                  defects.map((defect) => (
                    <tr 
                      key={defect.id} 
                      className="border-t cursor-pointer hover:bg-gray-50"
                      onClick={() => handleDefectClick(defect)}
                    >
                      <td className="py-2">
                        {defect.aircraft?.registration || '-'}
                      </td>
                      <td className="py-2 max-w-[200px] truncate">
                        {defect.description}
                      </td>
                      <td className="py-2">
                        <Badge 
                          variant={
                            defect.status === 'Open' ? 'destructive' : 
                            defect.status === 'In Progress' ? 'warning' : 
                            'secondary'
                          }
                        >
                          {defect.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-sm text-gray-600">
                        {defect.reported_date ? 
                          new Date(defect.reported_date).toLocaleDateString() : 
                          '-'
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Add DefectModal */}
            {selectedDefect && (
              <DefectModal
                defect={selectedDefect}
                isOpen={isDefectModalOpen}
                onClose={() => {
                  setIsDefectModalOpen(false)
                  setSelectedDefect(null)
                }}
                onStatusChange={() => {
                  queryClient.invalidateQueries({ queryKey: ['defects'] })
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 