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
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { format, parseISO } from 'date-fns'
import { toast } from "sonner"
import { cn } from "../../lib/utils"

interface DefectComment {
  text: string
  user: string
  timestamp: string
}

interface DefectModalProps {
  defect: {
    id: string
    name: string
    description: string
    status: string
    reported_date: string
    reported_by_user: {
      first_name: string
      last_name: string
    }
    comments: DefectComment[]
    aircraft_id: string
  }
  isOpen: boolean
  onClose: () => void
  onStatusChange?: (status: 'Open' | 'In Progress' | 'Resolved') => void
}

function formatDateSafely(dateString: string | null, formatString: string = 'dd MMM yyyy'): string {
  if (!dateString) return 'Not set'
  try {
    const date = parseISO(dateString)
    return format(date, formatString)
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid date'
  }
}

function getUserFullName(user: { first_name: string; last_name: string }) {
  return `${user.first_name} ${user.last_name}`
}

export function DefectModal({ defect, isOpen, onClose, onStatusChange }: DefectModalProps) {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [selectedStatus, setSelectedStatus] = useState(defect.status)
  const [hasStatusChanged, setHasStatusChanged] = useState(false)

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus)
    setHasStatusChanged(true)
  }

  const handleSave = async () => {
    if (!hasStatusChanged) return
    
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('defects')
        .update({ status: selectedStatus })
        .eq('id', defect.id)

      if (error) throw error

      onStatusChange?.(selectedStatus as 'Open' | 'In Progress' | 'Resolved')
      queryClient.invalidateQueries({ queryKey: ['aircraft', defect.aircraft_id] })
      toast.success('Defect status updated successfully')
      setHasStatusChanged(false)
    } catch (error) {
      console.error('Error updating defect status:', error)
      toast.error('Failed to update defect status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      // First, get the current defect to ensure we have the latest comments
      const { data: currentDefect, error: fetchError } = await supabase
        .from('defects')
        .select('comments')
        .eq('id', defect.id)
        .single()

      if (fetchError) throw fetchError

      // Prepare the new comment
      const newCommentObj = {
        text: newComment.trim(),
        user: "Callum Soutar", // Hardcoded for now
        timestamp: new Date().toISOString()
      }

      // Create new comments array with existing comments plus new one
      const updatedComments = [
        ...(currentDefect.comments || []),
        newCommentObj
      ]

      // Update the defect record with the new comments array
      const { error: updateError } = await supabase
        .from('defects')
        .update({
          comments: updatedComments
        })
        .eq('id', defect.id)

      if (updateError) throw updateError

      // Success handling
      queryClient.invalidateQueries({ queryKey: ['aircraft', defect.aircraft_id] })
      setNewComment("")
      toast.success('Comment added successfully')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{defect.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Reporter Info */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4">
                <Select value={selectedStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[140px] bg-white border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Badge
                  className={
                    selectedStatus === 'Open' ? 'bg-red-100 text-red-800' :
                    selectedStatus === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }
                >
                  {selectedStatus}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Reported by {getUserFullName(defect.reported_by_user)} on {formatDateSafely(defect.reported_date)}
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
            <h3 className="text-sm font-medium text-gray-500 mb-2">Comments</h3>
            <div className="space-y-3">
              {defect.comments && defect.comments.length > 0 ? (
                defect.comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.user}
                      </p>
                      <time className="text-xs text-gray-500">
                        {formatDateSafely(comment.timestamp, 'dd MMM yyyy HH:mm')}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No comments yet</p>
              )}
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
            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={handleAddComment}
                disabled={isLoading || !newComment.trim()}
                className="bg-[#1a1a2e] hover:bg-[#2d2d44] text-white"
              >
                {isLoading ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          </div>

          {/* Footer with contextual buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={hasStatusChanged ? handleSave : onClose}
              disabled={isLoading}
              className={cn(
                "text-white",
                hasStatusChanged 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-[#1a1a2e] hover:bg-[#2d2d44]"
              )}
            >
              {isLoading ? "Saving..." : (hasStatusChanged ? "Save Changes" : "Close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 