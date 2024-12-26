export interface Chargeable {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: 'landing' | 'instruction' | 'facility' | 'equipment' | 'other';
}

export const chargeables: Chargeable[] = [
  {
    id: '1',
    name: 'Landing Fee',
    description: 'Standard landing fee',
    amount: 25.00,
    category: 'landing'
  },
  {
    id: '2',
    name: 'Instructor Time',
    description: 'Per hour instruction fee',
    amount: 95.00,
    category: 'instruction'
  },
  {
    id: '3',
    name: 'Briefing Fee',
    description: 'Pre-flight briefing',
    amount: 45.00,
    category: 'instruction'
  },
  {
    id: '4',
    name: 'Airways Fee',
    description: 'Standard airways charge',
    amount: 15.00,
    category: 'other'
  },
  {
    id: '5',
    name: 'Headset Rental',
    description: 'Per flight headset rental',
    amount: 10.00,
    category: 'equipment'
  },
  {
    id: '6',
    name: 'Flight Planning Facility',
    description: 'Use of flight planning room',
    amount: 20.00,
    category: 'facility'
  },
  {
    id: '7',
    name: 'Charts Package',
    description: 'Required charts for flight',
    amount: 35.00,
    category: 'equipment'
  },
  {
    id: '8',
    name: 'Ground Handling',
    description: 'Aircraft handling service',
    amount: 30.00,
    category: 'other'
  },
  {
    id: '9',
    name: 'Night Flying Surcharge',
    description: 'Additional fee for night operations',
    amount: 50.00,
    category: 'other'
  },
  {
    id: '10',
    name: 'Training Materials',
    description: 'Student pilot materials pack',
    amount: 40.00,
    category: 'equipment'
  }
] 