import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Star } from 'lucide-react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { cn } from '../../lib/utils'

interface ViewDebriefModalProps {
  isOpen: boolean
  onClose: () => void
  debriefId: string
}

// Add interface for category type
interface DebriefCategory {
  id: string
  name: string
  rating: number
  comment: string
}

interface Debrief {
  id: string
  categories: DebriefCategory[]
  general_notes: string
  created_at: string
  created_by: {
    first_name: string
    last_name: string
  }
}

const ViewDebriefModal = ({ isOpen, onClose, debriefId }: ViewDebriefModalProps) => {
  const { data: debrief, isLoading } = useQuery<Debrief>({
    queryKey: ['flight-debrief', debriefId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flight_debriefs')
        .select(`
          *,
          created_by:users!created_by (
            first_name,
            last_name
          )
        `)
        .eq('id', debriefId)
        .single()

      if (error) throw error
      return {
        ...data,
        categories: data.categories || []
      }
    }
  })

  if (isLoading) return <div>Loading...</div>
  if (!debrief) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Flight Debrief Details</DialogTitle>
          <div className="text-sm text-gray-500">
            Created by {debrief.created_by.first_name} {debrief.created_by.last_name} on{' '}
            {format(new Date(debrief.created_at), 'dd MMM yyyy HH:mm')}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Categories with Ratings */}
          <div className="divide-y border rounded-lg">
            {debrief?.categories?.map((category: DebriefCategory) => (
              <div key={category.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Star 
                          key={i}
                          className={cn(
                            "h-5 w-5",
                            i < category.rating 
                              ? "text-yellow-500 fill-current" 
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  {category.comment && (
                    <div className="text-sm text-gray-600 mt-1">
                      {category.comment}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* General Notes */}
          {debrief.general_notes && (
            <div className="space-y-2">
              <h3 className="font-medium">General Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
                {debrief.general_notes}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ViewDebriefModal 