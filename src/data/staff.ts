export interface Staff {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
  qualifications: string[];
  lastFlight: string;
  role: string;
}

export const staff: Staff[] = [
  {
    id: 'staff-1',
    name: 'Diego Acevedo',
    email: 'diego.acevedo@example.com',
    status: 'Active',
    joinDate: '2021-03-15',
    qualifications: ['B License', 'Aerobatics', 'IFR', 'TAWA'],
    lastFlight: '2023-12-23',
    role: 'Senior Instructor'
  },
  {
    id: 'staff-2',
    name: 'Trinity Hart',
    email: 'trinity.hart@example.com',
    status: 'Active',
    joinDate: '2021-06-01',
    qualifications: ['B License', 'Aerobatics', 'IFR'],
    lastFlight: '2023-12-22',
    role: 'Instructor'
  },
  {
    id: 'staff-3',
    name: 'Justin Smith',
    email: 'justin.smith@example.com',
    status: 'Active',
    joinDate: '2022-01-10',
    qualifications: ['B License', 'IFR'],
    lastFlight: '2023-12-23',
    role: 'Instructor'
  },
  {
    id: 'staff-4',
    name: 'Sam Andrews',
    email: 'sam.andrews@example.com',
    status: 'Active',
    joinDate: '2022-03-20',
    qualifications: ['B License', 'Aerobatics'],
    lastFlight: '2023-12-21',
    role: 'Instructor'
  },
  {
    id: 'staff-5',
    name: 'Conor Souness',
    email: 'conor.souness@example.com',
    status: 'Active',
    joinDate: '2023-01-05',
    qualifications: ['C License'],
    lastFlight: '2023-12-20',
    role: 'Junior Instructor'
  },
  {
    id: 'staff-6',
    name: 'Callum Soutar',
    email: 'callum.soutar@example.com',
    status: 'Active',
    joinDate: '2023-02-15',
    qualifications: ['C License'],
    lastFlight: '2023-12-22',
    role: 'Junior Instructor'
  },
]; 