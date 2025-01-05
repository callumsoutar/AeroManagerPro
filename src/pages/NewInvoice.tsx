"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { X, Send, Download, Check, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useChargeables } from '../hooks/useChargeables'
import { useUsers } from '../hooks/useUsers'
import { toast, Toaster } from 'sonner'
import { ChargeableType } from '../data/chargeables'
import { cn } from "../lib/utils"
import { useClickOutside } from '../hooks/useClickOutside'

// Create a type for the selected user that includes all required fields
type SelectedUser = {
  id: string
  first_name: string
  last_name: string
  email?: string | null
  phone: string | null
  address: string | null
  city: string | null
}

interface InvoiceItem {
  id: string
  name: string
  amount: number
  type: ChargeableType
  quantity: number
  description?: string
}

const generateInvoicePDF = async (invoiceId: string, invoiceNumber: string) => {
  try {
    const html2pdf = require('html2pdf.js')
    
    toast.loading('Preparing invoice PDF...')

    const { data: invoiceData, error } = await supabase
      .from('invoices')
      .select(`
        *,
        user:user_id (
          first_name,
          last_name,
          email,
          address,
          city,
          phone
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (error) throw error

    setTimeout(() => {
      const element = document.getElementById('invoice-content')
      if (!element) {
        toast.error('Could not generate PDF')
        return
      }

      const invoiceNumberElement = element.querySelector('.invoice-number')
      if (invoiceNumberElement && invoiceData) {
        invoiceNumberElement.textContent = invoiceData.invoice_number
      }

      const opt = {
        margin: 10,
        filename: `invoice-${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      }

      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          toast.success('Invoice PDF generated successfully')
        })
        .catch((error: unknown) => {
          console.error('PDF generation error:', error)
          toast.error('Failed to generate PDF')
        })
    }, 500)

  } catch (error) {
    console.error('PDF generation error:', error)
    toast.error('Failed to generate PDF')
  }
}

export function NewInvoice() {
  const navigate = useNavigate()
  const { data: users = [] } = useUsers()
  const { data: chargeables = [] } = useChargeables()
  
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null)
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = useState<string | null>(null)
  const [memberSearchOpen, setMemberSearchOpen] = useState(false)
  const [reference, setReference] = useState('')
  const [chargeSearchQuery, setChargeSearchQuery] = useState('')
  const [isChargeSearchOpen, setIsChargeSearchOpen] = useState(false)
  const [memberSearchQuery, setMemberSearchQuery] = useState('')

  const chargeSearchRef = useRef<HTMLDivElement>(null)
  const memberSearchRef = useRef<HTMLDivElement>(null)

  useClickOutside(chargeSearchRef, () => {
    setIsChargeSearchOpen(false)
  })

  useClickOutside(memberSearchRef, () => {
    setMemberSearchOpen(false)
  })

  useEffect(() => {
    if (createdInvoiceId && createdInvoiceNumber) {
      // Clear the search and close dropdowns
      setChargeSearchQuery('')
      setMemberSearchQuery('')
      setIsChargeSearchOpen(false)
      setMemberSearchOpen(false)
    }
  }, [createdInvoiceId, createdInvoiceNumber])

  // Calculate total amount
  const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0)

  const filteredCharges = useMemo(() => {
    const query = chargeSearchQuery.toLowerCase()
    return chargeables.filter(charge => 
      charge.name.toLowerCase().includes(query) ||
      charge.type.toLowerCase().includes(query)
    )
  }, [chargeSearchQuery, chargeables])

  const filteredUsers = useMemo(() => {
    const query = memberSearchQuery.toLowerCase()
    return users.filter(user => 
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    )
  }, [memberSearchQuery, users])

  const selectedUserDetails = useMemo(() => {
    const user = users.find(user => user.id === selectedUser)
    if (!user) return undefined

    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || null,
      address: user.address || null,
      city: user.city || null
    } as SelectedUser
  }, [selectedUser, users])

  const handleCreateInvoice = async () => {
    try {
      if (!selectedUser) {
        toast.error('Please select a member')
        return
      }

      if (lineItems.length === 0) {
        toast.error('Please add at least one item to the invoice')
        return
      }

      setIsSubmitting(true)
      console.log('Creating invoice with:', { selectedUser, lineItems, totalAmount })

      // Format line items for JSONB storage
      const formattedAdditionalCharges = lineItems.map(item => ({
        id: item.id,
        type: item.type,
        total: item.amount * item.quantity,
        amount: item.amount,
        quantity: item.quantity,
        description: item.name
      }))

      console.log('Formatted additional charges:', formattedAdditionalCharges)

      // Create invoice record
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: selectedUser,
          total_amount: totalAmount,
          status: 'pending',
          due_date: dueDate,
          created_at: new Date().toISOString(),
          additional_charges_total: totalAmount,
          additional_charges: formattedAdditionalCharges,
          invoice_number: `INV-${Date.now()}` // You might want to implement a proper invoice number generator
        })
        .select()
        .single()

      if (invoiceError) {
        console.error('Error creating invoice:', invoiceError)
        throw invoiceError
      }

      console.log('Created invoice:', invoice)

      // Create invoice_chargeables records for tracking
      if (invoice) {
        const chargeableItems = lineItems.map(item => ({
          invoice_id: invoice.id,
          chargeable_id: item.id,
          quantity: item.quantity,
          amount: item.amount,
          charge_type: 'additional_charge',
          created_at: new Date().toISOString()
        }))

        console.log('Creating invoice chargeables:', chargeableItems)

        const { error: chargeablesError } = await supabase
          .from('invoice_chargeables')
          .insert(chargeableItems)

        if (chargeablesError) {
          console.error('Error creating invoice chargeables:', chargeablesError)
          throw chargeablesError
        }

        setCreatedInvoiceId(invoice.id)
        setCreatedInvoiceNumber(invoice.invoice_number)
        
        // Navigate to the invoice details page after creation
        navigate(`/invoices/${invoice.id}`, {
          state: { 
            message: 'Invoice created successfully',
            description: `Invoice #${invoice.invoice_number} has been created.`
          }
        })
      }
    } catch (error) {
      console.error('Error in handleCreateInvoice:', error)
      toast.error('Failed to create invoice', {
        description: 'Please try again or contact support.',
        duration: 4000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              New Invoice
            </h1>
            <Badge variant="secondary" className={cn(
              "bg-opacity-20",
              createdInvoiceId ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
            )}>
              {createdInvoiceId ? "Approved" : "Draft"}
            </Badge>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/invoices')}>
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Invoice Details */}
        <div className="col-span-2 space-y-6">
          {/* Member Search */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Invoice Details</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Member Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Member</label>
                <div className="relative" ref={memberSearchRef}>
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    value={memberSearchQuery}
                    onChange={(e) => {
                      setMemberSearchQuery(e.target.value)
                      setMemberSearchOpen(e.target.value.length >= 2)
                    }}
                    onFocus={() => {
                      if (memberSearchQuery.length >= 2) {
                        setMemberSearchOpen(true)
                      }
                    }}
                    placeholder={
                      selectedUserDetails 
                        ? `Selected: ${selectedUserDetails.first_name} ${selectedUserDetails.last_name}`
                        : "Search members..."
                    }
                    className={cn(
                      "pl-9 w-full bg-white",
                      selectedUserDetails && !memberSearchQuery && "text-gray-500"
                    )}
                  />
                  {memberSearchOpen && memberSearchQuery.length >= 2 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                      <div className="max-h-[300px] overflow-auto p-1">
                        {filteredUsers.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500 text-center">
                            No members found
                          </div>
                        ) : (
                          <>
                            {filteredUsers.map((user) => (
                              <button
                                key={user.id}
                                onClick={() => {
                                  setSelectedUser(user.id)
                                  setMemberSearchQuery('')
                                  setMemberSearchOpen(false)
                                }}
                                className={cn(
                                  "w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center justify-between group",
                                  selectedUser === user.id && "bg-green-50"
                                )}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {user.first_name} {user.last_name}
                                  </span>
                                  {user.email && (
                                    <span className="text-sm text-gray-500">
                                      {user.email}
                                    </span>
                                  )}
                                </div>
                                <Check 
                                  className={cn(
                                    "h-4 w-4",
                                    selectedUser === user.id ? "text-green-600" : "text-transparent"
                                  )}
                                />
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selectedUserDetails && (
                  <div className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Selected: {selectedUserDetails.first_name} {selectedUserDetails.last_name}
                  </div>
                )}
              </div>

              {/* Invoice Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Invoice Date</label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>

              {/* Reference Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Reference</label>
                <Input
                  type="text"
                  placeholder="Enter reference number"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Due Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Customer Details Section */}
          {selectedUserDetails && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Customer Details</h3>
                <Badge variant="outline" className="text-blue-600 bg-blue-50">
                  Bill To
                </Badge>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>{' '}
                    <span className="font-medium">
                      {selectedUserDetails.first_name} {selectedUserDetails.last_name}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Email:</span>{' '}
                    <span>{selectedUserDetails.email || '-'}</span>
                  </div>
                  
                  {selectedUserDetails.phone && (
                    <div>
                      <span className="text-gray-500">Phone:</span>{' '}
                      <span>{selectedUserDetails.phone}</span>
                    </div>
                  )}

                  {(selectedUserDetails.address || selectedUserDetails.city) && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Address:</span>{' '}
                      <span>
                        {[
                          selectedUserDetails.address,
                          selectedUserDetails.city
                        ].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Charge Search Integrated */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Add Charges</h2>
            </div>

            <div className="space-y-4">
              <div className="relative" ref={chargeSearchRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  value={chargeSearchQuery}
                  onChange={(e) => {
                    setChargeSearchQuery(e.target.value)
                    setIsChargeSearchOpen(true)
                  }}
                  onFocus={() => setIsChargeSearchOpen(true)}
                  placeholder="Search for charges..."
                  className="pl-9 w-full bg-white"
                />
                {isChargeSearchOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                    <div className="max-h-[300px] overflow-auto p-1">
                      {filteredCharges.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          No charges found
                        </div>
                      ) : (
                        filteredCharges.map((charge) => (
                          <button
                            key={charge.id}
                            onClick={() => {
                              setLineItems(prev => [...prev, {
                                id: charge.id,
                                name: charge.name,
                                amount: charge.amount,
                                type: charge.type,
                                quantity: 1
                              }])
                              // Close dropdown after selection
                              setIsChargeSearchOpen(false)
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center justify-between group"
                          >
                            <div>
                              <span className="font-medium">{charge.name}</span>
                              <span className="ml-2 text-sm text-gray-500">
                                ({charge.type})
                              </span>
                            </div>
                            <span className="font-medium text-green-600">
                              ${charge.amount.toFixed(2)}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Added Charges Preview */}
              {lineItems.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-500 mb-2">Added Charges</div>
                  <div className="space-y-2">
                    {Object.entries(
                      lineItems.reduce((acc, item) => {
                        if (!acc[item.type]) acc[item.type] = [];
                        acc[item.type].push(item);
                        return acc;
                      }, {} as Record<string, InvoiceItem[]>)
                    ).map(([type, items]) => (
                      <div key={type} className="bg-gray-50 rounded-lg p-2">
                        <div className="text-xs font-medium text-gray-500 mb-1">{type}</div>
                        {items.map((item, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between text-sm py-1"
                          >
                            <span>{item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">
                                ${(item.amount * item.quantity).toFixed(2)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLineItems(prev => 
                                  prev.filter((_, idx) => idx !== lineItems.indexOf(item))
                                )}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
            </div>
            
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes or payment instructions..."
              className="min-h-[120px]"
            />
          </div>
        </div>

        {/* Right Column - Invoice Summary */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">Invoice Summary</h2>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              {lineItems.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="text-xs font-medium text-gray-500">
                        <th className="px-3 py-2 text-left">Item</th>
                        <th className="px-2 py-2 text-center w-16">Qty</th>
                        <th className="px-2 py-2 text-right w-20">Amount</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {lineItems.map((item, index) => (
                        <tr key={index} className="text-sm">
                          <td className="px-3 py-2">{item.name}</td>
                          <td className="px-2 py-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const qty = parseInt(e.target.value) || 1
                                setLineItems(prev => prev.map((i, idx) => 
                                  idx === index ? { ...i, quantity: qty } : i
                                ))
                              }}
                              className="h-8 w-16 text-center"
                            />
                          </td>
                          <td className="px-2 py-2 text-right">
                            ${(item.amount * item.quantity).toFixed(2)}
                          </td>
                          <td className="px-2 py-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLineItems(prev => prev.filter((_, idx) => idx !== index))}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No items added yet
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleCreateInvoice}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </Button>
                
                {createdInvoiceId && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => generateInvoicePDF(createdInvoiceId, createdInvoiceNumber || '')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // Implement send logic here
                        toast.info('Send functionality coming soon')
                      }}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send to Member
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {createdInvoiceId && (
        <div id="invoice-content" className="hidden">
          <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              {/* Invoice template content */}
              <h1 className="text-2xl font-bold mb-4">Invoice #{createdInvoiceNumber}</h1>
              {/* Add more invoice template content here */}
            </div>
          </div>
        </div>
      )}

      <Toaster richColors />
    </div>
  )
} 