import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { DivIcon } from 'leaflet'
import { mockFlightTrackResponses } from '../../data/flightTrack'
import "leaflet/dist/leaflet.css"

interface CurrentLocationModalProps {
  open: boolean
  onClose: () => void
  registration?: string
}

// Create a function to generate a rotated aircraft icon
const createRotatedIcon = (track: number) => {
  return new DivIcon({
    html: `
      <div style="transform: rotate(${track}deg);">
        <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M438.8,320.6c-3.6-3.1-147.2-107.2-147.2-107.2c-0.2-0.2-0.4-0.4-0.5-0.5c-5.5-5.6-5.2-10.4-5.6-18.8c0,0-0.9-69-2.2-92S270,64,256,64c0,0,0,0,0,0s0,0,0,0c-14,0-25.9,15-27.2,38s-2.2,92-2.2,92c-0.4,8.4-0.1,13.2-5.6,18.8c-0.2,0.2-0.4,0.4-0.5,0.5c0,0-143.5,104.1-147.2,107.2s-9.2,7.8-9.2,18.2c0,12.2,3.6,13.7,10.6,11.6c0,0,140.2-39.5,145.4-40.8s7.9,0.6,8.3,7.5s0.8,46.4,0.9,51s-0.6,4.7-2.9,7.4l-32,40.8c-1.7,2-2.7,4.5-2.7,7.3c0,0,0,6.1,0,12.4s2.8,7.3,8.2,4.9s32.6-17.4,32.6-17.4c0.7-0.3,4.6-1.9,6.4-1.9c4.2,0,8-0.1,8.8,6.2c1.3,11.4,4.9,20.3,8.5,20.3c0,0,0,0,0,0s0,0,0,0c3.6,0,7.2-8.9,8.5-20.3c0.7-6.3,4.6-6.2,8.8-6.2c1.8,0,5.7,1.6,6.4,1.9c0,0,27.2,15,32.6,17.4s8.2,1.4,8.2-4.9s0-12.4,0-12.4c0-2.8-1-5.4-2.7-7.3l-32-40.8c-2.3-2.7-2.9-2.9-2.9-7.4s0.5-44.1,0.9-51s3.1-8.8,8.3-7.5s145.4,40.8,145.4,40.8c7.1,2.1,10.6,0.6,10.6-11.6C448,328.4,442.5,323.7,438.8,320.6z" 
            fill="white"/>
        </svg>
      </div>
    `,
    className: 'aircraft-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

// Add CSS for smooth rotation
const styles = `
  <style>
    .aircraft-icon {
      transition: transform 0.3s ease;
    }
    .aircraft-icon div {
      transition: transform 0.3s ease;
    }
    .aircraft-icon svg {
      filter: drop-shadow(0px 0px 1px rgba(0,0,0,0.5));
    }
  </style>
`

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('div')
  styleElement.innerHTML = styles
  document.head.appendChild(styleElement.firstElementChild!)
}

export function CurrentLocationModal({ open, onClose, registration }: CurrentLocationModalProps) {
  if (!registration) return null

  const flightData = mockFlightTrackResponses[registration]

  if (!flightData) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Current Location - {registration}</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-gray-500">
            No location data available for this aircraft
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const position: [number, number] = [flightData.lat, flightData.lon]
  const rotatedIcon = createRotatedIcon(flightData.track)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-4">
        <DialogHeader>
          <DialogTitle>Current Location - {registration}</DialogTitle>
        </DialogHeader>
        <div className="h-[600px] w-full rounded-lg overflow-hidden">
          <MapContainer
            center={position}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={position} icon={rotatedIcon}>
              <Popup>
                <div className="p-2">
                  <div className="font-medium">{registration}</div>
                  <div className="text-sm text-gray-600">
                    Alt: {flightData.alt}ft • Speed: {flightData.gspeed}kts
                  </div>
                  <div className="text-sm text-gray-600">
                    Track: {flightData.track}° • VS: {flightData.vspeed}ft/min
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </DialogContent>
    </Dialog>
  )
} 