import React, { useMemo } from 'react'
import { Dialog, DialogContent } from "../ui/dialog"
import { MapContainer, TileLayer, Polyline } from "react-leaflet"
import { LatLngTuple, LatLngBounds } from 'leaflet'
import "leaflet/dist/leaflet.css"
import { flightTrackData } from '../../data/flightTrack'

interface FlightTrackModalProps {
  isOpen: boolean
  onClose: () => void
}

const FlightTrackModal = ({ isOpen, onClose }: FlightTrackModalProps) => {
  // Calculate center and bounds
  const { center, bounds, flightPath } = useMemo(() => {
    const coordinates: LatLngTuple[] = flightTrackData.map(point => [point.latitude, point.longitude])
    
    // Calculate center
    const latitudes = coordinates.map(coord => coord[0])
    const longitudes = coordinates.map(coord => coord[1])
    const center: LatLngTuple = [
      (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
      (Math.min(...longitudes) + Math.max(...longitudes)) / 2
    ]
    
    // Calculate bounds
    const bounds = new LatLngBounds(coordinates)
    
    return { center, bounds, flightPath: coordinates }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-4">
        <div className="h-[600px] w-full rounded-lg overflow-hidden">
          <MapContainer
            center={center}
            bounds={bounds}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            {/* Flight path line */}
            <Polyline 
              positions={flightPath}
              color="#4ade80"
              weight={2}
              opacity={0.8}
            />
          </MapContainer>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FlightTrackModal 