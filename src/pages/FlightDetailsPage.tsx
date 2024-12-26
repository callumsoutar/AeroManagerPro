import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { bookings } from '../data/bookings'
import { aircraftData } from '../data/aircraft'
import { chargeables } from '../data/chargeables'
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import FlightTrackModal from '../components/modals/FlightTrackModal'
import { MapIcon } from 'lucide-react'
import DebriefModal from '../components/modals/DebriefModal'

interface FlightTimes {
  endTacho: string;
  endHobbs: string;
  instructorComments: string;
}

interface InvoiceItem {
  id: string;
  name: string;
  amount: number;
}

const FlightDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const booking = bookings.find(b => b.id === id)
  
  // Fix the aircraft matching logic
  const aircraft = booking ? aircraftData.find(a => {
    // Extract registration from booking aircraft string (e.g., "C172 - ZK-ABC" -> "ABC")
    const bookingReg = booking.aircraft.split(' - ')[1]?.replace('ZK-', '') || ''
    return a.registration === bookingReg
  }) : null

  const [flightTimes, setFlightTimes] = useState<FlightTimes>({
    endTacho: '',
    endHobbs: '',
    instructorComments: ''
  })

  const [calculatedTimes, setCalculatedTimes] = useState({
    tachoTime: 0,
    hobbsTime: 0,
    estimatedCost: 0
  })

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [selectedChargeable, setSelectedChargeable] = useState<string>('')
  const [isFlightTrackOpen, setIsFlightTrackOpen] = useState(false)
  const [isDebriefOpen, setIsDebriefOpen] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFlightTimes(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculateCharges = () => {
    if (!aircraft?.currentTacho || !flightTimes.endTacho) return

    const tachoTime = parseFloat(flightTimes.endTacho) - aircraft.currentTacho
    const hobbsTime = parseFloat(flightTimes.endHobbs) - (aircraft.currentHobbs || 0)
    const hourlyRate = 180
    const estimatedCost = tachoTime * hourlyRate

    setCalculatedTimes({
      tachoTime,
      hobbsTime,
      estimatedCost
    })

    // Add flight time charge as first invoice item
    setInvoiceItems([{
      id: 'flight-time',
      name: `Flight Time (${tachoTime.toFixed(1)} hrs @ $${hourlyRate}/hr)`,
      amount: estimatedCost
    }])
  }

  const handleAddChargeable = (chargeableId: string) => {
    const chargeable = chargeables.find(c => c.id === chargeableId)
    if (chargeable) {
      setInvoiceItems(prev => [...prev, {
        id: chargeable.id,
        name: chargeable.name,
        amount: chargeable.amount
      }])
      setSelectedChargeable('')
    }
  }

  const removeInvoiceItem = (id: string) => {
    setInvoiceItems(prev => prev.filter(item => item.id !== id))
  }

  const totalAmount = invoiceItems.reduce((sum, item) => sum + item.amount, 0)

  if (!booking || !aircraft) {
    return <div className="p-6">Flight not found</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{booking.aircraft}</h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Flight Details
            </Badge>
          </div>
          <p className="text-gray-500 mt-1">Complete Flight Information • Booking #{booking.id}</p>
        </div>
        <Link to="/" className="text-sm text-gray-600 hover:text-blue-600">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Flight Info & Times */}
        <div className="col-span-2 space-y-6">
          {/* Flight Information */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Flight Information</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Member</label>
                <p className="mt-1 text-gray-900 font-medium">{booking.member}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Instructor</label>
                <p className="mt-1 text-gray-900 font-medium">{booking.instructor || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Flight Type</label>
                <p className="mt-1 text-gray-900 font-medium">{booking.type}</p>
              </div>
            </div>
          </div>

          {/* Aircraft Times */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">Aircraft Times</h2>
              </div>
              <Button
                onClick={calculateCharges}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Calculate Charges
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tacho Times */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Tacho</label>
                    <p className="text-lg font-semibold text-gray-900">{aircraft.currentTacho}</p>
                  </div>
                  <div className="w-32">
                    <label className="text-sm font-medium text-gray-500">End Tacho</label>
                    <Input
                      name="endTacho"
                      value={flightTimes.endTacho}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-sm font-medium text-green-600 text-right">
                  Time: {calculatedTimes.tachoTime.toFixed(1)} hrs
                </p>
              </div>

              {/* Hobbs Times */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Hobbs</label>
                    <p className="text-lg font-semibold text-gray-900">{aircraft.currentHobbs}</p>
                  </div>
                  <div className="w-32">
                    <label className="text-sm font-medium text-gray-500">End Hobbs</label>
                    <Input
                      name="endHobbs"
                      value={flightTimes.endHobbs}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-sm font-medium text-green-600 text-right">
                  Time: {calculatedTimes.hobbsTime.toFixed(1)} hrs
                </p>
              </div>
            </div>
          </div>

          {/* Instructor Comments */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">Instructor Comments</h2>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsFlightTrackOpen(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <MapIcon className="h-4 w-4" />
                  View Flight Track
                </Button>
                <Button
                  onClick={() => setIsDebriefOpen(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <MapIcon className="h-4 w-4" />
                  Debrief
                </Button>
              </div>
            </div>
            
            <Textarea
              name="instructorComments"
              value={flightTimes.instructorComments}
              onChange={handleInputChange}
              placeholder="Enter detailed comments about the flight, student progress, or any notable events..."
              className="min-h-[120px]"
            />
          </div>
        </div>

        {/* Right Column - Invoicing */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Invoice Details</h2>
            </div>

            {/* Add Chargeable Items */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-500 mb-1 block">
                Add Additional Charges
              </label>
              <Select
                value={selectedChargeable}
                onValueChange={handleAddChargeable}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item to add..." />
                </SelectTrigger>
                <SelectContent>
                  {chargeables.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - ${item.amount.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Invoice Items List */}
            <div className="space-y-2 mb-4">
              {invoiceItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-900">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">${item.amount.toFixed(2)}</span>
                    {item.id !== 'flight-time' && (
                      <button
                        onClick={() => removeInvoiceItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Amount */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-green-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Save Button */}
            <Button 
              className="w-full mt-6 bg-green-600 hover:bg-green-700"
              onClick={() => {
                console.log('Saving:', { flightTimes, invoiceItems, totalAmount })
                navigate('/')
              }}
            >
              Complete Flight & Save
            </Button>
          </div>
        </div>
      </div>

      {/* Add the Flight Track Modal */}
      <FlightTrackModal 
        isOpen={isFlightTrackOpen}
        onClose={() => setIsFlightTrackOpen(false)}
      />

      {/* Add the Debrief Modal */}
      <DebriefModal 
        isOpen={isDebriefOpen}
        onClose={() => setIsDebriefOpen(false)}
      />
    </div>
  )
}

export default FlightDetailsPage

export {} 