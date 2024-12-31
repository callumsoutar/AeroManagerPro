export type ChargeRateType = 
  | 'Aeroclub Dual'
  | 'Non-member Dual'
  | 'Trial Flight'
  | 'Aeroclub Solo';

export interface AircraftChargeRate {
  type: ChargeRateType;
  rate: number;
}

export interface AircraftRates {
  aircraftId: string;  // This should match the aircraft registration
  rates: AircraftChargeRate[];
}

export const aircraftRates: AircraftRates[] = [
  {
    aircraftId: "ABC",  // Cessna 172
    rates: [
      { type: "Aeroclub Dual", rate: 270 },
      { type: "Non-member Dual", rate: 320 },
      { type: "Trial Flight", rate: 299 },
      { type: "Aeroclub Solo", rate: 220 }
    ]
  },
  {
    aircraftId: "KID",  // Cessna 152
    rates: [
      { type: "Aeroclub Dual", rate: 200 },
      { type: "Non-member Dual", rate: 250 },
      { type: "Trial Flight", rate: 229 },
      { type: "Aeroclub Solo", rate: 180 }
    ]
  }
]; 