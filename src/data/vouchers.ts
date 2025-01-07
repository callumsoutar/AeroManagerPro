interface Voucher {
  voucher_number: string;
  expiry_date: Date;
  customer_name: string;
  product: string;
  is_valid: boolean;
  redeemed: boolean;
}

export const VOUCHERS: Voucher[] = [
  {
    voucher_number: "TF-2024-1234",
    expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
    customer_name: "John Smith",
    product: "30-min Trial Flight (4 seater)",
    is_valid: true,
    redeemed: false
  }
];

export function validateVoucher(voucherNumber: string): { valid: boolean; message: string; voucher?: Voucher } {
  const voucher = VOUCHERS.find(v => v.voucher_number === voucherNumber);

  if (!voucher) {
    return {
      valid: false,
      message: "Voucher not found"
    };
  }

  if (!voucher.is_valid) {
    return {
      valid: false,
      message: "Voucher is invalid",
      voucher
    };
  }

  if (voucher.redeemed) {
    return {
      valid: false,
      message: "Voucher has already been redeemed",
      voucher
    };
  }

  if (voucher.expiry_date < new Date()) {
    return {
      valid: false,
      message: "Voucher has expired",
      voucher
    };
  }

  return {
    valid: true,
    message: "Voucher is valid",
    voucher
  };
} 