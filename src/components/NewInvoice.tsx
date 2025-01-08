import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { format, addDays } from 'date-fns'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'

interface NewInvoiceProps {
  onClose: () => void;
  selectedUser: string;
  lineItems: any[];
  totalAmount: number;
}

export function NewInvoice({ 
  onClose, 
  selectedUser, 
  lineItems, 
  totalAmount 
}: NewInvoiceProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const formattedAdditionalCharges = lineItems.map(item => ({
    id: item.id,
    type: item.type,
    total: item.total,
    amount: item.amount,
    quantity: item.quantity,
    description: item.description || item.name
  }))

  const handleCreateInvoice = async () => {
    try {
      setIsSubmitting(true)

      const invoiceData = {
        user_id: selectedUser,
        total_amount: totalAmount,
        status: 'pending',
        due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        invoice_number: `INV-${Date.now()}`,
        additional_charges: formattedAdditionalCharges,
        additional_charges_total: totalAmount,
        flight_charges: [],
        flight_charge_total: 0
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select('id')
        .single()

      if (error) {
        console.error('Insert error:', error)
        throw error
      }
      if (!data) throw new Error('No data returned')

      toast.success('Invoice created successfully')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      navigate(`/invoices/${data.id}`)
      onClose()

    } catch (error: any) {
      console.error('Error creating invoice:', error)
      toast.error(error.message || 'Failed to create invoice')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <button 
        onClick={handleCreateInvoice}
        disabled={isSubmitting}
        className="w-full bg-primary text-white py-2 rounded-md disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Invoice'}
      </button>
    </div>
  )
} 