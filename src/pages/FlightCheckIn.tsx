import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useBooking } from '../hooks/useBooking'
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { getFullName } from '../lib/utils'

const FlightCheckIn = () => {
  const { id } = useParams<{ id: string }>()
  const { data: booking, isLoading } = useBooking(id!)
  const navigate = useNavigate()

  if (isLoading) {
    return <div className="p-6">Loading booking details...</div>
  }

  if (!booking) {
    return <div className="p-6">Booking not found</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flight Check In</h1>
          <p className="text-gray-500">Complete flight details for {booking.aircraft?.registration}</p>
        </div>
        <Link 
          to={`/bookings/${booking.id}`}
          className="text-sm text-gray-600 hover:text-blue-600"
        >
          ← Back to Booking
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        {/* Basic flight info */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <label className="text-sm font-medium text-gray-500">Aircraft</label>
            <p className="mt-1 text-lg font-medium">{booking.aircraft?.registration}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Member</label>
            <p className="mt-1 text-lg font-medium">
              {booking.user ? getFullName(booking.user.first_name, booking.user.last_name) : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <Badge className="mt-1">
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/bookings/${booking.id}`)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => navigate(`/bookings/${booking.id}/flight-details`)}
          >
            Continue to Flight Details
          </Button>
        </div>
      </div>
    </div>
  )
}

export default FlightCheckIn 