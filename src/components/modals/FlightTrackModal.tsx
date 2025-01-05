import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { mockFlightTrackResponses } from '../../data/flightTrack'

interface FlightTrackModalProps {
  open: boolean
  onClose: () => void
  registration?: string
}

export function FlightTrackModal({ open, onClose, registration }: FlightTrackModalProps) {
  if (!registration) return null

  const flightData = mockFlightTrackResponses[registration]

  if (!flightData) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aircraft Position - {registration}</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-gray-500">
            No tracking data available for this aircraft
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aircraft Position - {registration}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Altitude</div>
              <div className="font-medium">{flightData.alt} ft</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Ground Speed</div>
              <div className="font-medium">{flightData.gspeed} kts</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Vertical Speed</div>
              <div className="font-medium">{flightData.vspeed} ft/min</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Track</div>
              <div className="font-medium">{flightData.track}°</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Position</div>
              <div className="font-medium">
                {flightData.lat.toFixed(4)}, {flightData.lon.toFixed(4)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Last Updated</div>
              <div className="font-medium">
                {new Date(flightData.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 