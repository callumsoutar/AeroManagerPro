import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { bookings } from '../data/bookings'
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea" 
import { currentDefects } from '../data/defects'

interface Defect {
  id: string;
  aircraft: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  reportedDate: string;
}

const CheckoutBooking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const booking = bookings.find(b => b.id === id)
  
  // Get aircraft defects for this aircraft
  const relevantDefects = currentDefects.filter(
    (defect: Defect) => defect.aircraft === booking?.aircraft
  )

  const [checkoutData, setCheckoutData] = useState({
    eta: '',
    flightDetails: '',
    route: '',
    fuelRequired: '',
    specialNotes: ''
  })

  if (!booking) {
    return <div className="p-6">Booking not found</div>
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCheckoutData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckIn = () => {
    // Navigate to the flight details page
    navigate(`/bookings/${id}/flight-details`)
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{booking.aircraft}</h1>
            <Badge variant="default">Check Out</Badge>
          </div>
          <p className="text-gray-500 mt-1">Booking #{booking.id}</p>
        </div>
        <Link to="/" className="text-sm text-gray-600 hover:text-blue-600">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Booking Info */}
        <div className="col-span-1">
          <div className="bg-gray-50 rounded-xl shadow-sm border p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase">Booking Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Member</label>
                <p className="text-sm text-gray-900">{booking.member}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Instructor</label>
                <p className="text-sm text-gray-900">{booking.instructor || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Type</label>
                <p className="text-sm text-gray-900">{booking.type}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Time</label>
                <p className="text-sm text-gray-900">{booking.startTime} - {booking.endTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Flight Details Form */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase">Flight Details</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">ETA</label>
                  <Input
                    name="eta"
                    value={checkoutData.eta}
                    onChange={handleInputChange}
                    placeholder="HH:MM"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Fuel Required</label>
                  <Input
                    name="fuelRequired"
                    value={checkoutData.fuelRequired}
                    onChange={handleInputChange}
                    placeholder="Litres"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Route</label>
                <Input
                  name="route"
                  value={checkoutData.route}
                  onChange={handleInputChange}
                  placeholder="Flight route"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Flight Details</label>
                <Textarea
                  name="flightDetails"
                  value={checkoutData.flightDetails}
                  onChange={handleInputChange}
                  placeholder="Enter flight details"
                  className="mt-1 h-20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Defects */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase">Outstanding Defects</h3>
            {relevantDefects.length > 0 ? (
              <div className="space-y-2">
                {relevantDefects.map((defect: Defect) => (
                  <div key={defect.id} className="p-2 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-900 font-medium">{defect.description}</p>
                    <div className="flex justify-between items-center mt-1">
                      <Badge 
                        variant={
                          defect.status === 'Open' ? 'destructive' : 
                          defect.status === 'In Progress' ? 'default' : 
                          'secondary'
                        }
                      >
                        {defect.status}
                      </Badge>
                      <span className="text-xs text-gray-500">{defect.reportedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No outstanding defects</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - Tech Log & Actions */}
      <div className="mt-6 grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <Tabs defaultValue="techlog" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="techlog">Tech Log</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="techlog" className="pt-4">
                <div className="text-sm text-gray-500">Tech log information will be displayed here</div>
              </TabsContent>
              <TabsContent value="history" className="pt-4">
                <div className="text-sm text-gray-500">Flight history will be displayed here</div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="col-span-1 flex items-end">
          <div className="bg-white rounded-xl shadow-sm border p-4 w-full">
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 px-8"
                onClick={handleCheckIn}
              >
                Check Out Flight
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutBooking 