import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAircraftDetail } from '../hooks/useAircraft'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { format } from 'date-fns'
import { Button } from "../components/ui/button"
import { DefectDetailModal } from '../components/aircraft/DefectDetailModal'

const AircraftDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useAircraftDetail(id!)
  const navigate = useNavigate()
  const [selectedDefect, setSelectedDefect] = useState<any>(null)

  if (isLoading) {
    return <div className="p-6">Loading aircraft details...</div>
  }

  if (!data) {
    return <div className="p-6">Aircraft not found</div>
  }

  const { aircraft, equipment = [], defects = [], rates = [], flightHistory = [] } = data

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
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-start gap-10">
          {/* Aircraft Image - Made larger and more rectangular */}
          <div className="w-[400px] h-[260px] rounded-lg overflow-hidden border bg-gray-100 shadow-sm">
            {aircraft.photo_url ? (
              <img
                src={aircraft.photo_url}
                alt={`${aircraft.registration} aircraft`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Photo Available
              </div>
            )}
          </div>

          {/* Aircraft Info - Enhanced styling */}
          <div className="py-2">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{aircraft.registration}</h1>
            <p className="text-xl text-gray-600 mb-6">{aircraft.type} - {aircraft.model}</p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Year</p>
                  <p className="text-lg font-medium">{aircraft.year}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Engine Hours</p>
                  <p className="text-lg font-medium">{aircraft.engine_hours}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Maintenance</p>
                  <p className="text-lg font-medium">
                    {format(new Date(aircraft.last_maintenance), 'dd MMM yyyy')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Next Service Due</p>
                  <p className="text-lg font-medium">
                    {format(new Date(aircraft.next_service_due), 'dd MMM yyyy')}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Status</p>
                <Badge 
                  className={`text-sm px-3 py-1 ${
                    aircraft.status === 'Active' ? 'bg-green-100 text-green-800' :
                    aircraft.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {aircraft.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Link to="/aircraft" className="text-sm text-gray-600 hover:text-blue-600">
          ← Back to Aircraft
        </Link>
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
                {equipment.map((item) => (
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
                ))}
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
                    defects.map((defect) => (
                      <TableRow 
                        key={defect.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedDefect(defect)}
                      >
                        <TableCell className="font-medium">{defect.name}</TableCell>
                        <TableCell>{defect.description}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              defect.status === 'Open' ? 'bg-red-100 text-red-800' :
                              defect.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }
                          >
                            {defect.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{defect.reported_by_user?.name || 'Unknown'}</TableCell>
                        <TableCell>{format(new Date(defect.reported_date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>
                          {Array.isArray(defect.comments) && defect.comments.length > 0 ? (
                            <div className="max-h-24 overflow-y-auto space-y-1">
                              {(defect.comments as any[]).map((comment, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">{comment.user}:</span>{' '}
                                  {comment.text}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">No comments</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
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
                {rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">{rate.flight_type?.name}</TableCell>
                    <TableCell>${rate.rate.toFixed(2)}/hr</TableCell>
                  </TableRow>
                ))}
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
                  {flightHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                        No flight history available
                      </TableCell>
                    </TableRow>
                  ) : (
                    flightHistory.map((flight) => (
                      <TableRow 
                        key={flight.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => navigate(`/bookings/${flight.id}`)}
                      >
                        <TableCell>
                          {format(new Date(flight.start_time), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(flight.start_time), 'HH:mm')} - {format(new Date(flight.end_time), 'HH:mm')}
                        </TableCell>
                        <TableCell>{flight.user?.name || '-'}</TableCell>
                        <TableCell>{flight.instructor?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getBookingTypeStyle(flight.flight_type?.name || 'Unknown')}>
                            {flight.flight_type?.name || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>{flight.flight_time?.toFixed(1) || '-'} hrs</TableCell>
                        <TableCell>
                          {flight.tacho_start && flight.tacho_end ? (
                            <span>{flight.tacho_start} - {flight.tacho_end}</span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {flight.hobbs_start && flight.hobbs_end ? (
                            <span>{flight.hobbs_start} - {flight.hobbs_end}</span>
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
        <DefectDetailModal
          open={!!selectedDefect}
          onClose={() => setSelectedDefect(null)}
          defect={selectedDefect}
        />
      )}
    </div>
  )
}

export default AircraftDetail 