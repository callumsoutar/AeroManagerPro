import React from 'react'
import { Progress } from "../ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { ALL_LESSONS, completedLessons } from '../../data/lessons'
import type { Member } from '../../data/members'
import { format } from 'date-fns'

interface ProgressViewProps {
  member: Member;
}

export function ProgressView({ member }: ProgressViewProps) {
  const memberLessons = completedLessons.filter(lesson => lesson.memberId === member.id)
  const progressPercentage = (memberLessons.length / ALL_LESSONS.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Training Progress</h3>
          <span className="text-sm text-gray-500">
            {memberLessons.length} of {ALL_LESSONS.length} lessons completed
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="text-sm text-gray-500 mt-2">
          {progressPercentage.toFixed(1)}% Complete
        </div>
      </div>

      {/* Completed Lessons Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Completed Lessons</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Lesson</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memberLessons.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell>{format(new Date(lesson.date), 'dd MMM yyyy')}</TableCell>
                <TableCell>{lesson.type}</TableCell>
                <TableCell>{lesson.instructorId}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: lesson.grade || 0 }).map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">{lesson.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 