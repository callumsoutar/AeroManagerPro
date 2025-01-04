import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useBooking } from '../hooks/useBooking'
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { getFullName } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { EditBookingModal } from "../components/modals/EditBookingModal"
import { FileEdit, AlertTriangle } from 'lucide-react'
import { useBookingAlerts } from '../hooks/useBookingAlerts'
import { cn } from '../lib/utils'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { DefectModal } from "../components/modals/DefectModal"

interface CheckoutForm {
  eta: string
  route: string
  description: string
}

const CheckoutBooking = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: booking, isLoading, error } = useBooking(id!)
  const { data: alerts = [], isLoading: alertsLoading } = useBookingAlerts(id!)
  
  console.log('Booking data:', {
    id: booking?.id,
    aircraft_id: booking?.aircraft_id,
    queryEnabled: !!booking?.aircraft_id
  })

  const { data: aircraft } = useQuery({
    queryKey: ['aircraft', booking?.aircraft_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aircraft')
        .select('current_tacho, current_hobbs')
        .eq('id', booking?.aircraft_id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!booking?.aircraft_id
  })

  const { data: defects = [], isLoading: defectsLoading } = useQuery({
    queryKey: ['defects', booking?.aircraft_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('defects')
        .select('*')
        .eq('aircraft_id', booking?.aircraft_id)

      if (error) throw error

      // Filter out resolved defects
      return data?.filter(d => d.status.toLowerCase() !== 'resolved') || []
    },
    enabled: !!booking?.aircraft_id
  })

  useEffect(() => {
    console.log('Current booking:', booking)
    console.log('Aircraft ID:', booking?.aircraft_id)
    console.log('Defects data:', defects)
    console.log('Defects loading:', defectsLoading)
  }, [booking, defects, defectsLoading])

  console.log('Defects to render:', defects)

  const [formData, setFormData] = useState<CheckoutForm>({
    eta: '',
    route: '',
    description: ''
  })

  useEffect(() => {
    if (booking) {
      setFormData(prev => ({
        ...prev,
        route: booking.route || '',
        description: booking.description || ''
      }))
    }
  }, [booking])

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedDefect, setSelectedDefect] = useState<any>(null)

  const formatEtaForSupabase = (timeString: string) => {
    if (!timeString) return null
    
    // Get current date
    const today = new Date()
    const [hours, minutes] = timeString.split(':')
    
    // Create new date with today's date and input time
    const etaDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      parseInt(hours),
      parseInt(minutes)
    )

    // Return ISO string for Supabase
    return etaDate.toISOString()
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'flying':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-500'
    }
  }

  useEffect(() => {
    if (booking && booking.status !== 'confirmed') {
      toast.error('This booking cannot be checked out')
      navigate(`/bookings/${id}`)
    }
  }, [booking, id, navigate])

  const handleViewDefect = async (defectId: string) => {
    try {
      const { data, error } = await supabase
        .from('defects')
        .select(`
          *,
          reported_by_user:users!defects_reported_by_fkey (
            first_name,
            last_name
          )
        `)
        .eq('id', defectId)
        .single()

      if (error) throw error
      setSelectedDefect(data)
    } catch (error) {
      console.error('Error fetching defect details:', error)
      toast.error('Failed to load defect details')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Error</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">Failed to load booking details</p>
          <Button onClick={() => navigate('/bookings')} className="mt-4">
            Return to Bookings
          </Button>
        </div>
      </div>
    )
  }

  const handleCheckout = async () => {
    try {
      const formattedEta = formatEtaForSupabase(formData.eta)

      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'flying',
          checked_out_time: new Date().toISOString(),
          eta: formattedEta,
          route: formData.route || null,
          description: formData.description || null,
          tacho_start: aircraft?.current_tacho || null,
          hobbs_start: aircraft?.current_hobbs || null
        })
        .eq('id', booking.id)

      if (error) throw error

      toast.success('Flight checked out successfully')
      navigate(`/bookings/${booking.id}`)
    } catch (error) {
      console.error('Error checking out flight:', error)
      toast.error('Failed to check out flight')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">Flight Check Out</h1>
            <Badge className={`text-base px-3 py-1 ${getStatusBadgeStyle(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>
          <p className="text-gray-500">Complete flight details for {booking.aircraft?.registration}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="gap-2"
          >
            <FileEdit className="h-4 w-4" />
            Edit Booking
          </Button>
          <Link 
            to={`/bookings/${booking.id}`}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            ← Back to Booking
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Flight Information Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold">Flight Information</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              {/* Aircraft Info */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Aircraft</label>
                <p className="text-lg font-medium">{booking.aircraft?.registration}</p>
                <p className="text-sm text-gray-500">{booking.aircraft?.type}</p>
              </div>

              {/* Member Info */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Member</label>
                <p className="text-lg font-medium">
                  {booking.user ? getFullName(booking.user.first_name, booking.user.last_name) : '-'}
                </p>
              </div>

              {/* Instructor Info */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Instructor</label>
                <p className="text-lg font-medium">{booking.instructor?.name || '-'}</p>
              </div>
            </div>
          </div>

          {/* Flight Details Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
              <h2 className="text-lg font-semibold">Flight Details</h2>
            </div>

            <div className="space-y-8">
              {/* Basic Flight Info Section */}
              <div className="grid grid-cols-2 gap-6 pb-6 border-b">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">Flight Type</label>
                  <p className="text-lg font-medium">{booking.flight_type?.name || '-'}</p>
                  
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-400">Tacho Start:</span>
                      <span className="text-xs text-gray-600">
                        {aircraft?.current_tacho?.toFixed(1) || '-'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-400">Hobbs Start:</span>
                      <span className="text-xs text-gray-600">
                        {aircraft?.current_hobbs?.toFixed(1) || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {booking.lesson && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Lesson</label>
                    <p className="text-lg font-medium">{booking.lesson.name}</p>
                  </div>
                )}

                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter flight details or notes"
                    className="mt-2 min-h-[100px]"
                  />
                </div>
              </div>

              {/* Flight Planning Section */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Expected Time of Arrival</label>
                  <Input
                    type="time"
                    value={formData.eta}
                    onChange={(e) => setFormData(prev => ({ ...prev, eta: e.target.value }))}
                    className="w-full"
                    required
                  />
                  <p className="text-xs text-gray-500">Please enter the expected return time</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Route</label>
                  <Input
                    value={formData.route}
                    onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                    placeholder="e.g., NZWN - NZPP - NZWN"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">Enter the planned route</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Alerts */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
              <h2 className="text-lg font-semibold">Alerts</h2>
            </div>
            
            <div className="space-y-4">
              {!alertsLoading && alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-lg flex items-start gap-3",
                    alert.type === 'error' && "bg-red-50 text-red-700",
                    alert.type === 'warning' && "bg-yellow-50 text-yellow-700",
                    alert.type === 'info' && "bg-blue-50 text-blue-700"
                  )}
                >
                  <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{alert.message}</p>
                </div>
              ))}
              
              {/* Aircraft Defects Section */}
              {defectsLoading ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  Loading defects...
                </div>
              ) : (
                <>
                  {defects && defects.length > 0 ? (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-red-800 mb-3">
                        Aircraft Defects ({defects.length})
                      </h3>
                      <div className="overflow-hidden rounded-lg border border-red-100">
                        <table className="min-w-full divide-y divide-red-100">
                          <thead className="bg-red-50">
                            <tr>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-red-900">
                                Defect
                              </th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-red-900">
                                Reported
                              </th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-red-900">
                                Status
                              </th>
                              <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-red-900">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-red-100 bg-white">
                            {defects.map((defect) => (
                              <tr key={defect.id} className="text-xs">
                                <td className="whitespace-nowrap px-3 py-2 text-red-900">
                                  {defect.name}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-red-900">
                                  {format(new Date(defect.reported_date), 'dd MMM yyyy')}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2">
                                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                    {defect.status}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50"
                                    onClick={() => handleViewDefect(defect.id)}
                                  >
                                    View
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No defects found for this aircraft
                    </div>
                  )}
                </>
              )}
              
              {!alertsLoading && !defectsLoading && alerts.length === 0 && (!defects || defects.length === 0) && (
                <div className="text-sm text-gray-500 text-center py-4">
                  No alerts to display
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/bookings/${booking.id}`)}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCheckout}
          className="bg-blue-600 hover:bg-blue-700 px-8"
        >
          Check Out Flight
        </Button>
      </div>

      {/* Edit Booking Modal */}
      {booking && (
        <EditBookingModal
          booking={booking}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {selectedDefect && (
        <DefectModal
          defect={selectedDefect}
          isOpen={!!selectedDefect}
          onClose={() => setSelectedDefect(null)}
          onStatusChange={(newStatus) => {
            // Optionally handle status changes
            // This will refresh the defects list automatically via React Query
          }}
        />
      )}
    </div>
  )
}

export default CheckoutBooking 