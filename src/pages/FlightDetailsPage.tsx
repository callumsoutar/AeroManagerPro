import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useFlightDetails } from '../hooks/useFlightDetails'
import { ChargeableType, Chargeable } from '../data/chargeables'
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { FlightTrackModal } from '../components/modals/FlightTrackModal'
import DebriefModal from '../components/modals/DebriefModal'
import { X, Map as MapIcon } from 'lucide-react'
import { cn, getFullName } from '../lib/utils'
import { supabase } from '../lib/supabase'
import { useChargeables } from '../hooks/useChargeables'
import { toast, Toaster } from 'sonner'
import { PaymentCollectionModal } from '../components/modals/PaymentCollectionModal'


interface FlightTimes {
  tacho_end: string;
  hobbs_end: string;
  instructor_comments: string;
}

interface InvoiceItem {
  id: string;
  name: string;
  amount: number;
  type: ChargeableType;
  quantity: number;
  isFlightCharge?: boolean;
}

interface ChargeSection {
  type: ChargeableType;
  title: string;
  description: string;
}

const chargeSections: ChargeSection[] = [
  {
    type: "Landing Fee",
    title: "Landing Fees",
    description: "Add any landing or touch & go fees"
  },
  {
    type: "Airways Fee",
    title: "Airways Fees",
    description: "Add approach and departure fees"
  },
  {
    type: "Other Charges",
    title: "Other Charges",
    description: "Add any additional charges"
  }
];

const FlightDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data: booking, isLoading } = useFlightDetails(id!)
  const navigate = useNavigate()
  
  const aircraft = booking?.aircraft

  const [flightTimes, setFlightTimes] = useState<FlightTimes>({
    tacho_end: '',
    hobbs_end: '',
    instructor_comments: ''
  })

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([])
  const [isFlightTrackOpen, setIsFlightTrackOpen] = useState(false)
  const [isDebriefOpen, setIsDebriefOpen] = useState(false)
  const [selectedRateId, setSelectedRateId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null)
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = useState<string | null>(null)
  const [invoiceAmount, setInvoiceAmount] = useState<number>(0)
  const [isFlightCompleted, setIsFlightCompleted] = useState(false)
  
  // Memoize currentAircraftRates
  const currentAircraftRates = useMemo(() => {
    return booking?.aircraft_rates || []
  }, [booking?.aircraft_rates])

  // Add the chargeables query
  const { data: chargeables = [] } = useChargeables()
  
  // Group chargeables by type
  const chargeablesByType = chargeables.reduce((acc: Record<ChargeableType, Chargeable[]>, charge: Chargeable) => {
    if (!acc[charge.type]) {
      acc[charge.type] = [];
    }
    acc[charge.type].push(charge);
    return acc;
  }, {} as Record<ChargeableType, Chargeable[]>);

  // Add new state for displayed times
  const [displayTimes, setDisplayTimes] = useState({
    tachoTime: 0,
    hobbsTime: 0
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFlightTimes(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // New function to calculate and display times without affecting invoice
  const calculateDisplayTimes = useCallback(() => {
    if (!aircraft?.current_tacho || !flightTimes.tacho_end) return

    const tachoTime = parseFloat(flightTimes.tacho_end) - aircraft.current_tacho
    const hobbsTime = parseFloat(flightTimes.hobbs_end) - (aircraft.current_hobbs || 0)

    setDisplayTimes({
      tachoTime: tachoTime > 0 ? tachoTime : 0,
      hobbsTime: hobbsTime > 0 ? hobbsTime : 0
    })
  }, [aircraft, flightTimes])

  // Update times display when inputs change
  useEffect(() => {
    calculateDisplayTimes()
  }, [flightTimes.tacho_end, flightTimes.hobbs_end, calculateDisplayTimes])

  const calculateCharges = useCallback(() => {
    if (!aircraft?.current_tacho || !flightTimes.tacho_end || !selectedRateId) return

    const tachoTime = parseFloat(flightTimes.tacho_end) - aircraft.current_tacho
    const hobbsTime = parseFloat(flightTimes.hobbs_end) - (aircraft.current_hobbs || 0)
    
    const selectedRate = currentAircraftRates.find(r => r.id === selectedRateId)
    if (!selectedRate) return

    const hourlyRate = selectedRate.rate
    const flightTime = aircraft.record_hobbs ? hobbsTime : tachoTime
    const estimatedCost = flightTime * hourlyRate

    setInvoiceItems([{
      id: 'flight-time',
      name: `Flight Time (${flightTime.toFixed(1)} hrs @ $${hourlyRate}/hr)`,
      amount: estimatedCost,
      type: 'Other Charges',
      quantity: 1,
      isFlightCharge: true
    }])
  }, [aircraft, flightTimes, selectedRateId, currentAircraftRates])

  // Calculate total including both invoice items and line items
  const totalAmount = [
    ...invoiceItems,
    ...lineItems.map(item => ({ ...item, amount: item.amount * item.quantity }))
  ].reduce((sum, item) => sum + item.amount, 0)

  // Update useEffect dependencies
  useEffect(() => {
    if (booking?.flight_type_id && currentAircraftRates.length) {
      const matchingRate = currentAircraftRates.find(
        rate => rate.flight_type?.id === booking.flight_type_id
      )
      if (matchingRate) {
        setSelectedRateId(matchingRate.id)
      }
    }
  }, [booking?.flight_type_id, currentAircraftRates])

  useEffect(() => {
    if (booking && aircraft) {
      console.log('Booking:', {
        tacho_start: booking.tacho_start,
        hobbs_start: booking.hobbs_start
      })
      console.log('Aircraft:', {
        current_tacho: aircraft.current_tacho,
        current_hobbs: aircraft.current_hobbs
      })
    }
  }, [booking, aircraft])

  const handleCompleteFlightAndSave = async () => {
    try {
      if (!booking || !aircraft) {
        console.error('No booking or aircraft found')
        return
      }

      // Validate only the required inputs
      if (!flightTimes.tacho_end || !flightTimes.hobbs_end) {
        console.error('Please enter both tacho and hobbs end readings')
        return
      }

      const newTacho = parseFloat(flightTimes.tacho_end)
      const newHobbs = parseFloat(flightTimes.hobbs_end)
      
      // Add null checks for current readings
      if (aircraft.current_tacho === null) {
        console.error('Current tacho reading not found')
        return
      }

      const currentTacho = aircraft.current_tacho
      const currentHobbs = aircraft.current_hobbs || 0

      // Validate readings are greater than current
      if (newTacho <= currentTacho || newHobbs <= currentHobbs) {
        console.error('End readings must be greater than start readings')
        return
      }

      // Calculate both time differences
      const tachoTime = newTacho - currentTacho
      const hobbsTime = newHobbs - currentHobbs

      // Determine which time to use based on aircraft settings
      const flightTime = aircraft.record_hobbs ? hobbsTime : tachoTime

      setIsSubmitting(true)

      // Update booking record first
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          tacho_end: newTacho,
          hobbs_end: newHobbs,
          flight_time: flightTime,
          status: 'complete'
        })
        .eq('id', booking.id)

      if (bookingError) throw bookingError

      // Update aircraft current readings
      const { error: aircraftError } = await supabase
        .from('aircraft')
        .update({
          current_tacho: newTacho,
          current_hobbs: newHobbs
        })
        .eq('id', aircraft.id)

      if (aircraftError) throw aircraftError

      // Format flight charges
      const formattedFlightCharges = invoiceItems.map(item => ({
        description: item.name,
        amount: item.amount,
        quantity: item.quantity,
        rate: currentAircraftRates.find(r => r.id === selectedRateId)?.rate || 0,
        hours: flightTime
      }))

      // Format additional charges
      const formattedAdditionalCharges = lineItems.map(item => ({
        id: item.id,
        description: item.name,
        amount: item.amount,
        quantity: item.quantity,
        type: item.type,
        total: item.amount * item.quantity
      }))

      // Create invoice record with line items
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          booking_id: booking.id,
          user_id: booking.user_id,
          total_amount: totalAmount,
          status: 'pending',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          ...(formattedFlightCharges.length > 0 && { flight_charges: formattedFlightCharges }),
          ...(formattedAdditionalCharges.length > 0 && { additional_charges: formattedAdditionalCharges })
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Still create invoice_chargeables records for tracking
      if (invoice && lineItems.length > 0) {
        const chargeableItems = lineItems.map(item => ({
          invoice_id: invoice.id,
          chargeable_id: item.id,
          quantity: item.quantity,
          amount: item.amount,
          charge_type: 'additional_charge',
          created_at: new Date().toISOString()
        }))

        const { error: chargeablesError } = await supabase
          .from('invoice_chargeables')
          .insert(chargeableItems)

        if (chargeablesError) throw chargeablesError
      }

      // Store invoice details but don't show modal
      setCreatedInvoiceId(invoice.id)
      setCreatedInvoiceNumber(invoice.invoice_number)
      setInvoiceAmount(invoice.total_amount)
      
      // Set flight as completed
      setIsFlightCompleted(true)
      
      toast.success('Flight completed and invoice created successfully', {
        description: 'All records have been updated.',
        duration: 4000,
      })
    } catch (error) {
      console.error('Error completing flight:', error)
      toast.error('Failed to complete flight', {
        description: 'Please try again.',
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading flight details...</div>
  }

  if (!booking || !aircraft) {
    return <div className="p-6">Flight not found</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {aircraft.registration}
            </h1>
            <Badge className="bg-blue-100 text-blue-800">
              Flight Details
            </Badge>
          </div>
          <div className="text-gray-500">
            <button
              type="button"
              onClick={() => navigate(`/members/${booking.user_id}`)}
              className={cn(
                "p-0 h-auto font-normal text-blue-600 hover:text-blue-800",
                "hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "rounded"
              )}
            >
              {booking.user ? getFullName(booking.user.first_name, booking.user.last_name) : 'Unknown Member'}
            </button>
          </div>
        </div>
        <Link to="/" className="text-gray-600 hover:text-gray-900">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left Column - Flight Info & Times */}
        <div className="col-span-3 space-y-6">
          {/* Flight Information */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Flight Information</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Member</label>
                <p className="mt-1 text-gray-900 font-medium">
                  {booking.user ? getFullName(booking.user.first_name, booking.user.last_name) : 'Unknown Member'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Instructor</label>
                <p className="mt-1 text-gray-900 font-medium">
                  {booking.instructor?.name || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Flight Type</label>
                <p className="mt-1 text-gray-900 font-medium">{booking.flight_type?.name}</p>
              </div>
            </div>
          </div>

          {/* Aircraft Times */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">Aircraft Times</h2>
              </div>
              <Button onClick={calculateCharges}>Calculate Charges</Button>
            </div>

            <div className="space-y-6">
              {/* Times Grid - Tacho and Hobbs side by side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Tacho Times */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Start Tacho</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {aircraft?.current_tacho?.toFixed(1) || '-'}
                      </p>
                    </div>
                    <div className="w-32">
                      <label className="text-sm font-medium text-gray-500">End Tacho</label>
                      <Input
                        name="tacho_end"
                        value={flightTimes.tacho_end}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-green-600 text-right">
                    Time: {displayTimes.tachoTime.toFixed(1)} hrs
                  </p>
                </div>

                {/* Hobbs Times */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Start Hobbs</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {aircraft?.current_hobbs?.toFixed(1) || '-'}
                      </p>
                    </div>
                    <div className="w-32">
                      <label className="text-sm font-medium text-gray-500">End Hobbs</label>
                      <Input
                        name="hobbs_end"
                        value={flightTimes.hobbs_end}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-green-600 text-right">
                    Time: {displayTimes.hobbsTime.toFixed(1)} hrs
                  </p>
                </div>
              </div>

              {/* Charge Rate Selector below both time inputs */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Charge Rate
                </label>
                <Select
                  value={selectedRateId}
                  onValueChange={(value: string) => setSelectedRateId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rate type" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentAircraftRates?.map((rate) => (
                      <SelectItem key={rate.id} value={rate.id}>
                        {rate.flight_type?.name} - ${rate.rate}/hr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Charge Selectors Section */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Additional Charges</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {chargeSections.map((section) => (
                <div key={section.type} className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">
                    {section.title}
                  </label>
                  <Select
                    onValueChange={(value: string) => {
                      const charge = chargeables.find((c: Chargeable) => c.id === value);
                      if (charge) {
                        setLineItems(prev => [...prev, {
                          id: charge.id,
                          name: charge.name,
                          amount: charge.amount,
                          type: charge.type,
                          quantity: 1
                        }]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${section.title}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {chargeablesByType[section.type]?.map((charge) => (
                        <SelectItem key={charge.id} value={charge.id}>
                          {charge.name} - ${charge.amount.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
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
              name="instructor_comments"
              value={flightTimes.instructor_comments}
              onChange={handleInputChange}
              placeholder="Enter detailed comments about the flight, student progress, or any notable events..."
              className="min-h-[120px]"
            />
          </div>
        </div>

        {/* Right Column - Invoicing */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Invoice Details</h2>
            </div>

            {/* Additional Charges Section */}
            <div className="space-y-4">
              {/* Line Items Table */}
              {lineItems.length > 0 && (
                <div className="border rounded-lg overflow-hidden mt-4">
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr className="text-xs font-medium text-gray-500 border-b">
                          <th className="px-3 py-2 text-left">Item</th>
                          <th className="px-2 py-2 text-center w-20">Qty</th>
                          <th className="px-2 py-2 text-right w-24">Price</th>
                          <th className="px-2 py-2 text-right w-24">Total</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {Object.entries(
                          lineItems.reduce((acc, item) => {
                            if (!acc[item.type]) acc[item.type] = [];
                            acc[item.type].push(item);
                            return acc;
                          }, {} as Record<ChargeableType, InvoiceItem[]>)
                        ).map(([type, items]) => (
                          <React.Fragment key={type}>
                            <tr className="bg-gray-50">
                              <td colSpan={5} className="px-3 py-2 text-xs font-medium text-gray-500">
                                {type}
                              </td>
                            </tr>
                            {items.map((item) => (
                              <tr key={item.id} className="text-sm hover:bg-gray-50">
                                <td className="px-3 py-2.5 font-medium">
                                  {item.name}
                                </td>
                                <td className="px-2 py-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const qty = parseInt(e.target.value) || 1;
                                      setLineItems(prev => prev.map(i => 
                                        i.id === item.id ? { ...i, quantity: qty } : i
                                      ));
                                    }}
                                    className="h-8 w-16 text-center mx-auto text-sm"
                                  />
                                </td>
                                <td className="px-2 py-2">
                                  <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.amount}
                                      onChange={(e) => {
                                        const amount = parseFloat(e.target.value) || 0;
                                        setLineItems(prev => prev.map(i => 
                                          i.id === item.id ? { ...i, amount } : i
                                        ));
                                      }}
                                      className="h-8 w-20 text-right text-sm pl-6"
                                    />
                                  </div>
                                </td>
                                <td className="px-2 py-2 text-right font-medium">
                                  ${(item.amount * item.quantity).toFixed(2)}
                                </td>
                                <td className="px-2 py-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setLineItems(prev => prev.filter(i => i.id !== item.id))}
                                    className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 border-t px-4 py-3">
                    <div className="flex justify-between items-center font-medium">
                      <span>Total Additional Charges</span>
                      <span className="text-lg">${lineItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Flight Time Section */}
              <div className="border-t pt-4 mt-4">
                {invoiceItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg mb-2">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm font-medium">${item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Save Button */}
              <div className="space-y-4">
                {!isFlightCompleted ? (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleCompleteFlightAndSave}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Completing...' : 'Complete Flight & Save'}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => setIsPaymentModalOpen(true)}
                      >
                        Add Payment
                      </Button>
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => setIsPaymentModalOpen(true)}
                      >
                        View Invoice
                      </Button>
                    </div>
                    <div className="text-sm text-gray-500 text-center">
                      Flight completed successfully. You can now add payment or download the invoice.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add the Flight Track Modal */}
      <FlightTrackModal 
        open={isFlightTrackOpen}
        onClose={() => setIsFlightTrackOpen(false)}
        registration={aircraft?.registration}
      />

      {/* Add the Debrief Modal */}
      <DebriefModal 
        isOpen={isDebriefOpen}
        onClose={() => setIsDebriefOpen(false)}
      />

      {/* Add the payment modal */}
      {createdInvoiceId && (
        <PaymentCollectionModal
          open={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          invoiceId={createdInvoiceId}
          invoiceNumber={createdInvoiceNumber!}
          totalAmount={invoiceAmount}
          onDownloadInvoice={() => setIsPaymentModalOpen(true)}
        />
      )}

      <Toaster richColors />
    </div>
  )
}

export default FlightDetailsPage

export {} 