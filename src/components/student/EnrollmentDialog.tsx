import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Button } from "../../components/ui/button"

interface EnrollmentDialogProps {
  open: boolean
  onClose: () => void
  onEnroll: (syllabus: string) => void
  currentEnrollments: string[]
}

const AVAILABLE_SYLLABUSES = ['PPL', 'CPL', 'IFR', 'C-CAT', 'Aerobatics']

export function EnrollmentDialog({
  open,
  onClose,
  onEnroll,
  currentEnrollments
}: EnrollmentDialogProps) {
  const [selected, setSelected] = useState<string>('')

  const availableSyllabuses = AVAILABLE_SYLLABUSES.filter(
    s => !currentEnrollments.includes(s)
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll in New Syllabus</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue placeholder="Select a syllabus" />
            </SelectTrigger>
            <SelectContent>
              {availableSyllabuses.map((syllabus) => (
                <SelectItem key={syllabus} value={syllabus}>
                  {syllabus}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={!selected}
              onClick={() => {
                onEnroll(selected)
                onClose()
              }}
            >
              Enroll
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 