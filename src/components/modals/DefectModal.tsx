import React, { useState } from 'react'
import { Dialog, DialogContent } from "../ui/dialog"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { format } from 'date-fns'
import type { Defect, DefectComment } from '../../data/defects'

interface DefectModalProps {
  defect: Defect | null
  isOpen: boolean
  onClose: () => void
  onStatusChange?: (status: 'Open' | 'In Progress' | 'Resolved') => void
}

const DefectModal = ({ defect, isOpen, onClose, onStatusChange }: DefectModalProps) => {
  const [newComment, setNewComment] = useState('')
  const [status, setStatus] = useState(defect?.status || 'Open')

  if (!defect) return null

  const handleStatusChange = (newStatus: 'Open' | 'In Progress' | 'Resolved') => {
    setStatus(newStatus)
    onStatusChange?.(newStatus)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy')
  }

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, yyyy h:mm a')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{defect.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{defect.aircraft}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[140px]">
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

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="mt-1 text-gray-900">{defect.description}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Reported Date</label>
              <p className="mt-1 text-gray-900">{formatDate(defect.reportedDate)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Comments</label>
              <div className="mt-2 space-y-3">
                {defect.comments?.map((comment: DefectComment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-900">{comment.userName}</span>
                      <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-gray-600">{comment.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Add Comment</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add your comment here..."
                className="mt-1"
              />
              <Button 
                className="mt-2"
                disabled={!newComment.trim()}
                onClick={() => {
                  // Handle adding comment
                  setNewComment('')
                }}
              >
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DefectModal 