export interface PackageItem {
  id: string;
  name: string;
  type: 'currency' | 'count';
  totalValue: number;
  usedValue: number;
  unit?: string;
}

export interface Package {
  id: string;
  name: string;
  memberId: string;
  items: PackageItem[];
  purchaseDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'completed';
}

export const memberPackages: Package[] = [
  {
    id: "1",
    name: "Basic Training Pack",
    memberId: "1", // John Smith's ID
    items: [
      {
        id: "item1",
        name: "Flight Instruction",
        type: "currency",
        totalValue: 7715,
        usedValue: 3000,
        unit: "NZD"
      },
      {
        id: "item2",
        name: "Ground Courses",
        type: "count",
        totalValue: 6,
        usedValue: 2
      }
    ],
    purchaseDate: "2024-01-01",
    expiryDate: "2024-12-31",
    status: "active"
  }
]; 