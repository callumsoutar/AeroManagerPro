export interface Aircraft {
  id: string;
  registration: string;
  type: string;
  model: string;
  year: string;
  engineHours: number;
  lastMaintenance: string;
  nextServiceDue: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
  photoUrl?: string;
  currentTacho?: number;
  currentHobbs?: number;
}

export const aircraftData: Aircraft[] = [
  {
    id: 'aircraft-1',
    registration: 'ABC',
    type: 'C172',
    model: 'Skyhawk',
    year: '2018',
    status: 'Active',
    engineHours: 1250,
    lastMaintenance: '2024-02-15',
    nextServiceDue: '2024-04-15',
    photoUrl: 'https://example.com/c172.jpg',
    currentTacho: 2750,
    currentHobbs: 2800
  },
  {
    id: 'aircraft-2',
    registration: 'JEN',
    type: 'A-152',
    model: 'Aerobat',
    year: '1980',
    engineHours: 14200,
    lastMaintenance: '2023-11-15',
    nextServiceDue: '2024-02-15',
    status: 'Active',
    currentTacho: 3100,
    currentHobbs: 3150
  },
  {
    id: 'aircraft-3',
    registration: 'KID',
    type: 'A-152',
    model: 'Aerobat',
    year: '1979',
    engineHours: 13800,
    lastMaintenance: '2023-12-10',
    nextServiceDue: '2024-03-10',
    status: 'Active',
    currentTacho: 2900,
    currentHobbs: 2950
  },
  {
    id: 'aircraft-4',
    registration: 'ELA',
    type: 'C-152',
    model: 'Cessna 152',
    year: '1977',
    engineHours: 11800,
    lastMaintenance: '2024-01-05',
    nextServiceDue: '2024-04-05',
    status: 'Active',
    currentTacho: 2600,
    currentHobbs: 2650
  },
  {
    id: 'aircraft-5',
    registration: 'FPI',
    type: 'C-152',
    model: 'Cessna 152',
    year: '1981',
    engineHours: 10500,
    lastMaintenance: '2024-01-20',
    nextServiceDue: '2024-04-20',
    status: 'Active',
    currentTacho: 2400,
    currentHobbs: 2450
  },
  {
    id: 'aircraft-6',
    registration: 'EKM',
    type: 'C-152',
    model: 'Cessna 152',
    year: '1980',
    engineHours: 12100,
    lastMaintenance: '2023-12-15',
    nextServiceDue: '2024-03-15',
    status: 'Maintenance',
    currentTacho: 2800,
    currentHobbs: 2850
  },
  {
    id: 'aircraft-7',
    registration: 'ELS',
    type: 'A-152',
    model: 'Aerobat',
    year: '1982',
    engineHours: 9800,
    lastMaintenance: '2024-01-10',
    nextServiceDue: '2024-04-10',
    status: 'Active',
    currentTacho: 2200,
    currentHobbs: 2250
  },
  {
    id: 'aircraft-8',
    registration: 'TDL',
    type: 'PA-38',
    model: 'Tomahawk',
    year: '1979',
    engineHours: 11200,
    lastMaintenance: '2023-11-30',
    nextServiceDue: '2024-02-28',
    status: 'Maintenance',
    currentTacho: 2500,
    currentHobbs: 2550
  },
  {
    id: 'aircraft-9',
    registration: 'DRP',
    type: 'C172M',
    model: 'Skyhawk',
    year: '1976',
    engineHours: 13500,
    lastMaintenance: '2024-01-15',
    nextServiceDue: '2024-04-15',
    status: 'Active',
    currentTacho: 3000,
    currentHobbs: 3050
  },
  {
    id: 'aircraft-10',
    registration: 'KAZ',
    type: 'C-172SP',
    model: 'Skyhawk G1000',
    year: '2005',
    engineHours: 8500,
    lastMaintenance: '2024-01-25',
    nextServiceDue: '2024-04-25',
    status: 'Active',
    currentTacho: 1900,
    currentHobbs: 1950
  }
] 