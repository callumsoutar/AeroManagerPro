export type EquipmentType = 
  | 'Annual'
  | '100 Hour'
  | 'ARA'
  | 'Transponder'
  | 'ELT'
  | 'Pitot/Static'
  | 'Radio'
  | 'Compass';

export interface Equipment {
  id: string;
  aircraftId: string;
  type: EquipmentType;
  lastCompleted: string;  // ISO date string
  nextDue: string;       // ISO date string
  hoursCompleted: number;
  hoursDue: number;
  daysRemaining: number;
  hoursRemaining: number;
  notes?: string;
}

export const equipmentData: Equipment[] = [
  {
    id: "1",
    aircraftId: "aircraft-1", // C172 - ABC
    type: "Annual",
    lastCompleted: "2023-12-15",
    nextDue: "2024-12-15",
    hoursCompleted: 2700,
    hoursDue: 2900,
    daysRemaining: 120,
    hoursRemaining: 150
  },
  {
    id: "2",
    aircraftId: "aircraft-1",
    type: "100 Hour",
    lastCompleted: "2024-02-01",
    nextDue: "2024-05-01",
    hoursCompleted: 2700,
    hoursDue: 2800,
    daysRemaining: 30,
    hoursRemaining: 50
  },
  {
    id: "3",
    aircraftId: "aircraft-1",
    type: "ARA",
    lastCompleted: "2024-01-15",
    nextDue: "2024-04-15",
    hoursCompleted: 2650,
    hoursDue: 2850,
    daysRemaining: 90,
    hoursRemaining: 100
  },
  {
    id: "4",
    aircraftId: "aircraft-2", // A-152 - JEN
    type: "Annual",
    lastCompleted: "2023-11-01",
    nextDue: "2024-11-01",
    hoursCompleted: 3000,
    hoursDue: 3200,
    daysRemaining: 90,
    hoursRemaining: 100
  }
  // Add more equipment as needed
]; 