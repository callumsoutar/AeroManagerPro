import React, { useEffect, useRef } from 'react'
import { Dialog, DialogContent } from "../ui/dialog"
import * as Cesium from 'cesium'
import { flightTrackData } from '../../data/flightTrack'
import 'cesium/Build/Cesium/Widgets/widgets.css'

interface DebriefModalProps {
  isOpen: boolean
  onClose: () => void
}

const DebriefModal = ({ isOpen, onClose }: DebriefModalProps) => {
  const cesiumContainer = useRef<HTMLDivElement>(null)
  const viewer = useRef<Cesium.Viewer | null>(null)

  useEffect(() => {
    let mounted = true;

    const initCesium = async () => {
      if (!isOpen || !cesiumContainer.current) return

      // Initialize the Cesium Viewer with async terrain
      const terrainProvider = await Cesium.createWorldTerrainAsync()
      
      if (!mounted) return;

      viewer.current = new Cesium.Viewer(cesiumContainer.current, {
        terrainProvider,
        timeline: true,
        animation: true
      })

      // Convert flight track data to Cesium format
      const flightData = flightTrackData.map(point => ({
        time: point.timestamp,
        lat: point.latitude,
        lon: point.longitude,
        alt: point.altitude
      }))

      // Create position property
      const position = new Cesium.SampledPositionProperty()
      
      flightData.forEach((point, index) => {
        const time = Cesium.JulianDate.fromIso8601(point.time)
        const cartesian = Cesium.Cartesian3.fromDegrees(point.lon, point.lat, point.alt)
        position.addSample(time, cartesian)
      })

      // Add aircraft entity
      viewer.current.entities.add({
        position: position,
        point: { 
          pixelSize: 10,
          color: Cesium.Color.RED 
        },
        label: { 
          text: 'Aircraft',
          font: '14pt monospace',
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM 
        },
        path: {
          resolution: 1,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            color: Cesium.Color.YELLOW
          }),
          width: 10
        }
      })

      // Set up the viewer
      viewer.current.clock.multiplier = 10
      viewer.current.clock.shouldAnimate = true

      // Set initial camera position
      viewer.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          flightData[0].lon,
          flightData[0].lat,
          10000
        )
      })
    }

    initCesium()

    return () => {
      mounted = false;
      if (viewer.current) {
        viewer.current.destroy()
        viewer.current = null
      }
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1200px] p-4">
        <div className="h-[800px] w-full rounded-lg overflow-hidden">
          <div ref={cesiumContainer} className="w-full h-full" />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DebriefModal 