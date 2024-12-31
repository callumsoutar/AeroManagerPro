import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "../../lib/supabase"
import { format, isValid, parseISO } from "date-fns"
import { useNavigate } from "react-router-dom"

interface InstructorCommentsTabProps {
  userId: string
}

interface Instructor {
  id: string
  name: string
}

interface Lesson {
  id: string
  name: string
}

interface BookingComment {
  id: string  // Added for navigation
  end_time: string
  instructor_comment: string
  instructor: Instructor | null
  lesson: Lesson | null
}

// Interface for raw Supabase response
interface RawBookingComment {
  id: string
  end_time: string
  instructor_comment: string
  instructor: {
    id: string
    name: string
  } | null
  lesson: {
    id: string
    name: string
  } | null
}

export function InstructorCommentsTab({ userId }: InstructorCommentsTabProps) {
  const navigate = useNavigate()
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = parseISO(dateString)
    return isValid(date) ? format(date, 'dd MMM yyyy') : '-'
  }

  const { data: comments, isLoading } = useQuery<BookingComment[]>({
    queryKey: ['instructor-comments', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          end_time,
          instructor_comment,
          instructor:instructor_id (
            id,
            name
          ),
          lesson:lesson_id (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'complete')
        .not('instructor_comment', 'is', null)
        .order('end_time', { ascending: false })

      if (error) throw error

      // Transform the raw data to match our interface
      return ((data || []) as unknown as RawBookingComment[])
        .filter(comment => comment.end_time)
        .map(comment => ({
          id: comment.id,
          end_time: comment.end_time,
          instructor_comment: comment.instructor_comment,
          instructor: comment.instructor,
          lesson: comment.lesson
        }))
    }
  })

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading comments...</div>
  }

  if (!comments?.length) {
    return <div className="p-4 text-center text-muted-foreground">No instructor comments found.</div>
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead className="w-[150px]">Instructor</TableHead>
            <TableHead className="w-[200px]">Lesson</TableHead>
            <TableHead>Comments</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments?.map((comment, index) => (
            <TableRow 
              key={index}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/bookings/${comment.id}`)}
            >
              <TableCell>
                {formatDate(comment.end_time)}
              </TableCell>
              <TableCell>{comment.instructor?.name || '-'}</TableCell>
              <TableCell>{comment.lesson?.name || '-'}</TableCell>
              <TableCell className="whitespace-pre-wrap">{comment.instructor_comment}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 