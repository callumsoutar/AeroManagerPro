export interface FlightTrackData {
  fr24_id: string
  lat: number
  lon: number
  track: number
  alt: number
  gspeed: number
  vspeed: number
  squawk: string
  timestamp: string
  source: string
  hex: string
  type: string
  reg: string
}

// Mock responses for our aircraft
export const mockFlightTrackResponses: Record<string, FlightTrackData> = {
  'ZK-ELA': {
    fr24_id: "321a0cc3",
    lat: -40.78265, // Christchurch area
    lon: 175.0928,
    track: 219,
    alt: 3500,
    gspeed: 120,
    vspeed: 0,
    squawk: "6135",
    timestamp: new Date().toISOString(), 
    source: "ADSB",
    hex: "394C19",
    type: "C152",
    reg: "ZK-ELA"
  },
  'ZK-FLC': {
    fr24_id: "321b1dd4",
    lat: -40.9899, //
    lon: 174.9173,
    track: 180,
    alt: 2500,
    gspeed: 110,
    vspeed: -500,
    squawk: "6136",
    timestamp: new Date().toISOString(),
    source: "ADSB",
    hex: "394C20",
    type: "C172",
    reg: "ZK-FLC"
  }
}

          