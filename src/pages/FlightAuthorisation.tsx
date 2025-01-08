import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { InfoIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip"

type CheckStatus = 'checked' | 'unchecked'

interface SoloSignoutForm {
  pilot_name: string
  pilot_address: string
  bfr_expiry: string
  medical_expiry: string
  route: string
  pax: string
  eta: string
  runway_in_use: string
  fuel: string
  oil_qty: string
  safe_endurance: string
  notams: CheckStatus
  weather: CheckStatus
  signature: string
  sign_date: string
  authorised_by?: string
  booking_id?: string
  user_id?: string
  status?: 'draft' | 'pending' | 'approved' | 'declined' | 'cancelled'
}

interface SoloSignoutSubmission extends Omit<SoloSignoutForm, 'safe_endurance'> {
  safe_endurance: number
  status: 'draft' | 'pending' | 'approved' | 'declined' | 'cancelled'
  authorised_by?: string
  booking_id?: string
  user_id?: string
}

interface StaffMember {
  id: string
  first_name: string
  last_name: string
}

export default function FlightAuthorisation() {
  const navigate = useNavigate()
  const { bookingId } = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  
  const [form, setForm] = useState<SoloSignoutForm>({
    pilot_name: '',
    pilot_address: '',
    bfr_expiry: '',
    medical_expiry: '',
    route: '',
    pax: '',
    eta: '',
    runway_in_use: '',
    fuel: '',
    oil_qty: '',
    safe_endurance: '',
    notams: 'unchecked',
    weather: 'unchecked',
    signature: '',
    sign_date: format(new Date(), 'yyyy-MM-dd'),
    authorised_by: ''
  })

  useEffect(() => {
    async function fetchStaffMembers() {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('is_staff', true)
        .order('first_name')

      if (error) {
        console.error('Error fetching staff:', error)
        return
      }

      setStaffMembers(data || [])
    }

    fetchStaffMembers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const [hours, minutes] = form.safe_endurance.split(':').map(Number);
      const safeEnduranceMinutes = (hours * 60) + minutes;

      const submissionData: Partial<SoloSignoutSubmission> = {
        pilot_name: form.pilot_name,
        pilot_address: form.pilot_address,
        bfr_expiry: form.bfr_expiry,
        medical_expiry: form.medical_expiry,
        route: form.route,
        pax: form.pax,
        eta: form.eta,
        runway_in_use: form.runway_in_use,
        fuel: form.fuel,
        oil_qty: form.oil_qty,
        safe_endurance: safeEnduranceMinutes,
        notams: form.notams,
        weather: form.weather,
        signature: form.signature,
        sign_date: form.sign_date,
        status: 'pending'
      }

      if (form.authorised_by) {
        submissionData.authorised_by = form.authorised_by
      }

      if (bookingId) {
        submissionData.booking_id = bookingId
      }

      const { data, error } = await supabase
        .from('solosignout_form')
        .insert([submissionData])
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to create flight authorisation')

      console.log('Flight authorisation created:', data)
      toast.success('Flight authorisation submitted successfully')
      navigate('/bookings')
    } catch (error: any) {
      console.error('Error creating flight authorisation:', error)
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
            <CardTitle className="text-2xl">Solo Flight Authorisation</CardTitle>
            <CardDescription className="text-gray-100">
              Please complete all fields before your solo flight
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Pilot Details Section */}
              <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Pilot Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pilot_name">Name</Label>
                    <Input
                      id="pilot_name"
                      placeholder="John Smith"
                      value={form.pilot_name}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        pilot_name: e.target.value
                      }))}
                      className="focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pilot_address">Address</Label>
                    <Input
                      id="pilot_address"
                      placeholder="123 Aviation Street, City"
                      value={form.pilot_address}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        pilot_address: e.target.value
                      }))}
                      className="focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bfr_expiry">BFR Expiry</Label>
                    <Input
                      id="bfr_expiry"
                      type="date"
                      value={form.bfr_expiry}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        bfr_expiry: e.target.value
                      }))}
                      className="focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medical_expiry">Medical Expiry</Label>
                    <Input
                      id="medical_expiry"
                      type="date"
                      value={form.medical_expiry}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        medical_expiry: e.target.value
                      }))}
                      className="focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Flight Details Section */}
              <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Flight Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="route">Route</Label>
                    <Input
                      id="route"
                      placeholder="NZNE - NZAR - NZNE"
                      value={form.route}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        route: e.target.value
                      }))}
                      className="focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pax">PAX</Label>
                    <Input
                      id="pax"
                      placeholder="Solo"
                      value={form.pax}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        pax: e.target.value
                      }))}
                      className="focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eta">ETA</Label>
                    <Input
                      id="eta"
                      type="time"
                      value={form.eta}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        eta: e.target.value
                      }))}
                      className="focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Checklist Section */}
              <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Checklist</h3>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left Side - Input Fields */}
                  <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4 max-w-md">
                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="runway_in_use">Runway in Use</Label>
                      <Input
                        id="runway_in_use"
                        placeholder="07/25"
                        value={form.runway_in_use}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          runway_in_use: e.target.value
                        }))}
                        className="focus:ring-2 focus:ring-purple-500 w-32"
                        required
                      />
                    </div>

                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="fuel">Fuel</Label>
                      <Input
                        id="fuel"
                        placeholder="80L"
                        value={form.fuel}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          fuel: e.target.value
                        }))}
                        className="focus:ring-2 focus:ring-purple-500 w-32"
                        required
                      />
                    </div>

                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="oil_qty">Oil Quantity</Label>
                      <Input
                        id="oil_qty"
                        placeholder="6 Qts"
                        value={form.oil_qty}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          oil_qty: e.target.value
                        }))}
                        className="focus:ring-2 focus:ring-purple-500 w-32"
                        required
                      />
                    </div>

                    <div className="space-y-2 col-span-1">
                      <Label htmlFor="safe_endurance">Safe Endurance</Label>
                      <Input
                        id="safe_endurance"
                        placeholder="HH:mm"
                        value={form.safe_endurance}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 5) {
                            setForm(prev => ({
                              ...prev,
                              safe_endurance: value
                            }));
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value && !/^([0-9]{1,2}:[0-5][0-9])$/.test(value)) {
                            toast.error('Please enter time in HH:mm format (e.g., 03:30)');
                          }
                        }}
                        className="focus:ring-2 focus:ring-purple-500 w-32"
                        required
                      />
                      <p className="text-xs text-gray-500">Format: 03:30 (3h 30m)</p>
                    </div>
                  </div>

                  {/* Right Side - Radio Buttons */}
                  <div className="flex flex-row md:flex-col gap-6 flex-1">
                    <div className="bg-gray-50/80 rounded-lg border border-gray-100 p-4 flex-1">
                      <Label className="mb-3 block font-medium">NOTAMs Checked</Label>
                      <RadioGroup
                        value={form.notams}
                        onValueChange={(value) => setForm(prev => ({
                          ...prev,
                          notams: value as CheckStatus
                        }))}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="checked" 
                            id="notams-checked"
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <Label htmlFor="notams-checked" className="cursor-pointer">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="unchecked" 
                            id="notams-unchecked"
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <Label htmlFor="notams-unchecked" className="cursor-pointer">No</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="bg-gray-50/80 rounded-lg border border-gray-100 p-4 flex-1">
                      <Label className="mb-3 block font-medium">Weather Checked</Label>
                      <RadioGroup
                        value={form.weather}
                        onValueChange={(value) => setForm(prev => ({
                          ...prev,
                          weather: value as CheckStatus
                        }))}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="checked" 
                            id="weather-checked"
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <Label htmlFor="weather-checked" className="cursor-pointer">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="unchecked" 
                            id="weather-unchecked"
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <Label htmlFor="weather-unchecked" className="cursor-pointer">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Section */}
              <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Authorisation</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="signature">Signature</Label>
                    <Input
                      id="signature"
                      placeholder="Type your full name"
                      value={form.signature}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        signature: e.target.value
                      }))}
                      className="focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sign_date">Date</Label>
                    <Input
                      id="sign_date"
                      type="date"
                      value={form.sign_date}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        sign_date: e.target.value
                      }))}
                      className="focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="authorised_by">Instructor</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Instructor authorising the flight</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select
                      value={form.authorised_by}
                      onValueChange={(value) => setForm(prev => ({
                        ...prev,
                        authorised_by: value
                      }))}
                      required
                    >
                      <SelectTrigger className="w-full focus:ring-2 focus:ring-amber-500">
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {staffMembers.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.first_name} {staff.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="w-32"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-32 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Form'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 