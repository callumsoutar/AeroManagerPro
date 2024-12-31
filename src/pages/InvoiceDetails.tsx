import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
import { ArrowLeft, Printer, Download, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from "../components/ui/dialog"

// Import html2pdf with require to avoid TypeScript issues
const html2pdf = require('html2pdf.js')

interface FlightCharge {
  description: string
  rate: number
  units: number
  amount: number
}

interface AdditionalCharge {
  id: string
  type: string
  total: number
  amount: number
  quantity: number
  description: string
}

interface InvoiceDetails {
  id: string
  invoice_number: string
  total_amount: number
  flight_charge_total: number
  additional_charges_total: number
  status: string
  due_date: string
  paid_date: string | null
  created_at: string
  flight_charges: FlightCharge[]
  additional_charges: AdditionalCharge[]
  booking: {
    id: string
    aircraft: {
      registration: string
      type: string
    }
    user: {
      name: string
      email: string
      address: string
      city: string
    }
    flight_type: {
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

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>()
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
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
      return data as InvoiceDetails
    }
  })

  if (isLoading) {
    return <div className="p-6">Loading invoice details...</div>
  }

  if (!invoice) {
    return <div className="p-6">Invoice not found</div>
  }

  const generatePDF = (download = false) => {
    const element = document.getElementById('invoice-content')
    const opt = {
      margin: 1,
      filename: `invoice-${invoice.invoice_number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }
    
    if (download) {
      html2pdf().set(opt).from(element).save()
    } else {
      html2pdf().set(opt).from(element).outputPdf('blob').then((pdf: Blob) => {
        const url = URL.createObjectURL(pdf)
        setPdfPreviewUrl(url)
        setIsPreviewOpen(true)
      })
    }
  }

  // Cleanup URL when modal closes
  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl)
      setPdfPreviewUrl(null)
    }
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
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => generatePDF(false)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={() => generatePDF(true)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
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
                <p className="text-gray-900">{invoice.booking.user.name}</p>
                <p className="text-gray-600">{invoice.booking.user.email}</p>
                <p className="text-gray-600">{invoice.booking.user.address}</p>
                <p className="text-gray-600">{invoice.booking.user.city}</p>
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

          {/* Flight Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h3 className="font-semibold mb-4">Flight Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600">Aircraft</p>
                <p className="font-medium">{invoice.booking.aircraft.registration}</p>
              </div>
              <div>
                <p className="text-gray-600">Type</p>
                <p className="font-medium">{invoice.booking.aircraft.type}</p>
              </div>
              <div>
                <p className="text-gray-600">Flight Type</p>
                <p className="font-medium">{invoice.booking.flight_type.name}</p>
              </div>
            </div>
          </div>

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
                {invoice.flight_charges.map((charge, index) => (
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
                {invoice.additional_charges.map((charge, index) => (
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
                  invoice.flight_charges.reduce((sum, charge) => sum + charge.amount, 0)
                )}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Additional Charges</span>
                <span>{formatCurrency(
                  invoice.additional_charges.reduce((sum, charge) => sum + charge.total, 0)
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
        <Dialog open={isPreviewOpen} onOpenChange={handleClosePreview}>
          <DialogContent className="max-w-4xl h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Invoice Preview
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => generatePDF(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={handleClosePreview}>
                  Close
                </Button>
              </div>
            </div>
            {pdfPreviewUrl && (
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-full rounded-md"
                title="PDF Preview"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
} 