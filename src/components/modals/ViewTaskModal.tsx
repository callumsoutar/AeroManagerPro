import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Loader2, Save, MessageSquarePlus } from 'lucide-react'
import { Separator } from '../ui/separator'

interface ViewTaskModalProps {
  open: boolean
  onClose: () => void
  taskId: string
}

type TaskPriority = 'low' | 'medium' | 'high'
type TaskStatus = 'assigned' | 'in_progress' | 'complete'
type TaskCategory = 'maintenance' | 'general' | 'operations' | 'safety' | 'admin'

interface TaskData {
  id: string
  name: string
  description: string
  due_date: string
  priority: TaskPriority
  status: TaskStatus
  category: TaskCategory
  created_at: string
  created_by: {
    first_name: string
    last_name: string
  }
  assignments: Array<{
    assignee: {
      first_name: string
      last_name: string
    }
  }>
  task_comments?: Array<{
    id: string
    comment: string
    created_at: string
    user: {
      first_name: string
      last_name: string
    }
  }>
}

function formatDateForInput(dateString: string | undefined): string {
  if (!dateString) return ''
  return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm")
}

export function ViewTaskModal({ open, onClose, taskId }: ViewTaskModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<Partial<TaskData> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)

  const fetchTask = useCallback(async () => {
    if (!taskId) return
    
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          created_by:users!tasks_created_by_fkey (
            first_name,
            last_name
          ),
          assignments:task_assignments (
            assignee:users!task_assignments_user_id_fkey (
              first_name,
              last_name
            )
          ),
          task_comments (
            id,
            comment,
            created_at,
            user:users (
              first_name,
              last_name
            )
          )
        `)
        .eq('id', taskId)
        .single()

      if (error) {
        console.error('Error fetching task:', error)
        toast.error('Failed to load task details')
        return
      }

      setFormData(data)
    } catch (err) {
      console.error('Error in fetchTask:', err)
      toast.error('Failed to load task details')
    } finally {
      setIsLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    if (open && taskId) {
      fetchTask()
    }
  }, [open, taskId, fetchTask])

  const updateTaskMutation = useMutation({
    mutationFn: async (data: Partial<TaskData>) => {
      const { error } = await supabase
        .from('tasks')
        .update({
          name: data.name,
          description: data.description,
          due_date: data.due_date,
          priority: data.priority,
          status: data.status,
          category: data.category
        })
        .eq('id', taskId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task updated successfully')
      onClose()
    },
    onError: (error) => {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  })

  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      const { error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: 'db5180c7-6b91-489b-9aa2-8ba0faecfd40',
          comment: comment
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      setNewComment('')
      setIsAddingComment(false)
      toast.success('Comment added successfully')

      fetchTask()
    },
    onError: (error) => {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    updateTaskMutation.mutate(formData)
  }

  // Loading state handling
  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between pr-0">
          <DialogTitle className="text-xl font-semibold">
            {isLoading ? 'Loading...' : 'View/Edit Task'}
          </DialogTitle>
          
          <div className="flex items-center gap-3">
            <Button 
              type="submit"
              form="task-form"
              disabled={updateTaskMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              {updateTaskMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : formData ? (
          <form id="task-form" onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Task Info Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="datetime-local"
                  value={formatDateForInput(formData.due_date)}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Status Section */}
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: TaskPriority) => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        High
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: TaskStatus) => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value: TaskCategory) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Comments</h3>
              
              {/* Existing Comments List - Moved to top */}
              <div className="space-y-4">
                {formData.task_comments?.length ? (
                  formData.task_comments.map(comment => (
                    <div 
                      key={comment.id} 
                      className="bg-white p-3 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {comment.user.first_name} {comment.user.last_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(comment.created_at), 'dd MMM yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No comments yet</p>
                )}
              </div>

              {/* Add Comment Form - Moved below */}
              <div className="mt-4 space-y-2 bg-gray-50 p-4 rounded-lg">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="min-h-[80px] resize-none bg-white"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={() => {
                      if (!newComment.trim()) return
                      addCommentMutation.mutateAsync(newComment)
                    }}
                    disabled={isAddingComment}
                    variant="outline"
                    className="border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700"
                    size="sm"
                    type="button"
                  >
                    {isAddingComment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <MessageSquarePlus className="mr-2 h-4 w-4" />
                        Add Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Separator for meta information */}
            <Separator className="my-6" />

            {/* Meta Information - with enhanced styling */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
              <div className="text-sm text-gray-500">
                Created by {formData.created_by?.first_name} {formData.created_by?.last_name} on{' '}
                {formData.created_at ? format(new Date(formData.created_at), 'dd MMM yyyy') : '-'}
              </div>
              
              <Separator />
              
              <div className="text-sm">
                <span className="text-gray-500">Assigned to: </span>
                {formData.assignments?.map(assignment => 
                  `${assignment.assignee.first_name} ${assignment.assignee.last_name}`
                ).join(', ') || 'No assignments'}
              </div>
            </div>
          </form>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Failed to load task details
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 