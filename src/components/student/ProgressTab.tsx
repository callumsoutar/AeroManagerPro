import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useStudentProgress } from '../../hooks/useStudentProgress'
import { Progress } from '../../components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { format } from 'date-fns'
import { EnrollmentDialog } from './EnrollmentDialog'
import { Plus } from 'lucide-react'

interface ProgressTabProps {
  userId: string
}

export function ProgressTab({ userId }: ProgressTabProps) {
  const [selectedSyllabus, setSelectedSyllabus] = useState<string>('')
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false)
  
  const {
    enrollments,
    isLoadingEnrollments,
    getLessonProgress,
    enrollInSyllabus
  } = useStudentProgress(userId)

  const { data: lessons, isLoading: isLoadingLessons } = useQuery({
    queryKey: ['lesson-progress', selectedSyllabus],
    queryFn: () => selectedSyllabus ? getLessonProgress(selectedSyllabus) : Promise.resolve([]),
    enabled: !!selectedSyllabus
  })
  
  const progressPercentage = lessons 
    ? (lessons.filter(l => l.isComplete).length / lessons.length) * 100
    : 0

  if (!userId) {
    return <div className="p-6 text-center text-red-500">Error: No user ID provided</div>
  }

  console.log('ProgressTab rendered with userId:', userId)
  
  const handleEnroll = async (syllabus: string) => {
    try {
      await enrollInSyllabus.mutateAsync(syllabus)
    } catch (error) {
      console.error('Failed to enroll:', error)
      // You might want to show an error toast here
    }
  }

  if (isLoadingEnrollments) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading enrollments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Enroll Button - Always visible */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Training Progress
          </h2>
          <p className="text-sm text-muted-foreground">
            Track and manage student progress through various syllabuses
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {enrollments && enrollments.length > 0 && enrollments.every(e => e.syllabus) && (
            <Select
              value={selectedSyllabus || undefined}
              onValueChange={setSelectedSyllabus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Syllabus" />
              </SelectTrigger>
              <SelectContent>
                {enrollments.map((enrollment) => (
                  enrollment.syllabus && (
                    <SelectItem key={enrollment.id} value={enrollment.id}>
                      {enrollment.syllabus.name}
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            onClick={() => setIsEnrollmentOpen(true)}
            className="bg-[#1a1a2e] hover:bg-[#2d2d44] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Enroll in New Syllabus
          </Button>
        </div>
      </div>

      {/* Show message when no enrollments */}
      {(!enrollments || enrollments.length === 0) && (
        <div className="bg-white border rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No enrollments found. Click "Enroll in New Syllabus" to get started.</p>
        </div>
      )}

      {/* Progress Bar */}
      {selectedSyllabus && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      {/* Lessons Table */}
      {selectedSyllabus && (
        <div className="border rounded-md">
          {isLoadingLessons ? (
            <div className="p-6 text-center text-gray-500">Loading lessons...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Lesson</TableHead>
                  <TableHead className="w-[100px]">Grade</TableHead>
                  <TableHead className="w-[150px]">Completed</TableHead>
                  <TableHead className="w-[150px]">Instructor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons?.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell>
                      <Checkbox
                        checked={lesson.isComplete}
                        disabled
                      />
                    </TableCell>
                    <TableCell>{lesson.name}</TableCell>
                    <TableCell>{lesson.grade || '-'}</TableCell>
                    <TableCell>
                      {lesson.completedDate 
                        ? format(new Date(lesson.completedDate), 'dd MMM yyyy')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>{lesson.instructor?.name || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Enrollment Dialog */}
      <EnrollmentDialog
        open={isEnrollmentOpen}
        onClose={() => setIsEnrollmentOpen(false)}
        onEnroll={handleEnroll}
        currentEnrollments={enrollments?.filter(e => e.syllabus).map(e => e.syllabus.name) || []}
      />
    </div>
  )
} 