import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { toast } from "sonner"

interface AddDefectModalProps {
  isOpen: boolean
  onClose: () => void
  aircraftId?: string // Optional - if not provided, will show aircraft select
}

export function AddDefectModal({ isOpen, onClose, aircraftId }: AddDefectModalProps) {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Open',
    selectedAircraftId: aircraftId || ''
  })

  const [aircraft, setAircraft] = useState<Array<{ id: string, registration: string }>>([])

  // Fetch aircraft list if no aircraftId is provided
  const fetchAircraft = async () => {
    if (!aircraftId && aircraft.length === 0) {
      const { data, error } = await supabase
        .from('aircraft')
        .select('id, registration')
        .order('registration')

      if (!error && data) {
        setAircraft(data)
      }
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    const targetAircraftId = aircraftId || formData.selectedAircraftId
    if (!targetAircraftId) {
      toast.error('Please select an aircraft')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('defects')
        .insert([
          {
            aircraft_id: targetAircraftId,
            name: formData.name,
            description: formData.description,
            status: formData.status,
            reported_date: new Date().toISOString(),
            reported_by: 'db5180c7-6b91-489b-9aa2-8ba0faecfd40',
            comments: []
          }
        ])
        .select()
        .single()

      if (error) throw error

      toast.success('Defect reported successfully')
      queryClient.invalidateQueries({ 
        queryKey: ['aircraft', targetAircraftId] 
      })
      onClose()
      setFormData({
        name: '',
        description: '',
        status: 'Open',
        selectedAircraftId: aircraftId || ''
      })
    } catch (error) {
      console.error('Error creating defect:', error)
      toast.error('Failed to create defect')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Report New Defect</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!aircraftId && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Aircraft</label>
              <Select
                value={formData.selectedAircraftId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, selectedAircraftId: value }))}
                onOpenChange={fetchAircraft}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select aircraft" />
                </SelectTrigger>
                <SelectContent>
                  {aircraft.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.registration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Issue</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Brief description of the issue"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the defect"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Creating..." : "Create Defect"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 