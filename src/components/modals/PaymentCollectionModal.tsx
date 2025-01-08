import React, { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"

// Define payment method type to match the actual database enum
type PaymentMethod = 'cash' | 'eftpos' | 'bank_transfer' | 'credit_card' | 'voucher' | 'credit';

// Add these type definitions at the top
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

interface PaymentCollectionModalProps {
  open: boolean
  onClose: () => void
  invoiceId: string
  invoiceNumber: string
  totalAmount: number
  onDownloadInvoice: () => void
  userId: string
  creditBalance: number
  useCredit: boolean
  setUseCredit: React.Dispatch<React.SetStateAction<boolean>>
  creditAmount: number
  setCreditAmount: React.Dispatch<React.SetStateAction<number>>
}

export function PaymentCollectionModal({
  open,
  onClose,
  invoiceId,
  invoiceNumber,
  totalAmount,
  userId,
  creditBalance,
  useCredit,
  setUseCredit,
  creditAmount,
  setCreditAmount
}: PaymentCollectionModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  // Debug initial props
  useEffect(() => {
    console.log('PaymentCollectionModal props:', {
      invoiceId,
      invoiceNumber,
      totalAmount,
      userId
    });
  }, [invoiceId, invoiceNumber, totalAmount, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // If using credit for full amount, no payment method needed
      const isFullCreditPayment = useCredit && creditAmount === totalAmount;
      if (!isFullCreditPayment && !paymentMethod) {
        throw new Error('Please select a payment method for the remaining amount')
      }

      // Verify user exists
      const { data: userCheck, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !userCheck) {
        throw new Error('Invalid user reference');
      }

      // Handle credit payment if using credit
      if (useCredit && creditAmount > 0) {
        // Update member_accounts to reduce credit
        const { error: creditError } = await supabase
          .from('member_accounts')
          .update({ 
            credit_balance: creditBalance - creditAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (creditError) throw new Error('Failed to apply credit');

        // Record credit payment
        const { error: paymentError } = await supabase
          .from('payments')
          .insert([{
            invoice_id: invoiceId,
            user_id: userId,
            amount: creditAmount,
            payment_method: 'credit',
            payment_status: 'completed' as PaymentStatus,
            payment_date: new Date().toISOString()
          }]);

        if (paymentError) throw new Error('Failed to record credit payment');
      }

      // Handle remaining amount with regular payment if needed
      if (!isFullCreditPayment) {
        const remainingAmount = totalAmount - (useCredit ? creditAmount : 0);
        
        const { error: paymentError } = await supabase
          .from('payments')
          .insert([{
            invoice_id: invoiceId,
            user_id: userId,
            amount: remainingAmount,
            payment_method: paymentMethod,
            payment_status: 'completed' as PaymentStatus,
            payment_date: new Date().toISOString()
          }]);

        if (paymentError) throw new Error('Failed to record payment');
      }

      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] })
      toast.success('Payment recorded successfully')
      onClose()
    } catch (error: any) {
      console.error('Error processing payment:', error)
      toast.error(error.message || 'Failed to record payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Enter payment details below
          </DialogDescription>
        </DialogHeader>

        {/* Credit Section */}
        {creditBalance > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-blue-900">Available Credit</h3>
                <p className="text-sm text-blue-700">${creditBalance.toFixed(2)}</p>
              </div>
              <Switch
                checked={useCredit}
                onCheckedChange={(checked) => {
                  setUseCredit(checked);
                  if (checked) {
                    setCreditAmount(Math.min(creditBalance, totalAmount));
                  } else {
                    setCreditAmount(0);
                  }
                }}
                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
              />
            </div>

            {useCredit && (
              <div className="space-y-2">
                <Label className="text-blue-900">Amount to Use</Label>
                <Input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setCreditAmount(Math.min(value, creditBalance, totalAmount));
                  }}
                  max={Math.min(creditBalance, totalAmount)}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Show remaining amount if using credit */}
          {useCredit && creditAmount > 0 && (
            <div className="text-sm text-gray-600">
              Remaining to pay: ${(totalAmount - creditAmount).toFixed(2)}
            </div>
          )}

          {/* Only show payment method if not using full credit amount */}
          {(!useCredit || (useCredit && creditAmount < totalAmount)) && (
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eftpos">EFTPOS</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="voucher">Voucher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={
              isSubmitting || 
              (!useCredit && !paymentMethod) || // Need payment method if not using credit
              (useCredit && creditAmount < totalAmount && !paymentMethod) // Need payment method if credit doesn't cover full amount
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Record Payment'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 