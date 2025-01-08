import { useState } from 'react'
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

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
}

type TaskPriority = 'low' | 'medium' | 'high'
type TaskStatus = 'assigned' | 'in_progress' | 'complete'
type TaskCategory = 'maintenance' | 'general' | 'operations' | 'safety' | 'admin'

interface TaskFormData {
  name: string
  description: string
  due_date: string
  priority: TaskPriority
  status: TaskStatus
  category: TaskCategory
}

const CURRENT_USER = 'db5180c7-6b91-489b-9aa2-8ba0faecfd40' // Temporary hardcoded user

export function CreateTaskModal({ open, onClose }: CreateTaskModalProps) {
  const queryClient = useQueryClient()
  const initialFormState: TaskFormData = {
    name: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'assigned',
    category: 'general'
  }
  
  const [formData, setFormData] = useState<TaskFormData>(initialFormState)

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      // First, create the task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          name: data.name,
          description: data.description,
          due_date: data.due_date,
          priority: data.priority,
          status: data.status,
          category: data.category,
          created_by: CURRENT_USER
        })
        .select()
        .single()

      if (taskError) throw taskError

      // Then create the task assignment
      const { error: assignmentError } = await supabase
        .from('task_assignments')
        .insert({
          task_id: task.id,
          user_id: CURRENT_USER,
          assigned_by: CURRENT_USER
        })

      if (assignmentError) throw assignmentError

      return task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created successfully')
      setFormData(initialFormState) // Reset form
      onClose()
    },
    onError: (error) => {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createTaskMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Task Name
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter task name"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description"
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Due Date
            </label>
            <Input
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Priority
              </label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
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
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value: TaskStatus) => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(value: TaskCategory) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
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

          <div className="flex justify-end gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setFormData(initialFormState)
                onClose()
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createTaskMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 