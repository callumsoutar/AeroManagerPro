export interface Booking {
  id: string;
  aircraft: string;
  member: string;
  instructor?: string;
  startTime: string;
  endTime: string;
  status: 'unconfirmed' | 'confirmed' | 'flying' | 'complete';
  checkedOutTime?: string;
  eta?: string;
  type: 'training' | 'hire' | 'check' | 'trial';
  description?: string;
}

export const bookings: Booking[] = [
  {
    id: "1",
    aircraft: "C172 - ZK-ABC",
    member: "John Smith",
    instructor: "Mike Wilson",
    startTime: "2024-03-26T09:00",
    endTime: "2024-03-26T11:00",
    status: "flying",
    checkedOutTime: "09:05",
    eta: "11:00",
    type: "training",
    description: "Circuit training and basic maneuvers practice"
  },
  {
    id: "2",
    aircraft: "PA28 - ZK-XYZ",
    member: "Jane Doe",
    startTime: "2024-03-26T11:30",
    endTime: "2024-03-26T13:30",
    status: "confirmed",
    type: "hire"
  },
  {
    id: "3",
    aircraft: "C152 - ZK-DEF",
    member: "Mike Johnson",
    instructor: "Sarah Brown",
    startTime: "2024-03-26T14:00",
    endTime: "2024-03-26T15:30",
    status: "flying",
    checkedOutTime: "14:10",
    eta: "15:30",
    type: "check"
  },
  {
    id: "4",
    aircraft: "C172 - ZK-JKL",
    member: "Alice Williams",
    startTime: "2024-03-26T15:00",
    endTime: "2024-03-26T17:00",
    status: "unconfirmed",
    type: "hire"
  },
  {
    id: "5",
    aircraft: "C152 - ZK-MNO",
    member: "Tom Brown",
    instructor: "Mike Wilson",
    startTime: "2024-03-26T16:00",
    endTime: "2024-03-26T17:30",
    status: "flying",
    checkedOutTime: "16:05",
    eta: "17:30",
    type: "training"
  }
]; 