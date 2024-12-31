export interface Defect {
  id: string;
  aircraft: string;
  name: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  reportedDate: string;
  comments?: DefectComment[];
}

export interface DefectComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  timestamp: string;
}

export const currentDefects: Defect[] = [
  {
    id: '1',
    aircraft: 'C172 - ZK-ABC',
    name: 'Oil Pressure Gauge Issue',
    description: 'Oil pressure gauge showing intermittent readings during cruise flight',
    status: 'Open',
    reportedDate: '2024-03-25',
    comments: [
      {
        id: 'c1',
        userId: 'user1',
        userName: 'John Smith',
        comment: 'Noticed fluctuations between 40-60 PSI during level flight',
        timestamp: '2024-03-25T10:30:00Z'
      }
    ]
  },
  {
    id: '2',
    aircraft: 'PA28 - ZK-XYZ',
    name: 'Right Main Tire Wear',
    description: 'Right main tire showing excessive wear on outer edge',
    status: 'In Progress',
    reportedDate: '2024-03-24',
    comments: [
      {
        id: 'c2',
        userId: 'user2',
        userName: 'Mike Wilson',
        comment: 'Scheduled for replacement next week',
        timestamp: '2024-03-24T15:20:00Z'
      }
    ]
  },
  {
    id: '3',
    aircraft: 'C152 - ZK-DEF',
    name: 'Annual Inspection Due',
    description: 'Annual inspection coming up in 5 days',
    status: 'Open',
    reportedDate: '2024-03-23'
  }
] 