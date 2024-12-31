export type MembershipType = 'Flying Member' | 'Non-Flying Member' | 'Senior Member' | 'Staff Member';

export interface Membership {
  id: string;
  memberId: string;
  type: MembershipType;
  startDate: string;  // ISO date string
  endDate: string;    // ISO date string
  isActive: boolean;
  yearlyFee: number;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  paymentDate?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  membershipNumber: string;
  photoUrl?: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
  membershipType: string;
  licenseType: string;
  lastFlight: string;
  isMember: boolean;
  memberships: Membership[];
}

export const members: Member[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    membershipNumber: "M001",
    photoUrl: "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
    status: "Active",
    joinDate: "2023-01-15",
    membershipType: "Full Member",
    licenseType: "PPL",
    lastFlight: "2024-03-20",
    isMember: true,
    memberships: [
      {
        id: "mem1",
        memberId: "1",
        type: "Flying Member",
        startDate: "2024-04-01",
        endDate: "2025-03-31",
        isActive: true,
        yearlyFee: 150,
        paymentStatus: "Paid",
        paymentDate: "2024-03-15"
      },
      {
        id: "mem2",
        memberId: "1",
        type: "Flying Member",
        startDate: "2023-04-01",
        endDate: "2024-03-31",
        isActive: false,
        yearlyFee: 150,
        paymentStatus: "Paid",
        paymentDate: "2023-03-20"
      }
    ]
  },
  {
    id: "2",
    name: "Jane Doe",
    email: "jane.doe@example.com",
    membershipNumber: "M002",
    status: "Active",
    joinDate: "2023-03-20",
    membershipType: "Student",
    licenseType: "Student Pilot",
    lastFlight: "2024-03-15",
    isMember: true,
    memberships: [
      {
        id: "mem3",
        memberId: "2",
        type: "Flying Member",
        startDate: "2024-04-01",
        endDate: "2025-03-31",
        isActive: true,
        yearlyFee: 150,
        paymentStatus: "Paid",
        paymentDate: "2024-03-15"
      },
      {
        id: "mem4",
        memberId: "2",
        type: "Flying Member",
        startDate: "2023-04-01",
        endDate: "2024-03-31",
        isActive: false,
        yearlyFee: 150,
        paymentStatus: "Paid",
        paymentDate: "2023-03-20"
      }
    ]
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    membershipNumber: "M003",
    photoUrl: "https://example.com/photo3.jpg",
    status: "Inactive",
    joinDate: "2022-11-30",
    membershipType: "Associate",
    licenseType: "CPL",
    lastFlight: "2024-02-28",
    isMember: false,
    memberships: []
  }
]; 