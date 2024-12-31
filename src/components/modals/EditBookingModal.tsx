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
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { X } from "lucide-react"
import { BookingDetails } from "../../hooks/useBooking"
import { getFullName } from "../../lib/utils"
import { format } from "date-fns"
import { generateTimeOptions } from "../../lib/utils"

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
  const [instructors, setInstructors] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    user_id: booking.user_id,
    aircraft_id: booking.aircraft_id,
    instructor_id: booking.instructor_id || "none",
    flight_type_id: booking.flight_type_id,
    description: booking.description || "",
    route: booking.route || "",
    eta: booking.eta || "",
    start_date: format(new Date(booking.start_time), "yyyy-MM-dd"),
    start_time: format(new Date(booking.start_time), "HH:mm"),
    end_date: format(new Date(booking.end_time), "yyyy-MM-dd"),
    end_time: format(new Date(booking.end_time), "HH:mm"),
    lesson_id: booking.lesson_id || "none",
  })

  // Fetch instructors
  useEffect(() => {
    async function fetchInstructors() {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, is_staff')
        .eq('is_staff', true)

      if (!error && data) {
        setInstructors(data as User[])
      }
    }

    if (open) {
      fetchInstructors()
    }
  }, [open])

  // Search users
  useEffect(() => {
    async function searchUsers() {
      if (searchTerm.length < 2) {
        setSearchResults([])
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, is_staff')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(5)

      if (!error && data) {
        setSearchResults(data as User[])
      }
    }

    const timeoutId = setTimeout(searchUsers, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Load initial selected user
  useEffect(() => {
    if (booking.user) {
      setSelectedUser({
        id: booking.user.id,
        first_name: booking.user.first_name,
        last_name: booking.user.last_name,
        email: booking.user.email,
        is_staff: false
      })
    }
  }, [booking])

  // Fetch flight types
  const [flightTypes, setFlightTypes] = useState<Array<{ id: string, name: string }>>([])
  
  useEffect(() => {
    async function fetchFlightTypes() {
      const { data, error } = await supabase
        .from('flight_types')
        .select('id, name')

      if (!error && data) {
        setFlightTypes(data)
      }
    }

    if (open) {
      fetchFlightTypes()
    }
  }, [open])

  // Add lessons fetch
  const [lessonSearch, setLessonSearch] = useState("")
  const [lessonResults, setLessonResults] = useState<Array<{ id: string, name: string }>>([])
  const [selectedLesson, setSelectedLesson] = useState<{ id: string, name: string } | null>(
    booking.lesson_id ? { id: booking.lesson_id, name: booking.lesson?.name || "" } : null
  )

  useEffect(() => {
    async function searchLessons() {
      if (lessonSearch.length < 2) {
        setLessonResults([])
        return
      }

      const { data, error } = await supabase
        .from('lessons')
        .select('id, name')
        .ilike('name', `%${lessonSearch}%`)
        .limit(5)

      if (!error && data) {
        setLessonResults(data)
      }
    }

    const timeoutId = setTimeout(searchLessons, 300)
    return () => clearTimeout(timeoutId)
  }, [lessonSearch])

  const timeOptions = generateTimeOptions()

  // Add to existing state declarations
  const [aircraft, setAircraft] = useState<Array<{
    id: string
    registration: string
    type: string
  }>>([])

  // Add this useEffect to fetch aircraft
  useEffect(() => {
    async function fetchAircraft() {
      const { data, error } = await supabase
        .from('aircraft')
        .select('id, registration, type')
        .order('registration')

      if (!error && data) {
        setAircraft(data)
      }
    }

    if (open) {
      fetchAircraft()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const startDateTime = `${formData.start_date}T${formData.start_time}:00`
      const endDateTime = `${formData.end_date}T${formData.end_time}:00`

      const { error } = await supabase
        .from('bookings')
        .update({
          aircraft_id: formData.aircraft_id,
          user_id: formData.user_id,
          instructor_id: formData.instructor_id === "none" ? null : formData.instructor_id,
          flight_type_id: formData.flight_type_id,
          description: formData.description,
          route: formData.route,
          eta: formData.eta || null,
          start_time: startDateTime,
          end_time: endDateTime,
          lesson_id: formData.lesson_id === "none" ? null : formData.lesson_id,
        })
        .eq('id', booking.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['booking', booking.id] })
      onClose()
    } catch (error) {
      console.error('Error updating booking:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Primary Booking Details Section */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-sm text-gray-700">Booking Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Member Selection */}
              <div className="space-y-2">
                <Label>Member</Label>
                {selectedUser ? (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <span>{getFullName(selectedUser.first_name, selectedUser.last_name)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(null)
                        setFormData(prev => ({ ...prev, user_id: "" }))
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchResults.length > 0 && (
                      <div className="border rounded-md divide-y">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedUser(user)
                              setFormData(prev => ({ ...prev, user_id: user.id }))
                              setSearchTerm("")
                              setSearchResults([])
                            }}
                          >
                            {getFullName(user.first_name, user.last_name)} ({user.email})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Instructor Selection */}
              <div className="space-y-2">
                <Label>Instructor</Label>
                <Select
                  value={formData.instructor_id}
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, instructor_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No instructor</SelectItem>
                    {instructors.map((instructor) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {getFullName(instructor.first_name, instructor.last_name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Aircraft Selection */}
              <div className="space-y-2">
                <Label>Aircraft</Label>
                <Select
                  value={formData.aircraft_id}
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, aircraft_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {aircraft.find(a => a.id === formData.aircraft_id)?.registration || 'Select aircraft'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {aircraft.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        <span className="font-medium">{a.registration}</span>
                        <span className="text-gray-500 ml-2">({a.type})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Flight Type Selection */}
              <div className="space-y-2">
                <Label>Flight Type</Label>
                <Select
                  value={formData.flight_type_id}
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, flight_type_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select flight type" />
                  </SelectTrigger>
                  <SelectContent>
                    {flightTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start</Label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                  <Select
                    value={formData.start_time}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, start_time: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>End</Label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                  <Select
                    value={formData.end_time}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, end_time: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">Additional Details</h3>
            
            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add description..."
              />
            </div>

            {/* Route and ETA side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Route</Label>
                <Input
                  value={formData.route}
                  onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                  placeholder="e.g., NZNE-NZAR-NZNE"
                />
              </div>
              <div className="space-y-2">
                <Label>ETA</Label>
                <Input
                  type="datetime-local"
                  value={formData.eta ? format(new Date(formData.eta), "yyyy-MM-dd'T'HH:mm") : ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, eta: e.target.value }))}
                />
              </div>
            </div>

            {/* Lesson Selection */}
            <div className="space-y-2">
              <Label>Lesson (Optional)</Label>
              <div className="space-y-2">
                {selectedLesson ? (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <span>{selectedLesson.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLesson(null)
                        setFormData(prev => ({ ...prev, lesson_id: "none" }))
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input
                      placeholder="Search lessons..."
                      value={lessonSearch}
                      onChange={(e) => setLessonSearch(e.target.value)}
                    />
                    {lessonResults.length > 0 && (
                      <div className="border rounded-md divide-y">
                        {lessonResults.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedLesson(lesson)
                              setFormData(prev => ({ ...prev, lesson_id: lesson.id }))
                              setLessonSearch("")
                              setLessonResults([])
                            }}
                          >
                            {lesson.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 