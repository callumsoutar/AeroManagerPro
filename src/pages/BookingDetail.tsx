import { useState, lazy, Suspense } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { format } from 'date-fns'
import { FileEdit, CheckCircle2, FileText } from 'lucide-react'
import { useBooking } from '../hooks/useBooking'
import { getFullName } from '../lib/utils'
import { EditBookingModal } from "../components/modals/EditBookingModal"
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "../components/ui/table"
import { BlobProvider } from "@react-pdf/renderer"
import type { ReactElement } from 'react'
import { toast } from 'sonner'

const SignOutSheet = lazy(() => import('../components/pdf/SignOutSheet'))

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { data: booking, isLoading } = useBooking(id!)
  const navigate = useNavigate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: invoices } = useQuery({
    queryKey: ['invoices', booking?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('booking_id', booking?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      return data?.map(invoice => ({
        ...invoice,
        total_amount: Number(invoice.total_amount) || 0,
        flight_charge_total: Number(invoice.flight_charge_total) || 0,
        additional_charges_total: Number(invoice.additional_charges_total) || 0
      }))
    },
    enabled: !!booking?.id
  })

  const handleConfirmBooking = async () => {
    if (!booking) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['booking', id] })
      toast.success('Booking confirmed successfully')
      
      // Add a slight delay before refreshing to ensure the toast is visible
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error confirming booking:', error)
      toast.error('Failed to confirm booking')
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading booking details...</div>
  }

  if (!booking) {
    return <div className="p-6">Booking not found</div>
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-'
    return format(new Date(dateString), 'EEE, MMM d, yyyy h:mm a')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'flying':
        return 'bg-blue-100 text-blue-800'
      case 'complete':
        return 'bg-green-100 text-green-800'
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const PrintCheckoutSheet = (): ReactElement => (
    <BlobProvider document={
      <Suspense fallback={<div>Loading PDF generator...</div>}>
        <SignOutSheet booking={booking} />
      </Suspense>
    }>
      {({ loading, url }) => (
        <Button 
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
          type="button"
          onClick={() => {
            if (url) {
              window.open(url);
            }
          }}
        >
          <FileText className="h-4 w-4" />
          {loading ? "Preparing PDF..." : "Print Checkout Sheet"}
        </Button>
      )}
    </BlobProvider>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <Badge className={`text-base px-3 py-1 ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>
          <p className="text-gray-500">
            {booking.aircraft?.registration} • {format(new Date(booking.start_time), 'dd MMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="gap-2"
          >
            <FileEdit className="h-4 w-4" />
            Edit Booking
          </Button>
          <Link 
            to="/"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border">
        {/* Top Section with Key Details */}
        <div className="p-6 border-b bg-gray-50/50">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Flight Details Only */}
            <div className="space-y-6">
              {/* Flight Details Section */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">Flight Details</h3>
                </div>
                <div className="space-y-4">
                  {/* Aircraft Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Aircraft</label>
                      <p className="mt-1 text-gray-900">{booking.aircraft?.registration}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <p className="mt-1 text-gray-900">{booking.aircraft?.type}</p>
                    </div>
                  </div>

                  {/* Flight Type and Lesson */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Flight Type</label>
                      <p className="mt-1 text-gray-900">{booking.flight_type?.name || '-'}</p>
                    </div>
                    {booking.lesson && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Lesson</label>
                        <p className="mt-1 text-gray-900">{booking.lesson.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Description and Route */}
                  <div className="grid grid-cols-2 gap-4">
                    {booking.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Description</label>
                        <p className="mt-1 text-gray-900">{booking.description}</p>
                      </div>
                    )}
                    {booking.route && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Route</label>
                        <p className="mt-1 text-gray-900">{booking.route}</p>
                      </div>
                    )}
                  </div>

                  {/* Flight Status - Separate container */}
                  {(booking.checked_out_time || booking.eta) && (
                    <div className="mt-4 pt-4 border-t border-dashed">
                      <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-3 rounded-lg">
                        {booking.checked_out_time && (
                          <div>
                            <label className="text-sm font-medium text-blue-700">Checked Out</label>
                            <p className="mt-1 text-blue-900">{formatDateTime(booking.checked_out_time)}</p>
                          </div>
                        )}
                        {booking.eta && (
                          <div>
                            <label className="text-sm font-medium text-blue-700">ETA</label>
                            <p className="mt-1 text-blue-900">{formatDateTime(booking.eta)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(booking.status === 'flying' && booking.checked_out_time) && (
                    <div className="border-t pt-4 mt-4 space-y-2">
                      <PrintCheckoutSheet />
                      <Button 
                        onClick={() => navigate(`/bookings/${booking.id}/flight-details`)}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Complete Flight Details
                      </Button>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <div className="border-t pt-4 mt-4">
                      <Button 
                        onClick={() => navigate(`/bookings/${booking.id}/checkout`)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Check Out Flight
                      </Button>
                    </div>
                  )}

                  {booking.status === 'unconfirmed' && (
                    <div className="border-t pt-4 mt-4">
                      <Button 
                        onClick={handleConfirmBooking}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Confirm Booking
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Flight Times and People */}
            <div className="space-y-6">
              {/* Flight Times Section */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">Flight Times</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-green-50/50 p-3 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Time</label>
                    <p className="mt-1 text-gray-900">{formatDateTime(booking.start_time)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">End Time</label>
                    <p className="mt-1 text-gray-900">{formatDateTime(booking.end_time)}</p>
                  </div>
                </div>
              </div>

              {/* People Section */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">People</h3>
                </div>
                <div className="space-y-3 bg-purple-50/50 p-3 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Member</label>
                    <p className="mt-1 text-gray-900">
                      {booking.user ? getFullName(booking.user.first_name, booking.user.last_name) : '-'}
                    </p>
                  </div>
                  {booking.instructor && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Instructor</label>
                      <p className="mt-1 text-gray-900">{booking.instructor.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section - with improved styling */}
        <div className="p-6 bg-white">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="details">Flight Details</TabsTrigger>
              <TabsTrigger value="charges">Charges</TabsTrigger>
              <TabsTrigger value="instructor-comments">Instructor Comments</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="p-4">
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Flight Details</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Flight Time */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Flight Duration
                      </label>
                      <p className="text-2xl font-semibold text-green-600">
                        {booking?.flight_time ? (
                          `${booking.flight_time.toFixed(1)} hrs`
                        ) : (
                          <span className="text-gray-500 text-base font-normal italic">
                            Not yet completed
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Route */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Route
                      </label>
                      <p className="text-gray-900">
                        {booking?.route || (
                          <span className="text-gray-500 italic">
                            No route specified
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Description - Full Width */}
                    <div className="col-span-2 bg-gray-50 rounded-lg p-4">
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Flight Description
                      </label>
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {booking?.description || (
                          <span className="text-gray-500 italic">
                            No description provided
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="charges">
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Invoice Details</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {/* Add create invoice logic */}}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  </div>

                  {isLoading ? (
                    <div className="text-center py-4">Loading invoice details...</div>
                  ) : invoices && invoices.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Paid Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              {invoice.invoice_number}
                            </TableCell>
                            <TableCell>
                              {format(new Date(invoice.created_at), 'dd MMM yyyy')}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(invoice.total_amount)}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(invoice.status)}>
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {invoice.due_date ? format(new Date(invoice.due_date), 'dd MMM yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                              {invoice.paid_date 
                                ? format(new Date(invoice.paid_date), 'dd MMM yyyy')
                                : '-'
                              }
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost"
                                onClick={() => navigate(`/invoices/${invoice.id}`)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      {invoices.length > 1 && (
                        <tfoot>
                          <TableRow>
                            <TableCell colSpan={2} className="font-medium">
                              Total
                            </TableCell>
                            <TableCell className="font-bold">
                              {formatCurrency(
                                invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount || 0), 0)
                              )}
                            </TableCell>
                            <TableCell colSpan={4}></TableCell>
                          </TableRow>
                        </tfoot>
                      )}
                    </Table>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No invoices found for this booking
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="instructor-comments">
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Instructor Comments</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {booking?.instructor && (
                      <p className="text-gray-900 font-semibold mb-2">
                        {booking.instructor.name}
                      </p>
                    )}
                    {booking?.instructor_comment ? (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {booking.instructor_comment}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">No instructor comments available</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="history" className="p-4">
              <div className="text-gray-500">Booking history will be displayed here</div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add the modal */}
      {booking && (
        <EditBookingModal
          booking={booking}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  )
}

export default BookingDetail 