import { useState, useEffect } from "react"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { setHours, setMinutes, addHours, format } from "date-fns"
import { CalendarIcon, AlertCircle } from "lucide-react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"
import { sendBookingConfirmation } from "../../lib/resend"
import { validateVoucher } from "../../data/vouchers"
import { cn } from "../../lib/utils"

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

interface EmailBookingData {
  memberName: string;
  memberEmail: string;
  bookingDate: string;
  aircraftReg: string;
  instructorName?: string;
  startTime: string;
  endTime: string;
  flightType: string;
}

// Add this interface
interface SelectedUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

// Add these interfaces at the top with your other interfaces
interface Aircraft {
  id: string;
  registration: string;
  prioritise?: boolean;
}

interface Instructor {
  id: string;
  name: string;
}

// Inside your component, add this interface for trial booking state
interface TrialBookingState {
  startTime: Date;
  endTime: Date;
  aircraftId: string;
  instructorId: string;
  flightTypeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  voucherNumber: string;
  description: string;
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
  const [trialBooking, setTrialBooking] = useState<TrialBookingState>({
    startTime: setMinutes(setHours(new Date(), 9), 0),
    endTime: setMinutes(setHours(new Date(), 11), 0),
    aircraftId: '',
    instructorId: '',
    flightTypeId: '4ae631ab-4081-4d1d-869d-9c5e6be7b2cb',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    voucherNumber: '',
    description: ''
  });

  // Add these new states at the top of your component
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Fetch aircraft
  const { data: aircraft } = useQuery({
    queryKey: ['aircraft'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aircraft')
        .select('id, registration, prioritise')
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

  // Add selected user state
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  
  // Update the handleUserSelect function
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setMemberBooking(prev => ({
      ...prev,
      memberId: user.id
    }));
    setSearchTerm(`${user.first_name} ${user.last_name}`);
    setSearchResults([]);
  };

  // Update the handleMemberBookingSubmit function
  const handleMemberBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!memberBooking.aircraftId || !memberBooking.memberId || !selectedUser) {
      toast.error('Please select both member and aircraft')
      return
    }

    setIsLoading(true)

    try {
      const supabaseBookingData = {
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

      const { data, error } = await supabase
        .from('bookings')
        .insert([supabaseBookingData])
        .select()

      if (error) throw error
      console.log('Created booking:', data)

      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      
      // Use selectedUser instead of searching through searchResults
      const emailData: EmailBookingData = {
        memberName: `${selectedUser.first_name} ${selectedUser.last_name}`,
        memberEmail: 'callum.soutar@me.com', // Hardcoded for development
        bookingDate: memberBooking.startTime.toISOString(),
        aircraftReg: aircraft?.find((a: Aircraft) => a.id === memberBooking.aircraftId)?.registration || '',
        instructorName: instructors?.find((i: Instructor) => i.id === memberBooking.instructorId)?.name,
        startTime: format(memberBooking.startTime, 'HH:mm'),
        endTime: format(memberBooking.endTime, 'HH:mm'),
        flightType: flightTypes?.find((t: FlightType) => t.id === memberBooking.flightTypeId)?.name || ''
      };
      
      console.log('Attempting to send email with data:', emailData);
      const emailResult = await sendBookingConfirmation(emailData);
      console.log('Email send result:', emailResult);

      if (!emailResult.success) {
        throw new Error('Failed to send confirmation email');
      }

      toast.success('Booking successfully created');
      onClose();

    } catch (error) {
      console.error('Error in handleMemberBookingSubmit:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsLoading(false)
    }
  }

  const handleTrialFlightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!trialBooking.firstName || !trialBooking.lastName) {
        toast.error('First name and last name are required');
        return;
      }

      // Generate a user number (you might want to adjust this format)
      const timestamp = Date.now().toString().slice(-6);
      const userNumber = `TF${timestamp}`;

      // First, create the user record with the correct fields
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          first_name: trialBooking.firstName,
          last_name: trialBooking.lastName,
          name: `${trialBooking.firstName} ${trialBooking.lastName}`,
          email: trialBooking.email,
          user_number: userNumber,
          status: 'Inactive',
          join_date: new Date().toISOString(),
          phone: trialBooking.phone || null,
          is_member: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (userError) {
        console.error('User creation error:', userError);
        throw new Error('Failed to create user record');
      }
      
      if (!newUser) throw new Error('Failed to create user');

      // Then, create the booking record
      const bookingData = {
        user_id: newUser.id,
        aircraft_id: trialBooking.aircraftId,
        instructor_id: trialBooking.instructorId,
        start_time: trialBooking.startTime.toISOString(),
        end_time: trialBooking.endTime.toISOString(),
        flight_type_id: trialBooking.flightTypeId,
        description: trialBooking.description,
        status: 'confirmed',
        voucher: trialBooking.voucherNumber || null,
        created_at: new Date().toISOString()
      };

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (bookingError) {
        console.error('Booking creation error:', bookingError);
        throw new Error('Failed to create booking record');
      }

      // Success! Invalidate queries and close modal
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Trial flight booking created successfully');
      onClose();

    } catch (error) {
      console.error('Error creating trial booking:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create trial booking');
    } finally {
      setIsLoading(false);
    }
  };

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

  // Reset selected user when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedUser(null);
      setSearchTerm('');
      setSearchResults([]);
      setMemberBooking(prev => ({
        ...prev,
        memberId: ''
      }));
      setTrialBooking(prev => ({
        ...prev,
        startTime: setMinutes(setHours(new Date(), 9), 0),
        endTime: setMinutes(setHours(new Date(), 11), 0),
        flightTypeId: '4ae631ab-4081-4d1d-869d-9c5e6be7b2cb'
      }));
    }
  }, [open]);

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
                    <Select value={memberBooking.instructorId} onValueChange={(value: string) => setMemberBooking(prev => ({ ...prev, instructorId: value }))} >
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
                    <Select value={memberBooking.aircraftId} onValueChange={(value: string) => setMemberBooking(prev => ({ ...prev, aircraftId: value }))} >
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
                            <div className="flex items-center gap-2">
                              <span>{a.registration}</span>
                              {a.prioritise && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <AlertCircle className="h-4 w-4 text-red-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Please prioritise scheduling this aircraft</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Flight Type</Label>
                    <Select value={memberBooking.flightTypeId} onValueChange={(value: string) => setMemberBooking(prev => ({ ...prev, flightTypeId: value }))} >
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
                  <Select value={memberBooking.lessonId} onValueChange={(value: string) => setMemberBooking(prev => ({ ...prev, lessonId: value }))} >
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
              <div className="space-y-6">
                {/* Date and Time Section */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  <h3 className="font-medium text-sm text-gray-700">Date & Time</h3>
                  
                  {/* Start Date/Time Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Start Date</Label>
                      <div className="relative">
                        <DatePicker
                          selected={trialBooking.startTime}
                          onChange={(date) => {
                            if (date) {
                              setTrialBooking(prev => ({
                                ...prev,
                                startTime: date,
                                endTime: addHours(date, 1)
                              }));
                            }
                          }}
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
                        value={format(trialBooking.startTime, 'HH:mm')}
                        onValueChange={(value: string) => {
                          const [hours, minutes] = value.split(':').map(Number);
                          const newStartTime = setMinutes(setHours(trialBooking.startTime, hours), minutes);
                          setTrialBooking(prev => ({
                            ...prev,
                            startTime: newStartTime,
                            endTime: addHours(newStartTime, 1)
                          }));
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
                          selected={trialBooking.endTime}
                          onChange={(date) => {
                            if (date) {
                              setTrialBooking(prev => ({
                                ...prev,
                                endTime: date
                              }));
                            }
                          }}
                          dateFormat="dd MMM yyyy"
                          className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm"
                          minDate={trialBooking.startTime}
                        />
                        <CalendarIcon className="absolute right-2 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm">End Time</Label>
                      <Select
                        value={format(trialBooking.endTime, 'HH:mm')}
                        onValueChange={(value: string) => {
                          const [hours, minutes] = value.split(':').map(Number);
                          const newEndTime = setMinutes(setHours(trialBooking.endTime, hours), minutes);
                          setTrialBooking(prev => ({
                            ...prev,
                            endTime: newEndTime
                          }));
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
                              trialBooking.startTime.getTime() !== trialBooking.endTime.getTime() || 
                              time > format(trialBooking.startTime, 'HH:mm')
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

                {/* Flight Details Section */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  <h3 className="font-medium text-sm text-gray-700">Flight Details</h3>
                  
                  <div className="space-y-3">
                    {/* Aircraft and Instructor on same row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">Aircraft</Label>
                        <Select
                          value={trialBooking.aircraftId}
                          onValueChange={(value) => setTrialBooking(prev => ({ ...prev, aircraftId: value }))}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select aircraft" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {aircraft?.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.registration}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-sm">Instructor</Label>
                        <Select
                          value={trialBooking.instructorId}
                          onValueChange={(value) => setTrialBooking(prev => ({ ...prev, instructorId: value }))}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Select instructor" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {instructors?.map((instructor) => (
                              <SelectItem key={instructor.id} value={instructor.id}>
                                {instructor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Flight Type remains full width */}
                    <div className="space-y-1.5">
                      <Label className="text-sm">Flight Type</Label>
                      <Select
                        value={trialBooking.flightTypeId}
                        onValueChange={(value) => setTrialBooking(prev => ({ ...prev, flightTypeId: value }))}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select flight type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {flightTypes?.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Contact Details Section */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                  <h3 className="font-medium text-sm text-gray-700">Contact Details</h3>
                  
                  <div className="space-y-3">
                    {/* First Name and Last Name row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">First Name</Label>
                        <Input
                          value={trialBooking.firstName}
                          onChange={(e) => setTrialBooking(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="Enter first name"
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Last Name</Label>
                        <Input
                          value={trialBooking.lastName}
                          onChange={(e) => setTrialBooking(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Enter last name"
                          className="bg-white"
                        />
                      </div>
                    </div>

                    {/* Email and Phone row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">Email</Label>
                        <Input
                          type="email"
                          value={trialBooking.email}
                          onChange={(e) => setTrialBooking(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email address"
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Phone</Label>
                        <Input
                          value={trialBooking.phone}
                          onChange={(e) => setTrialBooking(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                          className="bg-white"
                        />
                      </div>
                    </div>

                    {/* Voucher Number with Validate button */}
                    <div className="space-y-1.5">
                      <Label className="text-sm">Voucher Number</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            value={trialBooking.voucherNumber}
                            onChange={(e) => {
                              setTrialBooking(prev => ({ ...prev, voucherNumber: e.target.value }));
                              setValidationStatus('idle'); // Reset status on input change
                            }}
                            placeholder="Enter voucher number (optional)"
                            className={cn(
                              "bg-white pr-10",
                              validationStatus === 'success' && "border-green-500",
                              validationStatus === 'error' && "border-red-500"
                            )}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {validationStatus === 'loading' && (
                              <svg 
                                className="animate-spin h-5 w-5 text-blue-500" 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24"
                              >
                                <circle 
                                  className="opacity-25" 
                                  cx="12" 
                                  cy="12" 
                                  r="10" 
                                  stroke="currentColor" 
                                  strokeWidth="4"
                                />
                                <path 
                                  className="opacity-75" 
                                  fill="currentColor" 
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                            )}
                            {validationStatus === 'success' && (
                              <svg
                                className="h-5 w-5 text-green-500 animate-check"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                            {validationStatus === 'error' && (
                              <svg
                                className="h-5 w-5 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                        <Button 
                          type="button"
                          variant="outline"
                          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                          disabled={isValidating}
                          onClick={async () => {
                            if (!trialBooking.voucherNumber) {
                              toast.error("Please enter a voucher number");
                              return;
                            }

                            setIsValidating(true);
                            setValidationStatus('loading');

                            // Simulate a slight delay for better UX
                            await new Promise(resolve => setTimeout(resolve, 800));

                            const result = validateVoucher(trialBooking.voucherNumber);
                            
                            if (result.valid) {
                              setValidationStatus('success');
                              toast.success(result.message);
                            } else {
                              setValidationStatus('error');
                              toast.error(result.message);
                            }

                            setIsValidating(false);
                          }}
                        >
                          Validate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Description</Label>
                  <Textarea
                    value={trialBooking.description}
                    onChange={(e) => setTrialBooking(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add any additional notes..."
                    className="h-20 bg-white"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                    {isLoading ? "Saving..." : "Save & Confirm"}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 