export interface Defect {
  id: string;
  aircraft: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  reportedDate: string;
}

export const currentDefects: Defect[] = [
  {
    id: '1',
    aircraft: 'C172 - ZK-ABC',
    description: 'Oil pressure gauge showing intermittent readings',
    status: 'Open',
    reportedDate: '2024-03-25'
  },
  {
    id: '2',
    aircraft: 'PA28 - ZK-XYZ',
    description: 'Right main tire showing excessive wear',
    status: 'In Progress',
    reportedDate: '2024-03-24'
  },
  {
    id: '3',
    aircraft: 'C152 - ZK-DEF',
    description: 'Annual inspection due in 5 days',
    status: 'Open',
    reportedDate: '2024-03-23'
  }
] 