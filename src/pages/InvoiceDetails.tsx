import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, UseQueryOptions, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { format } from 'date-fns'
import { ArrowLeft, Printer, Download, Eye, Loader2, Receipt, Check, MoreVertical, Mail } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from "../components/ui/dialog"
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import InvoiceTemplate from '../pdf-templates/InvoiceTemplate'
import { toast } from 'sonner'
import { PaymentDialog } from '../components/payments/PaymentDialog'
import { cn } from '../lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { PrintModal } from '../components/PrintModal'
import type { InvoiceData } from '../types/invoice'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2
  }).format(amount)
}

// Add some print-specific styles
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    #invoice-content, #invoice-content * {
      visibility: visible;
    }
    #invoice-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
  }
`

// Add this component for better loading states
const PDFPreviewModal = ({ isOpen, onClose, invoice }: { 
  isOpen: boolean
  onClose: () => void
  invoice: InvoiceData 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <h2 className="text-lg font-semibold">Invoice Preview</h2>
              <p className="text-sm text-gray-500">#{invoice.invoice_number}</p>
            </div>
            <div className="flex gap-2">
              <PDFDownloadLink
                document={
                  <InvoiceTemplate 
                    invoice={{
                      ...invoice,
                      flight_charges: invoice.flight_charges || null,
                      additional_charges: invoice.additional_charges || null,
                      status: invoice.status as 'pending' | 'paid' | 'overdue'
                    }} 
                  />
                }
                fileName={`invoice-${invoice.invoice_number}.pdf`}
              >
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </PDFDownloadLink>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 bg-gray-100">
            <PDFViewer
              width="100%"
              height="100%"
              className="rounded-b-lg"
              showToolbar={false}
            >
              <InvoiceTemplate 
                invoice={{
                  ...invoice,
                  flight_charges: invoice.flight_charges || null,
                  additional_charges: invoice.additional_charges || null,
                  status: invoice.status
                }} 
              />
            </PDFViewer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// First, add an interface for the Payment type
interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  receipt_number: string;
}

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const navigate = useNavigate()
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select(`
            *,
            user:user_id (
              id,
              name,
              email,
              address,
              city
            ),
            booking:booking_id (
              id,
              user:user_id (
                id,
                name,
                email,
                address,
                city
              ),
              aircraft:aircraft_id (
                registration,
                type
              ),
              flight_type:flight_type_id (
                name
              )
            )
          `)
          .eq('id', id)
          .single()

        if (error) throw error
        if (!data) throw new Error('Invoice not found')
        
        console.log('Invoice data:', data)
        return data as InvoiceData
      } catch (err) {
        console.error('Error fetching invoice:', err)
        toast.error('Failed to load invoice')
        throw err
      }
    },
    retry: 1,
  } as UseQueryOptions<InvoiceData, Error>)

  useEffect(() => {
    if (error) {
      navigate('/invoices', { 
        replace: true,
        state: { error: 'Failed to load invoice' }
      })
    }
  }, [error, navigate])

  const handlePaymentComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['invoice', id] })
  }

  // Then update the payment query to use the Payment type
  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ['invoice-payments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!id,
    // Update these options to use the correct properties
    refetchInterval: 1000, // Refetch every second while component is mounted
    staleTime: 0, // Consider data always stale
    gcTime: 0, // Replace cacheTime with gcTime (garbage collection time)
  })

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[200px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <p className="text-sm text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Invoice</h2>
          <p className="text-red-600">Unable to load invoice details. Please try again later.</p>
          <Button 
            onClick={() => navigate('/invoices')} 
            className="mt-4"
            variant="outline"
          >
            Return to Invoices
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{printStyles}</style>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header Section with improved layout */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <Link 
                to="/invoices" 
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Invoices
              </Link>
              <div className="flex items-center gap-4 mt-2">
                <h1 className="text-3xl font-bold">Invoice {invoice.invoice_number}</h1>
                <Badge 
                  className={cn(
                    "text-base px-4 py-1 capitalize",
                    invoice.status === 'paid' && "bg-green-100 text-green-800 hover:bg-green-100",
                    invoice.status === 'pending' && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                    invoice.status === 'overdue' && "bg-red-100 text-red-800 hover:bg-red-100"
                  )}
                >
                  {invoice.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="default">
                    <MoreVertical className="h-4 w-4" />
                    <span className="ml-2">Options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsPreviewOpen(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="outline" 
                size="default" 
                onClick={() => setIsPrinting(true)}
                disabled={isPrinting}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print PDF
              </Button>

              <Button variant="outline" size="default" onClick={() => {
                toast.info('Send invoice feature coming soon')
              }}>
                <Mail className="h-4 w-4 mr-2" />
                Send Invoice
              </Button>
            </div>
          </div>

          {/* Invoice Meta Information */}
          <div className="grid grid-cols-2 gap-8 mt-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Bill To</h3>
              <div className="text-gray-900">
                <p className="font-medium">{invoice.user?.name || invoice.booking?.user?.name}</p>
                <p>{invoice.user?.email || invoice.booking?.user?.email}</p>
                <p>{invoice.user?.address || invoice.booking?.user?.address}</p>
                <p>{invoice.user?.city || invoice.booking?.user?.city}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Invoice Date</span>
                <span className="font-medium">{format(new Date(invoice.created_at), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Due Date</span>
                <span className="font-medium">{format(new Date(invoice.due_date), 'dd MMM yyyy')}</span>
              </div>
              {invoice.paid_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Paid Date</span>
                  <span className="font-medium text-green-600">
                    {format(new Date(invoice.paid_date), 'dd MMM yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charges Section */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Charges</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Flight Charges */}
                {(invoice.flight_charges || []).map((charge, index) => (
                  <TableRow key={index}>
                    <TableCell>{charge.description}</TableCell>
                    <TableCell>{formatCurrency(charge.rate)}</TableCell>
                    <TableCell>{charge.units}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(charge.amount)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
                
                {/* Additional Charges */}
                {(invoice.additional_charges || []).map((charge, index) => (
                  <TableRow key={charge.id || index}>
                    <TableCell>{charge.description}</TableCell>
                    <TableCell>{formatCurrency(charge.amount)}</TableCell>
                    <TableCell>{charge.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(charge.total)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals with improved styling */}
            <div className="mt-6 border-t pt-6">
              <div className="flex justify-end">
                <div className="w-72 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Flight Charges</span>
                    <span>{formatCurrency(
                      (invoice.flight_charges || []).reduce((sum, charge) => sum + charge.amount, 0)
                    )}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Additional Charges</span>
                    <span>{formatCurrency(
                      (invoice.additional_charges || []).reduce((sum, charge) => sum + charge.total, 0)
                    )}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Total</span>
                    <span>{formatCurrency(invoice.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 pt-2">
                    <span>Total Paid</span>
                    <span className="text-green-600 font-medium">
                      {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
                    </span>
                  </div>
                  <div className="border-t border-dashed pt-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Remaining Balance</span>
                      <span className="text-gray-900">
                        {formatCurrency(invoice.total_amount - payments.reduce((sum, payment) => sum + payment.amount, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Section with improved styling */}
        {payments && payments.length > 0 && (
          <div className="bg-gray-50 rounded-xl border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <div className="space-y-4">
              {(payments as Payment[]).map((payment: Payment) => (
                <div 
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <p className="font-medium text-gray-900">
                        Payment Received - Receipt #{payment.receipt_number}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {format(new Date(payment.payment_date), 'dd MMM yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {payment.payment_method}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Payment Button */}
        {invoice.status !== 'paid' && (
          <div className="flex justify-end">
            <Button 
              onClick={() => setIsPaymentDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-8 py-6 text-lg"
            >
              <Receipt className="h-5 w-5 mr-3" />
              Add Payment
            </Button>
          </div>
        )}

        {/* PDF Preview Modal */}
        <PDFPreviewModal 
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          invoice={{
            ...invoice,
            flight_charges: invoice.flight_charges || null,
            additional_charges: invoice.additional_charges || null,
            status: invoice.status
          }}
        />

        <PaymentDialog
          open={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
          invoiceId={invoice.id}
          userId={invoice.user_id || invoice.booking?.user_id || ''}
          totalAmount={invoice.total_amount}
          onPaymentComplete={handlePaymentComplete}
        />

        {isPrinting && (
          <PrintModal 
            invoice={{
              ...invoice,
              flight_charges: invoice.flight_charges || null,
              additional_charges: invoice.additional_charges || null,
              status: invoice.status
            }}
            onComplete={() => setIsPrinting(false)} 
          />
        )}
      </div>
    </>
  )
} 