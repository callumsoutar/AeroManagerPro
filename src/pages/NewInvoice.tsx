"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Send, Download, Check, Search, Loader2, ChevronDown, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useChargeables } from '../hooks/useChargeables'
import { useUsers } from '../hooks/useUsers'
import { toast, Toaster } from 'sonner'
import { ChargeableType } from '../data/chargeables'
import { cn } from "../lib/utils"
import { useClickOutside } from '../hooks/useClickOutside'
import { Textarea } from "../components/ui/textarea"

// Add this helper function near the top of the file
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

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
  const [reference, setReference] = useState<string>('')
  const [chargeSearchQuery, setChargeSearchQuery] = useState('')
  const [isChargeSearchOpen, setIsChargeSearchOpen] = useState(false)
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)

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
      const invoiceData = {
        user_id: selectedUser,
        invoice_number: `INV-${Date.now()}`,
        total_amount: totalAmount,
        status: 'pending',
        due_date: dueDate,
        created_at: new Date().toISOString(),
        additional_charges_total: totalAmount,
        additional_charges: formattedAdditionalCharges,
        reference: reference || null
      }

      console.log('Formatted invoice data:', invoiceData)

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceData)
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
    <div className="min-h-screen bg-gray-50/30 py-8 px-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-gray-900">New Invoice</h1>
            <p className="text-gray-500">Create a new invoice for a member or flight</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={cn(
              "px-3 py-1.5",
              createdInvoiceId ? "bg-green-50 text-green-700 border-green-200" : 
              "bg-blue-50 text-blue-700 border-blue-200"
            )}>
              {createdInvoiceId ? "Invoice Created" : "Draft"}
            </Badge>
            <Button 
              variant="outline" 
              onClick={() => navigate('/invoices')}
              className="border-gray-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* Left Column - Form Fields */}
        <div className="col-span-7 space-y-6">
          {/* Member Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-blue-500 rounded-full" />
                <h2 className="text-lg font-semibold text-gray-900">Member Details</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-6 overflow-visible">
              {/* Member Search */}
              <div className="grid grid-cols-2 gap-6 overflow-visible">
                <div className="relative overflow-visible" ref={memberSearchRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Member
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      value={memberSearchQuery}
                      onChange={(e) => {
                        setMemberSearchQuery(e.target.value)
                        setMemberSearchOpen(e.target.value.length >= 2)
                      }}
                      placeholder={selectedUserDetails 
                        ? `Selected: ${selectedUserDetails.first_name} ${selectedUserDetails.last_name}`
                        : "Search members by name or email..."}
                      className="pl-9 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Member Search Results Dropdown */}
                  {memberSearchOpen && memberSearchQuery.length >= 2 && (
                    <div 
                      className="absolute z-[100] bg-white rounded-lg border border-gray-200 shadow-lg"
                      style={{
                        width: memberSearchRef.current?.offsetWidth || 'auto',
                        top: '100%',
                        left: 0,
                        marginTop: '4px',
                        maxHeight: '300px',
                        overflow: 'auto'
                      }}
                    >
                      <div className="p-2">
                        {filteredUsers.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500 text-center">
                            No members found
                          </div>
                        ) : (
                          filteredUsers.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => {
                                setSelectedUser(user.id)
                                setMemberSearchQuery('')
                                setMemberSearchOpen(false)
                              }}
                              className={cn(
                                "w-full text-left px-4 py-3 rounded-lg transition-colors",
                                "hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
                                selectedUser === user.id && "bg-blue-50"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {user.first_name} {user.last_name}
                                  </p>
                                  {user.email && (
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                  )}
                                </div>
                                <Check className={cn(
                                  "h-4 w-4",
                                  selectedUser === user.id ? "text-blue-600" : "text-transparent"
                                )} />
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reference Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reference (Optional)
                  </label>
                  <Input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g., Flight Training, Membership"
                    className="bg-white border-gray-200"
                  />
                </div>
              </div>

              {/* Bill To section remains the same */}
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

              {/* Invoice Dates Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Invoice Date
                  </label>
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="bg-white border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-white border-gray-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-purple-500 rounded-full" />
                <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
              </div>
            </div>
            
            <div className="p-6 overflow-visible">
              <div className="relative overflow-visible" ref={chargeSearchRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Items
                </label>
                <Input
                  value={chargeSearchQuery}
                  onChange={(e) => {
                    setChargeSearchQuery(e.target.value)
                    setIsChargeSearchOpen(true)
                  }}
                  placeholder="Search for items..."
                  className="w-full bg-white border-gray-200"
                />
                
                {isChargeSearchOpen && filteredCharges.length > 0 && (
                  <div 
                    className="absolute z-[100] bg-white rounded-lg border border-gray-200 shadow-lg"
                    style={{
                      width: chargeSearchRef.current?.offsetWidth || 'auto',
                      top: '100%',
                      left: 0,
                      marginTop: '4px',
                      maxHeight: '300px',
                      overflow: 'auto'
                    }}
                  >
                    <div className="p-2">
                      {filteredCharges.map((charge) => (
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
                            setIsChargeSearchOpen(false)
                          }}
                          className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-center">
                            <span>{charge.name}</span>
                            <span className="text-green-600">{formatCurrency(charge.amount)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setIsNotesExpanded(!isNotesExpanded)}
              className="w-full border-b border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-orange-500 rounded-full" />
                  <h2 className="text-lg font-semibold text-gray-900">Additional Information</h2>
                </div>
                <ChevronDown 
                  className={cn(
                    "h-5 w-5 text-gray-500 transition-transform duration-200",
                    isNotesExpanded && "transform rotate-180"
                  )} 
                />
              </div>
            </button>
            
            {isNotesExpanded && (
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                    placeholder="Add any additional notes or payment instructions..."
                    className="bg-white border-gray-200 min-h-[120px]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Invoice Summary */}
        <div className="col-span-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-green-500 rounded-full" />
                <h2 className="text-lg font-semibold text-gray-900">Invoice Summary</h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Line Items Table */}
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">
                      Item
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">
                      Qty
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">
                      Amount
                    </th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lineItems.map((item, index) => (
                    <tr key={index} className="text-sm">
                      <td className="py-2 px-4">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-gray-500 text-xs">{item.type}</div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex justify-end">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const quantity = parseInt(e.target.value) || 1;
                              setLineItems(prev => prev.map(i => 
                                i.id === item.id ? { ...i, quantity } : i
                              ));
                            }}
                            className="h-8 w-16 text-right text-sm"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex justify-end">
                          <div className="relative w-20">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={item.amount}
                              onChange={(e) => {
                                const amount = parseFloat(e.target.value) || 0;
                                setLineItems(prev => prev.map(i => 
                                  i.id === item.id ? { ...i, amount } : i
                                ));
                              }}
                              className="h-8 w-20 text-right text-sm pl-6"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => {
                            setLineItems(prev => prev.filter(i => i.id !== item.id));
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {lineItems.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">
                        No items added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-6">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 h-11"
                  onClick={handleCreateInvoice}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Invoice...
                    </div>
                  ) : 'Create Invoice'}
                </Button>
                
                {createdInvoiceId && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full h-11"
                      onClick={() => generateInvoicePDF(createdInvoiceId, createdInvoiceNumber || '')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-11"
                      onClick={() => {
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
      <Toaster />
    </div>
  )
} 