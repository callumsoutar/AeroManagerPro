export interface InvoiceData {
  id: string;
  invoice_number: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  created_at: string;
  paid_date?: string;
  flight_charges: Array<{
    description: string;
    rate: number;
    units: number;
    amount: number;
  }> | null;
  additional_charges: Array<{
    id: string;
    description: string;
    amount: number;
    quantity: number;
    total: number;
  }> | null;
  user_id?: string;
  booking_id?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    address: string;
    city: string;
  };
  booking?: {
    id: string;
    user_id?: string;
    user?: {
      id: string;
      name: string;
      email: string;
      address: string;
      city: string;
    };
    aircraft?: {
      registration: string;
      type: string;
    };
    flight_type?: {
      name: string;
    };
  };
} 