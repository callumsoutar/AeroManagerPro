import { useQuery } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"
import { Button } from "../components/ui/button"
import { PlusCircle, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Badge } from "../components/ui/badge"
import { cn } from "../lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { format } from "date-fns"
import { useState } from 'react'
import { CreateTaskModal } from '../components/modals/CreateTaskModal'
import { ViewTaskModal } from '../components/modals/ViewTaskModal'

interface Task {
  id: string
  name: string
  description: string | null
  created_at: string
  due_date: string | null
  status: 'assigned' | 'in_progress' | 'complete'
  category: 'maintenance' | 'general' | 'operations' | 'safety' | 'admin'
  priority: 'low' | 'medium' | 'high'
  booking_id: string | null
  aircraft_id: string | null
  created_by: string
  is_complete: boolean
}

export default function Tasks() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          booking:bookings (
            id
          ),
          aircraft:aircraft_id (
            registration
          ),
          created_by:users!created_by (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  const getPriorityBadge = (priority: Task['priority']) => {
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    }[priority]

    return (
      <Badge className={cn("capitalize", styles)}>
        {priority}
      </Badge>
    )
  }

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'assigned':
        return <Clock className="h-4 w-4 text-amber-500" />
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const handleTaskClick = (taskId: string) => {
    console.log('Opening task:', taskId)
    setSelectedTaskId(taskId)
  }

  const todoTasks = tasks?.filter(task => !task.is_complete) || []
  const completedTasks = tasks?.filter(task => task.is_complete) || []

  const formatStatus = (status: Task['status']): string => {
    switch (status) {
      case 'in_progress':
        return 'In Progress'
      case 'assigned':
        return 'Assigned'
      case 'complete':
        return 'Complete'
      default:
        return status
    }
  }

  const TasksTable = ({ tasks }: { tasks: Task[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              Loading tasks...
            </TableCell>
          </TableRow>
        ) : tasks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
              No tasks found
            </TableCell>
          </TableRow>
        ) : (
          tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className="capitalize">{formatStatus(task.status)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{task.name}</div>
                  {task.description && (
                    <div className="text-sm text-gray-500 truncate max-w-md">
                      {task.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {task.category}
                </Badge>
              </TableCell>
              <TableCell>{getPriorityBadge(task.priority)}</TableCell>
              <TableCell>
                {task.due_date ? (
                  format(new Date(task.due_date), 'dd MMM yyyy')
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {format(new Date(task.created_at), 'dd MMM yyyy')}
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleTaskClick(task.id)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button 
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusCircle className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <Tabs defaultValue="todo" className="space-y-4">
        <TabsList>
          <TabsTrigger 
            value="todo"
            className="relative"
          >
            To Do
            {todoTasks.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                {todoTasks.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="completed"
            className="relative"
          >
            Completed
            {completedTasks.length > 0 && (
              <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                {completedTasks.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todo" className="bg-white rounded-xl border shadow-sm">
          <TasksTable tasks={todoTasks} />
        </TabsContent>

        <TabsContent value="completed" className="bg-white rounded-xl border shadow-sm">
          <TasksTable tasks={completedTasks} />
        </TabsContent>
      </Tabs>

      <CreateTaskModal 
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <ViewTaskModal
        taskId={selectedTaskId || ''}
        open={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  )
} 