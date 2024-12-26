import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { bookings } from '../data/bookings'
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { format } from 'date-fns'
import { Clock, User, Plane, FileEdit, CheckCircle2, AlertCircle } from 'lucide-react'

const BookingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const booking = bookings.find(b => b.id === id)

  if (!booking) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
        <p className="text-gray-500 mb-4">The booking you're looking for doesn't exist.</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          ← Return to Dashboard
        </Link>
      </div>
    )
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'EEE, MMM d, yyyy h:mm a')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'flying':
        return 'bg-blue-100 text-blue-800'
      case 'complete':
        return 'bg-green-100 text-green-800'
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{booking.aircraft}</h1>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 ml-4"
              onClick={() => setIsEditing(!isEditing)}
            >
              <FileEdit className="h-4 w-4" />
              {isEditing ? 'Cancel Edit' : 'Edit Booking'}
            </Button>
          </div>
          <p className="text-gray-500">Booking #{booking.id}</p>
        </div>
        <Link to="/" className="text-gray-600 hover:text-gray-900">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border">
        {/* Top Section with Key Details */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Plane className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Flight Details</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <Badge className="mt-1" variant="secondary">
                      {booking.type.charAt(0).toUpperCase() + booking.type.slice(1)}
                    </Badge>
                  </div>
                  {booking.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="mt-1 text-gray-900">{booking.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">People</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Member</label>
                    <p className="mt-1 text-gray-900">{booking.member}</p>
                  </div>
                  {booking.instructor && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Instructor</label>
                      <p className="mt-1 text-gray-900">{booking.instructor}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Timing</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Time</label>
                    <p className="mt-1 text-gray-900">{formatDateTime(booking.startTime)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">End Time</label>
                    <p className="mt-1 text-gray-900">{formatDateTime(booking.endTime)}</p>
                  </div>
                  {booking.checkedOutTime && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Checked Out</label>
                      <p className="mt-1 text-gray-900">{booking.checkedOutTime}</p>
                    </div>
                  )}
                  {booking.eta && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">ETA</label>
                      <p className="mt-1 text-gray-900">{booking.eta}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="p-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="details">Flight Details</TabsTrigger>
              <TabsTrigger value="charges">Charges</TabsTrigger>
              <TabsTrigger value="techlog">Tech Log</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="p-4">
              <div className="text-gray-500">Flight details will be displayed here</div>
            </TabsContent>
            <TabsContent value="charges" className="p-4">
              <div className="text-gray-500">Charges information will be displayed here</div>
            </TabsContent>
            <TabsContent value="techlog" className="p-4">
              <div className="text-gray-500">Tech log information will be displayed here</div>
            </TabsContent>
            <TabsContent value="history" className="p-4">
              <div className="text-gray-500">Booking history will be displayed here</div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="border-t p-6">
          <div className="flex justify-end gap-4">
            {isEditing && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700 px-8"
                onClick={() => {
                  setIsEditing(false)
                  // Save changes logic here
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
            
            {booking.status === 'confirmed' && !isEditing && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700 px-8"
                onClick={() => navigate(`/bookings/${booking.id}/checkout`)}
              >
                Check Flight Out
              </Button>
            )}
            
            {booking.status === 'flying' && !isEditing && (
              <Button 
                className="bg-green-600 hover:bg-green-700 px-8"
                onClick={() => navigate(`/bookings/${booking.id}/flight-details`)}
              >
                Check In Flight
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetail 