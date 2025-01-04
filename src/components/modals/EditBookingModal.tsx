import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { format } from 'date-fns'
import type { BookingDetails } from "../../hooks/useBooking"
import { toast } from 'sonner'

interface EditBookingModalProps {
  booking: BookingDetails
  open: boolean
  onClose: () => void
}

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  is_staff: boolean
}

export function EditBookingModal({ booking, open, onClose }: EditBookingModalProps) {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [aircraft, setAircraft] = useState<any[]>([])
  const [instructors, setInstructors] = useState<User[]>([])
  const [flightTypes, setFlightTypes] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  
  const [formData, setFormData] = useState(() => ({
    user_id: booking.user_id || null,
    aircraft_id: booking.aircraft_id || "none",
    instructor_id: booking.instructor_id || "none",
    flight_type_id: booking.flight_type_id || "none",
    lesson_id: booking.lesson_id || "none",
    start_time: format(new Date(booking.start_time), "yyyy-MM-dd'T'HH:mm"),
    end_time: format(new Date(booking.end_time), "yyyy-MM-dd'T'HH:mm"),
    description: booking.description || "",
    route: booking.route || "",
  }))

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        user_id: booking.user_id || null,
        aircraft_id: booking.aircraft_id || "none",
        instructor_id: booking.instructor_id || "none",
        flight_type_id: booking.flight_type_id || "none",
        lesson_id: booking.lesson_id || "none",
        start_time: format(new Date(booking.start_time), "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(booking.end_time), "yyyy-MM-dd'T'HH:mm"),
        description: booking.description || "",
        route: booking.route || "",
      })

      // Reset search term for member
      if (booking.user) {
        setSearchTerm(`${booking.user.first_name} ${booking.user.last_name}`)
      } else {
        setSearchTerm("")
      }
    }
  }, [open, booking])

  // Handle modal close
  const handleClose = () => {
    setSearchResults([]) // Clear search results
    onClose()
  }

  // Fetch aircraft, instructors, and flight types on mount
  useEffect(() => {
    const fetchData = async () => {
      const [aircraftRes, instructorsRes, flightTypesRes, lessonsRes] = await Promise.all([
        supabase.from('aircraft').select('*').eq('status', 'Active'),
        supabase.from('users').select('*').eq('is_staff', true),
        supabase.from('flight_types').select('*'),
        supabase.from('lessons').select('*')
      ])

      if (aircraftRes.data) setAircraft(aircraftRes.data)
      if (instructorsRes.data) setInstructors(instructorsRes.data)
      if (flightTypesRes.data) setFlightTypes(flightTypesRes.data)
      if (lessonsRes.data) setLessons(lessonsRes.data)
    }

    fetchData()
  }, [])

  // Search users when typing
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    if (!term) {
      setFormData(prev => ({ ...prev, user_id: null }))
    }
    searchUsers(term)
  }

  const handleUserSelect = (user: User) => {
    setFormData(prev => ({ ...prev, user_id: user.id }))
    setSearchTerm(`${user.first_name} ${user.last_name}`)
    setSearchResults([])
  }

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          user_id: formData.user_id,
          aircraft_id: formData.aircraft_id === "none" ? null : formData.aircraft_id,
          instructor_id: formData.instructor_id === "none" ? null : formData.instructor_id,
          flight_type_id: formData.flight_type_id === "none" ? null : formData.flight_type_id,
          lesson_id: formData.lesson_id === "none" ? null : formData.lesson_id,
          start_time: formData.start_time,
          end_time: formData.end_time,
          description: formData.description || null,
          route: formData.route || null,
        })
        .eq('id', booking.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['booking', booking.id] })
      toast.success('Booking updated successfully')
      onClose()
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Failed to update booking')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Member Search */}
          <div className="space-y-2">
            <Label>Member (Optional)</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
              />
              
              {searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-md border shadow-lg max-h-[200px] overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-50 bg-white"
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

          {/* Two columns for selections */}
          <div className="grid grid-cols-2 gap-4">
            {/* Aircraft Selection */}
            <div className="space-y-2">
              <Label>Aircraft (Optional)</Label>
              <Select 
                value={formData.aircraft_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, aircraft_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select aircraft" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
                  <SelectItem value="none">No Aircraft</SelectItem>
                  {aircraft.map((ac) => (
                    <SelectItem key={ac.id} value={ac.id}>
                      {ac.registration} - {ac.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Instructor Selection */}
            <div className="space-y-2">
              <Label>Instructor (Optional)</Label>
              <Select 
                value={formData.instructor_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, instructor_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
                  <SelectItem value="none">No Instructor</SelectItem>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.first_name} {instructor.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Flight Type Selection */}
            <div className="space-y-2">
              <Label>Flight Type (Optional)</Label>
              <Select 
                value={formData.flight_type_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, flight_type_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select flight type" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
                  <SelectItem value="none">No Flight Type</SelectItem>
                  {flightTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lesson Selection */}
            <div className="space-y-2">
              <Label>Lesson (Optional)</Label>
              <Select 
                value={formData.lesson_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, lesson_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lesson" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
                  <SelectItem value="none">No Lesson</SelectItem>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date/Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
              />
            </div>
          </div>

          {/* Description and Route in one row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter booking description"
                className="h-[80px]" // Fixed height
              />
            </div>

            <div className="space-y-2">
              <Label>Route</Label>
              <Textarea
                value={formData.route}
                onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                placeholder="Enter flight route"
                className="h-[80px]" // Fixed height
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
} 