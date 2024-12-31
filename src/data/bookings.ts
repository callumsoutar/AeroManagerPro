import type { LessonType } from './lessons'

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
  tachoStart?: number;
  tachoEnd?: number;
  hobbsStart?: number;
  hobbsEnd?: number;
  flightTime?: number;
  lesson?: {
    type: LessonType;
    instructorId: string;
    notes?: string;
    grade?: 1 | 2 | 3 | 4 | 5;
  }
}

export const bookings: Booking[] = [
  {
    id: "1",
    aircraft: "C172 - ZK-ABC",
    member: "John Smith",
    instructor: "Mike Wilson",
    startTime: "2024-12-31T11:00:00",
    endTime: "2024-12-31T15:00:00",
    status: "flying",
    checkedOutTime: "11:05",
    eta: "15:00",
    type: "training",
    description: "Circuit training and basic maneuvers practice",
    tachoStart: 2750.2,
    tachoEnd: 2752.4,
    hobbsStart: 2800.5,
    hobbsEnd: 2803.1,
    flightTime: 2.2
  },
  {
    id: "2",
    aircraft: "PA28 - ZK-XYZ",
    member: "Jane Doe",
    startTime: "2024-12-31T11:30:00",
    endTime: "2024-12-31T13:30:00",
    status: "confirmed",
    type: "hire",
    tachoStart: 1234.5,
    tachoEnd: 1236.1,
    hobbsStart: 1300.2,
    hobbsEnd: 1302.0,
    flightTime: 1.6
  },
  {
    id: "3",
    aircraft: "C152 - ZK-DEF",
    member: "Mike Johnson",
    instructor: "Sarah Brown",
    startTime: "2024-12-31T14:00:00",
    endTime: "2024-12-31T15:30:00",
    status: "flying",
    checkedOutTime: "14:10",
    eta: "15:30",
    type: "check"
  },
  {
    id: "4",
    aircraft: "C172 - ZK-JKL",
    member: "Alice Williams",
    startTime: "2024-12-31T15:00:00",
    endTime: "2024-12-31T17:00:00",
    status: "unconfirmed",
    type: "hire"
  },
  {
    id: "5",
    aircraft: "C152 - ZK-MNO",
    member: "Tom Brown",
    instructor: "Mike Wilson",
    startTime: "2024-12-31T16:00:00",
    endTime: "2024-12-31T17:30:00",
    status: "flying",
    checkedOutTime: "16:05",
    eta: "17:30",
    type: "training"
  }
]; 