import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Check, Edit, ArrowLeft, InfoIcon } from 'lucide-react'
import { cn } from '../lib/utils'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip"

interface SoloSignoutForm {
  id: string
  pilot_name: string
  pilot_address: string
  bfr_expiry: string
  medical_expiry: string
  route: string
  pax: string
  eta: string
  runway_in_use: string
  fuel: string
  oil_qty: string
  safe_endurance: number
  notams: 'checked' | 'unchecked'
  weather: 'checked' | 'unchecked'
  signature: string
  sign_date: string
  authorised_by?: string
  booking_id?: string
  status: 'pending' | 'approved' | 'declined' | 'cancelled'
  created_at: string
  authorised_by_user?: {
    first_name: string
    last_name: string
  }
  booking?: {
    id: string
    start_time: string
    aircraft?: {
      registration: string
    }
  }
  user?: {
    id: string
    first_name: string
    last_name: string
  }
}

export default function FlightAuthorisationDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isApproving, setIsApproving] = useState(false)

  const { data: form, isLoading, error } = useQuery({
    queryKey: ['solo-signout', id],
    queryFn: async () => {
      console.log('Fetching flight auth with ID:', id);

      const { data, error } = await supabase
        .from('solosignout_form')
        .select(`
          *,
          authorised_by_user:users!solosignout_form_authorised_by_fkey (
            first_name,
            last_name
          ),
          booking:bookings!solosignout_form_booking_id_fkey (
            id,
            start_time,
            aircraft:aircraft_id (
              registration
            )
          ),
          user:users!solosignout_form_user_id_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched data:', data);

      if (!data) {
        throw new Error('No data found');
      }

      return data as SoloSignoutForm;
    },
    retry: 1,
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      declined: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    }[status] || 'bg-gray-100 text-gray-800'

    return (
      <Badge className={cn("px-4 py-1.5 text-base font-medium capitalize", styles)}>
        {status}
      </Badge>
    )
  }

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const { error } = await supabase
        .from('solosignout_form')
        .update({ 
          status: 'approved',
          authorised: true
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error approving flight:', error)
        throw error
      }

      queryClient.invalidateQueries({ queryKey: ['solo-signout', id] })
      toast.success('Flight authorisation approved successfully')
      
    } catch (error) {
      console.error('Error approving flight:', error)
      toast.error('Failed to approve flight authorisation')
    } finally {
      setIsApproving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-48 w-full bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-red-600">Flight authorisation not found</h2>
              <Button 
                onClick={() => navigate('/bookings')}
                className="mt-4"
              >
                Return to Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    console.error('Query error:', error);
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-red-600">Error loading flight authorisation</h2>
              <p className="text-sm text-gray-600 mt-2">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
              <Button 
                onClick={() => navigate(-1)}
                className="mt-4"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <Card className="shadow-md">
          <CardHeader className="border-b bg-gray-50/80 pb-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">Solo Flight Authorisation</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <p>Submitted on {format(new Date(form.created_at), 'dd MMM yyyy, HH:mm')}</p>
                  {form.booking && (
                    <>
                      <span className="text-gray-300">•</span>
                      <Link 
                        to={`/bookings/${form.booking.id}`}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        View Booking
                        {form.booking.aircraft?.registration && (
                          <span className="text-gray-500">
                            ({form.booking.aircraft.registration})
                          </span>
                        )}
                      </Link>
                    </>
                  )}
                  {form.user && (
                    <>
                      <span className="text-gray-300">•</span>
                      <Link 
                        to={`/members/${form.user.id}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {form.user.first_name} {form.user.last_name}
                      </Link>
                    </>
                  )}
                </div>
              </div>
              {getStatusBadge(form.status)}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid gap-6">
              {/* Pilot Details Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  Pilot Details
                </div>
                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <div className="flex justify-between items-baseline">
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900 font-medium">{form.pilot_name}</p>
                    </div>
                    <div className="flex justify-between items-baseline mt-3">
                      <label className="text-sm font-medium text-gray-500">BFR Expiry</label>
                      <p className="text-gray-900">{format(new Date(form.bfr_expiry), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline">
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900">{form.pilot_address}</p>
                    </div>
                    <div className="flex justify-between items-baseline mt-3">
                      <label className="text-sm font-medium text-gray-500">Medical Expiry</label>
                      <p className="text-gray-900">{format(new Date(form.medical_expiry), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Flight Details Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                  Flight Details
                </div>
                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <div className="flex justify-between items-baseline">
                      <label className="text-sm font-medium text-gray-500">Route</label>
                      <p className="text-gray-900 font-medium">{form.route}</p>
                    </div>
                    <div className="flex justify-between items-baseline mt-3">
                      <label className="text-sm font-medium text-gray-500">ETA</label>
                      <p className="text-gray-900">{form.eta.split(':').slice(0, 2).join(':')}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline">
                      <label className="text-sm font-medium text-gray-500">Passengers</label>
                      <p className="text-gray-900">{form.pax}</p>
                    </div>
                    <div className="flex justify-between items-baseline mt-3">
                      <label className="text-sm font-medium text-gray-500">Runway</label>
                      <p className="text-gray-900">{form.runway_in_use}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Aircraft Checks Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                  Aircraft Checks
                </div>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">Fuel</label>
                      <p className="text-xl font-medium text-gray-900 mt-1">{form.fuel}L</p>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-500">Oil Quantity</label>
                      <p className="text-xl font-medium text-gray-900 mt-1">{form.oil_qty} qts</p>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <label className="text-sm font-medium text-gray-500">Safe Endurance</label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoIcon className="h-4 w-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Safe endurance is displayed in HH:mm</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-xl font-medium text-gray-900 mt-1">
                        {Math.floor(form.safe_endurance / 60)}:{(form.safe_endurance % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg",
                      form.notams === 'checked' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    )}>
                      <span className="font-medium">NOTAMs</span>
                      <Badge variant="outline" className={cn(
                        "font-medium",
                        form.notams === 'checked' ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'
                      )}>
                        {form.notams === 'checked' ? 'Checked' : 'Not Checked'}
                      </Badge>
                    </div>
                    <div className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg",
                      form.weather === 'checked' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    )}>
                      <span className="font-medium">Weather</span>
                      <Badge variant="outline" className={cn(
                        "font-medium",
                        form.weather === 'checked' ? 'border-green-200 text-green-700' : 'border-red-200 text-red-700'
                      )}>
                        {form.weather === 'checked' ? 'Checked' : 'Not Checked'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </section>

              {/* Authorisation Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  Authorisation
                </div>
                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <div className="flex justify-between items-baseline">
                      <label className="text-sm font-medium text-gray-500">Signature</label>
                      <p className="text-gray-900 font-medium">{form.signature}</p>
                    </div>
                    <div className="flex justify-between items-baseline mt-3">
                      <label className="text-sm font-medium text-gray-500">Sign Date</label>
                      <p className="text-gray-900">{format(new Date(form.sign_date), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                  {form.authorised_by_user && (
                    <div className="flex justify-between items-baseline">
                      <label className="text-sm font-medium text-gray-500">Instructor Assigned</label>
                      <p className="text-gray-900">
                        {form.authorised_by_user.first_name} {form.authorised_by_user.last_name}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4 mt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/flight-authorisation/${form.id}/edit`)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Details
                </Button>
                
                {form.status === 'pending' && (
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    {isApproving ? 'Approving...' : 'Approve Flight'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 