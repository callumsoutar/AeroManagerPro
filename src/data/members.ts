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
}

export const members: Member[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    membershipNumber: "M001",
    photoUrl: "https://example.com/photo1.jpg",
    status: "Active",
    joinDate: "2023-01-15",
    membershipType: "Full Member",
    licenseType: "PPL",
    lastFlight: "2024-03-20"
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
    lastFlight: "2024-03-15"
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
    lastFlight: "2024-02-28"
  }
]; 