import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { format } from 'date-fns'
import { useBookings } from '../hooks/useBookings'
import { getBookingTypeStyle } from '../lib/utils'

const Bookings = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const { data: bookings, isLoading } = useBookings()

  const filteredBookings = bookings?.filter(booking =>
    booking.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.aircraft?.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.flight_type?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? []

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

  if (isLoading) {
    return <div className="p-6">Loading bookings...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500">View and manage all bookings</p>
        </div>
        <Input
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Aircraft</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow 
                key={booking.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/bookings/${booking.id}`)}
              >
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {format(new Date(booking.start_time), 'dd MMM yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(booking.start_time), 'HH:mm')} - {format(new Date(booking.end_time), 'HH:mm')}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{booking.aircraft?.registration}</TableCell>
                <TableCell>{booking.user?.name}</TableCell>
                <TableCell>{booking.instructor?.name || '-'}</TableCell>
                <TableCell>
                  <Badge className={getBookingTypeStyle(booking.flight_type?.name)}>
                    {booking.flight_type?.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Bookings 