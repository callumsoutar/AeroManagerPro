export type ChargeableType = 'Landing Fee' | 'Airways Fee' | 'Other Charges';

export interface Chargeable {
  id: string;
  name: string;
  amount: number;
  type: ChargeableType;
  description: string | null;
}

// Remove any static data here as we'll fetch from the database 