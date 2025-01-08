import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Loader2, CreditCard, Banknote, Building2, Receipt, Gift, Check } from 'lucide-react'
import { cn } from "../../lib/utils"
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

interface PaymentDialogProps {
  open: boolean
  onClose: () => void
  invoiceId: string
  userId: string
  totalAmount: number
  onPaymentComplete: () => void
}

const PRIMARY_PAYMENT_METHODS = [
  {
    id: 'eftpos',
    label: 'EFTPOS',
    icon: CreditCard,
    description: 'Pay using EFTPOS terminal',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-50/80'
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    icon: Building2,
    description: 'Direct bank transfer',
    color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-50/80'
  },
  {
    id: 'voucher',
    label: 'Voucher',
    icon: Gift,
    description: 'Redeem a voucher',
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-50/80'
  }
] as const;

const SECONDARY_PAYMENT_METHODS = [
  {
    id: 'cash',
    label: 'Cash',
    icon: Banknote,
    description: 'Pay with cash',
    color: 'bg-gray-50 border-gray-200 hover:bg-gray-50/80'
  }
] as const;


// Add this interface at the top with other interfaces
interface Payment {
  id: string;
  receipt_number: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  user_id: string;
  invoice_id: string;
}

const SYSTEM_USER_ID = 'db5180c7-6b91-489b-9aa2-8ba0faecfd40'

export function PaymentDialog({ 
  open, 
  onClose, 
  invoiceId, 
  userId,
  totalAmount,
  onPaymentComplete 
}: PaymentDialogProps) {
  const [amount, setAmount] = useState(totalAmount.toString())
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isSuccess] = useState(false)
  const [newPayment] = useState<Payment | null>(null)

  // Add credit balance query
  const { data: creditBalance = 0 } = useQuery({
    queryKey: ['member-credit', userId],
    queryFn: async () => {
      if (!userId) return 0;

      const { data, error } = await supabase
        .from('member_accounts')
        .select('credit_balance')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching credit balance:', error)
        return 0
      }
      return data?.credit_balance || 0
    },
    enabled: !!userId
  })

  // Add state for using credit
  const [useCredit, setUseCredit] = useState(false)
  const [creditAmount, setCreditAmount] = useState(0)

  // Calculate remaining amount after credit
  const remainingAmount = totalAmount - creditAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!userId) {
        toast.error('No user associated with this invoice')
        return
      }

      // Handle full credit payment or partial credit payment
      if (useCredit && creditAmount > 0) {
        // Update member's credit balance
        const { error: creditUpdateError } = await supabase
          .from('member_accounts')
          .update({ 
            credit_balance: creditBalance - creditAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (creditUpdateError) throw creditUpdateError;

        // Record credit payment
        const { error: creditPaymentError } = await supabase
          .from('payments')
          .insert({
            invoice_id: invoiceId,
            user_id: userId,
            amount: creditAmount,
            payment_method: 'credit',  // Always 'credit' when using credit balance
            payment_date: new Date().toISOString(),
            created_by: SYSTEM_USER_ID,
            reference_number: reference || null,
            notes: notes ? `Credit payment: ${notes}` : 'Credit payment'
          });

        if (creditPaymentError) throw creditPaymentError;
      }

      // Handle remaining amount if credit doesn't cover full amount
      const remainingAmount = totalAmount - (useCredit ? creditAmount : 0);
      if (remainingAmount > 0 && paymentMethod) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            invoice_id: invoiceId,
            user_id: userId,
            amount: remainingAmount,
            payment_method: paymentMethod,  // Selected payment method for remaining amount
            payment_date: new Date().toISOString(),
            reference_number: reference || null,
            notes: notes || null,
            created_by: SYSTEM_USER_ID
          });

        if (paymentError) throw paymentError;
      }

      toast.success('Payment processed successfully')
      onPaymentComplete()
      onClose()
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Failed to process payment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Payment</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Select a payment method to continue
          </DialogDescription>
        </DialogHeader>

        {/* Add Credit Section if credit exists */}
        {creditBalance > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-blue-900">Available Credit</h3>
                <p className="text-sm text-blue-600">${creditBalance.toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useCredit"
                  checked={useCredit}
                  onChange={(e) => {
                    setUseCredit(e.target.checked)
                    setCreditAmount(e.target.checked ? Math.min(creditBalance, totalAmount) : 0)
                  }}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="useCredit" className="text-sm font-medium text-blue-900">
                  Use Credit
                </label>
              </div>
            </div>
            {useCredit && (
              <div className="space-y-2 mt-3">
                <Label className="text-sm font-medium text-blue-900">Amount to Use</Label>
                <Input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value)
                    setCreditAmount(Math.min(value, creditBalance, totalAmount))
                  }}
                  max={Math.min(creditBalance, totalAmount)}
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            )}
          </div>
        )}

        {/* Show remaining amount if using credit */}
        {useCredit && creditAmount > 0 && (
          <div className="text-sm text-gray-500 mb-4">
            Remaining to pay: ${remainingAmount.toFixed(2)}
          </div>
        )}

        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 mx-auto flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Successful</h3>
            <p className="text-sm text-gray-500">
              Receipt #{newPayment?.receipt_number}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Amount Due</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 h-12 text-lg font-medium"
                  required
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid grid-cols-1 gap-3"
              >
                {PRIMARY_PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={cn(
                      "flex items-center space-x-3 space-y-0 rounded-lg border p-4",
                      "cursor-pointer transition-colors relative",
                      method.color,
                      paymentMethod === method.id && "ring-2 ring-blue-600 ring-offset-1"
                    )}
                  >
                    <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                    <method.icon className={cn(
                      "h-5 w-5",
                      paymentMethod === method.id ? "text-blue-600" : "text-gray-500"
                    )} />
                    <div className="flex-1">
                      <p className={cn(
                        "font-medium",
                        paymentMethod === method.id && "text-blue-600"
                      )}>{method.label}</p>
                      <p className="text-xs text-gray-600">{method.description}</p>
                    </div>
                    {paymentMethod === method.id && (
                      <div className="absolute right-4 animate-slide-up">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                      </div>
                    )}
                  </label>
                ))}

                {/* More Payment Options */}
                {showMoreOptions && SECONDARY_PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={cn(
                      "flex items-center space-x-3 space-y-0 rounded-lg border p-4",
                      "cursor-pointer transition-colors relative",
                      method.color,
                      paymentMethod === method.id && "ring-2 ring-blue-600 ring-offset-1"
                    )}
                  >
                    <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                    <method.icon className={cn(
                      "h-5 w-5",
                      paymentMethod === method.id ? "text-blue-600" : "text-gray-500"
                    )} />
                    <div className="flex-1">
                      <p className={cn(
                        "font-medium",
                        paymentMethod === method.id && "text-blue-600"
                      )}>{method.label}</p>
                      <p className="text-xs text-gray-600">{method.description}</p>
                    </div>
                    {paymentMethod === method.id && (
                      <div className="absolute right-4 animate-slide-up">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                      </div>
                    )}
                  </label>
                ))}
              </RadioGroup>

              {/* More Options Button */}
              <button
                type="button"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                {showMoreOptions ? (
                  <>Show less options</>
                ) : (
                  <>Show more payment options</>
                )}
              </button>
            </div>

            {/* Optional fields in a grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Reference (Optional)</Label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Enter reference number"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Notes (Optional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes"
                  className="h-10"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg mt-2"
              disabled={
                isSubmitting || 
                (!useCredit && !paymentMethod) ||  // Need payment method if not using credit
                (useCredit && creditAmount < totalAmount && !paymentMethod)  // Need payment method if credit doesn't cover full amount
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Receipt className="mr-2 h-5 w-5" />
                  Record Payment
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 