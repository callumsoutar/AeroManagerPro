import React from 'react'
import { Dialog, DialogContent } from "../ui/dialog"

interface DebriefModalProps {
  isOpen: boolean
  onClose: () => void
}

const DebriefModal = ({ isOpen, onClose }: DebriefModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1200px] p-4">
        <div className="h-[800px] w-full rounded-lg overflow-hidden border border-gray-200">
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500">Debrief View Coming Soon</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DebriefModal 