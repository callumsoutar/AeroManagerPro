import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
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
import { ArrowLeft, Printer, Download, Eye, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from "../components/ui/dialog"
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import InvoiceTemplate from '@/components/pdf/InvoiceTemplate'
import { toast } from 'sonner'

// Rename interface to avoid naming conflict
interface InvoiceData {
  id: string
  invoice_number: string
  total_amount: number
  flight_charge_total: number
  additional_charges_total: number
  status: string
  due_date: string
  paid_date: string | null
  created_at: string
  flight_charges: Array<{
    description: string
    rate: number
    units: number
    amount: number
  }> | null
  additional_charges: Array<{
    id: string
    type: string
    total: number
    amount: number
    quantity: number
    description: string
  }> | null
  user?: {
    name: string
    email: string
    address: string
    city: string
  }
  booking?: {
    id: string
    aircraft?: {
      registration: string
      type: string
    }
    user?: {
      name: string
      email: string
      address: string
      city: string
    }
    flight_type?: {
      name: string
    }
  }
}

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
                document={<InvoiceTemplate invoice={invoice} />}
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
              <InvoiceTemplate invoice={invoice} />
            </PDFViewer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const navigate = useNavigate()

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select(`
            *,
            user:user_id (
              name,
              email,
              address,
              city
            ),
            booking:booking_id (
              id,
              aircraft:aircraft_id (
                registration,
                type
              ),
              user:user_id (
                name,
                email,
                address,
                city
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
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8 print:hidden">
          <div>
            <Link 
              to="/invoices" 
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Invoices
            </Link>
            <h1 className="text-3xl font-bold mt-2">Invoice {invoice.invoice_number}</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview PDF
            </Button>
            <PDFDownloadLink
              document={<InvoiceTemplate invoice={invoice} />}
              fileName={`invoice-${invoice.invoice_number}.pdf`}
            >
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </PDFDownloadLink>
          </div>
        </div>

        <div id="invoice-content">
          {/* Move all your invoice content here */}
          {/* Invoice Details Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <h3 className="font-semibold mb-2">Bill To</h3>
                {invoice.booking?.user ? (
                  <>
                    <p className="text-gray-900">{invoice.booking.user.name}</p>
                    <p className="text-gray-600">{invoice.booking.user.email}</p>
                    <p className="text-gray-600">{invoice.booking.user.address}</p>
                    <p className="text-gray-600">{invoice.booking.user.city}</p>
                  </>
                ) : invoice.user ? (
                  <>
                    <p className="text-gray-900">{invoice.user.name}</p>
                    <p className="text-gray-600">{invoice.user.email}</p>
                    <p className="text-gray-600">{invoice.user.address}</p>
                    <p className="text-gray-600">{invoice.user.city}</p>
                  </>
                ) : (
                  <div className="text-gray-600">
                    User information not available
                  </div>
                )}
              </div>
              
              {/* Right Column */}
              <div className="text-right">
                <div className="mb-4">
                  <p className="text-gray-600">Invoice Date</p>
                  <p className="font-medium">
                    {format(new Date(invoice.created_at), 'dd MMM yyyy')}
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-gray-600">Due Date</p>
                  <p className="font-medium">
                    {format(new Date(invoice.due_date), 'dd MMM yyyy')}
                  </p>
                </div>
                <div>
                  <Badge className={`${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Flight Details - Only show if booking exists */}
          {invoice.booking && (
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="font-semibold mb-4">Flight Details</h3>
              <div className="grid grid-cols-3 gap-4">
                {invoice.booking.aircraft && (
                  <>
                    <div>
                      <p className="text-gray-600">Aircraft</p>
                      <p className="font-medium">{invoice.booking.aircraft.registration}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-medium">{invoice.booking.aircraft.type}</p>
                    </div>
                  </>
                )}
                {invoice.booking.flight_type && (
                  <div>
                    <p className="text-gray-600">Flight Type</p>
                    <p className="font-medium">{invoice.booking.flight_type.name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Charges Table */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h3 className="font-semibold mb-4">Charges</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
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
                  </TableRow>
                ))}
                
                {/* Additional Charges */}
                {(invoice.additional_charges || []).map((charge, index) => (
                  <TableRow key={charge.id}>
                    <TableCell>{charge.description}</TableCell>
                    <TableCell>{formatCurrency(charge.amount / charge.quantity)}</TableCell>
                    <TableCell>{charge.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(charge.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Flight Charges</span>
                <span>{formatCurrency(
                  (invoice.flight_charges || []).reduce((sum, charge) => sum + charge.amount, 0)
                )}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Additional Charges</span>
                <span>{formatCurrency(
                  (invoice.additional_charges || []).reduce((sum, charge) => sum + charge.total, 0)
                )}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Preview Modal */}
        <PDFPreviewModal 
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          invoice={invoice}
        />
      </div>
    </>
  )
} 