import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface SyllabusEnrollment {
  id: string
  status: 'active' | 'completed' | 'suspended'
  enrolled_date: string
  completed_date: string | null
  syllabus: {
    id: string
    name: string
    description: string
  }
}

interface RawSupabaseResponse {
  id: string
  status: string
  enrolled_date: string
  completed_date: string | null
  syllabus: {
    id: string
    name: string
    description: string
  }
}

export interface LessonWithProgress {
  id: string
  name: string
  order_index: number
  grade: number | null
  isComplete: boolean
  completedDate: string | null
  instructor: {
    id: string
    name: string
  } | null
  instructorComment: string | null
}

export function useStudentProgress(userId: string) {
  const queryClient = useQueryClient()

  // Fetch enrollments
  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['student-enrollments', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_syllabus_enrollments')
        .select(`
          id,
          status,
          enrolled_date,
          completed_date,
          syllabus:syllabus_id (
            id,
            name,
            description
          )
        `)
        .eq('user_id', userId)
      
      if (error) throw error
      
      // Transform the raw data to match our interface
      return ((data || []) as unknown as RawSupabaseResponse[])
        .filter(enrollment => enrollment.syllabus) // Filter out any enrollments without syllabus
        .map(enrollment => ({
          id: enrollment.id,
          status: enrollment.status as 'active' | 'completed' | 'suspended',
          enrolled_date: enrollment.enrolled_date,
          completed_date: enrollment.completed_date,
          syllabus: enrollment.syllabus
        })) as SyllabusEnrollment[]
    }
  })

  // Get lessons for a syllabus and check completion status
  const getLessonProgress = async (enrollmentId: string) => {
    // Get syllabus_id from enrollment
    const { data: enrollment } = await supabase
      .from('student_syllabus_enrollments')
      .select('syllabus_id, user_id')
      .eq('id', enrollmentId)
      .single()

    if (!enrollment) return []

    // Get all lessons for this syllabus
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('syllabus_id', enrollment.syllabus_id)
      .order('order_index')

    if (!lessons) return []

    // Get completed bookings for this user that match these lessons
    const { data: completedBookings } = await supabase
      .from('bookings')
      .select(`
        lesson_id,
        end_time,
        instructor_comment,
        instructor:instructor_id (
          id,
          name
        )
      `)
      .eq('user_id', enrollment.user_id)
      .eq('status', 'complete')
      .in('lesson_id', lessons.map(l => l.id))

    // Map lessons and add completion status
    return lessons.map(lesson => {
      const completedBooking = completedBookings?.find(b => b.lesson_id === lesson.id)
      const rawInstructor = completedBooking?.instructor as unknown as { id: string; name: string } | null

      return {
        id: lesson.id,
        name: lesson.name,
        order_index: lesson.order_index,
        grade: lesson.grade,
        isComplete: !!completedBooking,
        completedDate: completedBooking?.end_time || null,
        instructor: rawInstructor,
        instructorComment: completedBooking?.instructor_comment || null
      } satisfies LessonWithProgress
    })
  }

  // Enroll in syllabus mutation
  const enrollInSyllabus = useMutation({
    mutationFn: async (syllabusName: string) => {
      const { data: syllabus } = await supabase
        .from('syllabuses')
        .select('id')
        .eq('name', syllabusName)
        .single()

      if (!syllabus) throw new Error('Syllabus not found')

      const { data, error } = await supabase
        .from('student_syllabus_enrollments')
        .insert({
          user_id: userId,
          syllabus_id: syllabus.id,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-enrollments', userId] })
    }
  })

  return {
    enrollments,
    isLoadingEnrollments,
    getLessonProgress,
    enrollInSyllabus
  }
} 