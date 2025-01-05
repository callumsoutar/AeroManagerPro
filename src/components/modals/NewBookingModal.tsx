import { useState, useEffect } from "react"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { setHours, setMinutes, addHours } from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Input } from "../ui/input"
import { toast } from 'sonner'

interface NewBookingModalProps {
  open: boolean
  onClose: () => void
}

interface FlightType {
  id: string
  name: string
  description: string | null
}


// Add to your interfaces
interface Lesson {
  id: string
  name: string
  description: string | null
}

// Add this helper function with proper typing
function generateTimeOptions(): string[] {
  const times: string[] = []
  for (let hour = 6; hour <= 20; hour++) {  // 6 AM to 8 PM
    times.push(`${hour.toString().padStart(2, '0')}:00`)
    times.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  return times
}

// Fix the onChange type for Textarea
interface TextareaChangeEvent extends React.ChangeEvent<HTMLTextAreaElement> {
  target: HTMLTextAreaElement
}

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  is_staff: boolean
}

export function NewBookingModal({ open, onClose }: NewBookingModalProps) {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])

  // Member booking state
  const [memberBooking, setMemberBooking] = useState({
    memberId: '',
    aircraftId: '',
    instructorId: '',
    startTime: new Date(),
    endTime: addHours(new Date(), 2),
    flightTypeId: '',
    lessonId: '',
    description: ''
  })

  // Trial flight state
  const [trialBooking] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    aircraftId: '',
    instructorId: '',
    startTime: '',
    endTime: ''
  })

  // Fetch aircraft
  const { data: aircraft } = useQuery({
    queryKey: ['aircraft'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aircraft')
        .select('id, registration')
        .eq('status', 'Active')
      if (error) throw error
      return data
    }
  })

  // Fetch instructors
  const { data: instructors } = useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('is_staff', true)
        .order('last_name')
      
      if (error) throw error
      return data?.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`
      })) || []
    }
  })

  // Add flight types query
  const { data: flightTypes } = useQuery({
    queryKey: ['flight-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flight_types')
        .select('id, name, description')
        .order('name')
      
      if (error) throw error
      return data as FlightType[]
    }
  })

  // Add lessons query
  const { data: lessons } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, name, description')
        .order('name')
      
      if (error) throw error
      return data as Lesson[]
    }
  })

  // Initialize timeOptions at component level
  const timeOptions: string[] = generateTimeOptions()

  // Split the datetime into separate date and time states for better UX
  const [dateTimeState, setDateTimeState] = useState({
    startDate: new Date(),
    startTime: "09:00",
    endDate: new Date(),
    endTime: "11:00"
  })

  // Helper to combine date and time into a full DateTime
  const combineDateAndTime = (date: Date, timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return setMinutes(setHours(new Date(date), hours), minutes)
  }

  // Update memberBooking when dateTimeState changes
  useEffect(() => {
    setMemberBooking(prev => ({
      ...prev,
      startTime: combineDateAndTime(dateTimeState.startDate, dateTimeState.startTime),
      endTime: combineDateAndTime(dateTimeState.endDate, dateTimeState.endTime)
    }))
  }, [dateTimeState])

  // Handle start date change
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setDateTimeState(prev => ({
        ...prev,
        startDate: date,
        endDate: date  // Automatically set end date to match start date
      }))
    }
  }

  const handleMemberBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!memberBooking.aircraftId) {
      console.error('Missing required fields')
      return
    }

    setIsLoading(true)

    try {
      const bookingData = {
        user_id: memberBooking.memberId,
        aircraft_id: memberBooking.aircraftId,
        instructor_id: memberBooking.instructorId || null,
        start_time: memberBooking.startTime.toISOString(),
        end_time: memberBooking.endTime.toISOString(),
        flight_type_id: memberBooking.flightTypeId,
        lesson_id: memberBooking.lessonId || null,
        description: memberBooking.description || null,
        status: 'confirmed' as const
      }

      console.log('Submitting booking data:', bookingData)

      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()

      if (error) {
        console.error('Error creating booking:', error)
        throw error
      }

      console.log('Booking created:', data)
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking successfully created')
      onClose()
    } catch (error) {
      console.error('Error in handleMemberBookingSubmit:', error)
      toast.error('Failed to create booking')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTrialFlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: trialFlightType } = await supabase
        .from('flight_types')
        .select('id')
        .eq('name', 'Trial Flight')
        .single()

      if (!trialFlightType) {
        throw new Error('Trial flight type not found')
      }

      const bookingData = {
        customer_name: trialBooking.customerName,
        customer_email: trialBooking.customerEmail,
        customer_phone: trialBooking.customerPhone,
        aircraft_id: trialBooking.aircraftId,
        instructor_id: trialBooking.instructorId,
        start_time: trialBooking.startTime,
        end_time: trialBooking.endTime,
        flight_type_id: trialFlightType.id,
        status: 'confirmed' as const
      }

      const { error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Booking successfully created')
      onClose()
    } catch (error) {
      console.error('Error creating trial booking:', error)
      toast.error('Failed to create trial booking')
    } finally {
      setIsLoading(false)
    }
  }

  // Add this function to search users
  const searchUsers = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([])
      return
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, is_staff')
      .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`)
      .order('last_name')
      .limit(10)

    if (!error && data) {
      setSearchResults(data)
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    searchUsers(term)
  }

  // Handle user selection
  const handleUserSelect = (user: User) => {
    setMemberBooking(prev => ({ ...prev, memberId: user.id }))
    setSearchTerm(`${user.first_name} ${user.last_name}`)
    setSearchResults([])
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle>New Booking</DialogTitle>
          <DialogDescription>
            Create a new booking for a member or trial flight
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="member">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="member">Member Booking</TabsTrigger>
            <TabsTrigger value="trial">Trial Flight</TabsTrigger>
          </TabsList>

          <TabsContent value="member">
            <form onSubmit={handleMemberBookingSubmit} className="space-y-4">
              {/* Date/Time Section */}
              <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                <h3 className="font-medium text-sm text-gray-700">Date & Time</h3>
                
                {/* Start Date/Time Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Start Date</Label>
                    <div className="relative">
                      <DatePicker
                        selected={dateTimeState.startDate}
                        onChange={handleStartDateChange}
                        dateFormat="dd MMM yyyy"
                        className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm"
                        minDate={new Date()}
                      />
                      <CalendarIcon className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Start Time</Label>
                    <Select
                      value={dateTimeState.startTime}
                      onValueChange={(value: string) => {
                        setDateTimeState(prev => ({
                          ...prev,
                          startTime: value,
                          endTime: prev.endTime < value ? 
                            timeOptions[timeOptions.indexOf(value) + 4] || prev.endTime : 
                            prev.endTime
                        }))
                      }}
                    >
                      <SelectTrigger className="h-9 bg-white">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent 
                        className="bg-white max-h-[200px] overflow-y-auto"
                        position="popper"
                        sideOffset={4}
                      >
                        {timeOptions.map((time: string) => (
                          <SelectItem 
                            key={time} 
                            value={time}
                            className="hover:bg-gray-100"
                          >
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* End Date/Time Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">End Date</Label>
                    <div className="relative">
                      <DatePicker
                        selected={dateTimeState.endDate}
                        onChange={(date: Date | null) => {
                          if (date) {
                            setDateTimeState(prev => ({
                              ...prev,
                              endDate: date
                            }))
                          }
                        }}
                        dateFormat="dd MMM yyyy"
                        className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm"
                        minDate={dateTimeState.startDate}
                      />
                      <CalendarIcon className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">End Time</Label>
                    <Select
                      value={dateTimeState.endTime}
                      onValueChange={(value: string) => {
                        setDateTimeState(prev => ({
                          ...prev,
                          endTime: value
                        }))
                      }}
                    >
                      <SelectTrigger className="h-9 bg-white">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent 
                        className="bg-white max-h-[200px] overflow-y-auto"
                        position="popper"
                        sideOffset={4}
                      >
                        {timeOptions
                          .filter((time: string) => 
                            dateTimeState.startDate.getTime() !== dateTimeState.endDate.getTime() || 
                            time > dateTimeState.startTime
                          )
                          .map((time: string) => (
                            <SelectItem 
                              key={time} 
                              value={time}
                              className="hover:bg-gray-100"
                            >
                              {time}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Booking Details Section */}
              <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                <h3 className="font-medium text-sm text-gray-700">Booking Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Member</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Type to search members..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full h-9"
                      />
                      
                      {searchResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white rounded-md border shadow-lg max-h-[300px] overflow-y-auto">
                          {searchResults.map((user) => (
                            <div
                              key={user.id}
                              className="px-4 py-3 cursor-pointer hover:bg-gray-50"
                              onClick={() => handleUserSelect(user)}
                            >
                              <div className="font-medium">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Instructor</Label>
                    <Select value={memberBooking.instructorId} onValueChange={(value) => setMemberBooking(prev => ({ ...prev, instructorId: value }))} >
                      <SelectTrigger className="h-9 bg-white">
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {instructors?.map((instructor) => (
                          <SelectItem 
                            key={instructor.id} 
                            value={instructor.id}
                            className="hover:bg-gray-100"
                          >
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Aircraft</Label>
                    <Select value={memberBooking.aircraftId} onValueChange={(value) => setMemberBooking(prev => ({ ...prev, aircraftId: value }))} >
                      <SelectTrigger className="h-9 bg-white">
                        <SelectValue placeholder="Select aircraft" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {aircraft?.map((a) => (
                          <SelectItem 
                            key={a.id} 
                            value={a.id}
                            className="hover:bg-gray-100"
                          >
                            {a.registration}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Flight Type</Label>
                    <Select value={memberBooking.flightTypeId} onValueChange={(value) => setMemberBooking(prev => ({ ...prev, flightTypeId: value }))} >
                      <SelectTrigger className="h-9 bg-white">
                        <SelectValue placeholder="Select flight type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {flightTypes?.map((type) => (
                          <SelectItem 
                            key={type.id} 
                            value={type.id}
                            className="hover:bg-gray-100"
                          >
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Lesson (Optional)</Label>
                  <Select value={memberBooking.lessonId} onValueChange={(value) => setMemberBooking(prev => ({ ...prev, lessonId: value }))} >
                    <SelectTrigger className="h-9 bg-white">
                      <SelectValue placeholder="Select lesson" />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-white max-h-[200px] overflow-y-auto"
                      position="popper"
                      sideOffset={4}
                    >
                      {lessons?.map((lesson) => (
                        <SelectItem 
                          key={lesson.id} 
                          value={lesson.id}
                          className="hover:bg-gray-100"
                        >
                          {lesson.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Description</Label>
                  <Textarea
                    placeholder="Add any additional notes"
                    className="bg-white resize-none h-16"
                    value={memberBooking.description}
                    onChange={(e: TextareaChangeEvent) => setMemberBooking(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                >
                  Cancel
                </Button>
                
                <Button 
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    // No action for now
                    console.log('Save clicked')
                  }}
                >
                  Save
                </Button>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? "Saving..." : "Save & Confirm"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="trial">
            <form onSubmit={handleTrialFlightSubmit}>
              {/* Add trial flight form fields similar to member booking */}
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 