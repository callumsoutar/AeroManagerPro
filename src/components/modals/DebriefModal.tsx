import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Star, StarOff } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

interface DebriefModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string
}

interface DebriefCategory {
  id: string
  name: string
  rating: number
  comment: string
}

interface DebriefData {
  categories: DebriefCategory[]
  generalNotes: string
  formattedComment?: string
}

const DEBRIEF_CATEGORIES = [
  { id: 'startup', name: 'Startup and Taxi' },
  { id: 'departure', name: 'Departure' },
  { id: 'enroute', name: 'Enroute' },
  { id: 'exercise', name: 'Air Exercise' },
  { id: 'landing', name: 'Approach and Landing' },
  { id: 'airmanship', name: 'Airmanship' },
  { id: 'tem', name: 'Threat and Error Management' },
]

const DebriefModal = ({ isOpen, onClose, bookingId }: DebriefModalProps) => {
  const { data: existingDebrief } = useQuery({
    queryKey: ['flight-debrief', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flight_debriefs')
        .select('*')
        .eq('booking_id', bookingId)
        .single()

      if (error && error.code !== 'PGRST116') throw error // Ignore "not found" errors
      return data
    },
    enabled: !!bookingId
  })

  const [debrief, setDebrief] = useState<DebriefData>(() => 
    existingDebrief ? {
      categories: existingDebrief.categories || DEBRIEF_CATEGORIES.map(cat => ({
        ...cat,
        rating: 0,
        comment: ''
      })),
      generalNotes: existingDebrief.general_notes || ''
    } : {
      categories: DEBRIEF_CATEGORIES.map(cat => ({
        ...cat,
        rating: 0,
        comment: ''
      })),
      generalNotes: ''
    }
  )

  const saveDebriefMutation = useMutation({
    mutationFn: async (debriefData: DebriefData) => {
      const { error } = await supabase
        .from('flight_debriefs')
        .upsert({
          booking_id: bookingId,
          categories: debriefData.categories,
          general_notes: debriefData.generalNotes,
          created_by: 'db5180c7-6b91-489b-9aa2-8ba0faecfd40'
        })

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Debrief saved successfully')
    },
    onError: (error) => {
      console.error('Error saving debrief:', error)
      toast.error('Failed to save debrief')
    }
  })

  const handleRatingClick = (categoryId: string, rating: number) => {
    setDebrief(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId ? { ...cat, rating } : cat
      )
    }))
  }

  const handleCommentChange = (categoryId: string, comment: string) => {
    setDebrief(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId ? { ...cat, comment } : cat
      )
    }))
  }

  const handleSave = () => {
    // Format the debrief data into a structured comment
    const formattedComment = `Flight Debrief:\n\n${debrief.categories
      .map(cat => 
        `${cat.name}:\n` +
        `Rating: ${'★'.repeat(cat.rating)}${'☆'.repeat(4-cat.rating)}\n` +
        `${cat.comment ? `Comments: ${cat.comment}\n` : ''}`
      )
      .join('\n')}\n` +
      `General Notes:\n${debrief.generalNotes}`

    saveDebriefMutation.mutate({ 
      ...debrief, 
      formattedComment 
    }, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Flight Debrief</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating Table */}
          <div className="rounded-lg border">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Category</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-500 w-48">Rating</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {debrief.categories.map((category) => (
                  <tr key={category.id} className="bg-white">
                    <td className="px-4 py-3 text-sm font-medium">{category.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleRatingClick(category.id, rating)}
                            className={cn(
                              "p-1 hover:text-yellow-500 transition-colors",
                              category.rating >= rating ? "text-yellow-500" : "text-gray-300"
                            )}
                          >
                            {category.rating >= rating ? (
                              <Star className="h-6 w-6 fill-current" />
                            ) : (
                              <StarOff className="h-6 w-6" />
                            )}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={category.comment}
                        onChange={(e) => handleCommentChange(category.id, e.target.value)}
                        className="w-full border-0 bg-transparent text-sm focus:ring-0"
                        placeholder="Add comments..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* General Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">General Debrief Notes</label>
            <Textarea
              value={debrief.generalNotes}
              onChange={(e) => setDebrief(prev => ({ ...prev, generalNotes: e.target.value }))}
              placeholder="Enter any additional notes or comments about the flight..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={saveDebriefMutation.isPending}
          >
            {saveDebriefMutation.isPending ? 'Saving...' : 'Save Debrief'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DebriefModal 