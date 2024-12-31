import { useState } from "react"
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
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { format } from 'date-fns'

interface DefectDetailModalProps {
  open: boolean
  onClose: () => void
  defect: {
    id: string
    name: string
    description: string
    status: string
    reported_date: string | null
    reported_by_user: { name: string } | null
    comments?: Array<{ 
      user: string
      text: string
      created_at: string | null 
    }>
    aircraft_id: string
  }
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'Unknown date'
  try {
    return format(new Date(dateString), 'dd MMM yyyy')
  } catch (error) {
    console.error('Invalid date:', dateString)
    return 'Invalid date'
  }
}

function formatDateTime(dateString: string | null) {
  if (!dateString) return 'Unknown date'
  try {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm')
  } catch (error) {
    console.error('Invalid date:', dateString)
    return 'Invalid date'
  }
}

export function DefectDetailModal({ open, onClose, defect }: DefectDetailModalProps) {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [newComment, setNewComment] = useState("")

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('defect_comments')
        .insert({
          defect_id: defect.id,
          comment: newComment,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['aircraft', defect.aircraft_id] })
      setNewComment("")
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{defect.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Reporter Info */}
          <div className="flex justify-between items-start">
            <div>
              <Badge
                className={
                  defect.status === 'Open' ? 'bg-red-100 text-red-800' :
                  defect.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }
              >
                {defect.status}
              </Badge>
              <p className="mt-2 text-sm text-gray-500">
                Reported by {defect.reported_by_user?.name || 'Unknown'} on {formatDate(defect.reported_date)}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            <p className="text-gray-900">{defect.description}</p>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Comments</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {defect.comments?.map((comment, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{comment.user}</p>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add Comment */}
          <div className="space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                onClick={handleAddComment}
                disabled={isLoading || !newComment.trim()}
                className="bg-[#1a1a2e] hover:bg-[#2d2d44] text-white"
              >
                {isLoading ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 