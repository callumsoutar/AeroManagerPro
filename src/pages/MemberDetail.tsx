import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { ProgressTab } from '../components/student/ProgressTab'
import { InstructorCommentsTab } from "../components/member/InstructorCommentsTab"
import { getFullName } from '../lib/utils'
import { EditMemberModal } from "../components/member/EditMemberModal"
import { CheckCircle2, XCircle, Plus } from 'lucide-react'
import { AddMembershipModal } from "../components/member/AddMembershipModal"
import { EditPilotDetailsModal } from "../components/member/EditPilotDetailsModal"
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

interface ErrorResponse {
  message: string;
}

interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

interface Booking {
  id: string;
  created_at: string;
  start_time: string;
  status: string;
  aircraft?: {
    registration: string;
    type: string;
  };
  flight_type?: {
    name: string;
  };
  flight_time?: number;
  instructor?: {
    name: string;
  };
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'flying':
      return 'bg-blue-100 text-blue-800'
    case 'complete':
      return 'bg-green-100 text-green-800'
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const MemberDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { data: user, isLoading } = useUser(id!)
  const navigate = useNavigate()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddMembershipModalOpen, setIsAddMembershipModalOpen] = useState(false)
  const [isEditPilotModalOpen, setIsEditPilotModalOpen] = useState(false)

  console.log('User Data:', user)

  // Query for completed bookings
  const { data: completedBookings, isError: isCompletedError, error: completedError } = useQuery<any, Error>({
    queryKey: ['member-bookings', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          aircraft:aircraft_id (
            registration,
            type
          ),
          flight_type:flight_type_id (
            name
          ),
          instructor:instructor_id (
            name
          )
        `)
        .eq('user_id', id)
        .eq('status', 'complete')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || [] // Ensure we always return an array
    }
  })

  // Add this query alongside your existing completedBookings query
  const { 
    data: activeBookings, 
    isError: isActiveError, 
    error: activeError,
    isLoading: isActiveLoading 
  } = useQuery<any, Error>({
    queryKey: ['member-active-bookings', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          aircraft:aircraft_id (
            registration,
            type
          ),
          flight_type:flight_type_id (
            name
          ),
          instructor:instructor_id (
            name
          )
        `)
        .eq('user_id', id)
        .neq('status', 'complete')
        .order('start_time', { ascending: true })

      if (error) throw error
      return data || [] // Ensure we always return an array
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading member details...</p>
        </div>
      </div>
    )
  }

  if (!user || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Member not found</p>
          <Button 
            onClick={() => navigate('/')} 
            className="mt-4"
            variant="outline"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Initialize arrays with defaults if they're undefined
  const previousMemberships = user.previousMemberships || []

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img 
                src={user.photo_url || '/placeholder-avatar.jpg'} 
                alt={getFullName(user.first_name, user.last_name)}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
              />
              <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs">Update</span>
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {getFullName(user.first_name, user.last_name)}
              </h1>
              <p className="text-gray-500">Member #{user.user_number}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6 sticky top-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                <Badge
                  className={
                    user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }
                >
                  {user.status}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Member Since</h3>
                <p className="text-sm">{format(new Date(user.join_date), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">License Type</h3>
                <p className="text-sm">{user.license_type || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Last Flight</h3>
                <p className="text-sm">
                  {user.last_flight ? format(new Date(user.last_flight), 'dd MMM yyyy') : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <Tabs defaultValue="contact">
                <TabsList className="w-full px-4 flex justify-start space-x-2 border-b">
                  <TabsTrigger value="contact">Contact Details</TabsTrigger>
                  <TabsTrigger value="membership">Membership Details</TabsTrigger>
                  <TabsTrigger value="pilot">Pilot Details</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  <TabsTrigger value="history">Flight History</TabsTrigger>
                  <TabsTrigger value="comments">Instructor Comments</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>

                <div className="p-6">
                  {/* Contact Details Tab */}
                  <TabsContent value="contact">
                    <div className="space-y-6">
                      {/* Personal Information - Full Width */}
                      <div className="bg-white rounded-lg border p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                          <h2 className="text-lg font-semibold">Personal Information</h2>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <label className="text-sm font-medium text-gray-500">First Name</label>
                            <p className="mt-1 font-medium text-gray-900">{user.first_name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Last Name</label>
                            <p className="mt-1 font-medium text-gray-900">{user.last_name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Gender</label>
                            <p className="mt-1 font-medium text-gray-900 capitalize">
                              {user.gender || '-'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Email</label>
                            <p className="mt-1 font-medium text-gray-900">{user.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Phone</label>
                            <p className="mt-1 font-medium text-gray-900">{user.phone || '-'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                            <p className="mt-1 font-medium text-gray-900">
                              {user.birth_date ? format(new Date(user.birth_date), 'dd MMM yyyy') : '-'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Two Column Layout for Address and Emergency Contact */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Address Information */}
                        <div className="bg-white rounded-lg border p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                            <h2 className="text-lg font-semibold">Address Information</h2>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Address</label>
                              <p className="mt-1 font-medium text-gray-900">{user.address || '-'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">City</label>
                              <p className="mt-1 font-medium text-gray-900">{user.city || '-'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="bg-white rounded-lg border p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                            <h2 className="text-lg font-semibold">Emergency Contact</h2>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Contact Name</label>
                              <p className="mt-1 font-medium text-gray-900">
                                {user.emergency_contact_name || '-'}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                              <p className="mt-1 font-medium text-gray-900">
                                {user.emergency_contact_phone || '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <div className="flex justify-end">
                        <Button 
                          className="bg-[#1a1a2e] hover:bg-[#2d2d44] text-white px-8"
                          onClick={() => setIsEditModalOpen(true)}
                        >
                          Edit Contact Details
                        </Button>
                      </div>

                      {/* Edit Modal */}
                      <EditMemberModal
                        open={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        user={user}
                      />
                    </div>
                  </TabsContent>

                  {/* Membership Details Tab */}
                  <TabsContent value="membership">
                    <div className="space-y-6">
                      {/* Current Membership */}
                      <div className="bg-white rounded-lg border p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                            <h2 className="text-lg font-semibold">Current Membership</h2>
                          </div>
                          {user.currentMembership && (
                            <Badge
                              className={
                                user.currentMembership.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {user.currentMembership.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          )}
                        </div>
                        
                        {user.currentMembership ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-500">Type</label>
                                <p className="mt-1 font-medium text-gray-900">
                                  {user.currentMembership.membership_type.name}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Start Date</label>
                                <p className="mt-1 font-medium text-gray-900">
                                  {format(new Date(user.currentMembership.start_date), 'dd MMM yyyy')}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">End Date</label>
                                <p className="mt-1 font-medium text-gray-900">
                                  {format(new Date(user.currentMembership.end_date), 'dd MMM yyyy')}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Payment Status</label>
                                <div className="mt-1 flex items-center gap-2">
                                  {user.currentMembership.payment_status === 'paid' ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span className="font-medium text-gray-900 capitalize">
                                    {user.currentMembership.payment_status}
                                  </span>
                                </div>
                              </div>
                              {user.currentMembership.payment_date && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Payment Date</label>
                                  <p className="mt-1 font-medium text-gray-900">
                                    {format(new Date(user.currentMembership.payment_date), 'dd MMM yyyy')}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No active membership found
                          </div>
                        )}
                      </div>

                      {/* Previous Memberships */}
                      <div className="bg-white rounded-lg border p-6">
                        <h3 className="text-lg font-semibold mb-4">Previous Memberships</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Start Date</TableHead>
                              <TableHead>End Date</TableHead>
                              <TableHead>Payment Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {previousMemberships.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                                  No previous memberships
                                </TableCell>
                              </TableRow>
                            ) : (
                              previousMemberships.map((membership) => (
                                <TableRow key={membership.id}>
                                  <TableCell className="font-medium">
                                    {membership.membership_type.name}
                                  </TableCell>
                                  <TableCell>
                                    {format(new Date(membership.start_date), 'dd MMM yyyy')}
                                  </TableCell>
                                  <TableCell>
                                    {format(new Date(membership.end_date), 'dd MMM yyyy')}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {membership.payment_status === 'paid' ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                      )}
                                      <span className="capitalize">{membership.payment_status}</span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Add Membership Button */}
                      <div className="flex justify-end">
                        <Button 
                          className="bg-[#1a1a2e] hover:bg-[#2d2d44] text-white px-8"
                          onClick={() => setIsAddMembershipModalOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Membership
                        </Button>
                      </div>

                      {/* Add Membership Modal */}
                      <AddMembershipModal
                        open={isAddMembershipModalOpen}
                        onClose={() => setIsAddMembershipModalOpen(false)}
                        userId={id!}
                      />
                    </div>
                  </TabsContent>

                  {/* Pilot Details Tab */}
                  <TabsContent value="pilot">
                    <div className="space-y-6">
                      {/* Top Row: License and Medical Info */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* License Information */}
                        <div className="bg-white rounded-lg border p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                            <h2 className="text-lg font-semibold">License Details</h2>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-medium text-gray-500">License Type</label>
                              <p className="font-medium text-gray-900">{user.license_type || '-'}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-medium text-gray-500">CAA Client #</label>
                              <p className="font-medium text-gray-900">{user.caa_client_number || '-'}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-medium text-gray-500">BFR Expiry</label>
                              <p className="font-medium text-gray-900">
                                {user.bfr_expiry ? format(new Date(user.bfr_expiry), 'dd MMM yyyy') : '-'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Medical Information */}
                        <div className="bg-white rounded-lg border p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                            <h2 className="text-lg font-semibold">Medical Status</h2>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-medium text-gray-500">DL9 Medical</label>
                              <p className="font-medium text-gray-900">
                                {user.dl9_medical_due ? format(new Date(user.dl9_medical_due), 'dd MMM yyyy') : '-'}
                              </p>
                            </div>
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-medium text-gray-500">Class 2 Medical</label>
                              <p className="font-medium text-gray-900">
                                {user.class2_medical_due ? format(new Date(user.class2_medical_due), 'dd MMM yyyy') : '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section: Ratings & Endorsements */}
                      <div className="bg-white rounded-lg border p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                          <h2 className="text-lg font-semibold">Qualifications</h2>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6">
                          {/* Prime Ratings */}
                          <div>
                            <label className="text-sm font-medium text-gray-500 mb-2 block">Prime Ratings</label>
                            <div className="flex flex-wrap gap-1.5">
                              {user.prime_ratings && user.prime_ratings.length > 0 ? (
                                user.prime_ratings.map((rating: string) => (
                                  <Badge 
                                    key={rating}
                                    className="bg-blue-100 text-blue-800 text-sm whitespace-nowrap"
                                  >
                                    {rating}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">No prime ratings</span>
                              )}
                            </div>
                          </div>

                          {/* Type Ratings */}
                          <div>
                            <label className="text-sm font-medium text-gray-500 mb-2 block">Type Ratings</label>
                            <div className="flex flex-wrap gap-1.5">
                              {user.type_ratings && user.type_ratings.length > 0 ? (
                                user.type_ratings.map((rating: string) => (
                                  <Badge 
                                    key={rating}
                                    className="bg-amber-100 text-amber-800 text-sm whitespace-nowrap"
                                  >
                                    {rating}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">No type ratings</span>
                              )}
                            </div>
                          </div>

                          {/* Endorsements */}
                          <div>
                            <label className="text-sm font-medium text-gray-500 mb-2 block">Endorsements</label>
                            <div className="flex flex-wrap gap-1.5">
                              {user.endorsements && user.endorsements.length > 0 ? (
                                user.endorsements.map((endorsement: string) => (
                                  <Badge 
                                    key={endorsement}
                                    className="bg-green-100 text-green-800 text-sm whitespace-nowrap"
                                  >
                                    {endorsement}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">No endorsements</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <div className="flex justify-end">
                        <Button 
                          className="bg-[#1a1a2e] hover:bg-[#2d2d44] text-white px-8"
                          onClick={() => setIsEditPilotModalOpen(true)}
                        >
                          Edit Pilot Details
                        </Button>
                      </div>

                      {/* Edit Modal */}
                      <EditPilotDetailsModal
                        open={isEditPilotModalOpen}
                        onClose={() => setIsEditPilotModalOpen(false)}
                        user={user}
                      />
                    </div>
                  </TabsContent>

                  {/* Bookings Tab */}
                  <TabsContent value="bookings">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold mb-4">Current & Upcoming Bookings</h2>
                        {isActiveError ? (
                          <div className="text-center text-red-600 p-4">
                            <p>Error loading active bookings: {activeError?.message}</p>
                            <Button 
                              onClick={() => window.location.reload()} 
                              className="mt-2"
                              variant="outline"
                            >
                              Retry
                            </Button>
                          </div>
                        ) : isActiveLoading ? (
                          <div className="text-center p-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Aircraft</TableHead>
                                <TableHead>Flight Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Instructor</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {activeBookings?.map((booking: Booking) => (
                                <TableRow key={booking.id}>
                                  <TableCell>{new Date(booking.start_time).toLocaleDateString()}</TableCell>
                                  <TableCell>{booking.aircraft?.registration}</TableCell>
                                  <TableCell>{booking.flight_type?.name}</TableCell>
                                  <TableCell>
                                    <Badge className={getStatusColor(booking.status)}>
                                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{booking.instructor?.name || '-'}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      onClick={() => navigate(`/bookings/${booking.id}`)}
                                    >
                                      View Details
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {(!activeBookings || activeBookings.length === 0) && (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center text-gray-500">
                                    No active bookings found
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Other tabs can be implemented similarly */}
                  <TabsContent value="history">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-lg font-semibold mb-4">Flight History</h2>
                        {isCompletedError ? (
                          <div className="text-center text-red-600 p-4">
                            <p>Error loading flight history: {completedError?.message}</p>
                            <Button 
                              onClick={() => window.location.reload()} 
                              className="mt-2"
                              variant="outline"
                            >
                              Retry
                            </Button>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Aircraft</TableHead>
                                <TableHead>Flight Type</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Instructor</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {completedBookings?.map((booking: Booking) => (
                                <TableRow key={booking.id}>
                                  <TableCell>{new Date(booking.created_at).toLocaleDateString()}</TableCell>
                                  <TableCell>{booking.aircraft?.registration}</TableCell>
                                  <TableCell>{booking.flight_type?.name}</TableCell>
                                  <TableCell>{booking.flight_time?.toFixed(1)} hrs</TableCell>
                                  <TableCell>{booking.instructor?.name || '-'}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      onClick={() => navigate(`/bookings/${booking.id}`)}
                                    >
                                      View Details
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="comments">
                    <InstructorCommentsTab userId={id!} />
                  </TabsContent>

                  <TabsContent value="progress">
                    <ProgressTab userId={id!} />
                  </TabsContent>

                  <TabsContent value="permissions">
                    <div className="text-gray-500">Permissions will be displayed here</div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberDetail 