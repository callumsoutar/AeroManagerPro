import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAircraft, type Defect, type Equipment, type Rate, type Booking } from '../hooks/useAircraft'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { format, isValid, parseISO } from 'date-fns'
import { Button } from "../components/ui/button"
import { DefectModal } from '../components/modals/DefectModal'
import { cn } from '../lib/utils'

function getUserFullName(user: { first_name: string; last_name: string }) {
  return `${user.first_name} ${user.last_name}`
}

function formatDateSafely(dateString: string | null, formatString: string = 'dd MMM yyyy'): string {
  if (!dateString) return 'Not set'
  
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) return 'Invalid date'
    return format(date, formatString)
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid date'
  }
}

// Add a helper function to parse comments
function parseDefectComments(commentsJson: any): Array<{
  text: string
  user: string
  timestamp: string
}> {
  if (!commentsJson) return []
  
  try {
    // If it's a string, parse it
    const comments = typeof commentsJson === 'string' 
      ? JSON.parse(commentsJson) 
      : commentsJson

    // Ensure it's an array
    return Array.isArray(comments) ? comments : []
  } catch (error) {
    console.error('Error parsing comments:', error)
    return []
  }
}

const AircraftDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: aircraft, isLoading, error, isError } = useAircraft(id!)
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null)

  // Debug logs
  console.log('Aircraft detail render:', {
    id,
    isLoading,
    error,
    hasData: !!aircraft
  })

  // Ensure we have default values for all arrays
  const {
    equipment = [],
    defects = [],
    rates = [],
    bookings = []
  } = aircraft || {}

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-48 w-full bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Aircraft</h2>
          <p className="text-red-600">{error instanceof Error ? error.message : 'Failed to load aircraft details'}</p>
          <Button 
            onClick={() => navigate('/aircraft')}
            className="mt-4"
          >
            Return to Aircraft List
          </Button>
        </div>
      </div>
    )
  }

  if (!aircraft) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Aircraft Not Found</h2>
          <p className="text-yellow-600">The requested aircraft could not be found.</p>
          <Button 
            onClick={() => navigate('/aircraft')}
            className="mt-4"
          >
            Return to Aircraft List
          </Button>
        </div>
      </div>
    )
  }

  const getBookingTypeStyle = (type: string | undefined) => {
    if (!type) return 'bg-gray-100 text-gray-800'
    
    switch (type) {
      case 'Training':
        return 'bg-blue-100 text-blue-800'
      case 'Maintenance':
        return 'bg-green-100 text-green-800'
      case 'Charter':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {aircraft.registration}
          </h1>
          <p className="text-gray-500">{aircraft.type}</p>
        </div>
      </div>

      {/* Aircraft Image */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex gap-8">
          {/* Left side - Image */}
          <div className="aspect-video w-[40%] rounded-lg overflow-hidden bg-gray-100">
            {aircraft.photo_url ? (
              <img
                src={aircraft.photo_url}
                alt={`${aircraft.registration}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No photo available
              </div>
            )}
          </div>

          {/* Right side - Details */}
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {aircraft.registration}
                </h1>
                <p className="text-xl text-gray-600">{aircraft.type}</p>
              </div>
              <Badge 
                className={cn(
                  "text-sm px-3 py-1",
                  aircraft.status === 'Active' ? 'bg-green-100 text-green-800' :
                  aircraft.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                )}
              >
                {aircraft.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-sm text-gray-500">Year</p>
                <p className="text-lg font-medium">{aircraft.year || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Service Due</p>
                <p className="text-lg font-medium">
                  {formatDateSafely(aircraft.next_service_due)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border">
        {/* Tabs Section */}
        <Tabs defaultValue="equipment" className="w-full">
          <TabsList className="w-full justify-start space-x-2 border-b">
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="defects">Defects</TabsTrigger>
            <TabsTrigger value="rates">Charge Rates</TabsTrigger>
            <TabsTrigger value="history">Flight History</TabsTrigger>
            <TabsTrigger value="techlog">Tech Log</TabsTrigger>
          </TabsList>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Last Completed</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>Hours Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                      No equipment records found
                    </TableCell>
                  </TableRow>
                ) : (
                  equipment.map((item: Equipment) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.type}</TableCell>
                      <TableCell>{format(new Date(item.last_completed), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{format(new Date(item.next_due), 'dd MMM yyyy')}</TableCell>
                      <TableCell>
                        <Badge className={
                          item.days_remaining <= 30 ? 'bg-red-100 text-red-800' :
                          item.days_remaining <= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {item.days_remaining} days
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          item.hours_remaining <= 20 ? 'bg-red-100 text-red-800' :
                          item.hours_remaining <= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {item.hours_remaining} hrs
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Defects Tab */}
          <TabsContent value="defects" className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Defects</h3>
              <Button variant="outline" size="sm">
                Report New Defect
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Reported Date</TableHead>
                    <TableHead>Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                        No defects reported
                      </TableCell>
                    </TableRow>
                  ) : (
                    defects.map((defect: Defect) => {
                      const parsedComments = parseDefectComments(defect.comments)
                      console.log('Parsed comments for defect:', defect.id, parsedComments)

                      return (
                        <TableRow 
                          key={defect.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedDefect(defect)}
                        >
                          <TableCell className="font-medium">{defect.name}</TableCell>
                          <TableCell>{defect.description}</TableCell>
                          <TableCell>
                            <td className="whitespace-nowrap px-3 py-2">
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-red-800 bg-red-100">
                                {defect.status}
                              </span>
                            </td>
                          </TableCell>
                          <TableCell>
                            {defect.reported_by_user ? getUserFullName(defect.reported_by_user) : '-'}
                          </TableCell>
                          <TableCell>{formatDateSafely(defect.reported_date)}</TableCell>
                          <TableCell>
                            {parsedComments.length > 0 ? (
                              <div className="max-h-24 overflow-y-auto space-y-1">
                                {parsedComments.map((comment, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="font-medium">{comment.user}:</span>{' '}
                                    <span className="text-gray-600">{comment.text}</span>
                                    <span className="text-xs text-gray-400 ml-2">
                                      {formatDateSafely(comment.timestamp, 'dd MMM HH:mm')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">No comments</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Charge Rates Tab */}
          <TabsContent value="rates" className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-gray-500 py-4">
                      No rates configured
                    </TableCell>
                  </TableRow>
                ) : (
                  rates.map((rate: Rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">{rate.flight_type?.name}</TableCell>
                      <TableCell>${rate.rate.toFixed(2)}/hr</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Flight History Tab */}
          <TabsContent value="history" className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Flight History</h3>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Tacho</TableHead>
                    <TableHead>Hobbs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                        No flight history available
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking: Booking) => (
                      <TableRow 
                        key={booking.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                      >
                        <TableCell>
                          {formatDateSafely(booking.start_time, 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          {`${formatDateSafely(booking.start_time, 'HH:mm')} - ${formatDateSafely(booking.end_time, 'HH:mm')}`}
                        </TableCell>
                        <TableCell>
                          {booking.user ? getUserFullName(booking.user) : '-'}
                        </TableCell>
                        <TableCell>{booking.instructor?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getBookingTypeStyle(booking.flight_type?.name || 'Unknown')}>
                            {booking.flight_type?.name || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>{booking.flight_time?.toFixed(1) || '-'} hrs</TableCell>
                        <TableCell>
                          {booking.tacho_start && booking.tacho_end ? (
                            <span>{booking.tacho_start} - {booking.tacho_end}</span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {booking.hobbs_start && booking.hobbs_end ? (
                            <span>{booking.hobbs_start} - {booking.hobbs_end}</span>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Continue with other tabs... */}
        </Tabs>
      </div>

      {selectedDefect && (
        <DefectModal
          defect={selectedDefect}
          isOpen={!!selectedDefect}
          onClose={() => setSelectedDefect(null)}
        />
      )}
    </div>
  )
}

export default AircraftDetail 